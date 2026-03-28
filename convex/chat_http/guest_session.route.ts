import { internal } from "../_generated/api"
import { httpAction } from "../_generated/server"
import {
    getGuestMessageLimit,
    getRemainingGuestMessages,
    getRequestIp,
    hashGuestSignal
} from "../lib/guest_sessions"

export const guestSessionPOST = httpAction(async (ctx, req) => {
    const body = (await req.json().catch(() => ({}))) as { guestId?: string }

    const providedGuestId =
        typeof body.guestId === "string" && body.guestId.trim() ? body.guestId.trim() : undefined

    const ipHash = await hashGuestSignal(getRequestIp(req))
    const userAgentHash = await hashGuestSignal(req.headers.get("user-agent"))

    const existing = providedGuestId
        ? await ctx.runQuery(internal.guestSessions.getGuestSessionByGuestId, {
              guestId: providedGuestId
          })
        : null

    const session =
        existing ||
        (await ctx.runMutation(internal.guestSessions.upsertGuestSession, {
            guestId: providedGuestId || crypto.randomUUID(),
            ipHash,
            userAgentHash
        }))

    if (!session) {
        return Response.json({ error: "Failed to initialize guest session" }, { status: 500 })
    }

    if (existing) {
        await ctx.runMutation(internal.guestSessions.touchGuestSession, {
            guestId: existing.guestId,
            ipHash,
            userAgentHash
        })
    }

    const remainingMessages = getRemainingGuestMessages(session.messageCount)
    const isBlocked =
        session.status !== "active" || session.messageCount >= getGuestMessageLimit()

    return Response.json({
        guestId: session.guestId,
        remainingMessages,
        isBlocked,
        status: session.status,
        messageCount: session.messageCount
    })
})
