import type {Quest, QuestValue} from "./quest-types";

const QUEST_LIMIT = 4;

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif"]);
const VIDEO_EXTENSIONS = new Set([".mp4", ".webm", ".mov"]);
const NON_REAL_REALMS = new Set(["General", "Seasonal/Event"]);

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

export type SkyHelperQuestResponse = {
    quests: SkyHelperQuest[]
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
}

export function normalizeQuestTitle(title: string) {
    return title
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s]/gu, " ")
        .replace(/\s+/g, " ")
        .trim();
}

export function validateSkyHelperQuestResponse(value: unknown): SkyHelperQuestResponse | null {
    const questRecords = getQuestRecords(value);

    if (!questRecords) {
        return null;
    }

    const quests: SkyHelperQuest[] = [];

    for (const quest of questRecords) {
        if (typeof quest.title !== "string" || typeof quest.date !== "string") {
            return null;
        }

        if (!Array.isArray(quest.images)) {
            return null;
        }

        const images: SkyHelperMedia[] = [];
        for (const image of quest.images) {
            if (!isRecord(image) || typeof image.url !== "string" || typeof image.by !== "string") {
                return null;
            }

            const source = image.source;
            if (source !== undefined && typeof source !== "string") {
                return null;
            }

            images.push({
                url: image.url,
                by: image.by,
                source,
            });
        }

        quests.push({
            title: quest.title,
            date: quest.date,
            images,
        });
    }

    return {quests};
}

export function validateSkyHelperQuestMatchResponse(value: unknown): SkyHelperQuestMatchResponse | null {
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

    return {quests};
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
    };
}

export function getTopUserSelectedQuests(
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

function isStringOrNull(value: unknown): value is string | null {
    return value === null || typeof value === "string";
}
