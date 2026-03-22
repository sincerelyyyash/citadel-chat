import { ThemedChatRouteError } from "@/components/themed-route-states"
import { type ErrorComponentProps, Outlet, createFileRoute, useParams } from "@tanstack/react-router"

import { Header } from "@/components/header"
import { OnboardingProvider } from "@/components/onboarding/onboarding-provider"
import { ThreadsSidebar } from "@/components/threads-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export const Route = createFileRoute("/_chat")({
    component: ChatLayout
})

function ChatLayout() {
    const params = useParams({ strict: false })
    const threadId = params.threadId

    return (
        <OnboardingProvider>
            <SidebarProvider>
                <ThreadsSidebar />
                <SidebarInset>
                    <div
                        className="flex min-h-svh flex-col"
                        style={{
                            backgroundImage: "url(https://t3.chat/images/noise.png)",
                            backgroundRepeat: "repeat",
                            backgroundSize: "auto"
                        }}
                    >
                        <Header threadId={threadId} />
                        <Outlet />
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </OnboardingProvider>
    )
}

export const ChatErrorBoundary = ({ error, reset }: ErrorComponentProps) => {
    const isNotFound = error.message.includes("ArgumentValidationError")

    return (
        <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center px-4 py-10">
            <ThemedChatRouteError error={error} reset={reset} isNotFound={isNotFound} />
        </div>
    )
}
