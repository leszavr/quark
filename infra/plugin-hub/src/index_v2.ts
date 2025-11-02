import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";

console.log("🚀 Starting Quark Plugin Hub (МКС Command Module)...");

class PluginHub {
  private app: express.Application;
  private server: any = null;

  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
    console.log("PluginHub initialized");
  }

  private setupMiddleware(): void {
    // Security
    this.app.use(helmet());
    
    // CORS
    this.app.use(cors({
      origin: process.env.CORS_ORIGIN || "*",
      credentials: true
    }));

    // Compression
    this.app.use(compression());
    
    // JSON parsing
    this.app.use(express.json({ limit: "10mb" }));
    this.app.use(express.urlencoded({ extended: true }));
    
    // Logging
    this.app.use(morgan("combined"));
  }

  private setupRoutes(): void {
    // Health check
    this.app.get("/health", (req, res) => {
      res.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        service: "plugin-hub",
        version: "1.0.0"
      });
    });

    // Basic info endpoint
    this.app.get("/", (req, res) => {
      res.json({
        name: "Quark Plugin Hub",
        description: "МКС Command Module - Central service management",
        version: "1.0.0",
        endpoints: ["/health", "/services", "/register"]
      });
    });
  }

  async start() {
    const PORT = process.env.PORT || 3000;
    
    this.server = this.app.listen(PORT, () => {
      console.log(`✅ Plugin Hub listening on port ${PORT}`);
      console.log(`🌐 Health check: http://localhost:${PORT}/health`);
    });

    console.log("PluginHub started!");
  }
}

const pluginHub = new PluginHub();
pluginHub.start();

export default PluginHub;
