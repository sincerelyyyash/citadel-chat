import { v } from "convex/values"
import { internalMutation, internalQuery, mutation, query } from "./_generated/server"
import { getUserIdentity } from "./lib/identity"
import { getRemainingGuestMessages } from "./lib/guest_sessions"

export const getGuestSessionByGuestId = internalQuery({
    args: { guestId: v.string() },
    handler: async ({ db }, { guestId }) => {
        return await db
            .query("guestSessions")
            .withIndex("byGuestId", (q) => q.eq("guestId", guestId))
            .unique()
    }
})

export const upsertGuestSession = internalMutation({
    args: {
        guestId: v.string(),
        ipHash: v.optional(v.string()),
        userAgentHash: v.optional(v.string())
    },
    handler: async ({ db }, { guestId, ipHash, userAgentHash }) => {
        const now = Date.now()
        const existing = await db
            .query("guestSessions")
            .withIndex("byGuestId", (q) => q.eq("guestId", guestId))
            .unique()

        if (!existing) {
            const id = await db.insert("guestSessions", {
                guestId,
                messageCount: 0,
                createdAt: now,
                updatedAt: now,
                lastSeenAt: now,
                ipHash,
                userAgentHash,
                status: "active"
            })

            return await db.get(id)
        }

        await db.patch(existing._id, {
            updatedAt: now,
            lastSeenAt: now,
            ipHash: ipHash ?? existing.ipHash,
            userAgentHash: userAgentHash ?? existing.userAgentHash
        })

        return await db.get(existing._id)
    }
})

export const incrementGuestMessageCount = internalMutation({
    args: { guestId: v.string() },
    handler: async ({ db }, { guestId }) => {
        const session = await db
            .query("guestSessions")
            .withIndex("byGuestId", (q) => q.eq("guestId", guestId))
            .unique()

        if (!session) return null

        await db.patch(session._id, {
            messageCount: session.messageCount + 1,
            updatedAt: Date.now(),
            lastSeenAt: Date.now()
        })

        return await db.get(session._id)
    }
})

export const touchGuestSession = internalMutation({
    args: {
        guestId: v.string(),
        ipHash: v.optional(v.string()),
        userAgentHash: v.optional(v.string())
    },
    handler: async ({ db }, { guestId, ipHash, userAgentHash }) => {
        const session = await db
            .query("guestSessions")
            .withIndex("byGuestId", (q) => q.eq("guestId", guestId))
            .unique()

        if (!session) return null

        await db.patch(session._id, {
            updatedAt: Date.now(),
            lastSeenAt: Date.now(),
            ipHash: ipHash ?? session.ipHash,
            userAgentHash: userAgentHash ?? session.userAgentHash
        })

        return await db.get(session._id)
    }
})

export const getGuestSession = query({
    args: { guestId: v.string() },
    handler: async ({ db }, { guestId }) => {
        const session = await db
            .query("guestSessions")
            .withIndex("byGuestId", (q) => q.eq("guestId", guestId))
            .unique()

        if (!session) {
            return null
        }

        return {
            guestId: session.guestId,
            remainingMessages: getRemainingGuestMessages(session.messageCount),
            isBlocked: session.status !== "active" || session.messageCount >= 5,
            status: session.status,
            messageCount: session.messageCount
        }
    }
})

export const claimGuestThreads = mutation({
    args: { guestId: v.string() },
    handler: async (ctx, { guestId }) => {
        const user = await getUserIdentity(ctx.auth, { allowAnons: false })
        if ("error" in user) return { success: false, error: user.error }

        const session = await ctx.db
            .query("guestSessions")
            .withIndex("byGuestId", (q) => q.eq("guestId", guestId))
            .unique()

        if (!session) {
            return { success: false, error: "Guest session not found" }
        }

        if (session.claimedByUserId && session.claimedByUserId !== user.id) {
            return { success: false, error: "Guest session already claimed" }
        }

        const threads = await ctx.db
            .query("threads")
            .withIndex("byGuestId", (q) => q.eq("guestId", guestId))
            .filter((q) => q.eq(q.field("ownerType"), "guest"))
            .collect()

        for (const thread of threads) {
            await ctx.db.patch(thread._id, {
                ownerType: "user",
                authorId: user.id,
                guestId: undefined,
                updatedAt: Date.now()
            })
        }

        await ctx.db.patch(session._id, {
            claimedByUserId: user.id,
            status: "claimed",
            updatedAt: Date.now(),
            lastSeenAt: Date.now()
        })

        return { success: true, claimedThreadIds: threads.map((thread) => thread._id) }
    }
})
