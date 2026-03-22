import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { api } from "@/convex/_generated/api"
import { useNavigate, useParams } from "@tanstack/react-router"
import { useMutation } from "convex/react"
import { Loader2 } from "lucide-react"
import { memo, useEffect, useState } from "react"
import { toast } from "sonner"
import type { Thread } from "./types"

interface ThreadItemDialogsProps {
    // Dialog state
    showDeleteDialog: boolean
    showRenameDialog: boolean

    // Dialog control
    onCloseDeleteDialog: () => void
    onCloseRenameDialog: () => void

    // Current thread
    currentThread: Thread | null
}

export const ThreadItemDialogs = memo(
    ({
        showDeleteDialog,
        showRenameDialog,
        onCloseDeleteDialog,
        onCloseRenameDialog,
        currentThread
    }: ThreadItemDialogsProps) => {
        const [renameValue, setRenameValue] = useState("")
        const [isRenaming, setIsRenaming] = useState(false)

        const deleteThreadMutation = useMutation(api.threads.deleteThread)
        const renameThreadMutation = useMutation(api.threads.renameThread)

        const params = useParams({ strict: false }) as { threadId?: string }
        const navigate = useNavigate()

        // Reset states when dialogs close or thread changes
        useEffect(() => {
            if (!showRenameDialog) {
                setRenameValue("")
                setIsRenaming(false)
            }
        }, [showRenameDialog])

        // Initialize rename value when dialog opens
        useEffect(() => {
            if (showRenameDialog && currentThread) {
                setRenameValue(currentThread.title)
            }
        }, [showRenameDialog, currentThread])

        const handleDelete = async () => {
            if (!currentThread) return

            try {
                const isActive = params.threadId === currentThread._id
                if (isActive) {
                    navigate({ to: "/", replace: true })
                }
                await deleteThreadMutation({ threadId: currentThread._id })
                onCloseDeleteDialog()
                toast.success("Thread deleted successfully")
            } catch (error) {
                console.error("Failed to delete thread:", error)
                toast.error("Failed to delete thread")
            }
        }

        const handleRename = async () => {
            if (!currentThread) return

            const trimmedValue = renameValue.trim()
            if (!trimmedValue) {
                toast.error("Thread name cannot be empty")
                return
            }

            if (trimmedValue === currentThread.title) {
                onCloseRenameDialog()
                return
            }

            setIsRenaming(true)
            try {
                const result = await renameThreadMutation({
                    threadId: currentThread._id,
                    title: trimmedValue
                })

                if (result && "error" in result) {
                    toast.error(
                        typeof result.error === "string" ? result.error : "Failed to rename thread"
                    )
                } else {
                    toast.success("Thread renamed successfully")
                    onCloseRenameDialog()
                }
            } catch (error) {
                console.error("Failed to rename thread:", error)
                toast.error("Failed to rename thread")
            } finally {
                setIsRenaming(false)
            }
        }

        return (
            <>
                {/* Rename Dialog */}
                <Dialog
                    open={showRenameDialog}
                    onOpenChange={(open) => {
                        if (!isRenaming && !open) {
                            onCloseRenameDialog()
                        }
                    }}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Rename Thread</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <Input
                                value={renameValue}
                                onChange={(e) => setRenameValue(e.target.value)}
                                placeholder="Enter thread name"
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !isRenaming) {
                                        handleRename()
                                    } else if (e.key === "Escape" && !isRenaming) {
                                        onCloseRenameDialog()
                                    }
                                }}
                                disabled={isRenaming}
                            />
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={onCloseRenameDialog}
                                disabled={isRenaming}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleRename}
                                disabled={isRenaming || !renameValue.trim()}
                            >
                                {isRenaming ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                        Renaming...
                                    </>
                                ) : (
                                    "Rename"
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Delete Dialog */}
                <AlertDialog
                    open={showDeleteDialog}
                    onOpenChange={(open) => {
                        if (!open) onCloseDeleteDialog()
                    }}
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Thread</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to delete{" "}
                                <span className="font-bold">{currentThread?.title?.trim()}</span>?{" "}
                                <br /> This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDelete}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </>
        )
    }
)

ThreadItemDialogs.displayName = "ThreadItemDialogs"
