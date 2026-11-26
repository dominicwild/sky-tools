"use client"

import {motion, useReducedMotion} from "motion/react"

export default function LoadingDots() {
    const shouldReduceMotion = useReducedMotion()
    const movement = shouldReduceMotion ? {} : {y: [-4, 4, -4], scale: [0.8, 1.2, 0.8]}

    return (
        <div className="relative z-10 flex items-center justify-center space-x-1">
            {[0, 1, 2].map((i) => (
                <motion.div
                    key={i}
                    className="w-3 h-3 rounded-full bg-white"
                    animate={{...movement, opacity: [0.5, 1, 0.5]}}
                    transition={{
                        duration: 1,
                        repeat: Number.POSITIVE_INFINITY,
                        delay: i * 0.2,
                        ease: "easeInOut",
                    }}
                />
            ))}
        </div>
    )
}
