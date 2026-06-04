import test from "node:test";
import assert from "node:assert/strict";
import { buildSummary, filterExpenses, validateExpense } from "../src/expenseService.js";

const sampleExpenses = [
  { id: "1", amount: 100, category: "Food", date: "2026-06-01", createdAt: "2026-06-01T10:00:00.000Z" },
  { id: "2", amount: 250, category: "Bills", date: "2026-06-03", createdAt: "2026-06-03T10:00:00.000Z" },
  { id: "3", amount: 75, category: "Food", date: "2026-05-20", createdAt: "2026-05-20T10:00:00.000Z" }
];

test("validateExpense rejects invalid amount, category, and future date", () => {
  const result = validateExpense({ amount: -10, category: "", date: "2999-01-01" });

  assert.equal(result.valid, false);
  assert.equal(result.errors.amount, "Amount must be a positive number.");
  assert.equal(result.errors.category, "Category is required.");
  assert.equal(result.errors.date, "Date cannot be in the future.");
});

test("filterExpenses applies category and date filters newest first", () => {
  const result = filterExpenses(sampleExpenses, { category: "Food", from: "2026-05-01", to: "2026-06-30" });

  assert.deepEqual(result.map((expense) => expense.id), ["1", "3"]);
});

test("buildSummary totals current month and finds highest expense", () => {
  const summary = buildSummary(sampleExpenses, { Food: 90 }, new Date("2026-06-15T00:00:00.000Z"));

  assert.equal(summary.totalThisMonth, 350);
  assert.equal(summary.highestExpense.id, "2");
  assert.equal(summary.totalPerCategory.find((item) => item.category === "Food").overBudget, true);
});
