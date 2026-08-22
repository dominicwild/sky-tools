import {existsSync} from "node:fs";
import {join} from "node:path";
import {describe, expect, it} from "vitest";
import {calendarCoverage, skyCalendarEntries} from "./skyEvents";

const skyDayPattern = /^\d{4}-\d{2}-\d{2}$/;

function isValidSkyDay(skyDay: string): boolean {
    const [year, month, day] = skyDay.split("-").map(Number);

    return new Date(Date.UTC(year, month - 1, day)).toISOString().slice(0, 10) === skyDay;
}

function entriesOverlap(left: {startDay: string; endDay: string}, right: {startDay: string; endDay: string}): boolean {
    return left.startDay <= right.endDay && right.startDay <= left.endDay;
}

function eventsShareCalendarMonth(
    left: {startDay: string; endDay: string},
    right: {startDay: string; endDay: string}
): boolean {
    return left.startDay.slice(0, 7) <= right.endDay.slice(0, 7) && right.startDay.slice(0, 7) <= left.endDay.slice(0, 7);
}

describe("Sky calendar data", () => {
    it("uses padded day fields and valid date windows", () => {
        expect(calendarCoverage.checkedOn).toMatch(skyDayPattern);
        expect(calendarCoverage.coverageThrough).toMatch(skyDayPattern);
        expect(isValidSkyDay(calendarCoverage.checkedOn)).toBe(true);
        expect(isValidSkyDay(calendarCoverage.coverageThrough)).toBe(true);

        for (const entry of skyCalendarEntries) {
            expect(entry.startDay).toMatch(skyDayPattern);
            expect(entry.endDay).toMatch(skyDayPattern);
            expect(entry.verifiedOn).toMatch(skyDayPattern);
            expect(isValidSkyDay(entry.startDay)).toBe(true);
            expect(isValidSkyDay(entry.endDay)).toBe(true);
            expect(isValidSkyDay(entry.verifiedOn)).toBe(true);
            expect(entry.startDay <= entry.endDay).toBe(true);
        }
    });

    it("uses unique entry ids", () => {
        const ids = skyCalendarEntries.map((entry) => entry.id);

        expect(new Set(ids)).toHaveLength(ids.length);
    });

    it("provides usable player-facing content", () => {
        for (const entry of skyCalendarEntries) {
            expect(entry.description).not.toHaveLength(0);
            expect(entry.link === null || entry.link.url.startsWith("https://")).toBe(true);
            expect(entry.link === null || entry.link.label.length > 0).toBe(true);
            expect(entry.image === null || entry.image.url.startsWith("https://")).toBe(true);
            expect(entry.image === null || entry.image.alt.length > 0).toBe(true);
            expect(entry.kind !== "season" || entry.icon.url.startsWith("/")).toBe(true);
            expect(entry.kind !== "season" || entry.icon.alt.length > 0).toBe(true);
            expect(entry.kind !== "season" || existsSync(join(process.cwd(), "public", entry.icon.url))).toBe(true);
            expect(entry.link?.url).not.toBe("https://sky-children-of-the-light.fandom.com/wiki/Radiance_Event");
            expect(entry.link?.url).not.toBe("https://sky-children-of-the-light.fandom.com/wiki/Seasonal_Light");
        }
    });

    it("assigns distinct palettes to events shown in the same month", () => {
        const events = skyCalendarEntries.filter((entry) => entry.kind === "event");

        for (const [index, event] of events.entries()) {
            for (const otherEvent of events.slice(index + 1)) {
                if (eventsShareCalendarMonth(event, otherEvent)) {
                    expect(event.palette).not.toBe(otherEvent.palette);
                }
            }
        }
    });

    it("does not overlap entries with the same fixed-colour kind", () => {
        const fixedColourKinds = ["season", "travelling-spirit", "returning-spirits"] as const;

        for (const kind of fixedColourKinds) {
            const entries = skyCalendarEntries.filter((entry) => entry.kind === kind);

            for (const [index, entry] of entries.entries()) {
                for (const otherEntry of entries.slice(index + 1)) {
                    expect(entriesOverlap(entry, otherEntry)).toBe(false);
                }
            }
        }
    });

    it("covers every entry through its latest end day", () => {
        const latestEndDay = skyCalendarEntries.reduce((latest, entry) =>
            entry.endDay > latest.endDay ? entry : latest
        ).endDay;

        expect(calendarCoverage.coverageThrough).toBe(latestEndDay);
        expect(calendarCoverage.coverageThrough >= calendarCoverage.checkedOn).toBe(true);
    });
});
