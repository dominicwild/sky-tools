"use client"

import {useEffect, useRef, useState} from "react"
import {useIsDark} from "@/lib/theme"

interface Sprite {
    canvas: HTMLCanvasElement
    half: number
}

interface CloudParticle {
    x: number
    y: number
    radius: number
    speed: number
    opacity: number
    blur: number
}

interface Cloud {
    particle: CloudParticle
    sprite: Sprite
}

interface Star {
    x: number
    y: number
    sprite: Sprite
    baseAlpha: number
    twinklePhase: number
    twinkleSpeed: number
}

interface ConstellationPoint {
    x: number
    y: number
    joint: boolean
}

interface Constellation {
    points: readonly ConstellationPoint[]
    segments: readonly (readonly [number, number])[]
    scaleMin: number
    scaleMax: number
}

interface ActiveConstellation {
    shape: Constellation
    originX: number
    originY: number
    scale: number
    appearAt: number
}

interface SceneControl {
    startConstellation: () => void
    stopConstellation: () => void
    requestFrame: () => void
}

const STAR_DRIFT = 0.06
const THEME_FADE_MS = 1100

const CONSTELLATION_FIRST_DELAY_MS = 30_000
const CONSTELLATION_NEXT_MIN_MS = 120_000
const CONSTELLATION_NEXT_MAX_MS = 240_000
const CONSTELLATION_FADE_IN_MS = 3_000
const CONSTELLATION_HOLD_MS = 24_000
const CONSTELLATION_FADE_OUT_MS = 4_000
const CONSTELLATION_TOTAL_MS = CONSTELLATION_FADE_IN_MS + CONSTELLATION_HOLD_MS + CONSTELLATION_FADE_OUT_MS
const CONSTELLATION_PEAK_ALPHA = 0.5
const CONSTELLATION_LINE_ALPHA = 0.7
const CONSTELLATION_SCALE_MIN = 150
const CONSTELLATION_SCALE_MAX = 240
const CONSTELLATION_DETAIL_SCALE_MIN = 220
const CONSTELLATION_DETAIL_SCALE_MAX = 300
const CONSTELLATION_CRAB_PROPER_SCALE_MIN = 260
const CONSTELLATION_CRAB_PROPER_SCALE_MAX = 340

const CONSTELLATION_DEMO_FIRST_DELAY_MS = 800
const CONSTELLATION_DEMO_GAP_MS = 4_000

function randRange(min: number, max: number): number {
    return min + Math.random() * (max - min)
}

function easeInOut(t: number): number {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
}

function get2dContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
    const ctx = canvas.getContext("2d")
    if (!ctx) {
        throw new Error("Unable to create a 2d canvas context")
    }

    return ctx
}

function createCloudSprite(particle: CloudParticle, rgb: string): Sprite {
    const padding = Math.ceil(3 * particle.blur) + 2
    const half = Math.ceil(particle.radius) + padding
    const size = 2 * half
    const canvas = document.createElement("canvas")

    canvas.width = size
    canvas.height = size

    const ctx = get2dContext(canvas)

    ctx.filter = `blur(${particle.blur}px)`
    ctx.fillStyle = `rgba(${rgb}, ${particle.opacity})`
    ctx.beginPath()
    ctx.arc(half, half, particle.radius, 0, Math.PI * 2)
    ctx.fill()

    return {canvas, half}
}

function createRoundStarSprite(radius: number): Sprite {
    const glow = radius * 3
    const half = Math.ceil(glow) + 2
    const size = 2 * half
    const canvas = document.createElement("canvas")

    canvas.width = size
    canvas.height = size

    const ctx = get2dContext(canvas)
    const gradient = ctx.createRadialGradient(half, half, 0, half, half, glow)

    gradient.addColorStop(0, "rgba(255, 255, 255, 1)")
    gradient.addColorStop(0.25, "rgba(226, 236, 255, 0.85)")
    gradient.addColorStop(0.6, "rgba(150, 176, 255, 0.22)")
    gradient.addColorStop(1, "rgba(150, 176, 255, 0)")

    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(half, half, glow, 0, Math.PI * 2)
    ctx.fill()

    return {canvas, half}
}

