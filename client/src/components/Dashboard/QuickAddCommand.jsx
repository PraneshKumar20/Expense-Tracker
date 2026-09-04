import { useState, useEffect, useMemo, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, Command, ArrowRight, CornerDownLeft, X, CheckCircle2, Calendar, Tag, DollarSign, Repeat, ArrowUpRight, ArrowDownRight, Layers } from "lucide-react"

const CATEGORY_KEYWORDS = {
  Food: ['food', 'groceries', 'grocery', 'dinner', 'lunch', 'breakfast', 'brunch', 'snack', 'restaurant', 'cafe', 'coffee', 'starbucks', 'pizza', 'burger', 'sushi', 'drinks', 'bar', 'subway', 'mcdonalds', 'kfc', 'boba'],
  Travel: ['travel', 'uber', 'lyft', 'taxi', 'cab', 'flight', 'airplane', 'airline', 'train', 'metro', 'bus', 'gas', 'fuel', 'petrol', 'parking', 'toll', 'trip', 'hotel', 'airbnb'],
  Bills: ['bill', 'bills', 'electricity', 'power', 'water', 'internet', 'wifi', 'broadband', 'phone', 'mobile', 'utility', 'utilities', 'rent', 'lease', 'insurance', 'tax'],
  Subscriptions: ['subscription', 'subscriptions', 'netflix', 'spotify', 'youtube', 'prime', 'gym', 'fitness', 'icloud', 'apple', 'chatgpt', 'openai', 'adobe', 'patreon', 'github', 'saas'],
  Entertainment: ['entertainment', 'movie', 'cinema', 'theatre', 'theater', 'concert', 'festival', 'game', 'gaming', 'steam', 'playstation', 'xbox', 'ticket', 'tickets', 'party', 'club', 'bowling'],
  Shopping: ['shopping', 'clothes', 'clothing', 'shoes', 'amazon', 'flipkart', 'walmart', 'target', 'headphones', 'gadget', 'electronics', 'laptop', 'iphone', 'ipad', 'watch', 'outfit', 'store'],
  Salary: ['salary', 'paycheck', 'payroll', 'wages', 'client', 'freelance', 'contract', 'stipend', 'bonus', 'dividend', 'interest', 'investment', 'consulting'],
  Other: ['other', 'misc', 'miscellaneous', 'cash', 'transfer']
}

