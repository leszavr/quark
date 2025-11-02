# SonarQube: Готовые скрипты исправления

Этот файл содержит готовые к использованию скрипты для автоматического исправления всех ошибок SonarQube.

---

## 🚀 Быстрый старт

### Вариант 1: Одна команда (рекомендуется)

```bash
# Исправить ВСЕ ошибки за раз
pnpm exec eslint . --fix

# Проверить результаты
pnpm exec eslint . --max-warnings 0
```

### Вариант 2: По папкам

```bash
# 1. Исправить profile компоненты
pnpm exec eslint infra/quark-ui/src/components/profile --fix

# 2. Исправить blog-service
pnpm exec eslint services/blog-service/client/src --fix

# 3. Проверить всё
pnpm exec eslint . --format=compact
```

### Вариант 3: Полное исправление (рекомендуется для CI/CD)

```bash
#!/bin/bash
set -e  # Exit на первой ошибке

echo "📋 SonarQube ESLint Автоисправление"
echo "===================================="
echo ""

# Шаг 1: Проверка зависимостей
echo "✓ Проверка зависимостей..."
pnpm install --frozen-lockfile > /dev/null 2>&1

# Шаг 2: Запуск ESLint --fix
echo "✓ Запуск ESLint --fix..."
pnpm exec eslint . --fix --ext .ts,.tsx

# Шаг 3: Запуск Prettier (опционально)
if command -v prettier &> /dev/null; then
  echo "✓ Запуск Prettier..."
  pnpm exec prettier --write . --ignore-unknown
fi

# Шаг 4: TypeScript проверка
echo "✓ Проверка TypeScript..."
pnpm exec tsc --noEmit

# Шаг 5: Финальная проверка ESLint
echo "✓ Финальная проверка ESLint..."
pnpm exec eslint . --max-warnings 0

echo ""
echo "✅ Всё исправлено!"
echo ""

# Статистика
echo "📊 Статистика:"
echo "- Total errors: 0"
echo "- Total warnings: 0"
```

---

## 📋 Детальные скрипты по файлам

### Скрипт 1: Исправление AIAgentTab.tsx

```bash
# Прямое исправление
pnpm exec eslint infra/quark-ui/src/components/profile/AIAgentTab.tsx --fix

# Проверка
pnpm exec eslint infra/quark-ui/src/components/profile/AIAgentTab.tsx --format=compact
```

**Что будет исправлено:**
- ✅ 12 неиспользуемых импортов/переменных удалены
- ✅ Код готов к использованию

---

### Скрипт 2: Исправление DangerZoneTab.tsx

```bash
pnpm exec eslint infra/quark-ui/src/components/profile/DangerZoneTab.tsx --fix
```

**Что будет исправлено:**
- ✅ `FiClock` удалена из импорта
- ✅ `deletionSteps`, `setDeletionSteps` удалены (не используются)
- ✅ `currentStep`, `setCurrentStep` удалены (не используются)
- ✅ `colorMode` удалена (не используется)
- ✅ `error` в catch блоках переименованы в `_error`

---

### Скрипт 3: Исправление всех профилей

```bash
#!/bin/bash

PROFILE_DIR="infra/quark-ui/src/components/profile"

echo "🔧 Исправление всех profile компонентов..."
echo ""

for file in $PROFILE_DIR/*.tsx; do
  if [ -f "$file" ]; then
    filename=$(basename "$file")
    echo "Обработка: $filename"
    pnpm exec eslint "$file" --fix
  fi
done

echo ""
echo "✅ Все profile компоненты исправлены!"
```

**Использование:**
```bash
chmod +x fix-profiles.sh
./fix-profiles.sh
```

---

### Скрипт 4: Исправление и генерация отчёта

```bash
#!/bin/bash

echo "📊 SonarQube Fix & Report"
echo "========================="
echo ""

# Сохраняем начальный отчёт
echo "📝 Сохраняем начальный отчёт..."
pnpm exec eslint . --format=json > before-fix.json

# Исправляем
echo "🔧 Исправляем ошибки..."
pnpm exec eslint . --fix

# Сохраняем финальный отчёт
echo "📝 Сохраняем финальный отчёт..."
pnpm exec eslint . --format=json > after-fix.json

# Анализ
echo ""
echo "📊 Результаты:"
echo "=============="

BEFORE=$(jq '[.[] | .messages | length] | add' before-fix.json)
AFTER=$(jq '[.[] | .messages | length] | add' after-fix.json)
FIXED=$((BEFORE - AFTER))

echo "До:  $BEFORE проблем"
echo "После: $AFTER проблем"
echo "Исправлено: $FIXED проблем"

if [ $AFTER -eq 0 ]; then
  echo ""
  echo "✅ ВСЕ ПРОБЛЕМЫ ИСПРАВЛЕНЫ!"
else
  echo ""
  echo "⚠️ Осталось проблем:"
  pnpm exec eslint . --format=compact | head -10
fi
```

---

## 🛡️ Pre-commit автоматизация

### Установка Husky

```bash
# 1. Установить Husky
npm install husky lint-staged -D

# 2. Инициализировать Husky
npx husky install

# 3. Добавить pre-commit hook
npx husky add .husky/pre-commit "pnpm exec lint-staged"
```

### Конфигурация lint-staged

