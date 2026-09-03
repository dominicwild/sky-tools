import {describe, expect, it, vi} from "vitest";
import {createLocalQuestTitleIndex, getMatchingLocalQuestId} from "./quest-title-matching";
import type {Quest} from "@/lib/quest-types";

// @ts-expect-error Vitest supports virtual module mocks at runtime.
vi.mock("server-only", () => ({}), {virtual: true});
// @ts-expect-error Vitest supports virtual module mocks at runtime.
vi.mock("@/lib/daily-quest-source", async () => import("../lib/daily-quest-source"), {virtual: true});

const localQuests: Quest[] = [
    createQuest(31, "Meditate at Forest's clearing"),
    createQuest(10, "Find the candles at the end of the rainbow in the Daylight Prairie"),
    createQuest(41, "Find the candles at the end of the rainbow in the Hidden Forest"),
    createQuest(7, "Collect Green Light"),
    createQuest(37, "Collect Orange Light"),
    createQuest(51, "Relive Tearful Light Miner's memory from Hidden Forest"),
    createQuest(21, "Relive Stretching Guru's memory from Daylight Prairie"),
    createQuest(26, "Relive Grateful Shell Collector's memory from Daylight Prairie"),
    createQuest(195, "Admire the rainbow in the Wind Paths for a short while"),
    createQuest(197, "Admire the rainbow in Treasure Reef for a short while"),
    createQuest(223, "Catch the 3 lights in The Wind Paths"),
    createQuest(150, "High-Five a Friend"),
    createQuest(246, "Meet up with Cackling Cannoneer in Graveyard - Play a prank on Ceasing Commodore"),
    createQuest(141, "Relive Meditating Monastic's memory from Vault of Knowledge"),
    createQuest(17, "Relive Slumbering Shipwright's memory from Daylight Prairie"),
    createQuest(15, "Relive Waving Bellmaker's memory from Daylight Prairie"),
    createQuest(39, "Recharge your light from a light bloom"),
    createQuest(222, "Catch the 3 lights in the big Treehouse"),
    createQuest(221, "Ride a giant manta in Sanctuary Islands"),
    createQuest(113, "Relive Indifferent Alchemist's memory from Golden Wasteland"),
    createQuest(125, "Relive Scarecrow Farmer's memory from Golden Wasteland"),
    createQuest(83, "Relive Saluting Protector's memory from Golden Wasteland"),
    createQuest(11, "Visit the cozy hideout in Prairie Caves"),
    createQuest(35, "Relive Daydream Forester's memory from Hidden Forest"),
    createQuest(86, "Relive Sparkler Parent's memory from Valley of Triumph"),
    createQuest(117, "Relive Saluting Captain's memory from Golden Wasteland"),
    createQuest(217, "Meditate in the Crab Fields"),
    createQuest(70, "Visit the Hotspring in the Village of Dreams"),
    createQuest(97, "Relive Spinning Mentor's memory from Valley of Triumph"),
    createQuest(91, "Relive Bowing Medalist's memory from Valley of Triumph"),
    createQuest(143, "Relive Shushing Light Scholar's memory from Vault of Knowledge"),
    createQuest(38, "Rescue a Manta from Darkness"),
];

describe("quest title matching", () => {
    it.each([
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
        ["Daily Quest Guide - High-Five a Friend", 150],
        ["Meet up with Cackling Cannoneer in Graveyard -  Play a prank on Ceasing Commodore", 246],
        ["Relive Spirit Quest Vault of Knowledge - Meditating Monastic", 141],
        ["Relive Spirit Quest Daylight Prairie - Slumbering Shipwright", 17],
        ["Relive Spirit Quest Daylight Prairie  - Waving Bellmaker", 15],
        ["Recharge from a light bloom", 39],
        ["Catch the wandering lights in the Treehouse", 222],
        ["https://discord.com/channels/575762611111592007/575827924343848960/1453303732572786822\n\n>  How to get to the Sanctuary Islands", 221],
        ["Relive Spirit Quest Season of Enchantment  - Indifferent Alchemist", 113],
        ["Relive Spirit Quest Season of Enchantment  - Scarecrow Farmer", 125],
        ["Relive Spirit Quest Season of Gratitude  - Saluting Protector", 83],
        ["Visiting the Social Light Area - Daylight Prairie, Prairie Cave", 11],
        ["Relive Spirit Quest Season of Assembly  - Daydreaming Forester", 35],
        ["Relive Spirit Quest Season of Belonging  - Sparkler Parent", 86],
        ["Relive Spirit Quest Golden Wasteland - Saluting Captain", 117],
        ["Meditation Quest Guide - Golden Wasteland - The Boat a.k.a The Crab Fields", 217],
        ["Relive Spirit Quest Season of Dreams  - Spinning Mentor", 97],
        ["Relive Spirit Quest Valley of Triumph - Bowing Medalist", 91],
        ["Visiting the Social Light Area - Valley of Triumph, Village of Dreams, Hotspring", 70],
        ["Relive Spirit Quest Season of Lightseekers - Shushing Light Scholar", 143],
        ["Rescue Manta Quest", 38],
    ])("matches SkyHelper alias %s", (title, expectedId) => {
        expect(getMatchingLocalQuestId(title, createLocalQuestTitleIndex(localQuests))).toBe(expectedId);
    });
});

function createQuest(id: number, questName: string): Quest {
    return {
        id,
        type: "Realm Quest",
        realm: "Daylight Prairie",
        questName,
        iconUrl: "icon.png",
        visualGuideUrl: null,
        videoGuideUrl: null,
    };
}
