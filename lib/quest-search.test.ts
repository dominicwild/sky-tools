import {describe, expect, it} from "vitest";
import {getHighlightParts, searchQuests} from "./quest-search";
import type {Quest} from "./quest-types";

const quests: Quest[] = [
    createQuest("Meditate above the Forest\x27s brook", "Hidden Forest"),
    createQuest("Catch the 3 lights in the big Treehouse", "Hidden Forest"),
    createQuest("Catch the 3 lights in the Forest Brook", "Hidden Forest"),
    createQuest("Relive Provoking Performer\x27s memory from Hidden Forest", "Hidden Forest"),
    createQuest("Recharge your light from a light bloom", "General"),
    createQuest("Forge a candle", "General"),
];

describe("quest search", () => {
    it("finds a quest from words that are not next to each other", () => {
        expect(getQuestNames("lights brook")).toEqual(["Catch the 3 lights in the Forest Brook"]);
    });

    it("finds a quest when one word of a longer query is missing from its name", () => {
        expect(getQuestNames("wandering lights forest brook")[0]).toBe("Catch the 3 lights in the Forest Brook");
    });

    it("tolerates typos", () => {
        expect(getQuestNames("provking performer")).toEqual(["Relive Provoking Performer\x27s memory from Hidden Forest"]);
    });

    it("matches the start of a word being typed", () => {
        expect(getQuestNames("recha")).toEqual(["Recharge your light from a light bloom"]);
    });

    it("ranks quests whose name matches above quests whose realm matches", () => {
        expect(getQuestNames("forest")[0]).toBe("Meditate above the Forest\x27s brook");
        expect(getQuestNames("forest").at(-1)).toBe("Catch the 3 lights in the big Treehouse");
    });

    it("ignores filler words unless the query has nothing else", () => {
        expect(getQuestNames("the forge")).toEqual(["Forge a candle"]);
        expect(getQuestNames("a")).toContain("Forge a candle");
    });

    it("returns nothing for an empty query", () => {
        expect(searchQuests(quests, "  ")).toEqual([]);
    });

    it("highlights each matched word", () => {
        expect(getHighlightParts("Catch the 3 lights in the Forest Brook", "brook light")).toEqual([
            {text: "Catch", isMatch: false},
            {text: " ", isMatch: false},
            {text: "the", isMatch: false},
            {text: " ", isMatch: false},
            {text: "3", isMatch: false},
            {text: " ", isMatch: false},
            {text: "lights", isMatch: true},
            {text: " ", isMatch: false},
            {text: "in", isMatch: false},
            {text: " ", isMatch: false},
            {text: "the", isMatch: false},
            {text: " ", isMatch: false},
            {text: "Forest", isMatch: false},
            {text: " ", isMatch: false},
            {text: "Brook", isMatch: true},
        ]);
    });
});

function getQuestNames(query: string) {
    return searchQuests(quests, query).map((quest) => quest.questName);
}

function createQuest(questName: string, realm: string): Quest {
    return {
        type: realm === "General" ? "General Quest" : "Realm Quest",
        realm,
        questName,
        iconUrl: "icon.png",
        visualGuideUrl: null,
        videoGuideUrl: null,
    };
}
