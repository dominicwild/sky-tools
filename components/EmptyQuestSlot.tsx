"use client"

import {Card, CardContent} from "@/components/ui/card"

export default function EmptyQuestSlot() {
    return (
        <Card
            className="bg-sky-700/50 backdrop-blur-sm border-2 border-white/50 shadow-md rounded-2xl hover:bg-sky-700/70 transition-colors"
            onClick={() => {
                const searchInput = document.getElementById("quest-search")
                if (searchInput) {
                    searchInput.focus()
                }
            }}
        >
            <CardContent className="p-6 flex flex-col items-center justify-center cursor-pointer">
                <p className="text-white text-xl">Search and select up to 4 daily quests to begin tracking</p>
                <p className="text-white/70 text-md mt-1">Each quest will show a visual guide and video tutorial if available</p>
            </CardContent>
        </Card>
    )
}
