import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic, log } from "./vite";
import PluginHubClient from "./pluginHubClient";

// Plugin Hub интеграция
const pluginHubClient = new PluginHubClient({
  hubUrl: process.env.PLUGIN_HUB_URL || 'http://localhost:3000',
  moduleId: 'blog-service',
  moduleName: 'Blog Service',
  manifestPath: './module-manifest.yaml',
  heartbeatInterval: 30,
  retryAttempts: 3,
  retryDelay: 5
});

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "development") {
    const { setupVite } = await import("./vite");
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 3004 for Quark integration.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '3004', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, async () => {
    log(`serving on port ${port}`);
    
    // Автоматическая регистрация в Plugin Hub после успешного запуска
    setTimeout(async () => {
      try {
        await pluginHubClient.register();
        log('✅ Successfully integrated with Plugin Hub МКС Command Module');
      } catch (error) {
        log(`⚠️ Plugin Hub registration failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    }, 2000); // Даем время серверу полностью запуститься
  });

  // Graceful shutdown - ЗОЛОТОЕ ПРАВИЛО
  process.on('SIGINT', async () => {
    log('🛑 Received SIGINT, shutting down gracefully...');
    await pluginHubClient.shutdown();
    server.close(() => {
      log('✅ Server closed');
      process.exit(0);
    });
  });

  process.on('SIGTERM', async () => {
    log('🛑 Received SIGTERM, shutting down gracefully...');
    await pluginHubClient.shutdown();
    server.close(() => {
      log('✅ Server closed');
      process.exit(0);
    });
  });
})();
