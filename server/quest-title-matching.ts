import "server-only";

import {normalizeQuestTitle} from "@/lib/daily-quest-source";
import type {Quest} from "@/lib/quest-types";

const QUEST_TITLE_ALIASES = new Map([
    [
        "days of bloom 2021 admire sapling quest daylight prairie",
        "admire the sapling in daylight prairie for a short while",
    ],
    [
        "daily quest guide bow at a player",
        "bow at a player",
    ],
    [
        "relive spirit quest daylight prairie exhausted dock worker",
        "relive exhausted dock worker s memory from daylight prairie",
    ],
    [
        "catch the light quest vault of knowledge",
        "catch the light in the vault of knowledge",
    ],
    [
        "meditation quest guide vault of knowledge spirit mantas a k a vault entrance",
        "meditate at the vault s entrance",
    ],
    [
        "coloured light quest purple light in vault of knowledge",
        "collect purple light",
    ],
    [
        "catch the light quest hidden forest",
        "catch the light in hidden forest",
    ],
    [
        "daily quest guide hug a friend",
        "hug a friend",
    ],
    [
        "catch the light quest valley of triumph",
        "catch the light in valley of triumph",
    ],
    [
        "catch the light quest golden wasteland",
        "catch the light in golden wasteland",
    ],
    [
        "catch the wandering lights along the lower valley track",
        "catch the 3 lights during the valley s sliding race",
    ],
    [
        "relieve a spirit s memory in golden wasteland",
        "relive a spirit s memories in golden wasteland",
    ],
    [
        "relive spirit quest season of assembly scaredy cadet",
        "relive scaredy cadet s memory from hidden forest",
    ],
    [
        "relive spirit quest season of lightseekers twirling champion",
        "relive twirling champion s memory from valley of triumph",
    ],
]);

export function createLocalQuestTitleIndex(localQuests: Quest[]) {
    return new Map(localQuests.map((quest) => [normalizeQuestTitle(quest.questName), quest]));
}

export function getMatchingLocalQuestId(title: string, localQuestsByTitle: Map<string, Quest>) {
    const normalizedTitle = normalizeQuestTitle(title);
    const aliasTitle = QUEST_TITLE_ALIASES.get(normalizedTitle);
    const matchedQuest = localQuestsByTitle.get(aliasTitle ?? normalizedTitle);

    return matchedQuest?.id ?? null;
}
