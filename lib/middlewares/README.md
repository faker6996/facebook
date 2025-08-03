# Middleware System Documentation

## Overview

Professional, extensible middleware system for Next.js application with clear separation of concerns.

## Architecture

```
Request → Middleware Pipeline → Response
         ↓
    1. Route Protection (Authentication)
    2. Internationalization  
    3. Extensions (Rate Limit, Security, etc.)
```

## Components

### 1. Route Protection (`route-protection.ts`)
**Responsibility:** Basic authentication checks
- ✅ Protect private routes
- ✅ Handle public route access
- ✅ Locale-aware redirects
- ❌ Session validation (handled by API routes)
- ❌ Token verification (handled by API routes)

### 2. Extensions System (`extensions/`)
**Responsibility:** Pluggable middleware features
- Rate limiting
- Security headers
- Request logging
- Admin area protection
- Custom business logic

### 3. Main Pipeline (`middleware.ts`)
**Responsibility:** Orchestrate all middleware
- Route protection
- Internationalization
- Extension execution
- Error handling

## Usage Examples

### Basic Route Protection
```typescript
// Automatically protects all routes except public ones
// Redirects to login if no token
// Handles locale-aware redirects
```

### Adding Custom Extension
```typescript
import { middlewareRegistry } from "@/lib/middlewares/extensions";

const customExtension = {
  name: "analytics",
  priority: 15,
  enabled: true,
  execute: async (req, res) => {
    // Track page views
    analytics.track(req.nextUrl.pathname);
    return null; // No response modification
  }
};

middlewareRegistry.register(customExtension);
```

### Configuring Extensions
```typescript
import { middlewareRegistry } from "@/lib/middlewares/extensions";

// Enable/disable extensions
middlewareRegistry.setEnabled("rateLimit", true);
middlewareRegistry.setEnabled("requestLogger", false);
```

## Configuration

### Public Routes
```typescript
// Add new public routes
import { middlewareConfig } from "@/lib/middlewares/route-protection";

middlewareConfig.addPublicRoute("/terms");
middlewareConfig.addPublicApiRoute("/api/health");
```

### Locales
```typescript
// Supported locales are configured in route-protection.ts
const SUPPORTED_LOCALES = ["vi", "en"];
const DEFAULT_LOCALE = "vi";
```

## Extension Development

### Extension Interface
```typescript
interface MiddlewareExtension {
  name: string;           // Unique identifier
  priority: number;       // Execution order (lower = earlier)
  enabled: boolean;       // Enable/disable toggle
  execute: (req, res) => Promise<NextResponse | null>;
}
```

### Extension Guidelines
1. **Return `null`** if no response modification needed
2. **Return `NextResponse`** if modifying response
3. **Handle errors gracefully** - don't break the pipeline
4. **Use appropriate priority** - critical extensions should run early
5. **Make extensions toggleable** - use enabled flag

### Priority Guidelines
- `1-10`: Critical security/logging
- `11-20`: Performance (rate limiting, caching)
- `21-30`: Business logic (admin guards, feature flags)
- `31-40`: Enhancement (analytics, monitoring)

## Migration from Old Middleware

### Before (Complex, Coupled)
```typescript
// Mixed concerns in one file
// JWT validation in middleware (Edge Runtime issues)
// Hard to extend
// Difficult to test
```

### After (Clean, Extensible)
```typescript
// Separated concerns
// Minimal middleware (only route protection)
// Extensible via registry
// Easy to test and maintain
```

## Benefits

### 🎯 **Professional Architecture**
- Clear separation of concerns
- Single responsibility principle
- Easy to understand and maintain

### 🔧 **Extensible Design**
- Plugin-based extensions
- Priority-based execution
- Enable/disable toggles

### 🚀 **Performance**
- Minimal core middleware
- Conditional extension execution
- Edge Runtime compatible

### 🧪 **Testable**
- Isolated components
- Mockable dependencies
- Clear interfaces

### 📈 **Scalable**
- Easy to add new features
- Configuration-driven
- Team-friendly development

## Future Enhancements

1. **Rate Limiting with Redis**
2. **Advanced Security Headers**
3. **A/B Testing Support**
4. **Analytics Integration**
5. **Feature Flags**
6. **Request/Response Caching**
7. **API Versioning**
8. **Request Validation**