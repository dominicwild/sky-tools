import "server-only";

import {normalizeQuestTitle} from "@/lib/daily-quest-source";
import type {Quest} from "@/lib/quest-types";

const QUEST_TITLE_ALIASES = new Map([
    [
        "days of bloom 2021 admire sapling quest daylight prairie",
        "admire the sapling in daylight prairie for a short while",
    ],
    [
        "days of bloom 2021 admire sapling quest valley of triumph",
        "admire the sapling in valley of triumph for a short while",
    ],
    [
        "days of bloom 2021 admire sapling quest vault of knowledge",
        "admire the sapling in vault of knowledge for a short while",
    ],
    [
        "days of bloom 2021 admire sapling quest golden wasteland",
        "admire the sapling in golden wasteland for a short while",
    ],
    [
        "days of bloom 2021 admire sapling quest hidden forest",
        "admire the sapling in hidden forest for a short while",
    ],
    [
        "days of rainbow 2021 daily quest rainbow location golden wasteland",
        "find the candles at the end of the rainbow in the golden wasteland forgotten ark",
    ],
    [
        "days of rainbow 2021 daily quest rainbow location vault of knowledge",
        "find the candles at the end of the rainbow in the vault of knowledge",
    ],
    [
        "days of rainbow 2021 daily quest rainbow location daylight prairie",
        "find the candles at the end of the rainbow in the daylight prairie",
    ],
    [
        "days of rainbow 2021 daily quest rainbow location hidden forest",
        "find the candles at the end of the rainbow in the hidden forest",
    ],
    [
        "coloured light quest red light in golden wasteland",
        "collect red light",
    ],
    [
        "coloured light quest orange light in hidden forest",
        "collect orange light",
    ],
    [
        "coloured light quest green light in daylight prairie",
        "collect green light",
    ],
    [
        "daily quest guide send a gift to a friend",
        "send a gift to a friend",
    ],
    [
        "daily quest guide wave to a friend",
        "wave to a friend",
    ],
    [
        "daily quest guide bow at a player",
        "bow at a player",
    ],
    [
        "daily quest guide high five a friend",
        "high five a friend",
    ],
    [
        "social quest guide hold a friend s hand",
        "hold the hand of a friend",
    ],
    [
        "visiting the social light area golden wasteland graveyard bonfire spitroast",
        "visit the bonfire at the wasteland s graveyard",
    ],
    [
        "visiting the social light area daylight prairie prairie cave",
        "visit the cozy hideout in prairie caves",
    ],
    [
        "daily quest guide make a new acquaintance",
        "make a new acquaintance",
    ],
    [
        "recharge from a light bloom",
        "recharge your light from a light bloom",
    ],
    [
        "catch the wandering lights in the treehouse",
        "catch the 3 lights in the big treehouse",
    ],
    [
        "daily quest guide face the dark dragon",
        "face the dark dragon",
    ],
    [
        "relive spirit quest daylight prairie exhausted dock worker",
        "relive exhausted dock worker s memory from daylight prairie",
    ],
    [
        "relive spirit quest daylight prairie slumbering shipwright",
        "relive slumbering shipwright s memory from daylight prairie",
    ],
    [
        "relive spirit quest daylight prairie waving bellmaker",
        "relive waving bellmaker s memory from daylight prairie",
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
        "meditation quest guide vault of knowledge vault second floor",
        "meditate at vault s second floor",
    ],
    [
        "meditation quest hidden forest boneyard",
        "meditate in forest s boneyard",
    ],
    [
        "meditation quest guide hidden forest forest clearing",
        "meditate at forest s clearing",
    ],
    [
        "meditation quest guide golden wasteland the boat a k a the crab fields",
        "meditate in the crab fields",
    ],
    [
        "coloured light quest purple light in vault of knowledge",
        "collect purple light",
    ],
    [
        "coloured light quest blue light in valley of triumph",
        "collect blue light",
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
        "daily quest guide recharge from a light bloom",
        "recharge your light from a light bloom",
    ],
    [
        "daily quest visit the polluted geyser in the sanctuary islands",
        "visit the polluted geyser in sanctuary islands",
    ],
    [
        "https discord com channels 575762611111592007 575827924343848960 1453303732572786822 how to get to the sanctuary islands",
        "ride a giant manta in sanctuary islands",
    ],
    [
        "relive spirit quest season of sanctuary timid bookworm",
        "relive timid bookworm s memory from daylight prairie",
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
        "catch the light quest daylight prairie",
        "catch the light in daylight prairie",
    ],
    [
        "fly with many butterflies in the butterfly fields",
        "fly with many butterflies in butterfly fields",
    ],
    [
        "catch the wandering lights along the lower valley track",
        "catch the 3 lights during the valley s sliding race",
    ],
    [
        "days of rainbow 2021 daily quest rainbow location valley of triumph",
        "find the candles at the end of the rainbow in the valley of triumph",
    ],
    [
        "days of rainbow 2022 admire the rainbow in the wind paths",
        "admire the rainbow in the wind paths for a short while",
    ],
    [
        "meditation quest guide valley of triumph ice rink meditate overlooking the frozen lake",
        "meditate overlooking the frozen lake",
    ],
    [
        "catch the wandering lights in the citadel",
        "catch the 3 lights in valley s citadel",
    ],
    [
        "catch the wandering lights in the wind paths",
        "catch the 3 lights in the wind paths",
    ],
    [
        "catch the wandering lights in prairie village",
        "catch the 3 lights in prairie village",
    ],
    [
        "ride a manta quest in daylight prairie",
        "ride with a manta",
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
    [
        "relive spirit quest season of gratitude leaping dancer",
        "relive leaping dancer s memory from valley of triumph",
    ],
    [
        "relive spirit quest season of belonging sparkler parent",
        "relive sparkler parent s memory from valley of triumph",
    ],
    [
        "relive spirit quest season of gratitude greeting shaman",
        "relive greeting shaman s memory from vault of knowledge",
    ],
    [
        "relive spirit quest season of gratitude stretching guru",
        "relive stretching guru s memory from daylight prairie",
    ],
    [
        "relive spirit quest season of rhythm troupe juggler",
        "relive troupe juggler s memory from valley of triumph",
    ],
    [
        "relive spirit quest season of enchantment indifferent alchemist",
        "relive indifferent alchemist s memory from golden wasteland",
    ],
    [
        "relive spirit quest season of gratitude saluting protector",
        "relive saluting protector s memory from golden wasteland",
    ],
    [
        "relive spirit quest valley of triumph proud victor",
        "relive proud victor s memory from valley of triumph",
    ],
    [
        "relive spirit quest season of lightseekers crab whisperer",
        "relive crab whisperer s memory from golden wasteland",
    ],
    [
        "relive spirit quest vault of knowledge levitating adept",
        "relive levitating adept s memory from vault of knowledge",
    ],
    [
        "relive spirit quest vault of knowledge meditating monastic",
        "relive meditating monastic s memory from vault of knowledge",
    ],
    [
        "relive spirit quest season of assembly chuckling scout",
        "relive chuckling scout s memory from hidden forest",
    ],
    [
        "relive spirit quest season of assembly daydreaming forester",
        "relive daydream forester s memory from hidden forest",
    ],
    [
        "relive spirit quest hidden forest tearful light miner",
        "relive tearful light miner s memory from hidden forest",
    ],
    [
        "relive spirit quest golden wasteland saluting captain",
        "relive saluting captain s memory from golden wasteland",
    ],
    [
        "meet up with cackling cannoneer in graveyard get launched",
        "meet up with cackling cannoneer in graveyard launch cackling cannoneer",
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
