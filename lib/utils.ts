import {clsx, type ClassValue} from "clsx"
import {twMerge} from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function getSkyDate() {
    const now = new Date();

    const ptFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Los_Angeles',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });

    const [{value: month}, , {value: day}, , {value: year}] = ptFormatter.formatToParts(now);

    const ptDate = new Date(`${year}-${month}-${day}T00:00:00-08:00`);
    return `${ptDate.getFullYear()}-${ptDate.getMonth() + 1}-${ptDate.getDay()}`
}
