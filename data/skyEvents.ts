import {SkyDay} from "@/lib/sky-day";

export type SkyCalendarEntryKind = "event" | "season" | "travelling-spirit" | "returning-spirits";

type SkyCalendarConfidence = "confirmed" | "expected";

export type SkyEventPalette = "amber" | "coral" | "rose" | "teal";

type SkyCalendarEntryCommon = {
    id: string;
    title: string;
    startDay: SkyDay;
    endDay: SkyDay;
    confidence: SkyCalendarConfidence;
    detailUrl: string;
    sourceUrl: string;
    verifiedOn: SkyDay;
};

export type SkyCalendarEntry =
    | (SkyCalendarEntryCommon & {kind: "event"; palette: SkyEventPalette})
    | (SkyCalendarEntryCommon & {kind: "season" | "travelling-spirit" | "returning-spirits"});

export const calendarCoverage = {
    checkedOn: "2026-07-30",
    coverageThrough: "2026-10-11",
} as const;

export const skyCalendarEntries: SkyCalendarEntry[] = [
    {
        id: "season-of-carnival-2026",
        kind: "season",
        title: "Season of Carnival",
        startDay: "2026-04-17",
        endDay: "2026-07-02",
        confidence: "confirmed",
        detailUrl: "https://sky-children-of-the-light.fandom.com/wiki/Carnival",
        sourceUrl: "https://raw.githubusercontent.com/thatskyapplication/thatskyapplication/main/packages/utility/source/kingdom/seasons/carnival/index.ts",
        verifiedOn: "2026-07-30",
    },
    {
        id: "radiance-event-2026-06",
        kind: "event",
        title: "Radiance Event",
        startDay: "2026-06-19",
        endDay: "2026-07-02",
        confidence: "confirmed",
        detailUrl: "https://sky-children-of-the-light.fandom.com/wiki/Radiance_Event",
        sourceUrl: "https://raw.githubusercontent.com/thatskyapplication/thatskyapplication/main/packages/utility/source/events/miscellaneous.ts",
        verifiedOn: "2026-07-30",
        palette: "amber",
    },
    {
        id: "double-seasonal-light-treasure-candles-2026-06",
        kind: "event",
        title: "2x Seasonal Light, Treasure Candles",
        startDay: "2026-06-19",
        endDay: "2026-07-02",
        confidence: "confirmed",
        detailUrl: "https://sky-children-of-the-light.fandom.com/wiki/Seasonal_Light",
        sourceUrl: "https://raw.githubusercontent.com/thatskyapplication/thatskyapplication/main/packages/utility/source/kingdom/treasure-candles.ts",
        verifiedOn: "2026-07-30",
        palette: "coral",
    },
    {
        id: "returning-spirits-season-of-revival-2026-06",
        kind: "returning-spirits",
        title: "Returning Spirits: Season of Revival",
        startDay: "2026-06-19",
        endDay: "2026-07-02",
        confidence: "confirmed",
        detailUrl: "https://sky-children-of-the-light.fandom.com/wiki/Returning_Spirits",
        sourceUrl: "https://raw.githubusercontent.com/thatskyapplication/thatskyapplication/main/packages/utility/source/models/spirits.ts",
        verifiedOn: "2026-07-30",
    },
    {
        id: "travelling-spirit-greeting-shaman-2026-07",
        kind: "travelling-spirit",
        title: "Greeting Shaman",
        startDay: "2026-07-02",
        endDay: "2026-07-05",
        confidence: "confirmed",
        detailUrl: "https://sky-children-of-the-light.fandom.com/wiki/Greeting_Shaman",
        sourceUrl: "https://sky-children-of-the-light.fandom.com/wiki/Greeting_Shaman",
        verifiedOn: "2026-07-30",
    },
    {
        id: "sky-anniversary-2026",
        kind: "event",
        title: "Sky Anniversary",
        startDay: "2026-07-03",
        endDay: "2026-07-23",
        confidence: "confirmed",
        detailUrl: "https://sky-children-of-the-light.fandom.com/wiki/Sky_Anniversary",
        sourceUrl: "https://www.thatskygame.com/news/this-month-in-sky-july-2026-edition/",
        verifiedOn: "2026-07-30",
        palette: "rose",
    },
    {
        id: "travelling-spirit-light-whisperer-2026-07",
        kind: "travelling-spirit",
        title: "Light Whisperer",
        startDay: "2026-07-16",
        endDay: "2026-07-19",
        confidence: "confirmed",
        detailUrl: "https://sky-children-of-the-light.fandom.com/wiki/Light_Whisperer",
        sourceUrl: "https://sky-children-of-the-light.fandom.com/wiki/Light_Whisperer",
        verifiedOn: "2026-07-30",
    },
    {
        id: "season-of-dear-van-gogh-2026",
        kind: "season",
        title: "Season of Dear Van Gogh",
        startDay: "2026-07-17",
        endDay: "2026-10-01",
        confidence: "confirmed",
        detailUrl: "https://sky-children-of-the-light.fandom.com/wiki/Dear_Van_Gogh",
        sourceUrl: "https://sky-children-of-the-light.fandom.com/wiki/Dear_Van_Gogh",
        verifiedOn: "2026-07-30",
    },
    {
        id: "travelling-spirit-confetti-cousin-2026-07",
        kind: "travelling-spirit",
        title: "Confetti Cousin",
        startDay: "2026-07-30",
        endDay: "2026-08-02",
        confidence: "confirmed",
        detailUrl: "https://sky-children-of-the-light.fandom.com/wiki/Confetti_Cousin",
        sourceUrl: "https://sky-children-of-the-light.fandom.com/wiki/Confetti_Cousin",
        verifiedOn: "2026-07-30",
    },
    {
        id: "days-of-sunlight-2026",
        kind: "event",
        title: "Days of Sunlight",
        startDay: "2026-07-31",
        endDay: "2026-08-20",
        confidence: "confirmed",
        detailUrl: "https://sky-children-of-the-light.fandom.com/wiki/Days_of_Sunlight",
        sourceUrl: "https://www.thatskygame.com/news/this-month-in-sky-july-2026-edition/",
        verifiedOn: "2026-07-30",
        palette: "teal",
    },
    {
        id: "travelling-spirit-2026-08-13",
        kind: "travelling-spirit",
        title: "Travelling Spirit",
        startDay: "2026-08-13",
        endDay: "2026-08-16",
        confidence: "expected",
        detailUrl: "https://sky-children-of-the-light.fandom.com/wiki/Traveling_Spirits",
        sourceUrl: "https://raw.githubusercontent.com/thatskyapplication/thatskyapplication/main/packages/utility/source/schedule.ts",
        verifiedOn: "2026-07-30",
    },
    {
        id: "travelling-spirit-2026-08-27",
        kind: "travelling-spirit",
        title: "Travelling Spirit",
        startDay: "2026-08-27",
        endDay: "2026-08-30",
        confidence: "expected",
        detailUrl: "https://sky-children-of-the-light.fandom.com/wiki/Traveling_Spirits",
        sourceUrl: "https://raw.githubusercontent.com/thatskyapplication/thatskyapplication/main/packages/utility/source/schedule.ts",
        verifiedOn: "2026-07-30",
    },
    {
        id: "travelling-spirit-2026-09-10",
        kind: "travelling-spirit",
        title: "Travelling Spirit",
        startDay: "2026-09-10",
        endDay: "2026-09-13",
        confidence: "expected",
        detailUrl: "https://sky-children-of-the-light.fandom.com/wiki/Traveling_Spirits",
        sourceUrl: "https://raw.githubusercontent.com/thatskyapplication/thatskyapplication/main/packages/utility/source/schedule.ts",
        verifiedOn: "2026-07-30",
    },
    {
        id: "travelling-spirit-2026-09-24",
        kind: "travelling-spirit",
        title: "Travelling Spirit",
        startDay: "2026-09-24",
        endDay: "2026-09-27",
        confidence: "expected",
        detailUrl: "https://sky-children-of-the-light.fandom.com/wiki/Traveling_Spirits",
        sourceUrl: "https://raw.githubusercontent.com/thatskyapplication/thatskyapplication/main/packages/utility/source/schedule.ts",
        verifiedOn: "2026-07-30",
    },
    {
        id: "travelling-spirit-2026-10-08",
        kind: "travelling-spirit",
        title: "Travelling Spirit",
        startDay: "2026-10-08",
        endDay: "2026-10-11",
        confidence: "expected",
        detailUrl: "https://sky-children-of-the-light.fandom.com/wiki/Traveling_Spirits",
        sourceUrl: "https://raw.githubusercontent.com/thatskyapplication/thatskyapplication/main/packages/utility/source/schedule.ts",
        verifiedOn: "2026-07-30",
    },
];
