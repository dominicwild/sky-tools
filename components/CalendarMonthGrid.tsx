"use client";

import {CircleDashed, Sparkle} from "lucide-react";
import {cn} from "@/lib/utils";
import {EntryIcon} from "@/components/CalendarIcons";
import {expectedHatchStyle, getEntryColorClasses} from "@/lib/calendar-presentation";
import {getEntryTiming, type SkyCalendarWeek, type SkyCalendarWeekSegment} from "@/lib/sky-calendar";
import type {SkyDay} from "@/lib/sky-day";
import type {SkyCalendarEntry} from "@/data/skyEvents";

const weekdayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const minimumBarRows = 3;

interface CalendarMonthGridProps {
    weeks: SkyCalendarWeek[];
    weekSegments: SkyCalendarWeekSegment[];
    today: SkyDay;
    hasEntries: boolean;
    onSelectEntry: (entry: SkyCalendarEntry, opener: HTMLElement) => void;
}

export default function CalendarMonthGrid({
    weeks,
    weekSegments,
    today,
    hasEntries,
    onSelectEntry,
}: Readonly<CalendarMonthGridProps>) {
    return (
        <div className="hidden lg:block">
            <div className="rounded-2xl border border-white/15 bg-sky-950/60 p-4 text-white shadow-lg backdrop-blur-md">
                <div className="mb-2 grid grid-cols-7 gap-x-1">
                    {weekdayLabels.map((label) => (
                        <div key={label} className="text-center text-xs font-semibold uppercase tracking-wide text-white/60">
                            {label}
                        </div>
                    ))}
                </div>

                <div className="flex flex-col gap-2">
                    {weeks.map((week, weekIndex) => (
                        <WeekRow
                            key={week[0].day}
                            week={week}
                            weekIndex={weekIndex}
                            segments={weekSegments.filter((segment) => segment.weekIndex === weekIndex)}
                            today={today}
                            onSelectEntry={onSelectEntry}
                        />
                    ))}
                </div>

                {!hasEntries && (
                    <p className="mt-4 rounded-xl border border-white/10 bg-sky-950/50 px-4 py-3 text-center text-sm text-white/65">
                        No scheduled Sky content this month.
                    </p>
                )}
            </div>
        </div>
    );
}

function WeekRow({
    week,
    weekIndex,
    segments,
    today,
    onSelectEntry,
}: Readonly<{
    week: SkyCalendarWeek;
    weekIndex: number;
    segments: SkyCalendarWeekSegment[];
    today: SkyDay;
    onSelectEntry: (entry: SkyCalendarEntry, opener: HTMLElement) => void;
}>) {
    const usedRows = segments.reduce((max, segment) => Math.max(max, segment.row + 1), 0);
    const barRowCount = Math.max(usedRows, minimumBarRows);

    return (
        <div
            className="grid grid-cols-7 gap-x-1 gap-y-1 border-t border-white/10 pt-1"
            style={{gridTemplateRows: `auto repeat(${barRowCount}, minmax(1.75rem, auto))`}}
        >
            {week.map((day, dayIndex) => {
                const dayNumber = Number(day.day.split("-")[2]);
                const isToday = day.day === today;

                return (
                    <div key={day.day} className="flex justify-center pb-1" style={{gridColumn: dayIndex + 1, gridRow: 1}}>
                        <span
                            className={cn(
                                "relative inline-flex h-6 w-6 items-center justify-center rounded-full text-sm",
                                day.inMonth ? "text-white/85" : "text-white/30",
                                isToday && day.inMonth && "font-bold text-white"
                            )}
                        >
                            {isToday && day.inMonth && (
                                <span
                                    aria-hidden
                                    className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(circle,rgba(255,255,255,0.35),transparent_70%)] blur-sm"
                                />
                            )}
                            <span className="relative z-10">{dayNumber}</span>
                            {isToday && day.inMonth && (
                                <Sparkle
                                    aria-hidden
                                    className="absolute -right-[5px] -top-[5px] z-10 h-3.5 w-3.5 fill-white text-white drop-shadow-[0_0_5px_rgba(190,220,255,0.9)] motion-safe:animate-[today-sparkle_2.5s_ease-in-out_infinite] motion-reduce:opacity-100"
                                />
                            )}
                        </span>
                    </div>
                );
            })}

            {segments.map((segment) => (
                <BarSegment
                    key={`${segment.entry.id}-${weekIndex}`}
                    segment={segment}
                    today={today}
                    onSelect={onSelectEntry}
                />
            ))}
        </div>
    );
}

function BarSegment({
    segment,
    today,
    onSelect,
}: Readonly<{segment: SkyCalendarWeekSegment; today: SkyDay; onSelect: (entry: SkyCalendarEntry, opener: HTMLElement) => void}>) {
    const {entry} = segment;
    const colorClasses = getEntryColorClasses(entry);
    const isExpected = entry.confidence === "expected";
    const isLive = getEntryTiming(entry, today).state === "live";
    const roundingLeft = segment.startsWindow ? "rounded-l-full" : "rounded-l-none";
    const roundingRight = segment.endsWindow ? "rounded-r-full" : "rounded-r-none";

    return (
        <button
            type="button"
            onClick={(event) => onSelect(entry, event.currentTarget)}
            title={entry.title}
            style={{gridColumn: `${segment.startColumn} / ${segment.endColumn + 1}`, gridRow: segment.row + 2}}
            className={cn(
                "relative flex h-7 min-w-0 cursor-pointer items-center gap-1.5 overflow-hidden border px-2 text-white shadow-sm transition-[filter,border-color,background-color] duration-150 ease-out hover:brightness-110 hover:border-white/50",
                colorClasses.bar,
                isExpected ? "border-solid border-white/20" : cn("border-solid", colorClasses.border),
                roundingLeft,
                roundingRight
            )}
        >
            {isExpected && (
                <span
                    aria-hidden
                    style={expectedHatchStyle}
                    className={cn("pointer-events-none absolute inset-0 z-0", roundingLeft, roundingRight)}
                />
            )}
            <EntryIcon kind={entry.kind} className="relative z-10 h-3.5 w-3.5 shrink-0 drop-shadow-sm" />
            <span className="relative z-10 min-w-0 flex-1 truncate text-xs font-medium drop-shadow-sm">{entry.title}</span>
            {isExpected && <CircleDashed aria-hidden className="relative z-10 h-3.5 w-3.5 shrink-0 text-amber-100" />}
            {isLive && (
                <Sparkle
                    aria-hidden
                    className="relative z-10 h-[13px] w-[13px] shrink-0 fill-white text-white drop-shadow-[0_0_4px_rgba(190,220,255,0.85)]"
                />
            )}
        </button>
    );
}
