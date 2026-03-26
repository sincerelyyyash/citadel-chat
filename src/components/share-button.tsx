import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { captureEvent } from "@/lib/analytics"
import { copyToClipboard } from "@/lib/utils"
import { useAction } from "convex/react"
import { Check, Copy, Share2 } from "lucide-react"
import { useState } from "react"

interface ShareButtonProps {
    threadId: string
}

export function ShareButton({ threadId }: ShareButtonProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [sharedUrl, setSharedUrl] = useState<string | null>(null)
    const [isSharing, setIsSharing] = useState(false)
    const [copied, setCopied] = useState(false)

    const shareThread = useAction(api.threads.shareThread)

    const handleShare = async () => {
        if (sharedUrl) return // Already shared

        setIsSharing(true)
        try {
            const result = await shareThread({
                threadId: threadId as Id<"threads">,
                includeAttachments: false
            })

            if ("error" in result) {
                console.error("Failed to share thread:", result.error)
                return
            }

            const url = `${window.location.origin}/s/${result.sharedThreadId}`
            setSharedUrl(url)
            captureEvent("thread_share_link_created", {
                thread_id: threadId
            })
        } catch (error) {
            console.error("Error sharing thread:", error)
        } finally {
            setIsSharing(false)
        }
    }

    const handleCopy = async () => {
        if (!sharedUrl) return

        await copyToClipboard(sharedUrl)
        captureEvent("thread_share_link_copied", {
            thread_id: threadId
        })
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open)
        if (!open) {
            // Reset state when dialog closes
            setTimeout(() => {
                setSharedUrl(null)
                setCopied(false)
            }, 300)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="size-8 rounded-md">
                    <Share2 className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Share Thread</DialogTitle>
                    <DialogDescription>
                        Create a shareable link to this conversation. Others can view and fork it.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {!sharedUrl ? (
                        <Button onClick={handleShare} disabled={isSharing} className="w-full">
                            {isSharing ? "Creating link..." : "Create shareable link"}
                        </Button>
                    ) : (
                        <div className="space-y-2">
                            <Label htmlFor="share-url">Shareable link</Label>
                            <div className="flex space-x-2">
                                <Input
                                    id="share-url"
                                    value={sharedUrl}
                                    readOnly
                                    className="flex-1"
                                />
                                <Button variant="outline" size="icon" onClick={handleCopy}>
                                    {copied ? (
                                        <Check className="h-4 w-4" />
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                            <p className="text-muted-foreground text-sm">
                                Anyone with this link can view and fork this conversation.
                            </p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
