import { MODELS_SHARED, type SharedModel } from "@/convex/lib/models"
import type { ModelAbility } from "@/convex/schema/settings"
import { Brain, Code, Eye, File, Globe, Key } from "lucide-react"

export type DisplayModel = SharedModel

/** Placeholder metadata for future Exa wiring (no Tavily backend in repo). */
export type SearchProviderInfo = {
    id: "exa"
    name: string
    description: string
    placeholder: string
    icon: React.ComponentType<{ className?: string }> | string
}

export const SEARCH_PROVIDERS: SearchProviderInfo[] = [
    {
        id: "exa",
        name: "Exa",
        description: "Neural web search (integrate via Convex tool; see docs/EXA_INTEGRATION_PROMPT.md)",
        placeholder: "exa-...",
        icon: Globe
    }
]

export function useAvailableModels() {
    // All models are always available (served via OpenRouter with server key)
    const availableModels: DisplayModel[] = MODELS_SHARED.filter((m) => m.mode !== "speech-to-text")
    const unavailableModels: DisplayModel[] = []

    return { availableModels, unavailableModels }
}

export const getAbilityIcon = (ability: ModelAbility) => {
    switch (ability) {
        case "vision":
            return Eye
        case "reasoning":
            return Brain
        case "function_calling":
            return Code
        case "pdf":
            return File
        default:
            return Key
    }
}

export const getAbilityLabel = (ability: ModelAbility) => {
    switch (ability) {
        case "function_calling":
            return "Function Calling"
        case "vision":
            return "Vision"
        case "reasoning":
            return "Reasoning"
        case "pdf":
            return "PDF"
        default:
            return ability
    }
}
