import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../ui/dialog"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Repeat, Sparkles } from "lucide-react"

const CATEGORIES = ["Food", "Travel", "Bills", "Entertainment", "Shopping", "Salary", "Subscriptions", "Other"]

export default function TransactionModal({ isOpen, onClose, onSave, editingTransaction }) {
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "",
    type: "expense",
    date: "",
    isRecurring: false
  })

  useEffect(() => {
    if (editingTransaction) {
      setFormData({
        title: editingTransaction.title,
        amount: editingTransaction.amount,
        category: editingTransaction.category,
        type: editingTransaction.type || "expense",
        date: editingTransaction.date.split('T')[0],
        isRecurring: editingTransaction.isRecurring || false
      })
    } else {
      setFormData({ 
        title: "", 
        amount: "", 
        category: "", 
        type: "expense", 
        date: new Date().toISOString().split('T')[0], 
        isRecurring: false 
      })
    }
  }, [editingTransaction, isOpen])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({
      ...editingTransaction,
      ...formData,
      amount: Number(formData.amount)
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[460px] bg-slate-950/95 border border-white/[0.1] backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] text-slate-100 rounded-2xl overflow-hidden">
        {/* Top ambient highlight */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
        
        <DialogHeader className="pt-2">
          <DialogTitle className="text-2xl font-extrabold text-white flex items-center gap-2">
            <span>{editingTransaction ? "Edit Record" : "New Transaction"}</span>
            <Sparkles className="h-4 w-4 text-indigo-400" />
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-xs">
            Log financial flows directly to your real-time analytics ledger.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Description
            </Label>
            <Input 
              id="title" 
              placeholder="e.g. Cloud Hosting or Salary" 
              value={formData.title} 
              onChange={(e) => setFormData({...formData, title: e.target.value})} 
              required 
              className="bg-slate-900/70 border-white/[0.08] focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-500/20 text-slate-100" 
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="amount" className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Amount
              </Label>
              <Input 
                id="amount" 
                type="number" 
                step="0.01" 
                placeholder="0.00" 
                value={formData.amount} 
                onChange={(e) => setFormData({...formData, amount: e.target.value})} 
                required 
                className="bg-slate-900/70 border-white/[0.08] focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-500/20 font-mono text-base font-bold text-slate-100" 
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Type
              </Label>
              <Select value={formData.type} onValueChange={(val) => setFormData({...formData, type: val})}>
                <SelectTrigger className="bg-slate-900/70 border-white/[0.08] focus:ring-2 focus:ring-indigo-500/20 text-slate-100 font-semibold text-xs">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700 text-slate-100">
                  <SelectItem value="expense" className="text-rose-400 font-semibold">Expense</SelectItem>
                  <SelectItem value="income" className="text-emerald-400 font-semibold">Income</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Category
              </Label>
              <Select value={formData.category} onValueChange={(val) => setFormData({...formData, category: val})} required>
                <SelectTrigger className="bg-slate-900/70 border-white/[0.08] focus:ring-2 focus:ring-indigo-500/20 text-slate-100 font-semibold text-xs">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700 text-slate-100">
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="date" className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Date
              </Label>
              <Input 
                id="date" 
                type="date" 
                value={formData.date} 
                onChange={(e) => setFormData({...formData, date: e.target.value})} 
                required 
                className="bg-slate-900/70 border-white/[0.08] focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-500/20 text-slate-100 text-xs" 
              />
            </div>
          </div>

          {/* Recurring Toggle */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/50 border border-white/[0.05] mt-1">
            <button
              type="button"
              onClick={() => setFormData(prev => ({...prev, isRecurring: !prev.isRecurring}))}
              className={`flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-300 ${formData.isRecurring ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}
            >
              <Repeat className={`h-4 w-4 ${formData.isRecurring ? 'animate-spin' : ''}`} style={{ animationIterationCount: 1 }} />
            </button>
            <div className="flex flex-col cursor-pointer" onClick={() => setFormData(prev => ({...prev, isRecurring: !prev.isRecurring}))}>
              <span className="text-xs font-bold text-slate-200">Recurring Transaction</span>
              <span className="text-[11px] text-slate-400">Mark as periodic repeating income/expense</span>
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-white/[0.06] flex items-center justify-end gap-2">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={onClose} 
              className="hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs shadow-lg shadow-indigo-500/30 border border-indigo-400/20"
            >
              {editingTransaction ? "Save Changes" : "Create Record"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
