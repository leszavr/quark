export interface ServiceInfo {
  id: string;
  name: string;
  version: string;
  status: 'online' | 'offline' | 'error';
  url: string;
  healthEndpoint: string;
  registeredAt: Date;
  lastHeartbeat: Date;
  metadata: {
    description?: string;
    tags?: string[];
    endpoints?: string[];
    dependencies?: string[];
  };
}

export interface HealthCheck {
  serviceId: string;
  status: 'healthy' | 'unhealthy' | 'unknown';
  timestamp: Date;
  responseTime?: number;
  details?: any;
}

export interface ServiceRoute {
  serviceId: string;
  path: string;
  method: string;
  target: string;
  auth?: boolean;
  rateLimit?: {
    requests: number;
    window: string;
  };
}

export interface EventMessage {
  id: string;
  type: string;
  source: string;
  target?: string;
  payload: any;
  timestamp: Date;
}
