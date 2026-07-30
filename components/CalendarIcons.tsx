import {CalendarDays, Footprints, Sparkles, Sun, Users} from "lucide-react";
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
