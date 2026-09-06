import { useState, useEffect, useMemo, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, Command, ArrowRight, CornerDownLeft, X, CheckCircle2, Calendar, Tag, DollarSign, Repeat, ArrowUpRight, ArrowDownRight, Layers } from "lucide-react"
import { parseQuickAdd, CATEGORY_COLORS } from "../../utils/quickAddParser"

const SAMPLE_PROMPTS = [
  "Spent $45 on groceries yesterday",
  "Uber ride to airport 28 travel",
  "Freelance client design 850 salary",
  "Netflix monthly 15.99 subscription",
  "Electricity bill 115 bills"
]

export default function QuickAddCommand({ isOpen, onClose, onSave, currencySymbol = "₹" }) {
  const [query, setQuery] = useState("")
  const [justRecorded, setJustRecorded] = useState(null)
  const inputRef = useRef(null)

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
      setJustRecorded(null)
    } else {
      setQuery("")
    }
  }, [isOpen])

  // Natural Language Parser
  const parsedResult = useMemo(() => {
    return parseQuickAdd(query)
  }, [query])

  const handleSubmit = (e) => {
    if (e) e.preventDefault()
    if (!parsedResult || !parsedResult.isValid) return

    onSave({
      title: parsedResult.title,
      amount: parsedResult.amount,
      category: parsedResult.category,
      type: parsedResult.type,
      date: parsedResult.date,
      isRecurring: parsedResult.isRecurring
    })

    setJustRecorded(parsedResult)
    setTimeout(() => {
      onClose()
    }, 600)
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && parsedResult?.isValid) {
      handleSubmit()
    } else if (e.key === "Escape") {
      onClose()
    }
  }

  const categoryTheme = parsedResult ? (CATEGORY_COLORS[parsedResult.category] || CATEGORY_COLORS.Other) : CATEGORY_COLORS.Other

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 px-4 overflow-y-auto">
          {/* Backdrop Blur */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
          />

          {/* Omnibar Dialog Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -10 }}
            transition={{ duration: 0.15 }}
            className="relative w-full max-w-xl bg-[#0f1523] border border-slate-800 rounded-lg shadow-2xl overflow-hidden z-10"
          >
            {/* Input Header */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-800">
              <div className="p-1.5 rounded bg-slate-800 text-indigo-400">
                <Command className="h-4 w-4" />
              </div>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type naturally... e.g. 'Spent $45 on groceries yesterday'"
                className="w-full bg-transparent text-sm sm:text-base text-white font-medium placeholder:text-slate-500 outline-none"
              />
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Live Parsing Preview Area */}
            <div className="p-4 space-y-3">
              {parsedResult ? (
                <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500">
                      Live Parsed Result
                    </span>
                    <span className={`text-[11px] font-semibold font-mono-nums px-2 py-0.5 rounded border ${parsedResult.type === 'income' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                      {parsedResult.type === 'income' ? 'Income (+)' : 'Expense (-)'}
                    </span>
                  </div>

                  {/* Detected Chips Grid */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Amount Chip */}
                    <div className="flex items-center gap-1 px-3 py-1.5 rounded bg-slate-800/80 border border-white/[0.08] text-white font-mono-nums text-sm font-bold shadow-sm">
                      <DollarSign className="h-3.5 w-3.5 text-indigo-400 -mr-1" />
                      <span>{currencySymbol}{parsedResult.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>

                    {/* Category Chip */}
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded border text-xs font-semibold ${categoryTheme.bg} ${categoryTheme.border} ${categoryTheme.text} shadow-sm`}>
                      <Tag className="h-3.5 w-3.5 opacity-80" />
                      <span>{parsedResult.category}</span>
                    </div>

                    {/* Date Chip */}
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800/60 border border-white/[0.05] text-slate-300 text-xs font-medium">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <span>{parsedResult.dateLabel} ({parsedResult.date})</span>
                    </div>

                    {/* Title Chip */}
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800/60 border border-white/[0.05] text-slate-200 text-xs font-medium">
                      <span className="text-slate-400">For:</span>
                      <span className="font-semibold text-white truncate max-w-[150px]">{parsedResult.title}</span>
                    </div>

                    {/* Recurring Badge */}
                    {parsedResult.isRecurring && (
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium">
                        <Repeat className="h-3 w-3" />
                        <span>Recurring</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Sample Prompts when input is empty */
                <div className="space-y-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500">
                    Quick Suggestions
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {SAMPLE_PROMPTS.map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => {
                          setQuery(prompt)
                          inputRef.current?.focus()
                        }}
                        className="text-xs text-slate-300 hover:text-white px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <ArrowRight className="h-3 w-3 text-slate-400" />
                        <span>{prompt}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Just recorded feedback banner */}
              {justRecorded && (
                <div className="flex items-center gap-2 p-2.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span className="font-mono-nums">Recorded: {currencySymbol}{justRecorded.amount.toFixed(2)} for {justRecorded.title}</span>
                </div>
              )}
            </div>

            {/* Footer Bar with Keyboard Shortcuts */}
            <div className="px-4 py-2.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono-nums text-[10px] text-slate-300">↵ Enter</kbd>
                  to save
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono-nums text-[10px] text-slate-300">Esc</kbd>
                  to close
                </span>
              </div>

              {parsedResult?.isValid && (
                <button
                  onClick={handleSubmit}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors cursor-pointer"
                >
                  <span>Confirm Entry</span>
                  <CornerDownLeft className="h-3 w-3" />
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
