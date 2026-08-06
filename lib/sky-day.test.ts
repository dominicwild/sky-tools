import {describe, expect, it, vi} from "vitest";

vi.mock("./utils", () => ({
    getSkyDate: () => "2026-1-2",
}));

import {
    addSkyDays,
    compareSkyDays,
    differenceInSkyDays,
    getCurrentSkyDay,
    getMonthWeeks,
    getSkyMonth,
} from "./sky-day";

describe("Sky day helpers", () => {
    it("pads the current Sky day from the existing Sky date helper", () => {
        expect(getCurrentSkyDay()).toBe("2026-01-02");
    });

    it.each([
        ["2026-07-31", 1, "2026-08-01"],
        ["2026-12-31", 1, "2027-01-01"],
        ["2026-03-08", 1, "2026-03-09"],
        ["2026-11-01", 1, "2026-11-02"],
    ])("moves %s by %i day(s)", (day, count, expectedDay) => {
        expect(addSkyDays(day, count)).toBe(expectedDay);
    });

    it("finds the whole-day difference in either direction", () => {
        expect(differenceInSkyDays("2026-07-01", "2026-07-31")).toBe(30);
        expect(differenceInSkyDays("2026-07-31", "2026-07-01")).toBe(-30);
    });

    it("compares padded Sky days in calendar order", () => {
        expect(compareSkyDays("2026-07-29", "2026-10-01")).toBeLessThan(0);
        expect(compareSkyDays("2026-10-01", "2026-07-29")).toBeGreaterThan(0);
        expect(compareSkyDays("2026-07-29", "2026-07-29")).toBe(0);
    });

    it("gets a Sky month from a Sky day", () => {
        expect(getSkyMonth("2026-07-29")).toBe("2026-07");
    });

    it("builds Monday-first weeks that cover July 2026", () => {
        const weeks = getMonthWeeks("2026-07");

        expect(weeks[0]).toEqual([
            {day: "2026-06-29", inMonth: false},
            {day: "2026-06-30", inMonth: false},
            {day: "2026-07-01", inMonth: true},
            {day: "2026-07-02", inMonth: true},
            {day: "2026-07-03", inMonth: true},
            {day: "2026-07-04", inMonth: true},
            {day: "2026-07-05", inMonth: true},
        ]);
        expect(weeks.every((week) => week.length === 7)).toBe(true);
        expect(weeks[weeks.length - 1]).toEqual([
            {day: "2026-07-27", inMonth: true},
            {day: "2026-07-28", inMonth: true},
            {day: "2026-07-29", inMonth: true},
            {day: "2026-07-30", inMonth: true},
            {day: "2026-07-31", inMonth: true},
            {day: "2026-08-01", inMonth: false},
            {day: "2026-08-02", inMonth: false},
        ]);
    });
});
