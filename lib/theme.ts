"use client"

import {useSyncExternalStore} from "react"

const THEME_STORAGE_KEY = "theme"

const listeners = new Set<() => void>()
let observer: MutationObserver | null = null

function notify(): void {
    for (const listener of listeners) {
        listener()
    }
}

function applyDark(dark: boolean): void {
    document.documentElement.classList.toggle("dark", dark)
}

function onStorage(event: StorageEvent): void {
    if (event.key !== THEME_STORAGE_KEY || event.newValue === null) {
        return
    }

    applyDark(event.newValue === "dark")
}

function subscribe(onChange: () => void): () => void {
    if (observer === null) {
        observer = new MutationObserver(notify)
        observer.observe(document.documentElement, {attributes: true, attributeFilter: ["class"]})
        window.addEventListener("storage", onStorage)
    }

    listeners.add(onChange)

    return () => {
        listeners.delete(onChange)

        if (listeners.size === 0 && observer !== null) {
            observer.disconnect()
            observer = null
            window.removeEventListener("storage", onStorage)
        }
    }
}

function getSnapshot(): boolean {
    return document.documentElement.classList.contains("dark")
}

function getServerSnapshot(): boolean {
    return false
}

export function useIsDark(): boolean {
    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

export function setDark(dark: boolean): void {
    applyDark(dark)

    try {
        localStorage.setItem(THEME_STORAGE_KEY, dark ? "dark" : "light")
    } catch {
        // A blocked localStorage write must not undo the in-memory theme change.
    }
}
