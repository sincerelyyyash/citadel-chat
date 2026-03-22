import { Alert, AlertDescription } from "@/components/ui/alert"
import { createFileRoute } from "@tanstack/react-router"
import { ImageOff } from "lucide-react"

export const Route = createFileRoute("/_chat/library")({
    component: LibraryPage
})

function LibraryPage() {
    return (
        <div className="max-h-dvh overflow-y-auto p-4 pt-0">
            <div className="container mx-auto max-w-6xl pt-12 pb-16">
                <div className="mb-8">
                    <h1 className="mb-2 font-bold text-3xl">AI Library</h1>
                    <p className="text-muted-foreground">Attachment-backed media is disabled.</p>
                </div>
                <Alert>
                    <ImageOff className="h-4 w-4" />
                    <AlertDescription>
                        Image library is unavailable because attachment storage was removed.
                    </AlertDescription>
                </Alert>
            </div>
        </div>
    )
}
