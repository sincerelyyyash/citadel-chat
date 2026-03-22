import { SupermemoryIcon } from "@/components/brand-icons"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList
} from "@/components/ui/command"
import {
    ResponsivePopover,
    ResponsivePopoverContent,
    ResponsivePopoverTrigger
} from "@/components/ui/responsive-popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import { api } from "@/convex/_generated/api"
import type { UserToggleableAbilityId } from "@/convex/lib/toolkit"
import { useSession } from "@/hooks/auth-hooks"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { useConvexQuery } from "@convex-dev/react-query"
import { Globe, Settings2 } from "lucide-react"
import { memo, useMemo, useState } from "react"

type ToolSelectorPopoverProps = {
    threadId?: string
    enabledTools: UserToggleableAbilityId[]
    onEnabledToolsChange: (tools: UserToggleableAbilityId[]) => void
    modelSupportsFunctionCalling: boolean
    className?: string
}

export const ToolSelectorPopover = memo(
    ({
        threadId,
        enabledTools,
        onEnabledToolsChange,
        modelSupportsFunctionCalling,
        className
    }: ToolSelectorPopoverProps) => {
        const session = useSession()
        const isMobile = useIsMobile()
        const [open, setOpen] = useState(false)

        const userSettings = useConvexQuery(
            api.settings.getUserSettings,
            session.user?.id ? {} : "skip"
        )

        const webSearchButton = useMemo(() => {
            return (
                <Button
                    type="button"
                    variant={enabledTools.includes("web_search") ? "default" : "ghost"}
                    disabled={!modelSupportsFunctionCalling}
                    onClick={() => {
                        if (modelSupportsFunctionCalling) {
                            onEnabledToolsChange(
                                enabledTools.includes("web_search")
                                    ? enabledTools.filter((tool) => tool !== "web_search")
                                    : [...enabledTools, "web_search"]
                            )
                        }
                    }}
                    className={cn(
                        "size-8 shrink-0",
                        !enabledTools.includes("web_search") &&
                            "bg-secondary/70 backdrop-blur-lg hover:bg-secondary/80",
                        !modelSupportsFunctionCalling && "cursor-not-allowed opacity-50",
                        className
                    )}
                >
                    <Globe className="size-4" />
                </Button>
            )
        }, [enabledTools, modelSupportsFunctionCalling, onEnabledToolsChange, className])

        const hasSupermemory =
            userSettings && !("error" in userSettings)
                ? Boolean(userSettings.generalProviders?.supermemory?.enabled)
                : false

        const handleWebSearchToggle = () => {
            if (!modelSupportsFunctionCalling) return

            onEnabledToolsChange(
                enabledTools.includes("web_search")
                    ? enabledTools.filter((tool) => tool !== "web_search")
                    : [...enabledTools, "web_search"]
            )
        }

        const handleSupermemoryToggle = () => {
            onEnabledToolsChange(
                enabledTools.includes("supermemory")
                    ? enabledTools.filter((tool) => tool !== "supermemory")
                    : [...enabledTools, "supermemory"]
            )
        }

        const getActiveToolsCount = () => {
            let count = 0
            if (enabledTools.includes("web_search")) count++
            if (enabledTools.includes("supermemory")) count++
            return count
        }

        const activeCount = getActiveToolsCount()

        return (
            <ResponsivePopover open={open} onOpenChange={setOpen}>
                <ResponsivePopoverTrigger asChild>
                    <Button
                        type="button"
                        variant={activeCount > 0 ? "default" : "ghost"}
                        disabled={!modelSupportsFunctionCalling}
                        className={cn(
                            "relative size-8 shrink-0",
                            activeCount === 0 &&
                                "bg-secondary/70 backdrop-blur-lg hover:bg-secondary/80",
                            !modelSupportsFunctionCalling && "cursor-not-allowed opacity-50",
                            className
                        )}
                    >
                        <Settings2 className="size-4" />
                        {activeCount > 0 && (
                            <span className="-top-1 -right-1 absolute flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                                {activeCount}
                            </span>
                        )}
                    </Button>
                </ResponsivePopoverTrigger>
                <ResponsivePopoverContent
                    className="p-0 md:w-80"
                    align="start"
                    title="Tool Settings"
                    description="Optional tools — book lore search is always on for this app"
                >
                    <Command className="rounded-none md:rounded-md">
                        {!isMobile && (
                            <CommandInput placeholder="Search tools..." className="h-8" />
                        )}
                        <CommandList>
                            <CommandEmpty>No tools found.</CommandEmpty>
                            <ScrollArea className="h-fit">
                                <CommandGroup heading="Tools">
                                    <CommandItem className="flex items-center justify-between p-3">
                                        <div className="flex items-center gap-3">
                                            <Globe className="h-4 w-4" />
                                            <span className="text-foreground text-sm">
                                                Web Search
                                            </span>
                                        </div>
                                        <Switch
                                            checked={enabledTools.includes("web_search")}
                                            onCheckedChange={handleWebSearchToggle}
                                            disabled={!modelSupportsFunctionCalling}
                                        />
                                    </CommandItem>

                                    {hasSupermemory && (
                                        <CommandItem className="flex items-center justify-between p-3">
                                            <div className="flex items-center gap-3">
                                                <div className="flex size-4 items-center justify-center">
                                                    <SupermemoryIcon />
                                                </div>
                                                <span className="text-foreground text-sm">
                                                    Supermemory
                                                </span>
                                            </div>
                                            <Switch
                                                checked={enabledTools.includes("supermemory")}
                                                onCheckedChange={handleSupermemoryToggle}
                                            />
                                        </CommandItem>
                                    )}
                                </CommandGroup>

                                {!modelSupportsFunctionCalling && (
                                    <div className="px-4 py-3 text-center text-muted-foreground text-sm">
                                        Current model doesn't support function calling
                                    </div>
                                )}
                            </ScrollArea>
                        </CommandList>
                    </Command>
                </ResponsivePopoverContent>
            </ResponsivePopover>
        )
    }
)
