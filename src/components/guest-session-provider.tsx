import { useGuestSession } from "@/hooks/use-guest-session"
import type { GuestSessionState } from "@/lib/guest-session"
import { createContext, type ReactNode, useContext } from "react"

type GuestSessionContextValue = {
    guestSession: GuestSessionState | null
    guestId: string | null
    isGuest: boolean
    isLoading: boolean
    error: string | null
    refreshGuestSession: () => Promise<GuestSessionState | null>
}

const GuestSessionContext = createContext<GuestSessionContextValue | null>(null)

export function GuestSessionProvider({ children }: { children: ReactNode }) {
    const value = useGuestSession()

    return <GuestSessionContext.Provider value={value}>{children}</GuestSessionContext.Provider>
}

export function useGuestSessionContext() {
    const context = useContext(GuestSessionContext)
    if (!context) {
        throw new Error("useGuestSessionContext must be used within GuestSessionProvider")
    }
    return context
}