function createSparkleStarSprite(radius: number): Sprite {
    const reach = radius * 4.5
    const inner = reach * 0.26
    const half = Math.ceil(reach) + 2
    const size = 2 * half
    const canvas = document.createElement("canvas")

    canvas.width = size
    canvas.height = size

    const ctx = get2dContext(canvas)
    ctx.translate(half, half)

    const spikes = ctx.createRadialGradient(0, 0, 0, 0, 0, reach)
    spikes.addColorStop(0, "rgba(255, 255, 255, 1)")
    spikes.addColorStop(0.5, "rgba(214, 226, 255, 0.5)")
    spikes.addColorStop(1, "rgba(150, 176, 255, 0)")
    ctx.fillStyle = spikes
    ctx.beginPath()

    for (let i = 0; i < 8; i++) {
        const angle = (Math.PI / 4) * i - Math.PI / 2
        const distance = i % 2 === 0 ? reach : inner
        const x = Math.cos(angle) * distance
        const y = Math.sin(angle) * distance

        if (i === 0) {
            ctx.moveTo(x, y)
        } else {
            ctx.lineTo(x, y)
        }
    }

    ctx.closePath()
    ctx.fill()

    const core = ctx.createRadialGradient(0, 0, 0, 0, 0, radius * 1.3)
    core.addColorStop(0, "rgba(255, 255, 255, 1)")
    core.addColorStop(1, "rgba(255, 255, 255, 0)")
    ctx.fillStyle = core
    ctx.beginPath()
    ctx.arc(0, 0, radius * 1.3, 0, Math.PI * 2)
    ctx.fill()

    return {canvas, half}
}

const crabConstellation: Constellation = {
    points: [
        {x: 0.02, y: 0.30, joint: true},
        {x: 0.16, y: 0.34, joint: false},
        {x: 0.30, y: 0.40, joint: false},
        {x: 0.38, y: 0.50, joint: false},
        {x: 0.50, y: 0.52, joint: true},
        {x: 0.62, y: 0.50, joint: false},
        {x: 0.70, y: 0.40, joint: false},
        {x: 0.84, y: 0.34, joint: false},
        {x: 0.98, y: 0.30, joint: true},
        {x: 0.36, y: 0.63, joint: false},
        {x: 0.28, y: 0.80, joint: true},
        {x: 0.44, y: 0.65, joint: false},
        {x: 0.40, y: 0.83, joint: true},
        {x: 0.64, y: 0.63, joint: false},
        {x: 0.72, y: 0.80, joint: true},
        {x: 0.56, y: 0.65, joint: false},
        {x: 0.60, y: 0.83, joint: true},
    ],
    segments: [
        [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8],
        [3, 9], [9, 10], [4, 11], [11, 12], [5, 13], [13, 14], [4, 15], [15, 16],
    ],
    scaleMin: CONSTELLATION_SCALE_MIN,
    scaleMax: CONSTELLATION_SCALE_MAX,
}

const mantaConstellation: Constellation = {
    points: [
        {x: 0.02, y: 0.42, joint: true},
        {x: 0.24, y: 0.30, joint: false},
        {x: 0.40, y: 0.22, joint: false},
        {x: 0.50, y: 0.20, joint: true},
        {x: 0.60, y: 0.22, joint: false},
        {x: 0.76, y: 0.30, joint: false},
        {x: 0.98, y: 0.42, joint: true},
        {x: 0.50, y: 0.44, joint: true},
        {x: 0.20, y: 0.52, joint: false},
        {x: 0.80, y: 0.52, joint: false},
        {x: 0.50, y: 0.62, joint: false},
        {x: 0.50, y: 0.96, joint: true},
    ],
    segments: [
        [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6],
        [0, 8], [8, 7], [7, 9], [9, 6], [3, 7], [7, 10], [10, 11],
    ],
    scaleMin: CONSTELLATION_SCALE_MIN,
    scaleMax: CONSTELLATION_SCALE_MAX,
}

