# AI Prompt Templates Library

## 📚 Purpose
Reusable, proven prompt templates for common development tasks. Each template follows the **Specific Prompt Formula**: File Path + Method/Element + Exact Change + Context + Constraints

---

## 🎯 Template Usage Rules

### The Anatomy of a Good Prompt
```
[LOCATION] + [TARGET] + [ACTION] + [CONTEXT] + [CONSTRAINTS]

Example:
"In microservices/order-service/src/service.ts,     [LOCATION]
update the isValidStatusTransition method           [TARGET]
to allow PROCESSING → CONFIRMED transitions         [ACTION]
for payment re-authorization scenarios.              [CONTEXT]
Only modify this method, preserve other logic."      [CONSTRAINTS]
```

### Quality Checklist
Before using any prompt, verify:
- [ ] Exact file path provided
- [ ] Specific method/class/field named
- [ ] Clear action verb (add, update, modify, remove)
- [ ] Business context explained (why this change)
- [ ] Constraints defined (what NOT to change)

---

## 🏗️ Category 1: Data Structure Modifications

### Template 1.1: Add Field to Interface
```
In [FILE_PATH], add a [FIELD_NAME]: [TYPE] field to the [INTERFACE_NAME] interface.

Requirements:
- Make it optional: [yes/no]
- Add comment: "[DESCRIPTION]"
- [Additional constraints]

Example values: [EXAMPLES]
Do not modify other fields in the interface.
```

**Example:**
```
In microservices/product-service/src/types.ts, add a discount: number field to the Product interface.

Requirements:
- Make it optional: yes
- Add comment: "Discount percentage (0-100)"
- Should work with existing Product objects

Example values: 0, 10, 25.5, 100
Do not modify other fields in the interface.
```

### Template 1.2: Add Field to Schema with Validation
```
In [FILE_PATH], update the [SCHEMA_NAME] schema to include [FIELD_NAME] with the following validation:
- Type: [ZOD_TYPE]
- Min: [MIN_VALUE]
- Max: [MAX_VALUE]
- Optional: [yes/no]
- Custom validation: [IF_ANY]

Do not change validation for existing fields.
```

**Example:**
```
In microservices/product-service/src/routes.ts, update the CreateProductSchema schema to include discount with the following validation:
- Type: z.number()
- Min: 0
- Max: 100
- Optional: yes
- Custom validation: none

Do not change validation for existing fields.
```

### Template 1.3: Add Field to API Documentation
```
In [FILE_PATH], add [FIELD_NAME] to the [SCHEMA_NAME] schema in the OpenAPI/Swagger documentation.

Properties:
- type: [TYPE]
- format: [FORMAT]
- minimum: [MIN]
- maximum: [MAX]
- description: "[DESCRIPTION]"
- example: [EXAMPLE]
- required: [true/false]

Update only this schema definition.
```

### Template 1.4: Add Field to Sample Data
```
In [FILE_PATH], add [FIELD_NAME]: [VALUE] to all sample [ENTITY_NAME] objects in the array.

Values to use:
- [ENTITY_ID_1]: [VALUE_1]
- [ENTITY_ID_2]: [VALUE_2]
- [ENTITY_ID_3]: [VALUE_3]

Preserve all existing fields, only add the new field.
```

---

## 🔄 Category 2: Business Logic Updates

### Template 2.1: State Machine Transition Update
```
In [FILE_PATH], update the [METHOD_NAME] method to allow [CURRENT_STATE] status to transition to [NEW_STATE] status.

Business context: [WHY_THIS_IS_NEEDED]

Implementation:
- Add [NEW_STATE] to the valid transitions array for [CURRENT_STATE]
- Add inline comment explaining the business reason
- Preserve all existing transitions
- Do not modify other status transitions
```

**Example:**
```
In microservices/order-service/src/service.ts, update the isValidStatusTransition method to allow PROCESSING status to transition to CONFIRMED status.

Business context: Needed for payment re-authorization scenarios where order in processing needs re-confirmation.

Implementation:
- Add OrderStatus.CONFIRMED to the PROCESSING transitions array
- Add inline comment: "// Added CONFIRMED for payment re-authorization"
- Preserve all existing transitions (SHIPPED, CANCELLED)
- Do not modify other status transitions
```

### Template 2.2: Add Validation Rule
```
In [FILE_PATH], add validation to the [METHOD_NAME] method to check [CONDITION].

Validation logic:
- If [CONDITION] is true: throw Error("[ERROR_MESSAGE]")
- Check this BEFORE [EXISTING_CHECK]
- Do not modify existing validation logic

This prevents [BUSINESS_PROBLEM].
```

### Template 2.3: Remove Validation Rule (Carefully!)
```
In [FILE_PATH], CAREFULLY remove the validation check for [CONDITION] from [METHOD_NAME].

Business justification: [WHY_REMOVAL_IS_SAFE]

Safety requirements:
- Document why this check is being removed (inline comment)
- Add unit test showing the new behavior is correct
- Verify no other code depends on this validation throwing
- Do not remove other validation checks
```

