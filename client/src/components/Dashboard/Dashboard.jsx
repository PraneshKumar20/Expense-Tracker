import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { Sector } from "recharts"
import axios from "../../api/axios"

// Layout Components
import Sidebar from "../Layout/Sidebar"
import MobileNav from "../Layout/MobileNav"
import AppHeader from "../Layout/AppHeader"

// View Components
import OverviewView from "./OverviewView"
import TransactionsView from "./TransactionsView"
import AnalyticsView from "./AnalyticsView"
import BudgetsView from "./BudgetsView"
import SubscriptionsView from "./SubscriptionsView"

// Modals
import TransactionModal from "./TransactionModal"
import QuickAddCommand from "./QuickAddCommand"
import CategoryEnvelopesModal from "./CategoryEnvelopesModal"
import SubscriptionRadarModal from "./SubscriptionRadarModal"
import SavingsGoalsModal from "./SavingsGoalsModal"
import { useToast } from "../ui/Toast"

const COLORS = ['#6366f1', '#8b5cf6', '#10b981', '#f43f5e', '#f59e0b', '#0ea5e9', '#ec4899', '#14b8a6']

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
  const navigate = useNavigate()
  const { addToast } = useToast()

  // Navigation tab state
  const [activeTab, setActiveTab] = useState("overview")

  // User session state
  const [currentUser, setCurrentUser] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem("user")
        if (saved) return JSON.parse(saved)
      } catch (e) {}
    }
    return { name: "Personal Ledger", email: "guest@ledgerflow.app", isGuest: true }
  })

  const handleLogout = () => {
    localStorage.removeItem("user")
    addToast({ title: "Signed Out", message: "You have been logged out.", type: "info" })
    navigate("/login")
  }

  // Transactions State (API + LocalStorage fallback)
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

  // Modal visibility states
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
      addToast({ title: "Goals Updated", message: "Savings progress saved.", type: "success" })
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
        addToast({ title: "Budget Saved", message: `${category} limit set to ${limit}`, type: "success" })
      } catch (e) {}
      return next
    })
  }

  // Budget limit & Currency state (INR as default)
  const [budgetLimit, setBudgetLimit] = useState(3000)
  const [currency, setCurrency] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem("currency")
        if (saved) return saved
      } catch (e) {}
    }
    return "INR"
  })
  const [exchangeRate, setExchangeRate] = useState(83.50)

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
        addToast({ title: "Updated", message: `Saved changes to "${transaction.title}".`, type: "success" })
      } else {
        const response = await axios.post("/expenses", baseTransaction)
        setExpenses((prev) => {
          const next = [response.data, ...prev]
          updateLocalStorage(next)
          return next
        })
        addToast({ title: "Created", message: `Logged "${transaction.title}" to ledger.`, type: "success" })
      }
    } catch (error) {
      console.error("Save transaction failed, falling back to local state:", error.message)
      if (baseTransaction._id) {
        setExpenses((prev) => {
          const next = prev.map((e) => e._id === baseTransaction._id ? baseTransaction : e)
          updateLocalStorage(next)
          return next
        })
        addToast({ title: "Saved Locally", message: `Updated "${transaction.title}".`, type: "info" })
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
        addToast({ title: "Saved Locally", message: `Recorded "${transaction.title}".`, type: "info" })
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
      addToast({ title: "Deleted", message: "Transaction removed from ledger.", type: "error" })
    } catch (error) {
      setExpenses((prev) => {
        const next = prev.filter((e) => e._id !== id)
        updateLocalStorage(next)
        return next
      })
      addToast({ title: "Deleted Locally", message: "Transaction removed.", type: "error" })
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
    addToast({ title: "Demo Seeded", message: "Standard demo transactions reloaded.", type: "info" })
  }

  const openEditModal = (transaction) => {
    setEditingTransaction(transaction)
    setIsModalOpen(true)
  }

  const openAddModal = () => {
    setEditingTransaction(null)
    setIsModalOpen(true)
  }

  // --- Financial Calculations ---
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
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={outerRadius + 4}
          outerRadius={outerRadius + 10}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          opacity={0.3}
        />
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius - 2}
          outerRadius={outerRadius + 5}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
      </g>
    )
  }

  const savingsRate = totalIncome > 0 ? Number((((totalIncome - totalExpense) / totalIncome) * 100).toFixed(1)) : 0
  const incomeShare = (totalIncome + totalExpense) > 0 ? (totalIncome / (totalIncome + totalExpense)) * 100 : 50
  const recurringCount = useMemo(() => {
    return Array.isArray(displayExpenses) ? displayExpenses.filter(e => e.isRecurring && e.type === 'expense').length : 0
  }, [displayExpenses])

  // Rough health grade estimation for sidebar badge
  const healthGrade = useMemo(() => {
    if (savingsRate >= 25 && budgetPercent <= 80) return "A+"
    if (savingsRate >= 15 && budgetPercent <= 90) return "B+"
    if (savingsRate > 0) return "C"
    return "D"
  }, [savingsRate, budgetPercent])

  return (
    <div className="flex min-h-screen bg-[#070b12] text-slate-100">
      {/* Desktop Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={openAddModal}
        onOpenQuickAdd={() => setIsQuickAddOpen(true)}
        onSeedDemo={seedDemoData}
        transactionCount={displayExpenses.length}
        recurringCount={recurringCount}
        healthGrade={healthGrade}
        goalsCount={savingsGoals.length}
        currency={currency}
        setCurrency={(c) => {
          setCurrency(c)
          try { localStorage.setItem("currency", c) } catch (e) {}
          addToast({ title: "Currency Changed", message: `Active display currency set to ${c}.`, type: "info" })
        }}
        currentUser={currentUser}
        onLogout={handleLogout}
        onSaveTransaction={handleSaveTransaction}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-24 lg:pb-12">
        {/* Mobile Navigation */}
        <MobileNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenAddModal={openAddModal}
          onOpenQuickAdd={() => setIsQuickAddOpen(true)}
          currency={currency}
          setCurrency={(c) => {
            setCurrency(c)
            try { localStorage.setItem("currency", c) } catch (e) {}
            addToast({ title: "Currency Changed", message: `Switched to ${c}.`, type: "info" })
          }}
          currentUser={currentUser}
          onLogout={handleLogout}
        />

        <main className="flex-1 px-4 sm:px-6 lg:px-10 pt-6 lg:pt-8 max-w-7xl w-full mx-auto">
          {/* Desktop App Header */}
          <AppHeader
            activeTab={activeTab}
            onOpenAddModal={openAddModal}
            onOpenQuickAdd={() => setIsQuickAddOpen(true)}
            currentUser={currentUser}
            onLogout={handleLogout}
            currency={currency}
            setCurrency={(c) => {
              setCurrency(c)
              try { localStorage.setItem("currency", c) } catch (e) {}
            }}
            recurringCount={recurringCount}
            goalsCount={savingsGoals.length}
          />

          {/* Dynamic Active Tab View */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "overview" && (
                <OverviewView
                  balance={balance}
                  totalIncome={totalIncome}
                  totalExpense={totalExpense}
                  currSym={currSym}
                  multiplier={multiplier}
                  incomeShare={incomeShare}
                  budgetPercent={budgetPercent}
                  budgetLimit={budgetLimit}
                  setBudgetLimit={setBudgetLimit}
                  trendData={trendData}
                  categoryData={categoryData}
                  totalCategoryExpense={totalCategoryExpense}
                  activeCategoryIndex={activeCategoryIndex}
                  setActiveCategoryIndex={setActiveCategoryIndex}
                  renderActiveShape={renderActiveShape}
                  displayExpenses={displayExpenses}
                  openEditModal={openEditModal}
                  handleDeleteTransaction={handleDeleteTransaction}
                  openAddModal={openAddModal}
                  setIsEnvelopeModalOpen={setIsEnvelopeModalOpen}
                  setActiveTab={setActiveTab}
                />
              )}

              {activeTab === "transactions" && (
                <TransactionsView
                  transactions={displayExpenses}
                  onEdit={openEditModal}
                  onDelete={handleDeleteTransaction}
                  currencySymbol={currSym}
                  onOpenAddModal={openAddModal}
                  totalIncome={totalIncome}
                  totalExpense={totalExpense}
                  balance={balance}
                />
              )}

              {activeTab === "analytics" && (
                <AnalyticsView
                  totalIncome={totalIncome}
                  totalExpense={totalExpense}
                  balance={balance}
                  budgetLimit={budgetLimit}
                  multiplier={multiplier}
                  currencySymbol={currSym}
                  displayExpenses={displayExpenses}
                  savingsRate={savingsRate}
                  avgTransaction={avgTransaction}
                  topCategory={topCategory}
                  trendData={trendData}
                  categoryData={categoryData}
                  totalCategoryExpense={totalCategoryExpense}
                  activeCategoryIndex={activeCategoryIndex}
                  setActiveCategoryIndex={setActiveCategoryIndex}
                  renderActiveShape={renderActiveShape}
                />
              )}

              {activeTab === "budgets" && (
                <BudgetsView
                  budgetLimit={budgetLimit}
                  setBudgetLimit={setBudgetLimit}
                  budgetPercent={budgetPercent}
                  totalExpense={totalExpense}
                  currSym={currSym}
                  multiplier={multiplier}
                  categoryBudgets={categoryBudgets}
                  handleUpdateCategoryBudget={handleUpdateCategoryBudget}
                  setIsEnvelopeModalOpen={setIsEnvelopeModalOpen}
                  savingsGoals={savingsGoals}
                  handleUpdateSavingsGoals={handleUpdateSavingsGoals}
                  setIsSavingsGoalsOpen={setIsSavingsGoalsOpen}
                  displayExpenses={displayExpenses}
                />
              )}

              {activeTab === "subscriptions" && (
                <SubscriptionsView
                  displayExpenses={displayExpenses}
                  currencySymbol={currSym}
                  multiplier={multiplier}
                  openAddModal={openAddModal}
                  setIsSubscriptionRadarOpen={setIsSubscriptionRadarOpen}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Global Modals - Connected to the exact same master handlers */}
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
    </div>
  )
}
