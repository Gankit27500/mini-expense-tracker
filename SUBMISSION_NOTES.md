# Submission Notes

## Exercise Chosen

I chose **Exercise 2: Mini Expense Tracker** because it gives a strong full-stack signal while still staying realistic for the assignment timeframe. It demonstrates CRUD APIs, frontend state management, validation, filtering, aggregation, persistence, and a clean user interface.

## Why This Is a Good Selection Choice

- It is more substantial than a basic task manager.
- It avoids external API/rate-limit risk from the GitHub Repo Explorer exercise.
- It gives clear interview discussion points: API design, validation, summary calculation, frontend/backend integration, and tradeoffs.
- It includes practical polish such as CSV export, budget indicators, empty/loading/error states, and backend tests.

## What To Say If Asked About AI

AI assistance was used to speed up scaffolding and implementation, but the code is intentionally simple and reviewable. I can explain the validation logic, API routes, JSON persistence, React state flow, filters, and summary calculation.

## Suggested Git Commit Flow

Use multiple commits before submitting:

```bash
git init
git add README.md package.json .gitignore
git commit -m "Initialize full-stack expense tracker"

git add server
git commit -m "Build Express expense API with JSON persistence"

git add client
git commit -m "Build React expense tracker interface"

git add SUBMISSION_NOTES.md client/.env.example server/.env.example
git commit -m "Add submission notes and environment examples"
```

## Final Submission Checklist

- Create a public GitHub repository.
- Push this project folder to the repository.
- Run `npm run install:all` and `npm run dev` locally.
- Confirm frontend works at `http://localhost:5173`.
- Deploy frontend and backend if possible.
- Add deployed URLs to `README.md`.
- Submit the GitHub link and live demo link through the company form.
