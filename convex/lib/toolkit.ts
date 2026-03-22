import type { Tool } from "ai"
import type { GenericActionCtx } from "convex/server"
import type { Infer } from "convex/values"
import type { DataModel } from "../_generated/dataModel"
import type { UserSettings } from "../schema/settings"
import { ExaSearchAdapter } from "./tools/exa_search"
import { LoreSearchAdapter } from "./tools/lore_search"
import { SupermemoryAdapter } from "./tools/supermemory"

export type ToolAdapter = (params: ConditionalToolParams) => Promise<Partial<Record<string, Tool>>>
/** Lore + memory + Exa web search (UI toggle id `web_search`). */
export const TOOL_ADAPTERS = [SupermemoryAdapter, ExaSearchAdapter, LoreSearchAdapter]

/** Tools the user can turn on/off in the UI. Lore search is always enabled server-side. */
export const USER_TOGGLEABLE_ABILITIES = ["web_search", "supermemory"] as const
export type UserToggleableAbilityId = (typeof USER_TOGGLEABLE_ABILITIES)[number]

export const ABILITIES = ["web_search", "supermemory", "lore_search"] as const
export type AbilityId = (typeof ABILITIES)[number]

/** Merge user-selected tools with lore (always on). Strips unknown / legacy client values. */
export const normalizeClientEnabledTools = (fromClient: readonly string[]): AbilityId[] => {
    const user = new Set<UserToggleableAbilityId>()
    for (const t of fromClient) {
        if (USER_TOGGLEABLE_ABILITIES.includes(t as UserToggleableAbilityId)) {
            user.add(t as UserToggleableAbilityId)
        }
    }
    return [...user, "lore_search"] as AbilityId[]
}

export type ConditionalToolParams = {
    ctx: GenericActionCtx<DataModel>
    enabledTools: AbilityId[]
    userSettings: Infer<typeof UserSettings>
}

export const getToolkit = async (
    ctx: GenericActionCtx<DataModel>,
    enabledTools: AbilityId[],
    userSettings: Infer<typeof UserSettings>
): Promise<Record<string, Tool>> => {
    const toolResults = await Promise.all(
        TOOL_ADAPTERS.map((adapter) => adapter({ ctx, enabledTools, userSettings }))
    )

    const tools: Record<string, Tool> = {}
    for (const toolResult of toolResults) {
        for (const [key, value] of Object.entries(toolResult)) {
            if (value) {
                tools[key] = value
            }
        }
    }

    console.log("tools", Object.keys(tools))
    return tools
}
