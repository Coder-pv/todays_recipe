# Today's Recipe

Today's Recipe is an AI-assisted meal planning platform that connects preference management, pantry inventory, recipe generation, and meal completion into a single full-stack workflow. I designed it as more than a prompt-to-recipe demo: the application models user identity, dietary constraints, serving requirements, pantry state, generated plans, fallback behavior, and operational health as separate system concerns.

The core architectural goal was to treat AI as one service inside a product system, not as the system itself.

## Problem Statement

Recipe generation is easy to demonstrate in isolation, but difficult to operationalize responsibly. A real meal planning product has to answer questions that a standalone chatbot does not:

- Which user owns this profile, pantry, and meal plan?
- What dietary rules must be enforced every time?
- What ingredients are available now?
- How many servings should be planned?
- What inventory changes after a meal is marked complete?
- What happens when the AI provider is unavailable or returns malformed output?

At enterprise scale, these are state management, ownership, resilience, and integration problems. The AI response is only one part of a larger workflow. Today's Recipe was built to explore that full boundary: recommendation generation supported by authenticated state, persistent inventory, deterministic fallback behavior, and deployable service separation.

## System Architecture

I separated the application into three deployable concerns: browser client, API service, and managed data store.

```text
Browser Client
  React + Vite
  - Authentication UI
  - Pantry inventory workflow
  - Meal preference workflow
  - Generated recipe plan rendering
  - Meal completion interactions

        |
        | HTTPS / JSON
        v

API Service
  Node.js + Express
  - CORS boundary
  - Bearer token authentication
  - MongoDB connection health
  - Domain route orchestration
  - AI provider integration
  - Pantry deduction rules

        |
        | Mongoose
        v

MongoDB Atlas
  - profiles
  - pantryitems
  - mealplans
```

The runtime deployment is cloud-portable. The client can be hosted as static assets on Netlify, AWS Amplify, or a similar static host. The API can run on Render, AWS App Runner, EC2, or another Node-compatible service. MongoDB Atlas is used as the managed persistence layer.

```text
Netlify / Static Hosting
  VITE_API_BASE_URL -> API URL

Render / Node Hosting
  MONGODB_URI       -> MongoDB Atlas
  CLIENT_ORIGIN     -> allowed frontend domain
  JWT_SECRET        -> token signing
  OPENROUTER_API_KEY / OPENAI_API_KEY -> AI provider

MongoDB Atlas
  Hosted operational data
```

## Design Decisions

I kept the frontend and backend independently deployable. The client does not assume that the API is on localhost; it reads `VITE_API_BASE_URL` at build time. The backend reads deployment-specific values such as `MONGODB_URI`, `CLIENT_ORIGIN`, `JWT_SECRET`, and AI keys from environment variables. This makes the same codebase usable locally, on Netlify and Render, or on AWS-backed infrastructure.

I kept database access server-side only. The browser never receives the MongoDB connection string or any direct persistence credentials. This keeps the API as the policy enforcement layer for authentication, ownership, validation, and future authorization rules.

I modeled recipe display separately from inventory operations. A generated meal stores `recipeIngredients` and `steps` for user-facing cooking instructions, while `ingredientsUsed` represents pantry deduction candidates. That distinction matters because a recipe can mention complete instructions while inventory operations require stricter, smaller, normalized quantities.

I designed the AI integration defensively. The model is asked to return strict JSON, but the server still normalizes the response before persistence. Missing fields are filled from deterministic fallback data, disabled meal slots are respected, and invalid provider output does not break the user workflow.

I preserved deterministic fallback behavior. If the AI provider fails, the application still returns a usable plan with `source: "stub"` and a `fallbackReason`. This is an architectural choice: the user should understand degraded mode instead of seeing a silent failure or blank state.

## Core Domain Model

The main entities are:

- `Profile`: user-owned dietary settings, calorie target, meal pattern, and serving defaults.
- `PantryItem`: user-owned inventory item with quantity and unit.
- `MealPlan`: date-specific generated plan containing meals, instructions, source metadata, and completion state.

The `MealPlan` document is intentionally richer than a simple AI response. It stores:

- available meal slots
- meal titles and descriptions
- calories
- full recipe ingredients
- step-by-step method
- pantry deduction candidates
- meal completion state
- AI source and fallback reason

This lets the app preserve the generated plan as durable product state rather than treating it as transient chat text.

