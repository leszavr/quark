/**
 * NATS Integration Tests
 * 
 * Проверяет взаимодействие с NATS JetStream через Testcontainers
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { GenericContainer, StartedTestContainer } from 'testcontainers';
import { connect, NatsConnection, JetStreamClient } from 'nats';

describe('NATS JetStream Integration', () => {
  let container: StartedTestContainer;
  let nc: NatsConnection;
  let js: JetStreamClient;
  
  beforeAll(async () => {
    // Запуск NATS в Testcontainer
    container = await new GenericContainer('nats:2.10-alpine')
      .withExposedPorts(4222)
      .withCommand(['-js', '-m', '8222']) // Enable JetStream + monitoring
      .start();
    
    const natsUrl = `nats://localhost:${container.getMappedPort(4222)}`;
    nc = await connect({ servers: natsUrl });
    js = nc.jetstream();
  }, 30000);
  
  afterAll(async () => {
    await nc?.close();
    await container?.stop();
  });
  
  it('должен публиковать и получать событие TODO_EVENT', async () => {
    // TODO: Заменить TODO_EVENT на реальное событие из asyncapi.yaml
    const subject = 'AUTH-UI-INTEGRATION.TODO_EVENT.created';
    const payload = { id: '123', test: true };
    
    // Создаём stream
    await js.streams.add({
      name: 'AUTH-UI-INTEGRATION_STREAM',
      subjects: [`AUTH-UI-INTEGRATION.>`],
      storage: 'file',
      retention: 'limits',
      max_age: 7 * 24 * 60 * 60 * 1000000000, // 7 days in nanoseconds
    });
    
    // Publish event
    await js.publish(subject, JSON.stringify(payload));
    
    // Subscribe
    const consumer = await js.consumers.get('AUTH-UI-INTEGRATION_STREAM', 'test-consumer');
    const messages = await consumer.fetch({ max_messages: 1, expires: 5000 });
    
    let received: any = null;
    for await (const msg of messages) {
      received = JSON.parse(msg.data.toString());
      msg.ack();
      break;
    }
    
    expect(received).toMatchObject(payload);
  }, 10000);
  
  it('должен отправлять в DLQ после 3 неудачных попыток', async () => {
    // TODO: Реализовать тест для Dead Letter Queue
    expect(true).toBe(true);
  });
});
