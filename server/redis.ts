"use server"

import Redis from "ioredis"
import {getSkyDate} from "@/lib/utils";
import {unstable_noStore as noStore} from 'next/cache';

const client = new Redis(`rediss://default:${process.env.REDIS_TOKEN}@${process.env.REDIS_URL}:6379`);

export type QuestValue = Record<string, number>

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

export async function incrementQuest(id: number) {
    if (process.env.NODE_ENV !== 'production') {
        return;
    }
    console.log("increment quest id", id)
    const key = getSkyDate();
    client.hincrby(key, id + "", 1)
}
