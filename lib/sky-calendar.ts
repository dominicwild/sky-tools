import {SkyCalendarEntry, SkyCalendarEntryKind} from "@/data/skyEvents";
import {
    compareSkyDays,
    differenceInSkyDays,
    getSkyMonth,
    SkyDay,
    SkyMonth,
} from "./sky-day";

const UPCOMING_TRACK_LIMIT = 4;

export type SkyCalendarTrackKind = "travelling-spirit" | "events" | "season";

export type SkyCalendarTrack = {
    kind: SkyCalendarTrackKind;
    live: SkyCalendarEntry[];
    upcoming: SkyCalendarEntry[];
};

export type SkyCalendarMonthEntry = {
    entry: SkyCalendarEntry;
    startDay: SkyDay;
    endDay: SkyDay;
};

export type SkyCalendarWeekDay = {
    day: SkyDay;
    inMonth: boolean;
};

export type SkyCalendarWeek = readonly SkyCalendarWeekDay[];

export type SkyCalendarWeekSegment = {
    entry: SkyCalendarEntry;
    weekIndex: number;
    startColumn: number;
    endColumn: number;
    startsWindow: boolean;
    endsWindow: boolean;
    row: number;
};

export type SkyCalendarEntryProgress = {
    dayNumber: number;
    totalDays: number;
    daysRemaining: number;
};

export type SkyCalendarEntryTiming =
    | {state: "live"; progress: SkyCalendarEntryProgress}
    | {state: "upcoming"; daysUntil: number}
    | {state: "past"};

type SkyCalendarTrackDefinition = {
    kind: SkyCalendarTrackKind;
    entryKinds: readonly SkyCalendarEntryKind[];
};

type RowAssignedMonthEntry = SkyCalendarMonthEntry & {row: number};

const trackDefinitions: readonly SkyCalendarTrackDefinition[] = [
    {kind: "travelling-spirit", entryKinds: ["travelling-spirit"]},
    {kind: "events", entryKinds: ["event", "returning-spirits"]},
    {kind: "season", entryKinds: ["season"]},
];

function getEntryDuration(entry: {startDay: SkyDay; endDay: SkyDay}): number {
    return differenceInSkyDays(entry.startDay, entry.endDay);
}

function compareWindowsByStart(
    left: {startDay: SkyDay; endDay: SkyDay},
    right: {startDay: SkyDay; endDay: SkyDay}
): number {
    const startComparison = compareSkyDays(left.startDay, right.startDay);

    if (startComparison !== 0) {
        return startComparison;
    }

    const durationComparison = getEntryDuration(right) - getEntryDuration(left);

    if (durationComparison !== 0) {
        return durationComparison;
    }

    return 0;
}

function compareEntriesByStart(left: SkyCalendarEntry, right: SkyCalendarEntry): number {
    const windowComparison = compareWindowsByStart(left, right);

    if (windowComparison !== 0) {
        return windowComparison;
    }

    return left.id.localeCompare(right.id);
}

function compareMonthEntriesByStart(left: SkyCalendarMonthEntry, right: SkyCalendarMonthEntry): number {
    const windowComparison = compareWindowsByStart(left, right);

    if (windowComparison !== 0) {
        return windowComparison;
    }

    return left.entry.id.localeCompare(right.entry.id);
}

function getLaterSkyDay(left: SkyDay, right: SkyDay): SkyDay {
    return compareSkyDays(left, right) > 0 ? left : right;
}

function getEarlierSkyDay(left: SkyDay, right: SkyDay): SkyDay {
    return compareSkyDays(left, right) < 0 ? left : right;
}

function entriesOverlap(
    left: {startDay: SkyDay; endDay: SkyDay},
    right: {startDay: SkyDay; endDay: SkyDay}
): boolean {
    return compareSkyDays(left.startDay, right.endDay) <= 0 && compareSkyDays(left.endDay, right.startDay) >= 0;
}

