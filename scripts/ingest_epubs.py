#!/usr/bin/env python3
"""
EPUB to Convex RAG ingestion script (memory-efficient).

Uses zipfile + BeautifulSoup to stream one chapter at a time.
Does NOT load entire EPUBs into memory.

Usage:
    pip install beautifulsoup4 requests lxml
    python scripts/ingest_epubs.py

Skip a problem book — use the .epub filename (or stem), NOT the title inside the HTML:
    python scripts/ingest_epubs.py --skip-book "A Feast for Crows.epub" --mark-skip-only
    python scripts/ingest_epubs.py

Substring works if unique, e.g. --skip-book "Feast"

Environment variables:
    CONVEX_URL       - Your Convex deployment URL
    CONVEX_ADMIN_KEY - Your Convex deploy key
"""

import gc
import hashlib
import json
import os
import re
import sys
import unicodedata
import argparse
import time
import warnings
import zipfile
from pathlib import Path
from urllib.parse import unquote
from xml.etree import ElementTree as ET

try:
    from bs4 import BeautifulSoup
    from lxml import etree
    import requests
except ImportError:
    print("Missing dependencies. Install with:")
    print("  pip install beautifulsoup4 requests lxml")
    sys.exit(1)


def make_safe_xml_parser() -> etree.XMLParser:
    """
    EPUB XHTML often declares a remote DTD; default libxml2 may try to fetch it
    and hang the script. Disable network + entity expansion.
    """
    return etree.XMLParser(
        resolve_entities=False,
        no_network=True,
        huge_tree=True,
        recover=True,
    )

try:
    from bs4 import XMLParsedAsHTMLWarning
except ImportError:
    XMLParsedAsHTMLWarning = type("XMLParsedAsHTMLWarning", (Warning,), {})


BOOKS_DIR = Path(__file__).parent.parent / "public" / "books"
CHUNK_SIZE = 3000
CHUNK_OVERLAP = 400
BATCH_SIZE = 5
PROGRESS_FILE = Path(__file__).parent / ".ingested_books.json"

# EPUB spine items are XHTML (XML). Suppress noise if anything still parses as HTML.
warnings.filterwarnings("ignore", category=XMLParsedAsHTMLWarning)


def tag_local_name(tag) -> str:
    raw = getattr(tag, "name", None) or ""
    if isinstance(raw, str) and "}" in raw:
        return raw.split("}", 1)[-1].lower()
    return str(raw).lower()


def make_epub_soup(markup: bytes) -> BeautifulSoup:
    # Prefer XML parser for XHTML; fall back if markup is not well-formed XML.
    safe_parser = make_safe_xml_parser()
    try:
        soup = BeautifulSoup(markup, "lxml-xml", parser=safe_parser)
        if soup.find() is not None:
            return soup
    except Exception:
        pass
    return BeautifulSoup(markup, "lxml")


def epub_xhtml_to_text_and_title(raw: bytes, fallback_title: str) -> tuple[str, str]:
    """Single parse per file (faster + avoids duplicate DTD/network work)."""
    soup = make_epub_soup(raw)
    title_out = fallback_title
    for tag in soup.find_all(True):
        if tag_local_name(tag) not in ("h1", "h2", "h3", "title"):
            continue
        t = tag.get_text(strip=True)
        if t:
            title_out = t
            break

    for tag in list(soup.find_all(True)):
        if tag_local_name(tag) in ("script", "style", "nav"):
            tag.decompose()
    text = soup.get_text(separator="\n")
    lines = [line.strip() for line in text.splitlines()]
    text = "\n".join(line for line in lines if line)
    text = re.sub(r"\n{3,}", "\n\n", text)
    del soup
    return text.strip(), title_out


def chunk_text(text: str) -> list[str]:
    if len(text) <= CHUNK_SIZE:
        return [text] if text.strip() else []

    chunks: list[str] = []
    start = 0
    while start < len(text):
        prev_start = start
        end = min(start + CHUNK_SIZE, len(text))
        if end < len(text):
            bp = text.rfind("\n\n", start, end)
            if bp == -1 or bp <= start:
                bp = text.rfind(". ", start, end)
            if bp > start:
                end = bp + 1
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
        # If a breakpoint sits just after `start`, end - OVERLAP can move backwards → infinite loop.
        start = max(end - CHUNK_OVERLAP, prev_start + 1)
        if start >= len(text):
            break
    return chunks


def make_dedupe_key(book: str, chapter: str, idx: int, text: str) -> str:
    content = f"{book}|{chapter}|{idx}|{text[:200]}"
    return hashlib.sha256(content.encode()).hexdigest()[:32]


