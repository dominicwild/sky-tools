"use client"

import { Plus } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function EmptyQuestSlot() {
    return (
        <Card
            className="bg-sky-700/30 backdrop-blur-sm border-2 border-dashed border-white/30 shadow-md rounded-2xl hover:bg-sky-700/40 transition-colors"
            onClick={() => {
                const searchInput = document.getElementById("quest-search")
                if (searchInput) {
                    searchInput.focus()
                }
            }}
        >
            <CardContent className="p-6 flex flex-col items-center justify-center cursor-pointer">
                <Plus className="h-8 w-8 text-white/60 mb-2" />
                <p className="text-white font-medium">Empty quest slot</p>
                <p className="text-white/70 text-sm mt-1">Click to focus search</p>
            </CardContent>
        </Card>
    )
}
