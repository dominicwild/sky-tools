import Link from "next/link";
import {ArrowLeft, ChevronLeft, ChevronRight} from "lucide-react";
import {CloudEffect} from "@/components/CloudEffect";
import {Button} from "@/components/ui/button";
import CalendarView from "@/components/CalendarView";
import {createPageMetadata} from "@/lib/seo";
import {addSkyDays, getCurrentSkyDay, getMonthWeeks, getSkyMonth, type SkyMonth} from "@/lib/sky-day";
import {getMonthEntries, getTracks, getWeekSegments} from "@/lib/sky-calendar";
import {formatSkyMonth} from "@/lib/calendar-presentation";
import {calendarCoverage, skyCalendarEntries} from "@/data/skyEvents";

export const metadata = createPageMetadata(
    "Sky Calendar",
    "See what is on in Sky: Children of the Light this month and what is coming next — seasons, events, travelling spirits and returning spirit groups.",
    "/calendar",
);

const monthParamPattern = /^\d{4}-(0[1-9]|1[0-2])$/;

function resolveMonth(raw: string | string[] | undefined, currentMonth: SkyMonth, coverageMonth: SkyMonth): SkyMonth {
    if (typeof raw !== "string" || !monthParamPattern.test(raw) || raw < currentMonth || raw > coverageMonth) {
        return currentMonth;
    }

    return raw;
}

function getPreviousMonth(month: SkyMonth): SkyMonth {
    return getSkyMonth(addSkyDays(`${month}-01`, -1));
}

function getNextMonth(month: SkyMonth): SkyMonth {
    const daysInMonth = getMonthWeeks(month).flat().filter((day) => day.inMonth).length;

    return getSkyMonth(addSkyDays(`${month}-01`, daysInMonth));
}

export default async function CalendarPage({
    searchParams,
}: Readonly<{searchParams: Promise<{[key: string]: string | string[] | undefined}>}>) {
    const today = getCurrentSkyDay();
    const currentMonth = getSkyMonth(today);
    const coverageMonth = getSkyMonth(calendarCoverage.coverageThrough);
    const month = resolveMonth((await searchParams).month, currentMonth, coverageMonth);

    const weeks = getMonthWeeks(month);
    const monthEntries = getMonthEntries(skyCalendarEntries, month, weeks);
    const weekSegments = getWeekSegments(monthEntries, weeks);
    const tracks = getTracks(skyCalendarEntries, today);

    const previousMonth = getPreviousMonth(month);
    const nextMonth = getNextMonth(month);
    const previousDisabled = month <= currentMonth;
    const nextDisabled = nextMonth > coverageMonth;

    return (
        <main className="relative">
            <div className="fixed inset-0 pointer-events-none">
                <CloudEffect />
            </div>

            <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 pb-16 pt-8 text-white">
                <Button
                    asChild
                    variant="ghost"
                    className="mb-4 w-fit cursor-pointer border border-white/15 bg-sky-950/60 text-white backdrop-blur-md hover:bg-sky-950/80 hover:text-white"
                >
                    <Link href="/">
                        <ArrowLeft />
                        Back to tracking quests
                    </Link>
                </Button>

                <header className="mb-6 hidden items-center justify-between gap-4 lg:flex">
                    <MonthNavButton
                        href={previousDisabled ? null : `/calendar?month=${previousMonth}`}
                        label="Previous month"
                    >
                        <ChevronLeft />
                    </MonthNavButton>

                    <div className="text-center">
                        <h1 className="text-2xl font-semibold drop-shadow-sm sm:text-3xl">{formatSkyMonth(month)}</h1>
                    </div>

                    <MonthNavButton href={nextDisabled ? null : `/calendar?month=${nextMonth}`} label="Next month">
                        <ChevronRight />
                    </MonthNavButton>
                </header>

                <CalendarView
                    today={today}
                    weeks={weeks}
                    weekSegments={weekSegments}
                    tracks={tracks}
                    hasEntries={monthEntries.length > 0}
                />
            </div>
        </main>
    );
}

function MonthNavButton({
    href,
    label,
    children,
}: Readonly<{href: string | null; label: string; children: React.ReactNode}>) {
    if (href === null) {
        return (
            <Button
                variant="ghost"
                size="icon"
                disabled
                aria-label={label}
                className="border border-white/15 bg-sky-950/50 text-white"
            >
                {children}
            </Button>
        );
    }

    return (
        <Button
            asChild
            variant="ghost"
            size="icon"
            className="cursor-pointer border border-white/15 bg-sky-950/50 text-white hover:bg-sky-950/70 hover:text-white"
        >
            <Link href={href} aria-label={label}>
                {children}
            </Link>
        </Button>
    );
}
