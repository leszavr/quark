// Service Registry Types
export interface ServiceInfo {
  id: string;
  name: string;
  version: string;
  type: "api" | "background" | "auth" | "storage" | "notification";
  endpoint?: string;
  port?: number;
  status: "active" | "inactive" | "error";
  health: "healthy" | "unhealthy" | "unknown";
  lastHeartbeat: Date;
  metadata?: Record<string, any>;
  dependencies?: string[];
  resources?: {
    cpu?: number;
    memory?: number;
    storage?: number;
  };
}

// Module Definition
export interface ModuleDefinition {
  id: string;
  name: string;
  version: string;
  type: "service" | "plugin" | "wasm" | "native";
  manifest: {
    description: string;
    author: string;
    repository?: string;
    license?: string;
    keywords?: string[];
  };
  runtime: {
    engine: "node" | "wasm" | "docker" | "native";
    entrypoint: string;
    environment?: Record<string, string>;
    resources?: {
      cpu: string;
      memory: string;
      storage?: string;
    };
  };
  api?: {
    endpoints?: ApiEndpoint[];
    events?: EventDefinition[];
    schemas?: Record<string, any>;
  };
  dependencies?: ModuleDependency[];
  configuration?: ConfigurationSchema;
}

export interface ApiEndpoint {
  path: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  description: string;
  parameters?: Parameter[];
  responses?: Response[];
}

export interface EventDefinition {
  name: string;
  type: "publish" | "subscribe";
  subject: string;
  schema?: any;
  description?: string;
}

export interface ModuleDependency {
  moduleId: string;
  version: string;
  optional?: boolean;
  type: "service" | "api" | "event";
}

export interface Parameter {
  name: string;
  type: "string" | "number" | "boolean" | "object" | "array";
  required?: boolean;
  description?: string;
}

export interface Response {
  status: number;
  description: string;
  schema?: any;
}

export interface ConfigurationSchema {
  properties: Record<string, ConfigProperty>;
  required?: string[];
}

export interface ConfigProperty {
  type: "string" | "number" | "boolean" | "object" | "array";
  description?: string;
  default?: any;
  enum?: any[];
}

// Event Types
export interface SystemEvent {
  id: string;
  type: string;
  source: string;
  timestamp: Date;
  data: any;
  metadata?: Record<string, any>;
}

export interface ModuleEvent extends SystemEvent {
  moduleId: string;
  version: string;
}

// Health Check Types
export interface HealthCheck {
  serviceId: string;
  status: "healthy" | "unhealthy" | "degraded";
  timestamp: Date;
  details?: {
    uptime?: number;
    responseTime?: number;
    memory?: number;
    cpu?: number;
    errors?: string[];
    warnings?: string[];
  };
}

// Configuration Types
export interface PluginHubConfig {
  server: {
    port: number;
    host: string;
    cors: {
      origin: string | string[];
      credentials: boolean;
    };
  };
  redis: {
    host: string;
    port: number;
    password?: string;
    db: number;
  };
  nats: {
    servers: string[];
    token?: string;
  };
  monitoring: {
    enabled: boolean;
    interval: number;
    timeout: number;
  };
  modules: {
    autoRegister: boolean;
    discovery: {
      enabled: boolean;
      interval: number;
    };
  };
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
  requestId?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Error Types
export interface PluginHubError extends Error {
  code: string;
  statusCode: number;
  details?: any;
}
