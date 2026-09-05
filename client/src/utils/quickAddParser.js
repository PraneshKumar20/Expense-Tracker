export const CATEGORY_KEYWORDS = {
  Food: ['food', 'groceries', 'grocery', 'dinner', 'lunch', 'breakfast', 'brunch', 'snack', 'restaurant', 'cafe', 'coffee', 'starbucks', 'pizza', 'burger', 'sushi', 'drinks', 'bar', 'subway', 'mcdonalds', 'kfc', 'boba'],
  Travel: ['travel', 'uber', 'lyft', 'taxi', 'cab', 'flight', 'airplane', 'airline', 'train', 'metro', 'bus', 'gas', 'fuel', 'petrol', 'parking', 'toll', 'trip', 'hotel', 'airbnb'],
  Bills: ['bill', 'bills', 'electricity', 'power', 'water', 'internet', 'wifi', 'broadband', 'phone', 'mobile', 'utility', 'utilities', 'rent', 'lease', 'insurance', 'tax'],
  Subscriptions: ['subscription', 'subscriptions', 'netflix', 'spotify', 'youtube', 'prime', 'gym', 'fitness', 'icloud', 'apple', 'chatgpt', 'openai', 'adobe', 'patreon', 'github', 'saas'],
  Entertainment: ['entertainment', 'movie', 'cinema', 'theatre', 'theater', 'concert', 'festival', 'game', 'gaming', 'steam', 'playstation', 'xbox', 'ticket', 'tickets', 'party', 'club', 'bowling'],
  Shopping: ['shopping', 'clothes', 'clothing', 'shoes', 'amazon', 'flipkart', 'walmart', 'target', 'headphones', 'gadget', 'electronics', 'laptop', 'iphone', 'ipad', 'watch', 'outfit', 'store'],
  Salary: ['salary', 'paycheck', 'payroll', 'wages', 'client', 'freelance', 'contract', 'stipend', 'bonus', 'dividend', 'interest', 'investment', 'consulting'],
  Other: ['other', 'misc', 'miscellaneous', 'cash', 'transfer']
}

export const CATEGORY_COLORS = {
  Food: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  Travel: { bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/30' },
  Bills: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
  Subscriptions: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/30' },
  Entertainment: { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/30' },
  Shopping: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30' },
  Salary: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  Other: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/30' }
}

export function parseQuickAdd(query) {
  if (!query || !query.trim()) return null

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
}
