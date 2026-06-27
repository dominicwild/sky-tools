import {describe, expect, it, vi} from "vitest";
import {createLocalQuestTitleIndex, getMatchingLocalQuestId} from "./quest-title-matching";
import type {Quest} from "@/lib/quest-types";

// @ts-expect-error Vitest supports virtual module mocks at runtime.
vi.mock("server-only", () => ({}), {virtual: true});
// @ts-expect-error Vitest supports virtual module mocks at runtime.
vi.mock("@/lib/daily-quest-source", async () => import("../lib/daily-quest-source"), {virtual: true});

const localQuests: Quest[] = [
    createQuest(10, "Find the candles at the end of the rainbow in the Daylight Prairie"),
    createQuest(21, "Relive Stretching Guru's memory from Daylight Prairie"),
];

describe("quest title matching", () => {
    it.each([
        ["Days of Rainbow 2021 - Daily Quest, Rainbow Location - Daylight Prairie", 10],
        ["Relive Spirit Quest Season of Gratitude  - Stretching Guru", 21],
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