def read_spine_bytes(zf: zipfile.ZipFile, href: str) -> bytes | None:
    """Resolve href against the ZIP; EPUBs sometimes URL-encode names."""
    names = zf.namelist()
    name_set = set(names)
    for candidate in (href, unquote(href), href.lstrip("/"), unquote(href).lstrip("/")):
        if candidate in name_set:
            return zf.read(candidate)
    # Last resort: case-insensitive match (some archives differ only by case)
    lower_map = {n.lower(): n for n in names}
    for candidate in (href, unquote(href)):
        found = lower_map.get(candidate.lower())
        if found:
            return zf.read(found)
    return None


def get_spine_items(zf: zipfile.ZipFile) -> list[str]:
    """Parse OPF to get ordered spine item hrefs."""
    opf_path = None
    try:
        container = ET.fromstring(zf.read("META-INF/container.xml"))
        ns = {"c": "urn:oasis:names:tc:opendocument:xmlns:container"}
        rootfile = container.find(".//c:rootfile", ns)
        if rootfile is not None:
            opf_path = rootfile.get("full-path")
    except Exception:
        pass

    if not opf_path:
        for name in zf.namelist():
            if name.endswith(".opf"):
                opf_path = name
                break

    if not opf_path:
        return [n for n in zf.namelist() if n.endswith((".xhtml", ".html", ".htm"))]

    opf_dir = opf_path.rsplit("/", 1)[0] + "/" if "/" in opf_path else ""
    opf_xml = ET.fromstring(zf.read(opf_path))

    ns_opf = {"opf": "http://www.idpf.org/2007/opf"}
    ns_dc = {"dc": "http://purl.org/dc/elements/1.1/"}

    manifest: dict[str, str] = {}
    for item in opf_xml.findall(".//{http://www.idpf.org/2007/opf}item"):
        item_id = item.get("id", "")
        href = item.get("href", "")
        media_type = item.get("media-type", "")
        if "html" in media_type or "xml" in media_type:
            full_href = opf_dir + href if not href.startswith("/") else href.lstrip("/")
            manifest[item_id] = full_href

    spine_refs: list[str] = []
    for itemref in opf_xml.findall(".//{http://www.idpf.org/2007/opf}itemref"):
        idref = itemref.get("idref", "")
        if idref in manifest:
            spine_refs.append(manifest[idref])

    return spine_refs if spine_refs else [n for n in zf.namelist() if n.endswith((".xhtml", ".html", ".htm"))]


def get_book_title(zf: zipfile.ZipFile, epub_path: Path) -> str:
    for name in zf.namelist():
        if name.endswith(".opf"):
            try:
                opf_xml = ET.fromstring(zf.read(name))
                for title_el in opf_xml.iter("{http://purl.org/dc/elements/1.1/}title"):
                    if title_el.text and title_el.text.strip():
                        return title_el.text.strip()
            except Exception:
                pass
    return epub_path.stem


def send_batch(batch: list[dict], convex_url: str, admin_key: str) -> tuple[int, int]:
    payload = {
        "path": "lib/asoiaf_rag:ingestBatch",
        "args": {"chunks": batch},
        "format": "json",
    }
    response = requests.post(
        f"{convex_url}/api/action",
        headers={
            "Authorization": f"Convex {admin_key}",
            "Content-Type": "application/json",
        },
        json=payload,
        timeout=180,
    )

    if response.status_code != 200:
        raise RuntimeError(f"HTTP {response.status_code}: {response.text[:200]}")

    result = response.json()
    if isinstance(result, dict) and result.get("status") == "error":
        msg = result.get("errorMessage") or json.dumps(result)
        raise RuntimeError(msg[:300])

    val = result.get("value", result) if isinstance(result, dict) else {}
    return int(val.get("ingested", 0)), int(val.get("skipped", 0))


def load_progress() -> dict:
    if not PROGRESS_FILE.exists():
        return {"completed_books": [], "chapter_offsets": {}}
    try:
        data = json.loads(PROGRESS_FILE.read_text())
        if isinstance(data, list):
            return {"completed_books": data, "chapter_offsets": {}}
        return {
            "completed_books": data.get("completed_books", []),
            "chapter_offsets": data.get("chapter_offsets", {}),
        }
    except Exception:
        return {"completed_books": [], "chapter_offsets": {}}


def save_progress(progress: dict) -> None:
    PROGRESS_FILE.write_text(json.dumps(progress, indent=2))


def normalize_for_filename_match(s: str) -> str:
    """Lowercase + Unicode normalize so curly apostrophes match ASCII quotes."""
    s = unicodedata.normalize("NFKC", s)
    for ch in ("\u2019", "\u2018", "\u2032"):
        s = s.replace(ch, "'")
    return s.lower()


