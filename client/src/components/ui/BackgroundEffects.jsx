import { motion } from "framer-motion"

export default function BackgroundEffects() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
      {/* Top ambient horizon glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-20 bg-indigo-500/10 blur-3xl" />

      {/* Cyber geometric grid overlay */}
      <div className="absolute inset-0 cyber-grid opacity-70" />

      {/* Ambient Aurora Orbs */}
      {/* Orb 1: Electric Indigo / Cyan */}
      <div 
        className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-indigo-600/20 via-blue-500/15 to-transparent blur-[120px] animate-float-slow animate-pulse-glow"
      />

      {/* Orb 2: Deep Violet / Magenta */}
      <div 
        className="absolute top-1/4 -right-40 w-[650px] h-[650px] rounded-full bg-gradient-to-bl from-purple-600/20 via-fuchsia-600/15 to-transparent blur-[140px] animate-float-reverse animate-pulse-glow"
      />

      {/* Orb 3: Subtle Emerald / Teal pulse in bottom left */}
      <div 
        className="absolute bottom-10 left-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-emerald-600/10 via-cyan-600/10 to-transparent blur-[130px] animate-float-slow"
      />

      {/* Interactive Micro Star / Sparkle Dots */}
      <div className="absolute top-24 left-[15%] w-1.5 h-1.5 rounded-full bg-indigo-400/40 animate-ping duration-[3000ms]" />
      <div className="absolute top-48 right-[20%] w-1 h-1 rounded-full bg-purple-400/40 animate-pulse duration-[4000ms]" />
      <div className="absolute bottom-36 left-[30%] w-1 h-1 rounded-full bg-cyan-400/40 animate-pulse duration-[5000ms]" />
    </div>
  )
}
