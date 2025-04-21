"use client"

import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import {ChangeEvent, useEffect, useState} from "react"
import { questsData } from "@/data/questData"
import {Quest} from "@/components/QuestTracker";
import {Input} from "@/components/ui/input";
import {Card, CardContent} from "@/components/ui/card";
import {getImageUrl} from "@/util/helper";

interface QuestSearchProps {
    searchQuery: string
    setSearchQuery: (query: string) => void
    filteredQuests: Quest[]
    addQuest: (quest: Quest) => void
    selectedQuests: Quest[]
}

export default function QuestSearch({
                                        searchQuery,
                                        setSearchQuery,
                                        filteredQuests,
                                        addQuest,
                                        selectedQuests,
                                    }: QuestSearchProps) {
    const [isFocused, setIsFocused] = useState(false)

    // Show all quests when focused and no search query
    const displayQuests = searchQuery.trim() === "" && isFocused ? questsData.slice(0, 8) : filteredQuests

    // Add a useEffect to focus the search input on initial load
    useEffect(() => {
        const searchInput = document.getElementById("quest-search")
        if (searchInput) {
            searchInput.focus()
            setIsFocused(true)
        }
    }, [])

    // Animation variants for search results
    const searchResultsVariants = {
        hidden: {
            opacity: 0,
            y: -10,
            transition: {
                duration: 0.2,
                ease: "easeOut",
            },
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.3,
                ease: "easeOut",
            },
        },
        exit: {
            opacity: 0,
            y: -10,
            transition: {
                duration: 0.2,
                ease: "easeIn",
            },
        },
    }

    const highlightMatch = (text: string, query: string) => {
        if (!query.trim()) return <span>{text}</span>

        const regex = new RegExp(`(${query.trim()})`, "gi")
        const parts = text.split(regex)

        return (
            <>
                {parts.map((part, i) =>
                        regex.test(part) ? (
                            <span key={i} className="font-bold bg-blue-200 text-blue-700">
                              {part}
                            </span>
                        ) : (
                            <span key={i}>{part}</span>
                        ),
                )}
            </>
        )
    }

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement
            const searchContainer = document.getElementById("search-container")
            if (isFocused && searchContainer && !searchContainer.contains(target)) {
                setIsFocused(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [isFocused])

    return (
        <div id="search-container" className="relative w-full max-w-2xl mb-12 transition-all duration-300 z-30">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative">
                <div className="absolute inset-0 bg-white/20 rounded-full blur-xl"></div>
                <div className="relative">
                    <Search className="absolute left-4 top-4 h-5 w-5 text-white/70" />
                    <Input
                        id="quest-search"
                        type="text"
                        placeholder="Search for quests..."
                        className="pl-12 bg-blue-700/70 backdrop-blur-md !text-xl px-6 py-8 !ring-[#003C78] border-none shadow-lg rounded-full text-white placeholder:text-white/60"
                        value={searchQuery}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        autoFocus
                        autoComplete="off"
                    />
                    {searchQuery && (
                        <button
                            className="absolute right-4 top-4 text-white/70 hover:text-white cursor-pointer"
                            onClick={() => setSearchQuery("")}
                        >
                            <X className="h-5 w-5" />
                        </button>
                    )}
                </div>

                <AnimatePresence>
                    {displayQuests.length > 0 && isFocused && (
                        <motion.div
                            className="absolute z-30 mt-3 w-full"
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            variants={searchResultsVariants}
                        >
                            <Card className="bg-sky-600/90 backdrop-blur-md border-none shadow-xl overflow-hidden rounded-2xl">
                                <CardContent className="p-2">
                                    <div className="space-y-1">
                                        {displayQuests.map((quest, index) => (
                                            <motion.div
                                                key={quest.type + quest.questName}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{
                                                    opacity: 1,
                                                    y: 0,
                                                    transition: { delay: index * 0.05 },
                                                }}
                                                className="flex items-center justify-between p-3 rounded-xl hover:bg-sky-500/80 cursor-pointer transition-colors"
                                                onClick={() => addQuest(quest)}
                                            >
                                                <div className="flex items-center gap-3 flex-1">
                                                    {quest.iconUrl && (
                                                        <img
                                                            src={getImageUrl(quest.iconUrl)}
                                                            alt="Quest icon"
                                                            className="w-5 h-5"
                                                            onError={(e) => {
                                                                ;(e.target as HTMLImageElement).src = "/oh-no.png"
                                                            }}
                                                        />
                                                    )}
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-white">
                                                            {highlightMatch(quest.questName, searchQuery)}
                                                        </p>
                                                        <p className="text-xs text-white/70">{highlightMatch(quest.realm, searchQuery)}</p>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-white/80 hover:text-white hover:bg-white/20 ml-2"
                                                        disabled={selectedQuests.includes(quest) || selectedQuests.length >= 4}
                                                    >
                                                        {selectedQuests.includes(quest) ? "Added" : "Add"}
                                                    </Button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    )
}
