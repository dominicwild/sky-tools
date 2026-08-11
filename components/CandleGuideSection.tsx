"use client"

import {Flame, Maximize, Sparkles, Video} from "lucide-react";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
import {getImageUrl} from "@/util/helper";
import type {CandleGuide, CandleGuideKind} from "@/lib/daily-quest-source";
import type {GuideMedia} from "@/lib/quest-types";

const candleGuideLabels: Record<CandleGuideKind, string> = {
    "seasonal-candles": "Seasonal Candles",
    "candle-cakes": "Candle Cakes",
};

interface CandleGuideSectionProps {
    candleGuides: CandleGuide[]
    onOpenVisualGuide: (guide: GuideMedia) => void
    onOpenVideoGuide: (guide: GuideMedia) => void
}

export default function CandleGuideSection({
    candleGuides,
    onOpenVisualGuide,
    onOpenVideoGuide,
}: Readonly<CandleGuideSectionProps>) {
    if (candleGuides.length === 0) {
        return null;
    }

    return (
        <section className="mt-8 pt-2">
            <div className="mb-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/35 text-sky-900 ring-1 ring-sky-900/15">
                    <Flame className="h-4 w-4"/>
                </div>
                <div>
                    <p className="text-xs font-semibold uppercase text-sky-950/70 dark:text-white/65">
                        Today&apos;s Light
                    </p>
                    <h3 className="text-xl font-semibold text-sky-950/85 drop-shadow-sm dark:text-white/90">
                        Candle Locations
                    </h3>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:auto-rows-fr">
                {candleGuides.map((guide) => (
                    <CandleGuideCard
                        key={guide.kind}
                        guide={guide}
                        onOpenVisualGuide={onOpenVisualGuide}
                        onOpenVideoGuide={onOpenVideoGuide}
                    />
                ))}
            </div>
        </section>
    );
}

function CandleGuideCard({
    guide,
    onOpenVisualGuide,
    onOpenVideoGuide,
}: Readonly<{
    guide: CandleGuide
    onOpenVisualGuide: (guide: GuideMedia) => void
    onOpenVideoGuide: (guide: GuideMedia) => void
}>) {
    const guideMedia = toGuideMedia(guide);
    const label = candleGuideLabels[guide.kind];

    return (
        <Card className="h-full overflow-hidden rounded-lg border border-white/15 bg-sky-950/60 text-white shadow-lg backdrop-blur-md">
            <CardContent className="flex h-full flex-col p-3">
                <div className="mb-3 flex min-w-0 items-center justify-between gap-3">
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <Badge className="border-none bg-white/85 px-2 py-1 text-xs text-sky-950 shadow-sm">
                            <Sparkles className="mr-1 h-3 w-3"/>
                            {label}
                        </Badge>
                        {guide.realm && (
                            <Badge className="max-w-full truncate border-none bg-sky-500/85 px-2 py-1 text-xs text-white shadow-sm">
                                {guide.realm}
                            </Badge>
                        )}
                    </div>

                    {guide.videoGuideUrl && (
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-8 shrink-0 border-none bg-sky-800/80 px-2 text-white hover:bg-sky-950 hover:text-white"
                            onClick={() => onOpenVideoGuide(guideMedia)}
                        >
                            <Video className="h-3.5 w-3.5"/>
                            <span className="sr-only">Open {getAccessibleGuideName(guide)} video</span>
                        </Button>
                    )}
                </div>

                {guide.visualGuideUrl ? (
                    <button
                        type="button"
                        className="group relative flex h-56 w-full flex-1 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-sky-900/80 p-2"
                        onClick={() => onOpenVisualGuide(guideMedia)}
                        aria-label={`Open ${getAccessibleGuideName(guide)} guide`}
                    >
                        <img
                            src={getImageUrl(guide.visualGuideUrl)}
                            alt={`${getAccessibleGuideName(guide)} guide`}
                            className="h-full w-full rounded-md object-contain"
                            onError={(e) => {
                                ;(e.target as HTMLImageElement).src = "/oh-no.png"
                            }}
                        />
                        <span className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/0 transition-all group-hover:bg-black/40">
                            <Maximize className="h-7 w-7 text-white opacity-0 transition-opacity group-hover:opacity-100"/>
                        </span>
                    </button>
                ) : (
                    <div className="flex h-56 flex-1 items-center justify-center rounded-lg bg-sky-900/80 p-4 text-center text-sm text-white/75">
                        No visual guide available
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function getAccessibleGuideName(guide: CandleGuide) {
    const label = candleGuideLabels[guide.kind];

    return guide.realm ? `${label} in ${guide.realm}` : label;
}

function toGuideMedia(guide: CandleGuide): GuideMedia {
    return {
        questName: candleGuideLabels[guide.kind],
        visualGuideUrl: guide.visualGuideUrl,
        videoGuideUrl: guide.videoGuideUrl,
    };
}
