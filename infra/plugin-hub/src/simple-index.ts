import express from "express";
import Redis from "ioredis";

interface ServiceInfo {
  id: string;
  name: string;
  host: string;
  port: number;
  version: string;
  registeredAt: Date;
  lastHeartbeat: Date;
}

class SimplePluginHub {
  private app: express.Application;
  private redis: Redis;
  private readonly SERVICES_KEY = "quark:services";

  constructor() {
    this.app = express();
    this.redis = new Redis({
      host: process.env.REDIS_HOST || "redis",
      port: parseInt(process.env.REDIS_PORT || "6379"),
      maxRetriesPerRequest: 3,
    });
    
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    this.app.use(express.json());
    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
      next();
    });
  }

  private setupRoutes(): void {
    // Health check
    this.app.get("/health", (req, res) => {
      res.json({ 
        status: "ok", 
        timestamp: new Date().toISOString(),
        services: "Plugin Hub Core" 
      });
    });

    // Регистрация сервиса
    this.app.post("/api/register", async (req, res) => {
      try {
        const { name, host, port, version } = req.body;
        
        const service: ServiceInfo = {
          id: this.generateId(),
          name,
          host,
          port,
          version,
          registeredAt: new Date(),
          lastHeartbeat: new Date(),
        };

        await this.redis.hset(this.SERVICES_KEY, service.id, JSON.stringify(service));
        console.log(`✅ Service registered: ${service.name} (${service.id})`);
        
        res.json({ success: true, serviceId: service.id });
      } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ error: "Registration failed" });
      }
    });

    // Получить все сервисы
    this.app.get("/api/services", async (req, res) => {
      try {
        const services = await this.redis.hgetall(this.SERVICES_KEY);
        const serviceList = Object.values(services).map(data => JSON.parse(data));
        res.json(serviceList);
      } catch (error) {
        console.error("Get services error:", error);
        res.status(500).json({ error: "Failed to get services" });
      }
    });

    // Heartbeat
    this.app.post("/api/heartbeat/:serviceId", async (req, res) => {
      try {
        const { serviceId } = req.params;
        const serviceData = await this.redis.hget(this.SERVICES_KEY, serviceId);
        
        if (serviceData) {
          const service: ServiceInfo = JSON.parse(serviceData);
          service.lastHeartbeat = new Date();
          await this.redis.hset(this.SERVICES_KEY, serviceId, JSON.stringify(service));
          res.json({ success: true });
        } else {
          res.status(404).json({ error: "Service not found" });
        }
      } catch (error) {
        console.error("Heartbeat error:", error);
        res.status(500).json({ error: "Heartbeat failed" });
      }
    });

    // Отмена регистрации
    this.app.delete("/api/unregister/:serviceId", async (req, res) => {
      try {
        const { serviceId } = req.params;
        const result = await this.redis.hdel(this.SERVICES_KEY, serviceId);
        
        if (result > 0) {
          console.log(`🗑️ Service unregistered: ${serviceId}`);
          res.json({ success: true });
        } else {
          res.status(404).json({ error: "Service not found" });
        }
      } catch (error) {
        console.error("Unregister error:", error);
        res.status(500).json({ error: "Unregister failed" });
      }
    });
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  async start(): Promise<void> {
    const port = parseInt(process.env.PORT || "3000");
    
    try {
      // Проверяем подключение к Redis
      await this.redis.ping();
      console.log("✅ Redis connected successfully");
      
      this.app.listen(port, "0.0.0.0", () => {
        console.log(`🚀 Plugin Hub started on port ${port}`);
        console.log("📡 Service Registry ready");
        console.log(`🔗 Health check: http://localhost:${port}/health`);
      });
    } catch (error) {
      console.error("❌ Failed to start Plugin Hub:", error);
      process.exit(1);
    }
  }
}

const pluginHub = new SimplePluginHub();
pluginHub.start().catch(console.error);