def resolve_skip_book_specs(epub_files: list[Path], specs: list[str]) -> list[str]:
    """Return unique .epub stems to mark complete. Exits on no match or ambiguity."""
    stems: list[str] = []
    for spec in specs:
        exact = [p for p in epub_files if spec == p.name or spec == p.stem]
        if len(exact) == 1:
            stems.append(exact[0].stem)
            continue
        if len(exact) > 1:
            print(
                f"ERROR: --skip-book {spec!r} matched multiple files: "
                f"{[p.name for p in exact]}",
                file=sys.stderr,
            )
            sys.exit(2)

        low = normalize_for_filename_match(spec)
        subs = []
        for p in epub_files:
            stem_m = normalize_for_filename_match(p.stem)
            name_m = normalize_for_filename_match(p.name)
            if (
                low in stem_m
                or low in name_m
                or stem_m in low
                or name_m in low
            ):
                subs.append(p)
        if len(subs) == 1:
            stems.append(subs[0].stem)
            continue
        if not subs:
            print(
                f"ERROR: --skip-book {spec!r} matched no .epub in {BOOKS_DIR}",
                file=sys.stderr,
            )
            print("  Available:", ", ".join(p.name for p in epub_files), file=sys.stderr)
            print(
                "  Hint: use the file name (e.g. 'A Feast for Crows.epub' or 'Feast'), "
                "not the long title printed from inside the EPUB HTML.",
                file=sys.stderr,
            )
            sys.exit(2)

        print(
            f"ERROR: --skip-book {spec!r} is ambiguous; matches: "
            f"{[p.name for p in subs]}",
            file=sys.stderr,
        )
        sys.exit(2)

    out: list[str] = []
    seen: set[str] = set()
    for s in stems:
        if s not in seen:
            seen.add(s)
            out.append(s)
    return out


