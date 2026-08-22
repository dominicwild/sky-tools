"use client";

import {Fragment} from "react";
import {CalendarClock, Sparkle} from "lucide-react";
import {Badge} from "@/components/ui/badge";
import CalendarProgressBar from "@/components/CalendarProgressBar";
import {EntryIcon, ExpectedBadge, TrackIcon} from "@/components/CalendarIcons";
import {cn} from "@/lib/utils";
import {
    emptyTrackMessages,
    entryKindLabels,
    formatSkyDayRangeWithDuration,
    getEntryColorClasses,
    trackLabels,
} from "@/lib/calendar-presentation";
import {getEntryTiming, type SkyCalendarTrack} from "@/lib/sky-calendar";
import type {SkyDay} from "@/lib/sky-day";
import type {SkyCalendarEntry} from "@/data/skyEvents";

interface CalendarTracksProps {
    tracks: SkyCalendarTrack[];
    today: SkyDay;
    onSelectEntry: (entry: SkyCalendarEntry, opener: HTMLElement) => void;
}

const expectedNightGradient =
    "radial-gradient(125% 90% at 80% -20%, rgba(150,176,255,0.30), transparent 55%), linear-gradient(150deg, #0b1f47 0%, #142a63 42%, #1e2f6b 74%, #2a2a63 100%)";

const expectedNightMask =
    "linear-gradient(135deg, #000 0%, #000 58%, rgba(0,0,0,0.74) 72%, rgba(0,0,0,0.30) 88%, transparent 98%, transparent 100%)";

const expectedNightDepth = "inset 0 1px 0 rgba(255,255,255,0.22), inset 0 -18px 30px -20px rgba(0,0,0,0.85)";

const expectedNightStars = [
    {top: "6%", left: "46%", size: 1.5, opacity: 0.5},
    {top: "10%", left: "68%", size: 2, opacity: 0.72},
    {top: "8%", left: "88%", size: 1, opacity: 0.42},
    {top: "20%", left: "33%", size: 1, opacity: 0.45},
    {top: "24%", left: "74%", size: 2.5, opacity: 0.75},
    {top: "38%", left: "60%", size: 1.5, opacity: 0.55},
    {top: "47%", left: "10%", size: 1, opacity: 0.4},
    {top: "46%", left: "44%", size: 2, opacity: 0.62},
    {top: "52%", left: "90%", size: 1.5, opacity: 0.5},
    {top: "66%", left: "66%", size: 2, opacity: 0.58},
    {top: "69%", left: "12%", size: 1, opacity: 0.42},
    {top: "72%", left: "88%", size: 2.5, opacity: 0.6},
    {top: "84%", left: "50%", size: 1.5, opacity: 0.52},
    {top: "88%", left: "78%", size: 1, opacity: 0.4},
] as const;

const confirmedDayGradient =
    "radial-gradient(80% 70% at 100% -8%, rgba(255,209,142,0.58), rgba(255,184,92,0.16) 42%, transparent 70%), linear-gradient(157deg, #2a8fdd 0%, #1c7ecb 30%, #0f66b0 64%, #0b5596 100%)";

const confirmedDayDepth = "inset 0 1px 0 rgba(255,255,255,0.28), inset 0 -20px 32px -22px rgba(2,22,52,0.82)";

const confirmedDaySunGlow =
    "radial-gradient(circle at 50% 50%, rgba(255,238,198,0.96) 0%, rgba(255,214,145,0.9) 30%, rgba(255,182,92,0.62) 52%, rgba(255,176,80,0.24) 70%, transparent 82%)";

const confirmedCloudViewBox = "0 0 230 120";
const confirmedCloudAspect = 120 / 230;

interface CloudEllipse {
    cx: number;
    cy: number;
    rx: number;
    ry: number;
}

interface CloudPuff {
    cx: number;
    cy: number;
    r: number;
}

interface CloudFade {
    start: number;
    end: number;
}

interface ConfirmedCloud {
    maskId: string;
    top: number;
    left: number;
    width: number;
    opacity: number;
    puffs: readonly CloudPuff[];
    warm: CloudEllipse;
    base: CloudEllipse;
    fade: CloudFade;
}

const confirmedCloudFadeStops: readonly {offset: number; opacity: number}[] = Array.from({length: 13}, (_, index) => {
    const position = index / 12;
    const eased = position * position * (3 - 2 * position);

    return {offset: position, opacity: 1 - eased};
});

