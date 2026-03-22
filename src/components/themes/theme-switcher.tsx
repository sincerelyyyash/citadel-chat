import { useThemeManagement } from "@/hooks/use-theme-management"
import type { FetchedTheme } from "@/lib/theme-utils"
import { cn } from "@/lib/utils"
import { ShuffleIcon, Sword } from "lucide-react"
import { Button } from "../ui/button"
import {
    ResponsivePopover,
    ResponsivePopoverContent,
    ResponsivePopoverTrigger
} from "../ui/responsive-popover"
import { ScrollArea } from "../ui/scroll-area"
import { Separator } from "../ui/separator"

function BannerIcon({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            aria-hidden="true"
        >
            <path
                d="M5 4.5C5 3.67 5.67 3 6.5 3H17.5C18.33 3 19 3.67 19 4.5V16.1C19 16.64 18.71 17.14 18.24 17.41L12.75 20.64C12.29 20.9 11.71 20.9 11.25 20.64L5.76 17.41C5.29 17.14 5 16.64 5 16.1V4.5Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path d="M9 7.5H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path
                d="M5 7H3.5C2.67 7 2 7.67 2 8.5V10.5C2 11.33 2.67 12 3.5 12H5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M19 7H20.5C21.33 7 22 7.67 22 8.5V10.5C22 11.33 21.33 12 20.5 12H19"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    )
}

type ThemeButtonProps = {
    theme: FetchedTheme
    isSelected: boolean
    onSelect: (theme: FetchedTheme) => void
}

function ThemeButton({ theme, isSelected, onSelect }: ThemeButtonProps) {
    return (
        <button
            type="button"
            key={theme.url}
            onClick={() => onSelect(theme)}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    onSelect(theme)
                }
            }}
            aria-label={`Select theme: ${theme.name}`}
            aria-pressed={isSelected}
            className={cn(
                "w-full cursor-pointer overflow-hidden rounded-lg border bg-card/50 p-0 text-left transition-all duration-200 hover:shadow-sm",
                isSelected
                    ? "border-primary/70 bg-primary/10 ring-1 ring-primary/20"
                    : "border-border/70 hover:border-primary/40 hover:bg-card/70"
            )}
        >
            <div className="flex items-center justify-between gap-3 p-3">
                <div className="min-w-0 flex-1">
                    <div className="truncate font-medium text-sm">{theme.name}</div>
                    <div className="mt-0.5 text-muted-foreground text-xs">
                        {isSelected ? "Active banner" : "Pledge this house"}
                    </div>
                </div>
                <div
                    className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-md border transition-colors",
                        isSelected
                            ? "border-primary/60 bg-primary/15"
                            : "border-border/50 bg-background/30"
                    )}
                    aria-hidden="true"
                >
                    {isSelected ? <Sword className="h-4 w-4 text-primary" /> : null}
                </div>
            </div>
        </button>
    )
}

export function ThemeSwitcher() {
    const { themeState, selectedThemeUrl, themes, handleThemeSelect, randomizeTheme } =
        useThemeManagement()

    return (
        <>
            <div className="flex items-center gap-2">
                <ResponsivePopover modal={false}>
                    <ResponsivePopoverTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon"
                            className="flex size-8 items-center rounded-md"
                        >
                            <BannerIcon className="h-3.5 w-3.5" />
                        </Button>
                    </ResponsivePopoverTrigger>

                    <ResponsivePopoverContent
                        align="end"
                        className="w-full p-0 md:w-80"
                        title="Theme Selector"
                        description="Pledge your allegiance"
                    >
                        <Separator className="hidden md:block" />

                        {/* Theme Count and Controls */}
                        <div className="flex items-center justify-between px-3 py-2">
                            <div className="text-muted-foreground text-sm">
                                {themes.length} Great Houses
                            </div>
                            <div className="flex items-center gap-1">
                                {/* Randomizer */}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-7"
                                    onClick={randomizeTheme}
                                    title="Random House"
                                >
                                    <ShuffleIcon className="h-3.5 w-3.5" />
                                    <span className="sr-only">Random House</span>
                                </Button>
                            </div>
                        </div>
                        <Separator />

                        {/* Themes List */}
                        <ScrollArea className="h-80">
                            <div className="p-3">
                                <div className="space-y-3">
                                    <div className="grid grid-cols-1 gap-2">
                                        {themes.map((theme) => (
                                            <ThemeButton
                                                key={theme.url}
                                                theme={theme}
                                                isSelected={
                                                    selectedThemeUrl === theme.url ||
                                                    (!selectedThemeUrl &&
                                                        theme.url === "house-stark")
                                                }
                                                onSelect={handleThemeSelect}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </ScrollArea>
                    </ResponsivePopoverContent>
                </ResponsivePopover>
            </div>
        </>
    )
}
