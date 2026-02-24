# AI Coding Assistant Instructions for MyBasket App

## Architecture Overview

This is a microservices e-commerce application with:
- **Frontend**: Next.js (port 9002) with React, TypeScript, Tailwind CSS
- **API Gateway**: Express proxy (port 3000) routing to microservices
- **Microservices**: Product (3001), Cart (3002), Order (3003), AI (3004)
- **Testing**: Playwright E2E tests, Jest unit tests
- **Deployment**: Docker Compose with individual service containers

## Key Patterns & Conventions

### Service Communication
- **API Gateway routes**: `/api/products/*` → Product Service, `/api/cart/*` → Cart Service, etc.
- **Inter-service calls**: Services call each other directly (e.g., Cart Service calls Product Service via HTTP)
- **Health checks**: All services expose `/api/health` endpoint
- **Swagger docs**: Available at `http://localhost:{port}/api-docs`

### API Design
- **RESTful endpoints** with userId in path: `/api/cart/{userId}/items`
- **Zod validation** for request/response schemas
- **Error handling**: 400 for validation errors, 404 for not found, 500 for server errors
- **Response format**: JSON with consistent error structure

### Frontend Patterns
- **API clients**: Separate classes in `src/lib/api/` mirroring service APIs
- **State management**: React Context with useReducer pattern
- **Mock user ID**: `user-123` for development (no auth implemented)
- **Component structure**: Feature-based folders under `src/components/`

### Development Workflow
- **Start all services**: `npm run microservices:start` (starts all 5 services)
- **Start frontend**: `npm run dev` (port 9002)
- **Full dev setup**: `npm run dev:full` (services + frontend)
- **Health check**: `npm run microservices:health`
- **Docker deployment**: `npm run docker:up`

### Testing
- **E2E tests**: Playwright in `tests/` directory with Page Object Model
- **Unit tests**: Jest in service `src/` directories
- **Test data**: Sample products in `src/data/sample-products.ts`

### Code Quality
- **TypeScript**: Strict typing throughout
- **ESLint + Prettier**: Configured via Next.js
- **Swagger JSDoc**: API documentation in route comments
- **Environment variables**: Service URLs configured via `.env` files

## Common Tasks

### Adding New Features
1. **Backend**: Add routes in service `src/routes.ts`, business logic in `src/service.ts`
2. **Frontend**: Add API client methods, update Context, create components
3. **Testing**: Add Playwright page objects and test cases

### Debugging
- Check service logs: `npm run docker:logs` or individual terminal outputs
- Health endpoint: `curl http://localhost:3000/health`
- Swagger UI for API testing: `http://localhost:{port}/api-docs`

### Data Flow
- Frontend → API Gateway → Specific Service
- Cart Service → Product Service (for product validation)
- All data stored in-memory (no persistence layer)

## File Structure Reference
- `src/app/` - Next.js pages (App Router)
- `src/components/` - React components by feature
- `src/contexts/` - State management
- `src/lib/api/` - API client classes
- `microservices/*/src/` - Service implementations
- `tests/` - E2E test suites
- `scripts/` - Development utilities</content>
<parameter name="filePath">d:\BidOne\projects\my-basket-app\.github\copilot-instructions.md