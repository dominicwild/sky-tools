"use client"

import {useSyncExternalStore} from "react";
import {skyCalendarEntries} from "@/data/skyEvents";
import {getCurrentSkyDay, type SkyDay} from "@/lib/sky-day";
import {getEntryTiming, type SkyCalendarEntryProgress} from "@/lib/sky-calendar";
import {formatDaysRemaining, formatDaysRemainingShort} from "@/lib/calendar-presentation";

type LiveSeason = {
    title: string;
    icon: {url: string; alt: string};
    progress: SkyCalendarEntryProgress;
};

function findLiveSeason(today: SkyDay): LiveSeason | null {
    for (const entry of skyCalendarEntries) {
        if (entry.kind !== "season") {
            continue;
        }

        const timing = getEntryTiming(entry, today);

        if (timing.state === "live") {
            return {title: entry.title, icon: entry.icon, progress: timing.progress};
        }
    }

    return null;
}

function subscribe(): () => void {
    return () => {};
}

export default function SeasonCountdown() {
    const today = useSyncExternalStore<SkyDay | null>(subscribe, getCurrentSkyDay, () => null);

    const liveSeason = today === null ? null : findLiveSeason(today);

    if (liveSeason === null) {
        return null;
    }

    const {title, icon, progress} = liveSeason;

    return (
        <div className="group absolute left-0 top-1/2 z-40 hidden -translate-y-1/2 items-center gap-0.5 text-xs text-white/70 min-[360px]:inline-flex sm:gap-1.5 sm:rounded-full sm:border sm:border-white/15 sm:bg-sky-950/60 sm:px-3 sm:py-1.5 sm:text-sm sm:backdrop-blur-md">
            <img className="h-3.5 w-3.5 sm:h-5 sm:w-5" src={icon.url} alt="" />
            <span aria-hidden className="hidden sm:inline">{formatDaysRemaining(progress)}</span>
            <span aria-hidden className="sm:hidden">{formatDaysRemainingShort(progress)}</span>
            <span className="sr-only">{`${title}: ${formatDaysRemaining(progress)}`}</span>
            <span
                aria-hidden
                className="pointer-events-none absolute left-0 top-full mt-2 whitespace-nowrap rounded-full border border-white/15 bg-sky-950/90 px-3 py-1.5 text-xs text-white/90 opacity-0 shadow-lg backdrop-blur-md transition-opacity duration-150 group-hover:opacity-100"
            >
                {`Days left until ${title} ends`}
            </span>
        </div>
    );
}
