"use client"

import { useEffect, useRef } from "react"

interface CloudParticle {
    x: number
    y: number
    radius: number
    speed: number
    opacity: number
    blur: number
}

export function CloudEffect() {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        const resizeCanvas = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
        }

        window.addEventListener("resize", resizeCanvas)
        resizeCanvas()

        const particles: CloudParticle[] = []
        const particleCount = Math.floor(window.innerWidth / 20)

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 60 + 40,
                speed: Math.random() * 0.2 + 0.05,
                opacity: Math.random() * 0.4 + 0.1,
                blur: Math.random() * 15 + 5,
            })
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            particles.forEach((particle) => {
                ctx.save()
                ctx.filter = `blur(${particle.blur}px)`
                ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`
                ctx.beginPath()
                ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
                ctx.fill()
                ctx.restore()

                particle.x += particle.speed

                if (particle.x - particle.radius > canvas.width) {
                    particle.x = -particle.radius
                    particle.y = Math.random() * canvas.height
                }
            })

            requestAnimationFrame(animate)
        }

        animate()

        return () => {
            window.removeEventListener("resize", resizeCanvas)
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 bg-gradient-to-b from-sky-300 to-sky-400"
            style={{ WebkitTapHighlightColor: "transparent" }}
        />
    )
}
