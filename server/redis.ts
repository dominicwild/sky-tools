"use server"

import Redis from "ioredis"
import {getSkyDate, getSkyDateKeyFromIsoDate} from "@/lib/utils";
import {unstable_noStore as noStore} from 'next/cache';
import {questsData} from "@/data/questData";
import {
    createSkyHelperQuestMatchResponse,
    isSkyHelperQuestMatchResponseCurrent,
    resolveDailyQuestDisplayData,
    validateSkyHelperQuestMatchResponse,
    validateSkyHelperQuestResponse,
    type DailyQuestDisplayData,
    type SkyHelperQuestMatchResponse,
} from "@/lib/daily-quest-source";
import type {QuestValue} from "@/lib/quest-types";
import {createLocalQuestTitleIndex, getMatchingLocalQuestId} from "@/server/quest-title-matching";

const client = new Redis(`rediss://default:${process.env.REDIS_TOKEN}@${process.env.REDIS_URL}:6379`);

const SKY_HELPER_QUESTS_URL = "https://api.skyhelper.xyz/update/quests";
const SKY_HELPER_CACHE_TTL_SECONDS = 60 * 60 * 36;
const SKY_HELPER_MATCH_CACHE_VERSION = "v20";
const localQuestsByTitle = createLocalQuestTitleIndex(questsData);

export async function getSkyHelperQuestDisplayData(userQuestCounts: Promise<QuestValue>): Promise<DailyQuestDisplayData> {
    noStore();

    const [resolvedUserQuestCounts, skyHelperResponse] = await Promise.all([
        userQuestCounts,
        getSkyHelperQuestMatchResponse(),
    ]);

    return resolveDailyQuestDisplayData(skyHelperResponse, resolvedUserQuestCounts, questsData);
}

export async function getTodaysQuests(): Promise<QuestValue> {
    // Opt out of caching at the data fetch level
    noStore();

    const key = getSkyDate();
    const storedQuests = await client.hgetall(key)

    return Object.fromEntries(
        Object.entries(storedQuests).map(([questId, count]) => {
            const parsedCount = Number(count)
            if (!Number.isFinite(parsedCount)) {
                throw new Error(`Invalid quest count for quest ${questId}`)
            }

            return [questId, parsedCount]
        })
    )
}

async function getSkyHelperQuestMatchResponse() {
    const currentSkyDate = getSkyDate();
    const key = `sky-daily-api-matches:${SKY_HELPER_MATCH_CACHE_VERSION}:${currentSkyDate}`;
    const cachedResponse = await client.get(key);

    if (cachedResponse) {
        const parsedCachedResponse = parseSkyHelperQuestMatchResponse(cachedResponse);

        if (parsedCachedResponse && isSkyHelperQuestMatchResponseCurrent(parsedCachedResponse, questsData)) {
            return parsedCachedResponse;
        }
    }

    try {
        const response = await fetch(SKY_HELPER_QUESTS_URL, {cache: "no-store"});

        if (!response.ok) {
            return null;
        }

        const responseText = await response.text();
        const parsedResponse = parseSkyHelperQuestApiResponse(responseText);

        if (!parsedResponse) {
            return null;
        }

        if (getSkyDateKeyFromIsoDate(parsedResponse.sourceDate) !== currentSkyDate) {
            return null;
        }

        const questMatchResponse = createSkyHelperQuestMatchResponse(
            parsedResponse,
            (title) => getMatchingLocalQuestId(title, localQuestsByTitle),
        );

        await client.set(key, JSON.stringify(questMatchResponse), "EX", SKY_HELPER_CACHE_TTL_SECONDS);
        return questMatchResponse;
    } catch {
        return null;
    }
}

function parseSkyHelperQuestApiResponse(responseText: string) {
    try {
        return validateSkyHelperQuestResponse(JSON.parse(responseText));
    } catch {
        return null;
    }
}

function parseSkyHelperQuestMatchResponse(responseText: string): SkyHelperQuestMatchResponse | null {
    try {
        return validateSkyHelperQuestMatchResponse(JSON.parse(responseText));
    } catch {
        return null;
    }
}

export async function incrementQuest(id: number) {
    if (process.env.NODE_ENV !== 'production') {
        return;
    }
    console.log("increment quest id", id)
    const key = getSkyDate();
    client.hincrby(key, id + "", 1)
}
