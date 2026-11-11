import "server-only";

import {normalizeQuestTitle} from "@/lib/daily-quest-source";
import type {Quest} from "@/lib/quest-types";

export const QUEST_TITLE_ALIASES = new Map([
    [
        "meditate atop the entrance to the citadel citadel arch",
        "meditate atop the entrance to the citadel",
    ],
    [
        "meditation quest guide daylight prairie cave",
        "meditate in prairie cave",
    ],
    [
        "relive spirit quest season of dreams dancing performer",
        "relive dancing performer s memory from valley of triumph",
    ],
    [
        "relive spirit quest season of gratitude provoking performer",
        "relive provoking performer s memory from hidden forest",
    ],
    [
        "meditation quest guide golden wasteland battlefield",
        "meditate on the battlefield",
    ],
    [
        "relive spirit quest valley of triumph cheerful spectator",
        "relive cheerful spectator s memory from valley of triumph",
    ],
    [
        "relive spirit quest valley of triumph manta whisperer",
        "relive manta whisperer s memory from valley of triumph",
    ],
    [
        "relive spirit quest hidden forest blushing prospector",
        "relive blushing prospector s memory from hidden forest",
    ],
    [
        "meet up with nightbird whisperer in prairie village deep call the butterflies in the cave with jolly geologist video guide",
        "deep call the butterflies in the cave with jolly geologist",
    ],
    [
        "daily quest guide sit on a bench with a stranger",
        "sit on a bench with a stranger",
    ],
    [
        "relive spirit quest hidden forest shivering trailblazer",
        "relive shivering trailblazer s memory from hidden forest",
    ],
    [
        "daily quest guide relive a spirit s memory",
        "relive a spirit s memories in a given realm",
    ],
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
        "admire the sapling in the vault of knowledge for a short while",
    ],
    [
        "days of bloom 2021 admire sapling quest golden wasteland",
        "admire the sapling in golden wasteland for a short while",
    ],
    [
        "days of bloom 2021 admire sapling quest hidden forest",
        "admire the sapling in the hidden forest for a short while",
    ],
    [
        "days of rainbow 2021 daily quest rainbow location golden wasteland",
        "find the candles at the end of the rainbow in the golden wasteland",
    ],
    [
        "days of rainbow 2021 daily quest rainbow location vault of knowledge",
        "find the candles at the end of the rainbow in the vault of knowledge",
    ],
    [
        "days of rainbow 2021 daily quest rainbow location daylight prairie",
        "find the candles at the end of the rainbow in daylight prairie",
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
        "hold a friend s hand",
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
        "visiting the social light area valley of triumph village of dreams hotspring",
        "visit the hotspring in the village of dreams",
    ],
    [
        "daily quest guide make a new acquaintance",
        "make a new acquaintance",
    ],
    [
        "daily quest guide recharge from a jellyfish",
        "recharge your light from a jellyfish",
    ],
    [
        "recharge from a light bloom",
        "recharge your light from a light bloom",
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
        "relive spirit quest season of belonging confetti cousin",
        "relive confetti cousin s memory from daylight prairie",
    ],
    [
        "relive spirit quest season of belonging wise grandparent",
        "relive wise grandparent s memory from vault of knowledge",
    ],
    [
        "meditation quest guide daylight prairie koi pond",
        "meditate by the koi pond outside the temple of the prairie",
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
        "meditate on the second floor of the vault",
    ],
    [
        "meditation quest hidden forest boneyard",
        "meditate by the forest s boneyard",
    ],
    [
        "meditation quest hidden forest forest s brook",
        "meditate above the forest brook",
    ],
    [
        "meditation quest guide hidden forest forest clearing",
        "meditate outside the forest courtyard",
    ],
    [
        "meditation quest guide golden wasteland the boat a k a the crab fields",
        "meditate in the crab fields",
    ],
    [
        "meditation quest golden wasteland forgotten ark",
        "meditate by the forgotten ark",
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
        "rescue manta quest",
        "rescue a manta from darkness",
    ],
    [
        "relive spirit quest hidden forest pouty porter",
        "relive pouty porter s memory from hidden forest",
    ],
    [
        "relive spirit quest hidden forest hide n seek pioneer",
        "relive hide n seek pioneer s memory from hidden forest",
    ],
    [
        "tidy up the ancestor s table of belonging in hidden forest s elevated clearing",
        "visit the ancestor s table in the elevated clearing",
    ],
    [
        "relive spirit quest season of belonging hairtousle teen",
        "relive hairtousle teen s memory from hidden forest",
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
        "relive spirit quest season of sanctuary grateful shell collector",
        "relive grateful shell collector s memory from daylight prairie",
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
        "meet up with anxious angler in golden wasteland catch a fish",
        "catch a fish",
    ],
    [
        "catch the light quest daylight prairie",
        "catch the light in daylight prairie",
    ],
    [
        "meditation quest guide daylight prairie faerie ring a k a prairie village",
        "meditate in prairie village",
    ],
    [
        "fly with many butterflies in the butterfly fields",
        "fly with many butterflies in butterfly fields",
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
        "days of rainbow 2022 admire the rainbow in the treasure reef",
        "admire the rainbow in treasure reef for a short while",
    ],
    [
        "days of rainbow 2022 admire the rainbow in the hermit valley",
        "admire the rainbow in hermit valley for a short while",
    ],
    [
        "meditation quest guide valley of triumph ice rink meditate overlooking the frozen lake",
        "meditate overlooking the frozen lake",
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
        "relive spirit quest valley of triumph bowing medalist",
        "relive bowing medalist s memory from valley of triumph",
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
        "relive spirit quest season of enchantment nodding muralist",
        "relive nodding muralist s memory from golden wasteland",
    ],
    [
        "relive spirit quest season of enchantment scarecrow farmer",
        "relive scarecrow farmer s memory from golden wasteland",
    ],
    [
        "relive spirit quest season of enchantment crab walker",
        "relive crab walker s memory from golden wasteland",
    ],
    [
        "relive spirit quest season of gratitude saluting protector",
        "relive saluting protector s memory from golden wasteland",
    ],
    [
        "relive spirit quest season of dreams spinning mentor",
        "relive spinning mentor s memory from valley of triumph",
    ],
    [
        "relive spirit quest season of dreams bearhug hermit",
        "relive bearhug hermit s memory from valley of triumph",
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
        "relive spirit quest season of lightseekers shushing light scholar",
        "relive shushing light scholar s memory from vault of knowledge",
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
        "relive spirit quest vault of knowledge praying acolyte",
        "relive praying acolyte s memory from vault of knowledge",
    ],
    [
        "relive spirit quest vault of knowledge polite scholar",
        "relive polite scholar s memory from vault of knowledge",
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
        "launch cackling cannoneer",
    ],
    [
        "map of the treasure reef surface",
        "catch a fish",
    ],
    [
        "meditation quest daylight prairie bird nest shrine",
        "meditate by the bird nest",
    ],
    [
        "meditation quest guide daylight prairie butterfly fields",
        "meditate in butterfly fields",
    ],
    [
        "meditation quest guide vault of knowledge vault summit a k a vault temple",
        "meditate at the temple of the vault",
    ],
    [
        "meditation quest guide golden wasteland broken temple",
        "meditate in the broken temple",
    ],
    [
        "meditate in prairie s butterfly field",
        "meditate in butterfly fields",
    ],
    [
        "meditate at prairie s cave shrine",
        "meditate in prairie cave",
    ],
    [
        "meditate at prairie s bird nest shrine",
        "meditate by the bird nest",
    ],
    [
        "meditate at the sanctuary islands",
        "meditate in sanctuary islands",
    ],
    [
        "meditate at prairie s faerie ring",
        "meditate in prairie village",
    ],
    [
        "meditate by prairie s koi pond",
        "meditate by the koi pond outside the temple of the prairie",
    ],
    [
        "find the candles at the end of the rainbow in the daylight prairie",
        "find the candles at the end of the rainbow in daylight prairie",
    ],
    [
        "meditate at forest s clearing",
        "meditate outside the forest courtyard",
    ],
    [
        "meditate above the forest s brook",
        "meditate above the forest brook",
    ],
    [
        "meditate in forest s boneyard",
        "meditate by the forest s boneyard",
    ],
    [
        "meditate at forest s end",
        "meditate at the sacred pond",
    ],
    [
        "meditate at forest s elevated clearing",
        "meditate in the elevated clearing",
    ],
    [
        "admire the sapling in hidden forest for a short while",
        "admire the sapling in the hidden forest for a short while",
    ],
    [
        "visit the ancestor s table of belonging in forest s elevated clearing",
        "visit the ancestor s table in the elevated clearing",
    ],
    [
        "meditate by valley s ice rink",
        "meditate overlooking the frozen lake",
    ],
    [
        "meditate high above the valley s citadel",
        "meditate high above the citadel",
    ],
    [
        "meditate above valley s citadel arch",
        "meditate atop the entrance to the citadel",
    ],
    [
        "meditate at the end of the race",
        "meditate at the temple of the valley",
    ],
    [
        "rehearse for a performance with the skater in the coliseum",
        "rehearse for a performance with the skater in the temple of the valley",
    ],
    [
        "meditate in the graveyard",
        "meditate at the edge of the graveyard",
    ],
    [
        "meditate on the boat shipwreck",
        "meditate in the crab fields",
    ],
    [
        "meditate in the forgotten ark",
        "meditate by the forgotten ark",
    ],
    [
        "find the candles at the end of the rainbow in the golden wasteland forgotten ark",
        "find the candles at the end of the rainbow in the golden wasteland",
    ],
    [
        "meditate at vault s summit",
        "meditate at the temple of the vault",
    ],
    [
        "meditate at vault s second floor",
        "meditate on the second floor of the vault",
    ],
    [
        "admire the sapling in vault of knowledge for a short while",
        "admire the sapling in the vault of knowledge for a short while",
    ],
    [
        "hold the hand of a friend",
        "hold a friend s hand",
    ],
    [
        "sit at a bench with a stranger",
        "sit on a bench with a stranger",
    ],
    [
        "collect cyan light in isle of dawn",
        "collect cyan light",
    ],
    [
        "collect green light in daylight prairie",
        "collect green light",
    ],
    [
        "collect orange light in hidden forest",
        "collect orange light",
    ],
    [
        "collect blue light in valley of triumph",
        "collect blue light",
    ],
    [
        "collect red light in golden wasteland",
        "collect red light",
    ],
    [
        "collect purple light in vault of knowledge",
        "collect purple light",
    ],
    [
        "catch the 3 lights in the forest brook",
        "catch the wandering lights in the forest brook",
    ],
    [
        "catch the 3 lights during the valley s sliding race",
        "catch the wandering lights along the lower valley track",
    ],
    [
        "catch the 3 lights in prairie village",
        "catch the wandering lights in prairie village",
    ],
    [
        "catch the 3 lights in the big treehouse",
        "catch the wandering lights in the treehouse",
    ],
    [
        "catch the 3 lights in the wind paths",
        "catch the wandering lights in the wind paths",
    ],
    [
        "catch the 3 lights in valley s citadel",
        "catch the wandering lights in the citadel",
    ],
    [
        "catch the 3 lights under the sea in treasure reef",
        "catch the wandering lights under the sea in treasure reef",
    ],
    [
        "meet up with flight guide in prairie read a book together with flight guide",
        "read a book together with flight guide",
    ],
    [
        "meet up with flight guide in prairie village help bring flight guide up to the temple entrance",
        "help bring flight guide up to the temple entrance",
    ],
    [
        "meet up with flight guide in temple of the prairie join flight guide and meditate to reminisce the prairie",
        "join flight guide and meditate to reminisce the prairie elder",
    ],
    [
        "meet up with cackling cannoneer in graveyard launch cackling cannoneer",
        "launch cackling cannoneer",
    ],
    [
        "meet up with cackling cannoneer in graveyard play a prank on ceasing commodore",
        "play a prank on ceasing commodore",
    ],
    [
        "meet up with bearhug hermit in hermit valley admire shared spaces with bearhug hermit",
        "admire shared spaces with bearhug hermit",
    ],
    [
        "meet up with pleading child in repository of refuge help pleading child retrieve their lost memory lanterns",
        "help pleading child retrieve their lost memory lanterns",
    ],
    [
        "meet up with pleading child in repository of refuge help pleading child find their lost toy",
        "help pleading child find their lost toy",
    ],
    [
        "meet up with thoughtful director in vault rest meditate with thoughtful director",
        "meditate with thoughtful director",
    ],
    [
        "meet up with thoughtful director in vault rest sneak with thoughtful director and surprise their friends",
        "sneak with thoughtful director and surprise their friends",
    ],
    [
        "meditation quest guide valley of triumph coliseum",
        "meditate at the temple of the valley",
    ],
    [
        "meet up with admiring actor in bird nest learn how to play the instrument with admiring actor",
        "learn how to play the instrument with admiring actor",
    ],
    [
        "meet up with thoughtful director in repository of refuge join the session and play a song for bereft veteran",
        "join the session and play a song for bereft veteran",
    ],
    [
        "meet up with oddball outcast in boneyard introduce oddball outcast to a big surprise by activating the temple bridge",
        "introduce oddball outcast to a big surprise by activating the temple bridge",
    ],
    [
        "meet up with anxious angler in treasure reef catch a fish",
        "catch a fish",
    ],
    [
        "meet up with forgetful storyteller in village of dreams bring the gift to modest dancer",
        "bring the gift to modest dancer",
    ],
    [
        "meet up with nightbird whisperer in prairie village deep call the butterflies with nightbird whisperer",
        "deep call the butterflies with nightbird whisperer",
    ],
    [
        "meet up with nightbird whisperer in prairie village deep call the butterflies in the cave with jolly geologist",
        "deep call the butterflies in the cave with jolly geologist",
    ],
    [
        "meet up with nightbird whisperer in prairie village bring nightbird whisperer to the manta",
        "bring nightbird whisperer to the manta",
    ],
    [
        "meet up with crab whisperer in crab fields help saluting captain to keep crabs away from crab whisperer",
        "help saluting captain to keep crabs away from crab whisperer",
    ],
    [
        "meet up with crab whisperer in crab fields crabwalk with the spirits",
        "crabwalk with the spirits",
    ],
    [
        "meet up with crab whisperer in crab fields reach above the pipes together with the crab",
        "reach above the pipes together with the crab",
    ],
]);

export function createLocalQuestTitleIndex(localQuests: Quest[]) {
    return new Map(localQuests.map((quest) => [normalizeQuestTitle(quest.questName), quest]));
}

export function getMatchingLocalQuestId(title: string, localQuestsByTitle: Map<string, Quest>) {
    const normalizedTitle = normalizeQuestTitle(title).replace(/\s+by$/, "");
    const aliasTitle = QUEST_TITLE_ALIASES.get(normalizedTitle);
    const matchedQuest = localQuestsByTitle.get(aliasTitle ?? normalizedTitle);

    return matchedQuest?.id ?? null;
}
