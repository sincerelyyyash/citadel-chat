import {
    getHouseSigilAltText,
    getHouseSigilImageClass,
    getHouseSigilPath
} from "@/lib/house-sigils"
import { useThemeStore } from "@/lib/theme-store"

type HouseBrandMarkProps = {
    className?: string
    iconClassName?: string
    imageClassName?: string
    sizePreset?: "default" | "sidebar"
}

export function HouseBrandMark({
    className,
    iconClassName,
    imageClassName,
    sizePreset = "default"
}: HouseBrandMarkProps) {
    const { themeState } = useThemeStore()
    const selectedThemeUrl = themeState.selectedThemeUrl
    const sigilPath = getHouseSigilPath(selectedThemeUrl)
    const resolvedSigilClass =
        imageClassName ?? getHouseSigilImageClass(selectedThemeUrl, sizePreset)
    const sigilAlt = getHouseSigilAltText(selectedThemeUrl)

    return (
        <div className={`relative z-0 flex items-center justify-center ${className ?? ""}`}>
            <div
                className={
                    iconClassName ??
                    "relative z-0 flex min-h-24 min-w-24 shrink-0 items-center justify-center bg-muted/20 font-bold text-xl dark:bg-muted/15"
                }
            >
                {sigilPath ? (
                    <img
                        src={sigilPath}
                        alt={sigilAlt}
                        className={`relative z-0 max-h-full max-w-full object-contain ${resolvedSigilClass}`}
                    />
                ) : (
                    <span aria-label="Citadel Wordmark">Ci</span>
                )}
            </div>
        </div>
    )
}
