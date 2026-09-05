import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../ui/dialog"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Repeat } from "lucide-react"

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
      <DialogContent className="sm:max-w-[440px] bg-[#0f1523] border border-slate-800 text-slate-100 rounded-lg shadow-2xl">
        <DialogHeader className="pt-1">
          <DialogTitle className="text-lg font-bold text-white tracking-tight">
            {editingTransaction ? "Edit Transaction" : "New Transaction"}
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-xs font-normal leading-relaxed">
            Log financial flows directly to your ledger.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 py-1">
          <div className="space-y-1">
            <Label htmlFor="title" className="text-xs font-medium text-slate-300">
              Description / Payee
            </Label>
            <Input 
              id="title" 
              placeholder="e.g. AWS Cloud or Freelance" 
              value={formData.title} 
              onChange={(e) => setFormData({...formData, title: e.target.value})} 
              required 
              className="bg-slate-900 border-slate-800 focus-visible:border-indigo-500 text-slate-100 text-xs rounded" 
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <Label htmlFor="amount" className="text-xs font-medium text-slate-300">
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
                className="bg-slate-900 border-slate-800 focus-visible:border-indigo-500 font-mono-nums text-sm font-semibold text-slate-100 rounded" 
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium text-slate-300">
                Type
              </Label>
              <Select value={formData.type} onValueChange={(val) => setFormData({...formData, type: val})}>
                <SelectTrigger className="bg-slate-900 border-slate-800 focus:ring-0 text-slate-100 font-medium text-xs rounded">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-slate-100 text-xs">
                  <SelectItem value="expense" className="text-rose-400 font-medium">Expense (-)</SelectItem>
                  <SelectItem value="income" className="text-emerald-400 font-medium">Income (+)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <Label className="text-xs font-medium text-slate-300">
                Category
              </Label>
              <Select value={formData.category} onValueChange={(val) => setFormData({...formData, category: val})} required>
                <SelectTrigger className="bg-slate-900 border-slate-800 focus:ring-0 text-slate-100 text-xs rounded">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-slate-100 text-xs">
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="date" className="text-xs font-medium text-slate-300">
                Date
              </Label>
              <Input 
                id="date" 
                type="date" 
                value={formData.date} 
                onChange={(e) => setFormData({...formData, date: e.target.value})} 
                required 
                className="bg-slate-900 border-slate-800 focus-visible:border-indigo-500 text-slate-100 text-xs rounded" 
              />
            </div>
          </div>

          {/* Recurring Toggle */}
          <div className="flex items-center gap-2.5 p-2.5 rounded bg-slate-900 border border-slate-800 mt-1">
            <button
              type="button"
              onClick={() => setFormData(prev => ({...prev, isRecurring: !prev.isRecurring}))}
              className={`flex items-center justify-center w-7 h-7 rounded transition-colors ${formData.isRecurring ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}
            >
              <Repeat className="h-3.5 w-3.5" />
            </button>
            <div className="flex flex-col cursor-pointer" onClick={() => setFormData(prev => ({...prev, isRecurring: !prev.isRecurring}))}>
              <span className="text-xs font-medium text-slate-200">Recurring Transaction</span>
              <span className="text-[10px] text-slate-400">Mark as periodic repeating cashflow</span>
            </div>
          </div>

          <DialogFooter className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={onClose} 
              className="text-slate-400 hover:text-slate-200 text-xs font-medium h-8"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs h-8 px-3 rounded"
            >
              {editingTransaction ? "Save Changes" : "Record Entry"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
