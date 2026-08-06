"use client";

import {useState} from "react";
import CalendarMonthGrid from "@/components/CalendarMonthGrid";
import CalendarTracks from "@/components/CalendarTracks";
import CalendarEventDialog from "@/components/CalendarEventDialog";
import type {SkyCalendarTrack, SkyCalendarWeek, SkyCalendarWeekSegment} from "@/lib/sky-calendar";
import type {SkyDay} from "@/lib/sky-day";
import type {SkyCalendarEntry} from "@/data/skyEvents";

interface CalendarViewProps {
    today: SkyDay;
    weeks: SkyCalendarWeek[];
    weekSegments: SkyCalendarWeekSegment[];
    tracks: SkyCalendarTrack[];
    hasEntries: boolean;
}

export default function CalendarView({today, weeks, weekSegments, tracks, hasEntries}: Readonly<CalendarViewProps>) {
    const [selectedEntry, setSelectedEntry] = useState<SkyCalendarEntry | null>(null);
    const [openingElement, setOpeningElement] = useState<HTMLElement | null>(null);

    function selectEntry(entry: SkyCalendarEntry, opener: HTMLElement) {
        setOpeningElement(opener);
        setSelectedEntry(entry);
    }

    return (
        <>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
                <div className="min-w-0 flex-1">
                    <CalendarMonthGrid
                        weeks={weeks}
                        weekSegments={weekSegments}
                        today={today}
                        hasEntries={hasEntries}
                        onSelectEntry={selectEntry}
                    />
                </div>
                <aside className="w-full lg:w-[360px] lg:shrink-0">
                    <CalendarTracks tracks={tracks} today={today} onSelectEntry={selectEntry} />
                </aside>
            </div>

            <CalendarEventDialog
                entry={selectedEntry}
                today={today}
                openingElement={openingElement}
                onClose={() => setSelectedEntry(null)}
            />
        </>
    );
}
