import {describe, expect, it} from "vitest";
import {
    classifyAttachmentUrl,
    createSkyHelperQuestMatchResponse,
    isSkyHelperQuestMatchResponseCurrent,
    normalizeQuestTitle,
    resolveDailyQuestDisplayData,
    resolveDailyQuests,
    validateSkyHelperQuestResponse,
    type SkyHelperQuestResponse,
} from "./daily-quest-source";
import type {Quest} from "./quest-types";

const imageUrl = "https://cdn.discordapp.com/attachments/1/2/Image.jpeg?ex=123&is=456";
const videoUrl = "https://cdn.discordapp.com/attachments/1/2/Guide.mp4?ex=123&is=456";

const localQuests: Quest[] = [
    createLocalQuest(10, "Fallback low", "Hidden Forest"),
    createLocalQuest(11, "Fallback high", "Hidden Forest"),
    createLocalQuest(12, "Fallback middle", "Hidden Forest"),
    createLocalQuest(132, "Catch the light in the Vault of Knowledge", "Vault of Knowledge"),
    createLocalQuest(159, "Forge a candle", "General", "https://youtu.be/local-forge"),
    createLocalQuest(231, "Call to 5 different players", "General"),
];

const questTitleAliases = new Map([
    [
        "catch the light quest vault of knowledge",
        "catch the light in the vault of knowledge",
    ],
]);

describe("daily quest source", () => {
    it("parses a representative SkyHelper response", () => {
        const parsedResponse = validateSkyHelperQuestResponse(createRepresentativeResponse());

        expect(parsedResponse?.quests).toHaveLength(5);
        expect(parsedResponse?.sourceDate).toBe("2026-05-17T00:00:00.000-07:00");
        expect(parsedResponse?.quests[2]).toMatchObject({
            title: "Help Cackling Cannoneer or Star Collector find treasure in Starlight Desert - video guide",
            images: [{url: videoUrl, by: "@sky"}],
        });
    });

    it("matches, merges media, keeps external quests, and infers the unmatched realm", () => {
        const parsedResponse = validateSkyHelperQuestResponse(createRepresentativeResponse());
        expect(parsedResponse).not.toBeNull();

        const questMatches = createQuestMatchResponse(parsedResponse);
        const quests = resolveDailyQuests(questMatches, {}, localQuests);

        expect(quests).toHaveLength(4);
        expect(quests.map((quest) => quest.questName)).toEqual([
            "Call to 5 different players",
            "Catch the light in the Vault of Knowledge",
            "Help Cackling Cannoneer or Star Collector find treasure in Starlight Desert",
            "Forge a candle",
        ]);

        expect(quests[1]?.id).toBe(132);
        expect(quests[2]).toMatchObject({
            type: "SkyHelper Quest",
            realm: "Vault of Knowledge (?)",
            visualGuideUrl: imageUrl,
            videoGuideUrl: videoUrl,
        });
        expect(quests[3]).toMatchObject({
            id: 159,
            visualGuideUrl: "local-image.png",
            videoGuideUrl: "https://youtu.be/local-forge",
        });
    });

    it("detects Discord image and video attachments before query strings", () => {
        expect(classifyAttachmentUrl(imageUrl)).toBe("image");
        expect(classifyAttachmentUrl(videoUrl)).toBe("video");
    });

    it("parses candle guide groups without adding them to daily quests", () => {
        const parsedResponse = validateSkyHelperQuestResponse({
            ...createRepresentativeResponse(),
            seasonal_candles: {
                title: "Seasonal Candle Location - Hidden Forest - Rotation 1",
                date: "2026-05-19T00:00:00.000-07:00",
                images: [{url: imageUrl, by: "@AL"}],
            },
            rotating_candles: {
                title: "Rotating Treasure Candle Locations - Rotation 20 | Valley Of Triumph",
                date: "2026-05-19T00:00:00.000-07:00",
                images: [{url: videoUrl, by: "Clement"}],
            },
        });
        expect(parsedResponse).not.toBeNull();

        const displayData = resolveDailyQuestDisplayData(createQuestMatchResponse(parsedResponse), {}, localQuests);

        expect(displayData.quests).toHaveLength(4);
        expect(displayData.candleGuides).toEqual([
            {
                kind: "seasonal-candles",
                title: "Seasonal Candle Location - Hidden Forest - Rotation 1",
                realm: "Hidden Forest",
                visualGuideUrl: imageUrl,
                videoGuideUrl: null,
            },
            {
                kind: "candle-cakes",
                title: "Rotating Treasure Candle Locations - Rotation 20 | Valley Of Triumph",
                realm: "Valley of Triumph",
                visualGuideUrl: null,
                videoGuideUrl: videoUrl,
            },
        ]);
    });

    it.each([
        ["generic daily guide rows", "Daily Quest Guide -", "2026-05-31T00:00:00.000-07:00", "Clement"],
        ["SkyHelper title error rows", "[Quest Title Error]: Unknown", "2026-06-18T00:00:00.000-07:00", "@Ceverine"],
    ])("ignores %s", (_caseName, ignoredTitle, date, author) => {
        const parsedResponse = validateSkyHelperQuestResponse({
            quests: [
                {
                    title: ignoredTitle,
                    date,
                    images: [{url: imageUrl, by: author}],
                },
                {
                    title: "Forge a Candle",
                    date,
                    images: [],
                },
            ],
        });
        expect(parsedResponse).not.toBeNull();

        const questMatches = createQuestMatchResponse(parsedResponse);

        expect(questMatches?.quests).toEqual([
            {
                localQuestId: 159,
                title: null,
                visualGuideUrl: null,
                videoGuideUrl: null,
            },
        ]);
    });

    it("rejects cached match responses that reference removed local quest ids", () => {
        const parsedResponse = validateSkyHelperQuestResponse({
            quests: [
                {
                    title: "Forge a Candle",
                    date: "2026-05-31T00:00:00.000-07:00",
                    images: [],
                },
            ],
        });
        expect(parsedResponse).not.toBeNull();

        const questMatches = createQuestMatchResponse(parsedResponse);
        if (!questMatches) {
            throw new Error("Expected quest matches");
        }

        expect(isSkyHelperQuestMatchResponseCurrent(questMatches, localQuests)).toBe(true);
        expect(isSkyHelperQuestMatchResponseCurrent({
            ...questMatches,
            quests: [
                {
                    localQuestId: 243,
                    title: null,
                    visualGuideUrl: null,
                    videoGuideUrl: null,
                },
            ],
        }, localQuests)).toBe(false);
    });

    it("falls back to top user-selected quests when SkyHelper gives fewer than four quests", () => {
        const parsedResponse = validateSkyHelperQuestResponse({
            quests: [
                {
                    title: "Forge a Candle",
                    date: "2026-05-17T00:00:00.000-07:00",
                    images: [],
                },
            ],
        });
        expect(parsedResponse).not.toBeNull();

        const quests = resolveDailyQuests(createQuestMatchResponse(parsedResponse), {
            "10": 2,
            "11": 9,
            "12": 4,
            "159": 99,
        }, localQuests);

        expect(quests.map((quest) => quest.id)).toEqual([159, 11, 12, 10]);
    });

    it("uses user-selected data entirely when SkyHelper data is unavailable", () => {
        const quests = resolveDailyQuests(null, {
            "10": 2,
            "11": 9,
            "12": 4,
            "132": 1,
        }, localQuests);

        expect(quests.map((quest) => quest.id)).toEqual([11, 12, 10, 132]);
    });
});

