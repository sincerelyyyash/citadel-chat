"use client"

import { cn } from "@/lib/utils"
import { useThemeStore } from "@/lib/theme-store"
import type { CSSProperties } from "react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

/** Maps Sonner rich semantic toasts to app CSS variables (avoids bundled green/red HSL). */
const sonnerThemedVariables = {
    "--normal-bg": "var(--popover)",
    "--normal-text": "var(--popover-foreground)",
    "--normal-border": "var(--border)",
    "--error-bg": "color-mix(in oklch, var(--destructive) 16%, var(--card))",
    "--error-border": "color-mix(in oklch, var(--destructive) 50%, var(--border))",
    "--error-text": "var(--destructive)",
    "--success-bg": "color-mix(in oklch, var(--primary) 14%, var(--card))",
    "--success-border": "color-mix(in oklch, var(--primary) 42%, var(--border))",
    "--success-text": "var(--primary)",
    "--warning-bg": "color-mix(in oklch, var(--chart-4) 18%, var(--card))",
    "--warning-border": "color-mix(in oklch, var(--chart-4) 48%, var(--border))",
    "--warning-text": "var(--chart-4)",
    "--info-bg": "color-mix(in oklch, var(--chart-2) 14%, var(--card))",
    "--info-border": "color-mix(in oklch, var(--chart-2) 42%, var(--border))",
    "--info-text": "var(--chart-2)"
} as unknown as CSSProperties

const Toaster = ({ className, style, ...props }: ToasterProps) => {
    const { themeState } = useThemeStore()

    return (
        <Sonner
            theme={themeState.currentMode as ToasterProps["theme"]}
            className={cn("toaster group", className)}
            style={{
                ...sonnerThemedVariables,
                ...style
            }}
            {...props}
        />
    )
}

export { Toaster }
