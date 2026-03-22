import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { api } from "@/convex/_generated/api"
import { cn } from "@/lib/utils"
import { Link } from "@tanstack/react-router"
import { useParams } from "@tanstack/react-router"
import { useMutation } from "convex/react"
import equal from "fast-deep-equal/es6"
import { Edit3, MoreHorizontal, Pin, Trash2 } from "lucide-react"
import { memo, useState } from "react"
import { toast } from "sonner"
import type { Thread } from "./types"

interface ThreadItemProps {
    thread: Thread
    isInFolder?: boolean
    onOpenRenameDialog?: (thread: Thread) => void
    onOpenDeleteDialog?: (thread: Thread) => void
}

export const ThreadItem = memo(
    ({
        thread,
        isInFolder = false,
        onOpenRenameDialog,
        onOpenDeleteDialog
    }: ThreadItemProps) => {
        const [isMenuOpen, setIsMenuOpen] = useState(false)

        const togglePinMutation = useMutation(api.threads.togglePinThread)
        const params = useParams({ strict: false }) as { threadId?: string }
        const isActive = params.threadId === thread._id

        const handleTogglePin = async () => {
            const pinned = thread.pinned
            try {
                await togglePinMutation({ threadId: thread._id })
            } catch (error) {
                console.error("Failed to toggle pin:", error)
                toast.error(`Failed to ${pinned ? "unpin" : "pin"} thread`)
            }
        }

        const handleRename = () => {
            onOpenRenameDialog?.(thread)
        }

        const handleDelete = () => {
            onOpenDeleteDialog?.(thread)
        }

        return (
            <SidebarMenuItem className={isInFolder ? "pl-6" : ""}>
                <div className="group/item flex w-full items-center">
                    <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        className={cn(
                            "flex-1 bg-transparent text-sidebar-foreground/85 transition-colors hover:bg-black/10 hover:text-sidebar-foreground dark:hover:bg-white/10 dark:hover:text-sidebar-foreground",
                            isActive &&
                                "bg-black/14 text-sidebar-foreground dark:bg-white/14 dark:text-sidebar-foreground",
                            isMenuOpen &&
                                !isActive &&
                                "bg-black/8 text-sidebar-foreground dark:bg-white/8"
                        )}
                    >
                        <Link
                            to="/thread/$threadId"
                            params={{ threadId: thread._id }}
                            className="flex items-center justify-between"
                        >
                            <span className="truncate">{thread.title}</span>

                            <DropdownMenu onOpenChange={setIsMenuOpen}>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        type="button"
                                        className={cn(
                                            "rounded p-1 text-sidebar-foreground/70 transition-[opacity,color] hover:text-sidebar-foreground",
                                            isActive && "text-sidebar-foreground/80",
                                            isMenuOpen && !isActive && "text-sidebar-foreground/85",
                                            isMenuOpen || "opacity-0 group-hover/item:opacity-100"
                                        )}
                                    >
                                        <MoreHorizontal className="mr-1 h-4 w-4" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={handleRename}>
                                        <Edit3 className="h-4 w-4" />
                                        Rename
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={handleTogglePin}>
                                        <Pin className="h-4 w-4" />
                                        {thread.pinned ? "Unpin" : "Pin"}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={handleDelete} variant="destructive">
                                        <Trash2 className="h-4 w-4" />
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </Link>
                    </SidebarMenuButton>
                </div>
            </SidebarMenuItem>
        )
    },
    (prevProps, nextProps) => {
        return (
            equal(prevProps.thread, nextProps.thread) &&
            prevProps.isInFolder === nextProps.isInFolder
        )
    }
)

ThreadItem.displayName = "ThreadItem"
