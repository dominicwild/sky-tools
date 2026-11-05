import {describe, expect, it, vi} from "vitest";
import {createLocalQuestTitleIndex, getMatchingLocalQuestId, QUEST_TITLE_ALIASES} from "./quest-title-matching";
import {questsData} from "../data/questData";

// @ts-expect-error Vitest supports virtual module mocks at runtime.
vi.mock("server-only", () => ({}), {virtual: true});
// @ts-expect-error Vitest supports virtual module mocks at runtime.
vi.mock("@/lib/daily-quest-source", async () => import("../lib/daily-quest-source"), {virtual: true});

const localQuestsByTitle = createLocalQuestTitleIndex(questsData);

describe("quest title matching", () => {
    it.each([
        ["Relive Spirit Quest Season of Gratitude  - Provoking Performer", 52],
        ["Meditation Quest Guide Golden Wasteland - Battlefield", 103],
        ["Relive Spirit Quest Valley of Triumph - Cheerful Spectator", 90],
        ["Days of Rainbow 2021 - Daily Quest, Rainbow Location - Daylight Prairie", 10],
        ["Days of Rainbow 2021 - Daily Quest, Rainbow Location - Hidden Forest", 41],
        ["Coloured Light Quest - Green Light in Daylight Prairie", 7],
        ["Coloured Light Quest - Orange Light in Hidden Forest", 37],
        ["Relive Spirit Quest Hidden Forest - Tearful Light Miner", 51],
        ["Relive Spirit Quest Season of Gratitude  - Stretching Guru", 21],
        ["Relive Spirit Quest Season of Sanctuary  - Grateful Shell Collector", 26],
        ["Meditation Quest Guide Hidden Forest - Forest Clearing", 31],
        ["Days of Rainbow 2022 - Admire the Rainbow in the Wind Paths", 195],
        ["Days of Rainbow 2022 - Admire the Rainbow in the Treasure Reef", 197],
        ["Catch the wandering lights in The Wind Paths", 223],
        ["Catch the wandering lights under the sea in Treasure Reef", 226],
        ["Daily Quest Guide - High-Five a Friend", 150],
        ["Meet up with Anxious Angler in Golden Wasteland - Catch a fish", 257],
        ["Map of the Treasure Reef (Surface)", 257],
        ["Meet up with Cackling Cannoneer in Graveyard -  Play a prank on Ceasing Commodore", 246],
        ["Relive Spirit Quest Vault of Knowledge - Meditating Monastic", 141],
        ["Relive Spirit Quest Daylight Prairie - Slumbering Shipwright", 17],
        ["Relive Spirit Quest Daylight Prairie  - Waving Bellmaker", 15],
        ["Recharge from a light bloom", 39],
        ["Catch the wandering lights in the Treehouse", 222],
        ["https://discord.com/channels/575762611111592007/575827924343848960/1453303732572786822\n\n>  How to get to the Sanctuary Islands", 221],
        ["Relive Spirit Quest Season of Enchantment  - Indifferent Alchemist", 127],
        ["Relive Spirit Quest Season of Enchantment - Nodding Muralist by", 126],
        ["Relive Spirit Quest Season of Enchantment  - Scarecrow Farmer", 125],
        ["Relive Spirit Quest Season of Gratitude  - Saluting Protector", 119],
        ["Visiting the Social Light Area - Daylight Prairie, Prairie Cave", 11],
        ["Relive Spirit Quest Season of Assembly  - Daydreaming Forester", 57],
        ["Relive Spirit Quest Season of Belonging  - Sparkler Parent", 95],
        ["Relive Spirit Quest Golden Wasteland - Saluting Captain", 117],
        ["Meditation Quest Guide - Golden Wasteland - The Boat a.k.a The Crab Fields", 104],
        ["Relive Spirit Quest Season of Dreams  - Spinning Mentor", 97],
        ["Relive Spirit Quest Season of Dreams  - Bearhug Hermit", 98],
        ["Relive Spirit Quest Valley of Triumph - Bowing Medalist", 91],
        ["Visiting the Social Light Area - Valley of Triumph, Village of Dreams, Hotspring", 70],
        ["Relive Spirit Quest Season of Lightseekers - Shushing Light Scholar", 143],
        ["Rescue Manta Quest", 38],
        ["Meditation Quest Guide Daylight Prairie - Faerie Ring a.k.a Prairie Village", 4],
        ["Catch the wandering lights in the Vault's Repository", 229],
        ["Catch the wandering lights in the Forest Brook", 214],
    ])("matches SkyHelper alias %s", (title, expectedId) => {
        expect(getMatchingLocalQuestId(title, localQuestsByTitle)).toBe(expectedId);
    });

    it("points every alias at a quest that exists", () => {
        const missingTargets = [...QUEST_TITLE_ALIASES.values()].filter((target) => !localQuestsByTitle.has(target));

        expect(missingTargets).toEqual([]);
    });
});
