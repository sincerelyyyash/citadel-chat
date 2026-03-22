import { ChatError } from "@/lib/errors"
import { type Infer, v } from "convex/values"
import type { Id } from "./_generated/dataModel"
import { type QueryCtx, internalQuery, mutation, query } from "./_generated/server"
import { decryptKey } from "./lib/encryption"
import { getUserIdentity } from "./lib/identity"
import { MODELS_SHARED, type SharedModel } from "./lib/models"
import type { UserSettings } from "./schema"

export const DefaultSettings = (userId: string) =>
    ({
        userId,
        titleGenerationModel: "kimi-k2.5",
        customThemes: [],
        generalProviders: {
            supermemory: undefined
        },
        onboardingCompleted: false
    }) satisfies Infer<typeof UserSettings>

const getSettings = async (
    ctx: QueryCtx,
    userId: string
): Promise<Infer<typeof UserSettings> & { _id?: Id<"settings"> }> => {
    const settings = await ctx.db
        .query("settings")
        .withIndex("byUser", (q) => q.eq("userId", userId))
        .first()

    if (!settings) {
        return DefaultSettings(userId)
    }
    return settings
}
export const getUserSettingsInternal = internalQuery({
    args: {
        userId: v.string()
    },
    handler: async (ctx, args): Promise<Infer<typeof UserSettings>> => {
        return await getSettings(ctx, args.userId)
    }
})

export const getUserSettings = query({
    args: {},
    handler: async (ctx): Promise<Infer<typeof UserSettings> | { error: string }> => {
        const user = await getUserIdentity(ctx.auth, { allowAnons: false })
        if ("error" in user) return { error: "unauthorized:api" }
        return await getSettings(ctx, user.id)
    }
})

export const getUserRegistryInternal = internalQuery({
    args: {
        userId: v.string()
    },
    handler: async (ctx, args) => {
        const settings = await getSettings(ctx, args.userId)

        // All models are available through OpenRouter (server-side key)
        const models: Record<string, SharedModel> = {}
        for (const model of MODELS_SHARED) {
            models[model.id] = {
                id: model.id,
                name: model.name,
                adapters: model.adapters,
                abilities: model.abilities,
                mode: model.mode
            }
        }

        return { providers: {}, models, settings }
    }
})

export const updateUserSettingsPartial = mutation({
    args: {
        titleGenerationModel: v.optional(v.string()),
        addTheme: v.optional(v.string()),
        removeTheme: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        const user = await getUserIdentity(ctx.auth, { allowAnons: false })
        if ("error" in user) throw new ChatError("unauthorized:api")

        const settings = await getSettings(ctx, user.id)
        const newSettings: Infer<typeof UserSettings> = { ...settings }

        if (args.titleGenerationModel !== undefined) {
            newSettings.titleGenerationModel = args.titleGenerationModel
        }

        // Handle theme updates
        if (args.addTheme) {
            const existingThemes = newSettings.customThemes || []
            if (!existingThemes.includes(args.addTheme) && existingThemes.length < 5) {
                newSettings.customThemes = [...existingThemes, args.addTheme]
            }
        }
        if (args.removeTheme) {
            const existingThemes = newSettings.customThemes || []
            newSettings.customThemes = existingThemes.filter((t) => t !== args.removeTheme)
        }

        // Save settings
        if (settings._id) {
            await ctx.db.patch(settings._id, newSettings)
        } else {
            await ctx.db.insert("settings", newSettings)
        }
    }
})

export const addUserTheme = mutation({
    args: {
        url: v.string()
    },
    handler: async (ctx, args) => {
        const user = await getUserIdentity(ctx.auth, { allowAnons: false })
        if ("error" in user) throw new Error("Unauthorized")
        const settings = await getSettings(ctx, user.id)
        const existingThemes = settings.customThemes ?? []

        if (existingThemes.includes(args.url)) return
        if (existingThemes.length >= 5) throw new Error("Maximum number of themes reached")

        const newSettings: Infer<typeof UserSettings> = {
            ...settings,
            customThemes: [...existingThemes, args.url]
        }

        if (settings._id) {
            await ctx.db.patch(settings._id, newSettings)
        } else {
            await ctx.db.insert("settings", newSettings)
        }
    }
})

export const deleteUserTheme = mutation({
    args: {
        url: v.string()
    },
    handler: async (ctx, args) => {
        const user = await getUserIdentity(ctx.auth, { allowAnons: false })
        if ("error" in user) throw new Error("Unauthorized")
        const settings = await getSettings(ctx, user.id)

        const existingThemes = settings.customThemes ?? []
        const updatedThemes = existingThemes.filter((t) => t !== args.url)

        const newSettings: Infer<typeof UserSettings> = {
            ...settings,
            customThemes: updatedThemes
        }

        if (settings._id) {
            await ctx.db.patch(settings._id, newSettings)
        } else {
            await ctx.db.insert("settings", newSettings)
        }
    }
})

export const getSupermemoryKey = internalQuery({
    args: {
        userId: v.string()
    },
    handler: async (ctx, args): Promise<string | null> => {
        const settings = await getSettings(ctx, args.userId)

        if (
            !settings.generalProviders?.supermemory?.enabled ||
            !settings.generalProviders?.supermemory.encryptedKey
        ) {
            return null
        }

        try {
            return await decryptKey(settings.generalProviders?.supermemory.encryptedKey)
        } catch (error) {
            console.error("Failed to decrypt supermemory key:", error)
            return null
        }
    }
})

export const getDecryptedGeneralProviderKey = internalQuery({
    args: {
        providerId: v.string(),
        userId: v.string()
    },
    handler: async (ctx, args): Promise<string | null> => {
        const settings = await getSettings(ctx, args.userId)

        const providerConfig =
            settings.generalProviders?.[args.providerId as keyof typeof settings.generalProviders]

        if (!providerConfig?.enabled || !providerConfig.encryptedKey) {
            return null
        }

        try {
            return await decryptKey(providerConfig.encryptedKey)
        } catch (error) {
            console.error(`Failed to decrypt ${args.providerId} key:`, error)
            return null
        }
    }
})

export const getOnboardingStatus = query({
    args: {},
    handler: async (ctx): Promise<{ shouldShowOnboarding: boolean } | { error: string }> => {
        const user = await getUserIdentity(ctx.auth, { allowAnons: false })
        if ("error" in user) return { error: "unauthorized:api" }

        const settings = await getSettings(ctx, user.id)

        // Show onboarding if onboardingCompleted is false or undefined
        return { shouldShowOnboarding: !settings.onboardingCompleted }
    }
})

export const completeOnboarding = mutation({
    args: {},
    handler: async (ctx) => {
        const user = await getUserIdentity(ctx.auth, { allowAnons: false })
        if ("error" in user) throw new ChatError("unauthorized:api")

        const settings = await getSettings(ctx, user.id)

        const newSettings: Infer<typeof UserSettings> = {
            ...settings,
            onboardingCompleted: true
        }

        if (settings._id) {
            await ctx.db.patch(settings._id, newSettings)
        } else {
            await ctx.db.insert("settings", newSettings)
        }
    }
})