const crabDetailedConstellation: Constellation = {
    points: [
        {x: 0.22, y: 0.48, joint: true},
        {x: 0.27, y: 0.36, joint: false},
        {x: 0.37, y: 0.31, joint: false},
        {x: 0.46, y: 0.33, joint: false},
        {x: 0.56, y: 0.30, joint: false},
        {x: 0.68, y: 0.34, joint: false},
        {x: 0.78, y: 0.46, joint: true},
        {x: 0.72, y: 0.60, joint: false},
        {x: 0.60, y: 0.65, joint: false},
        {x: 0.48, y: 0.66, joint: false},
        {x: 0.36, y: 0.64, joint: false},
        {x: 0.27, y: 0.58, joint: false},
        {x: 0.43, y: 0.44, joint: true},
        {x: 0.57, y: 0.44, joint: true},
        {x: 0.19, y: 0.26, joint: false},
        {x: 0.12, y: 0.17, joint: true},
        {x: 0.04, y: 0.14, joint: true},
        {x: 0.15, y: 0.09, joint: true},
        {x: 0.81, y: 0.26, joint: false},
        {x: 0.88, y: 0.17, joint: true},
        {x: 0.96, y: 0.14, joint: true},
        {x: 0.85, y: 0.09, joint: true},
        {x: 0.20, y: 0.72, joint: false},
        {x: 0.23, y: 0.83, joint: true},
        {x: 0.32, y: 0.76, joint: false},
        {x: 0.34, y: 0.87, joint: true},
        {x: 0.45, y: 0.82, joint: true},
        {x: 0.53, y: 0.82, joint: true},
        {x: 0.66, y: 0.76, joint: false},
        {x: 0.65, y: 0.87, joint: true},
        {x: 0.80, y: 0.72, joint: false},
        {x: 0.77, y: 0.83, joint: true},
    ],
    segments: [
        [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9], [9, 10], [10, 11], [11, 0],
        [1, 14], [14, 15], [15, 16], [15, 17],
        [5, 18], [18, 19], [19, 20], [19, 21],
        [11, 22], [22, 23], [10, 24], [24, 25], [9, 26], [9, 27],
        [8, 28], [28, 29], [7, 30], [30, 31],
    ],
    scaleMin: CONSTELLATION_DETAIL_SCALE_MIN,
    scaleMax: CONSTELLATION_DETAIL_SCALE_MAX,
}

const mantaDetailedConstellation: Constellation = {
    points: [
        {x: 0.465, y: 0.13, joint: false},
        {x: 0.535, y: 0.13, joint: false},
        {x: 0.45, y: 0.02, joint: true},
        {x: 0.55, y: 0.02, joint: true},
        {x: 0.34, y: 0.16, joint: false},
        {x: 0.18, y: 0.23, joint: false},
        {x: 0.02, y: 0.33, joint: true},
        {x: 0.66, y: 0.16, joint: false},
        {x: 0.82, y: 0.23, joint: false},
        {x: 0.98, y: 0.33, joint: true},
        {x: 0.16, y: 0.40, joint: false},
        {x: 0.28, y: 0.37, joint: false},
        {x: 0.40, y: 0.46, joint: false},
        {x: 0.50, y: 0.50, joint: false},
        {x: 0.84, y: 0.40, joint: false},
        {x: 0.72, y: 0.37, joint: false},
        {x: 0.60, y: 0.46, joint: false},
        {x: 0.50, y: 0.64, joint: false},
        {x: 0.50, y: 0.78, joint: false},
        {x: 0.50, y: 0.88, joint: false},
        {x: 0.46, y: 0.92, joint: false},
        {x: 0.50, y: 0.975, joint: true},
        {x: 0.54, y: 0.92, joint: false},
    ],
    segments: [
        [2, 0], [3, 1], [0, 1],
        [0, 4], [4, 5], [5, 6],
        [1, 7], [7, 8], [8, 9],
        [6, 10], [10, 11], [11, 12], [12, 13],
        [9, 14], [14, 15], [15, 16], [16, 13],
        [0, 13], [1, 13],
        [13, 17], [17, 18], [18, 19],
        [19, 20], [20, 21], [21, 22], [22, 19],
    ],
    scaleMin: CONSTELLATION_DETAIL_SCALE_MIN,
    scaleMax: CONSTELLATION_DETAIL_SCALE_MAX,
}

