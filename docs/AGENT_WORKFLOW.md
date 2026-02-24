# Agentic API Testing Workflow

This document standardizes the agentic workflow for API testing using the democratize-quality MCP server integrated with GitHub Copilot.

## Table of Contents

- [Overview](#overview)
- [Setup Instructions](#setup-instructions)
- [MCP Server Configuration](#mcp-server-configuration)
- [Workflow Steps](#workflow-steps)
- [Example: Product Service Test Plan](#example-product-service-test-plan)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## Overview

This workflow leverages AI agents through the Model Context Protocol (MCP) to automate API test planning, execution, and reporting. The democratize-quality MCP server provides tools for:

- **API Planning**: Analyze OpenAPI/Swagger schemas and generate comprehensive test plans
- **API Execution**: Execute API tests with validation and session management
- **Report Generation**: Create HTML reports with detailed request/response logs
- **Test Healing**: Automatically debug and fix failing tests

---

## Setup Instructions

### Prerequisites

- Node.js and npm installed
- VS Code with GitHub Copilot extension
- Microservices running (see main README.md)

### Installation

The MCP servers are configured to run via `npx`, so no installation is required. They will be automatically downloaded and executed when needed.

---

## MCP Server Configuration

### Configuration File: `.vscode/mcp.json`

This file configures the MCP servers available to GitHub Copilot agents:

```json
{
  "servers": {
    "democratize-quality": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "@democratize-quality/mcp-server@latest"
      ],
      "cwd": "${workspaceFolder}",
      "env": {
        "OUTPUT_DIR": "./api-test-reports"
      }
    },
    "accessibility-mcp": {
      "command": "npx",
      "args": [
        "@democratize-quality/accessibility-mcp@latest",
        "--output-dir",
        "accessibility-reports",
        "--headless",
        "false"
      ],
      "type": "stdio"
    }
  },
  "inputs": []
}
```

### Key Configuration Elements

| Parameter | Description |
|-----------|-------------|
| `type` | Connection type (`stdio` for standard input/output) |
| `command` | Command to execute (`npx` for on-demand package execution) |
| `args` | Arguments passed to the command |
| `cwd` | Working directory for the MCP server |
| `env` | Environment variables (e.g., `OUTPUT_DIR` for report location) |

### Environment Variables

- **OUTPUT_DIR**: Directory where API test reports are saved (default: `./api-test-reports`)
- **Accessibility Reports**: Saved to `./accessibility-reports` as configured in args

---

## Workflow Steps

### 1. API Test Planning

Generate a comprehensive test plan from an API schema:

**Copilot Prompt:**
```
Analyze the [Service Name] API documentation at http://localhost:[PORT]/api-docs. 
Create a comprehensive test plan for the API with Endpoint as http://localhost:[PORT]/api/, 
covering both success and invalid input scenarios.
```

**What happens:**
1. Copilot invokes `api_planner` tool
2. Tool fetches OpenAPI schema from `/api-docs.json`
3. Generates test plan with realistic sample data
4. Saves plan to `./tests/[service]-test-plan.md`

**Example Services:**
- Product Service: `http://localhost:3001`
- Cart Service: `http://localhost:3002`
- Order Service: `http://localhost:3003`

### 2. Test Execution

Execute tests from the generated test plan:

**Copilot Prompt:**
```
Using the test plan you just created, execute Happy path tests in a session 
named [session-name] and provide HTML report after completing the execution.
```

**What happens:**
1. Copilot executes API requests using `api_request` tool
2. Validates responses against expected status codes
3. Stores results in named session
4. Generates HTML report with `api_session_report` tool

### 3. Report Analysis

Review the generated HTML report:

- **Location**: `./api-test-reports/[session-name]-report.html`
- **Contents**: 
  - Request/response details
  - Validation results
  - Timing metrics
  - Success rate statistics

### 4. Test Healing (Optional)

If tests fail, use the healing capability:

**Copilot Prompt:**
```
Debug and fix the failing tests in session [session-name]
```

---

## Example: Product Service Test Plan

### Generated Test Plan

Below is the actual test plan generated for the Product Service by running `api_planner` against `http://localhost:3001/api-docs.json`:

---

# Product Service API

## API Overview

API documentation for the Product Management microservice

- **Base URL**: `http://localhost:3001/api/`
- **Version**: 1.0.0
- **Total Endpoints**: 4
- **Total Test Scenarios**: 11

## 1. GET /api/products

Get all products

### 1.1 get__api_products - Happy Path
**Endpoint:** `GET /api/products`

**Description:** Get all products

**Query Parameters:**
```json
{
  "category": "string_value",
  "minPrice": 123.45,
  "maxPrice": 123.45,
  "inStock": true,
  "search": "string_value",
  "page": 1,
  "limit": 20
}
```

**Expected Response:**
- Status Code: 200

---

## 2. POST /api/products

Create a new product

### 2.1 post__api_products - Happy Path
**Endpoint:** `POST /api/products`

**Description:** Create a new product

**Request Body:**
```json
{
  "id": "prod_123",
  "name": "Organic Bananas",
  "price": 2.99,
  "description": "Fresh organic bananas",
  "image": "https://example.com/images/banana.jpg",
  "dataAiHint": "fruit, organic, potassium",
  "category": "fruits",
  "inStock": true
}
```

**Expected Response:**
- Status Code: 201

---

### 2.2 POST - Invalid Request Data
**Endpoint:** `POST /api/products`

**Description:** Test validation of malformed request data

**Request Body:**
```json
{
  "invalid": "data"
}
```

**Expected Response:**
- Status Code: 400

---

### 2.3 POST - Large Payload
**Endpoint:** `POST /api/products`

**Description:** Test handling of large request payloads

**Request Body:**
```json
{
  "largeField": "xxxxxx... [truncated for brevity]"
}
```

**Expected Response:**
- Status Code: 200 or 201 or 413

---

### 2.4 POST - Empty Payload
**Endpoint:** `POST /api/products`

**Description:** Test handling of empty request payload

**Request Body:**
```json
{}
```

**Expected Response:**
- Status Code: 200 or 201 or 400

---

## 3. GET /api/products/{id}

Get product by ID

### 3.1 get__api_products__id_ - Happy Path
**Endpoint:** `GET /api/products/{id}`

**Description:** Get product by ID

**Expected Response:**
- Status Code: 200

---

### 3.2 GET - Resource Not Found
**Endpoint:** `GET /api/products/99999`

**Description:** Test behavior with non-existent resource ID

**Expected Response:**
- Status Code: 404

---

## 4. GET /api/health

Health check

### 4.1 get__api_health - Happy Path
**Endpoint:** `GET /api/health`

**Description:** Health check

**Expected Response:**
- Status Code: 200

---

## 5. Security Testing

Test security measures and vulnerability protections

### 5.1 SQL Injection Protection
**Endpoint:** `GET /vulnerable-endpoint`

**Description:** Test protection against SQL injection attacks

**Query Parameters:**
```json
{
  "search": "'; DROP TABLE users; --"
}
```

**Expected Response:**
- Status Code: 200 or 400

---

### 5.2 XSS Protection
**Endpoint:** `POST /user-input`

**Description:** Test protection against XSS attacks

**Request Body:**
```json
{
  "content": "<script>alert(\"xss\")</script>"
}
```

**Expected Response:**
- Status Code: 200 or 201 or 400

---

### 5.3 CSRF Protection
**Endpoint:** `POST /sensitive-action`

**Description:** Test CSRF protection mechanisms

**Headers:**
```json
{
  "Origin": "https://malicious-site.com"
}
```

**Expected Response:**
- Status Code: 403 or 400

---

### Test Plan Insights

**Coverage Analysis:**
- ✅ Happy path scenarios for all endpoints
- ❌ Error handling (404, 400 responses)
- 🔒 Security testing (SQL injection, XSS, CSRF)
- 🧪 Edge cases (large payloads, empty payloads)
- 📊 Total: 11 test scenarios across 4 endpoints

---

## Best Practices

### 1. Session Naming Convention

Use descriptive session names for better organization:
- `sanity-test` - Basic smoke tests
- `[service]-regression` - Full regression suite
- `[feature]-validation` - Feature-specific tests
- `security-audit` - Security-focused tests

### 2. Test Execution Order

1. **Health Check**: Verify service is running
2. **GET Endpoints**: Test read operations first
3. **POST/PUT/DELETE**: Test write operations with valid data
4. **Error Cases**: Test invalid inputs and edge cases
5. **Security**: Run security tests last

### 3. Report Organization

Store reports in a consistent structure:
```
api-test-reports/
├── sanity-test-report.html
├── cart-service-regression-report.html
└── product-service-validation-report.html
```

### 4. Realistic Test Data

The `api_planner` tool generates context-aware sample data:
- Valid IDs, emails, dates
- Realistic product names and descriptions
- Proper data types and formats

Review and adjust sample data based on your actual database contents.

---

## Troubleshooting

### MCP Server Not Loading

**Symptom**: Copilot doesn't recognize API testing tools

**Solution**:
1. Check `.vscode/mcp.json` exists and is valid JSON
2. Reload VS Code window: `Ctrl+Shift+P` → "Developer: Reload Window"
3. Verify npx is available: `npx --version` in terminal
4. Check Copilot Chat settings allow MCP servers

### Invalid Schema Detection

**Symptom**: "Unable to detect schema type" error

**Solution**:
1. Verify API documentation endpoint exists: `http://localhost:[PORT]/api-docs`
2. Use `/api-docs.json` endpoint instead of `/api-docs`
3. Ensure microservice is running: Check `http://localhost:[PORT]/api/health`

### Test Failures

**Symptom**: Tests fail with 404 or validation errors

**Solution**:
1. Verify microservices are running: `npm run microservices:start:win`
2. Check base URL in test plan matches actual API endpoint
3. Use real product IDs from database (not sample IDs from plan)
4. Run tests in correct order (GETs before POSTs)

### Report Generation Issues

**Symptom**: Report not created or empty

**Solution**:
1. Check `OUTPUT_DIR` in `.vscode/mcp.json` points to valid directory
2. Ensure session ID matches between execution and report generation
3. Verify at least one API request was executed in the session

---

## Additional Resources

- **MCP Server Repository**: https://github.com/democratize-quality/mcp-server
- **API Documentation**: See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **Microservices Setup**: See main [README.md](../README.md)

---

## Version History

| Date | Version | Changes |
|------|---------|---------|
| 2026-02-25 | 1.0.0 | Initial workflow documentation with Product Service example |

---

**Last Updated**: February 25, 2026
