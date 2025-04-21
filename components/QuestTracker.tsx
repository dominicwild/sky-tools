"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import QuestSearch from "@/components/QuestSearch";
import VisualGuideDialog from "./VisualGuideDialog";
import VideoGuideDialog from "@/components/VideoGuideDialog";
import {Button} from "@/components/ui/button";
import QuestCard from "@/components/QuestCard";
import EmptyQuestSlot from "@/components/EmptyQuestSlot";
import { questsData } from "@/data/questData";


export type Quest = {
    type: string
    realm: string
    questName: string
    iconUrl: string
    visualGuideUrl: string | null
    videoGuideUrl: string | null
}

export default function QuestTracker() {
    const [selectedQuests, setSelectedQuests] = useState<Quest[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    const [visualGuideDialog, setVisualGuideDialog] = useState<{
        isOpen: boolean
        quest: Quest | null
    }>({ isOpen: false, quest: null })
    const [videoGuideDialog, setVideoGuideDialog] = useState<{
        isOpen: boolean
        quest: Quest | null
    }>({ isOpen: false, quest: null })

    // Reference to maintain consistent container height
    const questContainerRef = useRef<HTMLDivElement>(null)
    const [containerHeight, setContainerHeight] = useState<number | null>(null)

    const filteredQuests = useMemo(() => {
        if (!searchQuery.trim()) return []

        return questsData
            .filter((quest) => {
                const matchesSearch =
                    quest.questName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    quest.realm.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    quest.type.toLowerCase().includes(searchQuery.toLowerCase())
                return matchesSearch
            })
            .slice(0, 8) // Limit results to 8 for better UX
    }, [searchQuery])

    // Measure and set container height to prevent layout shifts
    useEffect(() => {
        if (questContainerRef.current) {
            setContainerHeight(questContainerRef.current.offsetHeight)
        }
    }, [])

    const addQuest = (quest: Quest) => {
        if (selectedQuests.length < 4 && !selectedQuests.includes(quest)) {
            // Capture current height before adding
            if (questContainerRef.current) {
                setContainerHeight(questContainerRef.current.offsetHeight)
            }

            setSelectedQuests([...selectedQuests, quest])
            setSearchQuery("")
            const searchInput = document.getElementById("quest-search")
            if (searchInput) {
                searchInput.focus()
            }
        }
    }

    const removeQuest = (quest: Quest) => {
        // Capture current height before removing
        if (questContainerRef.current) {
            setContainerHeight(questContainerRef.current.offsetHeight)
        }

        setSelectedQuests(selectedQuests.filter((q) => q !== quest))
    }

    const clearSelectedQuests = () => {
        // Capture current height before clearing
        if (questContainerRef.current) {
            setContainerHeight(questContainerRef.current.offsetHeight)
        }

        setSelectedQuests([])
    }

    const openVisualGuideDialog = (quest: Quest) => {
        setVisualGuideDialog({ isOpen: true, quest })
    }

    const closeVisualGuideDialog = () => {
        setVisualGuideDialog({ isOpen: false, quest: null })
    }

    const openVideoGuideDialog = (quest: Quest) => {
        setVideoGuideDialog({ isOpen: true, quest })
    }

    const closeVideoGuideDialog = () => {
        setVideoGuideDialog({ isOpen: false, quest: null })
    }

    // Update container height when quests change
    useEffect(() => {
        // Use a timeout to allow the DOM to update first
        const timer = setTimeout(() => {
            if (questContainerRef.current) {
                setContainerHeight(questContainerRef.current.offsetHeight)
            }
        }, 50)

        return () => clearTimeout(timer)
    }, [selectedQuests.length])

    return (
        <div className="min-h-0 flex flex-col items-center justify-start pt-[25vh] px-4 pb-8">
            <div className="w-full max-w-3xl mx-auto flex flex-col items-center">
                {/* Title */}
                <motion.div
                    className="mb-8 text-center"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-md">Sky: Children of the Light</h1>
                    <h2 className="text-2xl font-semibold text-white/90 drop-shadow-md">Daily Quest Tracker</h2>
                </motion.div>

                {/* Search Component */}
                <QuestSearch
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    filteredQuests={filteredQuests}
                    addQuest={addQuest}
                    selectedQuests={selectedQuests}
                />

                {/* Visual Guide Dialog */}
                <VisualGuideDialog
                    isOpen={visualGuideDialog.isOpen}
                    quest={visualGuideDialog.quest}
                    onClose={closeVisualGuideDialog}
                />

                {/* Video Guide Dialog */}
                <VideoGuideDialog
                    isOpen={videoGuideDialog.isOpen}
                    quest={videoGuideDialog.quest}
                    onClose={closeVideoGuideDialog}
                />

                {/* Daily Quests Section */}
                <div className="w-full relative z-10">
                    <AnimatePresence>
                        {selectedQuests.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="mb-4 flex justify-between items-center"
                            >
                                <h3 className="text-xl font-semibold text-white drop-shadow-sm">
                                    Daily Quests ({selectedQuests.length}/4)
                                </h3>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="bg-sky-700/60 hover:bg-sky-700/80 text-white border-none"
                                    onClick={clearSelectedQuests}
                                >
                                    Clear All
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Quest container with fixed height to prevent layout shifts */}
                    <div
                        ref={questContainerRef}
                        className="relative w-full"
                        style={containerHeight ? { minHeight: `${containerHeight}px` } : {}}
                    >
                        <div className="grid grid-cols-1 gap-4">
                            {/* Selected Quests */}
                            <AnimatePresence mode="popLayout">
                                {selectedQuests.map((quest) => (
                                    <motion.div
                                        key={quest.questName + quest.type}
                                        layout
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 500,
                                            damping: 30,
                                            layout: { duration: 0.3 },
                                        }}
                                        className="w-full"
                                    >
                                        <QuestCard
                                            quest={quest}
                                            onRemove={removeQuest}
                                            onOpenVisualGuide={openVisualGuideDialog}
                                            onOpenVideoGuide={openVideoGuideDialog}
                                        />
                                    </motion.div>
                                ))}

                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 500,
                                            damping: 30,
                                            layout: { duration: 0.3 },
                                        }}
                                        className="w-full"
                                    >
                                        <EmptyQuestSlot />
                                    </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
