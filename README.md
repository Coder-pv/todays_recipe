# Today's Recipe 🍽️

> AI-powered meal planning that thinks ahead — recommending the right meal at the right time based on what's in your pantry, how you eat, and what your body needs.

Most recipe apps make you search. Today's Recipe inverts that. Tell it your preferences once, and it handles the rest — generating personalised daily meal plans, tracking what you've eaten, and keeping your pantry in sync automatically.

---

## Why I Built This

I wanted to go beyond a simple prompt-to-recipe demo and build something that treats AI as one service inside a real product system — with authentication, persistent state, inventory rules, graceful fallback, and deployment-ready configuration. This project reflects how I think about building: AI should enhance a product, not be the product.

---

## Features

- Personalised meal plans generated from dietary preferences, allergies, health goals, calorie targets, and pantry inventory
- Pantry management with automatic ingredient deduction on meal completion — and restoration on undo
- AI-generated recipes with ingredients and step-by-step cooking instructions
- Deterministic fallback plans when AI is unavailable — the app always works
- Dashboard with calorie tracking, pantry overview, and weekly consumption summary
- Secure bearer-token authentication with protected routes throughout
- Unit tested across auth, middleware, reducers, pantry logic, and meal math helpers

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
| Deployment       | Netlify · Render · AWS Amplify · Docker            |

---

## Architecture

The app is split into four independent runtime concerns — frontend, backend, database, and AI provider — so each layer can be swapped, scaled, or deployed independently.

```
React + Vite (Netlify / Amplify)
  └── calls Express API via VITE_API_BASE_URL

Node.js + Express (Render / Docker)
  ├── owns auth, domain rules, pantry mutation, and AI orchestration
  ├── talks to MongoDB Atlas
  └── calls OpenRouter or OpenAI for meal generation
         └── falls back to local deterministic generator if unavailable
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
