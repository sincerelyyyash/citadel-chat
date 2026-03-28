import { api } from "@/convex/_generated/api"
import { useSession } from "@/hooks/auth-hooks"
import { browserEnv } from "@/lib/browser-env"
import {
    type GuestSessionState,
    getStoredGuestId,
    setStoredGuestId
} from "@/lib/guest-session"
import { clearDiskCache } from "@/lib/convex-cached-query"
import { queryClient } from "@/providers"
import { useMutation } from "convex/react"
import { useCallback, useEffect, useRef, useState } from "react"

async function bootstrapGuestSession(guestId?: string | null): Promise<GuestSessionState> {
    const response = await fetch(`${browserEnv("VITE_CONVEX_API_URL")}/guest-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(guestId ? { guestId } : {})
    })

    if (!response.ok) {
        throw new Error("Failed to initialize guest session")
    }

    return response.json()
}

export function useGuestSession() {
    const { data: session } = useSession()
    const claimGuestThreads = useMutation(api.guestSessions.claimGuestThreads)
    const [guestSession, setGuestSession] = useState<GuestSessionState | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const claimAttemptedRef = useRef<string | null>(null)

    const refreshGuestSession = useCallback(async () => {
        const storedGuestId = getStoredGuestId()
        if (!storedGuestId) {
            setGuestSession(null)
            setIsLoading(false)
            return null
        }

        try {
            setIsLoading(true)
            const nextSession = await bootstrapGuestSession(storedGuestId)
            setStoredGuestId(nextSession.guestId)
            setGuestSession(nextSession)
            setError(null)
            return nextSession
        } catch (nextError) {
            setError(nextError instanceof Error ? nextError.message : "Guest session failed")
            return null
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        let cancelled = false

        const initialize = async () => {
            if (session?.user?.id) {
                setGuestSession(null)
                setIsLoading(false)
                return
            }

            try {
                const nextSession = await bootstrapGuestSession(getStoredGuestId())
                if (cancelled) return
                setStoredGuestId(nextSession.guestId)
                setGuestSession(nextSession)
                setError(null)
            } catch (nextError) {
                if (cancelled) return
                setError(nextError instanceof Error ? nextError.message : "Guest session failed")
            } finally {
                if (!cancelled) {
                    setIsLoading(false)
                }
            }
        }

        initialize()

        return () => {
            cancelled = true
        }
    }, [session?.user?.id])

    useEffect(() => {
        const storedGuestId = getStoredGuestId()
        if (!session?.user?.id || !storedGuestId) return
        if (claimAttemptedRef.current === `${session.user.id}:${storedGuestId}`) return

        claimAttemptedRef.current = `${session.user.id}:${storedGuestId}`

        let active = true

        const claim = async () => {
            try {
                const result = await claimGuestThreads({ guestId: storedGuestId })
                if (!active || !result.success) return

                clearDiskCache()
                await queryClient.invalidateQueries()
            } catch (nextError) {
                console.error("Failed to claim guest threads", nextError)
            }
        }

        claim()

        return () => {
            active = false
        }
    }, [claimGuestThreads, session?.user?.id])

    return {
        guestSession,
        guestId: guestSession?.guestId ?? getStoredGuestId(),
        isGuest: !session?.user?.id,
        isLoading,
        error,
        refreshGuestSession
    }
}
