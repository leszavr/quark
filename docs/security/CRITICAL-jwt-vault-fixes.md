# Исправления архитектуры JWT/Vault - Приоритетная задача

## 🚨 Критические проблемы в архитектуре

### 1. Vault интеграция ОТСУТСТВУЕТ
**Проблема:** JWT_SECRET хранится в переменной окружения
**Риск:** Компрометация единого секрета = компрометация всей системы
**Решение:** Немедленная интеграция с Vault

### 2. Ротация секретов НЕ РЕАЛИЗОВАНА  
**Проблема:** Статический JWT_SECRET без ротации
**Риск:** Долгосрочная компрометация при утечке
**Решение:** Автоматическая ротация каждые 30 минут

### 3. Трехуровневая система НЕ РЕАЛИЗОВАНА
**Проблема:** Только User Tokens, нет Service и Hub Tokens
**Риск:** Небезопасное межсервисное взаимодействие
**Решение:** Полная реализация архитектуры

## 🎯 План исправления (в порядке приоритета)

### Этап 1: Vault интеграция (КРИТИЧНО)
1. Создать Vault клиент в Auth Service
2. Получать JWT_SECRET из Vault вместо env
3. Реализовать обновление секрета без перезапуска

### Этап 2: Service Tokens (ВЫСОКИЙ)
1. Отдельные токены для межсервисного взаимодействия
2. Plugin Hub выдает Service Tokens
3. Валидация Service Tokens в Auth Service

### Этап 3: Ротация секретов (ВЫСОКИЙ)  
1. Скрипт автоматической ротации JWT_SECRET
2. Уведомление всех сервисов о новом секрете
3. Graceful обновление без простоя

### Этап 4: Hub Tokens (СРЕДНИЙ)
1. Системные токены для Plugin Hub
2. Полные права на управление сервисами
3. Централизованная выдача токенов

## 🛠️ Техническая реализация

### Vault клиент для Auth Service
```typescript
import * as vault from 'node-vault';

@Injectable()
export class VaultService {
  private vault = vault({
    apiVersion: 'v1',
    endpoint: process.env.VAULT_URL || 'http://vault:8200',
    token: process.env.VAULT_TOKEN
  });

  async getJWTSecret(): Promise<string> {
    const result = await this.vault.read('secret/jwt');
    return result.data.secret;
  }

  async rotateJWTSecret(): Promise<string> {
    const newSecret = crypto.randomBytes(64).toString('hex');
    await this.vault.write('secret/jwt', { secret: newSecret });
    return newSecret;
  }
}
```

### Динамический JWT Module
```typescript
@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: async (vaultService: VaultService) => ({
        secret: await vaultService.getJWTSecret(),
        signOptions: { expiresIn: '15m' } // Короткий TTL
      }),
      inject: [VaultService],
    }),
  ],
})
export class AuthModule {}
```

### Service Token генерация
```typescript
generateServiceToken(serviceId: string): string {
  const payload = {
    sub: `service:${serviceId}`,
    service_id: serviceId,
    roles: ['service'],
    permissions: this.getServicePermissions(serviceId),
    iss: 'quark-plugin-hub',
    aud: this.getServiceAudience(serviceId)
  };
  
  return this.jwtService.sign(payload, { expiresIn: '1h' });
}
```

## ⚡ Немедленные действия

1. **Сейчас:** Vault интеграция в Auth Service
2. **Сегодня:** Service Tokens для Plugin Hub ↔ Auth Service
3. **Завтра:** Автоматическая ротация секретов
4. **Неделя:** Полная трехуровневая архитектура

## 🎯 Результат

После исправлений получим:
- ✅ Безопасное хранение секретов в Vault
- ✅ Автоматическая ротация каждые 30 минут  
- ✅ Трехуровневая система токенов
- ✅ Безопасное межсервисное взаимодействие
- ✅ Архитектурное соответствие документации

**Статус:** 🚨 КРИТИЧНО - требует немедленного исправления
