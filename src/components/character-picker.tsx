import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList
} from "@/components/ui/command"
import {
    ResponsivePopover,
    ResponsivePopoverContent,
    ResponsivePopoverTrigger
} from "@/components/ui/responsive-popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useIsMobile } from "@/hooks/use-mobile"
import { CHARACTERS, type Character } from "@/lib/characters"
import { captureEvent } from "@/lib/analytics"
import { cn } from "@/lib/utils"
import { ChevronDown, Sword } from "lucide-react"
import { memo, useState } from "react"

type CharacterItemProps = {
    character: Character
    isSelected: boolean
    onSelect: (id: string) => void
    onClose: () => void
}

const CharacterItem = memo(function CharacterItem({
    character,
    isSelected,
    onSelect,
    onClose
}: CharacterItemProps) {
    return (
        <CommandItem
            key={character.id}
            onSelect={() => {
                onSelect(character.id)
                onClose()
            }}
            className={cn(
                "group flex items-center gap-3 py-2",
                /* Current character: subtle marker; hover/keyboard use CommandItem theme */
                isSelected &&
                    "border-primary border-l-2 bg-primary/8 pl-[calc(0.5rem-2px)] aria-selected:border-transparent aria-selected:bg-primary/16 data-[selected=true]:border-transparent data-[selected=true]:bg-primary/16"
            )}
        >
            <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate font-medium text-foreground text-sm">
                    {character.name}
                </span>
                <span className="truncate text-muted-foreground text-xs">{character.title}</span>
            </div>
            <div className="flex shrink-0 items-center">
                {isSelected && (
                    <Sword
                        className="size-3.5 text-primary group-aria-selected:text-foreground"
                        aria-hidden
                    />
                )}
            </div>
        </CommandItem>
    )
})

type CharacterPickerProps = {
    selectedCharacterId: string
    onCharacterChange: (characterId: string) => void
    className?: string
}

export const CharacterPicker = ({
    selectedCharacterId,
    onCharacterChange,
    className
}: CharacterPickerProps) => {
    const [open, setOpen] = useState(false)
    const isMobile = useIsMobile()

    const selected = CHARACTERS.find((c) => c.id === selectedCharacterId)
    const handleCharacterChange = (characterId: string) => {
        if (characterId !== selectedCharacterId) {
            captureEvent("chat_character_changed", {
                character_id: characterId
            })
        }
        onCharacterChange(characterId)
    }

    return (
        <ResponsivePopover open={open} onOpenChange={setOpen}>
            <ResponsivePopoverTrigger asChild>
                <Button
                    variant="ghost"
                    aria-expanded={open}
                    aria-label="Select character"
                    className={cn(
                        "h-8 gap-1 bg-secondary/70 px-2 font-normal text-xs backdrop-blur-lg sm:text-sm md:rounded-md",
                        className
                    )}
                >
                    <Sword className="size-3.5" />
                    <span className="hidden min-[390px]:block">
                        {selected?.name?.split(" ")[0] ?? "Character"}
                    </span>
                    <ChevronDown className="ml-auto h-3.5 w-3.5" />
                </Button>
            </ResponsivePopoverTrigger>
            <ResponsivePopoverContent
                className="p-0 md:w-80"
                align="start"
                title="Choose Your Voice"
                description="Select a character to speak as"
            >
                <Command>
                    {!isMobile && (
                        <CommandInput placeholder="Search characters..." className="h-8" />
                    )}
                    <CommandList>
                        <CommandEmpty>No character found.</CommandEmpty>
                        <ScrollArea className="h-[300px]">
                            <CommandGroup heading="Characters of Westeros">
                                {CHARACTERS.map((character) => (
                                    <CharacterItem
                                        key={character.id}
                                        character={character}
                                        isSelected={selectedCharacterId === character.id}
                                        onSelect={handleCharacterChange}
                                        onClose={() => setOpen(false)}
                                    />
                                ))}
                            </CommandGroup>
                        </ScrollArea>
                    </CommandList>
                </Command>
            </ResponsivePopoverContent>
        </ResponsivePopover>
    )
}
