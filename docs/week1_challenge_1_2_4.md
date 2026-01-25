# Week 1 Challenge 1.2.4 - API Gateway Rate Limiting

## 📋 Task

Use the `@workspace` command to find where the **API Gateway** defines its rate-limiting or routing rules.

## 📍 Location

```
microservices/api-gateway/src/index.ts
```

## ❓ Question

**How many requests per minute are allowed before the Gateway returns a 429 error?**

## ✅ Answer

Approximately **66.67 requests per minute** are allowed before the Gateway returns a 429 error.

## 🧮 Calculation

- **Time Window:** 15 minutes (900 seconds)
- **Max Requests:** 1,000 requests per 15 minutes
- **Per Minute:** 1,000 ÷ 15 = **~66.67 requests/minute**

## ⚙️ How It Works

| Aspect | Details |
|--------|---------|
| **Rate Limit Scope** | Applied per IP address (not global) |
| **Window Type** | Rolling window of 15 minutes |
| **Error Response** | HTTP 429 (Too Many Requests) |
| **Error Message** | "Too many requests from this IP, please try again later." |

## 🔍 Key Takeaways

- Rate limiting is implemented at the **IP address level**
- Uses a **rolling window** approach (more flexible than fixed windows)
- Designed to prevent abuse while allowing reasonable usage patterns
- Returns clear error messages to help clients understand the limitation