import {SkyCalendarEntry, SkyCalendarEntryKind, SkyCalendarImage, SkyCalendarLink} from "@/data/skyEvents";
import {getMonthWeeks, SkyDay, SkyMonth} from "./sky-day";
import {getEntryProgress, getEntryTiming, getMonthEntries, getTracks, getWeekSegments} from "./sky-calendar";
import {describe, expect, it} from "vitest";

type EntryWindow = {
    id: string;
    kind: SkyCalendarEntryKind;
    startDay: SkyDay;
    endDay: SkyDay;
};

type EntryDetails = {
    id: string;
    title: string;
    description: string;
    startDay: SkyDay;
    endDay: SkyDay;
    confidence: "confirmed";
    link: SkyCalendarLink;
    image: SkyCalendarImage | null;
    sourceUrl: string;
    verifiedOn: SkyDay;
};

function createEntry({id, kind, startDay, endDay}: EntryWindow): SkyCalendarEntry {
    const entry: EntryDetails = {
        id,
        title: id,
        description: "Test calendar entry.",
        startDay,
        endDay,
        confidence: "confirmed",
        link: {url: "https://example.com/detail", label: "Example detail"},
        image: null,
        sourceUrl: "https://example.com/source",
        verifiedOn: "2026-01-01",
    };

    if (kind === "event") {
        return {...entry, kind, palette: "amber"};
    }

    return {...entry, kind};
}

function getEntriesForMonth(entries: SkyCalendarEntry[], month: SkyMonth) {
    return getMonthEntries(entries, month, getMonthWeeks(month));
}

