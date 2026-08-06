import {getSkyDate} from "./utils";

export type SkyDay = string;

export type SkyMonth = string;

const millisecondsPerDay = 24 * 60 * 60 * 1000;

function getUtcDate(day: SkyDay) {
    const [year, month, date] = day.split("-");

    return new Date(Date.UTC(Number(year), Number(month) - 1, Number(date)));
}

function formatSkyDay(date: Date): SkyDay {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

export function getCurrentSkyDay(): SkyDay {
    const [year, month, day] = getSkyDate().split("-");

    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

export function addSkyDays(day: SkyDay, count: number): SkyDay {
    const date = getUtcDate(day);
    date.setUTCDate(date.getUTCDate() + count);

    return formatSkyDay(date);
}

export function differenceInSkyDays(from: SkyDay, to: SkyDay): number {
    return (getUtcDate(to).getTime() - getUtcDate(from).getTime()) / millisecondsPerDay;
}

export function compareSkyDays(left: SkyDay, right: SkyDay): number {
    if (left < right) {
        return -1;
    }

    if (left > right) {
        return 1;
    }

    return 0;
}

export function getSkyMonth(day: SkyDay): SkyMonth {
    return day.slice(0, 7);
}

export function getMonthWeeks(month: SkyMonth): {day: SkyDay; inMonth: boolean}[][] {
    const firstDay = `${month}-01`;
    const firstDate = getUtcDate(firstDay);
    const daysBeforeMonth = (firstDate.getUTCDay() + 6) % 7;
    const monthEnd = new Date(Date.UTC(firstDate.getUTCFullYear(), firstDate.getUTCMonth() + 1, 0));
    const daysInMonth = monthEnd.getUTCDate();
    const weekCount = Math.ceil((daysBeforeMonth + daysInMonth) / 7);
    const calendarStart = addSkyDays(firstDay, -daysBeforeMonth);

    return Array.from({length: weekCount}, (_, weekIndex) =>
        Array.from({length: 7}, (_, dayIndex) => {
            const day = addSkyDays(calendarStart, weekIndex * 7 + dayIndex);

            return {day, inMonth: getSkyMonth(day) === month};
        })
    );
}