const crabRockConstellation: Constellation = {
    points: [
        {x: 0.10, y: 0.34, joint: false},
        {x: 0.24, y: 0.26, joint: false},
        {x: 0.33, y: 0.08, joint: true},
        {x: 0.47, y: 0.24, joint: false},
        {x: 0.61, y: 0.08, joint: true},
        {x: 0.70, y: 0.26, joint: false},
        {x: 0.90, y: 0.34, joint: false},
        {x: 0.96, y: 0.48, joint: false},
        {x: 0.82, y: 0.60, joint: false},
        {x: 0.60, y: 0.67, joint: false},
        {x: 0.40, y: 0.67, joint: false},
        {x: 0.18, y: 0.60, joint: false},
        {x: 0.04, y: 0.48, joint: false},
        {x: 0.40, y: 0.46, joint: true},
        {x: 0.60, y: 0.46, joint: true},
        {x: 0.90, y: 0.74, joint: false},
        {x: 0.97, y: 0.85, joint: false},
        {x: 0.68, y: 0.80, joint: false},
        {x: 0.72, y: 0.90, joint: false},
        {x: 0.32, y: 0.80, joint: false},
        {x: 0.28, y: 0.90, joint: false},
        {x: 0.10, y: 0.74, joint: false},
        {x: 0.03, y: 0.85, joint: false},
    ],
    segments: [
        [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9], [9, 10], [10, 11], [11, 12], [12, 0],
        [8, 15], [15, 16],
        [9, 17], [17, 18],
        [10, 19], [19, 20],
        [11, 21], [21, 22],
    ],
    scaleMin: CONSTELLATION_DETAIL_SCALE_MIN,
    scaleMax: CONSTELLATION_DETAIL_SCALE_MAX,
}

const crabProperConstellation: Constellation = {
    points: [
        {x: 0.14, y: 0.50, joint: false},
        {x: 0.10, y: 0.42, joint: false},
        {x: 0.20, y: 0.35, joint: false},
        {x: 0.28, y: 0.38, joint: false},
        {x: 0.34, y: 0.33, joint: false},
        {x: 0.45, y: 0.35, joint: false},
        {x: 0.55, y: 0.32, joint: false},
        {x: 0.68, y: 0.35, joint: false},
        {x: 0.78, y: 0.33, joint: false},
        {x: 0.86, y: 0.39, joint: false},
        {x: 0.91, y: 0.47, joint: false},
        {x: 0.86, y: 0.57, joint: false},
        {x: 0.72, y: 0.63, joint: false},
        {x: 0.57, y: 0.66, joint: false},
        {x: 0.43, y: 0.66, joint: false},
        {x: 0.28, y: 0.62, joint: false},
        {x: 0.18, y: 0.57, joint: false},
        {x: 0.46, y: 0.60, joint: true},
        {x: 0.54, y: 0.60, joint: true},
        {x: 0.48, y: 0.46, joint: false},
        {x: 0.30, y: 0.50, joint: false},
        {x: 0.70, y: 0.51, joint: false},
        {x: 0.04, y: 0.56, joint: false},
        {x: 0.02, y: 0.69, joint: true},
        {x: 0.10, y: 0.70, joint: false},
        {x: 0.12, y: 0.82, joint: true},
        {x: 0.23, y: 0.74, joint: false},
        {x: 0.27, y: 0.84, joint: true},
        {x: 0.99, y: 0.54, joint: false},
        {x: 0.97, y: 0.67, joint: true},
        {x: 0.94, y: 0.70, joint: false},
        {x: 0.91, y: 0.82, joint: true},
        {x: 0.79, y: 0.74, joint: false},
        {x: 0.75, y: 0.84, joint: true},
        {x: 0.24, y: 0.33, joint: false},
        {x: 0.73, y: 0.32, joint: false},
        {x: 0.65, y: 0.65, joint: false},
        {x: 0.23, y: 0.60, joint: false},
    ],
    segments: [
        [0, 1], [1, 2], [2, 34], [34, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 35], [35, 8],
        [8, 9], [9, 10], [10, 11], [11, 12], [12, 36], [36, 13], [13, 14], [14, 15], [15, 37], [37, 16], [16, 0],
        [2, 20], [4, 20], [34, 20], [20, 19], [19, 21], [7, 21], [9, 21], [35, 21], [5, 19], [6, 19],
        [20, 16], [21, 11],
        [0, 22], [22, 23], [16, 24], [24, 25], [15, 26], [26, 27],
        [10, 28], [28, 29], [11, 30], [30, 31], [12, 32], [32, 33],
    ],
    scaleMin: CONSTELLATION_CRAB_PROPER_SCALE_MIN,
    scaleMax: CONSTELLATION_CRAB_PROPER_SCALE_MAX,
}

const constellationShapes: readonly Constellation[] = [
    crabConstellation,
    mantaConstellation,
    crabDetailedConstellation,
    mantaDetailedConstellation,
    crabRockConstellation,
    crabProperConstellation,
]

