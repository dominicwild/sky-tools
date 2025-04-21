"use server"

import Redis from "ioredis"
import {getSkyDate} from "@/lib/utils";

const client = new Redis(`rediss://default:${process.env.REDIS_TOKEN}@${process.env.REDIS_URL}:6379`);

export type QuestValue = Record<string, number>

export async function getTodaysQuests() {
    const key = getSkyDate();
    const json = await client.get(key)
    if (!json) {
        return {}
    }
    return JSON.parse(json) as QuestValue
}

export async function incrementQuest(id: number) {
    if (process.env.NODE_ENV !== 'production') {
        return;
    }
    const quests = await getTodaysQuests();
    quests[id] = (quests[id] ?? 0) + 1;

    const key = getSkyDate();
    client.set(key, JSON.stringify(quests));
}