const CATEGORY_COLORS = {
  Food: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  Travel: { bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/30' },
  Bills: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
  Subscriptions: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/30' },
  Entertainment: { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/30' },
  Shopping: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30' },
  Salary: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  Other: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/30' }
}

const SAMPLE_PROMPTS = [
  "Spent $45 on groceries yesterday",
  "Uber ride to airport 28 travel",
  "Freelance client design 850 salary",
  "Netflix monthly 15.99 subscription",
  "Electricity bill 115 bills"
]

export default function QuickAddCommand({ isOpen, onClose, onSave, currencySymbol = "$" }) {
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
    if (!query.trim()) return null

    const lower = query.toLowerCase()

    // 1. Detect Type (Income vs Expense)
    const incomeWords = ['income', 'earned', 'received', 'got', 'salary', 'paycheck', 'client', 'deposit', 'bonus', 'refund', 'cashback', '+']
    const hasIncomeWord = incomeWords.some(w => lower.includes(w))
    const type = hasIncomeWord ? 'income' : 'expense'

    // 2. Detect Recurring
    const recurringWords = ['recurring', 'monthly', 'weekly', 'yearly', 'annual', 'subscription', 'every month']
    const isRecurring = recurringWords.some(w => lower.includes(w))

    // 3. Extract Amount
    // Matches $45, 45.50, ₹1200, 1200 inr, 50usd, etc.
    const amountRegex = /(?:[\$₹€£]|(?:rs\.?|inr|usd)\s*)?(\d+(?:\.\d{1,2})?)(?:\s*(?:rs\.?|inr|usd))?/i
    const match = lower.match(amountRegex)
    let amount = null
    if (match && match[1]) {
      amount = parseFloat(match[1])
    }

    // 4. Detect Category
    let detectedCategory = type === 'income' ? 'Salary' : 'Other'
    let highestScore = 0

    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      for (const kw of keywords) {
        if (lower.includes(kw)) {
          // longer keyword matches get higher score
          if (kw.length > highestScore) {
            highestScore = kw.length
            detectedCategory = category
          }
        }
      }
    }

    // 5. Detect Date
    let date = new Date()
    let dateLabel = "Today"

    if (lower.includes('yesterday')) {
      date = new Date(Date.now() - 86400000)
      dateLabel = "Yesterday"
    } else if (lower.includes('tomorrow')) {
      date = new Date(Date.now() + 86400000)
      dateLabel = "Tomorrow"
    } else if (lower.includes('last week')) {
      date = new Date(Date.now() - 86400000 * 7)
      dateLabel = "7 days ago"
    }

    // 6. Extract Clean Title
    // Remove amount, currency signs, and common syntactic filler words
    let clean = query
      .replace(amountRegex, '')
      .replace(/\b(spent|paid|bought|got|received|on|for|at|yesterday|today|tomorrow|last week|recurring|monthly|weekly|annual|subscription|expense|income)\b/gi, '')
      .replace(/[,\$₹€£]/g, '')
      .trim()

    // Clean multiple spaces
    clean = clean.replace(/\s+/g, ' ')

    // Capitalize first letters of clean title
    if (clean.length > 0) {
      clean = clean.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    } else {
      clean = `${detectedCategory} ${type === 'income' ? 'Income' : 'Expense'}`
    }

    return {
      title: clean,
      amount: amount || 0,
      category: detectedCategory,
      type,
      date: date.toISOString().split('T')[0],
      dateLabel,
      isRecurring,
      isValid: amount !== null && amount > 0
    }
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
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="relative w-full max-w-xl bg-slate-950/90 border border-white/[0.12] rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.8)] backdrop-blur-2xl overflow-hidden z-10"
          >
            {/* Top ambient highlight line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500" />

            {/* Input Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.08]">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-inner">
                <Sparkles className="h-5 w-5 animate-pulse" />
              </div>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type naturally... e.g. 'Spent $45 on groceries yesterday'"
                className="w-full bg-transparent text-base sm:text-lg text-white font-medium placeholder:text-slate-500 outline-none"
              />
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Live Parsing Preview Area */}
            <div className="p-5 space-y-4">
              {parsedResult ? (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.06] space-y-3 shadow-inner"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-ping" />
                      Live Detection Preview
                    </span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${parsedResult.type === 'income' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}`}>
                      {parsedResult.type === 'income' ? 'Income (+)' : 'Expense (-)'}
                    </span>
                  </div>

                  {/* Detected Chips Grid */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Amount Chip */}
                    <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-white/[0.08] text-white font-mono text-sm font-bold shadow-sm">
                      <DollarSign className="h-3.5 w-3.5 text-indigo-400 -mr-1" />
                      <span>{currencySymbol}{parsedResult.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>

                    {/* Category Chip */}
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold ${categoryTheme.bg} ${categoryTheme.border} ${categoryTheme.text} shadow-sm`}>
                      <Tag className="h-3.5 w-3.5 opacity-80" />
                      <span>{parsedResult.category}</span>
                    </div>

                    {/* Date Chip */}
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/60 border border-white/[0.05] text-slate-300 text-xs font-medium">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <span>{parsedResult.dateLabel} ({parsedResult.date})</span>
                    </div>

                    {/* Title Chip */}
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/60 border border-white/[0.05] text-slate-200 text-xs font-medium">
                      <span className="text-slate-400">For:</span>
                      <span className="font-semibold text-white truncate max-w-[150px]">{parsedResult.title}</span>
                    </div>

                    {/* Recurring Badge */}
                    {parsedResult.isRecurring && (
                      <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
                        <Repeat className="h-3 w-3 animate-spin" style={{ animationIterationCount: 1 }} />
                        <span>Recurring</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
                /* Sample Prompts when input is empty */
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Quick Suggestions:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {SAMPLE_PROMPTS.map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => {
                          setQuery(prompt)
                          inputRef.current?.focus()
                        }}
                        className="text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-800 border border-white/[0.06] hover:border-indigo-500/40 transition-all text-left flex items-center gap-1.5 group"
                      >
                        <ArrowRight className="h-3 w-3 text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
                        <span>{prompt}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Just recorded feedback banner */}
              {justRecorded && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold"
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Recorded: {currencySymbol}{justRecorded.amount.toFixed(2)} for {justRecorded.title}</span>
                </motion.div>
              )}
            </div>

            {/* Footer Bar with Keyboard Shortcuts */}
            <div className="px-5 py-3 bg-slate-900/40 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[10px] text-slate-300">↵ Enter</kbd>
                  to record
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[10px] text-slate-300">Esc</kbd>
                  to close
                </span>
              </div>

              {parsedResult?.isValid && (
                <button
                  onClick={handleSubmit}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold shadow-md shadow-indigo-500/30 transition-all"
                >
                  <span>Confirm & Save</span>
                  <CornerDownLeft className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
