const GUEST_MESSAGE_LIMIT = 5

export function getGuestMessageLimit() {
    return GUEST_MESSAGE_LIMIT
}

export function getRemainingGuestMessages(messageCount: number) {
    return Math.max(0, GUEST_MESSAGE_LIMIT - messageCount)
}

export async function hashGuestSignal(value: string | null | undefined) {
    if (!value) return undefined

    const normalized = value.trim().toLowerCase()
    if (!normalized) return undefined

    const salt =
        process.env.GUEST_SESSION_SALT || process.env.BETTER_AUTH_SECRET || "citadel-guest-salt"

    const encoded = new TextEncoder().encode(`${salt}:${normalized}`)
    const digest = await crypto.subtle.digest("SHA-256", encoded)
    return Array.from(new Uint8Array(digest))
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("")
}

export function getRequestIp(req: Request) {
    const forwarded = req.headers.get("x-forwarded-for")
    if (forwarded) {
        return forwarded.split(",")[0]?.trim() || undefined
    }

    return req.headers.get("x-real-ip") || undefined
}
