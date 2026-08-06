import {CalendarClock, CalendarDays, CircleDashed, Footprints, Sparkles, Sun, Users} from "lucide-react";
import {Badge} from "@/components/ui/badge";
import {formatDaysUntil} from "@/lib/calendar-presentation";
import type {SkyCalendarEntryKind} from "@/data/skyEvents";
import type {SkyCalendarTrackKind} from "@/lib/sky-calendar";

export function EntryIcon({kind, className}: Readonly<{kind: SkyCalendarEntryKind; className?: string}>) {
    switch (kind) {
        case "event":
            return <Sparkles className={className} />;
        case "season":
            return <Sun className={className} />;
        case "travelling-spirit":
            return <Footprints className={className} />;
        case "returning-spirits":
            return <Users className={className} />;
    }
}

export function TrackIcon({kind, className}: Readonly<{kind: SkyCalendarTrackKind; className?: string}>) {
    switch (kind) {
        case "travelling-spirit":
            return <Footprints className={className} />;
        case "events":
            return <CalendarDays className={className} />;
        case "season":
            return <Sun className={className} />;
    }
}

export function ExpectedBadge() {
    return (
        <Badge className="gap-1 rounded-full border border-solid border-white/15 bg-white/5 text-xs font-semibold text-white/70">
            <CircleDashed className="h-3 w-3" />
            Expected
        </Badge>
    );
}

export function EndedBadge() {
    return <Badge className="border border-white/15 bg-white/5 font-medium text-white/60">Ended</Badge>;
}

export function NowOnBadge() {
    return <Badge className="border border-white/15 bg-white/5 font-medium text-white/60">Active</Badge>;
}

export function CountdownChip({daysUntil}: Readonly<{daysUntil: number}>) {
    return (
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-sm font-semibold text-white">
            <CalendarClock className="h-4 w-4 text-white/80" />
            {formatDaysUntil(daysUntil)}
        </span>
    );
}
