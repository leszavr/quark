import { Request, Response, NextFunction } from "express";
import axios, { AxiosInstance } from "axios";
import * as https from "https";
import Redis from "ioredis";
import rateLimit from "express-rate-limit";
import { v4 as uuidv4 } from "uuid";
import vault from "node-vault";

/**
 * Enterprise-Grade JWT Authentication Middleware for Quark Plugin Hub
 * 
 * Features:
 * - mTLS authentication with Vault PKI
 * - Multi-level caching (Memory + Redis)  
 * - Circuit breaker pattern for resilience
 * - Rate limiting per user
 * - Graceful degradation
 * - Comprehensive monitoring & logging
 * - Context versioning for permission sync
 */

export interface UserContext {
  valid: boolean;
  user_id: string;
  username?: string;
  email?: string;
  roles: string[];
  permissions: string[];
  profile?: {
    display_name: string;
    avatar_url?: string;
    verified: boolean;
  };
  context_version: number;
  token_type: "user" | "service" | "hub";
  session_id?: string;
  exp: number;
  iat: number;
}

export interface CircuitBreakerState {
  failures: number;
  lastFailureTime: number;
  state: "CLOSED" | "OPEN" | "HALF_OPEN";
  nextAttemptTime: number;
}

export interface EnterpriseJWTConfig {
  authServiceUrl: string;
  vaultConfig: {
    endpoint: string;
    token: string;
  };
  redis: {
    url: string;
    keyPrefix: string;
  };
  cache: {
    memoryTTL: number;    // seconds
    redisTTL: number;     // seconds
    maxMemoryEntries: number;
  };
  circuitBreaker: {
    failureThreshold: number;
    resetTimeoutMs: number;
    monitoringPeriodMs: number;
  };
  rateLimiting: {
    windowMs: number;
    maxRequests: number;
    skipSuccessfulRequests: boolean;
  };
  mtls: {
    enabled: boolean;
    pkiPath: string;
    roleName: string;
  };
}

export class EnterpriseJWTMiddleware {
  private redis!: Redis;
  private vaultClient: any;
  private mtlsHttpsAgent: https.Agent | null = null;
  private authServiceClient!: AxiosInstance;
  
  // Multi-level caching
  private memoryCache = new Map<string, { context: UserContext; timestamp: number; accessCount: number }>();
  private circuitBreakerState: CircuitBreakerState = {
    failures: 0,
    lastFailureTime: 0,
    state: "CLOSED",
    nextAttemptTime: 0
  };

  // Metrics for monitoring
  private metrics = {
    totalRequests: 0,
    cacheHits: { memory: 0, redis: 0 },
    authServiceCalls: 0,
    failures: 0,
    circuitBreakerTrips: 0
  };

  constructor(private config: EnterpriseJWTConfig) {
    this.initializeComponents();
  }

  private async initializeComponents(): Promise<void> {
    console.log("🚀 Initializing Enterprise JWT Middleware...");
    
    // Initialize Redis
    this.redis = new Redis(this.config.redis.url, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      keyPrefix: this.config.redis.keyPrefix,
    });

    this.redis.on("connect", () => console.log("✅ Redis connected for JWT middleware"));
    this.redis.on("error", (err) => console.error("❌ Redis error:", err));

    // Initialize Vault
    this.vaultClient = vault({
      apiVersion: "v1",
      endpoint: this.config.vaultConfig.endpoint,
      token: this.config.vaultConfig.token,
    });

    // Initialize mTLS if enabled
    if (this.config.mtls.enabled) {
      await this.initializeMTLS();
    }

    // Initialize Auth Service Client
    this.authServiceClient = axios.create({
      baseURL: this.config.authServiceUrl,
      timeout: 10000,
      httpsAgent: this.mtlsHttpsAgent,
      headers: {
        "Content-Type": "application/json",
        "X-Service-ID": "plugin-hub",
        "User-Agent": "Quark-PluginHub-Enterprise/1.0"
      }
    });

