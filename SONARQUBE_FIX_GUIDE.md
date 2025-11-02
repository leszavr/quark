# Практический гайд исправления SonarQube ошибок

**Версия:** 1.0  
**Дата:** 2 ноября 2025  
**Для проекта:** Quark  

---

## 📚 Содержание

1. [Неиспользуемые переменные](#1-неиспользуемые-переменные)
2. [Catch параметры](#2-catch-параметры)
3. [Импорты Chakra UI](#3-импорты-chakra-ui)
4. [State переменные](#4-state-переменные)
5. [Regex проблемы](#5-regex-проблемы)
6. [Скрипты автоматизации](#6-скрипты-автоматизации)

---

## 1. Неиспользуемые переменные

### ❌ ПРОБЛЕМА: Импортированная иконка не используется

**Файл:** `AIAgentTab.tsx`, строка 15

```typescript
// ❌ БЫЛО (неправильно)
import { 
  FiCpu, 
  FiRefreshCw, 
  FiSettings, 
  FiZap, 
  FiTarget,      // ← НЕ ИСПОЛЬЗУЕТСЯ
  FiMessageSquare,
  FiEdit2        // ← НЕ ИСПОЛЬЗУЕТСЯ
} from "react-icons/fi";

export function AIAgentTab() {
  // ... компонент использует только FiCpu, FiRefreshCw, FiSettings
  return (
    <Icon as={FiCpu} />
    <Icon as={FiRefreshCw} />
  );
}
```

```typescript
// ✅ ИСПРАВЛЕНО (правильно)
import { 
  FiCpu, 
  FiRefreshCw, 
  FiSettings
} from "react-icons/fi";

export function AIAgentTab() {
  return (
    <Icon as={FiCpu} />
    <Icon as={FiRefreshCw} />
  );
}
```

### ❌ ПРОБЛЕМА: Импортированный компонент Chakra UI не используется

**Файл:** `PersonalizationTab.tsx`, строка 4

```typescript
// ❌ БЫЛО
import {
  Box,           // ← НЕ ИСПОЛЬЗУЕТСЯ
  Button,
  Card,
  ...
} from "@chakra-ui/react";
```

```typescript
// ✅ ИСПРАВЛЕНО
import {
  Button,
  Card,
  ...
} from "@chakra-ui/react";
```

### Методика в VS Code

1. **Автоматически через IDE:**
   - Нажми `Ctrl+Shift+O` (Quick Fix)
   - Выбери "Remove unused import"

2. **Через ESLint:**
   ```bash
   pnpm exec eslint src/components/profile/AIAgentTab.tsx --fix
   ```

3. **Через terminal:**
   ```bash
   # Удалить все неиспользуемые импорты в папке
   pnpm exec eslint src/components/profile/*.tsx --fix
   ```

---

## 2. Catch параметры

### ❌ ПРОБЛЕМА: Ошибка в catch блоке не используется

**Файл:** `DangerZoneTab.tsx`, строки 144, 213

```typescript
// ❌ БЫЛО (неправильно)
try {
  const userData = {
    profile: JSON.parse(localStorage.getItem("profileData") || "{}"),
    // ...
  };
  // ...
} catch (error) {  // ← error НЕ ИСПОЛЬЗУЕТСЯ
  toast({
    title: "Ошибка экспорта",
    description: "Не удалось экспортировать данные",
    status: "error"
  });
}
```

```typescript
// ✅ ИСПРАВЛЕНО (правильно) - Вариант 1
try {
  // ... код
} catch (_error) {  // ← Используй префикс _ для явного игнорирования
  toast({
    title: "Ошибка экспорта",
    description: "Не удалось экспортировать данные",
    status: "error"
  });
}
```

```typescript
// ✅ ИСПРАВЛЕНО (правильно) - Вариант 2 (если нужно логировать)
try {
  // ... код
} catch (error) {
  console.error("Export failed:", error);
  toast({
    title: "Ошибка экспорта",
    description: "Не удалось экспортировать данные",
    status: "error"
  });
}
```

### ESLint конфиг для catch параметров

```json
// .eslintrc.json
{
  "rules": {
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        "argsIgnorePattern": "^_",         // Игнорируй параметры с _
        "caughtErrorsIgnorePattern": "^_"  // Игнорируй error с _
      }
    ]
  }
}
```

---

## 3. Импорты Chakra UI

### ❌ ПРОБЛЕМА: Множественные неиспользуемые Chakra компоненты

**Файл:** `AIAgentTab.tsx`, строки 1-10

```typescript
// ❌ БЫЛО (10+ компонентов, большинство не используются)
import {
  VStack,           // ← Используется
  HStack,           // ← Используется
  Text,             // ← Используется
  Card,             // ← НЕ используется
  CardHeader,       // ← НЕ используется
  CardBody,         // ← НЕ используется
  Slider,           // ← НЕ используется
  SliderMark,       // ← НЕ используется
  SliderTrack,      // ← НЕ используется
  SliderFilledTrack,// ← НЕ используется
  SliderThumb,      // ← НЕ используется
  FormControl,      // ← Используется
  FormLabel,        // ← Используется
  Button,           // ← Используется
  useColorMode,     // ← НЕ используется
  Tab,
  Tabs,
  TabList,
  TabPanel,
  TabPanels,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Switch,
  Checkbox,
  Alert,
  AlertIcon,        // ← НЕ используется
  AlertTitle,
  AlertDescription,
  useToast,
  Badge,
  Icon,
  Divider,
} from "@chakra-ui/react";
```

```typescript
// ✅ ИСПРАВЛЕНО (только используемые компоненты)
import {
  VStack,
  HStack,
  Text,
  FormControl,
  FormLabel,
  Button,
  Tab,
  Tabs,
  TabList,
  TabPanel,
  TabPanels,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Switch,
  Checkbox,
  Alert,
  AlertTitle,
  AlertDescription,
  useToast,
  Badge,
  Icon,
  Divider,
} from "@chakra-ui/react";
```

### Инструмент для сортировки импортов

Используй **organizeImports** в VS Code:

```bash
# Установить
pnpm install -D @typescript-eslint/parser @typescript-eslint/eslint-plugin

# В .vscode/settings.json:
{
  "[typescript]": {
    "editor.codeActionsOnSave": {
      "source.organizeImports": true
    }
  }
}
```

---

## 4. State переменные

### ❌ ПРОБЛЕМА: Неиспользуемый useState

**Файл:** `DangerZoneTab.tsx`, строка 89-90

```typescript
// ❌ БЫЛО (неиспользуемые state)
export function DangerZoneTab() {
  const [deletionSteps, setDeletionSteps] = useState<DeletionStep[]>(DELETION_STEPS);
  const [currentStep, setCurrentStep] = useState(0);
  // ... остальной код
  // deletionSteps и currentStep НИ ГДЕ НЕ ИСПОЛЬЗУЮТСЯ!
  
  return (
    // JSX не использует эти значения
  );
}
```

```typescript
// ✅ ИСПРАВЛЕНО (удалены неиспользуемые состояния)
export function DangerZoneTab() {
  const [confirmationText, setConfirmationText] = useState("");
  const [password, setPassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isDataExported, setIsDataExported] = useState(false);
  const [understandingChecks, setUnderstandingChecks] = useState({
    permanent: false,
    dataLoss: false,
    noRecovery: false,
    contactSupport: false,
  });
  
  // ... остальной код (только используемые states)
}
```

### Как искать неиспользуемый state

1. **В VS Code:**
   - Наведи мышь на переменную
   - Если серая → не используется
   - Если зелёная → используется

2. **Через grep:**
   ```bash
   # Искать переменные, которые объявлены, но не используются
   grep -n "useState" src/components/profile/DangerZoneTab.tsx
   
   # Потом проверить каждую в коде
   grep -n "deletionSteps\|setDeletionSteps" src/components/profile/DangerZoneTab.tsx
   # Если только 1 результат (где объявление) → не используется
   ```

---

## 5. Regex проблемы

### ❌ ПРОБЛЕМА: Лишние пробелы в регулярном выражении

**Файл:** `SecurityTab.tsx`

```typescript
// ❌ БЫЛО (лишние пробелы)
if (/[!@#$%^&*()_+\-=\[\]{};':\"\\|,.<>\\/?]/.test(password)) {
  // ↑ Здесь может быть лишний пробел
  score += 20;
}
```

```typescript
// ✅ ИСПРАВЛЕНО (без лишних пробелов)
if (/[!@#$%^&*()_+\-=\[\]{};':|,.<>/?]/.test(password)) {
  score += 20;
}
```

### Правило в ESLint

```json
{
  "rules": {
    "no-regex-spaces": "warn"
  }
}
```

---

## 6. Скрипты автоматизации

### Скрипт 1: Быстрое исправление всех файлов

```bash
#!/bin/bash
# fix-eslint.sh

echo "🔧 ESLint автоматическое исправление..."

# Проверяем, установлены ли зависимости
if ! command -v pnpm &> /dev/null; then
  echo "❌ pnpm не установлен. Выполните: npm install -g pnpm"
  exit 1
fi

# Исправляем все файлы
echo "📁 Исправляем infra/quark-ui..."
pnpm exec eslint infra/quark-ui/src --fix --ext .ts,.tsx

echo "📁 Исправляем services/blog-service..."
pnpm exec eslint services/blog-service/client/src --fix --ext .ts,.tsx

echo ""
echo "📊 Проверяем результаты..."
pnpm exec eslint . --format=compact --ext .ts,.tsx | head -20

echo ""
echo "✅ Готово!"
```

**Использование:**
```bash
chmod +x fix-eslint.sh
./fix-eslint.sh
```

### Скрипт 2: Отчёт о проблемах

```bash
#!/bin/bash
# report-eslint.sh

echo "📋 ESLint Отчёт"
echo "================"
echo ""

# Количество всех проблем
TOTAL=$(pnpm exec eslint . --format=json 2>/dev/null | jq '[.[] | .messages | length] | add')
echo "Всего проблем: $TOTAL"

# Проблемы по типам
echo ""
echo "По типам проблем:"
pnpm exec eslint . --format=json 2>/dev/null | jq -r '.[] | .messages | group_by(.ruleId) | map({rule: .[0].ruleId, count: length}) | .[] | "\(.rule): \(.count)"' | sort

# Проблемы по файлам
echo ""
echo "По файлам (топ 10):"
pnpm exec eslint . --format=json 2>/dev/null | jq -r '.[] | select(.messages | length > 0) | "\(.filePath): \(.messages | length)"' | sort -t: -k2 -nr | head -10
```

### Скрипт 3: Pre-commit Hook

```bash
#!/bin/sh
# .husky/pre-commit

# Запустить ESLint на staged files
pnpm exec lint-staged

# Если ESLint вернул ошибку, отменить commit
if [ $? -ne 0 ]; then
  echo ""
  echo "❌ ESLint нашел ошибки. Commit отменён."
  echo "💡 Исправьте ошибки и попробуйте ещё раз."
  echo "💡 Или используйте git commit --no-verify (не рекомендуется)"
  exit 1
fi
```

### Скрипт 4: GitHub Actions

```yaml
# .github/workflows/eslint-check.yml
name: ESLint Check

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  eslint:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x]
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup pnpm
      uses: pnpm/action-setup@v2
      with:
        version: 8
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'pnpm'
    
    - name: Install dependencies
      run: pnpm install
    
    - name: Run ESLint
      run: pnpm exec eslint . --max-warnings 0
    
    - name: Report results
      if: always()
      run: |
        echo "## ESLint Report" >> $GITHUB_STEP_SUMMARY
        pnpm exec eslint . --format=json | jq '.[] | select(.messages | length > 0)' >> $GITHUB_STEP_SUMMARY || echo "✅ No issues found"
```

---

## 7. Проверочный лист

### До исправления

```
npm run lint

✅ Скомпилировать TypeScript
✅ Запустить ESLint
✅ Запустить Prettier
✅ Проверить unit тесты
```

### Исправление

```
npm run lint:fix

Это выполняет:
1. pnpm exec eslint . --fix
2. pnpm exec prettier --write .
3. pnpm exec tsc --noEmit
```

### После исправления

```
npm run lint

✅ Убедиться, что нет новых ошибок
✅ Запустить тесты
✅ Проверить в VS Code
✅ Commit изменения
```

---

## 8. Часто задаваемые вопросы

### Q: Почему я вижу ошибку, которую не вижу ESLint?

**A:** Возможно, вы используете другую версию ESLint. Проверьте:
```bash
pnpm exec eslint --version
# или
npm exec eslint -- --version
```

### Q: Как исключить файлы из ESLint?

**A:** Создайте `.eslintignore`:
```
node_modules/
dist/
.next/
coverage/
```

### Q: Как закрепить версию ESLint?

**A:** Укажите в `package.json`:
```json
{
  "dependencies": {
    "eslint": "^8.40.0"
  }
}
```

### Q: Как отключить правило для одной строки?

**A:** Используйте комментарий:
```typescript
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const unused = 5;
```

---

**Обновлено:** 2 ноября 2025  
**Автор:** GitHub Copilot
