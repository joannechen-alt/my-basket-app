# Integration Test Prompt Template (Playwright API Flows)

Use this template to generate **Playwright `request`-first integration tests** validating cross-service API flows (Product → Cart → Order, plus API Gateway routing). Prefer API flows over UI.

---

## ROLE
You are a Senior SDET specializing in Node.js microservices integration testing using Playwright API flows.

---

## CONTEXT (MyBasket App)
**Default local base URLs (override via env vars):**
- Gateway: `${process.env.API_BASE_URL ?? "http://localhost:3000"}`
- Product: `${process.env.PRODUCT_BASE_URL ?? "http://localhost:3001"}`
- Cart: `${process.env.CART_BASE_URL ?? "http://localhost:3002"}`
- Order: `${process.env.ORDER_BASE_URL ?? "http://localhost:3003"}`
- AI: `${process.env.AI_BASE_URL ?? "http://localhost:3004"}`

Prefer routing via gateway when validating orchestration; call services directly only when needed.

---

## GOAL
Generate a Playwright integration test suite that validates:
- API gateway routing + health
- Cart lifecycle integrity
- Checkout/order creation integrity across services
- Negative contracts (400/404) for key endpoints

---

## INPUTS (Fill These In)
- Target branch/commit: `<branch-or-sha>`
- Environment: `<local|staging|prod>`
- Base URLs: `<env vars / URLs>`
- Hot paths / regressions: `<bug ids / notes>`
- Definition of done:
  - required flows: `<list>`
  - required artifacts: `<list>`
  - required schema checks: `<list>`

---

## GUARDRAILS (Must Follow)
1. **API-first only**: use Playwright `request` fixture; no UI.
2. **Fast**: no sleeps/timeouts; keep suites lean.
3. **Idempotent**: cleanup created entities (at minimum: clear cart for `userId`).
4. **Diagnostics**: no `console.log`. On failure attach request/response + computed totals via `testInfo.attach()`.
5. **Contract drift**: assert status codes + required response keys/types.

---

## FLOW REQUIREMENTS
Pick and implement these flows as tests (separate `test()` blocks):

### Flow A — Gateway smoke/routing
- `GET /health` and at least one routed call per service.

### Flow B — Cart lifecycle
- Ensure empty cart → add item (use real product) → update qty → remove → clear → verify empty.

### Flow C — Checkout/create order integrity
- Add product(s) to cart → compute expected total $\sum(price\times qty)$ → create order → verify items + total.

### Flow D — Negative contracts
- At least one 400 and one 404 case for key endpoints.

---

## EXPECTED OUTPUT (Strict)
- Emit **code only** (no explanation).
- Place tests under: `tests/tests/integration/*.spec.ts`
- No `test.only()` / `test.skip()` / `console.log()`.
- Include a `// filepath: ...` header at top of emitted file.
