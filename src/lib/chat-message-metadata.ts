import type { UIMessage } from "ai"

/** Convex / UI message metadata (extends beyond AI SDK typings). */
export type ChatMessageMetadata = {
    characterId?: string
    modelId?: string
    modelName?: string
    promptTokens?: number
    completionTokens?: number
    reasoningTokens?: number
    serverDurationMs?: number
}

export type UIMessageWithChatMetadata = UIMessage & {
    metadata?: ChatMessageMetadata
}

export const asMessageWithMetadata = (message: UIMessage): UIMessageWithChatMetadata =>
    message as UIMessageWithChatMetadata
