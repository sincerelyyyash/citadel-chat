import { getCharacterById } from "@/lib/characters"
import { getCharacterAvatarSrc } from "@/lib/character-avatars"
import { cn } from "@/lib/utils"
import { User } from "lucide-react"
import { memo, useState } from "react"

type CharacterMessageAvatarProps = {
    characterId: string
    className?: string
}

export const CharacterMessageAvatar = memo(function CharacterMessageAvatar({
    characterId,
    className
}: CharacterMessageAvatarProps) {
    const [imageFailed, setImageFailed] = useState(false)
    const character = getCharacterById(characterId)
    const label = character?.name ?? characterId

    if (imageFailed) {
        return (
            <div
                className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground",
                    className
                )}
                role="img"
                aria-label={label}
            >
                <User className="size-4" aria-hidden />
            </div>
        )
    }

    return (
        <div
            className={cn("relative shrink-0", className)}
            role="img"
            aria-label={label}
        >
            <img
                src={getCharacterAvatarSrc(characterId)}
                alt=""
                width={32}
                height={32}
                className="size-8 rounded-full border border-border object-cover shadow-sm"
                loading="lazy"
                decoding="async"
                onError={() => setImageFailed(true)}
            />
        </div>
    )
})

CharacterMessageAvatar.displayName = "CharacterMessageAvatar"