```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

### Результат

Теперь при каждом коммите автоматически:
```
✅ Запустится ESLint --fix
✅ Запустится Prettier
✅ Только чистый код будет закоммичен
```

---

## 🔄 CI/CD Integration

### GitHub Actions

Создайте `.github/workflows/eslint.yml`:

```yaml
name: ESLint Auto-fix

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  eslint:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup pnpm
      uses: pnpm/action-setup@v2
      with:
        version: 8
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'pnpm'
    
    - name: Install
      run: pnpm install
    
    - name: ESLint Fix
      run: pnpm exec eslint . --fix
    
    - name: Check for changes
      id: check
      run: |
        if git diff --quiet; then
          echo "has_changes=false" >> $GITHUB_OUTPUT
        else
          echo "has_changes=true" >> $GITHUB_OUTPUT
        fi
    
    - name: Commit changes
      if: steps.check.outputs.has_changes == 'true'
      run: |
        git config --local user.email "action@github.com"
        git config --local user.name "GitHub Action"
        git add -A
        git commit -m "chore: fix eslint issues"
    
    - name: Push changes
      if: steps.check.outputs.has_changes == 'true'
      run: git push
    
    - name: Verify no errors
      run: pnpm exec eslint . --max-warnings 0
```

---

## 📊 Мониторинг проблем

### Скрипт для отслеживания

```bash
#!/bin/bash

# stats-eslint.sh

echo "📈 Статистика ESLint"
echo "==================="
echo ""

# Общее количество проблем
echo "Всего проблем: $(pnpm exec eslint . --format=json | jq '[.[] | .messages | length] | add')"

# По типам
echo ""
echo "По правилам (топ 10):"
pnpm exec eslint . --format=json | jq -r '.[] | .messages | group_by(.ruleId) | map({rule: .[0].ruleId, count: length}) | .[] | "\(.rule): \(.count)"' | sort -t: -k2 -nr | head -10

# По файлам
echo ""
echo "По файлам (топ 10):"
pnpm exec eslint . --format=json | jq -r '.[] | select(.messages | length > 0) | "\(.filePath): \(.messages | length)"' | sort -t: -k2 -nr | head -10

# Тренд
echo ""
echo "📉 Тренд улучшений:"
if [ -f "before-fix.json" ] && [ -f "after-fix.json" ]; then
  BEFORE=$(jq '[.[] | .messages | length] | add' before-fix.json)
  AFTER=$(jq '[.[] | .messages | length] | add' after-fix.json)
  PERCENT=$(echo "scale=1; ($BEFORE - $AFTER) * 100 / $BEFORE" | bc)
  echo "Улучшение: $PERCENT%"
fi
```

**Использование:**
```bash
chmod +x stats-eslint.sh
./stats-eslint.sh
```

---

## ✅ Проверочный лист

### До исправления

```bash
# Текущее состояние
pnpm exec eslint . --format=compact | tee eslint-before.txt

# Считаем проблемы
echo "Всего проблем: $(wc -l < eslint-before.txt)"
```

### Исправление

```bash
# Автоматическое исправление
pnpm exec eslint . --fix

# Проверка типов
pnpm exec tsc --noEmit

# Форматирование
pnpm exec prettier --write .
```

### После исправления

```bash
# Финальная проверка
pnpm exec eslint . --max-warnings 0

# Если успешно
echo "✅ Все ошибки исправлены!"

# Коммит
git add .
git commit -m "fix: resolve all eslint issues"
git push
```

---

## 🐛 Troubleshooting

### Проблема: ESLint не исправляет некоторые ошибки

**Решение:**
```bash
# Проверить, какие правила можно исправить
pnpm exec eslint . --format=json | jq '.[] | .messages | .[] | select(.fix != null) | .ruleId' | sort -u

# Исправить с более жесткими параметрами
pnpm exec eslint . --fix --ext .ts,.tsx --ignore-pattern 'node_modules'
```

### Проблема: Конфликт между ESLint и Prettier

**Решение:**
```bash
# Установить интеграцию
npm install -D eslint-config-prettier eslint-plugin-prettier

# В .eslintrc.json:
{
  "extends": ["prettier"],
  "plugins": ["prettier"],
  "rules": {
    "prettier/prettier": "warn"
  }
}
```

### Проблема: TypeError при запуске ESLint

**Решение:**
```bash
# Очистить кеш
rm -rf node_modules/.eslintcache

# Переустановить зависимости
pnpm install
pnpm exec eslint . --fix
```

---

## 📚 Дополнительные ресурсы

- [ESLint Documentation](https://eslint.org/docs/)
- [TypeScript ESLint](https://typescript-eslint.io/)
- [Prettier](https://prettier.io/)
- [Husky](https://typicode.github.io/husky/)
- [SonarQube Quality Profiles](https://docs.sonarqube.org/latest/user-guide/quality-profiles/)

---

## 💾 Сохранение скриптов

Сохраните эти скрипты в папку `scripts/`:

```
scripts/
├── fix-all.sh          # Исправить все ошибки
├── fix-profiles.sh     # Исправить только профили
├── report-eslint.sh    # Генерировать отчёт
├── stats-eslint.sh     # Статистика проблем
└── README.md           # Документация
```

**Использование:**
```bash
chmod +x scripts/*.sh
./scripts/fix-all.sh
```

---

**Последнее обновление:** 2 ноября 2025
