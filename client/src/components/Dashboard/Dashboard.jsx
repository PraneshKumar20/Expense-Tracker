import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { PlusCircle, Wallet, TrendingUp, TrendingDown, Target, Zap, Activity, Database, Sparkles, PieChart as PieIcon, ShieldAlert, Command, Layers, Radio } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Sector } from "recharts"
import TransactionTable from "./TransactionTable"
import TransactionModal from "./TransactionModal"
import QuickAddCommand from "./QuickAddCommand"
import FinancialHealthCard from "./FinancialHealthCard"
import CategoryEnvelopesModal from "./CategoryEnvelopesModal"
import SubscriptionRadarModal from "./SubscriptionRadarModal"
import SavingsGoalsModal from "./SavingsGoalsModal"
import AnimatedCounter from "../ui/AnimatedCounter"
import axios from "../../api/axios"

const COLORS = ['#6366f1', '#8b5cf6', '#10b981', '#f43f5e', '#f59e0b', '#0ea5e9', '#ec4899', '#14b8a6']

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      type: "spring", 
      stiffness: 260, 
      damping: 22 
    } 
  }
}

const DEMO_TRANSACTIONS = [
  { title: "Monthly Salary", amount: 6500, category: "Salary", type: "income", isRecurring: true },
  { title: "Freelance Client", amount: 1200, category: "Salary", type: "income", isRecurring: false },
  { title: "Groceries Weekly", amount: 150.50, category: "Food", type: "expense", isRecurring: true },
  { title: "Uber Ride", amount: 24.00, category: "Travel", type: "expense", isRecurring: false },
  { title: "Electricity Bill", amount: 95.00, category: "Bills", type: "expense", isRecurring: true },
  { title: "Netflix Subscription", amount: 15.99, category: "Subscriptions", type: "expense", isRecurring: true },
  { title: "Dinner Date", amount: 85.00, category: "Food", type: "expense", isRecurring: false },
  { title: "New Headphones", amount: 250.00, category: "Shopping", type: "expense", isRecurring: false },
  { title: "Gym Membership", amount: 45.00, category: "Subscriptions", type: "expense", isRecurring: true },
  { title: "Flight to NY", amount: 450.00, category: "Travel", type: "expense", isRecurring: false },
  { title: "Concert Tickets", amount: 120.00, category: "Entertainment", type: "expense", isRecurring: false },
  { title: "Internet Bill", amount: 60.00, category: "Bills", type: "expense", isRecurring: true }
]

