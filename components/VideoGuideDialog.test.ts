import {describe, expect, it} from "vitest";
import {isDirectVideoUrl} from "../lib/video-guide-url";

describe("isDirectVideoUrl", () => {
    it("treats UploadThing file URLs as direct video URLs", () => {
        expect(isDirectVideoUrl("https://utfs.io/f/example")).toBe(true);
        expect(isDirectVideoUrl("https://app-id.ufs.sh/f/example")).toBe(true);
    });

    it("detects extension-based direct video URLs", () => {
        expect(isDirectVideoUrl("https://example.com/guide.mp4?token=abc")).toBe(true);
        expect(isDirectVideoUrl("https://youtu.be/example")).toBe(false);
    });
});
