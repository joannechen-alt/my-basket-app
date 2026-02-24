# Week 3 Challenge 3.2.4

## Standardize Agentic API Testing Workflow

### Task Overview

Create documentation to standardize the agentic API testing workflow for the team using the democratize-quality MCP server with GitHub Copilot.

---

## What Was Accomplished

### 1. Created Workflow Documentation

**File:** `docs/AGENT_WORKFLOW.md`

A comprehensive guide that documents:
- MCP server configuration
- Complete workflow steps
- Test plan generation process
- Best practices and troubleshooting

### 2. Documented MCP Configuration

**File Referenced:** `.vscode/mcp.json`

The documentation includes the complete MCP server setup:

```json
{
  "servers": {
    "democratize-quality": {
      "type": "stdio",
      "command": "npx",
      "args": ["@democratize-quality/mcp-server@latest"],
      "cwd": "${workspaceFolder}",
      "env": {
        "OUTPUT_DIR": "./api-test-reports"
      }
    }
  }
}
```

**Key Configuration Elements:**
- Uses `npx` for on-demand execution (no installation needed)
- Outputs reports to `./api-test-reports`
- Runs in workspace folder context

### 3. Generated Product Service Test Plan

**Command Used:**
```
Analyze the Product Service API documentation at http://localhost:3001/api-docs. 
Create a comprehensive test plan covering both success and invalid input scenarios.
```

**Tool Invoked:** `api_planner`

**Schema URL:** `http://localhost:3001/api-docs.json`

**Generated Output:**
- Test Plan File: `tests/product-service-test-plan.md`
- Embedded in: `docs/AGENT_WORKFLOW.md` (Section: "Example: Product Service Test Plan")

**Test Coverage:**
- 4 API endpoints
- 11 test scenarios
- Happy path tests
- Error handling (404, 400)
- Security tests (SQL injection, XSS, CSRF)
- Edge cases (large payloads, empty payloads)

---

## Key Sections in AGENT_WORKFLOW.md

### 1. Overview
Introduction to agentic API testing with MCP servers

### 2. Setup Instructions
Prerequisites and installation steps

### 3. MCP Server Configuration
Detailed breakdown of `.vscode/mcp.json` settings

### 4. Workflow Steps
1. **API Test Planning** - Generate test plans from OpenAPI schemas
2. **Test Execution** - Execute tests with session management
3. **Report Analysis** - Review HTML reports
4. **Test Healing** - Auto-fix failing tests

### 5. Example: Product Service Test Plan
Complete test plan generated from Product Service API:
- GET /api/products (with query parameters)
- POST /api/products (create product)
- GET /api/products/{id} (get by ID)
- GET /api/health (health check)

### 6. Best Practices
- Session naming conventions
- Test execution order
- Report organization
- Realistic test data usage

### 7. Troubleshooting
Common issues and solutions:
- MCP server not loading
- Invalid schema detection
- Test failures
- Report generation issues

---

## How to Use This Workflow

### Step 1: Generate Test Plan
Ask Copilot:
```
Analyze the [Service Name] API at http://localhost:[PORT]/api-docs 
and create a comprehensive test plan
```

### Step 2: Execute Tests
Ask Copilot:
```
Execute the happy path tests with session name [session-name] 
and generate an HTML report
```

### Step 3: Review Report
Check the generated HTML report at:
```
./api-test-reports/[session-name]-report.html
```

---

## Services Available for Testing

| Service | Port | API Docs URL |
|---------|------|--------------|
| Product Service | 3001 | http://localhost:3001/api-docs |
| Cart Service | 3002 | http://localhost:3002/api-docs |
| Order Service | 3003 | http://localhost:3003/api-docs |

---

## Example Test Session

A sanity test was executed for the Cart Service:
- **Session Name:** `sanity-test`
- **Tests Run:** 5 requests
- **Success Rate:** 80%
- **Report:** `api-test-reports/sanity-test-report.html`

**Tests Executed:**
1. ✅ GET /api/health - Health check (200 OK)
2. ✅ GET /api/cart/user_123 - Get user cart (200 OK)
3. ✅ GET /api/products - Get products list (200 OK)
4. ✅ POST /api/cart/user_123/items - Add product to cart (200 OK)

---

## Benefits of This Workflow

1. **Automated Test Planning** - AI generates comprehensive test scenarios from API schemas
2. **Realistic Test Data** - Context-aware sample data (names, emails, IDs, dates)
3. **Session Management** - Organize tests by feature, service, or purpose
4. **Detailed Reporting** - HTML reports with request/response logs and metrics
5. **Self-Healing Tests** - AI can debug and fix failing tests
6. **No Code Required** - Natural language prompts to Copilot

---

## Files Created/Modified

| File | Purpose |
|------|---------|
| `docs/AGENT_WORKFLOW.md` | Complete workflow documentation |
| `tests/product-service-test-plan.md` | Product Service test plan |
| `tests/cart-service-test-plan.md` | Cart Service test plan |
| `api-test-reports/sanity-test-report.html` | Example test execution report |

---

## Next Steps for Team

1. Review the `docs/AGENT_WORKFLOW.md` documentation
2. Try generating test plans for other services (Cart, Order)
3. Execute tests using named sessions
4. Review HTML reports for insights
5. Share best practices and learnings

---

