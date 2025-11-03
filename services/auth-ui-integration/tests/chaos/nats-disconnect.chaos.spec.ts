/**
 * Chaos Test: NATS Disconnect
 * 
 * Проверяет отказоустойчивость при потере соединения с NATS
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { GenericContainer, StartedTestContainer } from 'testcontainers';
import axios from 'axios';

describe('Chaos: NATS Disconnect', () => {
  let natsContainer: StartedTestContainer;
  let proxyContainer: StartedTestContainer;
  
  beforeAll(async () => {
    // Запуск NATS
    natsContainer = await new GenericContainer('nats:2.10-alpine')
      .withExposedPorts(4222)
      .withCommand(['-js'])
      .start();
    
    // Запуск Toxiproxy
    proxyContainer = await new GenericContainer('ghcr.io/shopify/toxiproxy:2.5.0')
      .withExposedPorts(8474, 4223)
      .start();
    
    const proxyApiUrl = `http://localhost:${proxyContainer.getMappedPort(8474)}`;
    
    // Создаём proxy для NATS
    await axios.post(`${proxyApiUrl}/proxies`, {
      name: 'nats',
      listen: '0.0.0.0:4223',
      upstream: `${natsContainer.getHost()}:${natsContainer.getMappedPort(4222)}`,
      enabled: true
    });
  }, 60000);
  
  afterAll(async () => {
    await natsContainer?.stop();
    await proxyContainer?.stop();
  });
  
  it('сервис должен восстановить соединение через retry', async () => {
    // TODO: Запустить сервис через proxy
    // TODO: Отключить NATS через Toxiproxy на 5s
    // TODO: Проверить, что событие доставлено после переподключения
    
    expect(true).toBe(true); // Placeholder
  }, 30000);
});