const confirmedDayClouds: readonly ConfirmedCloud[] = [
    {
        maskId: "confirmedCloudMask0",
        top: -12,
        left: 150,
        width: 214,
        opacity: 0.6,
        puffs: [
            {cx: 106, cy: 48, r: 50},
            {cx: 150, cy: 54, r: 40},
            {cx: 64, cy: 58, r: 34},
            {cx: 128, cy: 38, r: 24},
            {cx: 36, cy: 68, r: 22},
            {cx: 186, cy: 64, r: 24},
            {cx: 40, cy: 74, r: 18},
            {cx: 56, cy: 80, r: 19},
            {cx: 72, cy: 76, r: 18},
            {cx: 88, cy: 82, r: 20},
            {cx: 104, cy: 84, r: 21},
            {cx: 120, cy: 81, r: 20},
            {cx: 136, cy: 77, r: 19},
            {cx: 152, cy: 81, r: 19},
            {cx: 168, cy: 76, r: 18},
            {cx: 184, cy: 70, r: 16},
        ],
        warm: {cx: 140, cy: 42, rx: 48, ry: 28},
        base: {cx: 106, cy: 84, rx: 94, ry: 24},
        fade: {start: 64, end: 106},
    },
    {
        maskId: "confirmedCloudMask1",
        top: 50,
        left: 236,
        width: 176,
        opacity: 0.55,
        puffs: [
            {cx: 92, cy: 52, r: 32},
            {cx: 54, cy: 56, r: 30},
            {cx: 130, cy: 57, r: 28},
            {cx: 72, cy: 47, r: 18},
            {cx: 112, cy: 48, r: 18},
            {cx: 28, cy: 66, r: 20},
            {cx: 160, cy: 64, r: 22},
            {cx: 30, cy: 70, r: 15},
            {cx: 46, cy: 77, r: 17},
            {cx: 62, cy: 80, r: 18},
            {cx: 78, cy: 75, r: 17},
            {cx: 94, cy: 79, r: 18},
            {cx: 110, cy: 82, r: 18},
            {cx: 126, cy: 77, r: 17},
            {cx: 142, cy: 80, r: 17},
            {cx: 158, cy: 74, r: 16},
            {cx: 170, cy: 69, r: 14},
            {cx: 80, cy: 83, r: 15},
            {cx: 124, cy: 83, r: 14},
        ],
        warm: {cx: 120, cy: 46, rx: 46, ry: 26},
        base: {cx: 100, cy: 82, rx: 86, ry: 22},
        fade: {start: 68, end: 108},
    },
    {
        maskId: "confirmedCloudMask2",
        top: -22,
        left: 70,
        width: 142,
        opacity: 0.5,
        puffs: [
            {cx: 60, cy: 44, r: 38},
            {cx: 100, cy: 58, r: 26},
            {cx: 44, cy: 38, r: 18},
            {cx: 32, cy: 60, r: 16},
            {cx: 124, cy: 66, r: 16},
            {cx: 32, cy: 66, r: 14},
            {cx: 46, cy: 73, r: 16},
            {cx: 60, cy: 77, r: 17},
            {cx: 74, cy: 72, r: 16},
            {cx: 88, cy: 75, r: 16},
            {cx: 102, cy: 70, r: 15},
            {cx: 116, cy: 64, r: 13},
        ],
        warm: {cx: 70, cy: 40, rx: 36, ry: 22},
        base: {cx: 72, cy: 76, rx: 60, ry: 18},
        fade: {start: 56, end: 96},
    },
];

