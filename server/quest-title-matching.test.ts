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
    createQuest(37, "Collect Orange Light"),
    createQuest(51, "Relive Tearful Light Miner's memory from Hidden Forest"),
    createQuest(21, "Relive Stretching Guru's memory from Daylight Prairie"),
    createQuest(195, "Admire the rainbow in the Wind Paths for a short while"),
    createQuest(223, "Catch the 3 lights in The Wind Paths"),
    createQuest(150, "High-Five a Friend"),
    createQuest(246, "Meet up with Cackling Cannoneer in Graveyard - Play a prank on Ceasing Commodore"),
    createQuest(141, "Relive Meditating Monastic's memory from Vault of Knowledge"),
    createQuest(17, "Relive Slumbering Shipwright's memory from Daylight Prairie"),
    createQuest(39, "Recharge your light from a light bloom"),
    createQuest(222, "Catch the 3 lights in the big Treehouse"),
    createQuest(221, "Ride a giant manta in Sanctuary Islands"),
    createQuest(113, "Relive Indifferent Alchemist's memory from Golden Wasteland"),
];

describe("quest title matching", () => {
    it.each([
        ["Days of Rainbow 2021 - Daily Quest, Rainbow Location - Daylight Prairie", 10],
        ["Days of Rainbow 2021 - Daily Quest, Rainbow Location - Hidden Forest", 41],
        ["Coloured Light Quest - Orange Light in Hidden Forest", 37],
        ["Relive Spirit Quest Hidden Forest - Tearful Light Miner", 51],
        ["Relive Spirit Quest Season of Gratitude  - Stretching Guru", 21],
        ["Meditation Quest Guide Hidden Forest - Forest Clearing", 31],
        ["Days of Rainbow 2022 - Admire the Rainbow in the Wind Paths", 195],
        ["Catch the wandering lights in The Wind Paths", 223],
        ["Daily Quest Guide - High-Five a Friend", 150],
        ["Meet up with Cackling Cannoneer in Graveyard -  Play a prank on Ceasing Commodore", 246],
        ["Relive Spirit Quest Vault of Knowledge - Meditating Monastic", 141],
        ["Relive Spirit Quest Daylight Prairie - Slumbering Shipwright", 17],
        ["Recharge from a light bloom", 39],
        ["Catch the wandering lights in the Treehouse", 222],
        ["https://discord.com/channels/575762611111592007/575827924343848960/1453303732572786822\n\n>  How to get to the Sanctuary Islands", 221],
        ["Relive Spirit Quest Season of Enchantment  - Indifferent Alchemist", 113],
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
