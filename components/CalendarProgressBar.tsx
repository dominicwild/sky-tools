"use client";

import {cn} from "@/lib/utils";
import {getProgressPercent, type SkyCalendarColorClasses} from "@/lib/calendar-presentation";
import type {SkyCalendarEntryProgress} from "@/lib/sky-calendar";

interface CalendarProgressBarProps {
    progress: SkyCalendarEntryProgress;
    colorClasses: SkyCalendarColorClasses;
}

export default function CalendarProgressBar({progress, colorClasses}: Readonly<CalendarProgressBarProps>) {
    return (
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/10 ring-1 ring-inset ring-white/10">
            <div
                className={cn("h-full rounded-full", colorClasses.progressFill, colorClasses.glow)}
                style={{width: `${Math.max(getProgressPercent(progress), 4)}%`}}
            />
        </div>
    );
}
