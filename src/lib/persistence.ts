import { USER_TOGGLEABLE_ABILITIES, type UserToggleableAbilityId } from "@/convex/lib/toolkit"
import { CHARACTERS } from "@/lib/characters"
import { z } from "zod"

const VALID_CHARACTER_IDS = new Set(CHARACTERS.map((c) => c.id))
const LEGACY_CHARACTER_ID_MAP: Record<string, string> = {
    hound: "margaery",
    ned: "jon",
    littlefinger: "margaery"
}

/** Maps removed/legacy ids and invalid stored ids to a valid roster id. */
export const normalizeCharacterId = (id: string | null | undefined): string => {
    if (typeof id !== "string" || id === "") return "tyrion"
    return LEGACY_CHARACTER_ID_MAP[id] ?? (VALID_CHARACTER_IDS.has(id) ? id : "tyrion")
}

const userToolEnum = z.enum(USER_TOGGLEABLE_ABILITIES as readonly ["web_search", "supermemory"])

const AIConfigSchema = z.object({
    selectedModel: z.string().nullable().default("kimi-k2.5"),
    selectedCharacterId: z.string().nullable().default("tyrion"),
    enabledTools: z.array(userToolEnum).default(["web_search"]),
    reasoningEffort: z.enum(["off", "low", "medium", "high"]).default("medium")
})

export type AIConfig = z.infer<typeof AIConfigSchema>

const AI_CONFIG_KEY = "ai-config"
const USER_INPUT_KEY = "user-input"

const safeRemoveItem = (key: string): void => {
    if (typeof window === "undefined") return
    try {
        localStorage.removeItem(key)
    } catch {}
}

export const loadAIConfig = (): AIConfig => {
    const defaults: AIConfig = {
        selectedModel: "kimi-k2.5",
        selectedCharacterId: "tyrion",
        enabledTools: ["web_search"],
        reasoningEffort: "medium"
    }

    if (typeof window === "undefined") return defaults

    const stored = localStorage.getItem(AI_CONFIG_KEY)
    if (!stored) return defaults

    try {
        const parsed = JSON.parse(stored)

        if (Array.isArray(parsed.enabledTools)) {
            parsed.enabledTools = parsed.enabledTools.filter((tool: string) =>
                USER_TOGGLEABLE_ABILITIES.includes(tool as UserToggleableAbilityId)
            )
        }

        if (!parsed.enabledTools?.length) {
            parsed.enabledTools = ["web_search"]
        }

        const rawCharacterId = parsed.selectedCharacterId as string | null | undefined
        let shouldPersistMigration = false
        if (typeof rawCharacterId === "string") {
            const migrated = normalizeCharacterId(rawCharacterId)
            if (migrated !== rawCharacterId) {
                parsed.selectedCharacterId = migrated
                shouldPersistMigration = true
            }
        }

        const config = AIConfigSchema.parse(parsed)
        if (shouldPersistMigration) saveAIConfig(config)
        return config
    } catch {
        safeRemoveItem(AI_CONFIG_KEY)
        return defaults
    }
}

export const loadUserInput = (): string => {
    if (typeof window === "undefined") return ""
    const stored = localStorage.getItem(USER_INPUT_KEY)
    return stored?.trim() ?? ""
}

export const saveAIConfig = (config: AIConfig): void => {
    if (typeof window === "undefined") return
    const validated = AIConfigSchema.parse(config)
    localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(validated))
}

export const saveUserInput = (input: string): void => {
    if (typeof window === "undefined") return
    if (input.trim()) localStorage.setItem(USER_INPUT_KEY, input)
    else localStorage.removeItem(USER_INPUT_KEY)
}
