## Prompts:

ROLE

As a Senior QA Engineer specializing in microservices... 
CONTEXT
- Application: MyBasket Lite
- Target Logic: `createOrder` in #file:microservices/order-service/src/service.ts.
- Endpoints: POST /api/orders(Port 3003) 

TASK

Generate a comprehensive set of manual test cases for the create order logic. 

CONSTRAINTS

1. Include Positive (happy path), Negative (invalid inputs), and Edge cases (empty results).
2. You must include a "Data Integrity" section in your prompt that checks if the order total matches the sum of cart items..
3. Format as a Markdown table with: Test ID, Description, Steps, and Expected Result.


## Results:
# 🧪 Order Creation Test Cases - MyBasket Lite

## 📋 Test Information
- **Component**: Order Service
- **Target Logic**: `createOrder` method
- **Endpoint**: `POST /api/orders` (Port 3003)
- **File**: `microservices/order-service/src/service.ts`
- **Date**: January 26, 2026

---

## 🧪 Test Cases

| Test ID | Type | Description | Test Steps | Expected Result |
|---------|------|-------------|------------|-----------------|
| **TC-O-001** | Positive | Create order with single item | 1. Send POST request to `/api/orders`<br>2. Body: `{ userId: "user1", items: [{ productId: "p1", name: "Laptop", price: 999.99, quantity: 1 }], shippingAddress: {...}, billingAddress: {...} }`<br>3. Verify response | - Status: 201<br>- Order created successfully<br>- OrderId generated (UUID format)<br>- Status: "PENDING"<br>- totalAmount: 999.99 |
| **TC-O-002** | Positive | Create order with multiple items | 1. Send POST request to `/api/orders`<br>2. Body with 3 items: Mouse ($29.99), Keyboard ($89.99), Monitor ($299.99)<br>3. Verify response | - Status: 201<br>- Order created<br>- totalAmount: 419.97<br>- All items included<br>- Items array length: 3 |
| **TC-O-003** | Positive | Create order with quantity > 1 | 1. Send POST request to `/api/orders`<br>2. Body: `{ userId: "user1", items: [{ productId: "p1", name: "Mouse", price: 29.99, quantity: 5 }], ... }`<br>3. Verify response | - Status: 201<br>- Order created<br>- totalAmount: 149.95 (29.99 × 5)<br>- Quantity correctly multiplied |
| **TC-O-004** | Positive | Create order with decimal prices | 1. Send POST request to `/api/orders`<br>2. Body with items: Item1 ($19.99), Item2 ($49.99), Item3 ($30.01)<br>3. Verify response | - Status: 201<br>- totalAmount: 99.99<br>- Decimal precision maintained (2 decimals)<br>- No floating-point rounding errors |
| **TC-O-005** | Positive | Create order with estimated delivery date | 1. Send POST request to `/api/orders`<br>2. Body with valid order data<br>3. Verify response contains estimatedDelivery | - Status: 201<br>- estimatedDelivery is set<br>- Date is 5 days from current date<br>- Date format is ISO 8601 or valid Date object |
| **TC-O-006** | Positive | Create order with valid shipping address | 1. Send POST request to `/api/orders`<br>2. Body includes complete shippingAddress: street, city, state, zip, country<br>3. Verify response | - Status: 201<br>- Order created<br>- shippingAddress preserved in response<br>- All address fields present |
| **TC-O-007** | Positive | Create order with valid billing address | 1. Send POST request to `/api/orders`<br>2. Body includes complete billingAddress<br>3. Verify response | - Status: 201<br>- Order created<br>- billingAddress preserved in response<br>- All address fields present |
| **TC-O-008** | Positive | Multiple orders by same user | 1. Create first order for userId="user1"<br>2. Create second order for same userId<br>3. Verify both orders exist independently | - Status: 201 for both<br>- Two separate orderIds<br>- Both orders retrievable<br>- User can have multiple orders |
| **TC-O-009** | Positive | User cart cleared after order creation | 1. Create order from userId="user2" cart<br>2. Query user cart after order creation<br>3. Verify cart is empty | - Status: 201<br>- Order created successfully<br>- User's cart is cleared<br>- Cart.items array is empty |
| **TC-O-010** | Positive | Order status initialized to PENDING | 1. Send POST request to `/api/orders` with valid data<br>2. Verify response status field | - Status: 201<br>- Order.status: "PENDING"<br>- Not any other status<br>- Can be transitioned later |
| **TC-O-011** | Negative | Create order with empty items array | 1. Send POST request to `/api/orders`<br>2. Body: `{ userId: "user1", items: [], shippingAddress: {...}, billingAddress: {...} }`<br>3. Verify response | - Status: 400 Bad Request<br>- Error message: "Order must contain at least one item"<br>- Order NOT created<br>- No orderId returned |
| **TC-O-012** | Negative | Create order with no items field | 1. Send POST request to `/api/orders`<br>2. Body: `{ userId: "user1", shippingAddress: {...}, billingAddress: {...} }` (missing items)<br>3. Verify response | - Status: 400 Bad Request<br>- Error message indicates missing items field<br>- Order NOT created |
| **TC-O-013** | Negative | Create order without userId | 1. Send POST request to `/api/orders`<br>2. Body: `{ items: [...], shippingAddress: {...}, billingAddress: {...} }` (no userId)<br>3. Verify response | - Status: 400 Bad Request<br>- Error message: "userId is required"<br>- Order NOT created |
| **TC-O-014** | Negative | Create order with null userId | 1. Send POST request to `/api/orders`<br>2. Body: `{ userId: null, items: [...], ... }`<br>3. Verify response | - Status: 400 Bad Request<br>- Error indicates invalid userId<br>- Order NOT created |
| **TC-O-015** | Negative | Create order with empty string userId | 1. Send POST request to `/api/orders`<br>2. Body: `{ userId: "", items: [...], ... }`<br>3. Verify response | - Status: 400 Bad Request<br>- Error indicates invalid userId<br>- Order NOT created |
| **TC-O-016** | Negative | Create order without shippingAddress | 1. Send POST request to `/api/orders`<br>2. Body: `{ userId: "user1", items: [...], billingAddress: {...} }` (no shippingAddress)<br>3. Verify response | - Status: 400 Bad Request<br>- Error message: "shippingAddress is required"<br>- Order NOT created |
| **TC-O-017** | Negative | Create order without billingAddress | 1. Send POST request to `/api/orders`<br>2. Body: `{ userId: "user1", items: [...], shippingAddress: {...} }` (no billingAddress)<br>3. Verify response | - Status: 400 Bad Request<br>- Error message: "billingAddress is required"<br>- Order NOT created |
| **TC-O-018** | Negative | Create order with missing required address fields | 1. Send POST request to `/api/orders`<br>2. Body with incomplete shippingAddress (missing zip or street)<br>3. Verify response | - Status: 400 Bad Request<br>- Error indicates missing address field<br>- Order NOT created |
| **TC-O-019** | Negative | Create order with item missing productId | 1. Send POST request to `/api/orders`<br>2. Body: `{ userId: "user1", items: [{ name: "Mouse", price: 29.99, quantity: 1 }], ... }`<br>3. Verify response | - Status: 400 Bad Request<br>- Error message: "productId is required"<br>- Order NOT created |
| **TC-O-020** | Negative | Create order with item missing name | 1. Send POST request to `/api/orders`<br>2. Body: `{ userId: "user1", items: [{ productId: "p1", price: 29.99, quantity: 1 }], ... }`<br>3. Verify response | - Status: 400 Bad Request<br>- Error message: "Item name is required"<br>- Order NOT created |
| **TC-O-021** | Negative | Create order with item missing price | 1. Send POST request to `/api/orders`<br>2. Body: `{ userId: "user1", items: [{ productId: "p1", name: "Mouse", quantity: 1 }], ... }`<br>3. Verify response | - Status: 400 Bad Request<br>- Error message: "Item price is required"<br>- Order NOT created |
| **TC-O-022** | Negative | Create order with item missing quantity | 1. Send POST request to `/api/orders`<br>2. Body: `{ userId: "user1", items: [{ productId: "p1", name: "Mouse", price: 29.99 }], ... }`<br>3. Verify response | - Status: 400 Bad Request<br>- Error message: "Item quantity is required"<br>- Order NOT created |
| **TC-O-023** | Negative | Create order with negative price | 1. Send POST request to `/api/orders`<br>2. Body with item: `{ productId: "p1", name: "Mouse", price: -29.99, quantity: 1 }`<br>3. Verify response | - Status: 400 Bad Request<br>- Error message: "Item price must be >= 0"<br>- Order NOT created |
| **TC-O-024** | Negative | Create order with zero price | 1. Send POST request to `/api/orders`<br>2. Body with item: `{ productId: "p1", name: "Free Item", price: 0, quantity: 1 }`<br>3. Verify response | - Status: 201 (valid free items)<br>- Order created<br>- totalAmount: 0<br>- Order is valid with free items |
| **TC-O-025** | Negative | Create order with negative quantity | 1. Send POST request to `/api/orders`<br>2. Body with item: `{ productId: "p1", name: "Mouse", price: 29.99, quantity: -5 }`<br>3. Verify response | - Status: 400 Bad Request<br>- Error message: "Quantity must be > 0"<br>- Order NOT created |
| **TC-O-026** | Negative | Create order with zero quantity | 1. Send POST request to `/api/orders`<br>2. Body with item: `{ productId: "p1", name: "Mouse", price: 29.99, quantity: 0 }`<br>3. Verify response | - Status: 400 Bad Request<br>- Error message: "Quantity must be > 0"<br>- Order NOT created |
| **TC-O-027** | Negative | Create order with non-numeric price | 1. Send POST request to `/api/orders`<br>2. Body with item: `{ productId: "p1", name: "Mouse", price: "twenty-nine", quantity: 1 }`<br>3. Verify response | - Status: 400 Bad Request<br>- Error message: "Item price must be a number"<br>- Order NOT created |
| **TC-O-028** | Negative | Create order with non-numeric quantity | 1. Send POST request to `/api/orders`<br>2. Body with item: `{ productId: "p1", name: "Mouse", price: 29.99, quantity: "five" }`<br>3. Verify response | - Status: 400 Bad Request<br>- Error message: "Quantity must be a number"<br>- Order NOT created |
| **TC-O-029** | Negative | Create order with null item in array | 1. Send POST request to `/api/orders`<br>2. Body: `{ userId: "user1", items: [null], shippingAddress: {...}, billingAddress: {...} }`<br>3. Verify response | - Status: 400 Bad Request<br>- Error indicates invalid item<br>- Order NOT created |
| **TC-O-030** | Edge | Create order with very large item quantity | 1. Send POST request to `/api/orders`<br>2. Body with item: `{ productId: "p1", name: "Mouse", price: 29.99, quantity: 999999 }`<br>3. Verify response | - Status: 201<br>- Order created<br>- totalAmount: 29,998,970.01<br>- Large numbers handled correctly |
| **TC-O-031** | Edge | Create order with very small decimal price | 1. Send POST request to `/api/orders`<br>2. Body with item: `{ productId: "p1", name: "Item", price: 0.01, quantity: 1 }`<br>3. Verify response | - Status: 201<br>- Order created<br>- totalAmount: 0.01<br>- Precision maintained (2 decimals) |
| **TC-O-032** | Edge | Create order with many decimal places in price | 1. Send POST request to `/api/orders`<br>2. Body with item: `{ productId: "p1", name: "Item", price: 29.9999, quantity: 1 }`<br>3. Verify response | - Status: 201<br>- Order created<br>- totalAmount rounded to 2 decimals: 30.00<br>- Rounding applied correctly |
| **TC-O-033** | Edge | Create order with many items (stress test) | 1. Send POST request to `/api/orders`<br>2. Body with 100 different items<br>3. Verify response | - Status: 201<br>- Order created<br>- All items included<br>- totalAmount correctly summed |
| **TC-O-034** | Edge | Create order with very large order total | 1. Send POST request to `/api/orders`<br>2. Body with 10 items @ $9,999.99 each<br>3. Verify response | - Status: 201<br>- Order created<br>- totalAmount: 99,999.90<br>- Large totals handled correctly |
| **TC-O-035** | Edge | Duplicate productIds in same order | 1. Send POST request to `/api/orders`<br>2. Body with same productId in 2 different items (different quantities)<br>3. Verify response | - Status: 201<br>- Order created<br>- Both items included separately<br>- Totals calculated correctly |
| **TC-O-036** | Edge | Create order with special characters in product name | 1. Send POST request to `/api/orders`<br>2. Body with item name: "Mouse & Keyboard #1 (Pro)"<br>3. Verify response | - Status: 201<br>- Order created<br>- Special characters preserved in item name<br>- No encoding issues |
| **TC-O-037** | Edge | Create order with very long product name | 1. Send POST request to `/api/orders`<br>2. Body with item name: 500+ character string<br>3. Verify response | - Status: 201 or 400 (depends on validation)<br>- If created: name stored as-is<br>- If rejected: error about max length |
| **TC-O-038** | Edge | Create order with unicode characters in name | 1. Send POST request to `/api/orders`<br>2. Body with item name: "Café ☕ Laptop 中文 العربية"<br>3. Verify response | - Status: 201<br>- Order created<br>- Unicode characters preserved correctly<br>- No character encoding issues |
| **TC-O-039** | Edge | Whitespace in required fields | 1. Send POST request to `/api/orders`<br>2. Body with userId: "   " (spaces only)<br>3. Verify response | - Status: 400 Bad Request<br>- Error indicates invalid userId<br>- Whitespace-only strings rejected |
| **TC-O-040** | Edge | Concurrent order creation (same user) | 1. Simultaneously send 2 POST requests for same userId with different items<br>2. Verify both orders created<br>3. Check cart state | - Status: 201 for both<br>- Two unique orderIds created<br>- No race condition issues<br>- Cart cleared only once (last order wins) |

