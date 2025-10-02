import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMessageSchema, insertBlogPostSchema, insertCommentSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

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

  app.post("/api/channels/:channelId/messages", async (req, res) => {
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
      const published = req.query.published === 'true' ? true : req.query.published === 'false' ? false : undefined;
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

  app.post("/api/posts", async (req, res) => {
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

  app.put("/api/posts/:id", async (req, res) => {
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

  app.delete("/api/posts/:id", async (req, res) => {
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

  app.post("/api/posts/:postId/comments", async (req, res) => {
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
      const { password, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      // Don't allow password updates through this endpoint
      const { password, ...updates } = req.body;
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
