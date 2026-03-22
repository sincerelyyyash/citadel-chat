import { Button } from "@/components/ui/button"
import { useThemeStore } from "@/lib/theme-store"
import { HOUSE_THEMES } from "@/lib/theme-utils"
import { useNavigate } from "@tanstack/react-router"
import { motion } from "framer-motion"
import { HouseBrandMark } from "./house-brand-mark"

export const SignupMessagePrompt = () => {
    const navigate = useNavigate()
    const { themeState } = useThemeStore()
    const selectedHouseTheme =
        HOUSE_THEMES.find((theme) => theme.url === themeState.selectedThemeUrl) ?? HOUSE_THEMES[0]

    const handleNavigation = () => {
        navigate({ to: "/auth/$pathname", params: { pathname: "signup" }, replace: true })
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="isolate mx-auto flex max-w-md flex-col items-center justify-center md:p-8"
        >
            <div className="z-2 mb-8 space-y-12 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="relative z-10"
                >
                    <HouseBrandMark className="mx-auto mb-4" />
                    <h1 className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text font-bold text-4xl text-transparent tracking-tight">
                        Citadel
                    </h1>
                    <p className="mt-2 text-muted-foreground text-sm italic">
                        {selectedHouseTheme.motto}
                    </p>
                    <p className="mt-1 font-medium text-muted-foreground text-sm italic">
                        Summon answers. Weigh alliances. Chart the realm.
                    </p>
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                className="flex w-full justify-center"
            >
                <Button
                    onClick={handleNavigation}
                    className="mx-auto min-w-64 font-medium transition-all hover:scale-102 active:scale-98"
                    size="lg"
                >
                    Get Started
                </Button>
            </motion.div>
        </motion.div>
    )
}