function constellationAlpha(elapsed: number): number {
    if (elapsed < CONSTELLATION_FADE_IN_MS) {
        return elapsed / CONSTELLATION_FADE_IN_MS
    }

    if (elapsed < CONSTELLATION_FADE_IN_MS + CONSTELLATION_HOLD_MS) {
        return 1
    }

    if (elapsed < CONSTELLATION_TOTAL_MS) {
        return 1 - (elapsed - CONSTELLATION_FADE_IN_MS - CONSTELLATION_HOLD_MS) / CONSTELLATION_FADE_OUT_MS
    }

    return 0
}

function readForcedConstellation(): Constellation | null {
    if (process.env.NODE_ENV === "production") {
        return null
    }

    const requested = new URLSearchParams(window.location.search).get("constellation")
    if (requested === null) {
        return null
    }

    const named: Record<string, Constellation> = {
        crab: crabConstellation,
        manta: mantaConstellation,
        "crab-detailed": crabDetailedConstellation,
        "manta-detailed": mantaDetailedConstellation,
        "crab-rock": crabRockConstellation,
        "crab-proper": crabProperConstellation,
    }

    const match = named[requested]
    if (match !== undefined) {
        return match
    }

    return constellationShapes[Math.floor(Math.random() * constellationShapes.length)] ?? crabConstellation
}

function buildClouds(canvas: HTMLCanvasElement): Cloud[] {
    const count = Math.floor(window.innerWidth / 20)

    return Array.from({length: count}, () => {
        const particle: CloudParticle = {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 60 + 40,
            speed: Math.random() * 0.2 + 0.05,
            opacity: Math.random() * 0.4 + 0.1,
            blur: Math.random() * 15 + 5,
        }

        return {particle, sprite: createCloudSprite(particle, "255, 255, 255")}
    })
}

interface StarSprites {
    round: readonly Sprite[]
    sparkle: readonly Sprite[]
}

function bakeStarSprites(): StarSprites {
    return {
        round: [1, 1.4, 1.9, 2.6].map(createRoundStarSprite),
        sparkle: [1.6, 2.3].map(createSparkleStarSprite),
    }
}

function scatterStars(canvas: HTMLCanvasElement, sprites: StarSprites): Star[] {
    const count = Math.min(Math.floor(window.innerWidth / 12), 180)

    return Array.from({length: count}, () => {
        const sparkle = Math.random() < 0.12
        const roundSprite = sprites.round[Math.floor(Math.random() * Math.random() * sprites.round.length)] ?? sprites.round[0]
        const sparkleSprite = sprites.sparkle[Math.floor(Math.random() * sprites.sparkle.length)] ?? sprites.sparkle[0]

        return {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            sprite: sparkle ? sparkleSprite : roundSprite,
            baseAlpha: sparkle ? randRange(0.7, 1) : randRange(0.35, 0.9),
            twinklePhase: Math.random() * Math.PI * 2,
            twinkleSpeed: randRange(0.0008, 0.0022),
        }
    })
}

function rescatterClouds(list: Cloud[], width: number, ceiling: number): void {
    for (const {particle} of list) {
        particle.x = Math.random() * width
        particle.y = Math.random() * ceiling
    }
}

function buildDepthClouds(canvas: HTMLCanvasElement): Cloud[] {
    const count = Math.min(Math.floor(window.innerWidth / 320), 5)

    return Array.from({length: count}, () => {
        const particle: CloudParticle = {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height * 0.7,
            radius: Math.random() * 80 + 70,
            speed: Math.random() * 0.05 + 0.02,
            opacity: Math.random() * 0.12 + 0.08,
            blur: Math.random() * 12 + 14,
        }

        return {particle, sprite: createCloudSprite(particle, "8, 14, 38")}
    })
}

function readDark(): boolean {
    if (typeof document === "undefined") {
        return false
    }

    return document.documentElement.classList.contains("dark")
}

