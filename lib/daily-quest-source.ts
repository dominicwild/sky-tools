import type {Quest, QuestValue} from "./quest-types";

const QUEST_LIMIT = 4;

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif"]);
const VIDEO_EXTENSIONS = new Set([".mp4", ".webm", ".mov"]);
const NON_REAL_REALMS = new Set(["General", "Seasonal/Event"]);
const CANDLE_GUIDE_REALMS = [
    "Isle of Dawn",
    "Daylight Prairie",
    "Hidden Forest",
    "Valley of Triumph",
    "Golden Wasteland",
    "Vault of Knowledge",
];

export type SkyHelperMedia = {
    url: string
    by: string
    source?: string
}

export type SkyHelperQuest = {
    title: string
    date: string
    images: SkyHelperMedia[]
}

export type SkyHelperGuideGroup = SkyHelperQuest

export type SkyHelperQuestResponse = {
    sourceDate: string
    quests: SkyHelperQuest[]
    seasonalCandles: SkyHelperGuideGroup | null
    rotatingCandles: SkyHelperGuideGroup | null
}

type MergedSkyHelperQuest = {
    title: string
    visualGuideUrl: string | null
    videoGuideUrl: string | null
}

type MatchedSkyHelperQuest = {
    localQuestId: number
    title: null
    visualGuideUrl: string | null
    videoGuideUrl: string | null
}

type ExternalSkyHelperQuest = {
    localQuestId: null
    title: string
    visualGuideUrl: string | null
    videoGuideUrl: string | null
}

export type SkyHelperQuestMatch = MatchedSkyHelperQuest | ExternalSkyHelperQuest

export type SkyHelperQuestMatchResponse = {
    quests: SkyHelperQuestMatch[]
    candleGuides: CandleGuide[]
}

export type CandleGuideKind = "seasonal-candles" | "candle-cakes"

export type CandleGuide = {
    kind: CandleGuideKind
    title: string
    realm: string | null
    visualGuideUrl: string | null
    videoGuideUrl: string | null
}

export type DailyQuestDisplayData = {
    quests: Quest[]
    candleGuides: CandleGuide[]
}

export function normalizeQuestTitle(title: string) {
    return title
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s]/gu, " ")
        .replace(/\s+/g, " ")
        .trim();
}

export function validateSkyHelperQuestResponse(value: unknown): SkyHelperQuestResponse | null {
    if (!isRecord(value)) {
        return null;
    }

    const questRecords = getQuestRecords(value);

    if (!questRecords) {
        return null;
    }

    const quests = parseGuideGroups(questRecords);

    if (!quests) {
        return null;
    }

    const sourceDate = getSkyHelperSourceDate(value, quests);
    if (!sourceDate) {
        return null;
    }

    const seasonalCandles = parseOptionalGuideGroup(value.seasonal_candles);
    const rotatingCandles = parseOptionalGuideGroup(value.rotating_candles);

    if (seasonalCandles === undefined || rotatingCandles === undefined) {
        return null;
    }

    return {sourceDate, quests, seasonalCandles, rotatingCandles};
}

export function validateSkyHelperQuestMatchResponse(value: unknown): SkyHelperQuestMatchResponse | null {
    if (!isRecord(value)) {
        return null;
    }

    const questRecords = getQuestRecords(value);

    if (!questRecords) {
        return null;
    }

    const quests: SkyHelperQuestMatch[] = [];

    for (const quest of questRecords) {
        const visualGuideUrl = quest.visualGuideUrl;
        const videoGuideUrl = quest.videoGuideUrl;

        if (!isStringOrNull(visualGuideUrl) || !isStringOrNull(videoGuideUrl)) {
            return null;
        }

        if (typeof quest.localQuestId === "number" && Number.isInteger(quest.localQuestId) && quest.title === null) {
            quests.push({
                localQuestId: quest.localQuestId,
                title: null,
                visualGuideUrl,
                videoGuideUrl,
            });
            continue;
        }

        if (quest.localQuestId === null && typeof quest.title === "string") {
            quests.push({
                localQuestId: null,
                title: quest.title,
                visualGuideUrl,
                videoGuideUrl,
            });
            continue;
        }

        return null;
    }

    const candleGuidesValue = value.candleGuides;
    const candleGuides = parseCandleGuides(candleGuidesValue);

    if (!candleGuides) {
        return null;
    }

    return {quests, candleGuides};
}

