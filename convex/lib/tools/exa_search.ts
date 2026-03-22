import { tool } from "ai"
import { z } from "zod"
import type { ToolAdapter } from "../toolkit"

const EXA_SEARCH_URL = "https://api.exa.ai/search"
const MAX_SNIPPET_CHARS = 500
const DEFAULT_NUM_RESULTS = 8

type ExaSearchResultRow = {
    title?: string | null
    url?: string | null
    summary?: string | null
    text?: string | null
    highlights?: string[] | null
}

type ExaSearchResponse = {
    results?: ExaSearchResultRow[]
    requestId?: string
}

const buildSnippet = (row: ExaSearchResultRow): string => {
    const summary = typeof row.summary === "string" ? row.summary.trim() : ""
    if (summary) return summary.slice(0, MAX_SNIPPET_CHARS)

    if (Array.isArray(row.highlights) && row.highlights.length > 0) {
        return row.highlights.join(" ").trim().slice(0, MAX_SNIPPET_CHARS)
    }

    const text = typeof row.text === "string" ? row.text.trim() : ""
    if (text) return text.slice(0, MAX_SNIPPET_CHARS)

    return ""
}

const normalizeExaResults = (rows: ExaSearchResultRow[]) => {
    const out: Array<{
        url: string
        title: string
        description: string
        snippet: string
    }> = []

    for (const row of rows) {
        const url = typeof row.url === "string" && row.url.trim() ? row.url.trim() : ""
        if (!url) continue

        const title =
            typeof row.title === "string" && row.title.trim() ? row.title.trim() : "Untitled"
        const snippet = buildSnippet(row)

        out.push({
            url,
            title,
            description: snippet,
            snippet
        })
    }

    return out
}

export const ExaSearchAdapter: ToolAdapter = async ({ enabledTools }) => {
    if (!enabledTools.includes("web_search")) {
        return {}
    }

    return {
        web_search: tool({
            description:
                "Search the public web for current information: news, blogs, adaptations, interviews, and non-book facts about A Song of Ice and Fire / Game of Thrones. Do not use this for in-universe book text—use search_lore for canon passages.",
            parameters: z.object({
                query: z.string().describe("The web search query"),
                numResults: z
                    .number()
                    .int()
                    .min(1)
                    .max(10)
                    .optional()
                    .describe("Number of results (max 10)")
            }),
            execute: async ({ query, numResults }) => {
                const apiKey = process.env.EXA_API_KEY?.trim()
                if (!apiKey) {
                    return {
                        success: false,
                        query,
                        results: [],
                        error: "Web search is not configured (missing EXA_API_KEY on the server)."
                    }
                }

                const n = Math.min(numResults ?? DEFAULT_NUM_RESULTS, 10)

                try {
                    const res = await fetch(EXA_SEARCH_URL, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "x-api-key": apiKey
                        },
                        body: JSON.stringify({
                            query,
                            numResults: n,
                            type: "auto",
                            contents: {
                                highlights: {
                                    maxCharacters: 400
                                }
                            }
                        })
                    })

                    const rawText = await res.text()
                    let data: ExaSearchResponse
                    try {
                        data = JSON.parse(rawText) as ExaSearchResponse
                    } catch {
                        return {
                            success: false,
                            query,
                            results: [],
                            error: `Exa returned non-JSON (${res.status})`
                        }
                    }

                    if (!res.ok) {
                        const errMsg =
                            (data as { error?: string }).error ??
                            rawText.slice(0, 300) ??
                            `HTTP ${res.status}`
                        return {
                            success: false,
                            query,
                            results: [],
                            error: errMsg
                        }
                    }

                    const rows = Array.isArray(data.results) ? data.results : []
                    const results = normalizeExaResults(rows)

                    return {
                        success: true,
                        query,
                        results,
                        count: results.length,
                        requestId: data.requestId
                    }
                } catch (error) {
                    console.error("[ExaSearchAdapter]", error)
                    return {
                        success: false,
                        query,
                        results: [],
                        error: error instanceof Error ? error.message : "Web search failed"
                    }
                }
            }
        })
    }
}