function createRepresentativeResponse() {
    return {
        last_updated: "2026-05-17T00:00:00.000-07:00",
        quests: [
            {
                title: "Call to 5 different players",
                date: "2026-05-17T00:00:00.000-07:00",
                images: [{url: imageUrl, by: "@Ceverine", source: "https://discord.com/source"}],
            },
            {
                title: "Catch The Light Quest - Vault of Knowledge",
                date: "2026-05-17T00:00:00.000-07:00",
                images: [{url: imageUrl, by: "Clement", source: "https://discord.com/source"}],
            },
            {
                title: "Help Cackling Cannoneer or Star Collector find treasure in Starlight Desert - video guide",
                date: "2026-05-17T00:00:00.000-07:00",
                images: [{url: videoUrl, by: "@sky"}],
            },
            {
                title: "Help Cackling Cannoneer or Star Collector find treasure in Starlight Desert",
                date: "2026-05-17T00:00:00.000-07:00",
                images: [{url: imageUrl, by: "@AL", source: "https://discord.com/source"}],
            },
            {
                title: "Forge a Candle",
                date: "2026-05-17T00:00:00.000-07:00",
                images: [{url: imageUrl, by: "@Ceverine", source: "https://discord.com/source"}],
            },
        ],
    };
}

function createQuestMatchResponse(response: SkyHelperQuestResponse | null) {
    if (!response) {
        return null;
    }

    const localQuestsByTitle = new Map(
        localQuests.map((quest) => [normalizeQuestTitle(quest.questName), quest.id ?? null]),
    );

    return createSkyHelperQuestMatchResponse(response, (title) => {
        const normalizedTitle = normalizeQuestTitle(title);
        const aliasTitle = questTitleAliases.get(normalizedTitle);

        return localQuestsByTitle.get(aliasTitle ?? normalizedTitle) ?? null;
    });
}

function createLocalQuest(id: number, questName: string, realm: string, videoGuideUrl: string | null = null): Quest {
    return {
        id,
        type: realm === "General" ? "General Quest" : "Realm Quest",
        realm,
        questName,
        iconUrl: "icon.png",
        visualGuideUrl: "local-image.png",
        videoGuideUrl,
    };
}
