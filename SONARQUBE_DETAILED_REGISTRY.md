# Детальный реестр ошибок по файлам

**Дата:** 2 ноября 2025  
**Всего файлов:** 6  
**Всего проблем:** 40

---

## 📍 Файл 1: AIAgentTab.tsx

**Путь:** `infra/quark-ui/src/components/profile/AIAgentTab.tsx`  
**Проблем:** 12  
**Severity:** WARNING  
**Тип:** Неиспользуемые переменные

### Проблемы (по строкам)

| Строка | Правило | Переменная | Тип | Решение |
|--------|---------|-----------|-----|---------|
| 2 | `no-unused-vars` | `useToast` | Импорт | Удалить или использовать |
| 3 | `no-unused-vars` | `VStack` | Импорт | Удалить или использовать |
| 3 | `no-unused-vars` | `HStack` | Импорт | Удалить или использовать |
| 3 | `no-unused-vars` | `Text` | Импорт | Удалить или использовать |
| 3 | `no-unused-vars` | `Card`, `CardHeader`, `CardBody` | Импорт | Удалить или использовать |
| 4 | `no-unused-vars` | `Slider`, `SliderMark`, `SliderTrack` | Импорт | Удалить или использовать |
| 5 | `no-unused-vars` | `useColorMode` | Импорт | Удалить - не используется |
| 6 | `no-unused-vars` | `AlertIcon` | Импорт | Удалить или использовать |
| 7 | `no-unused-vars` | `FiSave`, `FiSettings`, `FiEdit2`, `FiX` | Импорт | Удалить или использовать |
| 14 | `no-unused-vars` | `colorMode` | Присваивание | Удалить строку 15 |

### Действие
```bash
# Удалить неиспользуемые импорты вручную или через IDE
# Либо запустить автофикс
pnpm exec eslint infra/quark-ui/src/components/profile/AIAgentTab.tsx --fix
```

---

## 📍 Файл 2: DangerZoneTab.tsx

**Путь:** `infra/quark-ui/src/components/profile/DangerZoneTab.tsx`  
**Проблем:** 8  
**Severity:** WARNING  
**Тип:** Неиспользуемые переменные

### Проблемы (по строкам)

| Строка | Правило | Переменная | Тип | Статус |
|--------|---------|-----------|-----|--------|
| 48 | `@typescript-eslint/no-unused-vars` | `FiClock` | Импорт icon | ❌ Не используется |
| 89 | `@typescript-eslint/no-unused-vars` | `deletionSteps` | State | ❌ Не используется |
| 89 | `@typescript-eslint/no-unused-vars` | `setDeletionSteps` | State setter | ❌ Не используется |
| 90 | `@typescript-eslint/no-unused-vars` | `currentStep` | State | ❌ Не используется |
| 90 | `@typescript-eslint/no-unused-vars` | `setCurrentStep` | State setter | ❌ Не используется |
| 101 | `@typescript-eslint/no-unused-vars` | `colorMode` | useColorMode | ❌ Не используется |
| 144 | `@typescript-eslint/no-unused-vars` | `error` | Catch parameter | ❌ Не используется |
| 213 | `@typescript-eslint/no-unused-vars` | `error` | Catch parameter | ❌ Не используется |

### Исправление

**Для catch параметров используй prefix `_`:**
```typescript
// ❌ Было
catch (error) {
  // error не используется
}

// ✅ Стало
catch (_error) {
  // Явно показываем, что ошибка не используется
}
```

**Для неиспользуемого state просто удали:**
```typescript
// ❌ Было
const [deletionSteps, setDeletionSteps] = useState<DeletionStep[]>(DELETION_STEPS);
const [currentStep, setCurrentStep] = useState(0);

// ✅ Стало
// Просто удалить эти две строки, если они действительно не используются
```

---

## 📍 Файл 3: PersonalizationTab.tsx

**Путь:** `infra/quark-ui/src/components/profile/PersonalizationTab.tsx`  
**Проблем:** 2  
**Severity:** WARNING

### Проблемы

| Строка | Правило | Переменная | Тип |
|--------|---------|-----------|-----|
| 4 | `@typescript-eslint/no-unused-vars` | `Box` | Импорт |
| 112 | `@typescript-eslint/no-unused-vars` | `error` | Catch parameter |

