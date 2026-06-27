### **RecipeBook 🍽️**

> **An AI-powered meal planner that thinks ahead — delivering the right meal at the right time based on your pantry, eating habits, goals, and nutritional needs.**

Meal planning should feel effortless, not repetitive. **RecipeBook** creates a personalised food experience by understanding your preferences, available ingredients, and daily eating patterns.

---

## Why I Built This

I built RecipeBook from a problem I faced myself — every day I was spending too much time deciding what to cook. I would keep opening AI tools, typing pantry ingredients, dietary preferences, allergies, calorie goals, and asking for meal ideas again and again. The process worked, but repeating it every day became tiring.

So I built RecipeBook — an AI-powered meal planning assistant that remembers preferences, understands what’s available in the pantry, and recommends personalised meals automatically. Instead of searching and prompting every day, users can generate meal plans, discover recipes, and track meals with a single click.

---

## Features

- Secure bearer-token authentication with protected routes throughout
- Dashboard with calorie tracking, pantry overview, and weekly consumption summary
- Personalised meal plans generated from dietary preferences, allergies, health goals, calorie targets, and pantry inventory
- Pantry management with automatic ingredient deduction on meal completion 
- AI-generated recipes with ingredients and step-by-step cooking instructions

---

## Tech Stack

| Layer            | Technology                                         |
| ---------------- | -------------------------------------------------- |
| Frontend         | React, Vite, React Router                          |
| State Management | Custom Redux-like store with reducers and dispatch |
| Styling          | Tailwind CSS                                       |
| Charts           | Recharts                                           |
| Backend          | Node.js, Express                                   |
| Database         | MongoDB Atlas with Mongoose                        |
| Authentication   | JWT bearer token flow                              |
| AI Providers     | OpenRouter / OpenAI-compatible APIs                |
| Testing          | Vitest, Supertest                                  |
| Deployment       | Netlify · Render           |

---

## Architecture

The app is split into four independent runtime concerns — frontend, backend, database, and AI provider — so each layer can be swapped, scaled, or deployed independently.


```

**Key design decisions:**

- **AI as a replaceable service** — the backend owns validation, persistence, and fallback. The AI provider only generates structured suggestions.
- **Durable meal plans** — generated plans are saved in MongoDB, not treated as temporary text. Completion state, pantry snapshots, and plan history are all persistent.
- **Inventory-aware workflow** — completing a meal deducts pantry quantities and stores a snapshot. Undoing completion restores inventory from that snapshot.
- **Graceful degradation** — if no AI key is configured or the provider fails, a local fallback plan is returned. The app is always demoable.

---

## Getting Started

### 1. Install dependencies

```bash
npm run install:all
```

### 2. Configure environment variables

**Server** (`server/.env`):

```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret
CLIENT_ORIGIN=http://localhost:5173
OPENROUTER_API_KEY=optional
OPENAI_API_KEY=optional
PORT=5000
```

**Client** (`client/.env`):

```env
VITE_API_BASE_URL=http://localhost:5000
```

### 3. Run the app

```bash
npm run dev
```

| Service  | URL                   |
| -------- | --------------------- |
| Frontend | http://localhost:5173 |
| Backend  | http://localhost:5000 |

---

## API Reference

All protected routes require `Authorization: Bearer <token>`.

| Method | Endpoint                      | Description                 |
| ------ | ----------------------------- | --------------------------- |
| POST   | `/api/auth/register`          | Create account              |
| POST   | `/api/auth/login`             | Login and receive token     |
| GET    | `/api/profile`                | Get profile and preferences |
| PUT    | `/api/profile`                | Update profile              |
| GET    | `/api/pantry`                 | List pantry items           |
| POST   | `/api/pantry`                 | Add pantry item             |
| PATCH  | `/api/pantry/:id`             | Update pantry item          |
| DELETE | `/api/pantry/:id`             | Remove pantry item          |
| POST   | `/api/plans/generate`         | Generate a meal plan        |
| GET    | `/api/plans?date=YYYY-MM-DD`  | Get plan for a date         |
| PATCH  | `/api/plans/:date/meal/:slot` | Complete or undo a meal     |
| GET    | `/api/dashboard`              | Calorie and pantry summary  |
| GET    | `/api/highlights`             | Popular and recent recipes  |
| GET    | `/health`                     | API and database status     |

---

## Testing

```bash
# All tests
npm test

# Server only
npm run test --prefix server

# Client only
npm run test --prefix client
```

Coverage includes: auth utilities, auth middleware, pantry deduction logic, client reducers, and meal math helpers.

---

## Deployment

| Service  | Provider               |
| -------- | ---------------------- |
| Frontend | Netlify or AWS Amplify |
| Backend  | Render or Docker       |
| Database | MongoDB Atlas          |
| AI       | OpenRouter or OpenAI   |

Config files included: `netlify.toml`, `render.yaml`, `amplify.yml`, `server/Dockerfile`.

---

## What's Next

- Swap custom auth for Auth0, Cognito, or Clerk
- Add shopping list generation from missing pantry ingredients
- Add nutrition macros beyond calories
- Add recipe favourites and meal history
- Add rate limiting on auth and AI generation endpoints
- CI/CD pipeline with lint, test, build, and deployment validation

---

## About

Built by a full-stack developer who believes AI should be one well-integrated service inside a thoughtfully engineered product — not a demo wrapper around a prompt.

> Stack: React · Vite · Node.js · Express · MongoDB · JWT · Tailwind CSS · Recharts · OpenRouter · Vitest