---

## 💰 Data Integrity Test Cases

### Order Total Validation Against Cart Items

| Test ID | Description | Test Steps | Expected Result |
|---------|-------------|------------|-----------------|
| **TC-DI-001** | Verify total = sum of (price × quantity) | 1. Create order with items: A($10 × 2), B($20 × 1), C($15 × 3)<br>2. Manual calculation: (10×2) + (20×1) + (15×3) = 85<br>3. Verify response totalAmount | ✅ totalAmount = 85.00<br>✅ Matches manual calculation<br>✅ No discrepancies |
| **TC-DI-002** | Verify rounding to 2 decimal places | 1. Create order with items that produce: 99.999<br>2. Verify Math.round(99.999 × 100) / 100<br>3. Check response totalAmount | ✅ totalAmount = 100.00<br>✅ Rounded correctly<br>✅ No floating-point errors |
| **TC-DI-003** | Single item: total = price × quantity | 1. Create order with 1 item: price=$49.99, quantity=3<br>2. Expected total: 49.99 × 3 = 149.97<br>3. Compare with response | ✅ totalAmount = 149.97<br>✅ Calculation correct<br>✅ No variance |
| **TC-DI-004** | Multiple items: sum of individual totals | 1. Create order with 5 items<br>2. Calculate individual totals (price × qty)<br>3. Sum all individual totals<br>4. Compare with response totalAmount | ✅ Response totalAmount = Sum of all item totals<br>✅ No missing items<br>✅ No extra charges |
| **TC-DI-005** | Zero-price items don't inflate total | 1. Create order with items: A($10 × 1), B($0 × 5), C($20 × 1)<br>2. Expected total: 10 + 0 + 20 = 30<br>3. Verify response | ✅ totalAmount = 30.00<br>✅ Free items don't affect total<br>✅ Correct calculation |
| **TC-DI-006** | High-precision decimal handling | 1. Create order with items producing: $19.99 + $49.99 + $30.01 = $99.99<br>2. Verify no rounding errors in intermediate steps<br>3. Check final totalAmount | ✅ totalAmount = 99.99<br>✅ No floating-point precision loss<br>✅ Exact match |
| **TC-DI-007** | Large quantity × small price accuracy | 1. Create order: price=$0.01, quantity=1000<br>2. Expected total: 0.01 × 1000 = 10.00<br>3. Verify response | ✅ totalAmount = 10.00<br>✅ No accumulation errors<br>✅ Precise calculation |
| **TC-DI-008** | Small quantity × large price accuracy | 1. Create order: price=$9,999.99, quantity=1<br>2. Expected total: 9,999.99<br>3. Verify response | ✅ totalAmount = 9,999.99<br>✅ Large numbers handled correctly<br>✅ No truncation |
| **TC-DI-009** | Mixed decimals in multiple items | 1. Items: A($19.99 × 1), B($24.99 × 2), C($5.03 × 1)<br>2. Calculate: 19.99 + 49.98 + 5.03 = 75.00<br>3. Verify response | ✅ totalAmount = 75.00<br>✅ All decimals accounted for<br>✅ No rounding discrepancies |
| **TC-DI-010** | Verify items array matches request | 1. Send POST with specific items array<br>2. Retrieve order from response<br>3. Compare items in response with request | ✅ Response.items matches request.items<br>✅ All fields present (productId, name, price, qty)<br>✅ No items lost or duplicated |
| **TC-DI-011** | Verify no hidden charges in total | 1. Create order with items totaling exactly $50.00<br>2. Check response totalAmount<br>3. Verify no tax/shipping added automatically | ✅ totalAmount = 50.00 (items only)<br>✅ No extra charges<br>✅ Transparent calculation |
| **TC-DI-012** | Quantity overflow protection | 1. Create order with quantity: Number.MAX_SAFE_INTEGER<br>2. Verify totalAmount doesn't overflow<br>3. Check calculation remains accurate | ✅ totalAmount calculated correctly<br>✅ No integer overflow<br>✅ Safe handling of large numbers |

