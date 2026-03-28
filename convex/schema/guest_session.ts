import { v } from "convex/values"

export const GuestSession = v.object({
    guestId: v.string(),
    messageCount: v.number(),
    claimedByUserId: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    lastSeenAt: v.number(),
    ipHash: v.optional(v.string()),
    userAgentHash: v.optional(v.string()),
    status: v.union(v.literal("active"), v.literal("claimed"), v.literal("blocked"))
})
