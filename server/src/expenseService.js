import { randomUUID } from "node:crypto";

export const CATEGORIES = ["Food", "Transport", "Bills", "Entertainment", "Other"];

export function validateExpense(payload) {
  const errors = {};
  const amount = Number(payload.amount);
  const today = new Date().toISOString().slice(0, 10);

  if (!Number.isFinite(amount) || amount <= 0) {
    errors.amount = "Amount must be a positive number.";
  }

  if (!CATEGORIES.includes(payload.category)) {
    errors.category = "Category is required.";
  }

  if (!payload.date) {
    errors.date = "Date is required.";
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(payload.date)) {
    errors.date = "Date must use YYYY-MM-DD format.";
  } else if (payload.date > today) {
    errors.date = "Date cannot be in the future.";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

export function normalizeExpense(payload, existing = {}) {
  const now = new Date().toISOString();

  return {
    id: existing.id ?? `exp_${randomUUID()}`,
    amount: Number(payload.amount),
    category: payload.category,
    date: payload.date,
    note: String(payload.note ?? "").trim(),
    createdAt: existing.createdAt ?? now,
    updatedAt: now
  };
}

export function filterExpenses(expenses, filters = {}) {
  return expenses
    .filter((expense) => {
      if (filters.category && filters.category !== "All" && expense.category !== filters.category) {
        return false;
      }

      if (filters.from && expense.date < filters.from) {
        return false;
      }

      if (filters.to && expense.date > filters.to) {
        return false;
      }

      return true;
    })
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
}

export function getMonthRange(referenceDate = new Date()) {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();
  const start = new Date(Date.UTC(year, month, 1)).toISOString().slice(0, 10);
  const end = new Date(Date.UTC(year, month + 1, 0)).toISOString().slice(0, 10);
  return { start, end };
}

export function buildSummary(expenses, budgets = {}, referenceDate = new Date()) {
  const { start, end } = getMonthRange(referenceDate);
  const monthExpenses = expenses.filter((expense) => expense.date >= start && expense.date <= end);
  const totalThisMonth = sum(monthExpenses.map((expense) => expense.amount));
  const totalPerCategory = CATEGORIES.map((category) => {
    const total = sum(monthExpenses.filter((expense) => expense.category === category).map((expense) => expense.amount));
    const budget = Number(budgets[category] ?? 0);

    return {
      category,
      total,
      budget,
      overBudget: budget > 0 && total > budget
    };
  });

  const highestExpense = expenses.reduce((highest, expense) => {
    if (!highest || expense.amount > highest.amount) {
      return expense;
    }
    return highest;
  }, null);

  return {
    month: { start, end },
    totalThisMonth,
    totalPerCategory,
    highestExpense
  };
}

function sum(values) {
  return Number(values.reduce((total, value) => total + Number(value), 0).toFixed(2));
}
