import { connect, NatsConnection, JetStreamManager, JetStreamClient } from 'nats';
import { EventMessage } from '../models/types';
import { v4 as uuidv4 } from 'uuid';

export class EventBus {
  private connection: NatsConnection | null = null;
  private jetstream: JetStreamClient | null = null;
  private jsm: JetStreamManager | null = null;

  async connect(url: string = 'nats://localhost:4222'): Promise<void> {
    try {
      this.connection = await connect({ servers: url });
      this.jetstream = this.connection.jetstream();
      this.jsm = await this.connection.jetstreamManager();
      
      // Создаем основные стримы
      await this.setupStreams();
      
      console.log('🚀 Connected to NATS JetStream');
    } catch (error) {
      console.error('❌ Failed to connect to NATS:', error);
      throw error;
    }
  }

  private async setupStreams(): Promise<void> {
    if (!this.jsm) return;

    const streams = [
      {
        name: 'QUARK_EVENTS',
        subjects: ['quark.events.*'],
        description: 'Main events stream for Quark platform',
      },
      {
        name: 'QUARK_HEALTH',
        subjects: ['quark.health.*'],
        description: 'Health check events',
      },
      {
        name: 'QUARK_AUDIT',
        subjects: ['quark.audit.*'],
        description: 'Audit and logging events',
      },
    ];

    for (const streamConfig of streams) {
      try {
        await this.jsm.streams.add({
          name: streamConfig.name,
          subjects: streamConfig.subjects,
          max_age: 7 * 24 * 60 * 60 * 1000 * 1000000, // 7 дней в наносекундах
        });
        console.log(`✅ Stream created/updated: ${streamConfig.name}`);
      } catch (error: any) {
        if (error.message.includes('already exists')) {
          console.log(`ℹ️ Stream already exists: ${streamConfig.name}`);
        } else {
          console.error(`❌ Failed to create stream ${streamConfig.name}:`, error);
        }
      }
    }
  }

  async publish(subject: string, data: any, source: string): Promise<void> {
    if (!this.jetstream) {
      throw new Error('JetStream not connected');
    }

    const event: EventMessage = {
      id: uuidv4(),
      type: subject,
      source,
      payload: data,
      timestamp: new Date(),
    };

    try {
      await this.jetstream.publish(subject, JSON.stringify(event));
      console.log(`📤 Event published: ${subject} from ${source}`);
    } catch (error) {
      console.error(`❌ Failed to publish event:`, error);
      throw error;
    }
  }

  async subscribe(subject: string, callback: (event: EventMessage) => Promise<void>): Promise<void> {
    if (!this.jetstream) {
      throw new Error('JetStream not connected');
    }

    try {
      const consumer = await this.jetstream.consumers.get('QUARK_EVENTS', `consumer_${subject.replace(/\./g, '_')}`);
      
      const messages = await consumer.consume();
      
      (async () => {
        for await (const message of messages) {
          try {
            const event: EventMessage = JSON.parse(message.string());
            await callback(event);
            message.ack();
            console.log(`📥 Event processed: ${event.type} from ${event.source}`);
          } catch (error) {
            console.error('❌ Failed to process event:', error);
            message.nak();
          }
        }
      })();

      console.log(`👂 Subscribed to: ${subject}`);
    } catch (error) {
      console.error(`❌ Failed to subscribe to ${subject}:`, error);
      throw error;
    }
  }

  async close(): Promise<void> {
    if (this.connection) {
      await this.connection.close();
      console.log('🔌 NATS connection closed');
    }
  }

  // Утилиты для стандартных событий
  async publishServiceEvent(type: 'register' | 'unregister' | 'health', serviceId: string, data: any): Promise<void> {
    await this.publish(`quark.events.service.${type}`, { serviceId, ...data }, 'plugin-hub');
  }

  async publishAuditEvent(action: string, userId?: string, details?: any): Promise<void> {
    await this.publish('quark.audit.action', { action, userId, details, timestamp: new Date() }, 'plugin-hub');
  }
}
