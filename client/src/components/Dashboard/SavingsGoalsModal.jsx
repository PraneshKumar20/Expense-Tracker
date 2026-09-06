import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import confetti from "canvas-confetti"
import { 
  Target, Plus, Trash2, CheckCircle2, 
  Trophy, Calendar, DollarSign, X, TrendingUp,
  ArrowUpRight, AlertCircle, PartyPopper
} from "lucide-react"
import AnimatedCounter from "../ui/AnimatedCounter"

const EMOJI_OPTIONS = ["🛡️", "✈️", "💻", "🚗", "🏠", "🎓", "💎", "🎁", "🌴", "⚡"]
const COLOR_THEMES = [
  { name: "Emerald", bar: "bg-emerald-500", border: "border-emerald-500/20", text: "text-emerald-400", bg: "bg-emerald-500/10" },
  { name: "Indigo", bar: "bg-indigo-600", border: "border-indigo-500/20", text: "text-indigo-400", bg: "bg-indigo-500/10" },
  { name: "Amber", bar: "bg-amber-500", border: "border-amber-500/20", text: "text-amber-400", bg: "bg-amber-500/10" },
  { name: "Sky", bar: "bg-sky-500", border: "border-sky-500/20", text: "text-sky-400", bg: "bg-sky-500/10" },
  { name: "Rose", bar: "bg-rose-500", border: "border-rose-500/20", text: "text-rose-400", bg: "bg-rose-500/10" }
]