describe("Sky calendar", () => {
    it("assigns stable rows across a five-deep week and reuses freed rows", () => {
        const entries = [
            createEntry({id: "long", kind: "event", startDay: "2026-07-01", endDay: "2026-07-19"}),
            createEntry({id: "second", kind: "event", startDay: "2026-07-02", endDay: "2026-07-06"}),
            createEntry({id: "third", kind: "event", startDay: "2026-07-03", endDay: "2026-07-06"}),
            createEntry({id: "fourth", kind: "event", startDay: "2026-07-04", endDay: "2026-07-06"}),
            createEntry({id: "fifth", kind: "event", startDay: "2026-07-05", endDay: "2026-07-06"}),
            createEntry({id: "reused", kind: "event", startDay: "2026-07-07", endDay: "2026-07-08"}),
        ];
        const segments = getWeekSegments(getEntriesForMonth(entries, "2026-07"), getMonthWeeks("2026-07"));
        const longRows = segments.filter((segment) => segment.entry.id === "long").map((segment) => segment.row);
        const firstWeekRows = segments.filter((segment) => segment.weekIndex === 0).map((segment) => segment.row);
        const reusedSegment = segments.find((segment) => segment.entry.id === "reused");

        expect(longRows).toEqual([0, 0, 0]);
        expect(firstWeekRows).toEqual([0, 1, 2, 3, 4]);
        expect(reusedSegment?.row).toBe(1);
    });

    it("splits windows at week boundaries with the correct columns and edges", () => {
        const entry = createEntry({id: "crosses-week", kind: "event", startDay: "2026-07-03", endDay: "2026-07-08"});
        const segments = getWeekSegments(getEntriesForMonth([entry], "2026-07"), getMonthWeeks("2026-07"));

        expect(segments).toEqual([
            {
                entry,
                weekIndex: 0,
                startColumn: 5,
                endColumn: 7,
                startsWindow: true,
                endsWindow: false,
                row: 0,
            },
            {
                entry,
                weekIndex: 1,
                startColumn: 1,
                endColumn: 3,
                startsWindow: false,
                endsWindow: true,
                row: 0,
            },
        ]);
    });

    it.each([
        ["first day", "2026-07-31", {dayNumber: 1, totalDays: 21, daysRemaining: 20}],
        ["last day", "2026-08-20", {dayNumber: 21, totalDays: 21, daysRemaining: 0}],
    ])("calculates inclusive progress on the %s", (_, today, expectedProgress) => {
        const entry = createEntry({id: "summer", kind: "event", startDay: "2026-07-31", endDay: "2026-08-20"});

        expect(getEntryProgress(entry, today)).toEqual(expectedProgress);
    });

    it("calculates a single-day window as day one of one", () => {
        const entry = createEntry({id: "single", kind: "event", startDay: "2026-07-31", endDay: "2026-07-31"});

        expect(getEntryProgress(entry, "2026-07-31")).toEqual({dayNumber: 1, totalDays: 1, daysRemaining: 0});
    });

    it("clips entries to the full grid across a month boundary", () => {
        const entry = createEntry({id: "crosses-month", kind: "event", startDay: "2026-07-29", endDay: "2026-08-02"});
        const julyWeeks = getMonthWeeks("2026-07");
        const augustWeeks = getMonthWeeks("2026-08");

        expect(getEntriesForMonth([entry], "2026-07")).toEqual([
            {entry, startDay: "2026-07-29", endDay: "2026-08-02"},
        ]);
        expect(getEntriesForMonth([entry], "2026-08")).toEqual([
            {entry, startDay: "2026-07-29", endDay: "2026-08-02"},
        ]);
        expect(getWeekSegments(getMonthEntries([entry], "2026-07", julyWeeks), julyWeeks)).toEqual([
            {
                entry,
                weekIndex: 4,
                startColumn: 3,
                endColumn: 7,
                startsWindow: true,
                endsWindow: true,
                row: 0,
            },
        ]);
        expect(getWeekSegments(getMonthEntries([entry], "2026-08", augustWeeks), augustWeeks)).toEqual([
            {
                entry,
                weekIndex: 0,
                startColumn: 3,
                endColumn: 7,
                startsWindow: true,
                endsWindow: true,
                row: 0,
            },
        ]);
    });

    it("assigns separate rows to entries that overlap in a grid lead-in week", () => {
        const entries = [
            createEntry({id: "crosses-grid", kind: "event", startDay: "2026-07-29", endDay: "2026-08-02"}),
            createEntry({id: "starts-in-month", kind: "event", startDay: "2026-08-01", endDay: "2026-08-04"}),
        ];
        const weeks = getMonthWeeks("2026-08");
        const firstWeekSegments = getWeekSegments(getMonthEntries(entries, "2026-08", weeks), weeks).filter(
            (segment) => segment.weekIndex === 0
        );

        expect(firstWeekSegments.map((segment) => ({id: segment.entry.id, row: segment.row}))).toEqual([
            {id: "crosses-grid", row: 0},
            {id: "starts-in-month", row: 1},
        ]);
    });

    it("only shows season bars in their start and end months and clips them to the grid", () => {
        const season = createEntry({id: "season", kind: "season", startDay: "2026-06-20", endDay: "2026-10-10"});

        expect(getEntriesForMonth([season], "2026-06")).toEqual([
            {entry: season, startDay: "2026-06-20", endDay: "2026-07-05"},
        ]);
        expect(getEntriesForMonth([season], "2026-07")).toEqual([]);
        expect(getEntriesForMonth([season], "2026-10")).toEqual([
            {entry: season, startDay: "2026-09-28", endDay: "2026-10-10"},
        ]);
    });

    it("does not extend a season into grid days before it starts", () => {
        const season = createEntry({id: "season", kind: "season", startDay: "2026-06-30", endDay: "2026-07-10"});

        expect(getEntriesForMonth([season], "2026-07")).toEqual([
            {entry: season, startDay: "2026-06-30", endDay: "2026-07-10"},
        ]);
    });

    it("selects live and upcoming entries for every track", () => {
        const entries = [
            createEntry({id: "travelling-live", kind: "travelling-spirit", startDay: "2026-07-04", endDay: "2026-07-07"}),
            createEntry({id: "travelling-upcoming", kind: "travelling-spirit", startDay: "2026-07-12", endDay: "2026-07-15"}),
            createEntry({id: "event-live", kind: "event", startDay: "2026-07-01", endDay: "2026-07-06"}),
            createEntry({id: "returning-upcoming", kind: "returning-spirits", startDay: "2026-07-08", endDay: "2026-07-11"}),
            createEntry({id: "season-live", kind: "season", startDay: "2026-06-01", endDay: "2026-07-10"}),
            createEntry({id: "season-upcoming", kind: "season", startDay: "2026-07-20", endDay: "2026-10-01"}),
        ];

        expect(getTracks(entries, "2026-07-05")).toEqual([
            {
                kind: "travelling-spirit",
                live: [entries[0]],
                upcoming: [entries[1]],
            },
            {
                kind: "events",
                live: [entries[2]],
                upcoming: [entries[3]],
            },
            {
                kind: "season",
                live: [entries[4]],
                upcoming: [entries[5]],
            },
        ]);
    });

    it("keeps simultaneous live entries in a track in start order", () => {
        const entries = [
            createEntry({id: "radiance", kind: "event", startDay: "2026-06-19", endDay: "2026-07-02"}),
            createEntry({id: "seasonal-light", kind: "event", startDay: "2026-06-20", endDay: "2026-07-02"}),
            createEntry({id: "returning-spirits", kind: "returning-spirits", startDay: "2026-06-21", endDay: "2026-07-02"}),
        ];

        expect(getTracks(entries, "2026-06-21")[1].live).toEqual(entries);
    });

    it("keeps simultaneous upcoming entries and limits each track to four", () => {
        const entries = [
            createEntry({id: "same-start-long", kind: "event", startDay: "2026-07-08", endDay: "2026-07-20"}),
            createEntry({id: "same-start-short", kind: "event", startDay: "2026-07-08", endDay: "2026-07-10"}),
            createEntry({id: "third", kind: "event", startDay: "2026-07-12", endDay: "2026-07-15"}),
            createEntry({id: "fourth", kind: "event", startDay: "2026-07-16", endDay: "2026-07-19"}),
            createEntry({id: "fifth", kind: "event", startDay: "2026-07-20", endDay: "2026-07-23"}),
        ];

        expect(getTracks(entries, "2026-07-05")[1].upcoming).toEqual(entries.slice(0, 4));
    });

    it("keeps empty tracks visible", () => {
        const event = createEntry({id: "event", kind: "event", startDay: "2026-07-01", endDay: "2026-07-10"});

        expect(getTracks([event], "2026-07-05")[0]).toEqual({
            kind: "travelling-spirit",
            live: [],
            upcoming: [],
        });
    });

    it("returns no entries or segments for an empty month", () => {
        const monthEntries = getEntriesForMonth([], "2026-07");

        expect(monthEntries).toEqual([]);
        expect(getWeekSegments(monthEntries, getMonthWeeks("2026-07"))).toEqual([]);
    });

    it("classifies an entry as live with inclusive progress on its first and last day", () => {
        const entry = createEntry({id: "live", kind: "event", startDay: "2026-07-31", endDay: "2026-08-20"});

        expect(getEntryTiming(entry, "2026-07-31")).toEqual({
            state: "live",
            progress: {dayNumber: 1, totalDays: 21, daysRemaining: 20},
        });
        expect(getEntryTiming(entry, "2026-08-20")).toEqual({
            state: "live",
            progress: {dayNumber: 21, totalDays: 21, daysRemaining: 0},
        });
    });

    it("classifies an entry as upcoming with whole days until it starts", () => {
        const entry = createEntry({id: "upcoming", kind: "event", startDay: "2026-08-01", endDay: "2026-08-10"});

        expect(getEntryTiming(entry, "2026-07-30")).toEqual({state: "upcoming", daysUntil: 2});
    });

    it("classifies an entry as past the day after it ends", () => {
        const entry = createEntry({id: "past", kind: "event", startDay: "2026-07-01", endDay: "2026-07-10"});

        expect(getEntryTiming(entry, "2026-07-11")).toEqual({state: "past"});
    });
});