## AI Integration

AI is used as a constrained planning service, not as a general chatbot.

The AI service receives structured context:

- dietary preference
- allergies
- health goal
- daily calorie target
- meal cadence
- serving count
- pantry items
- allowed meal slots

The AI service returns structured meal objects:

- title
- summary description
- calories
- complete ingredient list
- ordered cooking steps
- pantry usage estimates

The backend then normalizes and persists the result. This keeps the AI provider replaceable and prevents the model from becoming the authority for identity, ownership, persistence, or pantry mutation.

## Failure Scenarios

AI provider unavailable:
The API returns a deterministic fallback meal plan and records the fallback reason. The user can continue using the app while the system remains transparent about degraded mode.

AI provider returns invalid JSON:
The response is rejected at the normalization boundary. The persisted meal plan still follows the expected schema.

MongoDB unavailable:
The health endpoint exposes DB connection state, and DB-dependent routes are guarded so the system fails before partial domain operations are attempted.

Incorrect frontend/backend origin:
The CORS layer prevents unapproved browser origins from calling the API. In development, localhost ports are flexible; in production, the frontend origin is explicitly configured.

Missing production JWT secret:
The API fails fast instead of silently using a development token signing secret.

Meal completion and pantry deduction drift:
The current implementation updates pantry state in application logic. A production-grade version should wrap meal completion and pantry mutations in database transactions.

## Tradeoffs

I used a custom lightweight JWT implementation to keep the project self-contained. For a production enterprise system, I would replace this with a managed identity provider such as Cognito, Auth0, or an internal SSO platform.

I used MongoDB Atlas rather than self-hosted MongoDB. This reduces operational complexity around backups, patching, replication, and connectivity. The tradeoff is reliance on a managed external database provider.

I used JSON-based LLM orchestration instead of fine-tuning or complex agent workflows. This is portable across OpenRouter and OpenAI-compatible providers, but it requires defensive normalization because model output cannot be trusted blindly.

I kept the backend as a traditional Express API. Serverless functions could reduce idle cost, but an API service better reflects the stateful domain orchestration and makes the backend easier to reason about during development.

I chose simple deployment primitives over full infrastructure-as-code. The repository contains Netlify and Render configuration for repeatable deployment, while leaving room to evolve into Terraform/CDK if the system grows.

## Deployment Architecture

The application is designed to run in a low-friction hosted setup:

```text
Frontend: Netlify
Backend: Render
Database: MongoDB Atlas
AI Provider: OpenRouter or OpenAI-compatible API
```

The same architecture can also be expressed with AWS services:

```text
Frontend: AWS Amplify or S3 + CloudFront
Backend: EC2, App Runner, or ECS
Database: MongoDB Atlas
Observability: CloudWatch
Secrets: AWS Parameter Store or Secrets Manager
```

I kept the code environment-driven so the hosting provider can change without rewriting the application.

## Production Improvements

In a production implementation, I would prioritize the following improvements:

- Replace custom JWT handling with managed identity and refresh-token lifecycle.
- Add request validation with a schema validator such as Zod or Joi.
- Add MongoDB transactions around meal completion and pantry deduction.
- Add rate limiting and abuse protection around AI generation endpoints.
- Move provider secrets to a managed secret store.
- Add structured logs, request IDs, provider latency metrics, and fallback-rate monitoring.
- Add CI/CD checks for tests, build validation, dependency scanning, and container scanning.
- Add tenant-aware data modeling for organization-level isolation.
- Add asynchronous generation for longer-running AI requests.
- Add a provider abstraction capable of retries, model fallback, and cost-aware routing.

## Repository Notes

The repository includes deployment support files:

- `netlify.toml` for the Vite frontend.
- `render.yaml` for the Express backend.
- `amplify.yml` and `server/Dockerfile` for an optional AWS/container deployment path.
- `.env.example` files for documenting required runtime configuration without committing secrets.

Environment variables are intentionally excluded from source control. The `.gitignore` excludes `.env`, `node_modules`, build output, and log files.

## Local Validation

The project includes focused unit tests for server middleware, authentication utilities, pantry deduction logic, client state reducers, and meal math helpers. The current validation flow is:

```bash
npm run build --prefix client
npm test --prefix server
npm test --prefix client
```

These checks verify that the deployable client builds successfully and that the main domain/state logic remains stable.
