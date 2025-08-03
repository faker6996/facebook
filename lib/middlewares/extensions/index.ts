/**
 * Middleware Extensions
 * 
 * Extensible middleware system for future enhancements
 */

import { NextRequest, NextResponse } from "next/server";

/**
 * Middleware extension interface
 */
export interface MiddlewareExtension {
  name: string;
  priority: number; // Lower numbers run first
  enabled: boolean;
  execute: (req: NextRequest, res: NextResponse) => Promise<NextResponse | null>;
}

/**
 * Available middleware extensions
 */
export class MiddlewareRegistry {
  private extensions: MiddlewareExtension[] = [];
  
  /**
   * Register a new middleware extension
   */
  register(extension: MiddlewareExtension): void {
    this.extensions.push(extension);
    this.extensions.sort((a, b) => a.priority - b.priority);
  }
  
  /**
   * Execute all enabled extensions
   */
  async executeAll(req: NextRequest, res: NextResponse): Promise<NextResponse> {
    let currentResponse = res;
    
    for (const extension of this.extensions) {
      if (!extension.enabled) continue;
      
      try {
        const result = await extension.execute(req, currentResponse);
        if (result) {
          currentResponse = result;
        }
      } catch (error) {
        console.error(`[Extension Error: ${extension.name}]`, error);
        // Continue with other extensions
      }
    }
    
    return currentResponse;
  }
  
  /**
   * Get all registered extensions
   */
  getExtensions(): MiddlewareExtension[] {
    return [...this.extensions];
  }
  
  /**
   * Enable/disable extension by name
   */
  setEnabled(name: string, enabled: boolean): void {
    const extension = this.extensions.find(ext => ext.name === name);
    if (extension) {
      extension.enabled = enabled;
    }
  }
}

/**
 * Global middleware registry
 */
export const middlewareRegistry = new MiddlewareRegistry();

/**
 * Common extension types for future use
 */
export namespace Extensions {
  /**
   * Rate limiting extension
   */
  export const rateLimit: MiddlewareExtension = {
    name: "rateLimit",
    priority: 10,
    enabled: false, // Disabled by default
    execute: async (req, res) => {
      // TODO: Implement rate limiting logic
      // Could use Redis, in-memory cache, etc.
      return null; // No modification needed
    }
  };
  
  /**
   * CORS headers extension
   */
  export const corsHeaders: MiddlewareExtension = {
    name: "corsHeaders",
    priority: 15,
    enabled: true,
    execute: async (req, res) => {
      const newRes = NextResponse.next();
      
      // Copy existing headers
      res.headers.forEach((value, key) => {
        newRes.headers.set(key, value);
      });
      
      // Add CORS headers
      const origin = req.headers.get("origin") || "*";
      const allowedOrigins = [
        "http://localhost:3000",
        "http://localhost:3001", 
        "https://aistudio.com.vn",
        "https://www.aistudio.com.vn"
      ];
      
      const isAllowedOrigin = allowedOrigins.includes(origin) || origin === "*";
      
      newRes.headers.set("Access-Control-Allow-Origin", isAllowedOrigin ? origin : allowedOrigins[0]);
      newRes.headers.set("Access-Control-Allow-Credentials", "true");
      newRes.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
      newRes.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
      newRes.headers.set("Access-Control-Max-Age", "86400");
      
      // Handle preflight requests
      if (req.method === "OPTIONS") {
        return new NextResponse(null, { status: 200, headers: newRes.headers });
      }
      
      return newRes;
    }
  };

  /**
   * Security headers extension
   */
  export const securityHeaders: MiddlewareExtension = {
    name: "securityHeaders", 
    priority: 20,
    enabled: true,
    execute: async (req, res) => {
      // Add security headers
      const newRes = NextResponse.next();
      
      // Copy existing headers
      res.headers.forEach((value, key) => {
        newRes.headers.set(key, value);
      });
      
      // Add security headers
      newRes.headers.set("X-Frame-Options", "DENY");
      newRes.headers.set("X-Content-Type-Options", "nosniff");
      newRes.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
      
      return newRes;
    }
  };
  
  /**
   * Request logging extension
   */
  export const requestLogger: MiddlewareExtension = {
    name: "requestLogger",
    priority: 5,
    enabled: process.env.NODE_ENV === "development",
    execute: async (req, res) => {
      const start = Date.now();
      
      // Log request
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.nextUrl.pathname}`);
      
      // Log timing (simplified - in real implementation would need response timing)
      const duration = Date.now() - start;
      if (duration > 100) { // Log slow requests
        console.log(`[SLOW REQUEST] ${req.method} ${req.nextUrl.pathname} - ${duration}ms`);
      }
      
      return null; // No modification needed
    }
  };
  
  /**
   * Admin area protection extension
   */
  export const adminGuard: MiddlewareExtension = {
    name: "adminGuard", 
    priority: 30,
    enabled: true,
    execute: async (req, res) => {
      const pathname = req.nextUrl.pathname;
      
      // Check if accessing admin area
      if (pathname.startsWith('/admin') || pathname.startsWith('/vi/admin') || pathname.startsWith('/en/admin')) {
        // TODO: Implement admin role checking
        // For now, just require authentication
        const token = req.cookies.get("access_token")?.value;
        if (!token) {
          return NextResponse.redirect(new URL('/vi/login', req.url));
        }
      }
      
      return null; // No modification needed
    }
  };
}

// Register default extensions
middlewareRegistry.register(Extensions.requestLogger);
middlewareRegistry.register(Extensions.rateLimit);
middlewareRegistry.register(Extensions.corsHeaders);
middlewareRegistry.register(Extensions.securityHeaders);
middlewareRegistry.register(Extensions.adminGuard);