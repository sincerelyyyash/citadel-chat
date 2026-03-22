/** Sigil asset paths and image scale classes per house theme (`house-stark`, etc.). */

export const HOUSE_SIGIL_PATHS: Record<string, string> = {
    "house-stark": "/sigil/stark-sigil.png",
    "house-targaryen": "/sigil/targereyan-sigil.png",
    "house-lannister": "/sigil/lanister-sigil.png",
    "house-baratheon": "/sigil/baratheon-sigil.png",
    "house-tyrell": "/sigil/tyrell-sigil.png"
}

/** Matches default `HouseBrandMark` sizing (large hero areas). */
export const HOUSE_SIGIL_IMAGE_CLASS_DEFAULT: Record<string, string> = {
    "house-stark": "size-16 scale-[5]",
    "house-targaryen": "size-16 scale-[5]",
    "house-lannister": "size-16 scale-[3.4]",
    "house-baratheon": "size-16 scale-[2.4]",
    "house-tyrell": "size-16 scale-[3.2]"
}

/** Matches sidebar `HouseBrandMark` with `sizePreset="sidebar"` (compact). */
export const HOUSE_SIGIL_IMAGE_CLASS_SIDEBAR: Record<string, string> = {
    "house-stark": "size-12 scale-[2.8]",
    "house-targaryen": "size-12 scale-[2.8]",
    "house-lannister": "size-12 scale-[2.0]",
    "house-baratheon": "size-12 scale-[1.8]",
    "house-tyrell": "size-12 scale-[1.9]"
}

export type HouseSigilSizePreset = "default" | "sidebar"

export const getHouseSigilPath = (themeUrl: string): string | undefined =>
    HOUSE_SIGIL_PATHS[themeUrl]

export const getHouseSigilImageClass = (
    themeUrl: string,
    preset: HouseSigilSizePreset
): string => {
    const map =
        preset === "sidebar" ? HOUSE_SIGIL_IMAGE_CLASS_SIDEBAR : HOUSE_SIGIL_IMAGE_CLASS_DEFAULT
    return map[themeUrl] ?? "size-16 scale-[4]"
}

export const getHouseSigilAltText = (themeUrl: string): string => {
    if (!themeUrl.startsWith("house-")) return "House sigil"
    return `${themeUrl.replace("house-", "House ")} sigil`
}
