import { type Infer, v } from "convex/values"

const ModelAbilitySchema = v.union(
    v.literal("reasoning"),
    v.literal("vision"),
    v.literal("function_calling"),
    v.literal("pdf"),
    v.literal("effort_control")
)
export type ModelAbility = Infer<typeof ModelAbilitySchema>

export const NonSensitiveUserSettings = v.object({
    userId: v.string(),
    titleGenerationModel: v.string(),
    customThemes: v.optional(v.array(v.string())),
    onboardingCompleted: v.optional(v.boolean())
})

export const GeneralProviderConfig = v.object({
    enabled: v.boolean(),
    encryptedKey: v.string()
})

export const BraveProviderConfig = v.object({
    enabled: v.boolean(),
    encryptedKey: v.string(),
    country: v.optional(v.string()),
    searchLang: v.optional(v.string()),
    safesearch: v.optional(v.union(v.literal("off"), v.literal("moderate"), v.literal("strict")))
})

export const SerperProviderConfig = v.object({
    enabled: v.boolean(),
    encryptedKey: v.string(),
    language: v.optional(v.string()), // language
    country: v.optional(v.string()) // country
})

export const UserSettings = v.object({
    ...NonSensitiveUserSettings.fields,
    generalProviders: v.object({
        supermemory: v.optional(GeneralProviderConfig)
    })
})
