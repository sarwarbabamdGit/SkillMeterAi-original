import { motion, useAnimation } from "framer-motion";
import { useEffect, useState } from "react";

const Sparkle = ({ delay }) => (
    <motion.div
        initial={{ opacity: 1, scale: 0.5, y: 0 }}
        animate={{ opacity: 0, scale: 0, y: 100 }}
        transition={{ duration: 0.8, delay, ease: "easeOut" }}
        className="absolute w-2 h-2 bg-yellow-300 rounded-full blur-[1px] shadow-[0_0_8px_2px_rgba(253,224,71,0.6)]"
    />
);

export function RocketLaunch() {
    const [sparkles, setSparkles] = useState([]);

    useEffect(() => {
        // Generate random sparkles
        const interval = setInterval(() => {
            setSparkles(prev => [
                ...prev.slice(-20), // Keep array distinct and manageable
                { id: Date.now(), x: Math.random() * 40 - 20 }
            ]);
        }, 100);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
            <motion.div
                initial={{ y: "120vh", x: "10vw", rotate: -5 }}
                animate={{ y: "-150vh", x: "20vw" }}
                transition={{
                    duration: 15,
                    ease: "easeInOut",
                    repeat: Infinity,
                    repeatDelay: 2
                }}
                className="absolute bottom-0 left-10 md:left-1/4 w-24 md:w-32"
            >
                <img src="/Rocketboy.png" alt="Rocket" className="w-full h-auto drop-shadow-2xl" />

                {/* Engine Glow - Theme Color */}
                <div className="absolute top-[80%] left-1/2 -translate-x-1/2 w-8 h-20 bg-gradient-to-t from-transparent to-black/20 dark:to-white/20 rounded-full blur-md" />

                {/* Dynamic Sparkles Trail - Theme Colors */}
                <div className="absolute top-[90%] left-1/2 -translate-x-1/2">
                    {sparkles.map((s) => (
                        <motion.div
                            key={s.id}
                            initial={{ opacity: 1, scale: Math.random() * 0.5 + 0.5, y: 0, x: 0 }}
                            animate={{ opacity: 0, scale: 0, y: 150 + Math.random() * 100, x: s.x }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="absolute w-1.5 h-1.5 bg-black/60 dark:bg-white/60 rounded-full"
                        />
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