    // Start background processes
    this.startMemoryCacheCleanup();
    this.startCircuitBreakerMonitoring();
    this.startMetricsLogging();

    console.log("✅ Enterprise JWT Middleware initialized");
  }

  private async initializeMTLS(): Promise<void> {
    try {
      console.log("🔐 Initializing mTLS with Vault PKI...");
      
      // Request certificate from Vault PKI
      const certResponse = await this.vaultClient.write(
        `${this.config.mtls.pkiPath}/issue/${this.config.mtls.roleName}`,
        {
          common_name: "plugin-hub.quark.internal",
          ttl: "24h"
        }
      );

      // Get CA certificate
      const caResponse = await this.vaultClient.read(`${this.config.mtls.pkiPath}/ca/pem`);

      this.mtlsHttpsAgent = new https.Agent({
        cert: certResponse.data.certificate,
        key: certResponse.data.private_key,
        ca: caResponse.data,
        rejectUnauthorized: true,
        keepAlive: true,
        maxCachedSessions: 10
      });

      console.log("✅ mTLS initialized with Vault certificates");
    } catch (error) {
      console.warn("⚠️ mTLS initialization failed, falling back to regular HTTPS:", error);
      this.config.mtls.enabled = false;
    }
  }

  /**
   * Main authentication middleware
   */
  public authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
  const requestId = uuidv4();
  (req as any).requestId = requestId;
    this.metrics.totalRequests++;

    const startTime = Date.now();

    try {
      // Extract JWT token
      const token = this.extractJWTFromHeader(req);
      if (!token) {
        return this.sendError(res, 401, "Missing JWT token", { requestId });
      }

      // Apply rate limiting
      const rateLimitResult = await this.checkRateLimit(token);
      if (!rateLimitResult.allowed) {
        return this.sendError(res, 429, "Rate limit exceeded", { 
          requestId, 
          resetTime: rateLimitResult.resetTime 
        });
      }

      // Get user context with multi-level caching
      const userContext = await this.getUserContext(token, requestId);
      if (!userContext?.valid) {
        return this.sendError(res, 401, "Invalid or expired token", { requestId });
      }

      // Validate token expiration
      if (userContext.exp < Math.floor(Date.now() / 1000)) {
        return this.sendError(res, 401, "Token expired", { requestId });
      }

      // Check permissions
      const requiredPermissions = this.getRequiredPermissions(req.path, req.method);
      if (!this.hasPermissions(userContext.permissions, requiredPermissions)) {
        return this.sendError(res, 403, "Insufficient permissions", { 
          requestId,
          required: requiredPermissions,
          user: userContext.permissions
        });
      }

      // Add user context to request
  (req as any).user = userContext;
  (req as any).requestId = requestId;

      // Log successful authentication
      const duration = Date.now() - startTime;
      console.log(`✅ Auth success: user=${userContext.user_id} duration=${duration}ms [${requestId}]`);

      next();
    } catch (error) {
      const duration = Date.now() - startTime;
      this.metrics.failures++;
      console.error(`❌ Auth error: duration=${duration}ms [${requestId}]:`, error);
      return this.sendError(res, 500, "Authentication failed", { requestId });
    }
  };

  /**
   * Multi-level caching: Memory → Redis → Auth Service
   */
  private async getUserContext(token: string, requestId: string): Promise<UserContext | null> {
    const tokenHash = this.hashToken(token);

    try {
      // L1 Cache: Memory (fastest)
      const memoryEntry = this.memoryCache.get(tokenHash);
      if (memoryEntry && this.isCacheEntryValid(memoryEntry, this.config.cache.memoryTTL)) {
        memoryEntry.accessCount++;
        this.metrics.cacheHits.memory++;
        console.log(`📋 Memory cache hit [${requestId}]`);
        return memoryEntry.context;
      }

      // L2 Cache: Redis
      const redisKey = `jwt:${tokenHash}`;
      const cachedData = await this.redis.get(redisKey);
      if (cachedData) {
        try {
          const context = JSON.parse(cachedData) as UserContext;
          this.updateMemoryCache(tokenHash, context);
          this.metrics.cacheHits.redis++;
          console.log(`📋 Redis cache hit [${requestId}]`);
          return context;
        } catch (parseError) {
          console.warn(`⚠️ Failed to parse Redis cache data [${requestId}]:`, parseError);
        }
      }

      // L3: Auth Service (with Circuit Breaker)
      if (this.isCircuitBreakerOpen()) {
        console.warn(`⚠️ Circuit breaker OPEN, using stale cache [${requestId}]`);
        return this.getStaleCache(tokenHash);
      }

      console.log(`🔍 Calling auth-service [${requestId}]`);
      const context = await this.callAuthService(token, requestId);
      
      if (context) {
        // Cache success
        await this.cacheUserContext(tokenHash, context);
        this.recordCircuitBreakerSuccess();
      }

      return context;

    } catch (error) {
      console.error(`❌ Get user context error [${requestId}]:`, error);
      this.recordCircuitBreakerFailure();
      
      // Fallback to stale cache
      return this.getStaleCache(tokenHash);
    }
  }

  private async callAuthService(token: string, requestId: string): Promise<UserContext | null> {
    try {
      this.metrics.authServiceCalls++;
      
      const response = await this.authServiceClient.post("/auth/validate", 
        { token },
        {
          headers: {
            "X-Request-ID": requestId,
            "X-Timestamp": new Date().toISOString()
          }
        }
      );

      if (response.data?.valid && response.data?.payload) {
        const payload = response.data.payload;
        return {
          valid: true,
          user_id: payload.user_id || payload.sub,
          username: payload.username,
          email: payload.email,
          roles: payload.roles || [],
          permissions: payload.permissions || [],
          profile: payload.profile,
          context_version: payload.context_version || 1,
          token_type: payload.token_type || "user",
          session_id: payload.session_id,
          exp: payload.exp,
          iat: payload.iat || Math.floor(Date.now() / 1000)
        };
      }

      return null;
    } catch (error: any) {
      console.error(`❌ Auth service call failed [${requestId}]:`, error.message);
      throw error;
    }
  }

  private async cacheUserContext(tokenHash: string, context: UserContext): Promise<void> {
    try {
      // Cache in memory
      this.updateMemoryCache(tokenHash, context);

      // Cache in Redis
      const redisKey = `jwt:${tokenHash}`;
      await this.redis.setex(redisKey, this.config.cache.redisTTL, JSON.stringify(context));
    } catch (error) {
      console.error("Failed to cache user context:", error);
    }
  }

  private updateMemoryCache(tokenHash: string, context: UserContext): void {
    // Evict oldest entries if cache is full
    if (this.memoryCache.size >= this.config.cache.maxMemoryEntries) {
      const oldestKey = this.findOldestCacheKey();
      if (oldestKey) {
        this.memoryCache.delete(oldestKey);
      }
    }

    this.memoryCache.set(tokenHash, {
      context,
      timestamp: Date.now(),
      accessCount: 1
    });
  }

  private findOldestCacheKey(): string | null {
    let oldestKey = null;
    let oldestTime = Date.now();

    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    return oldestKey;
  }

  private isCacheEntryValid(entry: { timestamp: number }, ttlSeconds: number): boolean {
    return Date.now() - entry.timestamp < ttlSeconds * 1000;
  }

  private getStaleCache(tokenHash: string): UserContext | null {
    const memoryEntry = this.memoryCache.get(tokenHash);
    if (memoryEntry) {
      console.warn("⚠️ Using stale memory cache");
      return memoryEntry.context;
    }
    return null;
  }

  // Circuit Breaker Implementation
  private isCircuitBreakerOpen(): boolean {
    return this.circuitBreakerState.state === "OPEN" && 
           Date.now() < this.circuitBreakerState.nextAttemptTime;
  }

  private recordCircuitBreakerSuccess(): void {
    this.circuitBreakerState.failures = 0;
    this.circuitBreakerState.state = "CLOSED";
  }

  private recordCircuitBreakerFailure(): void {
    this.circuitBreakerState.failures++;
    this.circuitBreakerState.lastFailureTime = Date.now();

    if (this.circuitBreakerState.failures >= this.config.circuitBreaker.failureThreshold) {
      this.circuitBreakerState.state = "OPEN";
      this.circuitBreakerState.nextAttemptTime = Date.now() + this.config.circuitBreaker.resetTimeoutMs;
      this.metrics.circuitBreakerTrips++;
      console.warn("⚠️ Circuit breaker OPENED due to failures");
    }
  }

  // Rate Limiting
  private async checkRateLimit(token: string): Promise<{ allowed: boolean; resetTime?: number }> {
    try {
      const tokenHash = this.hashToken(token);
      const key = `rate_limit:${tokenHash}`;
      
      const current = await this.redis.incr(key);
      if (current === 1) {
        await this.redis.expire(key, Math.floor(this.config.rateLimiting.windowMs / 1000));
      }

      const allowed = current <= this.config.rateLimiting.maxRequests;
      const resetTime = allowed ? undefined : Date.now() + this.config.rateLimiting.windowMs;

      return { allowed, resetTime };
    } catch (error) {
      console.error("Rate limit check failed:", error);
      return { allowed: true }; // Allow on error
    }
  }

  // Permission Checking
  private getRequiredPermissions(path: string, method: string): string[] {
    const permissionMap: { [key: string]: string[] } = {
      "GET /modules/discovery": [], // Public
      "POST /modules/register": ["modules:register"],
      "DELETE /modules/:id": ["modules:delete"],
      "POST /modules/:id/install": ["modules:install"],
      "POST /modules/:id/update": ["modules:update"],
      "GET /admin": ["admin:read"],
      "POST /admin": ["admin:write"]
    };

    const key = `${method} ${path}`;
    return permissionMap[key] || [];
  }

  private hasPermissions(userPermissions: string[], requiredPermissions: string[]): boolean {
    if (userPermissions.includes("*")) return true;
    return requiredPermissions.every(permission => userPermissions.includes(permission));
  }

  // Utility Methods
  private extractJWTFromHeader(req: Request): string | null {
    const authHeader = req.headers.authorization;
    return authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;
  }

  private hashToken(token: string): string {
    const crypto = require("crypto");
    return crypto.createHash("sha256").update(token).digest("hex").substring(0, 16);
  }

  private sendError(res: Response, status: number, message: string, meta: any = {}): Response {
    return res.status(status).json({
      error: message,
      timestamp: new Date().toISOString(),
      ...meta
    });
  }

  // Background Processes
  private startMemoryCacheCleanup(): void {
    setInterval(() => {
      const now = Date.now();
      const ttlMs = this.config.cache.memoryTTL * 1000;
      
      for (const [key, entry] of this.memoryCache.entries()) {
        if (now - entry.timestamp > ttlMs) {
          this.memoryCache.delete(key);
        }
      }
    }, 60000); // Every minute
  }

  private startCircuitBreakerMonitoring(): void {
    setInterval(() => {
      if (this.circuitBreakerState.state === "OPEN" && 
          Date.now() >= this.circuitBreakerState.nextAttemptTime) {
        this.circuitBreakerState.state = "HALF_OPEN";
        console.log("🔄 Circuit breaker HALF_OPEN - testing service");
      }
    }, this.config.circuitBreaker.monitoringPeriodMs);
  }

  private startMetricsLogging(): void {
    setInterval(() => {
      console.log("📊 JWT Middleware Metrics:", {
        ...this.metrics,
        memoryCache: this.memoryCache.size,
        circuitBreakerState: this.circuitBreakerState.state
      });
    }, 60000); // Every minute
  }

  // Graceful Shutdown
  public async shutdown(): Promise<void> {
    console.log("🛑 Shutting down Enterprise JWT Middleware...");
    await this.redis.quit();
    console.log("✅ Middleware shutdown complete");
  }
}