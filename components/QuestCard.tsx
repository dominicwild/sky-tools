"use client"

import { X, Video, Maximize } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Quest } from "./QuestTracker"
import {Badge} from "@/components/ui/badge";

interface QuestCardProps {
    quest: Quest
    onRemove: (quest: Quest) => void
    onOpenVisualGuide: (quest: Quest) => void
    onOpenVideoGuide: (quest: Quest) => void
}

export default function QuestCard({ quest, onRemove, onOpenVisualGuide, onOpenVideoGuide }: QuestCardProps) {
    return (
        <Card className="bg-sky-700/80 backdrop-blur-md border-none shadow-lg overflow-hidden rounded-2xl hover:shadow-xl transition-shadow">
            <CardContent className="p-4">
                <div className="flex flex-col">
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3">
                            {quest.iconUrl && (
                                <img
                                    src={quest.iconUrl || "/placeholder.svg"}
                                    alt="Quest icon"
                                    className="w-6 h-6 mt-0.5"
                                    onError={(e) => {
                                        ;(e.target as HTMLImageElement).src = "/glowing-scroll-icon.png"
                                    }}
                                />
                            )}
                            <div className="flex-1">
                                <p className="font-medium text-white text-base">{quest.questName}</p>
                                <div className="flex flex-wrap gap-2 mt-1.5 items-center">
                                    <Badge className="text-xs bg-sky-500/80 text-white hover:bg-sky-500/90 border-none">
                                        {quest.realm}
                                    </Badge>

                                    {/* Video Guide Button with Text */}
                                    {quest.videoGuideUrl && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-6 px-2 py-0 bg-sky-500/80 hover:bg-sky-500 text-white hover:text-white border-none flex items-center gap-1.5"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                onOpenVideoGuide(quest)
                                            }}
                                        >
                                            <Video className="h-3 w-3" />
                                            <span className="text-xs">Video Guide</span>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-white hover:text-white hover:bg-sky-600/80"
                            onClick={() => onRemove(quest)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Visual Guide Preview with Maximize Button */}
                    {quest.visualGuideUrl ? (
                        <div className="mt-2 relative group">
                            <div
                                className="flex justify-center bg-sky-800/90 backdrop-blur-sm rounded-xl p-2 cursor-pointer overflow-hidden"
                                onClick={() => onOpenVisualGuide(quest)}
                            >
                                <img
                                    src={quest.visualGuideUrl || "/placeholder.svg"}
                                    alt="Visual guide"
                                    className="h-48 object-contain rounded-md"
                                    onError={(e) => {
                                        ;(e.target as HTMLImageElement).src = "/sky-cotl-quest-journey.png"
                                    }}
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-all rounded-xl">
                                    <Maximize className="text-white opacity-0 group-hover:opacity-100 h-8 w-8 transition-opacity" />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="mt-2 flex justify-center bg-sky-800/90 backdrop-blur-sm rounded-xl p-4">
                            <p className="text-white/80 text-sm">No visual guide available</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
