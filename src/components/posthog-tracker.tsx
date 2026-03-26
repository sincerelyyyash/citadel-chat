import { useSession } from "@/hooks/auth-hooks"
import { captureEvent, identifyUser, isAnalyticsEnabled, resetAnalytics } from "@/lib/analytics"
import { useLocation } from "@tanstack/react-router"
import { useEffect, useRef } from "react"

export function PostHogTracker() {
    const location = useLocation()
    const { data: session, isPending } = useSession()
    const lastPathRef = useRef<string | null>(null)
    const lastUserIdRef = useRef<string | null>(null)

    useEffect(() => {
        if (!isAnalyticsEnabled()) return

        const nextPath = `${location.pathname}${location.search}${location.hash}`
        if (lastPathRef.current === nextPath) return

        lastPathRef.current = nextPath
        captureEvent("$pageview", {
            path: location.pathname,
            search: location.search || undefined,
            hash: location.hash || undefined
        })
    }, [location.hash, location.pathname, location.search])

    useEffect(() => {
        if (!isAnalyticsEnabled() || isPending) return

        const user = session?.user
        if (user?.id) {
            identifyUser({
                id: user.id,
                email: user.email,
                name: user.name
            })
            lastUserIdRef.current = user.id
            return
        }

        if (lastUserIdRef.current) {
            resetAnalytics()
            lastUserIdRef.current = null
        }
    }, [isPending, session?.user])

    return null
}
