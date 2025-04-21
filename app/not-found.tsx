"use client"

import {useState, useEffect} from "react"
import Image from "next/image"
import Link from "next/link"
import {motion, AnimatePresence} from "framer-motion"

export default function NotFoundPage() {
    const [isSearching, setIsSearching] = useState(false)
    const [showStars, setShowStars] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowStars(true)
        }, 1000)

        return () => clearTimeout(timer)
    }, [])

    const handleSearch = () => {
        setIsSearching(true)
        setTimeout(() => {
            window.location.href = "/"
        }, 2000)
    }

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-emerald-800/80 to-emerald-950 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
                {/* Distant trees */}
                {Array.from({length: 8}).map((_, i) => (
                    <motion.div
                        key={`tree-${i}`}
                        className="absolute bottom-0 bg-emerald-900/60 rounded-t-full blur-sm"
                        style={{
                            width: `${Math.random() * 100 + 50}px`,
                            height: `${Math.random() * 200 + 100}px`,
                            left: `${i * 12 + Math.random() * 5}%`,
                            zIndex: 1,
                        }}
                        initial={{y: 100, opacity: 0}}
                        animate={{y: 0, opacity: 0.6}}
                        transition={{
                            duration: 1.2,
                            delay: 0.1 * i,
                            ease: "easeOut",
                        }}
                    />
                ))}

                {showStars &&
                    Array.from({length: 30}).map((_, i) => (
                        <motion.div
                            key={`star-${i}`}
                            className="absolute rounded-full bg-yellow-100"
                            style={{
                                width: `${Math.random() * 3 + 1}px`,
                                height: `${Math.random() * 3 + 1}px`,
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 40}%`,
                            }}
                            initial={{opacity: 0}}
                            animate={{
                                opacity: [0, 0.8, 0.4, 0.8, 0],
                                scale: [0.8, 1.2, 0.8],
                            }}
                            transition={{
                                duration: 3 + Math.random() * 3,
                                delay: Math.random() * 2,
                                repeat: Number.POSITIVE_INFINITY,
                                ease: "easeInOut",
                            }}
                        />
                    ))}
            </div>

            <motion.div
                className="relative z-10 max-w-md w-full bg-emerald-950/30 backdrop-blur-md rounded-2xl p-8 flex flex-col items-center shadow-xl border border-emerald-700/30"
                initial={{y: 20, opacity: 0}}
                animate={{y: 0, opacity: 1}}
                transition={{
                    duration: 0.6,
                    ease: "easeOut",
                }}
            >
                {/* Light beam effect */}
                <motion.div
                    className="absolute top-[-100px] left-1/2 transform -translate-x-1/2 w-64 h-64 bg-gradient-to-b from-orange-300/0 via-orange-300/30 to-orange-400/50 blur-md"
                    style={{clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)"}}
                    animate={{
                        opacity: [0.5, 0.7, 0.5],
                        scale: [0.95, 1.05, 0.95],
                    }}
                    transition={{
                        duration: 4,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                    }}
                />

                <motion.div
                    className="relative w-48 h-48 mb-6"
                    initial={{scale: 0.8, opacity: 0}}
                    animate={{scale: 1, opacity: 1}}
                    transition={{
                        duration: 0.8,
                        ease: "easeOut",
                    }}
                >
                    <Image
                        src="/danger.png"
                        alt="Sky character looking at light"
                        width={200}
                        height={200}
                        className="object-contain"
                    />

                    {/* Floating light particles around the character */}
                    {Array.from({length: 8}).map((_, i) => (
                        <motion.div
                            key={`particle-${i}`}
                            className="absolute rounded-full bg-red-600"
                            style={{
                                width: `${Math.random() * 4 + 2}px`,
                                height: `${Math.random() * 4 + 2}px`,
                                top: `${30 + Math.random() * 40}%`,
                                left: `${30 + Math.random() * 40}%`,
                                filter: "blur(1px)",
                            }}
                            animate={{
                                y: [0, -10, 0],
                                x: [0, Math.random() * 10 - 5, 0],
                                opacity: [0.7, 0.8, 0.7],
                            }}
                            transition={{
                                duration: 3 + Math.random() * 2,
                                repeat: Number.POSITIVE_INFINITY,
                                ease: "easeInOut",
                                delay: Math.random() * 2,
                            }}
                        />
                    ))}
                </motion.div>

                <motion.h1
                    className="text-3xl font-bold text-white text-center mb-2 text-shadow"
                    initial={{y: 20, opacity: 0}}
                    animate={{y: 0, opacity: 1}}
                    transition={{
                        duration: 0.6,
                        delay: 0.2,
                        ease: "easeOut",
                    }}
                >
                    Path Not Found
                </motion.h1>

                <motion.h2
                    className="text-xl text-orange-200 text-center mb-4"
                    initial={{y: 20, opacity: 0}}
                    animate={{y: 0, opacity: 1}}
                    transition={{
                        duration: 0.6,
                        delay: 0.3,
                        ease: "easeOut",
                    }}
                >
                    This realm doesn&apos;t exist, Sky child
                </motion.h2>

                <motion.p
                    className="text-white/80 text-center mb-8"
                    initial={{y: 20, opacity: 0}}
                    animate={{y: 0, opacity: 1}}
                    transition={{
                        duration: 0.6,
                        delay: 0.4,
                        ease: "easeOut",
                    }}
                >
                    The light you seek is elsewhere. Let&apos;s find our way back home.
                </motion.p>

                {/* Portal button */}
                <AnimatePresence mode="wait">
                    {isSearching ? (
                        <motion.div
                            key="searching-portal"
                            className="relative"
                            initial={{opacity: 0, scale: 0.9}}
                            animate={{opacity: 1, scale: 1}}
                            exit={{opacity: 0, scale: 0.9}}
                            transition={{duration: 0.3}}
                        >
                            <motion.div
                                className="w-48 h-14 flex items-center justify-center relative"
                                animate={{
                                    rotate: [0, 360],
                                }}
                                transition={{
                                    duration: 8,
                                    repeat: Number.POSITIVE_INFINITY,
                                    ease: "linear",
                                }}
                            >
                                {/* Portal shape */}
                                <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
                                    <motion.circle
                                        cx="50"
                                        cy="50"
                                        r="30"
                                        fill="url(#portalGradient)"
                                        stroke="rgba(255, 255, 255, 0.5)"
                                        strokeWidth="2"
                                        strokeDasharray="10 5"
                                        initial={{r: 20}}
                                        animate={{
                                            r: [30, 35, 30],
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Number.POSITIVE_INFINITY,
                                            ease: "easeInOut",
                                        }}
                                    />
                                    <defs>
                                        <radialGradient id="portalGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                                            <stop offset="0%" stopColor="#fbbf24"/>
                                            <stop offset="70%" stopColor="#f97316"/>
                                            <stop offset="100%" stopColor="#ea580c"/>
                                        </radialGradient>
                                    </defs>
                                </svg>

                                {/* Searching text */}
                                <motion.span
                                    className="relative z-10 text-white font-medium text-sm"
                                    animate={{
                                        opacity: [1, 0.5, 1],
                                    }}
                                    transition={{
                                        duration: 1.5,
                                        repeat: Number.POSITIVE_INFINITY,
                                        ease: "easeInOut",
                                    }}
                                >
                                    Searching...
                                </motion.span>

                                {/* Orbiting particles */}
                                {Array.from({length: 6}).map((_, i) => {
                                    const angle = (i / 6) * Math.PI * 2
                                    const radius = 30
                                    return (
                                        <motion.div
                                            key={`orbit-${i}`}
                                            className="absolute w-2 h-2 rounded-full bg-white"
                                            style={{
                                                left: "50%",
                                                top: "50%",
                                            }}
                                            animate={{
                                                x: [Math.cos(angle) * radius, Math.cos(angle + Math.PI * 2) * radius],
                                                y: [Math.sin(angle) * radius, Math.sin(angle + Math.PI * 2) * radius],
                                                opacity: [0.5, 1, 0.5],
                                                scale: [0.8, 1.2, 0.8],
                                            }}
                                            transition={{
                                                duration: 4,
                                                repeat: Number.POSITIVE_INFINITY,
                                                ease: "linear",
                                                delay: i * 0.2,
                                            }}
                                        />
                                    )
                                })}
                            </motion.div>
                        </motion.div>
                    ) : (
                        <motion.button
                            key="home-portal"
                            onClick={handleSearch}
                            className="relative w-48 h-14 flex items-center justify-center cursor-pointer"
                            initial={{opacity: 0, scale: 0.9}}
                            animate={{opacity: 1, scale: 1}}
                            exit={{opacity: 0, scale: 0.9}}
                            whileHover={{scale: 1.05}}
                            whileTap={{scale: 0.95}}
                            transition={{duration: 0.2}}
                        >
                            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
                                <motion.circle
                                    cx="50"
                                    cy="50"
                                    r="30"
                                    fill="url(#portalGradient)"
                                    stroke="rgba(255, 255, 255, 0.5)"
                                    strokeWidth="2"
                                    initial={{r: 20}}
                                    animate={{r: 30}}
                                    transition={{duration: 0.8, ease: "easeOut"}}
                                />
                                <defs>
                                    <radialGradient id="portalGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                                        <stop offset="0%" stopColor="#fbbf24"/>
                                        <stop offset="70%" stopColor="#f97316"/>
                                        <stop offset="100%" stopColor="#ea580c"/>
                                    </radialGradient>
                                </defs>
                            </svg>

                            {/* Button text */}
                            <span className="relative z-10 text-white font-medium">Go Home</span>
                        </motion.button>
                    )}
                </AnimatePresence>

                <motion.div
                    className="mt-8 text-white/60 text-sm"
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    transition={{delay: 1, duration: 1}}
                >
                    <Link href="/" className="hover:text-white transition-colors">
                        Return to the light
                    </Link>
                </motion.div>
            </motion.div>
        </div>
    )
}
