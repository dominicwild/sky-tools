"use client";

import {Sparkle} from "lucide-react";
import {cn} from "@/lib/utils";
import {
    formatDaysRemaining,
    formatProgressDayLabel,
    getProgressPercent,
    type SkyCalendarColorClasses,
} from "@/lib/calendar-presentation";
import type {SkyCalendarEntryProgress} from "@/lib/sky-calendar";

interface CalendarProgressBarProps {
    progress: SkyCalendarEntryProgress;
    colorClasses: SkyCalendarColorClasses;
}

export default function CalendarProgressBar({progress, colorClasses}: Readonly<CalendarProgressBarProps>) {
    const fillPercent = Math.min(Math.max(getProgressPercent(progress), 4), 100);

    return (
        <div className="flex flex-col gap-2">
            <div className="relative h-2 w-full overflow-visible rounded-full bg-white/10 ring-1 ring-inset ring-white/10">
                <div
                    className={cn("h-full rounded-full", colorClasses.progressFill, colorClasses.glow)}
                    style={{width: `${fillPercent}%`}}
                />
                <Sparkle
                    aria-hidden
                    className="absolute h-3.5 w-3.5 fill-white text-white drop-shadow-[0_0_4px_rgba(190,220,255,0.85)]"
                    style={{left: `calc(${fillPercent}% - 7px)`, top: "calc(50% - 7px)"}}
                />
            </div>
            <div className="flex items-baseline justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-white/90">
                    {formatProgressDayLabel(progress)}
                </span>
                <span className="text-xs font-medium text-white/60">{formatDaysRemaining(progress)}</span>
            </div>
        </div>
    );
}
