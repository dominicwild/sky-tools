export type Quest = {
    id?: number
    type: string
    realm: string
    questName: string
    iconUrl: string
    visualGuideUrl: string | null
    videoGuideUrl: string | null
}

export type QuestValue = Record<string, number>
