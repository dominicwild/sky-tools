import {existsSync} from "node:fs";
import {join} from "node:path";
import {describe, expect, it} from "vitest";
import {questsData} from "./questData";

describe("questsData", () => {
    it("has unique IDs", () => {
        const questIds = questsData.map((quest) => quest.id);

        expect(new Set(questIds).size).toBe(questIds.length);
    });

    it("has a file in skyImages/ for every image it names", () => {
        const imageFileNames = questsData.flatMap((quest) => (
            quest.visualGuideUrl === null ? [quest.iconUrl] : [quest.iconUrl, quest.visualGuideUrl]
        ));
        const missingImages = imageFileNames.filter((fileName) => !existsSync(join(process.cwd(), "skyImages", fileName)));

        expect(missingImages).toEqual([]);
    });
});
