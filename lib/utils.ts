import {clsx, type ClassValue} from "clsx"
import {twMerge} from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function getSkyDate() {
    return getSkyDateKey(new Date());
}

export function getSkyDateKey(date: Date) {
    const ptFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Los_Angeles',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });

    const [{value: month}, , {value: day}, , {value: year}] = ptFormatter.formatToParts(date);

    return `${Number(year)}-${Number(month)}-${Number(day)}`
}

export function getSkyDateKeyFromIsoDate(value: string) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return getSkyDateKey(date);
}
