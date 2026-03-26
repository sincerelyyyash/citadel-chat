import posthog from "posthog-js"
import { optionalBrowserEnv } from "./browser-env"

type AnalyticsUser = {
    id: string
    email?: string | null
    name?: string | null
}

type AnalyticsProperties = Record<string, string | number | boolean | null | undefined>

function compactProperties(properties: AnalyticsProperties = {}) {
    return Object.fromEntries(Object.entries(properties).filter(([, value]) => value !== undefined))
}

export function isAnalyticsEnabled() {
    return Boolean(optionalBrowserEnv("VITE_POSTHOG_KEY"))
}

export function captureEvent(event: string, properties?: AnalyticsProperties) {
    if (!isAnalyticsEnabled()) return
    posthog.capture(event, compactProperties(properties))
}

export function identifyUser(user: AnalyticsUser) {
    if (!isAnalyticsEnabled() || !user.id) return

    posthog.identify(user.id, compactProperties({
        email: user.email ?? undefined,
        name: user.name ?? undefined
    }))
}

export function resetAnalytics() {
    if (!isAnalyticsEnabled()) return
    posthog.reset()
}
