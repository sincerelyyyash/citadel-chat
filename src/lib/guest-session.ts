export const GUEST_ID_STORAGE_KEY = "citadel.guestId"

export interface GuestSessionState {
    guestId: string
    remainingMessages: number
    isBlocked: boolean
    status: "active" | "claimed" | "blocked"
    messageCount: number
}

export function getStoredGuestId() {
    if (typeof window === "undefined") return null
    return localStorage.getItem(GUEST_ID_STORAGE_KEY)
}

export function setStoredGuestId(guestId: string) {
    if (typeof window === "undefined") return
    localStorage.setItem(GUEST_ID_STORAGE_KEY, guestId)
}
