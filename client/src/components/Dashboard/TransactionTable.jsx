import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Edit2, Trash2, Search, ArrowUpDown, Download, Filter, X, Repeat, Layers } from "lucide-react"

const CATEGORY_STYLES = {
  Food: {
    bg: "bg-amber-500/10",
    text: "text-amber-300",
    border: "border-amber-500/20",
    dot: "bg-amber-400"
  },
  Salary: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-300",
    border: "border-emerald-500/20",
    dot: "bg-emerald-400"
  },
  Travel: {
    bg: "bg-sky-500/10",
    text: "text-sky-300",
    border: "border-sky-500/20",
    dot: "bg-sky-400"
  },
  Bills: {
    bg: "bg-purple-500/10",
    text: "text-purple-300",
    border: "border-purple-500/20",
    dot: "bg-purple-400"
  },
  Subscriptions: {
    bg: "bg-indigo-500/10",
    text: "text-indigo-300",
    border: "border-indigo-500/20",
    dot: "bg-indigo-400"
  },
  Entertainment: {
    bg: "bg-pink-500/10",
    text: "text-pink-300",
    border: "border-pink-500/20",
    dot: "bg-pink-400"
  },
  Shopping: {
    bg: "bg-rose-500/10",
    text: "text-rose-300",
    border: "border-rose-500/20",
    dot: "bg-rose-400"
  },
  Other: {
    bg: "bg-slate-500/10",
    text: "text-slate-300",
    border: "border-slate-500/20",
    dot: "bg-slate-400"
  }
}

