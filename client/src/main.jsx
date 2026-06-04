import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { Download, Pencil, Plus, RefreshCw, Trash2, WalletCards } from "lucide-react";
import { api } from "./api";
import "./styles.css";

const emptyForm = {
  amount: "",
  category: "Food",
  date: new Date().toISOString().slice(0, 10),
  note: ""
};

const currency = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2
});

function App() {
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [categories, setCategories] = useState(["Food", "Transport", "Bills", "Entertainment", "Other"]);
  const [budgets, setBudgets] = useState({});
  const [filters, setFilters] = useState({ category: "All", range: "thisMonth", from: "", to: "" });
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const dateRange = useMemo(() => resolveRange(filters), [filters]);

  async function loadData() {
    setLoading(true);
    setMessage("");
    try {
      const [metaData, expenseData, summaryData] = await Promise.all([
        api.getMeta(),
        api.getExpenses({ category: filters.category, ...dateRange }),
        api.getSummary()
      ]);
      setCategories(metaData.categories);
      setBudgets(metaData.budgets);
      setExpenses(expenseData.expenses);
      setSummary(summaryData);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [filters.category, dateRange.from, dateRange.to]);

  async function handleSubmit(event) {
    event.preventDefault();
    setErrors({});
    setMessage("");

    try {
      if (editingId) {
        await api.updateExpense(editingId, form);
      } else {
        await api.createExpense(form);
      }
      setForm(emptyForm);
      setEditingId(null);
      await loadData();
    } catch (error) {
      setErrors(error.details ?? {});
      setMessage(error.message);
    }
  }

  function startEdit(expense) {
    setEditingId(expense.id);
    setForm({
      amount: String(expense.amount),
      category: expense.category,
      date: expense.date,
      note: expense.note ?? ""
    });
    setErrors({});
  }

  async function removeExpense(expense) {
    const ok = window.confirm(`Delete ${currency.format(expense.amount)} from ${expense.category}?`);
    if (!ok) {
      return;
    }

    try {
      await api.deleteExpense(expense.id);
      await loadData();
    } catch (error) {
      setMessage(error.message);
    }
  }

  function exportCsv() {
    const header = ["Date", "Category", "Amount", "Note"];
    const rows = expenses.map((expense) => [
      expense.date,
      expense.category,
      expense.amount,
      expense.note ?? ""
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((value) => `"${String(value).replaceAll("\"", "\"\"")}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "expenses.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="app-shell">
      <section className="topbar">
        <div>
          <p className="eyebrow">Studio Graphene Assessment</p>
          <h1>Mini Expense Tracker</h1>
          <p className="lede">Log spending, filter it quickly, and see where this month&apos;s money is going.</p>
        </div>
        <button className="ghost-button" onClick={loadData} type="button">
          <RefreshCw size={18} /> Refresh
        </button>
      </section>

      {message && <div className="alert">{message}</div>}

      <section className="summary-grid">
        <MetricCard title="This month" value={summary ? currency.format(summary.totalThisMonth) : "..."} />
        <MetricCard title="Highest expense" value={summary?.highestExpense ? currency.format(summary.highestExpense.amount) : "None"} />
        <MetricCard title="Visible records" value={expenses.length} />
      </section>

      <section className="workspace-grid">
        <form className="panel expense-form" onSubmit={handleSubmit}>
          <div className="panel-heading">
            <WalletCards size={22} />
            <h2>{editingId ? "Edit expense" : "Add expense"}</h2>
          </div>

          <label>
            Amount
            <input
              min="0"
              step="0.01"
              type="number"
              value={form.amount}
              onChange={(event) => setForm({ ...form, amount: event.target.value })}
              placeholder="1200"
            />
            {errors.amount && <span className="field-error">{errors.amount}</span>}
          </label>

          <label>
            Category
            <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
              {categories.map((category) => <option key={category}>{category}</option>)}
            </select>
            {errors.category && <span className="field-error">{errors.category}</span>}
          </label>

          <label>
            Date
            <input
              max={new Date().toISOString().slice(0, 10)}
              type="date"
              value={form.date}
              onChange={(event) => setForm({ ...form, date: event.target.value })}
            />
            {errors.date && <span className="field-error">{errors.date}</span>}
          </label>

          <label>
            Note
            <textarea
              value={form.note}
              onChange={(event) => setForm({ ...form, note: event.target.value })}
              placeholder="Optional detail"
              rows="3"
            />
          </label>

          <div className="form-actions">
            <button className="primary-button" type="submit">
              <Plus size={18} /> {editingId ? "Save changes" : "Add expense"}
            </button>
            {editingId && (
              <button className="ghost-button" type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }}>
                Cancel
              </button>
            )}
          </div>
        </form>

        <section className="panel chart-panel">
          <div className="panel-heading">
            <h2>Category summary</h2>
          </div>
          <CategoryChart items={summary?.totalPerCategory ?? []} budgets={budgets} />
        </section>
      </section>

      <section className="panel">
        <div className="table-toolbar">
          <div>
            <h2>Expenses</h2>
            <p>Sorted by date, newest first.</p>
          </div>
          <button className="ghost-button" onClick={exportCsv} type="button" disabled={!expenses.length}>
            <Download size={18} /> Export CSV
          </button>
        </div>

        <div className="filters">
          <label>
            Category
            <select value={filters.category} onChange={(event) => setFilters({ ...filters, category: event.target.value })}>
              <option>All</option>
              {categories.map((category) => <option key={category}>{category}</option>)}
            </select>
          </label>
          <label>
            Date range
            <select value={filters.range} onChange={(event) => setFilters({ ...filters, range: event.target.value })}>
              <option value="thisMonth">This month</option>
              <option value="lastMonth">Last month</option>
              <option value="custom">Custom</option>
              <option value="all">All time</option>
            </select>
          </label>
          {filters.range === "custom" && (
            <>
              <label>
                From
                <input type="date" value={filters.from} onChange={(event) => setFilters({ ...filters, from: event.target.value })} />
              </label>
              <label>
                To
                <input type="date" value={filters.to} onChange={(event) => setFilters({ ...filters, to: event.target.value })} />
              </label>
            </>
          )}
        </div>

        {loading ? (
          <div className="empty-state">Loading expenses...</div>
        ) : expenses.length === 0 ? (
          <div className="empty-state">No expenses match these filters.</div>
        ) : (
          <div className="expense-list">
            {expenses.map((expense) => (
              <article className="expense-row" key={expense.id}>
                <div>
                  <strong>{expense.category}</strong>
                  <span>{formatDate(expense.date)}{expense.note ? ` · ${expense.note}` : ""}</span>
                </div>
                <div className="row-actions">
                  <strong>{currency.format(expense.amount)}</strong>
                  <button aria-label="Edit expense" className="icon-button" onClick={() => startEdit(expense)} type="button">
                    <Pencil size={17} />
                  </button>
                  <button aria-label="Delete expense" className="icon-button danger" onClick={() => removeExpense(expense)} type="button">
                    <Trash2 size={17} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function MetricCard({ title, value }) {
  return (
    <article className="metric-card">
      <span>{title}</span>
      <strong>{value}</strong>
    </article>
  );
}

function CategoryChart({ items }) {
  const max = Math.max(...items.map((item) => item.total), 1);

  return (
    <div className="chart">
      {items.map((item) => (
        <div className="chart-row" key={item.category}>
          <div className="chart-label">
            <span>{item.category}</span>
            <strong className={item.overBudget ? "over-budget" : ""}>{currency.format(item.total)}</strong>
          </div>
          <div className="bar-track">
            <div className={item.overBudget ? "bar over" : "bar"} style={{ width: `${Math.max((item.total / max) * 100, item.total ? 8 : 0)}%` }} />
          </div>
          <small>Budget: {item.budget ? currency.format(item.budget) : "Not set"}</small>
        </div>
      ))}
    </div>
  );
}

function resolveRange(filters) {
  const now = new Date();
  const firstThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastThisMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const firstLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  if (filters.range === "thisMonth") {
    return { from: toInputDate(firstThisMonth), to: toInputDate(lastThisMonth) };
  }

  if (filters.range === "lastMonth") {
    return { from: toInputDate(firstLastMonth), to: toInputDate(lastLastMonth) };
  }

  if (filters.range === "custom") {
    return { from: filters.from, to: filters.to };
  }

  return { from: "", to: "" };
}

function toInputDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
}

createRoot(document.getElementById("root")).render(<App />);
