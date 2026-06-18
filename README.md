# Today's Recipe

Today's Recipe is an AI-assisted meal planning system that converts user preferences, pantry inventory, dietary constraints, and serving size into daily recipe plans. The application is intentionally structured as a full-stack product rather than a single prompt interface: authentication, user profile state, inventory management, generated meal plans, pantry deduction, and operational health are separate concerns with explicit API boundaries.

## Problem Statement

Enterprise food, wellness, and household-planning systems usually fail at the boundary between personalization and operational state. A recommendation engine can generate a recipe, but the surrounding system still needs to know who the user is, what inventory is available, what dietary rules must never be violated, how many servings are required, and what downstream inventory changes occur after a meal is completed.

At enterprise scale, the hard problems are not only content generation. They include:

- Consistent identity and ownership boundaries across profile, pantry, and plan data.
- Reliable state transitions when generated recommendations affect inventory.
- Explainable fallback behavior when an AI provider is unavailable or returns invalid output.
- Configurable deployment across local development, hosted databases, and cloud environments.
- Separation of user-facing generation from provider-specific implementation details.

Today's Recipe addresses those concerns through a React client, an Express API, MongoDB persistence, provider-agnostic AI generation, and deterministic fallback recipes.

## System Architecture

```text
User Browser
  |
  | React/Vite client
  | - Auth UI
  | - Pantry management
  | - Meal preference profile
  | - Recipe plan rendering
  v
Express API
  |
  | Middleware
  | - CORS origin control
  | - Bearer token authentication
  | - DB availability guard
  v
Domain Routes
  |
  | /api/auth       -> user registration, login, token restoration
  | /api/profile    -> dietary preferences, calories, meal cadence
  | /api/pantry     -> inventory CRUD
  | /api/plans      -> AI generation, meal completion, pantry deduction
  | /api/dashboard  -> composed profile, pantry, and plan state
  v
Services
  |
  | mealPlanAI
  | - OpenRouter/OpenAI-compatible generation
  | - strict JSON contract
  | - normalization
  | - deterministic fallback
  v
MongoDB
  |
  | Collections
  | - profiles
  | - pantryitems
  | - mealplans
```

Recommended cloud topology:

```text
Netlify
  React static assets
  VITE_API_BASE_URL=https://<backend-domain>

Render
  Express API service
  MONGODB_URI=mongodb+srv://...
  CLIENT_ORIGIN=https://<frontend-domain>
  JWT_SECRET=<secret>
  OPENROUTER_API_KEY=<secret>

MongoDB Atlas
  Hosted MongoDB cluster
  Database: todays_recipe
```

## Design Decisions

The frontend and backend are deliberately separate deployable surfaces. The client reads `VITE_API_BASE_URL` at build time, while the server reads `MONGODB_URI`, `CLIENT_ORIGIN`, `JWT_SECRET`, and AI provider keys at runtime. This keeps deployment concerns out of source code and avoids hardcoding local infrastructure into production builds.

MongoDB is accessed only from the API tier. The browser never receives the database connection string. This keeps credentials server-side and allows future changes to persistence, indexing, or tenancy without rewriting the UI.

AI output is normalized before persistence. The model is asked for a strict JSON shape, but the server still treats provider output as untrusted. It validates meal slots, fills missing values from deterministic fallback data, and persists a consistent meal plan shape.

Recipe instructions are stored separately from pantry deduction metadata. `recipeIngredients` and `steps` describe the user-facing recipe. `ingredientsUsed` describes the inventory amounts to deduct when a meal is completed. That separation prevents presentation data from corrupting operational inventory behavior.

The system supports provider fallback. If no AI key is configured, the provider fails, or the model returns invalid JSON, the application still returns a deterministic meal plan with `source: "stub"` and a `fallbackReason`. This is important for user trust and operational continuity.

## Tradeoffs

The current JWT implementation is intentionally lightweight and local to the API. It is acceptable for a portfolio-grade system, but a production enterprise deployment would likely use Cognito, Auth0, or an internal identity provider for token lifecycle, rotation, MFA, and centralized audit.

MongoDB Atlas is preferred over self-managed MongoDB on EC2. The tradeoff is vendor dependency and external network configuration, but it avoids operational burden around patching, backups, replication, and disk management.

The app uses a JSON contract with an LLM rather than a fine-tuned model or tool-calling orchestration. This keeps the implementation simple and portable across OpenRouter/OpenAI-compatible providers. The tradeoff is that the server must remain defensive against malformed or incomplete model output.

AWS App Runner is easier to operate than raw EC2. The tradeoff is less low-level control. For this app, managed runtime, logs, HTTPS, and autoscaling are more valuable than manually controlling the host.

## Failure Scenarios

AI provider authentication fails:
The server returns a deterministic recipe plan with `source: "stub"` and a provider-specific `fallbackReason`. The UI can still render recipes instead of failing the workflow.

AI provider returns malformed JSON:
The server rejects the malformed response, falls back to deterministic generation, and preserves the expected plan schema.

MongoDB is unavailable:
The `/health` endpoint reports DB connection state. Protected API routes guarded by DB middleware should fail before attempting partial writes.

Frontend is deployed with the wrong API URL:
The browser will fail API calls because `VITE_API_BASE_URL` points to the wrong backend. This is isolated to frontend configuration and does not require code changes.

CORS is misconfigured:
The API rejects browser calls from unapproved origins. Fix by setting `CLIENT_ORIGIN` to the deployed frontend URL. Multiple origins can be comma-separated.

JWT secret is missing in production:
The server fails fast instead of using a development fallback secret. This protects production sessions from accidental weak signing keys.

Meal completion partially updates pantry:
The current implementation performs pantry deduction in application logic. A production version should use MongoDB transactions for stronger consistency across meal plan and pantry documents.