---

## 🔍 Test Execution Checklist

### Positive Tests
- [ ] Single and multiple items orders
- [ ] Quantity multiplication working correctly
- [ ] Decimal price handling
- [ ] Order ID generation (UUID format)
- [ ] Status initialized to PENDING
- [ ] Estimated delivery date (5 days)
- [ ] Address preservation
- [ ] Cart clearing after creation

### Negative Tests
- [ ] Empty items array rejection
- [ ] Missing required fields rejection
- [ ] Negative/zero values validation
- [ ] Non-numeric input rejection
- [ ] Proper HTTP status codes (400 for errors)

### Data Integrity Tests
- [ ] Order total matches sum of items
- [ ] Decimal rounding to 2 places
- [ ] No floating-point precision loss
- [ ] All items included in calculation
- [ ] No hidden charges

### Edge Cases
- [ ] Large quantities and prices
- [ ] Very small decimal values
- [ ] Many items in single order
- [ ] Special/unicode characters
- [ ] Concurrent order creation
- [ ] Duplicate product IDs in same order

---

## 📊 Test Coverage Summary
- **Total Test Cases**: 52
- **Positive Tests**: 10
- **Negative Tests**: 20
- **Edge Cases**: 12
- **Data Integrity Tests**: 12

---

## ⚠️ Known Assumptions
1. Order service uses in-memory storage for this phase
2. UUID library available for orderId generation
3. Date object supports 5-day addition
4. Decimal prices rounded to exactly 2 decimal places
5. Cart clearing occurs only after successful order creation
6. No external payment processing in create phase