export default function Dashboard() {
  const [expenses, setExpenses] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem("expenses")
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed) && parsed.length > 0) return parsed
        }
      } catch (e) {}
    }
    return DEMO_TRANSACTIONS.map((t, index) => {
      const date = new Date()
      date.setDate(date.getDate() - (index * 2))
      return {
        ...t,
        _id: `initial-${index}`,
        date: date.toISOString()
      }
    })
  })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false)
  const [isEnvelopeModalOpen, setIsEnvelopeModalOpen] = useState(false)
  const [isSubscriptionRadarOpen, setIsSubscriptionRadarOpen] = useState(false)
  const [isSavingsGoalsOpen, setIsSavingsGoalsOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(null)

  // Savings Goals & Milestones State (Persisted)
  const [savingsGoals, setSavingsGoals] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem("savings_goals")
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed) && parsed.length > 0) return parsed
        }
      } catch (e) {}
    }
    return [
      { id: "goal-1", title: "Emergency Reserve", targetAmount: 10000, currentAmount: 6800, emoji: "🛡️", colorIndex: 0, targetDate: "2026-12-31" },
      { id: "goal-2", title: "Tokyo & Kyoto Vacation", targetAmount: 3500, currentAmount: 2450, emoji: "✈️", colorIndex: 1, targetDate: "2026-10-15" },
      { id: "goal-3", title: "M4 Max MacBook Pro", targetAmount: 2200, currentAmount: 1650, emoji: "💻", colorIndex: 3, targetDate: "2026-11-20" }
    ]
  })

  const handleUpdateSavingsGoals = (updated) => {
    setSavingsGoals(updated)
    try {
      localStorage.setItem("savings_goals", JSON.stringify(updated))
    } catch (e) {}
  }
  
  // Category Budget Envelopes State (Persisted)
  const [categoryBudgets, setCategoryBudgets] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem("category_budgets")
        if (saved) return JSON.parse(saved)
      } catch (e) {}
    }
    return {
      Food: 450,
      Travel: 250,
      Bills: 350,
      Subscriptions: 100,
      Entertainment: 150,
      Shopping: 200,
      Other: 150
    }
  })

  const handleUpdateCategoryBudget = (category, limit) => {
    setCategoryBudgets(prev => {
      const next = { ...prev, [category]: limit }
      try {
        localStorage.setItem("category_budgets", JSON.stringify(next))
      } catch (e) {}
      return next
    })
  }

  // Advanced Features State
  const [budgetLimit, setBudgetLimit] = useState(3000)
  const [currency, setCurrency] = useState("USD")
  const [exchangeRate, setExchangeRate] = useState(83.50) // Default fallback

  const currencySymbols = { USD: "$", INR: "₹" }
  const currSym = currencySymbols[currency]

  // Global Keyboard Shortcut: Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setIsQuickAddOpen(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    fetchExpenses()
    fetchExchangeRate()
  }, [])

  const fetchExchangeRate = async () => {
    try {
      const res = await fetch("https://open.er-api.com/v6/latest/USD")
      const data = await res.json()
      if (data && data.rates && data.rates.INR) {
        setExchangeRate(data.rates.INR)
      }
    } catch (err) {
      console.error("Failed to fetch exchange rate, using fallback:", err)
    }
  }

  const fetchExpenses = async () => {
    try {
      const response = await axios.get("/expenses")
      if (Array.isArray(response.data)) {
        setExpenses(response.data)
        updateLocalStorage(response.data)
        return
      }
      throw new Error("API response is not an array")
    } catch (error) {
      console.warn("Using offline / local expenses:", error.message)
      const localData = localStorage.getItem("expenses")
      if (localData) {
        try {
          const parsed = JSON.parse(localData)
          if (Array.isArray(parsed) && parsed.length > 0) {
            setExpenses(parsed)
            return
          }
        } catch (e) {}
      }
      // Auto seed demo transactions if empty
      seedDemoData()
    }
  }

  const updateLocalStorage = (updatedExpenses) => {
    if (Array.isArray(updatedExpenses)) {
      localStorage.setItem("expenses", JSON.stringify(updatedExpenses))
    }
  }

  const multiplier = currency === 'INR' ? exchangeRate : 1

  // Display expenses converted to active currency
  const displayExpenses = useMemo(() => {
    if (!Array.isArray(expenses)) return []
    return expenses.map(e => ({
      ...e,
      amount: (Number(e.amount) || 0) * multiplier
    }))
  }, [expenses, multiplier])

  const handleSaveTransaction = async (transaction) => {
    const baseTransaction = {
      ...transaction,
      amount: transaction.amount / multiplier
    }

    try {
      if (baseTransaction._id) {
        const response = await axios.put(`/expenses/${baseTransaction._id}`, baseTransaction)
        setExpenses((prev) => {
          const next = prev.map((e) => e._id === response.data._id ? response.data : e)
          updateLocalStorage(next)
          return next
        })
      } else {
        const response = await axios.post("/expenses", baseTransaction)
        setExpenses((prev) => {
          const next = [response.data, ...prev]
          updateLocalStorage(next)
          return next
        })
      }
    } catch (error) {
      console.error("Save transaction failed, falling back to local state:", error.message)
      if (baseTransaction._id) {
        setExpenses((prev) => {
          const next = prev.map((e) => e._id === baseTransaction._id ? baseTransaction : e)
          updateLocalStorage(next)
          return next
        })
      } else {
        const fallbackId = `local-${Date.now()}`
        const fallbackTransaction = {
          ...baseTransaction,
          _id: fallbackId,
          date: baseTransaction.date || new Date().toISOString()
        }
        setExpenses((prev) => {
          const next = [fallbackTransaction, ...prev]
          updateLocalStorage(next)
          return next
        })
      }
    }
  }

  const handleDeleteTransaction = async (id) => {
    try {
      await axios.delete(`/expenses/${id}`)
      setExpenses((prev) => {
        const next = prev.filter((e) => e._id !== id)
        updateLocalStorage(next)
        return next
      })
    } catch (error) {
      setExpenses((prev) => {
        const next = prev.filter((e) => e._id !== id)
        updateLocalStorage(next)
        return next
      })
    }
  }

  const seedDemoData = () => {
    const seededData = DEMO_TRANSACTIONS.map((t, index) => {
      const date = new Date()
      date.setDate(date.getDate() - (index * 2))
      return {
        ...t,
        _id: `demo-${Date.now()}-${index}`,
        date: date.toISOString()
      }
    })
    setExpenses(seededData)
    updateLocalStorage(seededData)
  }

  const openEditModal = (transaction) => {
    setEditingTransaction(transaction)
    setIsModalOpen(true)
  }

  const openAddModal = () => {
    setEditingTransaction(null)
    setIsModalOpen(true)
  }

  // --- Financial Analytics Calculations ---
  const { totalIncome, totalExpense, balance, topCategory, avgTransaction, budgetPercent } = useMemo(() => {
    let inc = 0, exp = 0
    const catMap = {}
    
    displayExpenses.forEach(e => {
      if (e.type === 'income') inc += e.amount
      else {
        exp += e.amount
        catMap[e.category] = (catMap[e.category] || 0) + e.amount
      }
    })
    
    let topCat = { name: 'None', amount: 0 }
    for (const [name, amount] of Object.entries(catMap)) {
      if (amount > topCat.amount) topCat = { name, amount }
    }

    const expCount = displayExpenses.filter(e => e.type === 'expense').length
    const avgTx = expCount > 0 ? (exp / expCount) : 0
    const effectiveLimit = budgetLimit * multiplier
    const percent = effectiveLimit > 0 ? Math.min((exp / effectiveLimit) * 100, 100) : 0

    return {
      totalIncome: inc,
      totalExpense: exp,
      balance: inc - exp,
      topCategory: topCat,
      avgTransaction: avgTx,
      budgetPercent: percent
    }
  }, [displayExpenses, budgetLimit, multiplier])

  // Chart Data Preparation
  const categoryData = useMemo(() => {
    const acc = []
    displayExpenses.filter(e => e.type === 'expense').forEach(curr => {
      const existing = acc.find(item => item.name === curr.category)
      if (existing) existing.value += curr.amount
      else acc.push({ name: curr.category, value: curr.amount })
    })
    return acc.sort((a,b) => b.value - a.value).slice(0, 6)
  }, [displayExpenses])

  const trendData = useMemo(() => {
    const acc = {}
    displayExpenses.forEach(curr => {
      const date = new Date(curr.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
      if (!acc[date]) acc[date] = { date, income: 0, expense: 0, timestamp: new Date(curr.date).getTime() }
      acc[date][curr.type || 'expense'] += curr.amount
    })
    return Object.values(acc).sort((a,b) => a.timestamp - b.timestamp).slice(-7)
  }, [displayExpenses])

  const totalCategoryExpense = useMemo(() => {
    return categoryData.reduce((sum, item) => sum + item.value, 0)
  }, [categoryData])

  const renderActiveShape = (props) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props

    return (
      <g className="cursor-pointer">
        {/* Outer ambient glow halo */}
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 14}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          opacity={0.3}
        />
        {/* Outer neon accent arc */}
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={outerRadius + 2}
          outerRadius={outerRadius + 4}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          opacity={0.9}
        />
        {/* Popped-out main slice */}
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius - 4}
          outerRadius={outerRadius + 8}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          style={{
            filter: `drop-shadow(0 0 14px ${fill})`,
            transition: "all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)"
          }}
        />
      </g>
    )
  }

  const savingsRate = totalIncome > 0 ? Number((((totalIncome - totalExpense) / totalIncome) * 100).toFixed(1)) : 0
  const incomeShare = (totalIncome + totalExpense) > 0 ? (totalIncome / (totalIncome + totalExpense)) * 100 : 50
  const recurringCount = useMemo(() => {
    return Array.isArray(displayExpenses) ? displayExpenses.filter(e => e.isRecurring && e.type === 'expense').length : 0
  }, [displayExpenses])

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-8"
    >
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pb-2 border-b border-white/[0.06]">
        <motion.div variants={itemVariants} className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight drop-shadow-sm">
              Financial Command Center
            </h1>
            <motion.div 
              animate={{ rotate: [0, 15, -15, 0] }} 
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="hidden sm:inline-flex p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400"
            >
              <Sparkles className="h-5 w-5" />
            </motion.div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              REAL-TIME LEDGER
            </div>
            <span className="text-slate-400 text-sm font-medium">
              Enterprise-grade financial intelligence & analytics.
            </span>
          </div>
        </motion.div>
        
        <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Animated Currency Pill */}
          <div className="flex bg-slate-900/80 p-1 rounded-xl border border-white/[0.08] backdrop-blur-xl shadow-lg relative">
            {['USD', 'INR'].map(curr => {
              const isActive = currency === curr
              return (
                <button 
                  key={curr} 
                  onClick={() => setCurrency(curr)}
                  className={`relative px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors z-10 ${isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  {isActive && (
                    <motion.div 
                      layoutId="currencyPill"
                      className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-lg shadow-md shadow-indigo-500/30"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{curr}</span>
                </button>
              )
            })}
          </div>

          {/* Quick Add Omnibar Trigger */}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              onClick={() => setIsQuickAddOpen(true)} 
              variant="outline" 
              className="border-indigo-500/30 bg-slate-900/60 hover:bg-indigo-500/15 text-indigo-300 hover:text-indigo-200 hover:border-indigo-500/50 backdrop-blur-xl shadow-lg transition-all duration-300 group flex items-center gap-1.5"
            >
              <Command className="h-4 w-4 text-indigo-400 group-hover:rotate-12 transition-transform" />
              <span>Quick Add</span>
              <kbd className="ml-1 px-1.5 py-0.5 rounded bg-slate-800/90 border border-slate-700/80 font-mono text-[10px] text-slate-300 shadow-sm">
                ⌘K
              </kbd>
            </Button>
          </motion.div>

          {/* Subscription & Bill Radar Trigger */}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              onClick={() => setIsSubscriptionRadarOpen(true)} 
              variant="outline" 
              className="border-purple-500/30 bg-slate-900/60 hover:bg-purple-500/15 text-purple-300 hover:text-purple-200 hover:border-purple-500/50 backdrop-blur-xl shadow-lg transition-all duration-300 group flex items-center gap-1.5"
            >
              <Radio className="h-4 w-4 text-purple-400 group-hover:animate-pulse" />
              <span>Bill Radar</span>
              {recurringCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono text-[10px] font-bold border border-purple-500/40">
                  {recurringCount}
                </span>
              )}
            </Button>
          </motion.div>

          {/* Savings Goals Trigger */}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              onClick={() => setIsSavingsGoalsOpen(true)} 
              variant="outline" 
              className="border-emerald-500/30 bg-slate-900/60 hover:bg-emerald-500/15 text-emerald-300 hover:text-emerald-200 hover:border-emerald-500/50 backdrop-blur-xl shadow-lg transition-all duration-300 group flex items-center gap-1.5"
            >
              <Target className="h-4 w-4 text-emerald-400 group-hover:rotate-45 transition-transform" />
              <span>Goals</span>
              {savingsGoals.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/40">
                  {savingsGoals.length}
                </span>
              )}
            </Button>
          </motion.div>

          {/* Seed Demo Data Button */}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              onClick={seedDemoData} 
              variant="outline" 
              className="border-indigo-500/30 bg-slate-900/60 hover:bg-indigo-500/15 text-indigo-300 hover:text-indigo-200 hover:border-indigo-500/50 backdrop-blur-xl shadow-lg transition-all duration-300 group"
            >
              <Database className="mr-2 h-4 w-4 text-indigo-400 group-hover:rotate-180 transition-transform duration-500" />
              Seed Demo
            </Button>
          </motion.div>

          {/* New Transaction Button with Radiant Shimmer */}
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Button 
              onClick={openAddModal} 
              className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold shadow-[0_0_25px_rgba(99,102,241,0.4)] hover:shadow-[0_0_35px_rgba(99,102,241,0.6)] border border-indigo-400/30 transition-all duration-300 group"
            >
              {/* Shimmer sweep effect */}
              <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg] -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000 ease-out pointer-events-none" />
              <PlusCircle className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
              New Transaction
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Net Balance Card */}
        <motion.div 
          variants={itemVariants} 
          whileHover={{ y: -4, transition: { duration: 0.2 } }} 
          className="lg:col-span-2 group"
        >
          <Card className="bento-card h-full bg-gradient-to-br from-indigo-950/60 via-slate-900/80 to-slate-950/80 border-indigo-500/30 shadow-[0_10px_30px_rgba(0,0,0,0.5)] relative overflow-hidden">
            {/* Top glowing ambient accent */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-500/30 transition-colors" />
            
            <CardHeader className="pb-2 relative z-10">
              <CardTitle className="text-xs font-bold tracking-widest text-indigo-300 uppercase flex items-center justify-between">
                <span>Total Net Balance</span>
                <div className="p-2 rounded-xl bg-indigo-500/15 border border-indigo-500/20 text-indigo-300 shadow-inner">
                  <Wallet className="h-5 w-5" />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 relative z-10">
              <div>
                <div className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight flex items-baseline gap-1">
                  <AnimatedCounter 
                    value={balance} 
                    prefix={currSym} 
                    className="drop-shadow-[0_2px_10px_rgba(255,255,255,0.15)]"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1 font-medium">Updated automatically from active transactions</p>
              </div>

              {/* Income vs Expense Quick Ratio Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-[11px] font-mono font-medium text-slate-400">
                  <span className="text-emerald-400 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Income Ratio: {incomeShare.toFixed(0)}%
                  </span>
                  <span className="text-rose-400 flex items-center gap-1">
                    Expense Ratio: {(100 - incomeShare).toFixed(0)}%
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-800/80 rounded-full overflow-hidden flex shadow-inner">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${incomeShare}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="bg-emerald-500 h-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                  />
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${100 - incomeShare}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="bg-rose-500 h-full shadow-[0_0_10px_rgba(244,63,94,0.5)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/[0.06]">
                <div className="space-y-1">
                  <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-400" /> Monthly Income
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-emerald-400">
                    <AnimatedCounter value={totalIncome} prefix={currSym} />
                  </p>
                </div>
                <div className="space-y-1 pl-4 border-l border-white/[0.06]">
                  <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                    <TrendingDown className="h-3.5 w-3.5 text-rose-400" /> Monthly Expenses
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-rose-400">
                    <AnimatedCounter value={totalExpense} prefix={currSym} />
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Budget Limit Card */}
        <motion.div 
          variants={itemVariants} 
          whileHover={{ y: -4, transition: { duration: 0.2 } }} 
          className="col-span-1 group"
        >
          <Card className="bento-card h-full relative overflow-hidden flex flex-col justify-between">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>Budget Usage</span>
                  <button
                    onClick={() => setIsEnvelopeModalOpen(true)}
                    className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/25 transition-all flex items-center gap-1 cursor-pointer"
                    title="Manage Category Envelopes"
                  >
                    <Layers className="h-3 w-3" />
                    Envelopes
                  </button>
                </div>
                <div className={`p-2 rounded-xl border ${budgetPercent > 90 ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-slate-800/60 border-slate-700/50 text-slate-300'}`}>
                  {budgetPercent > 90 ? <ShieldAlert className="h-5 w-5 animate-pulse" /> : <Target className="h-5 w-5 opacity-70" />}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-baseline">
                <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  <AnimatedCounter value={budgetPercent} decimals={0} suffix="%" />
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  of {currSym}{(budgetLimit * multiplier).toLocaleString()}
                </span>
              </div>

              {/* Progress Bar with animated stripes and glow */}
              <div className="space-y-1.5">
                <div className="h-3 w-full bg-slate-800/90 rounded-full overflow-hidden p-0.5 border border-white/[0.05] shadow-inner">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${budgetPercent}%` }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className={`h-full rounded-full bar-stripes-animated transition-all duration-500 shadow-lg ${
                      budgetPercent > 90 
                        ? 'bg-rose-500 shadow-rose-500/50' 
                        : budgetPercent > 75 
                          ? 'bg-amber-500 shadow-amber-500/50' 
                          : 'bg-emerald-500 shadow-emerald-500/50'
                    }`}
                  />
                </div>
                {budgetPercent > 90 && (
                  <p className="text-[11px] text-rose-400 font-semibold flex items-center gap-1 animate-pulse">
                    ⚠️ Approaching budget threshold!
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Monthly Limit:</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-400 font-mono">{currSym}</span>
                  <input 
                    type="number" 
                    value={budgetLimit} 
                    onChange={(e) => setBudgetLimit(Number(e.target.value) || 0)}
                    className="w-24 bg-slate-800/80 border border-slate-700/80 rounded-lg px-2 py-1 text-xs font-mono text-white text-right outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Financial Health Score & Advisor Card */}
        <motion.div 
          variants={itemVariants} 
          whileHover={{ y: -4, transition: { duration: 0.2 } }} 
          className="col-span-1"
        >
          <FinancialHealthCard 
            totalIncome={totalIncome}
            totalExpense={totalExpense}
            budgetLimit={budgetLimit * multiplier}
            expenses={displayExpenses}
            currencySymbol={currSym}
          />
        </motion.div>

        {/* Activity Trend Chart */}
        <motion.div 
          variants={itemVariants} 
          whileHover={{ y: -3, transition: { duration: 0.2 } }} 
          className="col-span-1 md:col-span-2 lg:col-span-3"
        >
          <Card className="bento-card h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Activity className="h-4 w-4" />
                </div>
                <span>7-Day Cashflow Velocity</span>
              </CardTitle>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  <span className="text-slate-400 font-medium">Income</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
                  <span className="text-slate-400 font-medium">Expense</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="h-[300px] pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#059669" stopOpacity={0.5} />
                    </linearGradient>
                    <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#be123c" stopOpacity={0.5} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => `${currSym}${value}`} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                    contentStyle={{ 
                      backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                      borderColor: 'rgba(99, 102, 241, 0.3)', 
                      borderRadius: '14px', 
                      backdropFilter: 'blur(16px)',
                      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 0 15px rgba(99,102,241,0.2)' 
                    }}
                    itemStyle={{ color: '#f8fafc', fontWeight: '600', fontSize: '12px' }}
                    formatter={(val) => [`${currSym}${Number(val).toFixed(2)}`]}
                  />
                  <Bar 
                    dataKey="income" 
                    fill="url(#incomeGrad)" 
                    radius={[6, 6, 0, 0]} 
                    name="Income" 
                    maxBarSize={36} 
                    animationDuration={1200}
                  />
                  <Bar 
                    dataKey="expense" 
                    fill="url(#expenseGrad)" 
                    radius={[6, 6, 0, 0]} 
                    name="Expense" 
                    maxBarSize={36} 
                    animationDuration={1200}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Category Doughnut Chart with Pop-up Inspection */}
        <motion.div 
          variants={itemVariants} 
          whileHover={{ y: -3, transition: { duration: 0.2 } }} 
          className="col-span-1 md:col-span-2 lg:col-span-1"
        >
          <Card className="bento-card h-full flex flex-col justify-between relative overflow-hidden">
            <CardHeader className="pb-1">
              <CardTitle className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    <PieIcon className="h-4 w-4" />
                  </div>
                  <span>Expense Breakdown</span>
                </div>
                {activeCategoryIndex !== null && (
                  <span className="text-[10px] text-purple-300 font-mono font-medium animate-pulse">
                    ● INSPECTING
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="flex flex-col justify-between flex-1 p-2 pt-0">
              {categoryData.length > 0 ? (
                <>
                  {/* Donut Chart Container with Centered Pop-up HUD */}
                  <div className="relative w-full h-[220px] flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={54}
                          outerRadius={74}
                          paddingAngle={6}
                          dataKey="value"
                          stroke="rgba(15, 23, 42, 0.9)"
                          strokeWidth={2}
                          activeIndex={activeCategoryIndex}
                          activeShape={renderActiveShape}
                          onMouseEnter={(_, index) => setActiveCategoryIndex(index)}
                          onMouseLeave={() => setActiveCategoryIndex(null)}
                          animationDuration={1000}
                        >
                          {categoryData.map((entry, index) => {
                            const isHovered = activeCategoryIndex === index
                            return (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={COLORS[index % COLORS.length]} 
                                className="transition-opacity duration-300 cursor-pointer"
                                opacity={activeCategoryIndex === null || isHovered ? 1 : 0.3}
                              />
                            )
                          })}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>

                    {/* Centered Pop-up Result HUD */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <AnimatePresence mode="wait">
                        {activeCategoryIndex !== null && categoryData[activeCategoryIndex] ? (
                          <motion.div
                            key={`active-${categoryData[activeCategoryIndex].name}`}
                            initial={{ scale: 0.7, opacity: 0, y: 6 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.7, opacity: 0, y: -6 }}
                            transition={{ type: "spring", stiffness: 450, damping: 25 }}
                            className="flex flex-col items-center justify-center text-center px-1 max-w-[120px]"
                          >
                            <span 
                              className="text-[11px] font-bold uppercase tracking-wider mb-0.5 truncate max-w-full drop-shadow-sm"
                              style={{ color: COLORS[activeCategoryIndex % COLORS.length] }}
                            >
                              {categoryData[activeCategoryIndex].name}
                            </span>
                            <span className="text-base sm:text-lg font-extrabold text-white font-mono leading-tight tracking-tight">
                              {currSym}{categoryData[activeCategoryIndex].value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </span>
                            <span 
                              className="text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 border backdrop-blur-md flex items-center gap-1 shadow-sm"
                              style={{ 
                                backgroundColor: `${COLORS[activeCategoryIndex % COLORS.length]}20`, 
                                borderColor: `${COLORS[activeCategoryIndex % COLORS.length]}50`,
                                color: COLORS[activeCategoryIndex % COLORS.length],
                                boxShadow: `0 0 10px ${COLORS[activeCategoryIndex % COLORS.length]}30`
                              }}
                            >
                              <span 
                                className="h-1.5 w-1.5 rounded-full animate-ping"
                                style={{ backgroundColor: COLORS[activeCategoryIndex % COLORS.length] }}
                              />
                              {totalCategoryExpense > 0 ? ((categoryData[activeCategoryIndex].value / totalCategoryExpense) * 100).toFixed(0) : 0}%
                            </span>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="default-center"
                            initial={{ scale: 0.85, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.85, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="flex flex-col items-center justify-center text-center px-2"
                          >
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">
                              TOTAL SPENT
                            </span>
                            <span className="text-base sm:text-lg font-extrabold text-white font-mono leading-tight">
                              {currSym}{totalCategoryExpense.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </span>
                            <span className="text-[10px] text-indigo-300/80 font-medium mt-1 flex items-center gap-1 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
                              Hover slice
                            </span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Synchronized Category Pill Deck */}
                  <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2 pb-1 border-t border-white/[0.05]">
                    {categoryData.map((cat, idx) => {
                      const isSelected = activeCategoryIndex === idx
                      const color = COLORS[idx % COLORS.length]
                      const percent = totalCategoryExpense > 0 ? ((cat.value / totalCategoryExpense) * 100).toFixed(0) : 0

                      return (
                        <button
                          key={cat.name}
                          onMouseEnter={() => setActiveCategoryIndex(idx)}
                          onMouseLeave={() => setActiveCategoryIndex(null)}
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-medium transition-all duration-200 border cursor-pointer ${
                            isSelected 
                              ? 'bg-slate-800 text-white shadow-md scale-105 backdrop-blur-md' 
                              : 'bg-slate-900/50 text-slate-400 border-white/[0.05] hover:text-slate-200 hover:bg-slate-800/40'
                          }`}
                          style={{
                            borderColor: isSelected ? color : undefined,
                            boxShadow: isSelected ? `0 0 12px ${color}35` : undefined
                          }}
                        >
                          <span 
                            className="h-1.5 w-1.5 rounded-full transition-transform" 
                            style={{ 
                              backgroundColor: color,
                              boxShadow: isSelected ? `0 0 6px ${color}` : undefined,
                              transform: isSelected ? 'scale(1.25)' : 'scale(1)'
                            }} 
                          />
                          <span className="font-semibold">{cat.name}</span>
                          <span className="font-mono text-slate-400 opacity-75">{percent}%</span>
                        </button>
                      )
                    })}
                  </div>
                </>
              ) : (
                <div className="text-center text-slate-500 font-medium py-12">
                  No expense records yet.
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Full width Transaction Table */}
        <motion.div variants={itemVariants} className="col-span-1 md:col-span-2 lg:col-span-4">
          <TransactionTable 
            transactions={displayExpenses} 
            onEdit={openEditModal} 
            onDelete={handleDeleteTransaction}
            currencySymbol={currSym}
          />
        </motion.div>
      </div>

      <TransactionModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTransaction}
        editingTransaction={editingTransaction}
      />

      <QuickAddCommand 
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onSave={handleSaveTransaction}
        currencySymbol={currSym}
      />

      <CategoryEnvelopesModal
        isOpen={isEnvelopeModalOpen}
        onClose={() => setIsEnvelopeModalOpen(false)}
        expenses={displayExpenses}
        currencySymbol={currSym}
        multiplier={multiplier}
        categoryBudgets={categoryBudgets}
        onUpdateCategoryBudget={handleUpdateCategoryBudget}
      />

      <SubscriptionRadarModal
        isOpen={isSubscriptionRadarOpen}
        onClose={() => setIsSubscriptionRadarOpen(false)}
        expenses={displayExpenses}
        currencySymbol={currSym}
        multiplier={multiplier}
        onOpenAddModal={openAddModal}
      />

      <SavingsGoalsModal
        isOpen={isSavingsGoalsOpen}
        onClose={() => setIsSavingsGoalsOpen(false)}
        savingsGoals={savingsGoals}
        onUpdateGoals={handleUpdateSavingsGoals}
        currencySymbol={currSym}
        multiplier={multiplier}
      />
    </motion.div>
  )
}
