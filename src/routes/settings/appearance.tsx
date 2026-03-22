import { SettingsLayout } from "@/components/settings/settings-layout"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useThemeManagement } from "@/hooks/use-theme-management"
import { useChatWidthStore } from "@/lib/chat-width-store"
import {
    getHouseSigilAltText,
    getHouseSigilImageClass,
    getHouseSigilPath
} from "@/lib/house-sigils"
import { type FetchedTheme } from "@/lib/theme-utils"
import { cn } from "@/lib/utils"
import { createFileRoute } from "@tanstack/react-router"
import { CheckCircle, RectangleHorizontal, Square } from "lucide-react"
import { memo } from "react"

export const Route = createFileRoute("/settings/appearance")({
    component: AppearanceSettings
})

type ThemeCardProps = {
    theme: FetchedTheme
    isSelected: boolean
    onSelect: (theme: FetchedTheme) => void
}

const ThemeCard = memo(({ theme, isSelected, onSelect }: ThemeCardProps) => {
    const sigilPath = getHouseSigilPath(theme.url)
    const sigilClass = getHouseSigilImageClass(theme.url, "sidebar")
    const sigilAlt = getHouseSigilAltText(theme.url)

    return (
        <Card
            className={cn(
                "group relative overflow-hidden p-0",
                isSelected
                    ? "bg-primary/5 ring-1 ring-primary/20"
                    : "hover:ring-1 hover:ring-border"
            )}
        >
            <button
                type="button"
                className="flex w-full items-stretch gap-3 p-4 text-left"
                onClick={() => onSelect(theme)}
                aria-pressed={isSelected}
                aria-label={`Select ${theme.name}, ${theme.motto}`}
            >
                <div className="relative isolate flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted/30 dark:bg-muted/20">
                    {sigilPath ? (
                        <img
                            src={sigilPath}
                            alt={sigilAlt}
                            className={cn(
                                "relative z-0 max-h-full max-w-full shrink-0 object-contain",
                                sigilClass
                            )}
                        />
                    ) : (
                        <span
                            className="font-semibold text-muted-foreground text-xs"
                            aria-hidden
                        >
                            —
                        </span>
                    )}
                </div>
                <div className="min-w-0 flex-1 py-0.5">
                    <div className="flex items-start gap-2">
                        <h4 className="font-medium text-foreground text-sm leading-snug">
                            {theme.name}
                        </h4>
                        {isSelected ? (
                            <CheckCircle
                                className="mt-0.5 size-4 shrink-0 text-primary"
                                aria-hidden
                            />
                        ) : null}
                    </div>
                    <p className="mt-1 font-serif text-muted-foreground text-sm italic leading-snug">
                        “{theme.motto}”
                    </p>
                </div>
            </button>
        </Card>
    )
})

function AppearanceSettings() {
    const { chatWidthState, setChatWidth } = useChatWidthStore()

    const { session, selectedThemeUrl, themes, handleThemeSelect } = useThemeManagement()

    if (!session.user?.id) {
        return (
            <SettingsLayout
                title="Appearance"
                description="Customize the look and feel of your interface."
            >
                <div className="flex items-center justify-center py-12">
                    <p className="text-muted-foreground">
                        Sign in to manage your appearance settings.
                    </p>
                </div>
            </SettingsLayout>
        )
    }

    return (
        <SettingsLayout
            title="Appearance"
            description="Customize the look and feel of your interface."
        >
            <div className="space-y-8">
                {/* Chat Width Section */}
                <div className="space-y-4">
                    <div>
                        <h3 className="font-semibold text-foreground">Chat Width</h3>
                        <p className="mt-1 text-muted-foreground text-sm">
                            Choose the width of your chat messages
                        </p>
                    </div>

                    <div className="grid max-w-xl grid-cols-2 gap-3">
                        <Card
                            className={cn(
                                "cursor-pointer border-0 bg-muted/20 p-4 transition-all duration-200 hover:bg-muted/40",
                                chatWidthState.chatWidth === "normal"
                                    ? "bg-primary/5 ring-1 ring-primary/20"
                                    : "hover:ring-1 hover:ring-border"
                            )}
                            onClick={() => setChatWidth("normal")}
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex size-8 items-center justify-center rounded-full bg-background">
                                    <Square className="h-4 w-4 text-foreground" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <Label className="cursor-pointer font-medium text-foreground">
                                            Normal
                                        </Label>
                                        {chatWidthState.chatWidth === "normal" && (
                                            <CheckCircle className="ml-auto size-4 text-primary" />
                                        )}
                                    </div>
                                    <div className="mt-2 flex flex-col gap-1">
                                        <div className="h-2 w-full rounded-sm bg-muted" />
                                        <div className="h-2 w-4/5 rounded-sm bg-muted" />
                                        <div className="h-2 w-full rounded-sm bg-muted/60" />
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <Card
                            className={cn(
                                "cursor-pointer border-0 bg-muted/20 p-4 transition-all duration-200 hover:bg-muted/40",
                                chatWidthState.chatWidth === "wider"
                                    ? "bg-primary/5 ring-1 ring-primary/20"
                                    : "hover:ring-1 hover:ring-border"
                            )}
                            onClick={() => setChatWidth("wider")}
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex size-8 items-center justify-center rounded-full bg-background">
                                    <RectangleHorizontal className="h-4 w-4 text-foreground" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <Label className="cursor-pointer font-medium text-foreground">
                                            Wider
                                        </Label>
                                        {chatWidthState.chatWidth === "wider" && (
                                            <CheckCircle className="ml-auto size-4 text-primary" />
                                        )}
                                    </div>
                                    <div className="mt-2 flex flex-col gap-1">
                                        <div className="h-2 w-full rounded-sm bg-muted" />
                                        <div className="h-2 w-full rounded-sm bg-muted" />
                                        <div className="h-2 w-5/6 rounded-sm bg-muted/60" />
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Themes Section */}
                <div className="space-y-4">
                    <div>
                        <h3 className="font-semibold text-foreground">The Great Houses</h3>
                        <p className="mt-1 text-muted-foreground text-sm">
                            Pledge your allegiance — each House brings its sigil, words, and
                            character to the Citadel.
                        </p>
                    </div>

                    {/* Theme Content */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {themes.map((theme) => (
                            <ThemeCard
                                key={theme.url}
                                theme={theme}
                                isSelected={
                                    selectedThemeUrl === theme.url ||
                                    (!selectedThemeUrl && theme.url === "house-stark")
                                }
                                onSelect={handleThemeSelect}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </SettingsLayout>
    )
}
