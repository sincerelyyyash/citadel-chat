import { useSession } from "@/hooks/auth-hooks"
import { useThemeStore } from "@/lib/theme-store"
import { type FetchedTheme, HOUSE_THEMES, type ThemePreset } from "@/lib/theme-utils"

const HOUSE_ONLY_THEMES = HOUSE_THEMES.slice(0, 5)

export function useThemeManagement() {
    const session = useSession()
    const { themeState, setThemeState } = useThemeStore()

    const applyThemePreset = (preset: ThemePreset) => {
        setThemeState({
            ...themeState,
            cssVars: preset.cssVars
        })
    }

    const handleThemeSelect = (theme: FetchedTheme) => {
        if ("preset" in theme) {
            setThemeState({
                ...themeState,
                selectedThemeUrl: theme.url,
                cssVars: theme.preset.cssVars
            })
        }
    }

    const randomizeTheme = () => {
        if (HOUSE_ONLY_THEMES.length > 0) {
            const randomTheme =
                HOUSE_ONLY_THEMES[Math.floor(Math.random() * HOUSE_ONLY_THEMES.length)]
            handleThemeSelect(randomTheme)
        }
    }

    return {
        // State
        themeState,
        selectedThemeUrl: themeState.selectedThemeUrl,
        themes: HOUSE_ONLY_THEMES,
        session,

        // Actions
        handleThemeSelect,
        randomizeTheme,
        applyThemePreset
    }
}
