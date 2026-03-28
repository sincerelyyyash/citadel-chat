import { Button } from "@/components/ui/button"
import { useThemeStore } from "@/lib/theme-store"
import { HOUSE_THEMES } from "@/lib/theme-utils"
import { useNavigate } from "@tanstack/react-router"
import { motion } from "motion/react"

export function GuestTrialBanner({
    remainingMessages,
    isBlocked
}: {
    remainingMessages: number
    isBlocked: boolean
}) {
    const navigate = useNavigate()
    const { themeState } = useThemeStore()
    const selectedHouseTheme =
        HOUSE_THEMES.find((theme) => theme.url === themeState.selectedThemeUrl) ?? HOUSE_THEMES[0]

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="mx-auto w-full max-w-4xl"
        >
            <div className="relative overflow-hidden rounded-xl border border-border/70 bg-card/75 shadow-sm backdrop-blur-md">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.18),transparent_38%),radial-gradient(circle_at_bottom_right,hsl(var(--accent)/0.12),transparent_34%)]" />
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

                <div className="relative flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:px-5">
                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                            <p className="font-serif text-base text-foreground tracking-wide">
                                {isBlocked
                                    ? "The gate now asks your name"
                                    : "A guest audience remains"}
                            </p>
                            <span className="text-muted-foreground text-xs italic tracking-wide">
                                {selectedHouseTheme.motto}
                            </span>
                        </div>

                        <p className="mt-1 text-muted-foreground text-sm leading-relaxed">
                            {isBlocked
                                ? "Your free trial is complete. Sign in to keep this thread, continue the exchange, and return to it later."
                                : `${remainingMessages} guest message${remainingMessages === 1 ? "" : "s"} remain before login is required. Your conversation will still carry over after you sign in.`}
                        </p>
                    </div>

                    <Button
                        size="sm"
                        className="w-full shrink-0 sm:w-auto"
                        onClick={() =>
                            navigate({ to: "/auth/$pathname", params: { pathname: "signup" } })
                        }
                    >
                        {isBlocked ? "Enter Citadel" : "Save My Chat"}
                    </Button>
                </div>
            </div>
        </motion.div>
    )
}
