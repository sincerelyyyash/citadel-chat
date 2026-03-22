import { SettingsLayout } from "@/components/settings/settings-layout"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useSession } from "@/hooks/auth-hooks"
import { cn } from "@/lib/utils"
import { Outlet, createLazyFileRoute, useLocation, useNavigate } from "@tanstack/react-router"
import { Link } from "@tanstack/react-router"
import { ArrowLeft, PaintBucket, User } from "lucide-react"
import { type ReactNode, useEffect } from "react"

interface SettingsLayoutProps {
    children?: ReactNode
    title?: string
    description?: string
}

const settingsNavItems = [
    {
        title: "Profile",
        href: "/settings/profile",
        icon: User
    },
    {
        title: "Appearance",
        href: "/settings/appearance",
        icon: PaintBucket
    }
]

export const Route = createLazyFileRoute("/settings")({
    component: SettingsPage
})

const Inner = () => {
    const auth = useSession()

    if (auth.isPending || auth.isLoading) {
        return (
            <SettingsLayout title="Settings" description="Loading your account.">
                <Skeleton className="h-32 w-full rounded-lg" />
            </SettingsLayout>
        )
    }

    if (!auth.user?.id) {
        return (
            <SettingsLayout
                title="Settings"
                description="Sign in to manage your account and preferences."
            >
                <p className="text-muted-foreground text-sm">Sign in to access settings.</p>
            </SettingsLayout>
        )
    }

    return <Outlet />
}

function SettingsPage({ title, description }: SettingsLayoutProps) {
    const location = useLocation()
    const navigate = useNavigate()

    useEffect(() => {
        if (location.pathname === "/settings" || location.pathname === "/settings/") {
            navigate({
                to: "/settings/profile",
                replace: true
            })
        }
    }, [location.pathname, navigate])

    return (
        <div className="flex h-screen flex-col overflow-y-auto bg-background">
            <div className="container mx-auto flex max-w-6xl flex-1 flex-col p-3 pb-6 lg:max-h-dvh lg:overflow-y-hidden lg:p-6">
                {/* Header */}
                <div className="mb-8 max-md:px-2">
                    <div className="mb-6 flex items-center gap-4">
                        <Link to="/">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="gap-2 text-muted-foreground hover:text-foreground"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back
                            </Button>
                        </Link>
                    </div>

                    <div className="space-y-1">
                        <h1 className="font-semibold text-3xl tracking-tight">Settings</h1>
                        <p className="text-muted-foreground">
                            Manage your account preferences and configuration.
                        </p>
                    </div>
                </div>

                <div className="grid w-full grid-cols-1 gap-8 lg:grid-cols-4">
                    {/* Navigation */}
                    <div className="w-full flex-shrink-0 lg:w-64 lg:pr-2">
                        <nav className="w-full space-y-1">
                            {settingsNavItems.map((item) => {
                                const isActive = location.pathname === item.href
                                const Icon = item.icon

                                return (
                                    <Link
                                        key={item.href}
                                        to={item.href}
                                        className={cn(
                                            "flex w-full items-center gap-3 rounded-lg px-3 py-2 font-medium text-sm transition-colors",
                                            isActive
                                                ? "bg-muted text-foreground"
                                                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                        )}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {item.title}
                                    </Link>
                                )
                            })}
                        </nav>
                    </div>

                    {/* Main Content */}
                    <div className="col-span-3 flex-1">
                        <div className="space-y-6 p-0.5 lg:max-h-[calc(100dvh-12rem)] lg:overflow-y-auto">
                            <Inner />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
