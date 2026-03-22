import type { ProviderV1 } from "@ai-sdk/provider"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"

import type { ModelAbility } from "../schema/settings"

export type SharedModel<Abilities extends ModelAbility[] = ModelAbility[]> = {
    id: string
    name: string
    shortName?: string
    adapters: string[]
    abilities: Abilities
    mode?: "text" | "speech-to-text"
    contextLength?: number
    maxTokens?: number
    customIcon?: "openai" | "google" | "meta"
    supportsDisablingReasoning?: boolean
}

export const MODELS_SHARED: SharedModel[] = [
    {
        id: "kimi-k2.5",
        name: "Kimi K2.5",
        adapters: ["openrouter:moonshotai/kimi-k2.5"],
        abilities: ["vision", "function_calling", "pdf"],
        contextLength: 262144
    },
    {
        id: "whisper-large-v3-turbo",
        name: "Whisper Large v3 Turbo",
        adapters: ["groq:whisper-large-v3-turbo"],
        abilities: [],
        mode: "speech-to-text"
    }
] as const

export const createProvider = (): Omit<ProviderV1, "textEmbeddingModel"> => {
    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey || apiKey.trim() === "") {
        throw new Error("OPENROUTER_API_KEY environment variable is required")
    }
    return createOpenRouter({ apiKey })
}
