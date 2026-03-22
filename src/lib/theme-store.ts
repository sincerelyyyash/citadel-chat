import { create } from "zustand"
import { persist } from "zustand/middleware"
import { HOUSE_THEMES } from "./theme-utils"

export const THEME_STORE_KEY = "theme-store"

type ThemeMode = "dark"

type ThemeState = {
    currentMode: ThemeMode
    selectedThemeUrl: string
    cssVars: {
        theme: Record<string, string>
        light: Record<string, string>
        dark: Record<string, string>
    }
}

type ThemeStore = {
    themeState: ThemeState
    setThemeState: (themeState: ThemeState) => void
}

const houseThemes = HOUSE_THEMES.slice(0, 5)
const starkTheme = houseThemes.find((theme) => theme.url === "house-stark")

if (!starkTheme) {
    throw new Error("Missing required default theme: house-stark")
}

const DEFAULT_THEME = {
    themeState: {
        currentMode: "dark", // Using Dark mode by default, it fits ASOIAF better visually
        selectedThemeUrl: "house-stark",
        cssVars: starkTheme.preset.cssVars
    }
} as const

type PersistedThemeSlice = Pick<ThemeStore, "themeState">

export const useThemeStore = create<ThemeStore>()(
    persist(
        (set) => ({
            themeState: DEFAULT_THEME.themeState,
            setThemeState: (themeState) => set({ themeState })
        }),
        {
            name: THEME_STORE_KEY,
            partialize: (state) => ({ themeState: state.themeState }),
            merge: (persistedState, currentState) => {
                const fromDisk = persistedState as Partial<PersistedThemeSlice> | undefined
                const merged: ThemeStore = {
                    ...currentState,
                    ...fromDisk,
                    themeState: fromDisk?.themeState ?? currentState.themeState
                }
                const url = merged.themeState.selectedThemeUrl
                const canonical = HOUSE_THEMES.find((t) => t.url === url)
                if (!canonical) {
                    return merged
                }
                return {
                    ...merged,
                    themeState: {
                        ...merged.themeState,
                        cssVars: canonical.preset.cssVars
                    }
                }
            }
        }
    )
)