---

## ✅ Category 3: Test Generation

### Template 3.1: Generate Field Validation Tests
```
Create API tests in [FILE_PATH] for the [FIELD_NAME] field on [ENDPOINT].

Test coverage required:
1. Valid value test: [FIELD_NAME] = [VALID_VALUE] should return 200/201
2. Minimum boundary: [FIELD_NAME] = [MIN] should succeed
3. Maximum boundary: [FIELD_NAME] = [MAX] should succeed
4. Below minimum: [FIELD_NAME] = [BELOW_MIN] should return 400
5. Above maximum: [FIELD_NAME] = [ABOVE_MAX] should return 400
6. Optional field: omit [FIELD_NAME] should succeed (if optional)
7. Decimal values: [FIELD_NAME] = [DECIMAL] should succeed (if applicable)

Use Playwright request fixture and async/await pattern.
Base URL: [BASE_URL]
Include descriptive test names and assertions for response structure.
```

**Example:**
```
Create API tests in tests/tests/product-service/6-discount-field.spec.ts for the discount field on POST /api/products endpoint.

Test coverage required:
1. Valid value test: discount = 25 should return 201
2. Minimum boundary: discount = 0 should succeed
3. Maximum boundary: discount = 100 should succeed
4. Below minimum: discount = -5 should return 400
5. Above maximum: discount = 150 should return 400
6. Optional field: omit discount should succeed
7. Decimal values: discount = 12.5 should succeed

Use Playwright request fixture and async/await pattern.
Base URL: http://localhost:3001/api
Include descriptive test names and assertions for response structure.
```

### Template 3.2: Generate CRUD Tests
```
Create complete CRUD test suite in [FILE_PATH] for [ENTITY_NAME] endpoints.

Endpoints to test:
- POST [CREATE_ENDPOINT] - Create new entity
- GET [LIST_ENDPOINT] - Get all entities
- GET [DETAILS_ENDPOINT] - Get single entity
- PUT [UPDATE_ENDPOINT] - Update entity
- DELETE [DELETE_ENDPOINT] - Delete entity

For each endpoint, include:
- Happy path test (200/201 response)
- Validation error test (400 response)
- Not found test (404 response, where applicable)
- Auth test (401 response, if secured)

Use [TEST_FRAMEWORK] and follow [PATTERN] pattern.
```

### Template 3.3: Generate Edge Case Tests
```
Create edge case tests in [FILE_PATH] for [FUNCTIONALITY].

Edge cases to cover:
- Empty input: [SCENARIO]
- Very large input: [SCENARIO]
- Special characters: [SCENARIO]
- Unicode characters: [SCENARIO]
- Null/undefined: [SCENARIO]
- Boundary values: [SCENARIOS]

Each test should verify:
- Correct status code
- Error message format (if error)
- Data integrity
```

---

## 📝 Category 4: Documentation

### Template 4.1: Generate API Endpoint Documentation
```
Create API documentation for [ENDPOINT] in [FILE_PATH].

Endpoint details:
- Method: [HTTP_METHOD]
- Path: [PATH]
- Description: [DESCRIPTION]
- Authentication: [required/optional/none]

Request:
- Body schema: [SCHEMA_REFERENCE]
- Required fields: [FIELDS]
- Optional fields: [FIELDS]

Responses:
- 200/201: [SUCCESS_DESCRIPTION] → [RESPONSE_SCHEMA]
- 400: [VALIDATION_ERROR_DESCRIPTION]
- 404: [NOT_FOUND_DESCRIPTION]
- 500: [SERVER_ERROR_DESCRIPTION]

Include realistic example request/response.
```

### Template 4.2: Generate OpenAPI Schema
```
Create OpenAPI 3.0 schema in [FILE_PATH] for [SERVICE_NAME].

Include:
- Info section: title, version, description
- Servers: [SERVER_URLS]
- All endpoints from [ROUTES_FILE]
- Component schemas for: [ENTITIES]
- Request/response examples
- Error response schemas

Follow OpenAPI 3.0 specification strictly.
```

### Template 4.3: Generate README Section
```
Add a section to [README_FILE] explaining [FEATURE_NAME].

Structure:
## [FEATURE_NAME]

### Overview
[Brief description]

### Usage
[Code example]

### API Reference
[Endpoints/methods]

### Examples
[Real-world usage scenarios]

Keep it concise, use code blocks, include links to relevant files.
```

---

## 🔧 Category 5: Refactoring

### Template 5.1: Extract Method
```
In [FILE_PATH], extract the logic from lines [START]-[END] in [METHOD_NAME] into a new private method called [NEW_METHOD_NAME].

New method signature:
private [NEW_METHOD_NAME]([PARAMS]): [RETURN_TYPE]

Requirements:
- Keep the original method's behavior identical
- Use descriptive parameter names
- Add JSDoc comment explaining the method's purpose
- Update the original method to call the new one
```

