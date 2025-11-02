/**
 * Quark MKS Plugin Hub Integration Library  
 * Реализует Universal Docking Interface (UDI) для автоматической регистрации модулей
 */

interface PluginHubConfig {
  hubUrl: string;
  moduleId: string;
  moduleName: string;
  manifestPath?: string;
  heartbeatInterval?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

interface ModuleRegistrationData {
  manifest: any;
  timestamp: string;
  registrationToken?: string;
}

interface RegistrationResponse {
  success: boolean;
  moduleId: string;
  message: string;
  hubEndpoints: {
    events: string;
    discovery: string;
    metrics: string;
  };
  nextHeartbeat: string;
  configuration?: any;
}

export class PluginHubClient {
  private config: PluginHubConfig;
  private isRegistered = false;
  private heartbeatTimer?: NodeJS.Timeout;
  private retryCount = 0;

  constructor(config: PluginHubConfig) {
    this.config = {
      heartbeatInterval: 30,
      retryAttempts: 3,
      retryDelay: 5,
      ...config
    };
  }

  /**
   * Автоматическая регистрация модуля в Plugin Hub
   */
  async register(): Promise<boolean> {
    try {
      console.log(`🔌 Registering with Plugin Hub: ${this.config.hubUrl}`);
      
      const manifest = await this.loadManifest();
      const registrationData: ModuleRegistrationData = {
        manifest,
        timestamp: new Date().toISOString()
      };

      const response = await fetch(`${this.config.hubUrl}/api/services/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": `${this.config.moduleId}/1.0.0`
        },
        body: JSON.stringify(registrationData)
      });

      if (!response.ok) {
        throw new Error(`Registration failed: ${response.status} ${response.statusText}`);
      }

      const result: RegistrationResponse = await response.json();
      
      if (result.success) {
        this.isRegistered = true;
        this.retryCount = 0;
        console.log(`✅ Successfully registered with Plugin Hub as ${result.moduleId}`);
        
        // Запускаем heartbeat
        this.startHeartbeat();
        return true;
      } else {
        throw new Error(result.message);
      }

    } catch (error) {
      console.error("❌ Plugin Hub registration failed:", error instanceof Error ? error.message : String(error));
      
      // Retry logic
      if (this.retryCount < this.config.retryAttempts!) {
        this.retryCount++;
        console.log(`🔄 Retrying registration in ${this.config.retryDelay}s (attempt ${this.retryCount}/${this.config.retryAttempts})`);
        
        setTimeout(() => {
          this.register();
        }, this.config.retryDelay! * 1000);
      } else {
        console.error(`💥 Failed to register after ${this.config.retryAttempts} attempts`);
      }
      
      return false;
    }
  }

  /**
   * Простой парсер YAML для манифеста
   */
  private parseSimpleYaml(yamlContent: string): any {
    // Простая реализация для основных YAML конструкций
    const lines = yamlContent.split("\n");
    const result: any = {};
    let currentSection: any = result;
    let indent = 0;
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      
      const currentIndent = line.length - line.trimStart().length;
      
      if (trimmed.includes(":")) {
        const [key, ...valueParts] = trimmed.split(":");
        const value = valueParts.join(":").trim();
        
        if (value) {
          // Simple value
          currentSection[key.trim()] = value.replace(/['"]/g, "");
        } else {
          // Section header
          currentSection[key.trim()] = {};
          // This is a simplified parser - for production use a proper YAML library
        }
      }
    }
    
    return result;
  }

  /**
   * Загрузка манифеста модуля
   */
  private async loadManifest(): Promise<any> {
    try {
      if (this.config.manifestPath) {
        const fs = await import("fs");
        const manifestContent = fs.readFileSync(this.config.manifestPath, "utf8");
        // Simple YAML parsing for manifest (assuming key: value format)
        return this.parseSimpleYaml(manifestContent);
      } else {
        // Fallback manifest
        return {
          id: this.config.moduleId,
          name: this.config.moduleName,
          version: "1.0.0",
          technology: "Node.js",
          framework: "Express",
          host: "localhost",
          port: process.env.PORT || 3002,
          protocol: "http",
          endpoints: {
            health: "/health",
            status: "/status",
            manifest: "/manifest"
          },
          capabilities: ["blog-management", "user-authentication-proxy"],
          dependencies: ["plugin-hub", "auth-service"],
          security: {
            requiresAuth: true,
            authMethod: "jwt-enterprise"
          }
        };
      }
    } catch (error) {
      console.error("Failed to load manifest:", error);
      throw error;
    }
  }

  /**
   * Heartbeat протокол для поддержания соединения
   */
  private startHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
    }

    this.heartbeatTimer = setInterval(async () => {
      try {
        await this.sendHeartbeat();
      } catch (error) {
        console.error("Heartbeat failed:", error instanceof Error ? error.message : String(error));
        // При ошибке heartbeat пытаемся перерегистрироваться
        this.isRegistered = false;
        this.register();
      }
    }, this.config.heartbeatInterval! * 1000);
  }

  /**
   * Отправка heartbeat в Plugin Hub
   */
  private async sendHeartbeat(): Promise<void> {
    if (!this.isRegistered) return;

    const heartbeatData = {
      timestamp: new Date().toISOString(),
      status: "healthy",
      metrics: {
        cpu: process.cpuUsage(),
        memory: process.memoryUsage(),
        uptime: process.uptime()
      }
    };

    const response = await fetch(`${this.config.hubUrl}/api/services/${this.config.moduleId}/heartbeat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(heartbeatData)
    });

    if (!response.ok) {
      throw new Error(`Heartbeat failed: ${response.status}`);
    }

    console.log("💗 Heartbeat sent to Plugin Hub");
  }

  /**
   * Graceful shutdown - уведомляем Plugin Hub о завершении работы
   */
  async shutdown(): Promise<void> {
    console.log("🛑 Shutting down Plugin Hub integration...");
    
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
    }

    if (this.isRegistered) {
      try {
        await fetch(`${this.config.hubUrl}/api/services/${this.config.moduleId}/shutdown`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            timestamp: new Date().toISOString(),
            reason: "graceful-shutdown"
          })
        });
        console.log("✅ Plugin Hub notified of shutdown");
      } catch (error) {
        console.error("Failed to notify Plugin Hub of shutdown:", error instanceof Error ? error.message : String(error));
      }
    }
  }

  /**
   * Проверка состояния регистрации
   */
  isRegisteredWithHub(): boolean {
    return this.isRegistered;
  }

  /**
   * Получение информации о других зарегистрированных сервисах
   */
  async discoverServices(): Promise<any[]> {
    try {
      const response = await fetch(`${this.config.hubUrl}/api/services`);
      if (!response.ok) {
        throw new Error(`Service discovery failed: ${response.status}`);
      }
      
      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error("Service discovery failed:", error instanceof Error ? error.message : String(error));
      return [];
    }
  }

  /**
   * Получение конкретного сервиса по ID
   */
  async getService(serviceId: string): Promise<any | null> {
    try {
      const response = await fetch(`${this.config.hubUrl}/api/services/${serviceId}`);
      if (!response.ok) {
        return null;
      }
      
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error(`Failed to get service ${serviceId}:`, error instanceof Error ? error.message : String(error));
      return null;
    }
  }
}

export default PluginHubClient;