export default function SavingsGoalsModal({
  isOpen,
  onClose,
  savingsGoals = [],
  onUpdateGoals,
  currencySymbol = "₹",
  multiplier = 1
}) {
  const [isCreating, setIsCreating] = useState(false)
  const [depositModalGoal, setDepositModalGoal] = useState(null)
  const [depositAmount, setDepositAmount] = useState("")
  
  // New Goal Form State
  const [newTitle, setNewTitle] = useState("")
  const [newTarget, setNewTarget] = useState("")
  const [newCurrent, setNewCurrent] = useState("")
  const [newDate, setNewDate] = useState("")
  const [newEmoji, setNewEmoji] = useState("🎯")
  const [newColor, setNewColor] = useState(0)

  // Overall statistics
  const stats = useMemo(() => {
    const totalTarget = savingsGoals.reduce((sum, g) => sum + (Number(g.targetAmount) || 0), 0)
    const totalSaved = savingsGoals.reduce((sum, g) => sum + (Number(g.currentAmount) || 0), 0)
    const totalRemaining = Math.max(0, totalTarget - totalSaved)
    const overallProgress = totalTarget > 0 ? Math.min(100, Math.round((totalSaved / totalTarget) * 100)) : 0
    const completedCount = savingsGoals.filter(g => (Number(g.currentAmount) || 0) >= (Number(g.targetAmount) || 1)).length

    return { totalTarget, totalSaved, totalRemaining, overallProgress, completedCount }
  }, [savingsGoals])

  // Fire celebratory fireworks confetti
  const triggerCelebration = () => {
    const duration = 2.5 * 1000
    const end = Date.now() + duration

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#0ea5e9']
      })
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#0ea5e9']
      })

      if (Date.now() < end) {
        requestAnimationFrame(frame)
      }
    }
    frame()
  }

  const handleCreateGoal = (e) => {
    e.preventDefault()
    if (!newTitle.trim() || !newTarget) return

    const goal = {
      id: `goal-${Date.now()}`,
      title: newTitle.trim(),
      targetAmount: Number(newTarget) / multiplier,
      currentAmount: (Number(newCurrent) || 0) / multiplier,
      targetDate: newDate || null,
      emoji: newEmoji,
      colorIndex: newColor,
      createdAt: new Date().toISOString()
    }

    const updated = [...savingsGoals, goal]
    onUpdateGoals(updated)

    // Reset
    setNewTitle("")
    setNewTarget("")
    setNewCurrent("")
    setNewDate("")
    setIsCreating(false)

    if (goal.currentAmount >= goal.targetAmount) {
      triggerCelebration()
    }
  }

  const handleDeleteGoal = (id) => {
    const updated = savingsGoals.filter(g => g.id !== id)
    onUpdateGoals(updated)
  }

  const handleQuickDeposit = (amount) => {
    if (!depositModalGoal) return
    const numAmount = Number(amount)
    if (isNaN(numAmount) || numAmount <= 0) return

    const updated = savingsGoals.map(g => {
      if (g.id === depositModalGoal.id) {
        const baseAmount = numAmount / multiplier
        const newTotal = (Number(g.currentAmount) || 0) + baseAmount
        if (newTotal >= g.targetAmount && (Number(g.currentAmount) || 0) < g.targetAmount) {
          triggerCelebration()
        }
        return { ...g, currentAmount: newTotal }
      }
      return g
    })

    onUpdateGoals(updated)
    setDepositAmount("")
    setDepositModalGoal(null)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            transition={{ duration: 0.15 }}
            className="relative w-full max-w-2xl bg-[#0f1523] border border-slate-800 rounded-lg shadow-2xl overflow-hidden z-10 p-6 space-y-5 max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Target className="h-4 w-4" />
                  </div>
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    Savings Goals & Milestones
                  </h2>
                </div>
                <p className="text-xs text-slate-400 font-normal pl-9">
                  Track target funds, allocate savings, and unlock milestone celebrations.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsCreating(!isCreating)}
                  className="px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>{isCreating ? "Cancel" : "New Goal"}</span>
                </button>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-md bg-slate-800/80 hover:bg-slate-700/80 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Summary Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-lg bg-[#0b101b] border border-slate-800 space-y-1">
                <p className="text-[11px] uppercase font-semibold tracking-[0.06em] text-slate-500 flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
                  Total Saved
                </p>
                <div className="text-xl font-semibold text-emerald-400 font-mono-nums">
                  <AnimatedCounter value={stats.totalSaved * multiplier} prefix={currencySymbol} />
                </div>
                <p className="text-xs text-slate-400 font-normal">Across {savingsGoals.length} targets</p>
              </div>

              <div className="p-3.5 rounded-lg bg-[#0b101b] border border-slate-800 space-y-1">
                <p className="text-[11px] uppercase font-semibold tracking-[0.06em] text-slate-500 flex items-center gap-1.5">
                  <Target className="h-3.5 w-3.5 text-indigo-400" />
                  Target Goal
                </p>
                <div className="text-xl font-semibold text-white font-mono-nums">
                  <AnimatedCounter value={stats.totalTarget * multiplier} prefix={currencySymbol} />
                </div>
                <p className="text-xs text-slate-400 font-normal font-mono-nums">
                  {currencySymbol}{Math.round(stats.totalRemaining * multiplier).toLocaleString()} to go
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-[#0b101b] border border-slate-800 space-y-1">
                <p className="text-[11px] uppercase font-semibold tracking-[0.06em] text-slate-500 flex items-center gap-1.5">
                  <Trophy className="h-3.5 w-3.5 text-amber-400" />
                  Milestone Progress
                </p>
                <div className="text-xl font-semibold text-amber-400 font-mono-nums">
                  {stats.overallProgress}%
                </div>
                <p className="text-xs text-slate-400 font-normal">{stats.completedCount} reached 100%</p>
              </div>
            </div>

            {/* New Goal Creator Inline Form */}
            <AnimatePresence>
              {isCreating && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleCreateGoal}
                  className="p-4 rounded-lg bg-[#0b101b] border border-slate-800 space-y-3 overflow-hidden"
                >
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Target className="h-3.5 w-3.5 text-emerald-400" /> Define New Financial Milestone
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-400 font-medium">Goal Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Emergency Fund, Japan Trip"
                        value={newTitle}
                        onChange={e => setNewTitle(e.target.value)}
                        className="w-full mt-1 px-3 py-1.5 rounded-md bg-slate-900 border border-slate-700 text-white text-xs outline-none focus:border-indigo-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-400 font-medium">Target Amount ({currencySymbol})</label>
                      <input
                        type="number"
                        placeholder="5000"
                        value={newTarget}
                        onChange={e => setNewTarget(e.target.value)}
                        className="w-full mt-1 px-3 py-1.5 rounded-md bg-slate-900 border border-slate-700 text-white text-xs outline-none focus:border-indigo-500"
                        required
                        min="1"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-400 font-medium">Initial Amount Saved ({currencySymbol})</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={newCurrent}
                        onChange={e => setNewCurrent(e.target.value)}
                        className="w-full mt-1 px-3 py-1.5 rounded-md bg-slate-900 border border-slate-700 text-white text-xs outline-none focus:border-indigo-500"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-400 font-medium">Target Completion Date (Optional)</label>
                      <input
                        type="date"
                        value={newDate}
                        onChange={e => setNewDate(e.target.value)}
                        className="w-full mt-1 px-3 py-1.5 rounded-md bg-slate-900 border border-slate-700 text-white text-xs outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    {/* Emoji picker */}
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] text-slate-400 mr-1">Icon:</span>
                      {EMOJI_OPTIONS.map(emoji => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setNewEmoji(emoji)}
                          className={`p-1 text-sm rounded transition-all ${newEmoji === emoji ? 'bg-indigo-600/20 border border-indigo-500 text-white' : 'hover:bg-slate-800 opacity-70'}`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>

                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors"
                    >
                      Save Target Goal
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Goals List */}
            <div className="overflow-y-auto space-y-3 pr-1 flex-1">
              {savingsGoals.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 inline-block text-slate-500">
                    <Target className="h-6 w-6 mx-auto stroke-1" />
                  </div>
                  <p className="text-slate-400 text-sm font-medium">No savings goals created yet.</p>
                  <p className="text-slate-500 text-xs">Click "New Goal" above to create your first milestone.</p>
                </div>
              ) : (
                savingsGoals.map(goal => {
                  const target = Number(goal.targetAmount) || 1
                  const current = Number(goal.currentAmount) || 0
                  const progress = Math.min(100, Math.round((current / target) * 100))
                  const isComplete = progress >= 100
                  const theme = COLOR_THEMES[goal.colorIndex || 0] || COLOR_THEMES[0]

                  return (
                    <motion.div
                      key={goal.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={`p-4 rounded-lg bg-[#0b101b] border ${isComplete ? 'border-emerald-500/30 bg-emerald-500/[0.02]' : 'border-slate-800'} hover:border-slate-700 transition-colors space-y-3 group`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl p-2 rounded-md bg-slate-900 border border-slate-800">
                            {goal.emoji || "🎯"}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-semibold text-white tracking-wide">
                                {goal.title}
                              </h4>
                              {isComplete && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                                  <PartyPopper className="h-3 w-3" /> Reached 100%
                                </span>
                              )}
                            </div>
                            {goal.targetDate && (
                              <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                                <Calendar className="h-3 w-3 text-slate-500" />
                                Target Date: {new Date(goal.targetDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setDepositModalGoal(goal)
                              setDepositAmount("100")
                            }}
                            className="px-2.5 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center gap-1 transition-colors"
                            title="Add money to this goal"
                          >
                            <Plus className="h-3 w-3" /> Deposit
                          </button>
                          <button
                            onClick={() => handleDeleteGoal(goal.id)}
                            className="p-1.5 rounded-md text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100"
                            title="Delete goal"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Progress bar with milestones */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-mono-nums">
                          <span className="text-white font-semibold">
                            {currencySymbol}{Math.round(current * multiplier).toLocaleString()}
                          </span>
                          <span className="text-slate-400">
                            {progress}% of {currencySymbol}{Math.round(target * multiplier).toLocaleString()}
                          </span>
                        </div>

                        <div className="relative h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className={`h-full rounded-full ${isComplete ? 'bg-emerald-500' : theme.bar}`}
                          />
                        </div>

                        {/* Milestone indicators */}
                        <div className="flex justify-between text-[10px] text-slate-500 font-mono-nums px-0.5">
                          <span>0%</span>
                          <span>25%</span>
                          <span>50%</span>
                          <span>75%</span>
                          <span className={isComplete ? "text-emerald-400 font-semibold" : ""}>100%</span>
                        </div>
                      </div>
                    </motion.div>
                  )
                })
              )}
            </div>

            {/* Quick Deposit Modal Popup */}
            <AnimatePresence>
              {depositModalGoal && (
                <div className="absolute inset-0 z-20 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-6">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full max-w-sm bg-[#0f1523] border border-slate-800 rounded-lg p-5 space-y-4 shadow-2xl"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{depositModalGoal.emoji}</span>
                        <h4 className="text-sm font-semibold text-white">Deposit to {depositModalGoal.title}</h4>
                      </div>
                      <button onClick={() => setDepositModalGoal(null)} className="text-slate-400 hover:text-white">
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs text-slate-400 font-medium">Enter Amount ({currencySymbol})</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-slate-400 font-mono">{currencySymbol}</span>
                        <input
                          type="number"
                          autoFocus
                          value={depositAmount}
                          onChange={e => setDepositAmount(e.target.value)}
                          placeholder="100"
                          className="w-full pl-8 pr-3 py-1.5 rounded-md bg-slate-900 border border-slate-700 text-white font-mono-nums text-sm outline-none focus:border-indigo-500"
                        />
                      </div>

                      {/* Quick preset chips */}
                      <div className="flex items-center gap-2 pt-1">
                        {[25, 50, 100, 250, 500].map(val => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setDepositAmount(String(val))}
                            className="flex-1 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-[11px] font-mono-nums text-slate-300 border border-slate-700/60 transition-colors"
                          >
                            +{val}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={() => setDepositModalGoal(null)}
                        className="flex-1 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleQuickDeposit(depositAmount)}
                        className="flex-1 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors"
                      >
                        Confirm Deposit
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
