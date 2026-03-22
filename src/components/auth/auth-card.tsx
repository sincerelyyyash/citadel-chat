"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useSession } from "@/hooks/auth-hooks"
import { authClient } from "@/lib/auth-client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { useRouter } from "@tanstack/react-router"
import { Loader2 } from "lucide-react"
import { AnimatePresence, MotionConfig, motion } from "motion/react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { GithubIcon, GoogleIcon } from "../brand-icons"

const nameSchema = z.object({
    name: z.string().min(2, {
        message: "Name must be at least 2 characters."
    })
})

type NameFormValues = z.infer<typeof nameSchema>

export function AuthCard() {
    const router = useRouter()
    const { data: session, refetch: refetchSession } = useSession()
    const [step, setStep] = useState<"social" | "onboarding">("social")

    const nameForm = useForm<NameFormValues>({
        resolver: zodResolver(nameSchema),
        defaultValues: {
            name: ""
        }
    })

    // Check if user needs onboarding after session updates
    useEffect(() => {
        if (session?.user && !session?.user?.name && step === "social") {
            setStep("onboarding")
        } else if (session?.user?.name && (step === "social" || step === "onboarding")) {
            router.navigate({ to: "/" })
        }
    }, [session, step, router])

    const updateNameMutation = useMutation({
        mutationFn: async (values: NameFormValues) => {
            return await authClient.updateUser({
                name: values.name
            })
        },
        onSuccess: ({ error }) => {
            if (error) {
                toast.error(error.message ?? "Failed to update name")
            } else {
                router.navigate({ to: "/" })
            }
        },
        onError: (error) => {
            toast.error(error.message ?? "Failed to update name")
        }
    })

    const socialSignInMutation = useMutation({
        mutationFn: async (provider: "google" | "github") => {
            return await authClient.signIn.social({
                provider
            })
        },
        onError: (error) => {
            toast.error(error.message ?? `Failed to sign in with ${error}`)
        }
    })

    const onNameSubmit = useCallback(
        (values: NameFormValues) => {
            updateNameMutation.mutate(values)
        },
        [updateNameMutation]
    )

    const currentTitle = useMemo(() => {
        if (step === "onboarding") {
            return "Complete your profile"
        }
        return "Sign in to Citadel"
    }, [step])

    return (
        <MotionConfig
            transition={{
                type: "tween",
                duration: 0.15,
                ease: [0.25, 0.46, 0.45, 0.94]
            }}
        >
            <div className="flex w-full max-w-sm flex-col gap-6 md:max-w-md">
                <Card className="gap-4 overflow-hidden rounded-lg border-2 border-border/60 bg-card/40 pt-3 pb-5 shadow-none backdrop-blur-sm">
                    <CardHeader className="flex justify-center border-border/60 border-b border-dashed pb-3">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={`${step}-title`}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                            >
                                <CardTitle className="font-serif text-xl tracking-wide">
                                    {currentTitle}
                                </CardTitle>
                            </motion.div>
                        </AnimatePresence>
                    </CardHeader>

                    <div className="relative overflow-hidden">
                        <AnimatePresence mode="wait">
                            {step === "social" ? (
                                <motion.div
                                    key="social-step"
                                    initial={{ x: 20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: -20, opacity: 0 }}
                                >
                                    <CardContent className="grid gap-6">
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="flex flex-col gap-2"
                                        >
                                            <Button
                                                variant="outline"
                                                className="h-10 w-full gap-2 rounded-md border-border/60 bg-background/10 hover:border-border/80 hover:bg-background/20 dark:border-border/60 dark:bg-background/10 dark:hover:border-border/90 dark:hover:bg-background/20"
                                                onClick={() =>
                                                    socialSignInMutation.mutate("google")
                                                }
                                                disabled={socialSignInMutation.isPending}
                                            >
                                                {socialSignInMutation.isPending ? (
                                                    <Loader2 className="size-4 shrink-0 animate-spin text-foreground" />
                                                ) : (
                                                    <GoogleIcon className="size-4 shrink-0" />
                                                )}
                                                Continue with Google
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="h-10 w-full gap-2 rounded-md border-border/60 bg-background/10 hover:border-border/80 hover:bg-background/20 dark:border-border/60 dark:bg-background/10 dark:hover:border-border/90 dark:hover:bg-background/20"
                                                onClick={() =>
                                                    socialSignInMutation.mutate("github")
                                                }
                                                disabled={socialSignInMutation.isPending}
                                            >
                                                {socialSignInMutation.isPending ? (
                                                    <Loader2 className="size-4 shrink-0 animate-spin text-foreground" />
                                                ) : (
                                                    <GithubIcon className="size-5 shrink-0" />
                                                )}
                                                Continue with GitHub
                                            </Button>
                                        </motion.div>
                                    </CardContent>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="onboarding-step"
                                    initial={{ x: 20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: -20, opacity: 0 }}
                                >
                                    <Form {...nameForm}>
                                        <form onSubmit={nameForm.handleSubmit(onNameSubmit)}>
                                            <CardContent className="flex flex-col gap-4">
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.1, duration: 0.3 }}
                                                    className="text-center text-muted-foreground"
                                                >
                                                    We'd love to know your name!!
                                                </motion.div>
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.15, duration: 0.3 }}
                                                >
                                                    <FormField
                                                        control={nameForm.control}
                                                        name="name"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormControl>
                                                                    <Input
                                                                        placeholder="Enter your name"
                                                                        className="mb-5"
                                                                        {...field}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </motion.div>
                                            </CardContent>
                                            <CardFooter className="border-t-2 pt-0 [.border-t-2]:pt-4">
                                                <motion.div
                                                    className="w-full"
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.2, duration: 0.3 }}
                                                >
                                                    <Button
                                                        type="submit"
                                                        variant="outline"
                                                        className="h-10 w-full rounded-md border-border/60 bg-background/10 hover:border-border/80 hover:bg-background/20 dark:border-border/60 dark:bg-background/10 dark:hover:border-border/90 dark:hover:bg-background/20"
                                                        disabled={updateNameMutation.isPending}
                                                    >
                                                        {updateNameMutation.isPending
                                                            ? "Saving..."
                                                            : "Complete Setup"}
                                                    </Button>
                                                </motion.div>
                                            </CardFooter>
                                        </form>
                                    </Form>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </Card>
            </div>
        </MotionConfig>
    )
}