## How AI Is Used

AI is not used as a generic chatbot. It is used as a constrained planning component inside a larger transactional workflow.

The AI service receives structured context:

- Dietary preference
- Allergies
- Health goal
- Daily calorie target
- Meal pattern
- Serving size
- Pantry inventory
- Allowed meal slots

The model returns structured recipe objects:

- Meal title
- Short description
- Calories
- Full recipe ingredients
- Step-by-step method
- Pantry deduction candidates

The backend then normalizes and persists the result. This positions AI as a replaceable recommendation engine, not the source of truth for user identity, inventory ownership, or write authorization.

## What I Would Improve In Production

Use managed identity. Replace custom JWT handling with Amazon Cognito or another enterprise identity provider.

Add MongoDB transactions. Meal completion and pantry deduction should commit atomically.

Add rate limiting. Protect generation endpoints from abuse and control AI provider cost.

Add schema validation. Use a runtime validator for request payloads and AI responses.

Add observability. Emit structured logs, request IDs, provider latency, fallback rates, and generation success metrics to CloudWatch.

Add queue-based generation. For slow or expensive recipe generation, move the provider call to an asynchronous job and notify the client when complete.

Add secret management. Store production secrets in AWS Secrets Manager or Parameter Store instead of plain environment variables.

Add CI/CD gates. Run tests, linting, build, and container scanning before deployment.

Add multi-tenant controls. If deployed for multiple organizations, enforce tenant IDs at the data model and query layer.

## Deployment Configuration

### Hosted MongoDB

Use MongoDB Atlas for the hosted database. Create a cluster, database user, and network access rule, then set:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-host>/todays_recipe?retryWrites=true&w=majority
```

Keep this value only in `server/.env` locally and in AWS backend environment variables in production.

### Frontend Environment

Local:

```env
VITE_API_BASE_URL=http://localhost:5000
```

Production:

```env
VITE_API_BASE_URL=https://<your-backend-domain>
```

### Backend Environment

Required production variables:

```env
PORT=5000
MONGODB_URI=mongodb+srv://...
CLIENT_ORIGIN=https://<your-frontend-domain>
JWT_SECRET=<long-random-secret>
OPENROUTER_API_KEY=<optional>
OPENROUTER_MODEL=nex-agi/nex-n2-pro:free
OPENAI_API_KEY=<optional>
```

## AWS Deployment Plan

Deploy the frontend with AWS Amplify Hosting:

1. Push this repository to GitHub.
2. Open AWS Amplify.
3. Create a new app from GitHub.
4. Select the repository and branch.
5. Amplify will use `amplify.yml`.
6. Add `VITE_API_BASE_URL` after the backend URL is known.
7. Deploy.

Deploy the backend with AWS App Runner:

1. Create an App Runner service.
2. Use the backend container configuration from `server/Dockerfile`.
3. Set the service port to `5000`.
4. Add environment variables from the backend environment section.
5. Deploy.
6. Copy the App Runner service URL.
7. Add that URL as `VITE_API_BASE_URL` in Amplify.
8. Add the Amplify frontend URL as `CLIENT_ORIGIN` in App Runner.
9. Redeploy both services if necessary.

## Netlify and Render Deployment Plan

This is the recommended low-friction deployment path for daily personal use.

Deploy the backend with Render:

1. Push this repository to GitHub.
2. Open Render and create a new web service from the GitHub repository.
3. Use `render.yaml` if Render detects the blueprint, or configure manually:
   - Root directory: `server`
   - Build command: `npm ci`
   - Start command: `npm start`
   - Health check path: `/health`
4. Add backend environment variables:
   - `NODE_ENV=production`
   - `PORT=5000`
   - `MONGODB_URI=mongodb+srv://...`
   - `CLIENT_ORIGIN=https://<your-netlify-site>.netlify.app`
   - `JWT_SECRET=<long-random-secret>`
   - `OPENROUTER_API_KEY=<optional>`
   - `OPENROUTER_MODEL=nex-agi/nex-n2-pro:free`
5. Deploy the Render service.
6. Copy the Render service URL, for example `https://todays-recipe-api.onrender.com`.

Deploy the frontend with Netlify:

1. Open Netlify and create a new site from GitHub.
2. Select this repository.
3. Netlify will use `netlify.toml`, which sets:
   - Base directory: `client`
   - Build command: `npm ci && npm run build`
   - Publish directory: `client/dist`
4. Add the frontend environment variable:
   - `VITE_API_BASE_URL=https://<your-render-service>.onrender.com`
5. Deploy the Netlify site.
6. Copy the Netlify site URL.
7. Return to Render and update `CLIENT_ORIGIN` to the final Netlify URL.
8. Redeploy the Render service.

Render free services may sleep after inactivity. The first request after sleeping can be slow. That is acceptable for a portfolio or personal app, but a production system would use a paid always-on instance.

## AWS Deployment Option

The same codebase can also be deployed to AWS Amplify and AWS App Runner or EC2. The repository includes `amplify.yml` and `server/Dockerfile` for that path. AWS is useful for demonstrating cloud architecture knowledge, while Netlify and Render are simpler for ongoing personal use.

## Local Development

Install dependencies:

```bash
npm run install:all
```

Run both apps:

```bash
npm run dev
```

Client:

```text
http://localhost:5173
```

API:

```text
http://localhost:5000
```

Run tests:

```bash
npm test
```

## Git Workflow

This project should not commit `.env`, `node_modules`, or build output. The `.gitignore` is configured for those defaults.

Initial push:

```bash
git init
git add .
git commit -m "Prepare todays recipe for cloud deployment"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

If GitHub rejects the push because the remote already has content:

```bash
git pull --rebase origin main
git push -u origin main
```
