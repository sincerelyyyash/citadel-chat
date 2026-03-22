import { ChatError } from "@/lib/errors"
import type { LanguageModelV1 } from "@ai-sdk/provider"
import { internal } from "../_generated/api"
import type { ActionCtx } from "../_generated/server"
import { getUserIdentity } from "../lib/identity"
import { createProvider } from "../lib/models"

export const getModel = async (ctx: ActionCtx, modelId: string) => {
    const user = await getUserIdentity(ctx.auth, { allowAnons: false })
    if ("error" in user) throw new ChatError("unauthorized:chat")

    const registry = await ctx.runQuery(internal.settings.getUserRegistryInternal, {
        userId: user.id
    })

    if (!(modelId in registry.models)) return new ChatError("bad_model:api")

    const model = registry.models[modelId]
    if (!model) return new ChatError("bad_model:api")
    if (!model.adapters.length) return new ChatError("bad_model:api", "No adapters found for model")

    const adapter = model.adapters[0]
    const providerSpecificModelId = adapter.split(":")[1]

    const sdk_provider = createProvider()
    const finalModel = sdk_provider.languageModel(providerSpecificModelId)

    Object.assign(finalModel, { modelType: "text" })

    return {
        model: finalModel as LanguageModelV1 & { modelType: "text" },
        abilities: model.abilities,
        registry,
        modelId: model.id,
        modelName: model.name ?? model.id
    }
}
