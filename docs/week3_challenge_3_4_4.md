# 🚨 Dos & Don'ts: Vague Prompts = Dangerous Code

## Challenge 3.4.4 Observation - Posted to #daily-challenge

---

### ❌ **DON'T Say This:**
```
"Fix the Order status logic."
```

**What Happened:**
- AI hallucinated 4 new order statuses (PENDING_PAYMENT, PAYMENT_FAILED, ON_HOLD, RETURNED)
- Removed ALL status transition validation (any status → any status now possible!)
- Deleted safety checks preventing cancellation of shipped/delivered orders
- Modified 2 files, changed ~30 lines
- Result: Critical business logic destroyed ⚠️

---

### ✅ **DO Say This Instead:**
```
In microservices/order-service/src/service.ts, update the 
isValidStatusTransition method to allow PROCESSING status 
to transition back to CONFIRMED status in addition to its 
current transitions. This is needed for payment re-authorization. 
Only modify the validation logic, do not change other methods 
or add new statuses.
```

**What Happened:**
- AI made a surgical change: added ONE transition (PROCESSING → CONFIRMED)
- Added inline comment explaining why
- Preserved all existing validation logic
- Modified 1 file, changed 1 line
- Result: Safe, reviewable, correct implementation ✅

---

## 📊 The Comparison

| Metric | Vague Prompt | Specific Prompt |
|--------|--------------|-----------------|
| Lines Changed | ~30 | 1 |
| Files Modified | 2 | 1 |
| Business Logic Broken | 3 methods | 0 |
| Hallucinated Features | 4 statuses | 0 |
| Review Time | Hours | Minutes |
| Safe for Production | ❌ NO | ✅ YES |

---

## 🎯 Key Takeaway

**Agent Mode makes you a code reviewer, not a code writer.**

Your skill in **reading and reviewing** AI-generated code must exceed your skill in writing it.

### The Formula for Safe AI Prompts:
1. **Exact file path** → prevents wrong files being modified
2. **Exact method/function** → prevents unintended changes  
3. **Exact requirement** → prevents hallucinations
4. **Business context** → ensures correct implementation
5. **Clear constraints** → prevents scope creep

---

## 🔥 Real-World Impact

**Vague Prompt Disaster:**
- E-commerce site allows cancelling delivered orders
- Refunded orders get marked as shipped again
- Estimated damage: 2 weeks of rollback + fixes

**Specific Prompt Success:**
- One line change, deployed in 1 hour
- Zero breaking changes
- Time saved: 95%

---

## 💡 Remember

> "Don't say 'Fix it', say 'Update file X to handle condition Y'"

**Specificity = Safety**

---

**Challenge Completed:** Week 3, Day 4, Task 4  
**Documentation:** [Full analysis in docs/week3_challenge_3_4_4.md](../docs/week3_challenge_3_4_4.md)  
**Status:** ✅ Lesson learned - Always be specific with AI agents!
