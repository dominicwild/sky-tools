import type {CSSProperties} from "react";
import type {SkyCalendarEntry, SkyCalendarEntryKind, SkyEventPalette} from "@/data/skyEvents";
import type {SkyCalendarEntryProgress, SkyCalendarTrackKind} from "@/lib/sky-calendar";
import {differenceInSkyDays, type SkyDay, type SkyMonth} from "@/lib/sky-day";

type SkyCalendarColor = "gold" | "violet" | "indigo" | SkyEventPalette;

export type SkyCalendarColorClasses = {
    bar: string;
    border: string;
    badge: string;
    progressFill: string;
    glow: string;
    dot: string;
};

function getEntryColor(entry: SkyCalendarEntry): SkyCalendarColor {
    switch (entry.kind) {
        case "event":
            return entry.palette;
        case "season":
            return "gold";
        case "travelling-spirit":
            return "violet";
        case "returning-spirits":
            return "indigo";
    }
}

const calendarColorClasses: Record<SkyCalendarColor, SkyCalendarColorClasses> = {
    gold: {
        bar: "bg-gradient-to-r from-amber-400/75 to-yellow-500/65",
        border: "border-amber-200/60",
        badge: "bg-amber-400/80 text-amber-950",
        progressFill: "bg-gradient-to-r from-amber-300 to-yellow-400",
        glow: "shadow-[0_0_10px_2px_rgba(251,191,36,0.55)]",
        dot: "bg-amber-400",
    },
    violet: {
        bar: "bg-gradient-to-r from-violet-500/75 to-purple-600/65",
        border: "border-violet-300/60",
        badge: "bg-violet-500/80 text-white",
        progressFill: "bg-gradient-to-r from-violet-400 to-purple-500",
        glow: "shadow-[0_0_10px_2px_rgba(167,139,250,0.55)]",
        dot: "bg-violet-500",
    },
    indigo: {
        bar: "bg-gradient-to-r from-indigo-500/75 to-blue-600/65",
        border: "border-indigo-300/60",
        badge: "bg-indigo-500/80 text-white",
        progressFill: "bg-gradient-to-r from-indigo-400 to-blue-500",
        glow: "shadow-[0_0_10px_2px_rgba(129,140,248,0.55)]",
        dot: "bg-indigo-500",
    },
    amber: {
        bar: "bg-gradient-to-r from-amber-500/75 to-orange-600/65",
        border: "border-amber-300/60",
        badge: "bg-amber-500/80 text-amber-950",
        progressFill: "bg-gradient-to-r from-amber-400 to-orange-500",
        glow: "shadow-[0_0_10px_2px_rgba(245,158,11,0.55)]",
        dot: "bg-amber-500",
    },
    coral: {
        bar: "bg-gradient-to-r from-orange-500/75 to-red-500/65",
        border: "border-orange-300/60",
        badge: "bg-orange-500/80 text-white",
        progressFill: "bg-gradient-to-r from-orange-400 to-red-500",
        glow: "shadow-[0_0_10px_2px_rgba(249,115,22,0.55)]",
        dot: "bg-orange-500",
    },
    rose: {
        bar: "bg-gradient-to-r from-rose-500/75 to-pink-600/65",
        border: "border-rose-300/60",
        badge: "bg-rose-500/80 text-white",
        progressFill: "bg-gradient-to-r from-rose-400 to-pink-500",
        glow: "shadow-[0_0_10px_2px_rgba(244,63,94,0.55)]",
        dot: "bg-rose-500",
    },
    teal: {
        bar: "bg-gradient-to-r from-teal-500/75 to-cyan-600/65",
        border: "border-teal-300/60",
        badge: "bg-teal-500/80 text-white",
        progressFill: "bg-gradient-to-r from-teal-400 to-cyan-500",
        glow: "shadow-[0_0_10px_2px_rgba(20,184,166,0.55)]",
        dot: "bg-teal-500",
    },
};

export function getEntryColorClasses(entry: SkyCalendarEntry): SkyCalendarColorClasses {
    return calendarColorClasses[getEntryColor(entry)];
}

export const entryKindLabels: Record<SkyCalendarEntryKind, string> = {
    event: "Event",
    season: "Season",
    "travelling-spirit": "Travelling Spirit",
    "returning-spirits": "Returning Spirits",
};

export const trackLabels: Record<SkyCalendarTrackKind, string> = {
    "travelling-spirit": "Travelling Spirits",
    events: "Events",
    season: "Season",
};

export const emptyTrackMessages: Record<SkyCalendarTrackKind, string> = {
    "travelling-spirit": "No travelling spirit is visiting right now.",
    events: "No events are running right now.",
    season: "No season is live right now.",
};

const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

const shortMonthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatSkyMonth(month: SkyMonth): string {
    const [year, monthNumber] = month.split("-");

    return `${monthNames[Number(monthNumber) - 1]} ${year}`;
}

function formatSkyDayShort(day: SkyDay): string {
    const [, month, date] = day.split("-");

    return `${Number(date)} ${shortMonthNames[Number(month) - 1]}`;
}

function formatSkyDayRange(startDay: SkyDay, endDay: SkyDay): string {
    if (startDay === endDay) {
        return formatSkyDayShort(startDay);
    }

    return `${formatSkyDayShort(startDay)} – ${formatSkyDayShort(endDay)}`;
}

export function formatSkyDayRangeWithDuration(startDay: SkyDay, endDay: SkyDay): string {
    const totalDays = differenceInSkyDays(startDay, endDay) + 1;

    return `${formatSkyDayRange(startDay, endDay)} · ${totalDays} ${totalDays === 1 ? "day" : "days"}`;
}

export function formatProgressDayLabel(progress: SkyCalendarEntryProgress): string {
    return `Day ${progress.dayNumber} of ${progress.totalDays}`;
}

export function formatDaysRemaining(progress: SkyCalendarEntryProgress): string {
    if (progress.daysRemaining === 0) {
        return "Last day today";
    }

    return `${progress.daysRemaining} ${progress.daysRemaining === 1 ? "day" : "days"} left`;
}

export function formatDaysUntil(daysUntil: number): string {
    if (daysUntil === 1) {
        return "Starts tomorrow";
    }

    return `Starts in ${daysUntil} days`;
}

export function getProgressPercent(progress: SkyCalendarEntryProgress): number {
    return Math.round((progress.dayNumber / progress.totalDays) * 100);
}

// A diagonal hatch overlaid on expected bars: a distinct "provisional" fill that keeps the gradient tint visible beneath.
export const expectedHatchStyle: CSSProperties = {
    backgroundImage:
        "repeating-linear-gradient(-45deg, rgba(255,255,255,0.16) 0, rgba(255,255,255,0.16) 1.5px, transparent 1.5px, transparent 7px)",
};
