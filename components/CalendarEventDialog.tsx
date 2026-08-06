"use client";

import {useEffect, useState} from "react";
import Link from "next/link";
import {ArrowUpRight} from "lucide-react";
import {Badge} from "@/components/ui/badge";
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import CalendarProgressBar from "@/components/CalendarProgressBar";
import {CountdownChip, EndedBadge, EntryIcon, ExpectedBadge, NowOnBadge} from "@/components/CalendarIcons";
import {cn} from "@/lib/utils";
import {entryKindLabels, formatSkyDayRangeWithDuration, getEntryColorClasses} from "@/lib/calendar-presentation";
import {getEntryTiming} from "@/lib/sky-calendar";
import type {SkyDay} from "@/lib/sky-day";
import type {SkyCalendarEntry} from "@/data/skyEvents";

interface CalendarEventDialogProps {
    entry: SkyCalendarEntry | null;
    today: SkyDay;
    openingElement: HTMLElement | null;
    onClose: () => void;
}

export default function CalendarEventDialog({entry, today, openingElement, onClose}: Readonly<CalendarEventDialogProps>) {
    return (
        <Dialog open={entry !== null} onOpenChange={(open) => (open ? undefined : onClose())}>
            {entry && <CalendarEventDialogBody key={entry.id} entry={entry} today={today} openingElement={openingElement} />}
        </Dialog>
    );
}

function CalendarEventDialogBody({
    entry,
    today,
    openingElement,
}: Readonly<{entry: SkyCalendarEntry; today: SkyDay; openingElement: HTMLElement | null}>) {
    const colorClasses = getEntryColorClasses(entry);
    const timing = getEntryTiming(entry, today);
    const isExpected = entry.confidence === "expected";
    const isLive = timing.state === "live";
    const isEnded = timing.state === "past";
    const showCloseScrim = useCloseButtonScrim(entry.image ? entry.image.url : null);

    return (
        <DialogContent
            onCloseAutoFocus={(event) => {
                event.preventDefault();
                openingElement?.focus();
            }}
            className="max-h-[calc(100svh-2rem)] gap-0 overflow-x-hidden overflow-y-auto border-0 bg-sky-950 p-0 text-white backdrop-blur-md"
        >
            {entry.image && (
                <div className="relative -mx-px -mt-px h-44 bg-sky-900">
                    <img src={entry.image.url} alt={entry.image.alt} className="block h-full w-full object-cover object-top" />
                    <div className="pointer-events-none absolute inset-x-0 top-0 -bottom-px bg-[linear-gradient(to_top,var(--color-sky-950)_0%,var(--color-sky-950)_25%,color-mix(in_oklab,var(--color-sky-950)_40%,transparent)_65%,color-mix(in_oklab,var(--color-sky-950)_30%,transparent)_100%)]" />
                </div>
            )}

            {showCloseScrim && (
                <div className="pointer-events-none absolute top-1 right-1 size-10 rounded-full bg-black/35" aria-hidden />
            )}

            <div className="flex flex-col gap-5 p-6">
                <DialogHeader className="gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge className={cn("gap-1 border-none", colorClasses.badge)}>
                            <EntryIcon kind={entry.kind} className="h-3 w-3" />
                            {entryKindLabels[entry.kind]}
                        </Badge>
                        {isExpected && <ExpectedBadge />}
                        {isLive && <NowOnBadge />}
                        {isEnded && <EndedBadge />}
                    </div>
                    <DialogTitle className="text-2xl font-semibold leading-tight">{entry.title}</DialogTitle>
                    <DialogDescription className="text-sm font-medium text-white/55">
                        {formatSkyDayRangeWithDuration(entry.startDay, entry.endDay)}
                    </DialogDescription>
                </DialogHeader>

                <p className="text-sm leading-relaxed text-white/80">{entry.description}</p>

                {timing.state === "live" && <CalendarProgressBar progress={timing.progress} colorClasses={colorClasses} />}
                {timing.state === "upcoming" && <CountdownChip daysUntil={timing.daysUntil} />}

                {entry.link && (
                    <Link
                        href={entry.link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                            "inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold shadow-lg transition-transform hover:-translate-y-0.5",
                            colorClasses.badge
                        )}
                    >
                        {entry.link.label}
                        <ArrowUpRight className="h-4 w-4" />
                    </Link>
                )}
            </div>
        </DialogContent>
    );
}

const closeScrimLuminanceThreshold = 0.6;

function useCloseButtonScrim(imageUrl: string | null): boolean {
    const [showScrim, setShowScrim] = useState(imageUrl !== null);

    useEffect(() => {
        if (imageUrl === null) {
            return;
        }

        let cancelled = false;
        const image = new Image();
        image.crossOrigin = "anonymous";
        image.onload = () => {
            if (!cancelled) {
                setShowScrim(closeCornerNeedsScrim(image));
            }
        };
        image.src = imageUrl;

        return () => {
            cancelled = true;
        };
    }, [imageUrl]);

    return showScrim;
}

function closeCornerNeedsScrim(image: HTMLImageElement): boolean {
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext("2d");
    if (context === null) {
        return true;
    }

    context.drawImage(image, 0, 0);
    const regionWidth = Math.max(1, Math.round(image.naturalWidth * 0.3));
    const regionHeight = Math.max(1, Math.round(image.naturalHeight * 0.3));
    const regionX = image.naturalWidth - regionWidth;

    try {
        const {data} = context.getImageData(regionX, 0, regionWidth, regionHeight);
        return meanRelativeLuminance(data) >= closeScrimLuminanceThreshold;
    } catch {
        return true;
    }
}

function meanRelativeLuminance(pixels: Uint8ClampedArray): number {
    let total = 0;
    for (let offset = 0; offset < pixels.length; offset += 4) {
        total += relativeLuminance(pixels[offset], pixels[offset + 1], pixels[offset + 2]);
    }
    return total / (pixels.length / 4);
}

function relativeLuminance(red: number, green: number, blue: number): number {
    return 0.2126 * toLinear(red) + 0.7152 * toLinear(green) + 0.0722 * toLinear(blue);
}

function toLinear(channel: number): number {
    const normalised = channel / 255;
    return normalised <= 0.03928 ? normalised / 12.92 : ((normalised + 0.055) / 1.055) ** 2.4;
}
