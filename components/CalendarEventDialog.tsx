"use client";

import Link from "next/link";
import {ArrowUpRight, FileText} from "lucide-react";
import {Badge} from "@/components/ui/badge";
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import CalendarProgressBar from "@/components/CalendarProgressBar";
import {EntryIcon} from "@/components/CalendarIcons";
import {cn} from "@/lib/utils";
import {
    entryKindLabels,
    formatDaysUntil,
    formatLiveProgress,
    formatSkyDayRange,
    getEntryColorClasses,
} from "@/lib/calendar-presentation";
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
            {entry && <CalendarEventDialogBody entry={entry} today={today} openingElement={openingElement} />}
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

    return (
        <DialogContent
            onCloseAutoFocus={(event) => {
                event.preventDefault();
                openingElement?.focus();
            }}
            className={cn(
                "gap-4 border bg-sky-950/95 text-white backdrop-blur-md",
                colorClasses.border,
                isExpected && "border-dashed"
            )}
        >
            <DialogHeader>
                <div className="mb-1 flex flex-wrap items-center gap-2">
                    <Badge className={cn("border-none", colorClasses.badge)}>
                        <EntryIcon kind={entry.kind} className="h-3 w-3" />
                        {entryKindLabels[entry.kind]}
                    </Badge>
                    {isExpected ? (
                        <Badge className="border border-dashed border-white/70 bg-transparent text-white">
                            Expected
                        </Badge>
                    ) : (
                        <Badge className="border border-white/20 bg-white/10 text-white/70">Confirmed</Badge>
                    )}
                </div>
                <DialogTitle className="text-xl">{entry.title}</DialogTitle>
                <DialogDescription className="text-white/70">
                    {formatSkyDayRange(entry.startDay, entry.endDay)}
                </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-3">
                {timing.state === "live" && (
                    <div className="flex flex-col gap-2">
                        <CalendarProgressBar progress={timing.progress} colorClasses={colorClasses} />
                        <p className="text-sm text-white/85">{formatLiveProgress(timing.progress)}</p>
                    </div>
                )}
                {timing.state === "upcoming" && (
                    <p className="text-sm text-white/85">{formatDaysUntil(timing.daysUntil)}</p>
                )}
                {timing.state === "past" && <p className="text-sm text-white/70">This has finished.</p>}
            </div>

            <div className="flex flex-wrap gap-2">
                <DialogLink href={entry.detailUrl}>
                    <ArrowUpRight className="h-4 w-4" />
                    Read more
                </DialogLink>
                <DialogLink href={entry.sourceUrl}>
                    <FileText className="h-4 w-4" />
                    Source
                </DialogLink>
            </div>
        </DialogContent>
    );
}

function DialogLink({href, children}: Readonly<{href: string; children: React.ReactNode}>) {
    return (
        <Link
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-sm text-white transition-colors hover:bg-white/20"
        >
            {children}
        </Link>
    );
}
