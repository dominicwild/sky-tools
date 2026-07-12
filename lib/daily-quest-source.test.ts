import {describe, expect, it} from "vitest";
import {
    classifyAttachmentUrl,
    createSkyHelperQuestMatchResponse,
    createThatSkyDailyGuidesQuestMatchResponse,
    isSkyHelperQuestMatchResponseCurrent,
    normalizeQuestTitle,
    parseThatSkyDailyGuidesHtml,
    resolveDailyQuestDisplayData,
    resolveDailyQuests,
    validateSkyHelperQuestResponse,
    type ThatSkyDailyGuidesResponse,
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
    createLocalQuest(160, "Light 20 candles", "General"),
    createLocalQuest(222, "Catch the 3 lights in the big Treehouse", "Hidden Forest"),
    createLocalQuest(230, "Use expressions with players", "General"),
    createLocalQuest(168, "Hold the hand of a friend", "General"),
    createLocalQuest(39, "Recharge your light from a light bloom", "Hidden Forest"),
    createLocalQuest(231, "Call to 5 different players", "General"),
];

const questTitleAliases = new Map([
    [
        "catch the light quest vault of knowledge",
        "catch the light in the vault of knowledge",
    ],
    [
        "social quest guide hold a friend s hand",
        "hold the hand of a friend",
    ],
    [
        "recharge from a light bloom",
        "recharge your light from a light bloom",
    ],
    [
        "catch the wandering lights in the treehouse",
        "catch the 3 lights in the big treehouse",
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
                date: "2026-05-17T00:00:00.000-07:00",
                images: [{url: imageUrl, by: "@AL"}],
            },
            rotating_candles: {
                title: "Rotating Treasure Candle Locations - Rotation 20 | Valley Of Triumph",
                date: "2026-05-17T00:00:00.000-07:00",
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

    it("uses current candle guide quest rows before stale candle guide groups", () => {
        const parsedResponse = validateSkyHelperQuestResponse({
            quests: [
                {
                    title: "Forge a Candle",
                    date: "2026-06-25T00:00:00.000-07:00",
                    images: [],
                },
                {
                    title: "Double Treasure Candle Locations - Vault of Knowledge",
                    date: "2026-06-25T00:00:00.000-07:00",
                    images: [{url: imageUrl, by: "Clement"}],
                },
            ],
            rotating_candles: {
                title: "Rotating Treasure Candle Locations - Rotation 20 | Valley Of Triumph",
                date: "2026-06-18T07:00:00.000Z",
                images: [{url: videoUrl, by: "Clement"}],
            },
        });
        expect(parsedResponse).not.toBeNull();

        const displayData = resolveDailyQuestDisplayData(createQuestMatchResponse(parsedResponse), {}, localQuests);

        expect(displayData.quests.map((quest) => quest.questName)).toEqual(["Forge a candle"]);
        expect(displayData.candleGuides).toEqual([
            {
                kind: "candle-cakes",
                title: "Double Treasure Candle Locations - Vault of Knowledge",
                realm: "Vault of Knowledge",
                visualGuideUrl: imageUrl,
                videoGuideUrl: null,
            },
        ]);
    });

    it("ignores placeholder candle guide titles", () => {
        const parsedResponse = validateSkyHelperQuestResponse({
            quests: [
                {
                    title: "Forge a Candle",
                    date: "2026-06-23T00:00:00.000-07:00",
                    images: [],
                },
            ],
            seasonal_candles: {
                title: "[Quest Title Error]: Unknown",
                date: "2026-06-23T00:00:00.000-07:00",
                images: [{url: imageUrl, by: "@AL"}],
            },
            rotating_candles: createCandleGroup(
                "Rotating Treasure Candle Locations - Rotation 20 | Valley Of Triumph",
                "2026-06-23T00:00:00.000-07:00",
            ),
        });
        expect(parsedResponse).not.toBeNull();

        const displayData = resolveDailyQuestDisplayData(createQuestMatchResponse(parsedResponse), {}, localQuests);

        expect(displayData.candleGuides).toEqual([
            createExpectedCandleCakeGuide("Rotating Treasure Candle Locations - Rotation 20 | Valley Of Triumph", "Valley of Triumph"),
        ]);
    });

    it.each([
        ["generic daily guide rows", "Daily Quest Guide -", "2026-05-31T00:00:00.000-07:00", "Clement"],
        ["SkyHelper title error rows", "[Quest Title Error]: Unknown", "2026-06-18T00:00:00.000-07:00", "@Ceverine"],
        ["candle guide rows", "Double Treasure Candle Locations - Golden Wasteland", "2026-06-19T00:00:00.000-07:00", "Clement"],
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

    it("ignores stale optional candle guide groups", () => {
        const parsedResponse = validateSkyHelperQuestResponse({
            last_updated: "2026-07-04T00:00:00.000-07:00",
            quests: [
                {
                    title: "Forge a Candle",
                    date: "2026-07-04T00:00:00.000-07:00",
                    images: [],
                },
            ],
            seasonal_candles: {
                title: "Double Seasonal Candle Location - Daylight Prairie",
                date: "2026-07-02T00:00:00.000-07:00",
                images: [{url: imageUrl, by: "@AL"}],
            },
            rotating_candles: createCandleGroup(
                "Rotating Treasure Candle Locations - Rotation 1 | Golden Wasteland",
                "2026-07-04T00:00:00.000-07:00",
            ),
        });
        expect(parsedResponse).not.toBeNull();

        const displayData = resolveDailyQuestDisplayData(createQuestMatchResponse(parsedResponse), {}, localQuests);

        expect(displayData.candleGuides).toEqual([
            createExpectedCandleCakeGuide("Rotating Treasure Candle Locations - Rotation 1 | Golden Wasteland", "Golden Wasteland"),
        ]);
    });

    it("matches social quest guide wording through aliases", () => {
        const parsedResponse = validateSkyHelperQuestResponse({
            quests: [
                {
                    title: "Social Quest Guide - Hold a Friend’s Hand",
                    date: "2026-06-24T00:00:00.000-07:00",
                    images: [{url: imageUrl, by: "@asphyn_"}],
                },
            ],
        });
        expect(parsedResponse).not.toBeNull();

        const questMatches = createQuestMatchResponse(parsedResponse);

        expect(questMatches?.quests).toEqual([
            {
                localQuestId: 168,
                title: null,
                visualGuideUrl: imageUrl,
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

    it("does not fill missing SkyHelper quests from user-selected counts", () => {
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

        expect(quests.map((quest) => quest.id)).toEqual([159]);
    });

    it("does not guess daily quests when SkyHelper data is unavailable", () => {
        const quests = resolveDailyQuests(null, {
            "10": 2,
            "11": 9,
            "12": 4,
            "132": 1,
        }, localQuests);

        expect(quests).toEqual([]);
    });

    it("parses thatskyapplication daily guide HTML", () => {
        const parsedResponse = parseThatSkyDailyGuidesHtml(`
            <main>
                <h1>Wednesday, 8 July 2026</h1>
                <h2>Quests</h2>
                <p>1.Light 20 candles</p>
                <p>2.Catch the wandering lights in the Treehouse</p>
                <p>3.Recharge from a light bloom</p>
                <p>4.Use expressions with players</p>
                <h2>Treasure candles</h2>
            </main>
        `);

        expect(parsedResponse).toEqual({
            sourceDate: "2026-07-08T12:00:00.000-07:00",
            quests: [
                "Light 20 candles",
                "Catch the wandering lights in the Treehouse",
                "Recharge from a light bloom",
                "Use expressions with players",
            ],
        });
    });

    it("parses thatskyapplication daily guide Markdown", () => {
        const parsedResponse = parseThatSkyDailyGuidesHtml(`
            # Wednesday, 8 July 2026

            ## Quests

            1.Light 20 candles
            2.Catch the wandering lights in the Treehouse
            3.Recharge from a light bloom
            4.Use expressions with players

            ## Treasure candles
        `);

        expect(parsedResponse?.quests).toEqual([
            "Light 20 candles",
            "Catch the wandering lights in the Treehouse",
            "Recharge from a light bloom",
            "Use expressions with players",
        ]);
    });

    it("rejects Cloudflare challenge pages from thatskyapplication", () => {
        expect(parseThatSkyDailyGuidesHtml("<title>Just a moment...</title>")).toBeNull();
    });

    it("matches thatskyapplication daily guides to local quest data", () => {
        const questMatches = createThatSkyQuestMatchResponse({
            sourceDate: "2026-07-08T12:00:00.000-07:00",
            quests: [
                "Light 20 candles",
                "Catch the wandering lights in the Treehouse",
                "Recharge from a light bloom",
                "Use expressions with players",
            ],
        });

        const quests = resolveDailyQuests(questMatches, {}, localQuests);

        expect(quests.map((quest) => quest.questName)).toEqual([
            "Light 20 candles",
            "Catch the 3 lights in the big Treehouse",
            "Recharge your light from a light bloom",
            "Use expressions with players",
        ]);
        expect(quests.map((quest) => quest.visualGuideUrl)).toEqual([
            "local-image.png",
            "local-image.png",
            "local-image.png",
            "local-image.png",
        ]);
    });

    it("does not create external quests from unmatched thatskyapplication titles", () => {
        const questMatches = createThatSkyQuestMatchResponse({
            sourceDate: "2026-07-08T12:00:00.000-07:00",
            quests: [
                "Light 20 candles",
                "Secondary source wording not in local data",
            ],
        });

        const quests = resolveDailyQuests(questMatches, {}, localQuests);

        expect(quests.map((quest) => quest.questName)).toEqual(["Light 20 candles"]);
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

function createThatSkyQuestMatchResponse(response: ThatSkyDailyGuidesResponse | null) {
    if (!response) {
        return null;
    }

    const localQuestsByTitle = new Map(
        localQuests.map((quest) => [normalizeQuestTitle(quest.questName), quest.id ?? null]),
    );

    return createThatSkyDailyGuidesQuestMatchResponse(response, (title) => {
        const normalizedTitle = normalizeQuestTitle(title);
        const aliasTitle = questTitleAliases.get(normalizedTitle);

        return localQuestsByTitle.get(aliasTitle ?? normalizedTitle) ?? null;
    });
}

function createCandleGroup(title: string, date: string) {
    return {
        title,
        date,
        images: [{url: imageUrl, by: "Clement"}],
    };
}

function createExpectedCandleCakeGuide(title: string, realm: string) {
    return {
        kind: "candle-cakes",
        title,
        realm,
        visualGuideUrl: imageUrl,
        videoGuideUrl: null,
    };
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
