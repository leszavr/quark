import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable validation globally
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  });

  const port = Number.parseInt(process.env.PORT ?? "") || 3001;
  await app.listen(port);
  
  console.log("🔐 Quark Auth Service started on port", port);
  console.log("🌐 Health check: http://localhost:" + port + "/health");
  console.log("🔑 Auth endpoints: http://localhost:" + port + "/auth");
  
  // Register with Plugin Hub
  await registerWithPluginHub(port);
}

async function registerWithPluginHub(port: number) {
  const pluginHubUrl = process.env.PLUGIN_HUB_URL || "http://plugin-hub:3000";
  const serviceUrl = process.env.SERVICE_URL || `http://auth-service:${port}`;
  
  const serviceData = {
    id: "auth-service",
    name: "Auth Service",
    type: "authentication",
    version: "1.0.0",
    url: serviceUrl,
    healthEndpoint: `${serviceUrl}/auth/health`,
    metadata: {
      description: "JWT Authentication and User Management Service",
      tags: ["auth", "jwt", "users", "security"],
      endpoints: ["/auth/login", "/auth/register", "/auth/profile", "/users"],
      dependencies: ["postgresql", "plugin-hub"]
    }
  };

  // Функция для отправки heartbeat
  async function sendHeartbeat() {
    try {
      const response = await fetch(`${pluginHubUrl}/api/services/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(serviceData)
      });
      
      if (response.ok) {
        console.log("💗 Heartbeat sent to Plugin Hub");
      } else {
        console.log("⚠️ Heartbeat failed:", response.statusText);
      }
    } catch (error) {
      console.log("⚠️ Heartbeat error:", error instanceof Error ? error.message : String(error));
    }
  }

  // Первоначальная регистрация
  try {
    const response = await fetch(`${pluginHubUrl}/api/services/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(serviceData)
    });
    
    if (response.ok) {
      console.log("✅ Successfully registered with Plugin Hub");
      
      // Запускаем периодический heartbeat каждые 30 секунд
      setInterval(sendHeartbeat, 30000);
    } else {
      console.log("⚠️ Failed to register with Plugin Hub:", response.statusText);
    }
  } catch (error) {
    console.log("⚠️ Plugin Hub registration failed:", error instanceof Error ? error.message : String(error));
  }
}

await bootstrap();