export function isSkyHelperQuestMatchResponseCurrent(
    response: SkyHelperQuestMatchResponse,
    localQuests: Quest[],
) {
    const localQuestIds = new Set(
        localQuests
            .map((quest) => quest.id)
            .filter((id): id is number => typeof id === "number"),
    );

    return response.quests.every((quest) => quest.localQuestId === null || localQuestIds.has(quest.localQuestId));
}

export function classifyAttachmentUrl(url: string): "image" | "video" | "unknown" {
    const pathname = getUrlPathname(url).toLowerCase();
    const extension = pathname.match(/\.[a-z0-9]+$/)?.[0];

    if (!extension) {
        return "unknown";
    }

    if (IMAGE_EXTENSIONS.has(extension)) {
        return "image";
    }

    if (VIDEO_EXTENSIONS.has(extension)) {
        return "video";
    }

    return "unknown";
}

export function createSkyHelperQuestMatchResponse(
    skyHelperResponse: SkyHelperQuestResponse,
    getLocalQuestId: (title: string) => number | null,
): SkyHelperQuestMatchResponse {
    return {
        quests: mergeSkyHelperQuestMedia(skyHelperResponse.quests).map((quest) => {
            const localQuestId = getLocalQuestId(quest.title);

            if (localQuestId === null) {
                return {
                    ...quest,
                    localQuestId,
                };
            }

            return {
                localQuestId,
                title: null,
                visualGuideUrl: quest.visualGuideUrl,
                videoGuideUrl: quest.videoGuideUrl,
            };
        }),
        candleGuides: createCandleGuides(skyHelperResponse),
    };
}

function getTopUserSelectedQuests(
    questCounts: QuestValue,
    localQuests: Quest[],
    excludedQuestIds = new Set<number>(),
    limit = QUEST_LIMIT,
) {
    return Object
        .entries(questCounts)
        .sort(([, countA], [, countB]) => countB - countA)
        .map(([questId]) => {
            const parsedQuestId = Number(questId);
            if (!Number.isInteger(parsedQuestId) || excludedQuestIds.has(parsedQuestId)) {
                return undefined;
            }

            return localQuests.find((quest) => quest.id === parsedQuestId);
        })
        .filter((quest): quest is Quest => quest !== undefined)
        .slice(0, limit);
}

export function resolveDailyQuests(
    skyHelperResponse: SkyHelperQuestMatchResponse | null,
    userQuestCounts: QuestValue,
    localQuests: Quest[],
) {
    if (!skyHelperResponse) {
        return getTopUserSelectedQuests(userQuestCounts, localQuests);
    }

    const skyHelperQuests = getSkyHelperDisplayQuests(skyHelperResponse, localQuests);
    const selectedQuestIds = new Set(
        skyHelperQuests
            .map((quest) => quest.id)
            .filter((questId): questId is number => questId !== undefined),
    );

    if (skyHelperQuests.length >= QUEST_LIMIT) {
        return skyHelperQuests.slice(0, QUEST_LIMIT);
    }

    return [
        ...skyHelperQuests,
        ...getTopUserSelectedQuests(
            userQuestCounts,
            localQuests,
            selectedQuestIds,
            QUEST_LIMIT - skyHelperQuests.length,
        ),
    ];
}

export function resolveDailyQuestDisplayData(
    skyHelperResponse: SkyHelperQuestMatchResponse | null,
    userQuestCounts: QuestValue,
    localQuests: Quest[],
): DailyQuestDisplayData {
    return {
        quests: resolveDailyQuests(skyHelperResponse, userQuestCounts, localQuests),
        candleGuides: skyHelperResponse?.candleGuides ?? [],
    };
}

