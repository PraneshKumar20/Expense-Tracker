import { Plus, Receipt, TrendingUp, TrendingDown, Wallet } from "lucide-react"
import TransactionTable from "./TransactionTable"
import AnimatedCounter from "../ui/AnimatedCounter"

export default function TransactionsView({
  transactions = [],
  onEdit,
  onDelete,
  currencySymbol = "₹",
  onOpenAddModal,
  totalIncome,
  totalExpense,
  balance
}) {
  return (
    <div className="space-y-5">
      {/* Top Ledger Snapshot Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Records */}
        <div className="finance-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500">Total Entries</span>
            <Receipt className="h-4 w-4 text-slate-400" />
          </div>
          <p className="text-[20px] sm:text-[26px] font-semibold text-white font-mono-nums mt-1">{transactions.length}</p>
          <p className="text-xs text-slate-400 font-normal mt-0.5">Recorded in journal</p>
        </div>

        {/* Total Inflow */}
        <div className="finance-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-emerald-400">Total Inflow</span>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-[20px] sm:text-[26px] font-semibold text-emerald-400 font-mono-nums mt-1 leading-tight">
            <AnimatedCounter value={totalIncome} prefix={currencySymbol} />
          </p>
          <p className="text-xs text-slate-400 font-normal mt-0.5">All credited income</p>
        </div>

        {/* Total Outflow */}
        <div className="finance-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-rose-400">Total Outflow</span>
            <TrendingDown className="h-4 w-4 text-rose-400" />
          </div>
          <p className="text-[20px] sm:text-[26px] font-semibold text-rose-400 font-mono-nums mt-1 leading-tight">
            <AnimatedCounter value={totalExpense} prefix={currencySymbol} />
          </p>
          <p className="text-xs text-slate-400 font-normal mt-0.5">All debited expenses</p>
        </div>

        {/* Net Cashflow */}
        <div className="finance-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500">Net Surplus</span>
            <Wallet className="h-4 w-4 text-slate-400" />
          </div>
          <p className={`text-[20px] sm:text-[26px] font-semibold font-mono-nums mt-1 leading-tight ${balance >= 0 ? 'text-white' : 'text-rose-400'}`}>
            <AnimatedCounter value={balance} prefix={currencySymbol} />
          </p>
          <p className="text-xs text-slate-400 font-normal mt-0.5">Surplus retention</p>
        </div>
      </div>

      {/* Main Ledger Table */}
      <div className="finance-card p-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
          <div>
            <h2 className="text-[19px] font-bold text-white tracking-tight">
              Ledger Journal
            </h2>
            <p className="text-[13px] text-slate-400 font-medium mt-1">Search, filter, and inspect financial transactions</p>
          </div>
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Entry</span>
          </button>
        </div>

        <TransactionTable
          transactions={transactions}
          onEdit={onEdit}
          onDelete={onDelete}
          currencySymbol={currencySymbol}
        />
      </div>
    </div>
  )
}
