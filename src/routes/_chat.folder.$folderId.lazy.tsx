import { FolderHero } from "@/components/folder-hero"
import { GuestTrialBanner } from "@/components/guest-trial-banner"
import { Messages } from "@/components/messages"
import { MultimodalInput } from "@/components/multimodal-input"
import { StickToBottomButton } from "@/components/stick-to-bottom-button"
import { useGuestSessionContext } from "@/components/guest-session-provider"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { useSession } from "@/hooks/auth-hooks"
import { useChatActions } from "@/hooks/use-chat-actions"
import { useChatDataProcessor } from "@/hooks/use-chat-data-processor"
import { useChatIntegration } from "@/hooks/use-chat-integration"
import { useDynamicTitle } from "@/hooks/use-dynamic-title"
import { useThreadSync } from "@/hooks/use-thread-sync"
import type { UploadedFile } from "@/lib/chat-store"
import { getChatWidthClass, useChatWidthStore } from "@/lib/chat-width-store"
import { useDiskCachedPaginatedQuery, useDiskCachedQuery } from "@/lib/convex-cached-query"
import { useModelStore } from "@/lib/model-store"
import { cn } from "@/lib/utils"
import { Link } from "@tanstack/react-router"
import { useLocation } from "@tanstack/react-router"
import { createLazyFileRoute } from "@tanstack/react-router"
import { format } from "date-fns"
import { Clock, Pin } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { useEffect, useMemo, useRef } from "react"
import { useStickToBottom } from "use-stick-to-bottom"

interface FolderChatProps {
    folderId: Id<"projects">
}