function assignRows(entries: SkyCalendarMonthEntry[]): RowAssignedMonthEntry[] {
    return [...entries].sort(compareMonthEntriesByStart).reduce<RowAssignedMonthEntry[]>((assignedEntries, entry) => {
        const occupiedRows = assignedEntries
            .filter((assignedEntry) => entriesOverlap(assignedEntry, entry))
            .map((assignedEntry) => assignedEntry.row);
        let row = 0;

        while (occupiedRows.includes(row)) {
            row += 1;
        }

        return [...assignedEntries, {...entry, row}];
    }, []);
}

function getWeekSegment(
    entry: RowAssignedMonthEntry,
    week: SkyCalendarWeek,
    weekIndex: number
): SkyCalendarWeekSegment[] {
    const weekWindow = {startDay: week[0].day, endDay: week[week.length - 1].day};

    if (!entriesOverlap(entry, weekWindow)) {
        return [];
    }

    const startDay = getLaterSkyDay(entry.startDay, weekWindow.startDay);
    const endDay = getEarlierSkyDay(entry.endDay, weekWindow.endDay);

    return [
        {
            entry: entry.entry,
            weekIndex,
            startColumn: week.findIndex((day) => day.day === startDay) + 1,
            endColumn: week.findIndex((day) => day.day === endDay) + 1,
            startsWindow: startDay === entry.entry.startDay,
            endsWindow: endDay === entry.entry.endDay,
            row: entry.row,
        },
    ];
}

export function getTracks(entries: SkyCalendarEntry[], today: SkyDay): SkyCalendarTrack[] {
    return trackDefinitions.map((track) => {
        const trackEntries = entries.filter((entry) => track.entryKinds.includes(entry.kind)).sort(compareEntriesByStart);
        const liveEntries = trackEntries.filter(
            (entry) => compareSkyDays(entry.startDay, today) <= 0 && compareSkyDays(entry.endDay, today) >= 0
        );
        const upcomingEntries = trackEntries.filter((entry) => compareSkyDays(entry.startDay, today) > 0);

        return {
            kind: track.kind,
            live: liveEntries,
            upcoming: upcomingEntries.slice(0, UPCOMING_TRACK_LIMIT),
        };
    });
}

export function getMonthEntries(
    entries: SkyCalendarEntry[],
    month: SkyMonth,
    weeks: readonly SkyCalendarWeek[]
): SkyCalendarMonthEntry[] {
    const gridRange = {startDay: weeks[0][0].day, endDay: weeks[weeks.length - 1][6].day};

    return entries
        .filter((entry) => {
            if (entry.kind === "season" && getSkyMonth(entry.startDay) !== month && getSkyMonth(entry.endDay) !== month) {
                return false;
            }

            return entriesOverlap(entry, gridRange);
        })
        .map((entry) => ({
            entry,
            startDay: getLaterSkyDay(entry.startDay, gridRange.startDay),
            endDay: getEarlierSkyDay(entry.endDay, gridRange.endDay),
        }))
        .sort(compareMonthEntriesByStart);
}

export function getWeekSegments(
    monthEntries: SkyCalendarMonthEntry[],
    weeks: readonly SkyCalendarWeek[]
): SkyCalendarWeekSegment[] {
    const entries = assignRows(monthEntries);

    return weeks.flatMap((week, weekIndex) => entries.flatMap((entry) => getWeekSegment(entry, week, weekIndex)));
}

export function getEntryProgress(entry: SkyCalendarEntry, today: SkyDay): SkyCalendarEntryProgress {
    return {
        dayNumber: differenceInSkyDays(entry.startDay, today) + 1,
        totalDays: differenceInSkyDays(entry.startDay, entry.endDay) + 1,
        daysRemaining: differenceInSkyDays(today, entry.endDay),
    };
}

export function getEntryTiming(entry: SkyCalendarEntry, today: SkyDay): SkyCalendarEntryTiming {
    if (compareSkyDays(entry.startDay, today) > 0) {
        return {state: "upcoming", daysUntil: differenceInSkyDays(today, entry.startDay)};
    }

    if (compareSkyDays(entry.endDay, today) < 0) {
        return {state: "past"};
    }

    return {state: "live", progress: getEntryProgress(entry, today)};
}