### Template 5.2: Rename for Clarity
```
In [FILE_PATH], rename [OLD_NAME] to [NEW_NAME] throughout the file.

Scope:
- Variable/method/class: [WHICH_ONE]
- Update all references in this file only
- Preserve all functionality
- Do not rename similar names (only exact matches)

Reason for rename: [WHY_NEW_NAME_IS_BETTER]
```

### Template 5.3: Add Error Handling
```
In [FILE_PATH], add error handling to [METHOD_NAME] for [FAILURE_SCENARIO].

Implementation:
- Wrap [CODE_SECTION] in try-catch
- Catch [ERROR_TYPE] specifically
- On error: [ERROR_HANDLING_STRATEGY]
- Log error with: console.error('[CONTEXT]:', error)
- Preserve existing error handling for other scenarios
```

---

## 🔒 Category 6: Security & Validation

### Template 6.1: Add Input Sanitization
```
In [FILE_PATH], add input sanitization to [METHOD_NAME] for [FIELD_NAME].

Sanitization requirements:
- Trim whitespace
- Remove dangerous characters: [CHAR_LIST]
- Validate format: [REGEX_OR_RULE]
- Maximum length: [LENGTH]
- Apply BEFORE [EXISTING_VALIDATION]

Prevents: [SECURITY_THREAT]
```

### Template 6.2: Add Authorization Check
```
In [FILE_PATH], add authorization check to [METHOD_NAME].

Check logic:
- Verify [USER_PROPERTY] matches [RESOURCE_PROPERTY]
- If not authorized: throw Error("[ERROR_MESSAGE]") with 403 status
- Check this AFTER authentication but BEFORE business logic
- Do not modify existing authentication checks
```

---

## 🐛 Category 7: Bug Fixes

### Template 7.1: Fix Specific Bug
```
In [FILE_PATH], fix the bug in [METHOD_NAME] where [CURRENT_BEHAVIOR] happens.

Expected behavior: [CORRECT_BEHAVIOR]
Root cause: [BUG_EXPLANATION]

Fix implementation:
- Change [SPECIFIC_LINE_OR_LOGIC]
- Add validation for [EDGE_CASE]
- Preserve existing behavior for [NORMAL_CASES]

Add inline comment: "// Fixed: [BUG_DESCRIPTION]"
```

### Template 7.2: Fix Type Error
```
In [FILE_PATH], fix TypeScript type error on line [LINE_NUMBER].

Current error: "[ERROR_MESSAGE]"

Fix approach:
- Update type annotation for [VARIABLE_NAME] to [CORRECT_TYPE]
- OR add type guard: if ([CHECK]) { ... }
- Preserve runtime behavior
- Do not use 'any' type
```

---

## 💾 Template Usage Examples

### Example Session 1: Adding a Feature (Discount Field)
```
1. Use Template 1.1: Add discount field to Product interface
2. Use Template 1.2: Add discount validation to schema
3. Use Template 1.3: Add discount to API docs
4. Use Template 1.4: Add discount to sample data
5. Use Template 3.1: Generate discount field tests
```

### Example Session 2: Fixing Order Status Bug
```
1. Use Template 2.1: Update status transition logic
2. Use Template 3.2: Generate CRUD tests for verification
3. Use Template 4.1: Update API documentation
4. Use Template 7.1: Add inline comment documenting the fix
```

---

## 📊 Template Effectiveness Tracking

| Template ID | Times Used | Success Rate | Time Saved | Notes |
|-------------|------------|--------------|------------|-------|
| 1.1 | 3 | 100% | ~30 min | Perfect for field additions |
| 1.2 | 3 | 100% | ~20 min | Zod validation always correct |
| 2.1 | 1 | 100% | ~45 min | State machine updates safe |
| 3.1 | 1 | 100% | ~3 hours | Generated 12 perfect tests |

---

## 🎓 Best Practices

### When Creating New Templates
1. Start with a successful prompt you've used
2. Generalize the pattern
3. Add placeholders in [BRACKETS]
4. Include example usage
5. Document constraints clearly

### When Using Templates
1. Fill in ALL placeholders
2. Add more context if domain is complex
3. Include business justification
4. Set clear boundaries on what NOT to change
5. Review AI output against template goals

### Red Flags (Don't Use AI for These)
- Security-critical changes without templates
- Database migrations
- Production hotfixes under time pressure
- Architecture decisions
- When you're tired (after 6 PM)

---

**Total Templates:** 23  
**Categories:** 7  
**Success Rate:** 100% (when used in Deep Work time)  
**Average Time Saved:** 45 minutes per template use  

**Last Updated:** February 24, 2026  
**Next Review:** Add 5 new templates by March 1, 2026