const FolderChat = ({ folderId }: FolderChatProps) => {
    const { selectedModel, setSelectedModel } = useModelStore()
    const { threadId } = useThreadSync({ routeThreadId: undefined })
    const { scrollToBottom, isAtBottom, contentRef, scrollRef } = useStickToBottom({
        initial: "instant",
        resize: "instant"
    })
    const { data: session } = useSession()
    const { guestSession, guestId, isGuest, refreshGuestSession } = useGuestSessionContext()
    const location = useLocation()

    useDynamicTitle({ threadId })

    useMemo(() => {
        if (!selectedModel) {
            setSelectedModel("kimi-k2.5")
        }
    }, [selectedModel, setSelectedModel])

    const projects = useDiskCachedQuery(
        api.folders.getUserProjects,
        {
            key: "projects",
            default: []
        },
        session?.user?.id ? {} : "skip"
    )
    const project =
        "error" in projects ? null : projects?.find((project) => project._id === folderId)

    const { status, data, messages } = useChatIntegration({
        threadId,
        folderId: session?.user?.id ? folderId : undefined,
        guestId: guestId ?? undefined,
        onGuestStateChange: () => {
            void refreshGuestSession()
        }
    })

    const { handleInputSubmit, handleRetry, handleEditAndRetry } = useChatActions({
        threadId,
        folderId: session?.user?.id ? folderId : undefined,
        guestId: guestId ?? undefined
    })

    useChatDataProcessor({ data, messages })

    const handleInputSubmitWithScroll = (inputValue?: string, fileValues?: UploadedFile[]) => {
        handleInputSubmit(inputValue, fileValues)
        scrollToBottom({ animation: "smooth" })
    }

    const isEmpty = !threadId && messages.length === 0

    // Recent threads component for FolderHero
    const RecentThreads = () => {
        const isRootPath = location.pathname === "/"

        // Fetch recent threads in this folder
        const recentThreads = useDiskCachedPaginatedQuery(
            api.threads.getThreadsByProject,
            {
                key: `threads-folder-${folderId}`,
                maxItems: 25
            },
            { projectId: folderId },
            {
                initialNumItems: 25
            }
        )
        const scrollRef = useRef<HTMLDivElement>(null)

        useEffect(() => {
            const target = scrollRef.current
            if (!target) return

            const observer = new IntersectionObserver(
                (entries) => {
                    const [entry] = entries
                    if (entry.isIntersecting && recentThreads.status === "CanLoadMore") {
                        recentThreads.loadMore(25)
                    }
                },
                {
                    threshold: 0.1,
                    rootMargin: "100px"
                }
            )

            observer.observe(target)

            return () => {
                observer.disconnect()
            }
        }, [recentThreads.status])

        const threads = recentThreads?.results || []

        const containerAnimProps = isRootPath
            ? {
                  initial: { opacity: 0, y: 10 },
                  animate: { opacity: 1, y: 0 },
                  transition: { duration: 0.3, delay: 0.1 }
              }
            : {}

        if (threads.length === 0)
            return (
                <motion.div {...containerAnimProps} className="mt-8 w-full px-1">
                    <div className="mb-4 flex items-center gap-2 font-medium text-muted-foreground text-sm">
                        <Clock className="size-4" />
                        Recent conversations
                    </div>
                    <div className="grid grid-cols-1 gap-1.5 md:grid-cols-2">
                        <div className="col-span-full">
                            <div className="flex items-center justify-center rounded-lg border bg-background/50 px-4 py-3">
                                <p className="text-muted-foreground text-sm">
                                    No recent conversations
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )

        return (
            <motion.div {...containerAnimProps} className="mt-8 w-full px-1">
                <div className="mb-4 flex items-center gap-2 font-medium text-muted-foreground text-sm">
                    <Clock className="size-4" />
                    Recent conversations
                </div>
                <div className="grid grid-cols-1 gap-1.5 md:grid-cols-2">
                    {threads.map((thread, index) => {
                        const threadAnimProps = isRootPath
                            ? {
                                  initial: { opacity: 0, x: -10 },
                                  animate: { opacity: 1, x: 0 },
                                  transition: { duration: 0.2, delay: 0.05 * index }
                              }
                            : {}

                        return (
                            <motion.div key={thread._id} {...threadAnimProps}>
                                <Link
                                    to="/thread/$threadId"
                                    params={{ threadId: thread._id }}
                                    className="flex items-center gap-3 rounded-lg border bg-background/50 px-4 py-3 transition-colors hover:bg-accent/50"
                                >
                                    <div className="min-w-0 flex-1">
                                        <div className="truncate font-medium text-sm">
                                            {thread.title}
                                        </div>
                                        <div className="text-muted-foreground text-xs">
                                            {format(thread.createdAt, "MMM d, yyyy")}
                                        </div>
                                    </div>
                                    {thread.pinned && (
                                        <div className="text-muted-foreground">
                                            <Pin className="h-4 w-4" />
                                        </div>
                                    )}
                                </Link>
                            </motion.div>
                        )
                    })}
                    <div ref={scrollRef} className="col-span-full" />
                </div>
            </motion.div>
        )
    }

    const chatWidth = useChatWidthStore((state) => state.chatWidthState.chatWidth)
    const showGuestBanner = isGuest && Boolean(guestSession)

    return (
        <div
            className={cn(
                "relative flex flex-col",
                isEmpty ? "h-[calc(100dvh-8px)]" : "h-[calc(100dvh-64px)]"
            )}
        >
            <Messages
                messages={messages}
                onRetry={handleRetry}
                onEditAndRetry={handleEditAndRetry}
                status={status}
                contentRef={contentRef}
                scrollRef={scrollRef}
            />

            <AnimatePresence mode="sync">
                {isEmpty ? (
                    <motion.div
                        key="centered-content"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className={cn(
                            "absolute inset-0 flex flex-col items-center overflow-y-auto [scrollbar-gutter:stable]",
                            !isEmpty && "justify-center"
                        )}
                    >
                        <div
                            className={cn(
                                "w-full",
                                getChatWidthClass(chatWidth),
                                "px-4",
                                "flex min-h-[40vh] flex-col justify-end"
                            )}
                        >
                            <FolderHero project={project} />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.2 }}
                                className="mt-8 w-full"
                            >
                                <MultimodalInput
                                    onSubmit={handleInputSubmitWithScroll}
                                    status={status}
                                    disabled={Boolean(guestSession?.isBlocked)}
                                />
                            </motion.div>
                            {showGuestBanner && guestSession ? (
                                <div className="mt-4">
                                    <GuestTrialBanner
                                        remainingMessages={guestSession.remainingMessages}
                                        isBlocked={guestSession.isBlocked}
                                    />
                                </div>
                            ) : null}
                        </div>
                        <div className={cn("w-full", getChatWidthClass(chatWidth), "px-4")}>
                            <RecentThreads />
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="bottom-input"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="-bottom-[3.875rem] md:-bottom-10 absolute inset-x-0 z-[10] flex flex-col items-center justify-center gap-2"
                    >
                        <StickToBottomButton
                            isAtBottom={isAtBottom}
                            scrollToBottom={scrollToBottom}
                        />
                        {showGuestBanner && guestSession ? (
                            <GuestTrialBanner
                                remainingMessages={guestSession.remainingMessages}
                                isBlocked={guestSession.isBlocked}
                            />
                        ) : null}
                        <MultimodalInput
                            onSubmit={handleInputSubmitWithScroll}
                            status={status}
                            disabled={Boolean(guestSession?.isBlocked)}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export const Route = createLazyFileRoute("/_chat/folder/$folderId")({
    component: () => {
        const { folderId } = Route.useParams()
        return <FolderChat folderId={folderId as Id<"projects">} />
    }
})
