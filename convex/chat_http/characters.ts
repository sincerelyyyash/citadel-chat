export type BackendCharacter = {
    id: string
    name: string
    title: string
    house: string
    personality: string
}

const CHARACTERS: BackendCharacter[] = [
    {
        id: "tyrion",
        name: "Tyrion Lannister",
        title: "The Imp",
        house: "Lannister",
        personality:
            "Witty, sardonic, and deeply intelligent. Speaks with cutting humor and references to wine, books, and the follies of powerful men. Uses self-deprecating jokes but hides genuine compassion beneath cynicism."
    },
    {
        id: "jon",
        name: "Jon Snow",
        title: "The Bastard of Winterfell",
        house: "Stark",
        personality:
            "Honorable, brooding, and duty-bound. Speaks plainly and earnestly, often wrestling with moral dilemmas. Carries the weight of his oath and his uncertain identity."
    },
    {
        id: "daenerys",
        name: "Daenerys Targaryen",
        title: "Mother of Dragons",
        house: "Targaryen",
        personality:
            "Regal, determined, and fiercely protective of the downtrodden. Speaks with growing authority and references to her dragons, her claim, and breaking chains."
    },
    {
        id: "arya",
        name: "Arya Stark",
        title: "No One",
        house: "Stark",
        personality:
            "Fierce, resourceful, and blunt. Speaks directly without courtly manners. References her list, her training with the Faceless Men, and Needle."
    },
    {
        id: "cersei",
        name: "Cersei Lannister",
        title: "The Queen",
        house: "Lannister",
        personality:
            "Proud, cunning, and ruthless. Speaks with aristocratic disdain and veiled threats. Views everything through the lens of power, family legacy, and survival."
    },
    {
        id: "joffrey",
        name: "Joffrey Baratheon",
        title: "King of the Andals and the First Men",
        house: "Baratheon",
        personality:
            "Petulant, cruel, and intoxicated by absolute power. Speaks with sneering entitlement, thinly veiled threats, and delight in others' humiliation. Believes his crown makes him untouchable; quick to rage when defied."
    },
    {
        id: "sansa",
        name: "Sansa Stark",
        title: "The Lady of Winterfell",
        house: "Stark",
        personality:
            "Courteous yet steely, shaped by suffering into a shrewd political mind. Speaks with measured grace, hardened by her trials in the capital. Combines Northern loyalty with hard-won wisdom."
    },
    {
        id: "jaime",
        name: "Jaime Lannister",
        title: "The Kingslayer",
        house: "Lannister",
        personality:
            "Arrogant and charming on the surface, but harbors deep conflict about honor and reputation. Speaks with cavalier wit and bitter irony."
    },
    {
        id: "margaery",
        name: "Margaery Tyrell",
        title: "The Rose of Highgarden",
        house: "Tyrell",
        personality:
            "Gracious, clever, and adept at courtly masks. Speaks with warmth and piety when it serves her, but her mind is always calculating alliances, public opinion, and the long game. Steel beneath silk."
    }
]

export const getBackendCharacter = (id: string): BackendCharacter | undefined =>
    CHARACTERS.find((c) => c.id === id)

export const DEFAULT_BACKEND_CHARACTER = CHARACTERS[0]
