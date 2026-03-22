/** Public folder: `public/characters/{id}.jpg` — add files as needed. */
export const getCharacterAvatarSrc = (characterId: string): string =>
    `/characters/${characterId}.jpg`