### Исправление

```typescript
// ❌ Строка 4 - удалить Box из импорта
import { Box, Button, ... } from "@chakra-ui/react";

// ✅ Изменить на
import { Button, ... } from "@chakra-ui/react";

// ❌ Строка 112 - переименовать в catch
catch (error) { ... }

// ✅ Изменить на
catch (_error) { ... }
```

---

## 📍 Файл 4: SecurityTab.tsx

**Путь:** `infra/quark-ui/src/components/profile/SecurityTab.tsx`  
**Проблем:** 3  
**Severity:** WARNING

### Проблемы

| Строка | Правило | Переменная | Тип | Статус |
|--------|---------|-----------|-----|--------|
| 40 | `@typescript-eslint/no-unused-vars` | `FiCheck` | Импорт icon | ❌ |
| 103 | `@typescript-eslint/no-unused-vars` | `colorMode` | Переменная | ❌ |
| 239 | `@typescript-eslint/no-unused-vars` | `error` | Catch parameter | ❌ |

### Исправление

```bash
# Удалить FiCheck из импорта на строке 40
# Удалить colorMode на строке 103
# Переименовать error на _error на строке 239
```

---

## 📍 Файл 5: SupportTab.tsx

**Путь:** `infra/quark-ui/src/components/profile/SupportTab.tsx`  
**Проблем:** 4  
**Severity:** WARNING

### Проблемы

| Строка | Правило | Переменная | Действие |
|--------|---------|-----------|---------|
| 38 | `no-unused-vars` | `FiHelpCircle` | Удалить из импорта |
| 39 | `no-unused-vars` | `FiAlertTriangle` | Удалить из импорта |
| 40 | `no-unused-vars` | `FiTool` | Удалить из импорта |
| 144 | `no-unused-vars` | `error` | Переименовать в `_error` |

---

## 📍 Файл 6: App.tsx (blog-service)

**Путь:** `services/blog-service/client/src/App.tsx`  
**Проблем:** 2  
**Severity:** WARNING

### Проблемы

| Строка | Правило | Переменная | Действие |
|--------|---------|-----------|---------|
| - | `no-unused-vars` | ? | Требует проверки |
| - | `no-regex-spaces` | ? | Требует проверки |

---

## 📊 Статистика по типам проблем

```
┌─────────────────────────────────────────┐
│  Типы проблем по файлам                │
├─────────────────────────────────────────┤
│ AIAgentTab.tsx:          [████████] 12  │
│ DangerZoneTab.tsx:       [██████] 8     │
│ SupportTab.tsx:          [██████] 8     │
│ SecurityTab.tsx:         [██████] 8     │
│ PersonalizationTab.tsx:  [██] 2         │
│ App.tsx:                 [██] 2         │
├─────────────────────────────────────────┤
│ ИТОГО:                   40 проблем     │
└─────────────────────────────────────────┘
```

---

## 🚀 Скрипт для автоматического исправления

```bash
#!/bin/bash

echo "🔧 Запуск ESLint --fix на профилях..."

# Исправить все profile файлы
pnpm exec eslint infra/quark-ui/src/components/profile/ --fix --ext .ts,.tsx

# Исправить blog-service
pnpm exec eslint services/blog-service/client/src/ --fix --ext .ts,.tsx

echo "✅ Автоматическое исправление завершено"

echo ""
echo "📋 Проверка результатов..."
pnpm exec eslint . --format=compact
```

---

## 💡 Рекомендации по предотвращению

### 1. IDE Extensions

Установить в VS Code:
- ESLint (Microsoft)
- TypeScript Vue Plugin (Vue)

### 2. Prettier Configuration

```json
// .prettierrc.json
{
  "semi": true,
  "trailingComma": "es5",
  "tabWidth": 2,
  "singleQuote": false
}
```

### 3. Pre-commit Hook

```bash
#!/bin/sh
# .husky/pre-commit

pnpm exec lint-staged
```

```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": "eslint --fix",
    "*.{ts,tsx,json,md}": "prettier --write"
  }
}
```

### 4. GitHub Actions

```yaml
# .github/workflows/lint.yml
name: Lint
on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm exec eslint . --max-warnings 0
```

---

**Отчёт автоматически создан:** 2 ноября 2025