def main():
    parser = argparse.ArgumentParser(description="Ingest ASOIAF EPUBs into Convex")
    parser.add_argument("--book", action="append", default=[])
    parser.add_argument("--include-ingested", action="store_true")
    parser.add_argument(
        "--skip-book",
        action="append",
        default=[],
        metavar="NAME",
        help=(
            "Mark an EPUB as fully ingested: match public/books/*.epub name or stem "
            '(e.g. "A Feast for Crows.epub" or "Feast"), not the in-book HTML title. '
            "Clears resume offset. With --mark-skip-only, only updates progress (no Convex)."
        ),
    )
    parser.add_argument(
        "--mark-skip-only",
        action="store_true",
        help="With --skip-book: update scripts/.ingested_books.json and exit (no Convex).",
    )
    args = parser.parse_args()

    if args.mark_skip_only and not args.skip_book:
        print("ERROR: --mark-skip-only requires at least one --skip-book", file=sys.stderr)
        sys.exit(2)

    if not BOOKS_DIR.exists():
        print(f"Books directory not found: {BOOKS_DIR}")
        sys.exit(1)

    epub_files = sorted(BOOKS_DIR.glob("*.epub"))
    if not epub_files:
        print(f"No EPUB files in {BOOKS_DIR}")
        sys.exit(1)

    progress = load_progress()
    completed = set(progress["completed_books"])
    offsets: dict[str, int] = dict(progress["chapter_offsets"])

    if args.skip_book:
        skip_stems = resolve_skip_book_specs(epub_files, args.skip_book)
        for stem in skip_stems:
            completed.add(stem)
            offsets.pop(stem, None)
        save_progress({"completed_books": sorted(completed), "chapter_offsets": offsets})
        print(
            "Marked complete (will be skipped on future runs): "
            + ", ".join(f"{s}.epub" for s in skip_stems)
        )
        if args.mark_skip_only:
            sys.exit(0)

    convex_url = os.environ.get("CONVEX_URL")
    admin_key = os.environ.get("CONVEX_ADMIN_KEY")
    if not convex_url or not admin_key:
        print("Set CONVEX_URL and CONVEX_ADMIN_KEY environment variables.")
        sys.exit(1)

    print(f"Found {len(epub_files)} EPUB files")

    selected = set(args.book)

    total_ingested = 0
    total_skipped = 0

    for epub_path in epub_files:
        if selected and epub_path.name not in selected:
            continue
        if not args.include_ingested and epub_path.stem in completed:
            print(f"Skipping completed: {epub_path.name}")
            continue

        start_from = offsets.get(epub_path.stem, 0)

        with zipfile.ZipFile(epub_path, "r") as zf:
            book_title = get_book_title(zf, epub_path)
            spine = get_spine_items(zf)

            print(f"\nProcessing: {epub_path.name} ({book_title})")
            print(f"  {len(spine)} spine items, resuming from index {start_from}")

            book_ingested = 0
            book_skipped = 0
            chapters_processed = 0
            skip_streak = 0

            for doc_idx, href in enumerate(spine):
                if doc_idx < start_from:
                    continue

                spine_label = href.split("/")[-1] or href
                print(
                    f"  · [{doc_idx + 1}/{len(spine)}] {spine_label[:56]}",
                    flush=True,
                )

                raw = read_spine_bytes(zf, href)
                if raw is None:
                    print(f"      skip: not in ZIP (href={href[:80]})", flush=True)
                    offsets[epub_path.stem] = doc_idx + 1
                    save_progress({"completed_books": sorted(completed), "chapter_offsets": offsets})
                    continue

                print(
                    f"      parsing XHTML ({len(raw) / 1024:.1f} KiB)…",
                    flush=True,
                )
                t_parse = time.perf_counter()
                text, chapter_title = epub_xhtml_to_text_and_title(
                    raw,
                    f"Section {doc_idx + 1}",
                )
                parse_s = time.perf_counter() - t_parse
                del raw
                gc.collect()

                if len(text) < 100:
                    print(
                        f"      skip: very little text ({len(text)} chars, parse {parse_s:.1f}s)",
                        flush=True,
                    )
                    offsets[epub_path.stem] = doc_idx + 1
                    save_progress({"completed_books": sorted(completed), "chapter_offsets": offsets})
                    continue

                chunks = chunk_text(text)
                del text

                if not chunks:
                    print(f"      skip: no chunks after split (parse {parse_s:.1f}s)", flush=True)
                    offsets[epub_path.stem] = doc_idx + 1
                    save_progress({"completed_books": sorted(completed), "chapter_offsets": offsets})
                    continue

                num_batches = (len(chunks) + BATCH_SIZE - 1) // BATCH_SIZE
                print(
                    f"      → {len(chunks)} chunks, {num_batches} API batch(es) "
                    f"(parse {parse_s:.1f}s) …",
                    flush=True,
                )

                ch_ingested = 0
                ch_skipped = 0

                for batch_num, i in enumerate(range(0, len(chunks), BATCH_SIZE), start=1):
                    batch = [
                        {
                            "text": c,
                            "book": book_title,
                            "chapter": chapter_title,
                            "chunkIndex": i + j,
                            "dedupeKey": make_dedupe_key(book_title, chapter_title, i + j, c),
                        }
                        for j, c in enumerate(chunks[i : i + BATCH_SIZE])
                    ]

                    print(
                        f"        batch {batch_num}/{num_batches} → Convex "
                        f"(embeddings; may take 30–180s)…",
                        flush=True,
                    )

                    try:
                        t0 = time.perf_counter()
                        ing, skp = send_batch(batch, convex_url, admin_key)
                        ch_ingested += ing
                        ch_skipped += skp
                        dt = time.perf_counter() - t0
                        print(
                            f"        batch {batch_num} done in {dt:.1f}s "
                            f"(+{ing} new, {skp} skip)",
                            flush=True,
                        )
                    except RuntimeError as e:
                        print(f"  ERROR [{chapter_title[:30]}]: {e}", flush=True)
                        break

                    time.sleep(0.1)

                del chunks
                gc.collect()

                chapters_processed += 1
                book_ingested += ch_ingested
                book_skipped += ch_skipped

                status_char = "+" if ch_ingested > 0 else "="
                print(
                    f"  {status_char} [{chapter_title[:40]}] "
                    f"ingested={ch_ingested}, skipped={ch_skipped}",
                    flush=True,
                )

                if ch_ingested == 0 and ch_skipped > 0:
                    skip_streak += 1
                else:
                    skip_streak = 0

                if skip_streak >= 8:
                    print(
                        "  All remaining chapters already indexed. Skipping rest.",
                        flush=True,
                    )
                    break

                offsets[epub_path.stem] = doc_idx + 1
                save_progress({"completed_books": sorted(completed), "chapter_offsets": offsets})

        completed.add(epub_path.stem)
        offsets.pop(epub_path.stem, None)
        save_progress({"completed_books": sorted(completed), "chapter_offsets": offsets})

        total_ingested += book_ingested
        total_skipped += book_skipped
        print(
            f"  Done: {book_ingested} ingested, {book_skipped} skipped ({chapters_processed} chapters)",
            flush=True,
        )

    print(
        f"\nFinished! Total: {total_ingested} ingested, {total_skipped} skipped",
        flush=True,
    )


if __name__ == "__main__":
    main()
