"use client";

import {motion} from "motion/react";
import {Badge} from "@/components/ui/badge";
import CalendarProgressBar from "@/components/CalendarProgressBar";
import {EntryIcon, TrackIcon} from "@/components/CalendarIcons";
import {cn} from "@/lib/utils";
import {
    emptyTrackMessages,
    entryKindLabels,
    formatDaysUntil,
    formatLiveProgress,
    formatSkyDayRange,
    getEntryColorClasses,
    trackLabels,
} from "@/lib/calendar-presentation";
import {getEntryTiming, type SkyCalendarTrack} from "@/lib/sky-calendar";
import type {SkyDay} from "@/lib/sky-day";
import type {SkyCalendarEntry} from "@/data/skyEvents";

interface CalendarTracksProps {
    tracks: SkyCalendarTrack[];
    today: SkyDay;
    onSelectEntry: (entry: SkyCalendarEntry) => void;
}

export default function CalendarTracks({tracks, today, onSelectEntry}: Readonly<CalendarTracksProps>) {
    return (
        <div className="flex flex-col gap-6">
            {tracks.map((track) => {
                const hasNothing = track.live.length === 0 && track.upcoming.state === "empty";

                return (
                    <section key={track.kind} className="flex flex-col gap-3">
                        <div className="flex items-center gap-2 text-white">
                            <TrackIcon kind={track.kind} className="h-5 w-5 text-white/85" />
                            <h2 className="text-lg font-semibold">{trackLabels[track.kind]}</h2>
                        </div>

                        {hasNothing ? (
                            <p className="rounded-xl border border-white/10 bg-sky-950/50 px-4 py-3 text-sm text-white/65 backdrop-blur-md">
                                {emptyTrackMessages[track.kind]}
                            </p>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {track.live.map((entry) => (
                                    <TrackEntryCard key={entry.id} entry={entry} today={today} onSelect={onSelectEntry} />
                                ))}
                                {track.upcoming.state === "available" && (
                                    <TrackEntryCard entry={track.upcoming.entry} today={today} onSelect={onSelectEntry} />
                                )}
                            </div>
                        )}
                    </section>
                );
            })}
        </div>
    );
}

function TrackEntryCard({
    entry,
    today,
    onSelect,
}: Readonly<{entry: SkyCalendarEntry; today: SkyDay; onSelect: (entry: SkyCalendarEntry) => void}>) {
    const colorClasses = getEntryColorClasses(entry);
    const timing = getEntryTiming(entry, today);
    const isExpected = entry.confidence === "expected";
    const isLive = timing.state === "live";

    return (
        <motion.button
            type="button"
            onClick={() => onSelect(entry)}
            whileHover={{y: -3}}
            transition={{type: "spring", stiffness: 400, damping: 25}}
            className={cn(
                "flex w-full cursor-pointer flex-col gap-2 rounded-2xl border bg-sky-950/60 p-4 text-left text-white shadow-lg backdrop-blur-md transition-colors hover:bg-sky-950/75",
                colorClasses.border,
                isExpected && "border-dashed"
            )}
        >
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-white/60">
                <span className={cn("h-2 w-2 rounded-full", colorClasses.dot, isLive && "animate-pulse")} />
                {isLive ? "Now on" : "Next up"}
            </div>

            <div className="flex items-start justify-between gap-3">
                <h3 className="text-base font-semibold leading-tight">{entry.title}</h3>
                <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", colorClasses.bar)}>
                    <EntryIcon kind={entry.kind} className="h-4 w-4 text-white" />
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <Badge className={cn("border-none", colorClasses.badge)}>{entryKindLabels[entry.kind]}</Badge>
                {isExpected && (
                    <Badge className="border border-dashed border-white/70 bg-transparent text-white">Expected</Badge>
                )}
                <span className="text-sm text-white/70">{formatSkyDayRange(entry.startDay, entry.endDay)}</span>
            </div>

            {timing.state === "live" && (
                <div className="mt-1 flex flex-col gap-1.5">
                    <CalendarProgressBar progress={timing.progress} colorClasses={colorClasses} />
                    <p className="text-sm text-white/85">{formatLiveProgress(timing.progress)}</p>
                </div>
            )}
            {timing.state === "upcoming" && (
                <p className="mt-1 text-sm text-white/85">{formatDaysUntil(timing.daysUntil)}</p>
            )}
        </motion.button>
    );
}
