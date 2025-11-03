import { 
  type User, type InsertUser,
  type Channel, type InsertChannel,
  type Message, type InsertMessage,
  type BlogPost, type InsertBlogPost,
  type Comment, type InsertComment
} from "@shared/schema";
import { randomUUID } from "node:crypto";

// Storage interface with all CRUD methods
export interface IStorage {
  // Users
  getUser(_id: string): Promise<User | undefined>;
  getUserByUsername(_username: string): Promise<User | undefined>;
  createUser(_user: InsertUser): Promise<User>;
  updateUser(_id: string, _updates: Partial<User>): Promise<User | undefined>;
  
  // Channels
  getChannel(_id: string): Promise<Channel | undefined>;
  getChannels(): Promise<Channel[]>;
  createChannel(_channel: InsertChannel): Promise<Channel>;
  
  // Messages
  getMessage(_id: string): Promise<Message | undefined>;
  getMessagesByChannel(_channelId: string): Promise<Message[]>;
  createMessage(_message: InsertMessage): Promise<Message>;
  
  // Blog Posts
  getBlogPost(_id: string): Promise<BlogPost | undefined>;
  getBlogPosts(_published?: boolean): Promise<BlogPost[]>;
  getBlogPostsByAuthor(_authorId: string): Promise<BlogPost[]>;
  createBlogPost(_post: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(_id: string, _updates: Partial<BlogPost>): Promise<BlogPost | undefined>;
  deleteBlogPost(_id: string): Promise<boolean>;
  
  // Comments
  getComment(_id: string): Promise<Comment | undefined>;
  getCommentsByPost(_postId: string): Promise<Comment[]>;
  createComment(_comment: InsertComment): Promise<Comment>;
  deleteComment(_id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private readonly users: Map<string, User>;
  private readonly channels: Map<string, Channel>;
  private readonly messages: Map<string, Message>;
  private readonly blogPosts: Map<string, BlogPost>;
  private readonly comments: Map<string, Comment>;

  constructor() {
    this.users = new Map();
    this.channels = new Map();
    this.messages = new Map();
    this.blogPosts = new Map();
    this.comments = new Map();
  }

  /**
   * Initialize demo data. Must be called after construction.
   */
  public async initialize(): Promise<void> {
    await this.initDemoData();
  }

  private async initDemoData() {
    // Create demo users
    const users = [
      { id: "1", username: "admin", password: "admin", firstName: "Админ", lastName: "Система", role: "admin", avatar: "/assets/admin-avatar.jpg" },
      { id: "2", username: "anna", password: "anna", firstName: "Анна", lastName: "Волкова", role: "user", avatar: "/assets/avatar-anna.jpg" },
      { id: "3", username: "igor", password: "igor", firstName: "Игорь", lastName: "Петров", role: "user", avatar: "/assets/avatar-igor.jpg" },
    ];
    
    for (const user of users) {
      const fullUser: User = {
        ...user,
        firstName: user.firstName,
        lastName: user.lastName,
        middleName: null,
        email: null,
        phone: null,
        avatar: user.avatar,
        role: user.role
      };
      this.users.set(user.id, fullUser);
    }

    // Create demo channels
    const generalChannel: Channel = {
      id: "general",
      name: "Общий канал",
      description: "Основной канал для общения",
      type: "public",
      createdBy: "1",
      createdAt: new Date()
    };
    this.channels.set("general", generalChannel);

    // Create demo messages
    const messages = [
      { id: "1", channelId: "general", authorId: "2", content: "Отличная статья про React! Очень помогла разобраться с хуками", messageType: "text" },
      { id: "2", channelId: "general", authorId: "3", content: "Кто-нибудь пробовал новую версию NextJS?", messageType: "text" },
      { id: "3", channelId: "general", authorId: "1", content: "Добро пожаловать в наш мессенджер! 👋", messageType: "text" },
    ];
    
    for (const msg of messages) {
      const fullMessage: Message = {
        ...msg,
        attachments: null,
        createdAt: new Date()
      };
      this.messages.set(msg.id, fullMessage);
    }

    // Create demo blog posts
    const posts = [
      { id: "1", title: "Введение в React Hooks", content: "React Hooks изменили способ написания компонентов...", excerpt: "Узнайте о новых возможностях React", authorId: "2", published: true, commentsEnabled: true },
      { id: "2", title: "Настройка TypeScript проекта", content: "Пошаговое руководство по настройке TypeScript...", excerpt: "Полное руководство по TypeScript", authorId: "3", published: true, commentsEnabled: true },
    ];
    
    for (const post of posts) {
      const fullPost: BlogPost = {
        ...post,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.blogPosts.set(post.id, fullPost);
    }
  }

  // Users methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
      const user: User = {
        ...insertUser,
        id,
        firstName: null,
        lastName: null,
        middleName: null,
        email: null,
        phone: null,
        avatar: null,
        role: "user",
        password: "",
        username: "",
      };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Channels methods
  async getChannel(id: string): Promise<Channel | undefined> {
    return this.channels.get(id);
  }

  async getChannels(): Promise<Channel[]> {
    return Array.from(this.channels.values());
  }

  async createChannel(insertChannel: InsertChannel): Promise<Channel> {
    const id = randomUUID();
    const channel: Channel = { 
      id,
      name: insertChannel.name,
      description: insertChannel.description || null,
      type: insertChannel.type || "public",
      createdBy: insertChannel.createdBy || null,
      createdAt: new Date()
    };
    this.channels.set(id, channel);
    return channel;
  }

  // Messages methods
  async getMessage(id: string): Promise<Message | undefined> {
    return this.messages.get(id);
  }

  async getMessagesByChannel(channelId: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.channelId === channelId)
      .sort((a, b) => a.createdAt!.getTime() - b.createdAt!.getTime());
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const message: Message = { 
      id,
      channelId: insertMessage.channelId,
      authorId: insertMessage.authorId,
      content: insertMessage.content,
      attachments: insertMessage.attachments || null,
      messageType: insertMessage.messageType || "text",
      createdAt: new Date()
    };
    this.messages.set(id, message);
    return message;
  }

  // Blog Posts methods
  async getBlogPost(id: string): Promise<BlogPost | undefined> {
    return this.blogPosts.get(id);
  }

  async getBlogPosts(published?: boolean): Promise<BlogPost[]> {
    const posts = Array.from(this.blogPosts.values());
    if (published !== undefined) {
      return posts.filter(post => post.published === published);
    }
    return posts.sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async getBlogPostsByAuthor(authorId: string): Promise<BlogPost[]> {
    return Array.from(this.blogPosts.values())
      .filter(post => post.authorId === authorId)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async createBlogPost(insertPost: InsertBlogPost): Promise<BlogPost> {
    const id = randomUUID();
    const post: BlogPost = { 
      id,
      title: insertPost.title,
      content: insertPost.content,
      excerpt: insertPost.excerpt || null,
      authorId: insertPost.authorId,
      published: insertPost.published || false,
      commentsEnabled: insertPost.commentsEnabled !== false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.blogPosts.set(id, post);
    return post;
  }

  async updateBlogPost(id: string, updates: Partial<BlogPost>): Promise<BlogPost | undefined> {
    const post = this.blogPosts.get(id);
    if (!post) return undefined;
    
    const updatedPost = { ...post, ...updates, updatedAt: new Date() };
    this.blogPosts.set(id, updatedPost);
    return updatedPost;
  }

  async deleteBlogPost(id: string): Promise<boolean> {
    return this.blogPosts.delete(id);
  }

  // Comments methods
  async getComment(id: string): Promise<Comment | undefined> {
    return this.comments.get(id);
  }

  async getCommentsByPost(postId: string): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter(comment => comment.postId === postId)
      .sort((a, b) => a.createdAt!.getTime() - b.createdAt!.getTime());
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const id = randomUUID();
    const comment: Comment = {
      ...insertComment,
      id,
      createdAt: new Date(),
      content: "",
      authorId: "",
      postId: "",
    };
    this.comments.set(id, comment);
    return comment;
  }

  async deleteComment(id: string): Promise<boolean> {
    return this.comments.delete(id);
  }
}

export const storage = new MemStorage();
