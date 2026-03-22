import { useThemeStore } from "./theme-store"

export const toggleThemeMode = () => {
    const themeState = useThemeStore.getState().themeState
    useThemeStore.getState().setThemeState({
        ...themeState,
        currentMode: "dark"
    })
}