function getSkyHelperDisplayQuests(response: SkyHelperQuestMatchResponse, localQuests: Quest[]) {
    const localQuestsById = new Map(
        localQuests
            .filter((quest): quest is Quest & { id: number } => quest.id !== undefined)
            .map((quest) => [quest.id, quest]),
    );

    const displayQuests = response.quests
        .map((apiQuest) => {
            if (apiQuest.localQuestId === null) {
                return createExternalQuest(apiQuest);
            }

            const matchedQuest = localQuestsById.get(apiQuest.localQuestId);

            if (!matchedQuest) {
                return null;
            }

            return {
                ...matchedQuest,
                visualGuideUrl: matchedQuest.visualGuideUrl ?? apiQuest.visualGuideUrl,
                videoGuideUrl: matchedQuest.videoGuideUrl ?? apiQuest.videoGuideUrl,
            };
        })
        .filter((quest): quest is Quest => quest !== null);

    const inferredRealm = getSingleMatchedRealm(displayQuests);

    return displayQuests.map((quest) => {
        if (quest.realm !== "Unknown (?)") {
            return quest;
        }

        return {
            ...quest,
            realm: inferredRealm ? `${inferredRealm} (?)` : quest.realm,
        };
    });
}

function mergeSkyHelperQuestMedia(apiQuests: SkyHelperQuest[]) {
    const mergedQuests = new Map<string, MergedSkyHelperQuest>();

    for (const quest of apiQuests) {
        const title = removeVideoGuideSuffix(quest.title);
        if (
            isGenericDailyQuestGuideTitle(title)
            || isSkyHelperTitleError(title)
            || isSkyHelperCandleGuideTitle(title)
        ) {
            continue;
        }

        const normalizedTitle = normalizeQuestTitle(title);
        const existingQuest = mergedQuests.get(normalizedTitle) ?? {
            title,
            visualGuideUrl: null,
            videoGuideUrl: null,
        };

        for (const image of quest.images) {
            const mediaType = classifyAttachmentUrl(image.url);

            if (mediaType === "image" && existingQuest.visualGuideUrl === null) {
                existingQuest.visualGuideUrl = image.url;
            }

            if (mediaType === "video" && existingQuest.videoGuideUrl === null) {
                existingQuest.videoGuideUrl = image.url;
            }
        }

        mergedQuests.set(normalizedTitle, existingQuest);
    }

    return [...mergedQuests.values()];
}

function createCandleGuides(response: SkyHelperQuestResponse): CandleGuide[] {
    return [
        createCandleGuide("seasonal-candles", response.seasonalCandles),
        createCandleGuide("candle-cakes", response.rotatingCandles),
    ].filter((guide): guide is CandleGuide => guide !== null);
}

function createCandleGuide(kind: CandleGuideKind, group: SkyHelperGuideGroup | null) {
    if (!group) {
        return null;
    }

    return {
        kind,
        title: group.title,
        realm: getCandleGuideRealm(group.title),
        ...getFirstMediaUrls(group.images),
    };
}

function getFirstMediaUrls(mediaItems: SkyHelperMedia[]) {
    const urls = {
        visualGuideUrl: null as string | null,
        videoGuideUrl: null as string | null,
    };

    for (const mediaItem of mediaItems) {
        const mediaType = classifyAttachmentUrl(mediaItem.url);

        if (mediaType === "image" && urls.visualGuideUrl === null) {
            urls.visualGuideUrl = mediaItem.url;
        }

        if (mediaType === "video" && urls.videoGuideUrl === null) {
            urls.videoGuideUrl = mediaItem.url;
        }
    }

    return urls;
}

function createExternalQuest(apiQuest: ExternalSkyHelperQuest): Quest {
    return {
        type: "SkyHelper Quest",
        realm: "Unknown (?)",
        questName: apiQuest.title,
        iconUrl: "",
        visualGuideUrl: apiQuest.visualGuideUrl,
        videoGuideUrl: apiQuest.videoGuideUrl,
    };
}