export default function CalendarTracks({tracks, today, onSelectEntry}: Readonly<CalendarTracksProps>) {
    return (
        <div className="flex flex-col gap-6">
            <ConfirmedCloudDefs />
            {tracks.map((track) => {
                const hasNothing = track.live.length === 0 && track.upcoming.length === 0;

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
                                {track.upcoming.map((entry) => (
                                    <TrackEntryCard key={entry.id} entry={entry} today={today} onSelect={onSelectEntry} />
                                ))}
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
}: Readonly<{entry: SkyCalendarEntry; today: SkyDay; onSelect: (entry: SkyCalendarEntry, opener: HTMLElement) => void}>) {
    const colorClasses = getEntryColorClasses(entry);
    const timing = getEntryTiming(entry, today);
    const isExpected = entry.confidence === "expected";
    const isLive = timing.state === "live";

    return (
        <button
            type="button"
            onClick={(event) => onSelect(entry, event.currentTarget)}
            className={cn(
                "group relative flex w-full cursor-pointer flex-col gap-3 overflow-hidden rounded-2xl p-4 text-left text-white",
                isExpected
                    ? "bg-transparent"
                    : "shadow-lg transition-[filter] duration-150 ease-out hover:brightness-[1.05]",
            )}
        >
            {isExpected ? <ExpectedCardSurface /> : <ConfirmedDaySurface />}

            <div className="relative z-10 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-white/55">
                {isLive ? (
                    <Sparkle aria-hidden className="h-[11px] w-[11px] fill-white/90 text-white/90" />
                ) : (
                    <span className={cn("h-2 w-2 rounded-full", colorClasses.dot)} />
                )}
                {isLive ? "Active" : "Next up"}
            </div>

            <div className="relative z-10 flex items-start justify-between gap-3">
                <h3 className="text-base font-semibold leading-tight">{entry.title}</h3>
                <div
                    className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                        colorClasses.bar,
                        !isExpected && "shadow-[0_2px_9px_-1px_rgba(3,18,46,0.55)] ring-1 ring-inset ring-black/10",
                    )}
                >
                    <EntryIcon kind={entry.kind} className="h-4 w-4 text-white" />
                </div>
            </div>

            <div className="relative z-10 flex flex-wrap items-center gap-2">
                <Badge className={cn("border-none", colorClasses.badge)}>{entryKindLabels[entry.kind]}</Badge>
                {isExpected && <ExpectedBadge />}
                <span className="text-sm font-medium text-white/60">
                    {formatSkyDayRangeWithDuration(entry.startDay, entry.endDay)}
                </span>
            </div>

            {timing.state === "live" && (
                <div className="relative z-10">
                    <CalendarProgressBar progress={timing.progress} colorClasses={colorClasses} />
                </div>
            )}
            {timing.state === "upcoming" && (
                <div className="relative z-10">
                    <CountdownTimingRow daysUntil={timing.daysUntil} />
                </div>
            )}
        </button>
    );
}

function CountdownTimingRow({daysUntil}: Readonly<{daysUntil: number}>) {
    return (
        <div className="flex items-center gap-2 text-sm font-medium text-white/60">
            <CalendarClock aria-hidden className="h-4 w-4 text-white/45" />
            {daysUntil === 1 ? (
                <span>
                    Starts <span className="font-semibold text-white">tomorrow</span>
                </span>
            ) : (
                <span>
                    Starts in <span className="font-semibold text-white">{daysUntil}</span> days
                </span>
            )}
        </div>
    );
}

function ExpectedCardSurface() {
    return (
        <div
            aria-hidden
            style={{
                backgroundImage: expectedNightGradient,
                boxShadow: expectedNightDepth,
                WebkitMaskImage: expectedNightMask,
                maskImage: expectedNightMask,
            }}
            className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl transition-[filter] duration-150 ease-out group-hover:brightness-110"
        >
            {expectedNightStars.map((star) => (
                <span
                    key={`${star.top}-${star.left}`}
                    className="absolute rounded-full bg-white"
                    style={{
                        top: star.top,
                        left: star.left,
                        width: star.size,
                        height: star.size,
                        opacity: star.opacity,
                        boxShadow: "0 0 4px 1px rgba(255,255,255,0.5)",
                    }}
                />
            ))}
        </div>
    );
}

function ConfirmedDaySurface() {
    return (
        <div
            aria-hidden
            style={{backgroundImage: confirmedDayGradient, boxShadow: confirmedDayDepth}}
            className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl"
        >
            <span
                className="absolute rounded-full"
                style={{
                    top: -98,
                    right: -98,
                    width: 202,
                    height: 202,
                    backgroundImage: confirmedDaySunGlow,
                    filter: "blur(11px)",
                }}
            />
            {confirmedDayClouds.map((cloud) => (
                <ConfirmedDayCloud key={cloud.maskId} cloud={cloud} />
            ))}
        </div>
    );
}

function ConfirmedCloudDefs() {
    return (
        <svg aria-hidden width={0} height={0} className="absolute" style={{position: "absolute"}}>
            <defs>
                <radialGradient id="confirmedCloudPuff" cx="0.5" cy="0.5" r="0.5">
                    <stop offset="0" stopColor="#ffffff" />
                    {confirmedCloudFadeStops.map((stop) => (
                        <stop
                            key={stop.offset}
                            offset={0.5 + stop.offset * 0.5}
                            stopColor="#ffffff"
                            stopOpacity={stop.opacity}
                        />
                    ))}
                </radialGradient>
                <linearGradient id="confirmedCloudVolume" gradientUnits="userSpaceOnUse" x1="0" y1="-40" x2="0" y2="160">
                    <stop offset="0" stopColor="#ffffff" />
                    <stop offset="1" stopColor="#b3c6e0" />
                </linearGradient>
                <radialGradient id="confirmedCloudWarm" cx="0.5" cy="0.5" r="0.5">
                    <stop offset="0" stopColor="#fff2d4" stopOpacity={0.9} />
                    <stop offset="1" stopColor="#fff2d4" stopOpacity={0} />
                </radialGradient>
                <radialGradient id="confirmedCloudBase" cx="0.5" cy="0.5" r="0.5">
                    <stop offset="0" stopColor="#8ba4c6" stopOpacity={0.55} />
                    <stop offset="1" stopColor="#8ba4c6" stopOpacity={0} />
                </radialGradient>
                <filter id="confirmedCloudEdge" x="-40%" y="-40%" width="180%" height="180%">
                    <feGaussianBlur stdDeviation={2.2} />
                </filter>
                {confirmedDayClouds.map((cloud) => (
                    <Fragment key={cloud.maskId}>
                        <linearGradient
                            id={`${cloud.maskId}FadeGradient`}
                            gradientUnits="userSpaceOnUse"
                            x1={0}
                            y1={cloud.fade.start}
                            x2={0}
                            y2={cloud.fade.end}
                        >
                            {confirmedCloudFadeStops.map((stop) => (
                                <stop key={stop.offset} offset={stop.offset} stopColor="#ffffff" stopOpacity={stop.opacity} />
                            ))}
                        </linearGradient>
                        <mask
                            id={`${cloud.maskId}Fade`}
                            maskUnits="userSpaceOnUse"
                            x={-40}
                            y={-40}
                            width={310}
                            height={200}
                        >
                            <rect
                                x={-40}
                                y={-40}
                                width={310}
                                height={200}
                                fill={`url(#${cloud.maskId}FadeGradient)`}
                            />
                        </mask>
                        <mask
                            id={cloud.maskId}
                            maskUnits="userSpaceOnUse"
                            x={-40}
                            y={-40}
                            width={310}
                            height={200}
                        >
                            <g mask={`url(#${cloud.maskId}Fade)`}>
                                <g filter="url(#confirmedCloudEdge)">
                                    {cloud.puffs.map((puff) => (
                                        <circle
                                            key={`${puff.cx}-${puff.cy}`}
                                            cx={puff.cx}
                                            cy={puff.cy}
                                            r={puff.r}
                                            fill="url(#confirmedCloudPuff)"
                                        />
                                    ))}
                                </g>
                            </g>
                        </mask>
                    </Fragment>
                ))}
            </defs>
        </svg>
    );
}

function ConfirmedDayCloud({cloud}: Readonly<{cloud: ConfirmedCloud}>) {
    return (
        <svg
            aria-hidden
            width={cloud.width}
            height={cloud.width * confirmedCloudAspect}
            viewBox={confirmedCloudViewBox}
            className="absolute"
            style={{top: cloud.top, left: cloud.left, opacity: cloud.opacity, overflow: "visible"}}
        >
            <g mask={`url(#${cloud.maskId})`}>
                <rect x={-40} y={-40} width={310} height={200} fill="url(#confirmedCloudVolume)" />
                <ellipse cx={cloud.base.cx} cy={cloud.base.cy} rx={cloud.base.rx} ry={cloud.base.ry} fill="url(#confirmedCloudBase)" />
                <ellipse cx={cloud.warm.cx} cy={cloud.warm.cy} rx={cloud.warm.rx} ry={cloud.warm.ry} fill="url(#confirmedCloudWarm)" />
            </g>
        </svg>
    );
}
