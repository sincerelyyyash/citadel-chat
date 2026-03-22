export type ThemePreset = {
    cssVars: {
        theme: Record<string, string>
        light: Record<string, string>
        dark: Record<string, string>
    }
}

export type FetchedTheme = {
    name: string
    preset: ThemePreset
    url: string
    motto: string
    error?: string
    type: "built-in" | "custom"
}

export const HOUSE_THEMES: FetchedTheme[] = [
    {
        name: "House Stark",
        url: "house-stark",
        motto: "Winter is Coming",
        type: "built-in",
        preset: {
            cssVars: {
                theme: {
                    "font-sans": '"Cinzel", serif',
                    "font-serif": '"Crimson Text", Georgia, serif',
                    "font-mono": "monospace",
                    radius: "0.375rem",
                    "tracking-tighter": "-0.04em",
                    "tracking-tight": "-0.02em",
                    "tracking-wide": "0.02em",
                    "tracking-wider": "0.05em",
                    "tracking-widest": "0.1em",
                    "shadow-color": "#000000",
                    "shadow-opacity": "0.1",
                    "shadow-blur": "3px",
                    "shadow-spread": "0px",
                    "shadow-offset-x": "0px",
                    "shadow-offset-y": "1px",
                    "letter-spacing": "0.01em",
                    spacing: "0.25rem"
                },
                light: {
                    background: "oklch(0.97 0.005 240)",
                    foreground: "oklch(0.25 0.01 250)",
                    card: "oklch(0.97 0.005 240)",
                    "card-foreground": "oklch(0.25 0.01 250)",
                    popover: "oklch(0.97 0.005 240)",
                    "popover-foreground": "oklch(0.25 0.01 250)",
                    primary: "oklch(0.78 0.015 260)",
                    "primary-foreground": "oklch(0.97 0.005 240)",
                    secondary: "oklch(0.93 0.005 260)",
                    "secondary-foreground": "oklch(0.25 0.01 250)",
                    muted: "oklch(0.93 0.005 250)",
                    "muted-foreground": "oklch(0.45 0.01 250)",
                    accent: "oklch(0.55 0.15 25)",
                    "accent-foreground": "oklch(0.97 0.005 240)",
                    destructive: "oklch(0.50 0.18 25)",
                    "destructive-foreground": "oklch(0.97 0.005 240)",
                    border: "oklch(0.87 0.01 260)",
                    input: "oklch(0.87 0.01 260)",
                    ring: "oklch(0.78 0.015 260)"
                },
                dark: {
                    background: "oklch(0.13 0.01 260)",
                    foreground: "oklch(0.90 0.01 250)",
                    card: "oklch(0.13 0.01 260)",
                    "card-foreground": "oklch(0.90 0.01 250)",
                    popover: "oklch(0.13 0.01 260)",
                    "popover-foreground": "oklch(0.90 0.01 250)",
                    primary: "oklch(0.70 0.02 260)",
                    "primary-foreground": "oklch(0.13 0.01 250)",
                    secondary: "oklch(0.20 0.005 260)",
                    "secondary-foreground": "oklch(0.90 0.01 250)",
                    muted: "oklch(0.20 0.005 250)",
                    "muted-foreground": "oklch(0.60 0.01 250)",
                    accent: "oklch(0.45 0.12 25)",
                    "accent-foreground": "oklch(0.90 0.01 250)",
                    destructive: "oklch(0.45 0.16 25)",
                    "destructive-foreground": "oklch(0.90 0.01 250)",
                    border: "oklch(0.28 0.01 260)",
                    input: "oklch(0.28 0.01 260)",
                    ring: "oklch(0.70 0.02 260)"
                }
            }
        }
    },
    {
        name: "House Targaryen",
        url: "house-targaryen",
        motto: "Fire and Blood",
        type: "built-in",
        preset: {
            cssVars: {
                theme: {
                    "font-sans": '"IM Fell English SC", "Cinzel", serif',
                    "font-serif": '"Cormorant Garamond", Georgia, serif',
                    "font-mono": "monospace",
                    radius: "0.25rem",
                    "tracking-tighter": "-0.04em",
                    "tracking-tight": "-0.02em",
                    "tracking-wide": "0.06em",
                    "tracking-wider": "0.1em",
                    "tracking-widest": "0.2em",
                    "shadow-color": "#000000",
                    "shadow-opacity": "0.2",
                    "shadow-blur": "4px",
                    "shadow-spread": "0px",
                    "shadow-offset-x": "0px",
                    "shadow-offset-y": "2px",
                    "letter-spacing": "0.05em",
                    spacing: "0.25rem"
                },
                light: {
                    background: "oklch(0.96 0.008 15)",
                    foreground: "oklch(0.22 0.02 15)",
                    card: "oklch(0.96 0.008 15)",
                    "card-foreground": "oklch(0.22 0.02 15)",
                    popover: "oklch(0.96 0.008 15)",
                    "popover-foreground": "oklch(0.22 0.02 15)",
                    primary: "oklch(0.55 0.22 25)",
                    "primary-foreground": "oklch(0.96 0.008 15)",
                    secondary: "oklch(0.92 0.01 15)",
                    "secondary-foreground": "oklch(0.22 0.02 15)",
                    muted: "oklch(0.92 0.01 15)",
                    "muted-foreground": "oklch(0.45 0.02 15)",
                    accent: "oklch(0.75 0.14 80)",
                    "accent-foreground": "oklch(0.22 0.02 15)",
                    // Errors/alerts must stay red (hue ~25), not primary-adjacent green (~145)
                    destructive: "oklch(0.52 0.20 25)",
                    "destructive-foreground": "oklch(0.96 0.008 15)",
                    border: "oklch(0.85 0.01 15)",
                    input: "oklch(0.85 0.01 15)",
                    ring: "oklch(0.55 0.22 25)"
                },
                dark: {
                    background: "oklch(0.10 0.015 15)",
                    foreground: "oklch(0.92 0.01 50)",
                    card: "oklch(0.10 0.015 15)",
                    "card-foreground": "oklch(0.92 0.01 50)",
                    popover: "oklch(0.10 0.015 15)",
                    "popover-foreground": "oklch(0.92 0.01 50)",
                    primary: "oklch(0.60 0.24 25)",
                    "primary-foreground": "oklch(0.10 0.015 15)",
                    secondary: "oklch(0.18 0.015 15)",
                    "secondary-foreground": "oklch(0.92 0.01 50)",
                    muted: "oklch(0.18 0.015 15)",
                    "muted-foreground": "oklch(0.60 0.01 50)",
                    accent: "oklch(0.70 0.12 80)",
                    "accent-foreground": "oklch(0.10 0.015 15)",
                    destructive: "oklch(0.58 0.22 25)",
                    "destructive-foreground": "oklch(0.96 0.01 15)",
                    border: "oklch(0.25 0.02 15)",
                    input: "oklch(0.25 0.02 15)",
                    ring: "oklch(0.60 0.24 25)"
                }
            }
        }
    },
    {
        name: "House Lannister",
        url: "house-lannister",
        motto: "Hear Me Roar",
        type: "built-in",
        preset: {
            cssVars: {
                theme: {
                    "font-sans": '"Cormorant", serif',
                    "font-serif": '"Playfair Display", Georgia, serif',
                    "font-mono": "monospace",
                    radius: "0.625rem",
                    "tracking-tighter": "-0.04em",
                    "tracking-tight": "-0.02em",
                    "tracking-wide": "0.05em",
                    "tracking-wider": "0.1em",
                    "tracking-widest": "0.15em",
                    "shadow-color": "oklch(0.75 0.16 85)",
                    "shadow-opacity": "0.15",
                    "shadow-blur": "6px",
                    "shadow-spread": "0px",
                    "shadow-offset-x": "0px",
                    "shadow-offset-y": "3px",
                    "letter-spacing": "0.04em",
                    spacing: "0.25rem"
                },
                light: {
                    background: "oklch(0.97 0.01 80)",
                    foreground: "oklch(0.25 0.04 50)",
                    card: "oklch(0.97 0.01 80)",
                    "card-foreground": "oklch(0.25 0.04 50)",
                    popover: "oklch(0.97 0.01 80)",
                    "popover-foreground": "oklch(0.25 0.04 50)",
                    primary: "oklch(0.75 0.16 85)",
                    "primary-foreground": "oklch(0.20 0.04 50)",
                    secondary: "oklch(0.93 0.015 80)",
                    "secondary-foreground": "oklch(0.25 0.04 50)",
                    muted: "oklch(0.93 0.015 80)",
                    "muted-foreground": "oklch(0.45 0.04 50)",
                    accent: "oklch(0.50 0.20 25)",
                    "accent-foreground": "oklch(0.97 0.01 80)",
                    destructive: "oklch(0.50 0.19 25)",
                    "destructive-foreground": "oklch(0.97 0.01 80)",
                    border: "oklch(0.87 0.04 80)",
                    input: "oklch(0.87 0.04 80)",
                    ring: "oklch(0.75 0.16 85)"
                },
                dark: {
                    background: "oklch(0.12 0.02 50)",
                    foreground: "oklch(0.90 0.03 80)",
                    card: "oklch(0.12 0.02 50)",
                    "card-foreground": "oklch(0.90 0.03 80)",
                    popover: "oklch(0.12 0.02 50)",
                    "popover-foreground": "oklch(0.90 0.03 80)",
                    primary: "oklch(0.80 0.18 85)",
                    "primary-foreground": "oklch(0.12 0.02 50)",
                    secondary: "oklch(0.20 0.02 50)",
                    "secondary-foreground": "oklch(0.90 0.03 80)",
                    muted: "oklch(0.20 0.02 50)",
                    "muted-foreground": "oklch(0.60 0.03 80)",
                    accent: "oklch(0.45 0.18 25)",
                    "accent-foreground": "oklch(0.90 0.03 80)",
                    destructive: "oklch(0.40 0.17 25)",
                    "destructive-foreground": "oklch(0.90 0.03 80)",
                    border: "oklch(0.30 0.04 65)",
                    input: "oklch(0.30 0.04 65)",
                    ring: "oklch(0.80 0.18 85)"
                }
            }
        }
    },
    {
        name: "House Baratheon",
        url: "house-baratheon",
        motto: "Ours is the Fury",
        type: "built-in",
        preset: {
            cssVars: {
                theme: {
                    "font-sans": '"Oswald", sans-serif',
                    "font-serif": '"Merriweather", Georgia, serif',
                    "font-mono": "monospace",
                    radius: "0.25rem",
                    "tracking-tighter": "-0.04em",
                    "tracking-tight": "-0.02em",
                    "tracking-wide": "0.04em",
                    "tracking-wider": "0.08em",
                    "tracking-widest": "0.15em",
                    "shadow-color": "#000000",
                    "shadow-opacity": "0.25",
                    "shadow-blur": "4px",
                    "shadow-spread": "0px",
                    "shadow-offset-x": "0px",
                    "shadow-offset-y": "2px",
                    "letter-spacing": "0.02em",
                    spacing: "0.25rem"
                },
                light: {
                    background: "oklch(0.96 0.005 70)",
                    foreground: "oklch(0.20 0.01 70)",
                    card: "oklch(0.96 0.005 70)",
                    "card-foreground": "oklch(0.20 0.01 70)",
                    popover: "oklch(0.96 0.005 70)",
                    "popover-foreground": "oklch(0.20 0.01 70)",
                    primary: "oklch(0.72 0.15 85)",
                    "primary-foreground": "oklch(0.20 0.01 70)",
                    secondary: "oklch(0.92 0.005 70)",
                    "secondary-foreground": "oklch(0.20 0.01 70)",
                    muted: "oklch(0.92 0.005 70)",
                    "muted-foreground": "oklch(0.40 0.01 70)",
                    accent: "oklch(0.50 0.10 250)",
                    "accent-foreground": "oklch(0.96 0.005 70)",
                    destructive: "oklch(0.52 0.19 25)",
                    "destructive-foreground": "oklch(0.96 0.005 70)",
                    border: "oklch(0.85 0.01 70)",
                    input: "oklch(0.85 0.01 70)",
                    ring: "oklch(0.72 0.15 85)"
                },
                dark: {
                    background: "oklch(0.11 0.01 70)",
                    foreground: "oklch(0.88 0.01 70)",
                    card: "oklch(0.11 0.01 70)",
                    "card-foreground": "oklch(0.88 0.01 70)",
                    popover: "oklch(0.11 0.01 70)",
                    "popover-foreground": "oklch(0.88 0.01 70)",
                    primary: "oklch(0.78 0.17 85)",
                    "primary-foreground": "oklch(0.11 0.01 70)",
                    secondary: "oklch(0.19 0.01 70)",
                    "secondary-foreground": "oklch(0.88 0.01 70)",
                    muted: "oklch(0.19 0.01 70)",
                    "muted-foreground": "oklch(0.55 0.01 70)",
                    accent: "oklch(0.55 0.12 250)",
                    "accent-foreground": "oklch(0.88 0.01 70)",
                    destructive: "oklch(0.48 0.17 25)",
                    "destructive-foreground": "oklch(0.88 0.01 70)",
                    border: "oklch(0.27 0.01 70)",
                    input: "oklch(0.27 0.01 70)",
                    ring: "oklch(0.78 0.17 85)"
                }
            }
        }
    },
    {
        name: "House Tyrell",
        url: "house-tyrell",
        motto: "Growing Strong",
        type: "built-in",
        preset: {
            cssVars: {
                theme: {
                    "font-sans": '"Outfit", sans-serif',
                    "font-serif": '"Lora", Georgia, serif',
                    "font-mono": "monospace",
                    radius: "0.75rem",
                    "tracking-tighter": "-0.04em",
                    "tracking-tight": "-0.02em",
                    "tracking-wide": "0.04em",
                    "tracking-wider": "0.08em",
                    "tracking-widest": "0.15em",
                    "shadow-color": "#2c6b41",
                    "shadow-opacity": "0.1",
                    "shadow-blur": "8px",
                    "shadow-spread": "0px",
                    "shadow-offset-x": "0px",
                    "shadow-offset-y": "4px",
                    "letter-spacing": "0.03em",
                    spacing: "0.25rem"
                },
                light: {
                    background: "oklch(0.97 0.01 130)",
                    foreground: "oklch(0.25 0.03 140)",
                    card: "oklch(0.97 0.01 130)",
                    "card-foreground": "oklch(0.25 0.03 140)",
                    popover: "oklch(0.97 0.01 130)",
                    "popover-foreground": "oklch(0.25 0.03 140)",
                    primary: "oklch(0.55 0.14 150)",
                    "primary-foreground": "oklch(0.97 0.01 130)",
                    secondary: "oklch(0.94 0.01 140)",
                    "secondary-foreground": "oklch(0.25 0.03 140)",
                    muted: "oklch(0.94 0.01 140)",
                    "muted-foreground": "oklch(0.45 0.03 140)",
                    accent: "oklch(0.72 0.10 70)",
                    "accent-foreground": "oklch(0.25 0.03 140)",
                    destructive: "oklch(0.52 0.18 30)",
                    "destructive-foreground": "oklch(0.97 0.01 130)",
                    border: "oklch(0.88 0.03 140)",
                    input: "oklch(0.88 0.03 140)",
                    ring: "oklch(0.55 0.14 150)"
                },
                dark: {
                    background: "oklch(0.13 0.02 150)",
                    foreground: "oklch(0.90 0.02 130)",
                    card: "oklch(0.13 0.02 150)",
                    "card-foreground": "oklch(0.90 0.02 130)",
                    popover: "oklch(0.13 0.02 150)",
                    "popover-foreground": "oklch(0.90 0.02 130)",
                    primary: "oklch(0.62 0.16 150)",
                    "primary-foreground": "oklch(0.13 0.02 150)",
                    secondary: "oklch(0.20 0.02 150)",
                    "secondary-foreground": "oklch(0.90 0.02 130)",
                    muted: "oklch(0.20 0.02 150)",
                    "muted-foreground": "oklch(0.60 0.02 130)",
                    accent: "oklch(0.68 0.12 55)",
                    "accent-foreground": "oklch(0.13 0.02 150)",
                    destructive: "oklch(0.45 0.16 30)",
                    "destructive-foreground": "oklch(0.90 0.02 130)",
                    border: "oklch(0.28 0.03 150)",
                    input: "oklch(0.28 0.03 150)",
                    ring: "oklch(0.62 0.16 150)"
                }
            }
        }
    }
]

export function extractThemeColors(preset: ThemePreset, mode: "light" | "dark"): string[] {
    const colors: string[] = []
    const { light, dark, theme } = preset.cssVars
    const modeVars = mode === "light" ? light : dark

    const colorKeys = [
        "primary",
        "accent",
        "secondary",
        "background",
        "muted",
        "destructive",
        "border",
        "card",
        "popover"
    ]

    const currentVars = { ...theme, ...modeVars }

    colorKeys.forEach((key) => {
        const colorValue = currentVars[key]
        if (colorValue && colors.length < 5) {
            if (
                colorValue.includes("hsl") ||
                colorValue.includes("oklch") ||
                colorValue.includes("#")
            ) {
                colors.push(colorValue)
            } else {
                colors.push(colorValue) // Catch-all for basic string values if any
            }
        }
    })

    return colors.slice(0, 5)
}
