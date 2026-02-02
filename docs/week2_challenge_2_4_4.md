# Week 2 Challenge 2.4.4 - Quality Audit Day

## 📋 Overview

Audit test files for security vulnerabilities, bad practices, and technical debt using the `ai_guard.py` script.

## 🎯 Objectives

- ✅ Detect hardcoded secrets (passwords, API keys, tokens)
- ✅ Identify bad practices (console.logs, TODOs, skipped tests)
- ✅ Find Playwright antipatterns (waitForTimeout, .first().click())
- ✅ Generate actionable audit reports

---

## 📁 Files Created

### 1. Main Audit Script

**File:** [`ai_guard.py`](../ai_guard.py)

Python-based auditor that scans TypeScript/JavaScript files for:
- Hardcoded secrets and credentials
- Flaky test patterns
- Technical debt markers

### 2. Helper Scripts

**Unix/Mac/Linux:** [`scripts/run-audit.sh`](../scripts/run-audit.sh)

```bash
chmod +x scripts/run-audit.sh
./scripts/run-audit.sh
```

**Windows:** [`scripts/run-audit.bat`](../scripts/run-audit.bat)

```cmd
.\scripts\run-audit.bat
```

### 3. Audit Reports Directory

**Folder:** [`audit/`](../audit/)

Automatically created to store audit results:
- `audit_report_YYYYMMDD_HHMMSS.md` - Timestamped Markdown reports
- `audit_report_YYYYMMDD_HHMMSS.json` - Timestamped JSON reports
- `latest.md` - Most recent audit report (human-readable)
- `latest.json` - Most recent audit data (machine-readable)
- `README.md` - Documentation for audit folder

> ⚠️ **Note:** This folder is added to `.gitignore` to prevent committing sensitive findings.

---

## 🔍 Detection Patterns

### 🚨 Critical - Secrets

- Hardcoded passwords: `password = "Production@2024!"`
- API keys: `apiKey = "sk_live_123..."`
- Auth tokens: `token = "Bearer eyJhbGc..."`
- Email addresses: `admin@gmail.com`

### ⚠️ Warnings - Antipatterns

- `waitForTimeout(5000)` → Use `page.waitForLoadState()`
- `.first().click()` → Verify element first
- `.skip()` / `.only()` → Reduces test coverage
- `console.log()` → Use proper logging

### 📋 Technical Debt

- `TODO:` comments → Track in issues
- `@ts-ignore` → Weakens type safety
- `setTimeout` → Creates flaky tests

---

## 🚀 Usage

### Quick Start

```bash
# Scan all test directories (results saved to audit/ folder)
npm run audit:tests

# Or use helper scripts
./scripts/run-audit.sh              # Unix/Mac/Linux
.\scripts\run-audit.bat             # Windows

# Or directly with Python
python3 ai_guard.py
```

### View Audit Results

```bash
# View latest report (Markdown)
cat audit/latest.md              # Unix/Mac/Linux
type audit\latest.md             # Windows

# View latest JSON data
cat audit/latest.json            # Unix/Mac/Linux
type audit\latest.json           # Windows
```

### Scan Specific Files/Directories

```bash
# Single file
python3 ai_guard.py microservices/cart-service/auth_test_temp.ts

# Directory
python3 ai_guard.py tests/

# Specific service
python3 ai_guard.py microservices/cart-service/src/
```

### Monitored Directories

- `tests/` - Playwright E2E tests
- `microservices/*/src/` - All microservice tests

---

## 📊 Sample Output

### Example: Issues Detected

```bash
🔍 AI GUARD - TEST FILE AUDIT REPORT
================================================================================

📄 File: tests/tests/cart/api_UI_integration.spec.ts
   Lines: 122

📋 BAD PRACTICES / TECHNICAL DEBT:
   Line 24: Console log statement
   → console.log('Cart cleanup failed:', error);

================================================================================
📊 SUMMARY
Files scanned: 8
🚨 Critical secrets: 0
⚠️  Playwright antipatterns: 0
📋 Bad practices: 20
Total issues: 20

⚠️  WARNINGS - Consider addressing these issues

================================================================================
💾 AUDIT RESULTS SAVED
================================================================================
📄 Markdown Report: audit/audit_report_20260202_143933.md
📊 JSON Report: audit/audit_report_20260202_143933.json
📌 Latest Report: audit/latest.md
📌 Latest JSON: audit/latest.json
```

### Example: Clean Audit

```bash
✅ No issues found! Your tests look clean.
```

