import type { Id } from "@/convex/_generated/dataModel"
import { type UploadedFile, useChatStore } from "@/lib/chat-store"
import type { UIMessageWithChatMetadata } from "@/lib/chat-message-metadata"
import { normalizeCharacterId } from "@/lib/persistence"
import { useModelStore } from "@/lib/model-store"
import type { FileUIPart } from "@ai-sdk/ui-utils"
import type { UIMessage } from "ai"
import { nanoid } from "nanoid"
import { useCallback } from "react"
import { useChatIntegration } from "./use-chat-integration"

export function useChatActions({
    threadId,
    folderId
}: {
    threadId: string | undefined
    folderId?: Id<"projects">
}) {
    const { uploadedFiles, setUploadedFiles, setTargetFromMessageId, setTargetMode } =
        useChatStore()
    const { status, append, stop, messages, setMessages, reload } = useChatIntegration({
        threadId,
        folderId
    })

    const handleInputSubmit = useCallback(
        (inputValue?: string, fileValues?: UploadedFile[]) => {
            if (status === "streaming") {
                stop()
                return
            }

            if (status === "submitted") {
                return
            }

            if (!inputValue || !inputValue.trim()) {
                return
            }

            const finalInput = inputValue
            const finalFiles = fileValues ?? uploadedFiles

            if (!finalInput?.trim() && finalFiles && finalFiles.length === 0) {
                return
            }

            const characterId = normalizeCharacterId(
                useModelStore.getState().selectedCharacterId
            )

            append({
                id: nanoid(),
                role: "user",
                content: inputValue,
                parts: [
                    ...finalFiles.map((file) => {
                        return {
                            type: "file",
                            data: file.key,
                            mimeType: file.fileType
                        } satisfies FileUIPart
                    }),
                    { type: "text", text: inputValue }
                ],
                createdAt: new Date(),
                metadata: { characterId }
            } as unknown as Parameters<typeof append>[0])

            setUploadedFiles([])
        },
        [append, stop, status, uploadedFiles, setUploadedFiles]
    )

    const handleRetry = useCallback(
        (message: UIMessage) => {
            const messageIndex = messages.findIndex((m) => m.id === message.id)
            if (messageIndex === -1) return

            const messagesUpToRetry = messages.slice(0, messageIndex + 1)
            console.log("[CA:handleRetry]", {
                messages,
                messagesUpToRetry: messagesUpToRetry.length,
                messageIndex,
                messageId: message.id
            })
            setMessages(messagesUpToRetry)
            setTargetFromMessageId(undefined)
            setTargetMode("normal")
            reload({
                body: {
                    targetMode: "retry",
                    targetFromMessageId: message.id
                }
            })
        },
        [messages, setMessages, reload]
    )

    const handleEditAndRetry = useCallback(
        (messageId: string, newContent: string) => {
            const messageIndex = messages.findIndex((m) => m.id === messageId)
            if (messageIndex === -1) return

            // Truncate messages and update the edited message
            const messagesUpToEdit = messages.slice(0, messageIndex)
            const characterId = normalizeCharacterId(
                useModelStore.getState().selectedCharacterId
            )

            const prev = messages[messageIndex] as UIMessageWithChatMetadata

            const updatedEditedMessage: UIMessageWithChatMetadata = {
                ...messages[messageIndex],
                content: newContent,
                parts: [{ type: "text" as const, text: newContent }],
                metadata: {
                    ...prev.metadata,
                    characterId
                }
            }

            console.log("alarm:handleEditAndRetry", {
                messagesUpToEdit: messagesUpToEdit.length,
                messageIndex,
                messageId
            })
            setMessages([...messagesUpToEdit, updatedEditedMessage])
            setTargetFromMessageId(undefined)
            setTargetMode("normal")
            reload({
                body: {
                    targetMode: "edit",
                    targetFromMessageId: messageId
                }
            })
        },
        [messages, setMessages, setTargetFromMessageId, reload]
    )

    return {
        handleInputSubmit,
        handleRetry,
        handleEditAndRetry
    }
}
