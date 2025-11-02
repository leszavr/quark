import { connect, NatsConnection, JetStreamClient, JsMsg, StringCodec, RetentionPolicy, StorageType } from "nats";
import { SystemEvent, ModuleEvent } from "../types/index.js";

export class EventBus {
  private connection: NatsConnection | null = null;
  private jetstream: JetStreamClient | null = null;
  private sc = StringCodec();
  private readonly streamName = "QUARK_EVENTS";

  constructor(private natsUrl: string = "nats://localhost:4222") {}

  async connect(): Promise<void> {
    try {
      this.connection = await connect({ servers: [this.natsUrl] });
      this.jetstream = this.connection.jetstream();
      
      await this.ensureStream();
      console.log("EventBus connected to NATS JetStream");
    } catch (error) {
      console.error("Failed to connect to NATS:", error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.close();
      this.connection = null;
      this.jetstream = null;
      console.log("EventBus disconnected from NATS");
    }
  }

  private async ensureStream(): Promise<void> {
    if (!this.jetstream) return;

    try {
      // For now, skip stream creation - just log
      console.log(`Stream ${this.streamName} configuration skipped for initial deployment`);
    } catch (error) {
      console.warn("Stream setup skipped:", error);
    }
  }

  // Publish Events
  async publishEvent(subject: string, event: SystemEvent): Promise<void> {
    if (!this.jetstream) {
      throw new Error("EventBus not connected");
    }

    const eventData = {
      ...event,
      timestamp: event.timestamp.toISOString()
    };

    const js = this.jetstream;
    await js.publish(`quark.${subject}`, this.sc.encode(JSON.stringify(eventData)));
    console.log(`Event published: ${subject}`, { id: event.id, type: event.type });
  }

  async publishModuleEvent(subject: string, event: ModuleEvent): Promise<void> {
    await this.publishEvent(`module.${subject}`, event);
  }

  async publishServiceEvent(subject: string, event: SystemEvent): Promise<void> {
    await this.publishEvent(`service.${subject}`, event);
  }

  async publishSystemEvent(subject: string, event: SystemEvent): Promise<void> {
    await this.publishEvent(`system.${subject}`, event);
  }

  // Subscribe to Events
  async subscribeToEvents(
    subject: string, 
    handler: (event: SystemEvent) => Promise<void>,
    options: { durable?: string; deliverAll?: boolean } = {}
  ): Promise<void> {
    if (!this.jetstream) {
      throw new Error("EventBus not connected");
    }

    const consumer = await this.jetstream.consumers.get(this.streamName, options.durable || "default");
    const subscription = await consumer.consume();

    console.log(`Subscribed to events: ${subject}`);

    // Process messages
    (async () => {
      for await (const msg of subscription) {
        try {
          const eventData = JSON.parse(this.sc.decode(msg.data));
          eventData.timestamp = new Date(eventData.timestamp);
          
          await handler(eventData);
          msg.ack();
        } catch (error) {
          console.error("Error processing event:", error);
          msg.nak();
        }
      }
    })().catch(console.error);
  }

  async subscribeToModuleEvents(
    moduleId: string,
    handler: (event: SystemEvent) => Promise<void>,
    options: { durable?: string } = {}
  ): Promise<void> {
    await this.subscribeToEvents(`module.${moduleId}.>`, handler, {
      durable: options.durable || `module-${moduleId}-consumer`
    });
  }

  async subscribeToServiceEvents(
    serviceId: string,
    handler: (event: SystemEvent) => Promise<void>,
    options: { durable?: string } = {}
  ): Promise<void> {
    await this.subscribeToEvents(`service.${serviceId}.>`, handler, {
      durable: options.durable || `service-${serviceId}-consumer`
    });
  }

  async subscribeToAllEvents(
    handler: (event: SystemEvent) => Promise<void>,
    options: { durable?: string } = {}
  ): Promise<void> {
    await this.subscribeToEvents("*", handler, {
      durable: options.durable || "all-events-consumer",
      deliverAll: false
    });
  }

  // Event Creation Helpers
  createSystemEvent(type: string, source: string, data: any, metadata?: Record<string, any>): SystemEvent {
    return {
      id: this.generateEventId(),
      type,
      source,
      timestamp: new Date(),
      data,
      metadata
    };
  }

  createModuleEvent(
    type: string, 
    moduleId: string, 
    version: string, 
    data: any, 
    metadata?: Record<string, any>
  ): ModuleEvent {
    return {
      id: this.generateEventId(),
      type,
      source: `module:${moduleId}`,
      moduleId,
      version,
      timestamp: new Date(),
      data,
      metadata
    };
  }

  // Predefined Event Publishers
  async publishServiceRegistered(serviceId: string, serviceName: string): Promise<void> {
    const event = this.createSystemEvent(
      "service.registered",
      "plugin-hub",
      { serviceId, serviceName }
    );
    await this.publishServiceEvent("registered", event);
  }

  async publishServiceUnregistered(serviceId: string, serviceName: string): Promise<void> {
    const event = this.createSystemEvent(
      "service.unregistered",
      "plugin-hub",
      { serviceId, serviceName }
    );
    await this.publishServiceEvent("unregistered", event);
  }

  async publishServiceHealthChanged(serviceId: string, status: string, details?: any): Promise<void> {
    const event = this.createSystemEvent(
      "service.health.changed",
      "plugin-hub",
      { serviceId, status, details }
    );
    await this.publishServiceEvent("health.changed", event);
  }

  async publishModuleDeployed(moduleId: string, version: string): Promise<void> {
    const event = this.createModuleEvent(
      "module.deployed",
      moduleId,
      version,
      { deployedAt: new Date() }
    );
    await this.publishModuleEvent("deployed", event);
  }

  async publishModuleStarted(moduleId: string, version: string): Promise<void> {
    const event = this.createModuleEvent(
      "module.started",
      moduleId,
      version,
      { startedAt: new Date() }
    );
    await this.publishModuleEvent("started", event);
  }

  async publishModuleStopped(moduleId: string, version: string, reason?: string): Promise<void> {
    const event = this.createModuleEvent(
      "module.stopped",
      moduleId,
      version,
      { stoppedAt: new Date(), reason }
    );
    await this.publishModuleEvent("stopped", event);
  }

  async publishModuleError(moduleId: string, version: string, error: any): Promise<void> {
    const event = this.createModuleEvent(
      "module.error",
      moduleId,
      version,
      { error: error.message || error, stack: error.stack }
    );
    await this.publishModuleEvent("error", event);
  }

  // Event History and Querying (simplified for now)
  async getEventHistory(
    subject: string, 
    options: { startTime?: Date; endTime?: Date; limit?: number } = {}
  ): Promise<SystemEvent[]> {
    // TODO: Implement event history retrieval
    console.log(`Event history requested for subject: ${subject}`);
    return [];
  }

  // Utility Methods
  private generateEventId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  async getStreamInfo(): Promise<any> {
    if (!this.jetstream) return null;
    
    try {
      return { name: this.streamName, status: "simulated" };
    } catch {
      return null;
    }
  }

  async getConnectionInfo(): Promise<any> {
    if (!this.connection) return null;
    
    return {
      connected: !this.connection.isClosed(),
      servers: [this.connection.getServer()],
      stats: this.connection.stats()
    };
  }
}