---

## 🔧 Configuration

### NPM Scripts (in [`package.json`](../package.json))

```json
{
  "scripts": {
    "audit:tests": "python3 ai_guard.py",
    "audit:win": "python ai_guard.py",
    "audit:unix": "./scripts/run-audit.sh"
  }
}
```

### Severity Levels

| Level | Exit Code | Action Required |
|-------|-----------|-----------------|
| 🚨 Critical (Secrets) | 1 | Must fix before commit |
| ⚠️ Warning (Antipatterns) | 0 | Should fix soon |
| ✅ Pass | 0 | All clear |

---

## 📈 Actual Audit Results (Latest Run)

### Summary

- **Files Scanned:** 8
- **Critical Secrets:** 0 ✅
- **Playwright Antipatterns:** 0 ✅
- **Bad Practices:** 20 ⚠️
- **Status:** Warnings (no blocking issues)

### Issues Found

#### 1. Console.log Statements (16 instances)

Found in test files and service startup code:
- [`tests/tests/cart/api_UI_integration.spec.ts`](../tests/tests/cart/api_UI_integration.spec.ts) - Line 24
- [`tests/tests/checkout/checkout_ai_generated.spec.ts`](../tests/tests/checkout/checkout_ai_generated.spec.ts) - Lines 28, 54, 193
- [`tests/tests/checkout/checkout_refined.spec.ts`](../tests/tests/checkout/checkout_refined.spec.ts) - Lines 28, 44, 158
- All microservice entry points (`index.ts`) - Startup logging

**Recommendation:** Replace with proper logging framework (e.g., Winston, Pino)

#### 2. setTimeout Usage (1 instance)

Found in [`microservices/cart-service/src/service.test.ts`](../microservices/cart-service/src/service.test.ts) - Line 142

```typescript
await new Promise(resolve => setTimeout(resolve, 10));
```

**Recommendation:** Use proper async waiting mechanisms or test utilities

### Previous Issue Resolved ✅

**Hardcoded Production Credentials** in `auth_test_temp.ts` - **FIXED**
- File has been removed or credentials replaced with environment variables

---

## ✅ Best Practices

### DO:

- ✅ Run audit before every commit
- ✅ Use environment variables for credentials
- ✅ Fix critical issues immediately
- ✅ Use `page.waitForLoadState()` instead of `waitForTimeout`

### DON'T:

- ❌ Commit hardcoded secrets
- ❌ Ignore audit warnings
- ❌ Leave TODO comments untracked
- ❌ Use `.skip()` without documentation

---

## 🔄 CI/CD Integration

### Pre-commit Hook

```bash
#!/bin/bash
# .git/hooks/pre-commit

python3 ai_guard.py
if [ $? -ne 0 ]; then
  echo "❌ Audit failed! Fix issues before committing."
  exit 1
fi
```

### GitHub Actions

```yaml
name: Quality Audit
on: [push, pull_request]

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run AI Guard
        run: python3 ai_guard.py
```

---

## 🤝 Extending the Auditor

Add new patterns in [`ai_guard.py`](../ai_guard.py):

```python
self.secret_patterns = [
    (r'your-pattern-here', 'Description'),
]

self.bad_practices = [
    (r'your-pattern-here', 'Description'),
]
```

Test changes:

```bash
python3 ai_guard.py tests/
```

---

## 📚 Resources

- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [OWASP Secret Management](https://owasp.org/www-community/vulnerabilities/Use_of_hard-coded_password)

---

## 📝 Summary

**Implementation:**
- ✅ AI Guard Python script created
- ✅ Cross-platform helper scripts (Unix/Windows)
- ✅ Automatic report saving to `audit/` folder
- ✅ Both JSON and Markdown report formats
- ✅ Timestamped reports with latest symlinks

**Latest Audit Results:**
- ✅ **0 critical secrets** detected
- ✅ **0 Playwright antipatterns** found
- ⚠️ **20 bad practices** identified (console.logs, setTimeout)
- ✅ All findings documented in [`audit/latest.md`](../audit/latest.md)

**Next Steps:**
- 🔧 Replace console.log with proper logging framework
- 🔧 Remove setTimeout from test code
- 🔄 Integrate into pre-commit hooks
- 🔄 Add to CI/CD pipeline

**Status:** 🎯 Complete

---

**Challenge:** Week 2.4.4 - Quality Audit Day  
**Last Updated:** February 2, 2026  
**Latest Audit Run:** February 2, 2026 14:39:33