function readReducedMotion(): boolean {
    if (typeof window === "undefined") {
        return false
    }

    return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

export function CloudEffect() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const isDark = useIsDark()
    const [reducedMotion, setReducedMotion] = useState<boolean>(readReducedMotion)

    const reducedRef = useRef<boolean>(reducedMotion)
    const nightAlphaRef = useRef<number>(isDark ? 1 : 0)
    const fadeRef = useRef<{start: number; from: number; to: number} | null>(null)
    const controlRef = useRef<SceneControl | null>(null)
    const firstThemeRun = useRef<boolean>(true)

    useEffect(() => {
        const query = window.matchMedia("(prefers-reduced-motion: reduce)")
        const onChange = () => setReducedMotion(query.matches)
        query.addEventListener("change", onChange)

        return () => query.removeEventListener("change", onChange)
    }, [])

    useEffect(() => {
        reducedRef.current = reducedMotion
    }, [reducedMotion])

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) {
            return
        }

        const ctx = canvas.getContext("2d")
        if (!ctx) {
            return
        }

        canvas.width = window.innerWidth
        canvas.height = window.innerHeight

        const starSprites = bakeStarSprites()
        const clouds = buildClouds(canvas)
        const depthClouds = buildDepthClouds(canvas)
        let stars = scatterStars(canvas, starSprites)
        const pointSprite = createRoundStarSprite(1.5)
        const jointSprite = createRoundStarSprite(2.3)

        let active: ActiveConstellation | null = null
        let constellationTimer: number | undefined
        const forcedShape = readForcedConstellation()
        const demo = forcedShape !== null

        const spawn = () => {
            const shape = forcedShape ?? constellationShapes[Math.floor(Math.random() * constellationShapes.length)] ?? crabConstellation
            const scale = randRange(shape.scaleMin, shape.scaleMax)
            const extentX = Math.max(...shape.points.map((point) => point.x)) * scale
            const extentY = Math.max(...shape.points.map((point) => point.y)) * scale
            const onLeft = Math.random() < 0.5
            const xBand = onLeft ? randRange(0.04, 0.18) : randRange(0.62, 0.8)
            active = {
                shape,
                originX: Math.min(xBand * canvas.width, canvas.width - extentX),
                originY: Math.min(randRange(0.07, 0.3) * canvas.height, canvas.height - extentY),
                scale,
                appearAt: performance.now(),
            }
        }

        const cycle = () => {
            spawn()
            constellationTimer = window.setTimeout(() => {
                active = null
                const gap = demo ? CONSTELLATION_DEMO_GAP_MS : randRange(CONSTELLATION_NEXT_MIN_MS, CONSTELLATION_NEXT_MAX_MS)
                constellationTimer = window.setTimeout(cycle, gap)
            }, CONSTELLATION_TOTAL_MS)
        }

        const startConstellation = () => {
            if (reducedRef.current || constellationTimer !== undefined || active !== null) {
                return
            }

            constellationTimer = window.setTimeout(cycle, demo ? CONSTELLATION_DEMO_FIRST_DELAY_MS : CONSTELLATION_FIRST_DELAY_MS)
        }

        const stopConstellation = () => {
            if (constellationTimer !== undefined) {
                window.clearTimeout(constellationTimer)
                constellationTimer = undefined
            }

            active = null
        }

        const drawClouds = (list: Cloud[], sceneAlpha: number, advance: boolean, wrapCeiling: number) => {
            for (const {particle, sprite} of list) {
                ctx.globalAlpha = sceneAlpha
                ctx.drawImage(sprite.canvas, particle.x - sprite.half, particle.y - sprite.half)

                if (advance) {
                    particle.x += particle.speed

                    if (particle.x - particle.radius > canvas.width) {
                        particle.x = -particle.radius
                        particle.y = Math.random() * wrapCeiling
                    }
                }
            }

            ctx.globalAlpha = 1
        }

        const drawStars = (sceneAlpha: number, now: number, animate: boolean) => {
            for (const star of stars) {
                const twinkle = animate ? 0.6 + 0.4 * Math.sin(now * star.twinkleSpeed + star.twinklePhase) : 1
                ctx.globalAlpha = star.baseAlpha * twinkle * sceneAlpha
                ctx.drawImage(star.sprite.canvas, star.x - star.sprite.half, star.y - star.sprite.half)

                if (animate) {
                    star.x += STAR_DRIFT

                    if (star.x - star.sprite.half > canvas.width) {
                        star.x = -star.sprite.half
                    }
                }
            }

            ctx.globalAlpha = 1
        }

        const drawConstellation = (now: number, sceneAlpha: number, animate: boolean) => {
            if (active === null) {
                return
            }

            if (animate) {
                active.originX += STAR_DRIFT
            }

            const fade = constellationAlpha(now - active.appearAt) * CONSTELLATION_PEAK_ALPHA * sceneAlpha
            if (fade <= 0) {
                return
            }

            const {shape, originX, originY, scale} = active

            ctx.globalAlpha = fade * CONSTELLATION_LINE_ALPHA
            ctx.strokeStyle = "rgba(198, 212, 255, 1)"
            ctx.lineWidth = 1
            ctx.beginPath()

            for (const [from, to] of shape.segments) {
                const start = shape.points[from]
                const end = shape.points[to]
                if (start === undefined || end === undefined) {
                    continue
                }

                ctx.moveTo(originX + start.x * scale, originY + start.y * scale)
                ctx.lineTo(originX + end.x * scale, originY + end.y * scale)
            }

            ctx.stroke()

            for (const point of shape.points) {
                const sprite = point.joint ? jointSprite : pointSprite
                ctx.globalAlpha = fade * (point.joint ? 0.95 : 0.6)
                ctx.drawImage(sprite.canvas, originX + point.x * scale - sprite.half, originY + point.y * scale - sprite.half)
            }

            ctx.globalAlpha = 1
        }

        const render = (now: number) => {
            const fade = fadeRef.current
            if (fade !== null) {
                const t = Math.min((now - fade.start) / THEME_FADE_MS, 1)
                nightAlphaRef.current = fade.from + (fade.to - fade.from) * easeInOut(t)

                if (t >= 1) {
                    nightAlphaRef.current = fade.to
                    fadeRef.current = null
                }
            }

            const animate = !reducedRef.current
            const night = nightAlphaRef.current
            const day = 1 - night

            ctx.clearRect(0, 0, canvas.width, canvas.height)

            if (day > 0.001) {
                drawClouds(clouds, day, animate, canvas.height)
            }

            if (night > 0.001) {
                drawClouds(depthClouds, night, animate, canvas.height * 0.7)
                drawStars(night, now, animate)
                drawConstellation(now, night, animate)
            }
        }

        let frame: number | undefined

        const loop = (now: number) => {
            render(now)
            frame = requestAnimationFrame(loop)
        }

        const requestFrame = () => {
            if (frame !== undefined) {
                return
            }

            frame = requestAnimationFrame((now) => {
                frame = undefined
                render(now)
            })
        }

        let resizeFrame: number | undefined

        const handleResize = () => {
            if (resizeFrame !== undefined) {
                return
            }

            resizeFrame = requestAnimationFrame(() => {
                resizeFrame = undefined
                canvas.width = window.innerWidth
                canvas.height = window.innerHeight
                stars = scatterStars(canvas, starSprites)
                rescatterClouds(clouds, canvas.width, canvas.height)
                rescatterClouds(depthClouds, canvas.width, canvas.height * 0.7)
                requestFrame()
            })
        }

        window.addEventListener("resize", handleResize)

        controlRef.current = {startConstellation, stopConstellation, requestFrame}

        const startDark = readDark()
        nightAlphaRef.current = startDark ? 1 : 0
        fadeRef.current = null

        if (reducedMotion) {
            render(performance.now())
        } else {
            frame = requestAnimationFrame(loop)

            if (startDark) {
                startConstellation()
            }
        }

        return () => {
            window.removeEventListener("resize", handleResize)
            stopConstellation()

            if (frame !== undefined) {
                cancelAnimationFrame(frame)
            }

            if (resizeFrame !== undefined) {
                cancelAnimationFrame(resizeFrame)
            }

            controlRef.current = null
        }
    }, [reducedMotion])

    useEffect(() => {
        if (firstThemeRun.current) {
            firstThemeRun.current = false

            return
        }

        const control = controlRef.current
        if (control === null) {
            return
        }

        if (reducedRef.current) {
            nightAlphaRef.current = isDark ? 1 : 0
            control.stopConstellation()
            control.requestFrame()

            return
        }

        fadeRef.current = {start: performance.now(), from: nightAlphaRef.current, to: isDark ? 1 : 0}

        if (isDark) {
            control.startConstellation()
        } else {
            control.stopConstellation()
        }
    }, [isDark])

    return (
        <div className="absolute inset-0">
            <div aria-hidden className="sky-gradient-day absolute inset-0" />
            <div aria-hidden className="sky-gradient-night absolute inset-0" />
            <canvas
                ref={canvasRef}
                className="absolute inset-0 block h-full w-full"
                style={{WebkitTapHighlightColor: "transparent"}}
            />
        </div>
    )
}
