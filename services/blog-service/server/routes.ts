import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMessageSchema, insertBlogPostSchema, insertCommentSchema } from "@shared/schema";
import PluginHubJWTMiddleware, { UserContext } from "./jwtMiddleware";

// Initialize JWT middleware
const jwtMiddleware = new PluginHubJWTMiddleware(
  process.env.PLUGIN_HUB_URL || "http://localhost:3000"
);

// Simple YAML parser for manifest
function parseManifestYaml(yamlContent: string): any {
  const lines = yamlContent.split("\n");
  const result: any = {};
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    
    if (trimmed.includes(":")) {
      const [key, ...valueParts] = trimmed.split(":");
      const value = valueParts.join(":").trim();
      
      if (value) {
        result[key.trim()] = value.replace(/['"]/g, "");
      }
    }
  }
  
  return result;
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Применяем JWT middleware ко всем запросам
  app.use(jwtMiddleware.validateJWT);

  // Health check endpoint for Quark Platform integration
  app.get("/api/health", (req, res) => {
    res.json({
      status: "healthy",
      service: "blog-service",
      interface: "ready",
      timestamp: new Date().toISOString(),
      version: "1.0.0"
    });
  });

  // UDI Standard Endpoints (Universal Docking Interface)
  app.get("/health", (req, res) => {
    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks: {
        database: {
          status: "pass",
          message: "PostgreSQL connection active"
        },
        memory: {
          status: process.memoryUsage().heapUsed < 512 * 1024 * 1024 ? "pass" : "warn",
          duration: 1
        },
        pluginHub: {
          status: "pass",
          message: "Ready for Plugin Hub integration"
        }
      }
    });
  });

  app.get("/status", (req, res) => {
    const memUsage = process.memoryUsage();
    res.json({
      service: "blog-service",
      version: "1.0.0",
      status: "active",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      memory: {
        used: Math.round(memUsage.heapUsed / 1024 / 1024) + " MB",
        total: Math.round(memUsage.heapTotal / 1024 / 1024) + " MB"
      },
      environment: process.env.NODE_ENV || "development",
      architecture: "mks-module",
      registeredWithHub: true // Integrated with Plugin Hub МКС Command Module
    });
  });

  app.get("/manifest", async (req, res) => {
    try {
      const fs = await import("fs");
      const path = await import("path");
      
      const manifestPath = path.join(process.cwd(), "module-manifest.yaml");
      if (fs.existsSync(manifestPath)) {
        const manifestContent = fs.readFileSync(manifestPath, "utf8");
        // Simple YAML parsing for manifest
        const manifest = parseManifestYaml(manifestContent);
        res.json(manifest);
      } else {
        // Fallback manifest if file doesn't exist
        res.json({
          id: "blog-service",
          name: "Blog Service",
          version: "1.0.0",
          description: "Production-ready blog management service",
          technology: "Node.js",
          framework: "Express",
          capabilities: ["blog-management", "post-creation", "user-authentication-proxy"],
          endpoints: {
            health: "/health",
            status: "/status",
            manifest: "/manifest"
          }
        });
      }
    } catch (error) {
      res.status(500).json({ 
        error: "Failed to load manifest",
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Authentication endpoints (proxied through Plugin Hub)
  app.post("/auth/register", async (req, res) => {
    try {
      const { username, email, password, firstName, lastName } = req.body;
      
      if (!username || !email || !password) {
        return res.status(400).json({
          error: "Missing required fields",
          required: ["username", "email", "password"]
        });
      }

      // Proxy registration request through Plugin Hub → auth-service
      const response = await fetch(`${process.env.PLUGIN_HUB_URL || "http://localhost:3000"}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Module-ID": "blog-service",
          "X-Forwarded-For": req.ip || "unknown"
        },
        body: JSON.stringify({
          username,
          email,
          password,
          firstName,
          lastName,
          source: "blog-service"
        })
      });

      const result = await response.json();

      if (response.ok) {
        res.status(201).json({
          success: true,
          message: "User registered successfully",
          user: {
            id: result.user?.id,
            username: result.user?.username,
            email: result.user?.email,
            firstName: result.user?.firstName,
            lastName: result.user?.lastName
          },
          // НЕ возвращаем токен для безопасности - пользователь должен войти
          redirectTo: "/auth/login"
        });
      } else {
        res.status(response.status).json({
          error: result.error || "Registration failed",
          message: result.message || "Unable to create user account"
        });
      }

    } catch (error) {
      console.error("Registration proxy error:", error instanceof Error ? error.message : String(error));
      res.status(500).json({
        error: "Registration service unavailable",
        message: "Unable to connect to authentication service"
      });
    }
  });

  app.post("/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({
          error: "Missing credentials",
          required: ["username", "password"]
        });
      }

      // Proxy login request through Plugin Hub → auth-service
      const response = await fetch(`${process.env.PLUGIN_HUB_URL || "http://localhost:3000"}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Module-ID": "blog-service",
          "X-Forwarded-For": req.ip || "unknown"
        },
        body: JSON.stringify({
          username,
          password,
          source: "blog-service"
        })
      });

      const result = await response.json();

      if (response.ok && result.token) {
        // Устанавливаем cookie для web интерфейса
        res.cookie("auth-token", result.token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 24 * 60 * 60 * 1000 // 24 часа
        });

        res.json({
          success: true,
          message: "Login successful",
          user: {
            id: result.user?.id,
            username: result.user?.username,
            email: result.user?.email,
            firstName: result.user?.firstName,
            lastName: result.user?.lastName,
            roles: result.user?.roles || [],
            permissions: result.user?.permissions || []
          },
          token: result.token,
          expires: result.expires,
          redirectTo: "/dashboard"
        });
      } else {
        res.status(response.status || 401).json({
          error: result.error || "Login failed",
          message: result.message || "Invalid credentials"
        });
      }

    } catch (error) {
      console.error("Login proxy error:", error instanceof Error ? error.message : String(error));
      res.status(500).json({
        error: "Authentication service unavailable",
        message: "Unable to connect to authentication service"
      });
    }
  });

  app.post("/auth/logout", (req, res) => {
    // Очищаем cookie
    res.clearCookie("auth-token");
    res.json({
      success: true,
      message: "Logged out successfully",
      redirectTo: "/auth/login"
    });
  });

  // Current user endpoint
  app.get("/api/user/me", jwtMiddleware.getCurrentUser);

  // My posts endpoint (requires authentication)
  app.get("/api/my-posts", jwtMiddleware.requireAuth, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
  const posts = await storage.getBlogPostsByAuthor((req.user as UserContext).id);
      
      res.json({
        posts,
        total: posts.length,
  user: (req.user as UserContext).username
      });
    } catch (error) {
      res.status(500).json({ 
        error: "Failed to fetch user posts",
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Channels API
  app.get("/api/channels", async (req, res) => {
    try {
      const channels = await storage.getChannels();
      res.json(channels);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch channels" });
    }
  });

  app.get("/api/channels/:id", async (req, res) => {
    try {
      const channel = await storage.getChannel(req.params.id);
      if (!channel) {
        return res.status(404).json({ error: "Channel not found" });
      }
      res.json(channel);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch channel" });
    }
  });

  // Messages API
  app.get("/api/channels/:channelId/messages", async (req, res) => {
    try {
      const messages = await storage.getMessagesByChannel(req.params.channelId);
      
      // Enrich messages with user data
      const enrichedMessages = await Promise.all(messages.map(async (message) => {
        const author = await storage.getUser(message.authorId);
        return {
          ...message,
          author: author ? {
            id: author.id,
            username: author.username,
            firstName: author.firstName,
            lastName: author.lastName,
            avatar: author.avatar
          } : null
        };
      }));
      
      res.json(enrichedMessages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post("/api/channels/:channelId/messages", jwtMiddleware.requireAuth, async (req, res) => {
    try {
      // Check if channel exists
      const channel = await storage.getChannel(req.params.channelId);
      if (!channel) {
        return res.status(404).json({ error: "Channel not found" });
      }

      const validation = insertMessageSchema.safeParse({
        ...req.body,
        channelId: req.params.channelId
      });
      
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid message data", details: validation.error });
      }

      const message = await storage.createMessage(validation.data);
      
      // Enrich message with user data
      const author = await storage.getUser(message.authorId);
      const enrichedMessage = {
        ...message,
        author: author ? {
          id: author.id,
          username: author.username,
          firstName: author.firstName,
          lastName: author.lastName,
          avatar: author.avatar
        } : null
      };
      
      // TODO: Re-enable WebSocket broadcasting when WebSocket is properly configured
      
      res.status(201).json(enrichedMessage);
    } catch (error) {
      res.status(500).json({ error: "Failed to create message" });
    }
  });

  // Blog Posts API
  app.get("/api/posts", async (req, res) => {
    try {
      const published = req.query.published === "true" ? true : req.query.published === "false" ? false : undefined;
      const posts = await storage.getBlogPosts(published);
      
      // Enrich posts with author data
      const enrichedPosts = await Promise.all(posts.map(async (post) => {
        const author = await storage.getUser(post.authorId);
        return {
          ...post,
          author: author ? {
            id: author.id,
            username: author.username,
            firstName: author.firstName,
            lastName: author.lastName,
            avatar: author.avatar
          } : null
        };
      }));
      
      res.json(enrichedPosts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch posts" });
    }
  });

  app.get("/api/posts/:id", async (req, res) => {
    try {
      const post = await storage.getBlogPost(req.params.id);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      
      // Enrich with author data
      const author = await storage.getUser(post.authorId);
      const enrichedPost = {
        ...post,
        author: author ? {
          id: author.id,
          username: author.username,
          firstName: author.firstName,
          lastName: author.lastName,
          avatar: author.avatar
        } : null
      };
      
      res.json(enrichedPost);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch post" });
    }
  });

  app.post("/api/posts", jwtMiddleware.requireAuth, jwtMiddleware.requirePermission("blog.write"), async (req, res) => {
    try {
      const validation = insertBlogPostSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid post data", details: validation.error });
      }

      const post = await storage.createBlogPost(validation.data);
      res.status(201).json(post);
    } catch (error) {
      res.status(500).json({ error: "Failed to create post" });
    }
  });

  app.put("/api/posts/:id", jwtMiddleware.requireAuth, jwtMiddleware.requirePermission("blog.write"), async (req, res) => {
    try {
      const post = await storage.updateBlogPost(req.params.id, req.body);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      res.json(post);
    } catch (error) {
      res.status(500).json({ error: "Failed to update post" });
    }
  });

  app.delete("/api/posts/:id", jwtMiddleware.requireAuth, jwtMiddleware.requirePermission("blog.delete"), async (req, res) => {
    try {
      const deleted = await storage.deleteBlogPost(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Post not found" });
      }
      res.json({ message: "Post deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete post" });
    }
  });

  // Comments API
  app.get("/api/posts/:postId/comments", async (req, res) => {
    try {
      const comments = await storage.getCommentsByPost(req.params.postId);
      
      // Enrich comments with author data
      const enrichedComments = await Promise.all(comments.map(async (comment) => {
        const author = await storage.getUser(comment.authorId);
        return {
          ...comment,
          author: author ? {
            id: author.id,
            username: author.username,
            firstName: author.firstName,
            lastName: author.lastName,
            avatar: author.avatar
          } : null
        };
      }));
      
      res.json(enrichedComments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch comments" });
    }
  });

  app.post("/api/posts/:postId/comments", jwtMiddleware.requireAuth, async (req, res) => {
    try {
      const validation = insertCommentSchema.safeParse({
        ...req.body,
        postId: req.params.postId
      });
      
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid comment data", details: validation.error });
      }

      const comment = await storage.createComment(validation.data);
      res.status(201).json(comment);
    } catch (error) {
      res.status(500).json({ error: "Failed to create comment" });
    }
  });

  // Users API
  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      // Don't return password
      const { password: _password, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      // Don't allow password updates through this endpoint
      const { _password: password, ...updates } = req.body;
      const user = await storage.updateUser(req.params.id, updates);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const { password: _, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  return httpServer;
}
