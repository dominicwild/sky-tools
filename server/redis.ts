"use server"

import Redis from "ioredis"
import {getSkyDate} from "@/lib/utils";
import {unstable_noStore as noStore} from 'next/cache';
import {questsData} from "@/data/questData";
import {
    resolveDailyQuests,
    validateSkyHelperQuestResponse,
    type SkyHelperQuestResponse,
} from "@/lib/daily-quest-source";
import type {Quest, QuestValue} from "@/lib/quest-types";

const client = new Redis(`rediss://default:${process.env.REDIS_TOKEN}@${process.env.REDIS_URL}:6379`);

const SKY_HELPER_QUESTS_URL = "https://api.skyhelper.xyz/update/quests";
const SKY_HELPER_CACHE_TTL_SECONDS = 60 * 60 * 36;

export async function getTodaysQuestDisplayData(): Promise<Quest[]> {
    noStore();

    const [userQuestCounts, skyHelperResponse] = await Promise.all([
        getTodaysQuests(),
        getSkyHelperQuestResponse(),
    ]);

    return resolveDailyQuests(skyHelperResponse, userQuestCounts, questsData);
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

async function getSkyHelperQuestResponse() {
    const key = `sky-daily-api:${getSkyDate()}`;
    const cachedResponse = await client.get(key);

    if (cachedResponse) {
        return parseSkyHelperQuestResponse(cachedResponse);
    }

    try {
        const response = await fetch(SKY_HELPER_QUESTS_URL, {cache: "no-store"});

        if (!response.ok) {
            return null;
        }

        const responseText = await response.text();
        const parsedResponse = parseSkyHelperQuestResponse(responseText);

        if (!parsedResponse) {
            return null;
        }

        await client.set(key, responseText, "EX", SKY_HELPER_CACHE_TTL_SECONDS);
        return parsedResponse;
    } catch {
        return null;
    }
}

function parseSkyHelperQuestResponse(responseText: string): SkyHelperQuestResponse | null {
    try {
        return validateSkyHelperQuestResponse(JSON.parse(responseText));
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
