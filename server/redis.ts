"use server"

import Redis from "ioredis"
import {getSkyDate} from "@/lib/utils";
import {unstable_noStore as noStore} from 'next/cache';

const client = new Redis(`rediss://default:${process.env.REDIS_TOKEN}@${process.env.REDIS_URL}:6379`);

export type QuestValue = Record<string, number>

export async function getTodaysQuests() {
    // Opt out of caching at the data fetch level
    noStore();

    const key = getSkyDate();
    return client.hgetall(key)
}

export async function incrementQuest(id: number) {
    // if (process.env.NODE_ENV !== 'production') {
    //     return;
    // }
    console.log("increment quest id", id)
    const key = getSkyDate();
    client.hincrby(key, id + "", 1)
}