# Quark Manager Tools - Node.js Модули

## 📦 Обзор

Инструменты управления МКС Quark реализованы на TypeScript/Node.js для высокой производительности и удобства поддержки.

## 🛠️ Доступные модули

### 1. `check-packages.js` - Проверка устаревших пакетов

**Использование:**
```bash
# Через quark-manager
./quark-manager.sh start  # автоматически проверяет перед запуском

# Напрямую
node tools/quark-manager/dist/check-packages.js --root .

# С JSON выводом для скриптов
node tools/quark-manager/dist/check-packages.js --json
```

**Возможности:**
- ✅ Параллельная проверка всех сервисов (ускорение ~2.6x)
- ✅ Разделение на MAJOR и MINOR обновления
- ✅ Интерактивное обновление minor/patch
- ✅ Красивый CLI вывод с прогрессом

**Exit codes:**
- `0` - все пакеты актуальны
- `1` - есть MAJOR обновления
- `2` - есть minor/patch обновления
- `3` - ошибка выполнения

---

### 2. `vault-init.js` - Инициализация HashiCorp Vault

**Использование:**
```bash
# Через quark-manager (рекомендуется)
./quark-manager.sh vault:init

# Напрямую
node tools/quark-manager/dist/vault-init.js --root .

# С кастомными параметрами
node tools/quark-manager/dist/vault-init.js \
  --addr http://localhost:8200 \
  --token myroot \
  --root /path/to/project
```

