import { CharacterPicker } from "@/components/character-picker"
import {
    PromptInput,
    PromptInputAction,
    PromptInputActions,
    type PromptInputRef,
    PromptInputTextarea
} from "@/components/prompt-kit/prompt-input"
import { ToolSelectorPopover } from "@/components/tool-selector-popover"
import { Button } from "@/components/ui/button"
import { VoiceRecorder } from "@/components/voice-recorder"
import { useVoiceRecorder } from "@/hooks/use-voice-recorder"
import type { UploadedFile } from "@/lib/chat-store"
import { getChatWidthClass, useChatWidthStore } from "@/lib/chat-width-store"
import { useModelStore } from "@/lib/model-store"
import { cn } from "@/lib/utils"
import type { useChat } from "@ai-sdk/react"
import { useLocation } from "@tanstack/react-router"
import { ArrowUp, Loader2, Mic, Square } from "lucide-react"
import { useEffect, useRef, useState } from "react"

export function MultimodalInput({
    onSubmit,
    status,
    disabled = false
}: {
    onSubmit: (input?: string, files?: UploadedFile[]) => void
    status: ReturnType<typeof useChat>["status"]
    disabled?: boolean
}) {
    const location = useLocation()
    // Extract threadId from URL
    const threadId = location.pathname.includes("/thread/")
        ? location.pathname.split("/thread/")[1]?.split("/")[0]
        : undefined

    const { enabledTools, setEnabledTools, selectedCharacterId, setSelectedCharacterId } =
        useModelStore()
    const { chatWidthState } = useChatWidthStore()

    const isLoading = status === "streaming"
    const promptInputRef = useRef<PromptInputRef>(null)

    // Voice recording state
    const {
        state: voiceState,
        startRecording,
        stopRecording
    } = useVoiceRecorder({
        onTranscript: (text: string) => {
            // Insert transcribed text into the input
            console.log("🎤", promptInputRef.current)
            if (promptInputRef.current) {
                const currentValue = promptInputRef.current.getValue()
                const newValue = currentValue ? `${currentValue} ${text}` : text
                promptInputRef.current.setValue(newValue)
                // Save to localStorage like the existing system does
                localStorage.setItem("user-input", newValue)
                promptInputRef.current.focus()
                // Update our input value state
                setInputValue(newValue)
            }
        }
    })

    const modelSupportsFunctionCalling = true

    useEffect(() => {
        if (!modelSupportsFunctionCalling && enabledTools.includes("web_search")) {
            setEnabledTools(enabledTools.filter((tool) => tool !== "web_search"))
        }
    }, [modelSupportsFunctionCalling, enabledTools, setEnabledTools])

    const handleSubmit = async () => {
        const inputValue = promptInputRef.current?.getValue() || ""

        if (!inputValue.trim()) {
            promptInputRef.current?.focus()
            return
        }
        if (disabled) return

        promptInputRef.current?.clear()
        localStorage.removeItem("user-input")
        setInputValue("") // Update our state too
        onSubmit(inputValue, [])
    }

    // Check if input is empty for mic button display
    const [inputValue, setInputValue] = useState("")
    const isInputEmpty = !inputValue.trim()

    // Listen to input changes by checking the prompt input value periodically
    // This is simpler and avoids accessing internal refs
    useEffect(() => {
        const checkInputValue = () => {
            const value = promptInputRef.current?.getValue() || ""
            setInputValue(value)
        }

        // Check initial value from localStorage
        const initialValue = localStorage.getItem("user-input") || ""
        setInputValue(initialValue)

        // Check periodically for changes
        const interval = setInterval(checkInputValue, 200)
        return () => clearInterval(interval)
    }, [])

    const handleVoiceButtonClick = () => {
        if (voiceState.isRecording) {
            stopRecording()
        } else if (disabled) {
            return
        } else if (isInputEmpty && !isLoading) {
            startRecording()
        } else {
            handleSubmit()
        }
    }

    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        setIsClient(true)
    }, [])

    useEffect(() => {
        if (location.pathname.includes("/thread/")) {
            const timer = setTimeout(() => {
                promptInputRef.current?.focus()
            }, 100)
            return () => clearTimeout(timer)
        }
    }, [location.pathname])

    if (!isClient) return null

    return (
        <>
            {(voiceState.isRecording || voiceState.isTranscribing) && (
                <div className="@container w-full md:px-2">
                    <VoiceRecorder
                        state={voiceState}
                        onStop={stopRecording}
                        className={cn(
                            "mx-auto w-full",
                            getChatWidthClass(chatWidthState.chatWidth)
                        )}
                    />
                </div>
            )}

            <div
                className={cn(
                    "@container w-full px-1",
                    (voiceState.isRecording || voiceState.isTranscribing) && "hidden"
                )}
            >
                <PromptInput
                    ref={promptInputRef}
                    onSubmit={handleSubmit}
                    disabled={disabled}
                    className={cn("mx-auto w-full", getChatWidthClass(chatWidthState.chatWidth))}
                >
                    <PromptInputTextarea autoFocus placeholder="Ask about the realm..." />

                    <PromptInputActions className="flex items-center justify-between gap-2 pt-2">
                        <div className="flex items-center gap-2">
                            <CharacterPicker
                                selectedCharacterId={selectedCharacterId ?? "tyrion"}
                                onCharacterChange={setSelectedCharacterId}
                            />

                            <PromptInputAction tooltip="Tools">
                                <ToolSelectorPopover
                                    threadId={threadId}
                                    enabledTools={enabledTools}
                                    onEnabledToolsChange={setEnabledTools}
                                    modelSupportsFunctionCalling={modelSupportsFunctionCalling}
                                />
                            </PromptInputAction>
                        </div>

                        <PromptInputAction
                            tooltip={
                                isInputEmpty && !isLoading
                                    ? "Voice input"
                                    : isLoading
                                      ? "Stop generation"
                                      : "Send message"
                            }
                        >
                            <Button
                                variant="default"
                                size="icon"
                                className="size-8 shrink-0 rounded-md"
                                disabled={status === "submitted" || disabled}
                                onClick={handleVoiceButtonClick}
                                type="submit"
                            >
                                {isLoading ? (
                                    <Square className="size-5 fill-current" />
                                ) : status === "submitted" ? (
                                    <Loader2 className="size-5 animate-spin text-primary-foreground" />
                                ) : isInputEmpty ? (
                                    <Mic className="size-5" />
                                ) : (
                                    <ArrowUp className="size-5" />
                                )}
                            </Button>
                        </PromptInputAction>
                    </PromptInputActions>
                </PromptInput>
            </div>
        </>
    )
}