export default function TransactionTable({ transactions, onEdit, onDelete, currencySymbol }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortOrder, setSortOrder] = useState("desc")
  const [filterType, setFilterType] = useState("all")
  const [filterCategory, setFilterCategory] = useState("all")

  // Extract unique categories for the filter
  const categories = useMemo(() => {
    const list = Array.isArray(transactions) ? transactions : []
    const cats = new Set(list.map(t => t.category))
    return Array.from(cats)
  }, [transactions])

  const filteredTransactions = useMemo(() => {
    const list = Array.isArray(transactions) ? transactions : []
    return list.filter(t => {
      const title = (t.title || "").toLowerCase()
      const cat = (t.category || "").toLowerCase()
      const search = searchTerm.toLowerCase()
      const matchesSearch = title.includes(search) || cat.includes(search)
      const matchesType = filterType === "all" ? true : t.type === filterType
      const matchesCategory = filterCategory === "all" ? true : t.category === filterCategory
      return matchesSearch && matchesType && matchesCategory
    }).sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB
    })
  }, [transactions, searchTerm, filterType, filterCategory, sortOrder])

  const exportCSV = () => {
    const headers = ["Title", "Category", "Date", "Type", "Amount"]
    const rows = filteredTransactions.map(t => [
      `"${t.title}"`,
      `"${t.category}"`,
      new Date(t.date).toLocaleDateString(),
      t.type,
      t.amount
    ])
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "expense_ledger.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-4">
      {/* Control Bar: Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-1 items-center gap-2 w-full max-w-sm relative group">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 group-focus-within:text-indigo-400 transition-colors" />
          <Input
            placeholder="Search records or categories..."
            className="pl-9 pr-8 bg-slate-900/60 border-white/[0.08] focus-visible:border-indigo-500/60 focus-visible:ring-2 focus-visible:ring-indigo-500/20 text-slate-200 placeholder:text-slate-500 backdrop-blur-xl transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm("")}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
          <div className="flex items-center gap-2 bg-slate-900/70 p-1 rounded-xl border border-white/[0.08] backdrop-blur-xl shadow-lg">
            <Filter className="h-4 w-4 ml-2 text-slate-400 hidden sm:block" />
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[110px] border-0 bg-transparent h-8 text-xs font-semibold text-slate-300 shadow-none focus:ring-0">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900/95 border-slate-700/80 backdrop-blur-xl text-slate-200 text-xs">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
            <div className="w-px h-4 bg-slate-700/80 mx-1"></div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[130px] border-0 bg-transparent h-8 text-xs font-semibold text-slate-300 shadow-none focus:ring-0">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900/95 border-slate-700/80 backdrop-blur-xl text-slate-200 text-xs">
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={exportCSV} 
              className="h-10 border-white/[0.08] bg-slate-900/70 hover:bg-slate-800 text-slate-300 hover:text-white backdrop-blur-xl shadow-md transition-all duration-300"
            >
              <Download className="mr-2 h-4 w-4 text-indigo-400" /> Export CSV
            </Button>
          </motion.div>
        </div>
      </div>
      
      {/* Table Container */}
      <div className="rounded-2xl border border-white/[0.08] bg-slate-900/50 backdrop-blur-2xl shadow-[0_10px_35px_rgba(0,0,0,0.5)] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-white/[0.06] bg-slate-950/40">
              <TableHead className="font-bold text-xs uppercase tracking-wider text-slate-400 py-4 pl-6">Title</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider text-slate-400 py-4">Category</TableHead>
              <TableHead className="py-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")} 
                  className="-ml-3 h-8 hover:bg-slate-800/60 text-slate-400 hover:text-white font-bold text-xs uppercase tracking-wider transition-colors"
                >
                  <span>Date</span>
                  <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
                </Button>
              </TableHead>
              <TableHead className="text-right font-bold text-xs uppercase tracking-wider text-slate-400 py-4">Amount</TableHead>
              <TableHead className="text-right font-bold text-xs uppercase tracking-wider text-slate-400 py-4 pr-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence mode="popLayout">
              {filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-40 text-center text-muted-foreground">
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center justify-center space-y-2"
                    >
                      <div className="p-3 rounded-full bg-slate-800/50 border border-slate-700/50 text-slate-500 mb-1">
                        <Search className="h-6 w-6" />
                      </div>
                      <p className="font-semibold text-slate-300">No transactions found</p>
                      <p className="text-xs text-slate-500">Adjust your search query or reset filter options.</p>
                    </motion.div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((transaction, idx) => {
                  const catStyle = CATEGORY_STYLES[transaction.category] || CATEGORY_STYLES.Other
                  const isIncome = transaction.type === 'income'

                  return (
                    <motion.tr
                      key={transaction._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      transition={{ duration: 0.2, delay: Math.min(idx * 0.02, 0.2) }}
                      className="group transition-colors duration-200 hover:bg-indigo-950/20 border-b border-white/[0.04] relative"
                    >
                      {/* Title */}
                      <TableCell className="font-semibold text-slate-200 py-3.5 pl-6">
                        <div className="flex items-center gap-2">
                          <span className="group-hover:text-white transition-colors">{transaction.title}</span>
                          {transaction.isRecurring && (
                            <span className="inline-flex items-center gap-1 text-[10px] bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 px-1.5 py-0.5 rounded-full uppercase tracking-wider font-bold">
                              <Repeat className="h-2.5 w-2.5" /> Recurring
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* Category Badge */}
                      <TableCell className="py-3.5">
                        <span className={`inline-flex items-center gap-1.5 rounded-full border ${catStyle.border} ${catStyle.bg} ${catStyle.text} px-2.5 py-0.5 text-xs font-semibold shadow-sm backdrop-blur-md`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${catStyle.dot}`} />
                          {transaction.category}
                        </span>
                      </TableCell>

                      {/* Date */}
                      <TableCell className="text-slate-400 text-xs font-medium py-3.5">
                        {new Date(transaction.date).toLocaleDateString(undefined, { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </TableCell>

                      {/* Amount */}
                      <TableCell className={`text-right font-mono font-bold text-sm py-3.5 ${isIncome ? 'text-emerald-400' : 'text-rose-400'}`}>
                        <span className="inline-block transition-transform duration-200 group-hover:scale-105">
                          {isIncome ? '+' : '-'}{currencySymbol}{transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right py-3.5 pr-6">
                        <div className="flex justify-end gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                          <motion.button 
                            whileHover={{ scale: 1.15 }} 
                            whileTap={{ scale: 0.9 }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                            onClick={() => onEdit(transaction)}
                            title="Edit transaction"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </motion.button>
                          <motion.button 
                            whileHover={{ scale: 1.15 }} 
                            whileTap={{ scale: 0.9 }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            onClick={() => onDelete(transaction._id)}
                            title="Delete transaction"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </motion.button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  )
                })
              )}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
