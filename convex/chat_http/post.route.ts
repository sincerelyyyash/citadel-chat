import type {
    FileUIPart,
    ReasoningUIPart,
    TextUIPart,
    ToolInvocationUIPart
} from "@ai-sdk/ui-utils"

import { ChatError } from "@/lib/errors"
import type { ReasoningEffort } from "@/lib/model-store"
import { createDataStream, smoothStream, streamText } from "ai"
import type { Infer } from "convex/values"
import { internal } from "../_generated/api"
import type { Id } from "../_generated/dataModel"
import { httpAction } from "../_generated/server"
import { dbMessagesToCore } from "../lib/db_to_core_messages"
import { getGuestMessageLimit, getRemainingGuestMessages } from "../lib/guest_sessions"
import { getResumableStreamContext } from "../lib/resumable_stream_context"
import { getToolkit, normalizeClientEnabledTools } from "../lib/toolkit"
import type { HTTPAIMessage } from "../schema/message"
import type { ErrorUIPart } from "../schema/parts"
import { generateThreadName } from "./generate_thread_name"
import { getModel } from "./get_model"
import { manualStreamTransform } from "./manual_stream_transform"
import { buildPrompt } from "./prompt"
import { RESPONSE_OPTS } from "./shared"

export const chatPOST = httpAction(async (ctx, req) => {
    const body: {
        id?: string
        message: Infer<typeof HTTPAIMessage>
        model: string
        characterId?: string
        proposedNewAssistantId: string
        enabledTools: string[]
        targetFromMessageId?: string
        targetMode?: "normal" | "edit" | "retry"
        mcpOverrides?: Record<string, boolean>
        folderId?: Id<"projects">
        reasoningEffort?: ReasoningEffort
        guestId?: string
    } = await req.json()

    if (body.targetFromMessageId && !body.id) {
        return new ChatError("bad_request:chat").toResponse()
    }

    const identity = await ctx.auth.getUserIdentity()
    const guestId = typeof body.guestId === "string" ? body.guestId : undefined

    const user = identity
        ? { id: identity.subject, isGuest: false as const }
        : guestId
          ? { id: "", isGuest: true as const, guestId }
          : null

    if (!user) return new ChatError("unauthorized:chat").toResponse()

    let guestSession:
        | {
              guestId: string
              messageCount: number
              status: "active" | "claimed" | "blocked"
          }
        | null = null

    if (user.isGuest) {
        guestSession = await ctx.runQuery(internal.guestSessions.getGuestSessionByGuestId, {
            guestId: user.guestId
        })

        if (!guestSession) {
            return new ChatError("unauthorized:chat").toResponse()
        }

        if (
            guestSession.status !== "active" ||
            guestSession.messageCount >= getGuestMessageLimit()
        ) {
            return Response.json(
                {
                    code: "guest_limit_reached",
                    message: "Sign in to continue this conversation.",
                    remainingMessages: getRemainingGuestMessages(guestSession.messageCount)
                },
                { status: 429 }
            )
        }
    }

    const mutationResult = await ctx.runMutation(internal.threads.createThreadOrInsertMessages, {
        threadId: body.id as Id<"threads">,
        authorId: user.id,
        ownerType: user.isGuest ? "guest" : "user",
        guestId: user.isGuest ? user.guestId : undefined,
        userMessage: "message" in body ? body.message : undefined,
        proposedNewAssistantId: body.proposedNewAssistantId,
        targetFromMessageId: body.targetFromMessageId,
        targetMode: body.targetMode,
        folderId: user.isGuest ? undefined : body.folderId,
        characterId: body.characterId ?? "tyrion"
    })

    if (mutationResult instanceof ChatError) return mutationResult.toResponse()
    if (!mutationResult) return new ChatError("bad_request:chat").toResponse()

    if (user.isGuest) {
        await ctx.runMutation(internal.guestSessions.incrementGuestMessageCount, {
            guestId: user.guestId
        })
    }

    const dbMessages = await ctx.runQuery(internal.messages.getMessagesByThreadId, {
        threadId: mutationResult.threadId
    })
    const streamId = await ctx.runMutation(internal.streams.appendStreamId, {
        threadId: mutationResult.threadId
    })

    const modelData = await getModel(ctx, body.model)
    if (modelData instanceof ChatError) return modelData.toResponse()
    const { model, modelName } = modelData

    const mapped_messages = await dbMessagesToCore(dbMessages, modelData.abilities)

    const streamStartTime = Date.now()

    const remoteCancel = new AbortController()
    const parts: Array<
        | TextUIPart
        | (ReasoningUIPart & { duration?: number })
        | ToolInvocationUIPart
        | FileUIPart
        | Infer<typeof ErrorUIPart>
    > = []

    const uploadPromises: Promise<void>[] = []
    const settings = await ctx.runQuery(internal.settings.getUserSettingsInternal, {
        userId: user.id
    })

    // Track token usage
    const totalTokenUsage = {
        promptTokens: 0,
        completionTokens: 0,
        reasoningTokens: 0
    }

    const enabledTools = normalizeClientEnabledTools(body.enabledTools)

    const stream = createDataStream({
        execute: async (dataStream) => {
            await ctx.runMutation(internal.threads.updateThreadStreamingState, {
                threadId: mutationResult.threadId,
                isLive: true,
                streamStartedAt: streamStartTime,
                currentStreamId: streamId
            })

            let nameGenerationPromise: Promise<string | ChatError> | undefined
            if (!body.id) {
                nameGenerationPromise = generateThreadName(
                    ctx,
                    mutationResult.threadId,
                    mapped_messages,
                    user.id,
                    settings
                )
            }

            dataStream.writeData({
                type: "thread_id",
                content: mutationResult.threadId
            })

            dataStream.writeData({
                type: "stream_id",
                content: streamId
            })

            dataStream.writeMessageAnnotation({
                type: "model_name",
                content: modelName
            })

            const result = streamText({
                model: model,
                maxSteps: 100,
                abortSignal: remoteCancel.signal,
                experimental_transform: smoothStream(),
                toolCallStreaming: true,
                tools: modelData.abilities.includes("function_calling")
                    ? await getToolkit(ctx, enabledTools, settings)
                    : undefined,
                messages: [
                    {
                        role: "system",
                        content: buildPrompt(enabledTools, body.characterId)
                    } as const,
                    ...mapped_messages
                ]
            })

            dataStream.merge(
                result.fullStream.pipeThrough(
                    manualStreamTransform(
                        parts,
                        totalTokenUsage,
                        mutationResult.assistantMessageId,
                        uploadPromises,
                        user.id,
                        ctx
                    )
                )
            )

            await result.consumeStream()
            await Promise.allSettled(uploadPromises)
            console.log("uploadPromises", uploadPromises)
            console.log("parts", parts)
            remoteCancel.abort()
            console.log()

            await ctx.runMutation(internal.messages.patchMessage, {
                threadId: mutationResult.threadId,
                messageId: mutationResult.assistantMessageId,
                parts:
                    parts.length > 0
                        ? parts
                        : [
                              {
                                  type: "error",
                                  error: {
                                      code: "no-response",
                                      message:
                                          "The model did not generate a response. Please try again."
                                  }
                              }
                          ],
                metadata: {
                    modelId: body.model,
                    modelName,
                    promptTokens: totalTokenUsage.promptTokens,
                    completionTokens: totalTokenUsage.completionTokens,
                    reasoningTokens: totalTokenUsage.reasoningTokens,
                    serverDurationMs: Date.now() - streamStartTime,
                    characterId: body.characterId ?? "tyrion"
                }
            })

            if (nameGenerationPromise) {
                const res = await nameGenerationPromise
                if (res instanceof ChatError) res.toResponse()
            }

            await ctx
                .runMutation(internal.threads.updateThreadStreamingState, {
                    threadId: mutationResult.threadId,
                    isLive: false,
                    currentStreamId: undefined
                })
                .catch((err) => console.error("Failed to update thread state:", err))
        },
        onError: (error) => {
            console.error("[cvx][chat][stream] Fatal error:", error)
            // Mark thread as not live on error
            ctx.runMutation(internal.threads.updateThreadStreamingState, {
                threadId: mutationResult.threadId,
                isLive: false
            }).catch((err) => console.error("Failed to update thread state:", err))
            return "Stream error occurred"
        }
    })

    const streamContext = getResumableStreamContext()
    if (streamContext) {
        return new Response(
            (await streamContext.resumableStream(streamId, () => stream))?.pipeThrough(
                new TextEncoderStream()
            ),
            RESPONSE_OPTS
        )
    }

    return new Response(stream.pipeThrough(new TextEncoderStream()), RESPONSE_OPTS)
})
