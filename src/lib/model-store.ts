import type { UserToggleableAbilityId } from "@/convex/lib/toolkit"
import {
    type AIConfig,
    loadAIConfig,
    normalizeCharacterId,
    saveAIConfig
} from "@/lib/persistence"
import { create } from "zustand"
import { persist } from "zustand/middleware"

export type ReasoningEffort = "off" | "low" | "medium" | "high"

export type ModelStore = {
    selectedModel: string | null
    setSelectedModel: (model: string | null) => void

    selectedCharacterId: string | null
    setSelectedCharacterId: (characterId: string | null) => void

    enabledTools: UserToggleableAbilityId[]
    setEnabledTools: (tools: UserToggleableAbilityId[]) => void

    reasoningEffort: ReasoningEffort
    setReasoningEffort: (effort: ReasoningEffort) => void
}

const initialConfig = loadAIConfig()

const persistConfig = (config: Partial<AIConfig>) => {
    const store = useModelStore.getState()
    saveAIConfig({
        selectedModel: config.selectedModel ?? store.selectedModel,
        selectedCharacterId: config.selectedCharacterId ?? store.selectedCharacterId,
        enabledTools: config.enabledTools ?? store.enabledTools,
        reasoningEffort: config.reasoningEffort ?? store.reasoningEffort
    })
}

export const useModelStore = create<ModelStore>()(
    persist(
        (set, get) => ({
            selectedModel: initialConfig.selectedModel,
            selectedCharacterId: initialConfig.selectedCharacterId ?? "tyrion",
            enabledTools: initialConfig.enabledTools,
            reasoningEffort: initialConfig.reasoningEffort as ReasoningEffort,

            setSelectedModel: (model) => {
                if (get().selectedModel !== model) {
                    set({ selectedModel: model })
                    persistConfig({ selectedModel: model })
                }
            },

            setSelectedCharacterId: (characterId) => {
                if (get().selectedCharacterId !== characterId) {
                    set({ selectedCharacterId: characterId })
                    persistConfig({ selectedCharacterId: characterId })
                }
            },

            setEnabledTools: (tools) => {
                const current = get().enabledTools
                const hasChanged =
                    tools.length !== current.length || tools.some((tool, i) => tool !== current[i])
                if (hasChanged) {
                    set({ enabledTools: tools })
                    persistConfig({ enabledTools: tools })
                }
            },

            setReasoningEffort: (effort) => {
                if (get().reasoningEffort !== effort) {
                    set({ reasoningEffort: effort })
                    persistConfig({ reasoningEffort: effort })
                }
            }
        }),
        {
            name: "model-storage",
            onRehydrateStorage: () => (state) => {
                if (!state) return
                const normalized = normalizeCharacterId(state.selectedCharacterId)
                if (normalized !== state.selectedCharacterId) {
                    useModelStore.setState({ selectedCharacterId: normalized })
                    saveAIConfig({ ...loadAIConfig(), selectedCharacterId: normalized })
                }
            }
        }
    )
)
