"use client"
import { HouseBrandMark } from "@/components/house-brand-mark"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import {
    ArrowLeft,
    ArrowRight,
    Bot,
    Key,
    Search,
    Sparkles,
    Zap
} from "lucide-react"
import { AnimatePresence, MotionConfig, motion } from "motion/react"
import { useCallback, useState } from "react"

interface OnboardingStep {
    id: string
    title: string
    content: React.ReactNode
    icon: React.ComponentType<{ className?: string }>
}

interface OnboardingDialogProps {
    isOpen: boolean
    onComplete: () => void
}

const ONBOARDING_STEPS: OnboardingStep[] = [
    {
        id: "welcome",
        title: "Welcome to Citadel",
        icon: Sparkles,
        content: (
            <div className="flex flex-col items-center space-y-4 text-center">
                <HouseBrandMark
                    className="mx-auto"
                    iconClassName="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-primary/20 bg-muted/30"
                    sizePreset="sidebar"
                />
                <div className="text-center">
                    <h3 className="font-bold text-2xl text-foreground">Welcome to Citadel</h3>
                    <span className="text-muted-foreground text-sm">
                        The ASOIAF companion built for lore readers, theorists, and maesters.
                    </span>
                </div>
            </div>
        )
    },
    {
        id: "models",
        title: "Character-first conversations",
        icon: Key,
        content: (
            <div className="space-y-6">
                <Card className="border-border/60 bg-muted/25 p-4 shadow-none backdrop-blur-sm">
                    <div className="flex items-start gap-3">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                            <Bot className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm">Thoughtful, immersive replies</h4>
                            <p className="mt-0.5 text-muted-foreground text-xs">
                                Built for rich lore discussions, long-form answers, and seamless
                                character-driven chats inside Citadel.
                            </p>
                        </div>
                    </div>
                </Card>
                <div className="space-y-3">
                    <h3 className="font-semibold text-xl tracking-tight">Choose Your Voice</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        Pick a character from Westeros and the AI will respond in their voice —
                        Tyrion's wit, Cersei's cunning, or Jon's honor. Switch characters anytime.
                    </p>
                </div>
            </div>
        )
    },
    {
        id: "search",
        title: "Book lore & web",
        icon: Search,
        content: (
            <div className="space-y-6">
                <Card className="border-border/60 bg-muted/25 p-4 shadow-none backdrop-blur-sm">
                    <div className="flex items-start space-x-3">
                        <Search className="mt-0.5 h-5 w-5 text-primary" />
                        <div className="space-y-2">
                            <div className="font-medium text-sm">
                                "Tell me about the Red Wedding"
                            </div>
                            <div className="flex flex-wrap gap-1">
                                <Badge variant="secondary" className="text-xs">
                                    Book lore (always on)
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                    Web (optional)
                                </Badge>
                            </div>
                        </div>
                    </div>
                </Card>
                <div className="space-y-3">
                    <h3 className="font-semibold text-xl tracking-tight">Grounded in the Books</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        Book lore search is always available to ground answers in canon. You can
                        optionally turn on web search for Winds of Winter news and fan theories.
                    </p>
                </div>
            </div>
        )
    },
    {
        id: "integrations",
        title: "Powerful Integrations",
        icon: Zap,
        content: (
            <div className="space-y-6">
                <div className="grid grid-cols-1 gap-2">
                    <Card className="border-border/60 bg-muted/25 p-4 shadow-none backdrop-blur-sm">
                        <div className="flex items-start space-x-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                <Bot className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 space-y-1">
                                <div className="font-medium text-sm">Supermemory AI Memory</div>
                                <div className="text-muted-foreground text-xs leading-relaxed">
                                    Add persistent memory across conversations (BYOK)
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
                <div className="space-y-3">
                    <h3 className="font-semibold text-xl tracking-tight">Powerful Integrations</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        Citadel comes built-in with powerful connectors to enhance your AI
                        experience.
                    </p>
                </div>
            </div>
        )
    },
    {
        id: "ready",
        title: "Ready to Get Started?",
        icon: Sparkles,
        content: (
            <div className="flex w-full flex-col items-start space-y-4 text-left">
                <div className="w-full space-y-1">
                    <h3 className="font-bold text-2xl text-foreground tracking-tight">
                        You're all set!
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        Start chatting with AI and make Citadel truly yours!
                    </p>
                </div>
            </div>
        )
    }
]

export function OnboardingDialog({ isOpen, onComplete }: OnboardingDialogProps) {
    const [currentStep, setCurrentStep] = useState(0)
    const currentStepData = ONBOARDING_STEPS[currentStep]

    const handleNext = useCallback(() => {
        if (currentStep < ONBOARDING_STEPS.length - 1) {
            setCurrentStep(currentStep + 1)
        } else {
            onComplete()
        }
    }, [currentStep, onComplete])

    const handlePrevious = useCallback(() => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1)
        }
    }, [currentStep])

    return (
        <Dialog open={isOpen} onOpenChange={() => {}}>
            <DialogContent
                className="w-[95vw] max-w-2xl border-0 bg-transparent p-0 shadow-none sm:w-full"
                showCloseButton={false}
            >
                <MotionConfig
                    transition={{
                        type: "spring",
                        duration: 0.4,
                        bounce: 0.1
                    }}
                >
                    <Card className="inset-shadow-sm w-full max-w-none overflow-hidden border border-border/70 bg-background/95 pt-3 pb-5 shadow-2xl backdrop-blur-md">
                        <div className="relative overflow-hidden">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentStep}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                >
                                    <CardContent className="flex flex-col items-center px-4 py-4 sm:px-6">
                                        <div className="flex w-full max-w-lg justify-center">
                                            {currentStepData.content}
                                        </div>
                                    </CardContent>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        <CardFooter className="relative flex items-center justify-between border-border/60 border-t bg-muted/10 px-4 pt-4 sm:px-6">
                            {currentStep > 0 ? (
                                <Button
                                    variant="secondary"
                                    onClick={handlePrevious}
                                    disabled={currentStep === 0}
                                    className="h-8 gap-2 px-3 text-xs sm:h-10 sm:px-4 sm:text-sm"
                                >
                                    <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                                    <span className="hidden sm:inline">Previous</span>
                                    <span className="sm:hidden">Prev</span>
                                </Button>
                            ) : (
                                <div className="w-8" />
                            )}

                            <div className="absolute right-[50%] flex translate-x-1/2 gap-1">
                                {ONBOARDING_STEPS.map((_, index) => (
                                    <div
                                        key={index}
                                        className={`h-2 w-2 rounded-full transition-all duration-300 ${
                                            index === currentStep
                                                ? "w-6 bg-primary"
                                                : index < currentStep
                                                  ? "bg-primary/60"
                                                  : "bg-muted-foreground/20"
                                        }`}
                                    />
                                ))}
                            </div>

                            <Button
                                onClick={handleNext}
                                className="h-8 gap-2 px-3 text-xs sm:h-10 sm:px-4 sm:text-sm"
                            >
                                {currentStep === ONBOARDING_STEPS.length - 1 ? (
                                    <>
                                        <span className="hidden sm:inline">Get Started</span>
                                        <span className="sm:hidden">Start</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="hidden sm:inline">Next</span>
                                        <span className="sm:hidden">Next</span>
                                        <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                </MotionConfig>
            </DialogContent>
        </Dialog>
    )
}
