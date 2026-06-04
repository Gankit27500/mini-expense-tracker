# Mini Expense Tracker

## Project Title & Brief Description

This project completes **Exercise 2: Mini Expense Tracker** from the Studio Graphene Full Stack Developer assessment. It is a small full-stack app where a user can record daily expenses, filter them by category/date range, edit or delete entries, and review monthly spending through summary cards and a category chart.

## Live Demo Links

Not deployed yet. Recommended deployment plan:

- Frontend: Vercel or Netlify
- Backend: Render or Railway

When deployed, set the frontend environment variable `VITE_API_BASE_URL` to the deployed backend API URL ending in `/api`.

## Tech Stack

- **React + Vite** for a fast, modern frontend with functional components and hooks.
- **Node.js + Express** for a clear REST API.
- **JSON file storage** for persistence across server restarts without requiring database setup.
- **Plain CSS** for responsive styling without adding heavy UI dependencies.
- **Node test runner** for focused backend unit tests.

## How to Run Locally

Assuming Node.js is installed:

```bash
npm run install:all
npm run dev
```

Optional environment setup:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

The app will run at:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:4000/api`

To run only the backend tests:

```bash
npm test
```

## API Documentation

### Health Check

`GET /api/health`

Response:

```json
{ "ok": true }
```

### Metadata

`GET /api/meta`

Response:

```json
{
  "categories": ["Food", "Transport", "Bills", "Entertainment", "Other"],
  "budgets": { "Food": 8000, "Transport": 3000 }
}
```

### List Expenses

`GET /api/expenses?category=Food&from=2026-06-01&to=2026-06-30`

All query parameters are optional.

Response:

```json
{
  "expenses": [
    {
      "id": "exp_1001",
      "amount": 520,
      "category": "Food",
      "date": "2026-06-02",
      "note": "Team lunch",
      "createdAt": "2026-06-02T10:30:00.000Z",
      "updatedAt": "2026-06-02T10:30:00.000Z"
    }
  ]
}
```

### Create Expense

`POST /api/expenses`

Request body:

```json
{
  "amount": 520,
  "category": "Food",
  "date": "2026-06-02",
  "note": "Team lunch"
}
```

Response: `201 Created`

```json
{
  "expense": {
    "id": "exp_generated",
    "amount": 520,
    "category": "Food",
    "date": "2026-06-02",
    "note": "Team lunch",
    "createdAt": "2026-06-02T10:30:00.000Z",
    "updatedAt": "2026-06-02T10:30:00.000Z"
  }
}
```

Validation error response: `422 Unprocessable Entity`

```json
{
  "message": "Please fix the highlighted fields.",
  "errors": {
    "amount": "Amount must be a positive number."
  }
}
```

### Update Expense

`PUT /api/expenses/:id`

Request body uses the same shape as create expense.

Response:

```json
{ "expense": { "id": "exp_1001", "amount": 700, "category": "Food", "date": "2026-06-02", "note": "Dinner" } }
```

### Delete Expense

`DELETE /api/expenses/:id`

Response: `204 No Content`

### Monthly Summary

`GET /api/summary`

Response:

```json
{
  "month": { "start": "2026-06-01", "end": "2026-06-30" },
  "totalThisMonth": 1920,
  "totalPerCategory": [
    { "category": "Food", "total": 520, "budget": 8000, "overBudget": false }
  ],
  "highestExpense": {
    "id": "exp_1002",
    "amount": 1400,
    "category": "Bills",
    "date": "2026-06-01"
  }
}
```

## Project Structure

```text
mini-expense-tracker/
  client/
    src/
      api.js              Frontend API wrapper
      main.jsx            React app and UI components
      styles.css          Responsive styling
  server/
    data/db.json          JSON persistence file
    src/
      expenseService.js   Validation, filtering, and summary logic
      index.js            Express API routes
      store.js            JSON file read/write helpers
    test/
      expenseService.test.js
  scripts/dev.js          Runs client and server together
```

## What Works

- Add, edit, delete, and list expenses.
- Category and date-range filtering.
- Monthly total, highest expense, and category totals.
- Simple category bar chart with budget indicators.
- CSV export for currently visible expenses.
- JSON-file persistence across server restarts.
- Backend validation and meaningful unit tests.

## Next Steps

- Add editable budget settings in the UI instead of keeping them in `server/data/db.json`.
- Add authentication if multiple users are required.
- Add pagination for very large datasets.
- Deploy frontend and backend, then add the live URLs above.
