# Test cases — Today’s Recipe

## Profile & preferences

| ID | Scenario | Steps | Expected |
|----|-----------|-------|----------|
| P1 | Load default profile | Open Profile with valid `X-Client-Id` | Dietary preference, calorie target, and meal defaults load or create |
| P2 | Save dietary preference | Set Vegan, Save | `PUT /api/profile` persists; reload shows Vegan |
| P3 | Allergies | Add “peanuts”, “dairy”, Save | Stored array returned on GET |
| P4 | Health goal + calories | Set weight loss, target 1800 | Values persist |
| P5 | Meal distribution | Choose heavy breakfast | Persists and influences stub meal calories |

## Home

| ID | Scenario | Steps | Expected |
|----|-----------|-------|----------|
| H1 | Navigation | From Home, click Pantry, Today’s Plan, Profile | Correct routes |
| H2 | Hero | Open Home | Banner/intro visible |
| H3 | Highlights | With DB on, load Home | Popular + newly generated sections render |

## Dashboard

| ID | Scenario | Steps | Expected |
|----|-----------|-------|----------|
| D1 | Empty plan | No plan for today | Consumed 0, remaining = target |
| D2 | Complete breakfast | Today’s Plan: check breakfast | Dashboard consumed increases by breakfast calories |
| D3 | Pantry summary | Add pantry items | Dashboard shows count and sample list |
| D4 | Weekly chart | Open Dashboard | Bar chart shows 7 days (zeros if no data) |

## Pantry

| ID | Scenario | Steps | Expected |
|----|-----------|-------|----------|
| PA1 | Add item | Name + quantity + unit | Appears in list |
| PA2 | Update quantity | Edit item | PATCH persists |
| PA3 | Delete | Remove item | DELETE removes row |
| PA4 | Serving people | Set default serving on Profile | Used as default in Today’s Plan generate |

## Today’s Plan (AI + sync)

| ID | Scenario | Steps | Expected |
|----|-----------|-------|----------|
| T1 | Generate | Click Generate meal plan | Breakfast/Lunch/Dinner populated |
| T2 | Refresh | Click Refresh plan | Plan replaced, completions reset |
| T3 | Complete meal | Check breakfast | Calories on Dashboard update; pantry quantities drop |
| T4 | Uncheck meal | Uncheck after complete | Pantry restored; consumed calories decrease |
| T5 | OpenAI | Set `OPENAI_API_KEY`, generate | `source: openai` when API succeeds |

## API / errors

| ID | Scenario | Steps | Expected |
|----|-----------|-------|----------|
| A1 | Missing client id | Call API without header | 400 |
| A2 | No MongoDB | Mutate profile with no `MONGODB_URI` | 503 with clear message |

## Automated tests

Run:

- Server: `npm run test --prefix server`
- Client: `npm run test --prefix client`
