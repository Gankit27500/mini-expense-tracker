import cors from "cors";
import express from "express";
import {
  CATEGORIES,
  buildSummary,
  filterExpenses,
  normalizeExpense,
  validateExpense
} from "./expenseService.js";
import { readDb, writeDb } from "./store.js";

const app = express();
const port = Number(process.env.PORT ?? 4000);
const clientOrigin = process.env.CLIENT_ORIGIN ?? "http://localhost:5173";

app.use(cors({ origin: clientOrigin }));
app.use(express.json());

app.get("/api/health", (_request, response) => {
  response.json({ ok: true });
});

app.get("/api/meta", async (_request, response, next) => {
  try {
    const db = await readDb();
    response.json({ categories: CATEGORIES, budgets: db.budgets ?? {} });
  } catch (error) {
    next(error);
  }
});

app.get("/api/expenses", async (request, response, next) => {
  try {
    const db = await readDb();
    const expenses = filterExpenses(db.expenses, request.query);
    response.json({ expenses });
  } catch (error) {
    next(error);
  }
});

app.post("/api/expenses", async (request, response, next) => {
  try {
    const validation = validateExpense(request.body);
    if (!validation.valid) {
      return response.status(422).json({ message: "Please fix the highlighted fields.", errors: validation.errors });
    }

    const db = await readDb();
    const expense = normalizeExpense(request.body);
    db.expenses.push(expense);
    await writeDb(db);
    response.status(201).json({ expense });
  } catch (error) {
    next(error);
  }
});

app.put("/api/expenses/:id", async (request, response, next) => {
  try {
    const validation = validateExpense(request.body);
    if (!validation.valid) {
      return response.status(422).json({ message: "Please fix the highlighted fields.", errors: validation.errors });
    }

    const db = await readDb();
    const index = db.expenses.findIndex((expense) => expense.id === request.params.id);
    if (index === -1) {
      return response.status(404).json({ message: "Expense not found." });
    }

    const expense = normalizeExpense(request.body, db.expenses[index]);
    db.expenses[index] = expense;
    await writeDb(db);
    response.json({ expense });
  } catch (error) {
    next(error);
  }
});

app.delete("/api/expenses/:id", async (request, response, next) => {
  try {
    const db = await readDb();
    const nextExpenses = db.expenses.filter((expense) => expense.id !== request.params.id);
    if (nextExpenses.length === db.expenses.length) {
      return response.status(404).json({ message: "Expense not found." });
    }

    db.expenses = nextExpenses;
    await writeDb(db);
    response.status(204).send();
  } catch (error) {
    next(error);
  }
});

app.get("/api/summary", async (_request, response, next) => {
  try {
    const db = await readDb();
    response.json(buildSummary(db.expenses, db.budgets));
  } catch (error) {
    next(error);
  }
});

app.use((error, _request, response, _next) => {
  console.error(error);
  response.status(500).json({ message: "Something went wrong. Please try again." });
});

app.listen(port, () => {
  console.log(`Expense Tracker API running on http://localhost:${port}`);
});
