"use client"

import {Suspense, use, useCallback, useEffect, useMemo, useRef, useState} from "react"
import {AnimatePresence, motion} from "motion/react"
import QuestSearch from "@/components/QuestSearch";
import VisualGuideDialog from "./VisualGuideDialog";
import VideoGuideDialog from "@/components/VideoGuideDialog";
import {Button} from "@/components/ui/button";
import QuestCard from "@/components/QuestCard";
import EmptyQuestSlot from "@/components/EmptyQuestSlot";
import CandleGuideSection from "@/components/CandleGuideSection";
import {questsData} from "@/data/questData";
import {incrementQuest} from "@/server/redis";
import {getSkyDate} from "@/lib/utils";
import type {DailyQuestDisplayData} from "@/lib/daily-quest-source";
import type {GuideMedia, Quest} from "@/lib/quest-types";
import {isQuestSelected} from "@/lib/quest-selection";

interface QuestTrackerProps {
    initialQuestData: DailyQuestDisplayData
    skyHelperQuestData: Promise<DailyQuestDisplayData>
}

export default function QuestTracker({initialQuestData, skyHelperQuestData}: Readonly<QuestTrackerProps>) {
    const [questData, setQuestData] = useState(initialQuestData)
    const [selectedQuests, setSelectedQuests] = useState<Quest[]>(initialQuestData.quests)
    const [searchQuery, setSearchQuery] = useState("")
    const hasEditedSelectedQuests = useRef(false)
    const [visualGuideDialog, setVisualGuideDialog] = useState<{
        isOpen: boolean
        quest: GuideMedia | null
    }>({isOpen: false, quest: null})
    const [videoGuideDialog, setVideoGuideDialog] = useState<{
        isOpen: boolean
        quest: GuideMedia | null
    }>({isOpen: false, quest: null})

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

    const applySkyHelperQuestData = useCallback((nextQuestData: DailyQuestDisplayData) => {
        setQuestData(nextQuestData)
        setSelectedQuests((currentSelectedQuests) => {
            if (hasEditedSelectedQuests.current) {
                return currentSelectedQuests
            }

            return nextQuestData.quests
        })
    }, [])

    function trackQuestSelection(quest: Quest) {
        if (quest.id === undefined) {
            return;
        }

        const todaysDate = getSkyDate();
        const selectedQuestData = localStorage.getItem(todaysDate);

        if (!selectedQuestData) {
            incrementQuest(quest.id)
            localStorage.setItem(todaysDate, JSON.stringify([quest.id]))
        } else {
            const selectedQuestsForToday = JSON.parse(selectedQuestData) as number[];
            if (!selectedQuestsForToday.includes(quest.id)) {
                incrementQuest(quest.id)
                localStorage.setItem(todaysDate, JSON.stringify([...selectedQuestsForToday, quest.id]))
            }
        }
    }

    const addQuest = (quest: Quest) => {
        if (selectedQuests.length < 4 && !isQuestSelected(quest, selectedQuests)) {
            trackQuestSelection(quest);
            hasEditedSelectedQuests.current = true

            setSelectedQuests([...selectedQuests, quest])
            setSearchQuery("")
            const searchInput = document.getElementById("quest-search")
            if (searchInput) {
                searchInput.focus()
            }
        }
    }

    const removeQuest = (quest: Quest) => {
        hasEditedSelectedQuests.current = true
        setSelectedQuests(selectedQuests.filter((q) => q !== quest))
    }

    const clearSelectedQuests = () => {
        hasEditedSelectedQuests.current = true
        setSelectedQuests([])
    }

    const openVisualGuideDialog = (quest: GuideMedia) => {
        setVisualGuideDialog({isOpen: true, quest})
    }

    const closeVisualGuideDialog = () => {
        setVisualGuideDialog(state => ({...state, isOpen: false}))
    }

    const openVideoGuideDialog = (quest: GuideMedia) => {
        setVideoGuideDialog({isOpen: true, quest})
    }

    const closeVideoGuideDialog = () => {
        setVideoGuideDialog((state) => ({...state, isOpen: false}))
    }

    return (
        <div className="min-h-0 flex flex-col items-center justify-start px-4 pb-8">
            <Suspense fallback={null}>
                <SkyHelperQuestDataLoader
                    questData={skyHelperQuestData}
                    onResolve={applySkyHelperQuestData}
                />
            </Suspense>

            <div className="w-full max-w-3xl mx-auto flex flex-col items-center">
                <motion.div
                    className="mb-8 text-center"
                    initial={{opacity: 0, y: -20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.6, ease: "easeOut"}}
                >
                    <img className={"relative"} src={"/sky-logo.png"} alt="Sky Quest Tracker"/>
                    <h1 className="text-2xl font-semibold text-white/90 drop-shadow-2xl ">
                        <span className={"bg-black/1 rounded-full"}>
                        Daily Quest Tracker

                        </span>
                    </h1>
                </motion.div>

                <QuestSearch
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    filteredQuests={filteredQuests}
                    addQuest={addQuest}
                    selectedQuests={selectedQuests}
                    autoFocusOnLoad={questData.quests.length <= 2}
                />

                <VisualGuideDialog
                    isOpen={visualGuideDialog.isOpen}
                    quest={visualGuideDialog.quest}
                    onClose={closeVisualGuideDialog}
                />

                <VideoGuideDialog
                    isOpen={videoGuideDialog.isOpen}
                    quest={videoGuideDialog.quest}
                    onClose={closeVideoGuideDialog}
                />

                <div className="w-full relative z-10">
                    <AnimatePresence>
                        {selectedQuests.length > 0 && (
                            <motion.div
                                initial={{opacity: 0}}
                                animate={{opacity: 1}}
                                exit={{opacity: 0}}
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

                    <div
                        className="relative w-full"
                    >
                        <div className="grid grid-cols-1 gap-4">
                            <AnimatePresence mode="popLayout">
                                {selectedQuests.map((quest) => (
                                    <motion.div
                                        key={quest.id ?? `${quest.questName}-${quest.type}`}
                                        layout
                                        initial={{opacity: 0, scale: 0.8}}
                                        animate={{opacity: 1, scale: 1}}
                                        exit={{opacity: 0, scale: 0.8, transition: {duration: 0.2}}}
                                        transition={{
                                            type: "spring",
                                            stiffness: 500,
                                            damping: 30,
                                            layout: {duration: 0.3},
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
                                    initial={{opacity: 0, scale: 0.8}}
                                    animate={{opacity: 1, scale: 1}}
                                    exit={{opacity: 0, scale: 0.8}}
                                    transition={{
                                        type: "spring",
                                        stiffness: 500,
                                        damping: 30,
                                        layout: {duration: 0.3},
                                    }}
                                    className="w-full"
                                >
                                    {selectedQuests.length == 0 && <EmptyQuestSlot/>}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>

                    <CandleGuideSection
                        candleGuides={questData.candleGuides}
                        onOpenVisualGuide={openVisualGuideDialog}
                        onOpenVideoGuide={openVideoGuideDialog}
                    />
                </div>
            </div>
        </div>
    )
}

function SkyHelperQuestDataLoader({
    questData,
    onResolve,
}: Readonly<{
    questData: Promise<DailyQuestDisplayData>
    onResolve: (questData: DailyQuestDisplayData) => void
}>) {
    const resolvedQuestData = use(questData)

    useEffect(() => {
        onResolve(resolvedQuestData)
    }, [onResolve, resolvedQuestData])

    return null
}
