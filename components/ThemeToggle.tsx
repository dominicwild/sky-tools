"use client"

import {Moon, Sun} from "lucide-react"
import {setDark, useIsDark} from "@/lib/theme"

export function ThemeToggle() {
    const isDark = useIsDark()

    return (
        <button
            type="button"
            onClick={() => setDark(!isDark)}
            aria-label={isDark ? "Switch to day theme" : "Switch to night theme"}
            className="fixed right-4 top-4 z-50 inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-sky-950/60 text-white shadow-lg backdrop-blur-md transition-colors hover:bg-sky-950/80"
        >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
    )
}
