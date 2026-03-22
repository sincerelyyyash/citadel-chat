import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import type { ErrorComponentProps } from "@tanstack/react-router"
import { Link } from "@tanstack/react-router"
import { BookOpen, Home, RefreshCw } from "lucide-react"

export const ThemedGlobalNotFound = () => {
    return (
        <div
            className="flex min-h-dvh flex-col items-center justify-center bg-background px-4 py-12 text-foreground antialiased"
            role="alert"
            aria-labelledby="global-not-found-title"
        >
            <Card className="w-full max-w-md border-border bg-card text-card-foreground shadow-md">
                <CardHeader className="space-y-2 text-center">
                    <p className="font-medium text-primary text-xs uppercase tracking-[0.2em]">
                        Lost in the Citadel
                    </p>
                    <CardTitle
                        id="global-not-found-title"
                        className="font-serif text-5xl text-foreground tabular-nums sm:text-6xl"
                    >
                        404
                    </CardTitle>
                    <CardDescription className="text-base text-muted-foreground">
                        This chamber has no door — the page you seek isn&apos;t here.
                    </CardDescription>
                </CardHeader>
                <CardFooter className="flex flex-col gap-2 border-border/60 border-t pt-6 sm:flex-row sm:justify-center">
                    <Button asChild className="w-full sm:w-auto">
                        <Link to="/" aria-label="Return to home">
                            <Home className="size-4 shrink-0" aria-hidden />
                            Return home
                        </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full sm:w-auto">
                        <Link to="/library" aria-label="Open chat library">
                            <BookOpen className="size-4 shrink-0" aria-hidden />
                            Library
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}

export const ThemedRouterError = ({ error, reset }: ErrorComponentProps) => {
    const handleRetry = () => {
        reset()
    }

    return (
        <div
            className="flex min-h-dvh flex-col items-center justify-center bg-background px-4 py-12 text-foreground antialiased"
            role="alert"
            aria-labelledby="router-error-title"
        >
            <Card className="w-full max-w-md border-destructive/30 bg-card text-card-foreground shadow-md dark:border-destructive/40">
                <CardHeader className="space-y-2 text-center">
                    <p className="font-medium text-destructive text-xs uppercase tracking-[0.2em]">
                        Error
                    </p>
                    <CardTitle id="router-error-title" className="text-xl text-foreground">
                        Something went wrong
                    </CardTitle>
                    <CardDescription className="text-base text-muted-foreground">
                        The archivists dropped a scroll. Try again, or return whence you came.
                    </CardDescription>
                </CardHeader>
                {import.meta.env.DEV ? (
                    <CardContent>
                        <pre
                            className="max-h-36 overflow-auto rounded-lg border border-border bg-muted/60 p-3 text-left text-muted-foreground text-xs leading-relaxed"
                            tabIndex={0}
                        >
                            {error.message}
                        </pre>
                    </CardContent>
                ) : null}
                <CardFooter className="flex flex-col gap-2 border-border/60 border-t pt-6 sm:flex-row sm:justify-center">
                    <Button
                        type="button"
                        className="w-full sm:w-auto"
                        onClick={handleRetry}
                        aria-label="Try loading the page again"
                    >
                        <RefreshCw className="size-4 shrink-0" aria-hidden />
                        Try again
                    </Button>
                    <Button asChild variant="outline" className="w-full sm:w-auto">
                        <Link to="/" aria-label="Return to home">
                            <Home className="size-4 shrink-0" aria-hidden />
                            Home
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}

type ThemedChatRouteErrorProps = ErrorComponentProps & {
    isNotFound: boolean
}

export const ThemedChatRouteError = ({ error, reset, isNotFound }: ThemedChatRouteErrorProps) => {
    const handleRetry = () => {
        reset()
    }

    if (isNotFound) {
        return (
            <Card
                className="w-full max-w-md border-border/90 bg-card/95 text-card-foreground shadow-md backdrop-blur-sm"
                role="alert"
                aria-labelledby="chat-not-found-title"
            >
                <CardHeader className="space-y-2 text-center">
                    <p className="font-medium text-primary text-xs uppercase tracking-[0.2em]">
                        Not found
                    </p>
                    <CardTitle id="chat-not-found-title" className="font-serif text-4xl text-foreground">
                        404
                    </CardTitle>
                    <CardDescription className="text-base text-muted-foreground">
                        This thread is gone — burned, sealed, or never written.
                    </CardDescription>
                </CardHeader>
                <CardFooter className="flex flex-col gap-2 border-border/60 border-t pt-6 sm:flex-row sm:justify-center">
                    <Button asChild className="w-full sm:w-auto">
                        <Link to="/library" aria-label="Open your chat library">
                            <BookOpen className="size-4 shrink-0" aria-hidden />
                            Open library
                        </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full sm:w-auto">
                        <Link to="/" aria-label="Return to home">
                            <Home className="size-4 shrink-0" aria-hidden />
                            Home
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        )
    }

    return (
        <Card
            className="w-full max-w-md border-destructive/30 bg-card/95 text-card-foreground shadow-md backdrop-blur-sm dark:border-destructive/40"
            role="alert"
            aria-labelledby="chat-error-title"
        >
            <CardHeader className="space-y-2 text-center">
                <p className="font-medium text-destructive text-xs uppercase tracking-[0.2em]">
                    Error
                </p>
                <CardTitle id="chat-error-title" className="text-xl text-foreground">
                    Something went wrong
                </CardTitle>
                <CardDescription className="text-base text-muted-foreground">
                    We couldn&apos;t load this view. You can retry or head back to safety.
                </CardDescription>
            </CardHeader>
            {import.meta.env.DEV ? (
                <CardContent>
                    <pre
                        className="max-h-32 overflow-auto rounded-lg border border-border bg-muted/60 p-3 text-left text-muted-foreground text-xs leading-relaxed"
                        tabIndex={0}
                    >
                        {error.message}
                    </pre>
                </CardContent>
            ) : null}
            <CardFooter className="flex flex-col gap-2 border-border/60 border-t pt-6 sm:flex-row sm:justify-center">
                <Button
                    type="button"
                    className="w-full sm:w-auto"
                    onClick={handleRetry}
                    aria-label="Try loading this view again"
                >
                    <RefreshCw className="size-4 shrink-0" aria-hidden />
                    Try again
                </Button>
                <Button asChild variant="outline" className="w-full sm:w-auto">
                    <Link to="/library" aria-label="Open your chat library">
                        <BookOpen className="size-4 shrink-0" aria-hidden />
                        Library
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    )
}