function getSingleMatchedRealm(quests: Quest[]) {
    const matchedRealms = new Set(
        quests
            .filter((quest) => quest.id !== undefined && !NON_REAL_REALMS.has(quest.realm))
            .map((quest) => quest.realm),
    );

    if (matchedRealms.size !== 1) {
        return null;
    }

    return [...matchedRealms][0];
}

function removeVideoGuideSuffix(title: string) {
    return title.replace(/\s*-\s*video guide\s*$/i, "");
}

function isGenericDailyQuestGuideTitle(title: string) {
    return /^daily quest guide\s*-?\s*$/i.test(title);
}

function isSkyHelperTitleError(title: string) {
    return /^\[quest title error\]:/i.test(title);
}

function isSkyHelperCandleGuideTitle(title: string) {
    return /(?:seasonal|treasure) candle locations?/i.test(title);
}

function getCandleGuideRealm(title: string) {
    const normalizedTitle = normalizeQuestTitle(title);

    return CANDLE_GUIDE_REALMS.find((realm) => normalizedTitle.includes(normalizeQuestTitle(realm))) ?? null;
}

function getUrlPathname(url: string) {
    try {
        return new URL(url).pathname;
    } catch {
        return url.split("?")[0] ?? url;
    }
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function getQuestRecords(value: unknown) {
    if (!isRecord(value) || !Array.isArray(value.quests)) {
        return null;
    }

    const quests: Record<string, unknown>[] = [];

    for (const quest of value.quests) {
        if (!isRecord(quest)) {
            return null;
        }

        quests.push(quest);
    }

    return quests;
}

function parseOptionalGuideGroup(value: unknown) {
    if (value === undefined || value === null) {
        return null;
    }

    if (!isRecord(value)) {
        return undefined;
    }

    return parseGuideGroup(value) ?? undefined;
}

function parseGuideGroups(records: Record<string, unknown>[]) {
    const groups: SkyHelperGuideGroup[] = [];

    for (const record of records) {
        const group = parseGuideGroup(record);

        if (!group) {
            return null;
        }

        groups.push(group);
    }

    return groups;
}

function getSkyHelperSourceDate(value: Record<string, unknown>, quests: SkyHelperQuest[]) {
    if (typeof value.last_updated === "string") {
        return value.last_updated;
    }

    return quests[0]?.date ?? null;
}

function parseGuideGroup(record: Record<string, unknown>) {
    if (typeof record.title !== "string" || typeof record.date !== "string" || !Array.isArray(record.images)) {
        return null;
    }

    const images = parseMediaItems(record.images);

    if (!images) {
        return null;
    }

    return {
        title: record.title,
        date: record.date,
        images,
    };
}

function parseMediaItems(items: unknown[]) {
    const mediaItems: SkyHelperMedia[] = [];

    for (const item of items) {
        if (!isRecord(item) || typeof item.url !== "string" || typeof item.by !== "string") {
            return null;
        }

        const source = item.source;
        if (source !== undefined && typeof source !== "string") {
            return null;
        }

        mediaItems.push({
            url: item.url,
            by: item.by,
            source,
        });
    }

    return mediaItems;
}

function parseCandleGuides(value: unknown) {
    if (!Array.isArray(value)) {
        return null;
    }

    const candleGuides: CandleGuide[] = [];

    for (const guide of value) {
        if (!isRecord(guide) || !isCandleGuideKind(guide.kind) || typeof guide.title !== "string") {
            return null;
        }

        const realm = guide.realm;
        const visualGuideUrl = guide.visualGuideUrl;
        const videoGuideUrl = guide.videoGuideUrl;

        if (!isStringOrNull(realm) || !isStringOrNull(visualGuideUrl) || !isStringOrNull(videoGuideUrl)) {
            return null;
        }

        candleGuides.push({
            kind: guide.kind,
            title: guide.title,
            realm,
            visualGuideUrl,
            videoGuideUrl,
        });
    }

    return candleGuides;
}

function isCandleGuideKind(value: unknown): value is CandleGuideKind {
    return value === "seasonal-candles" || value === "candle-cakes";
}

function isStringOrNull(value: unknown): value is string | null {
    return value === null || typeof value === "string";
}
