"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {CloudEffect} from "@/components/CloudEffect";
import type {Metadata} from "next";

export const metadata: Metadata = {
    title: "Sky Quest Tracker",
    icons: {
        icon: "/favicon.ico",
    },
};

export default function ErrorPage() {
    const [isRetrying, setIsRetrying] = useState(false)
    const router = useRouter()

    const handleRetry = () => {
        setIsRetrying(true)
        setTimeout(() => {
            router.refresh()
            setIsRetrying(false)
        }, 1000)
    }

    const characterVariants = {
        initial: { scale: 0.8, rotate: -5, opacity: 0 },
        animate: {
            scale: 1,
            rotate: 0,
            opacity: 1,
            transition: {
                duration: 0.6,
                ease: "easeOut",
            },
        },
        hover: {
            scale: 1.05,
            rotate: [-2, 2, -2, 0],
            transition: {
                duration: 0.8,
                ease: "easeInOut",
            },
        },
    }

    const containerVariants = {
        initial: { y: 20, opacity: 0 },
        animate: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.6,
                ease: "easeOut",
                staggerChildren: 0.1,
            },
        },
    }

    const textVariants = {
        initial: { y: 20, opacity: 0 },
        animate: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.6,
                ease: "easeOut",
            },
        },
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-sky-300 to-sky-400 bg-opacity-80 overflow-hidden">
            <div className="fixed inset-0 pointer-events-none">
                <CloudEffect />
            </div>

            <motion.div
                className="relative z-10 max-w-md w-full bg-black/15 backdrop-blur-md rounded-2xl p-8 flex flex-col items-center shadow-xl border border-white/30"
                variants={containerVariants}
                initial="initial"
                animate="animate"
            >
                <motion.div
                    className="relative w-48 h-48 mb-6"
                    variants={characterVariants}
                    initial="initial"
                    animate="animate"
                    whileHover="hover"
                >
                    <Image
                        src="/oh-no-big.png"
                        alt="Confused Sky character"
                        width={200}
                        height={200}
                        className="object-contain"
                    />

                    {Array.from({ length: 5 }).map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute text-3xl text-sky-700 filter drop-shadow-md"
                            style={{
                                top: `-${20 + i * 10}px`,
                                left: `${40 + i * 15}px`,
                                transformOrigin: "center bottom",
                            }}
                            initial={{ opacity: 0, y: 0 }}
                            animate={{
                                opacity: [0.7, 1, 0.7],
                                y: [-5, -15, -5],
                                rotate: [-3, 3, -3],
                            }}
                            transition={{
                                duration: 4 + i * 0.5,
                                ease: "easeInOut",
                                times: [0, 0.5, 1],
                                repeat: Number.POSITIVE_INFINITY,
                                delay: i * 0.4,
                            }}
                        >
                            ?
                        </motion.div>
                    ))}
                </motion.div>

                <motion.h1 className="text-3xl font-bold text-white text-center mb-4 text-shadow" variants={textVariants}>
                    Oh no! You broke it Sky kid.
                    <br />
                    <span className="text-2xl mt-2 font-semibold inline-block">How&apos;d you do that!?</span>
                </motion.h1>

                <motion.p className="text-white/90 text-center mb-8" variants={textVariants}>
                    Don&apos;t worry, we can fix this together. Let&apos;s try again!
                </motion.p>

                <AnimatePresence mode="wait">
                    {isRetrying ? (
                        <motion.div
                            key="loading-button"
                            className="relative"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.3 }}
                        >
                            <motion.div
                                className="w-48 h-14 flex items-center justify-center relative"
                                animate={{ y: [0, -5, 0] }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Number.POSITIVE_INFINITY,
                                    ease: "easeInOut",
                                }}
                            >
                                <svg viewBox="0 0 200 60" className="absolute inset-0 w-full h-full">
                                    <motion.path
                                        d="M 30,10 Q 40,0 60,10 Q 80,0 100,10 Q 120,0 140,10 Q 160,0 180,10 Q 190,20 180,30 Q 190,40 180,50 Q 160,60 140,50 Q 120,60 100,50 Q 80,60 60,50 Q 40,60 30,50 Q 20,40 30,30 Q 20,20 30,10 Z"
                                        fill="url(#cloudGradient)"
                                        initial={{ pathLength: 0 }}
                                        animate={{ pathLength: 1 }}
                                        transition={{ duration: 1, ease: "easeInOut" }}
                                    />
                                    <defs>
                                        <linearGradient id="cloudGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#7dd3fc" />
                                            <stop offset="100%" stopColor="#38bdf8" />
                                        </linearGradient>
                                    </defs>
                                </svg>

                                {/* Loading animation */}
                                <div className="relative z-10 flex items-center justify-center space-x-1">
                                    {[0, 1, 2].map((i) => (
                                        <motion.div
                                            key={i}
                                            className="w-3 h-3 rounded-full bg-white"
                                            animate={{
                                                y: [-4, 4, -4],
                                                opacity: [0.5, 1, 0.5],
                                                scale: [0.8, 1.2, 0.8],
                                            }}
                                            transition={{
                                                duration: 1,
                                                repeat: Number.POSITIVE_INFINITY,
                                                delay: i * 0.2,
                                                ease: "easeInOut",
                                            }}
                                        />
                                    ))}
                                </div>

                                {/* Sparkles around the cloud */}
                                {[0, 1, 2, 3, 4].map((i) => (
                                    <motion.div
                                        key={`sparkle-${i}`}
                                        className="absolute w-2 h-2 rounded-full bg-white"
                                        style={{
                                            left: `${20 + i * 30}%`,
                                            top: i % 2 === 0 ? "-10%" : "90%",
                                        }}
                                        animate={{
                                            opacity: [0, 1, 0],
                                            scale: [0, 1, 0],
                                            y: i % 2 === 0 ? [0, -15, 0] : [0, 15, 0],
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Number.POSITIVE_INFINITY,
                                            delay: i * 0.3,
                                            ease: "easeInOut",
                                        }}
                                    />
                                ))}

                                <motion.span
                                    className="absolute text-white font-medium text-sm bottom-[-24px] left-0 right-0 text-center"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    Fixing the sky...
                                </motion.span>
                            </motion.div>
                        </motion.div>
                    ) : (
                        <motion.button
                            key="try-again-button"
                            onClick={handleRetry}
                            className="relative w-48 h-14 flex items-center justify-center cursor-pointer"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                        >
                            {/* Cloud shape background */}
                            <svg viewBox="0 0 200 60" className="absolute inset-0 w-full h-full">
                                <motion.path
                                    d="M 30,10 Q 40,0 60,10 Q 80,0 100,10 Q 120,0 140,10 Q 160,0 180,10 Q 190,20 180,30 Q 190,40 180,50 Q 160,60 140,50 Q 120,60 100,50 Q 80,60 60,50 Q 40,60 30,50 Q 20,40 30,30 Q 20,20 30,10 Z"
                                    fill="url(#cloudGradient)"
                                    stroke="rgba(255, 255, 255, 0.5)"
                                    strokeWidth="2"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 0.8, ease: "easeInOut" }}
                                />
                                <defs>
                                    <linearGradient id="cloudGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#7dd3fc" />
                                        <stop offset="100%" stopColor="#38bdf8" />
                                    </linearGradient>
                                </defs>
                            </svg>

                            <span className="relative z-10 text-white font-medium">
                                Try Again
                            </span>
                        </motion.button>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    )
}
