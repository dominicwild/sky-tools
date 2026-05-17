import {describe, expect, it} from "vitest";
import {questsData} from "./questData";

describe("questsData", () => {
    it("has unique IDs", () => {
        const questIds = questsData.map((quest) => quest.id);

        expect(new Set(questIds).size).toBe(questIds.length);
    });
});
