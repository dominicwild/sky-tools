import {describe, expect, it} from "vitest";
import {getSkyDateKey, getSkyDateKeyFromIsoDate} from "./utils";

describe("sky date helpers", () => {
    it("formats dates in the Sky reset timezone", () => {
        expect(getSkyDateKey(new Date("2026-06-04T06:59:59.000Z"))).toBe("2026-6-3");
        expect(getSkyDateKey(new Date("2026-06-04T07:00:00.000Z"))).toBe("2026-6-4");
    });

    it("normalizes SkyHelper ISO dates to the local Sky date key", () => {
        expect(getSkyDateKeyFromIsoDate("2026-06-04T00:00:00.000-07:00")).toBe("2026-6-4");
        expect(getSkyDateKeyFromIsoDate("not a date")).toBeNull();
    });
});