**Опции:**
- `-a, --addr <url>` - Vault address (default: http://localhost:8200)
- `-t, --token <token>` - Vault root token (default: myroot)
- `-r, --root <path>` - Корневая директория проекта (default: cwd)
- `--skip-export` - Не создавать .env.local файл

**Что делает:**
1. ✅ Проверяет доступность Vault
2. ✅ Включает KV Secrets Engine v2
3. ✅ Создает секреты с сильными паролями:
   - `secret/database` - DB credentials
   - `secret/jwt` - JWT signing keys
   - `secret/minio` - MinIO credentials
   - `secret/redis` - Redis config
   - `secret/nats` - NATS credentials
4. ✅ Создает политики доступа для сервисов
5. ✅ Экспортирует `.env.local` для локальной разработки

**Генерируемые пароли:**
- Database: 32 символа (base64)
- JWT secret: 64 символа (base64)
- MinIO: 32 символа (base64)
- NATS: 32 символа (base64)

---

### 3. `security-check.js` - Проверка безопасности

**Использование:**
```bash
# Через quark-manager
./quark-manager.sh security:check

# Напрямую
node tools/quark-manager/dist/security-check.js --root .

# С установкой gitleaks
node tools/quark-manager/dist/security-check.js --install-gitleaks

# Только проверка .env (без сканирования)
node tools/quark-manager/dist/security-check.js --skip-scan
```

**Опции:**
- `-r, --root <path>` - Корневая директория проекта
- `-v, --verbose` - Подробный вывод
- `--install-gitleaks` - Установить gitleaks если отсутствует
- `--skip-scan` - Пропустить сканирование (только проверка .env)

**Проверки:**
1. ✅ Статус .env файлов (наличие .env, .env.example)
2. ✅ Сканирование кода на секреты (gitleaks)
3. ✅ Группировка результатов по файлам
4. ✅ Рекомендации по исправлению

**Exit codes:**
- `0` - всё чисто, секреты не найдены
- `1` - найдены секреты в коде
- `2` - ошибка выполнения

---

## 🚀 Разработка

### Структура проекта

```
tools/quark-manager/
├── src/
│   ├── check-packages.ts    # Проверка пакетов
│   ├── vault-init.ts        # Инициализация Vault
│   └── security-check.ts    # Проверка безопасности
├── dist/                     # Скомпилированные JS файлы
├── package.json
└── tsconfig.json
```

### Сборка

```bash
cd tools/quark-manager

# Установка зависимостей
pnpm install

# Сборка (TypeScript → JavaScript)
pnpm build

# Разработка с hot-reload
pnpm dev

# Type checking
pnpm type-check

# Linting
pnpm lint
```

### Добавление нового модуля

1. Создайте файл в `src/`:

```typescript
#!/usr/bin/env node
/**
 * Описание модуля
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';

const program = new Command();

program
  .name('quark-my-module')
  .description('Описание')
  .version('1.0.0')
  .option('-r, --root <path>', 'Корневая директория', process.cwd())
  .action(async (options: { root: string }) => {
    console.log(chalk.blue.bold('🚀 Запуск модуля...\n'));
    
    try {
      const spinner = ora('Выполнение...').start();
      
      // Ваш код здесь
      
      spinner.succeed(chalk.green('Готово!'));
      process.exit(0);
    } catch (error) {
      console.error(chalk.red.bold('\n❌ Ошибка:'));
      console.error(error);
      process.exit(1);
    }
  });

program.parse();
```

2. Обновите `package.json`:

```json
{
  "bin": {
    "quark-my-module": "./dist/my-module.js"
  },
  "scripts": {
    "my-module": "node --loader ts-node/esm src/my-module.ts"
  }
}
```

3. Добавьте команду в `quark-manager.sh`:

```bash
my-module)
    if command -v node &> /dev/null && [[ -f "$SCRIPT_DIR/tools/quark-manager/dist/my-module.js" ]]; then
        node "$SCRIPT_DIR/tools/quark-manager/dist/my-module.js" --root "$SCRIPT_DIR"
    else
        print_log "$RED" "ERROR" "❌ my-module.js не найден!"
        exit 1
    fi
    ;;
```

4. Соберите и протестируйте:

```bash
pnpm build
./quark-manager.sh my-module
```

---

## 📚 Используемые библиотеки

- **commander** - CLI аргументы и команды
- **chalk** - Цветной вывод в терминал
- **ora** - Спиннеры и прогресс
- **cli-progress** - Прогресс-бары
- **execa** - Выполнение shell команд
- **typescript** - Type safety

---

## 🔧 Интеграция с bash

### Пример использования в bash скриптах

```bash
#!/bin/bash

# Проверка пакетов с JSON выводом
RESULT=$(node tools/quark-manager/dist/check-packages.js --json)
EXIT_CODE=$?

if [ $EXIT_CODE -eq 1 ]; then
    echo "⚠️  Найдены MAJOR обновления"
elif [ $EXIT_CODE -eq 2 ]; then
    echo "✅ Есть minor обновления"
    # Автоматически обновляем
    pnpm update
else
    echo "✅ Все пакеты актуальны"
fi
```

### Интеграция с quark-manager.sh

Bash скрипт проверяет наличие Node.js версии и использует её с fallback на bash:

```bash
if command -v node &> /dev/null && [[ -f "$SCRIPT_DIR/tools/quark-manager/dist/vault-init.js" ]]; then
    # Используем Node.js версию (быстрее)
    node "$SCRIPT_DIR/tools/quark-manager/dist/vault-init.js" --root "$SCRIPT_DIR"
elif [ -f "$VAULT_INIT_SCRIPT" ]; then
    # Fallback на bash версию
    bash "$VAULT_INIT_SCRIPT"
else
    print_log "$RED" "ERROR" "❌ Vault init не найден!"
    exit 1
fi
```

---

## 🎯 Преимущества Node.js подхода

### Vs Bash скрипты:

✅ **Производительность**
- Параллельное выполнение операций
- Меньше subprocess spawn overhead
- check-packages: ~2.6x быстрее bash версии

✅ **Надежность**
- Type safety (TypeScript)
- Лучшая обработка ошибок
- Тестируемость (unit tests)

✅ **Удобство**
- Богатая экосистема npm пакетов
- JSON parsing из коробки
- Async/await для асинхронного кода

✅ **Поддержка**
- IDE autocomplete и type checking
- Легче рефакторинг
- Меньше багов с escaping и quoting

### Когда использовать bash:

- Простые операции с файлами (cp, mv, rm)
- Оркестрация Docker Compose
- Системные команды (systemctl, etc)
- Быстрые one-liner'ы

---

## 📊 Performance сравнение

### check-packages

**Bash версия** (sequential):
```
auth-service:  5.2s
blog-service:  4.8s
quark-ui:      6.1s
plugin-hub:    4.5s
Total:        20.6s
```

**Node.js версия** (parallel):
```
All services: 7.9s (2.6x faster)
```

### vault-init

**Bash версия**:
```
Total: 3.2s
```

**Node.js версия**:
```
Total: 1.8s (1.8x faster)
```

---

## 🔗 См. также

- [Vault Integration Guide](../../docs/vault-integration.md)
- [Security Checks CI/CD](../../.github/workflows/security-checks.yml)
- [Quark Manager Documentation](../../docs/quark-manager.md)

---

## 💡 Tips & Tricks

### Debug mode

```bash
# Установите NODE_ENV=development для подробных логов
NODE_ENV=development node tools/quark-manager/dist/vault-init.js
```

### Профилирование

```bash
# Используйте --prof для V8 profiler
node --prof tools/quark-manager/dist/check-packages.js
node --prof-process isolate-*.log > profile.txt
```

### Memory usage

```bash
# Проверка использования памяти
/usr/bin/time -v node tools/quark-manager/dist/security-check.js
```
