# TypeGuard Agent для Quark

## Назначение
TypeGuard Agent — это автономный CLI-скрипт для автоматической очистки и управления типовыми зависимостями (@types/*) в монорепозитории Quark. Он обеспечивает безопасность, детерминированность и интеграцию с CI/CD.

## Основные возможности
- Находит и удаляет избыточные типовые зависимости (@types/*), если:
  - JS-пакет отсутствует в dependencies/devDependencies.
  - Пакет содержит встроенные типы ("types" или "typings" в package.json).
  - Типы не используются нигде в кодовой базе (AST-анализ через ts-morph).
- Создаёт резервную копию package.json перед изменениями.
- После удаления запускает проверку типов (tsc --noEmit).
- При ошибке автоматически восстанавливает package.json.
- Никогда не удаляет @types/node, если проект не чисто фронтенд.
- CLI-флаги:
  - `--dry-run` — только анализ, без изменений.
  - `--fix` — применить изменения (по умолчанию).
  - `--verbose` — подробный лог.
- Автоопределение менеджера пакетов (npm, yarn, pnpm).
- Совместимость с локальным запуском и CI.

## Инструкция по запуску

### Локально (VS Code)
1. Откройте терминал в корне проекта.
2. Запустите:
   ```bash
   pnpm exec ts-node agents/typeguard/index.ts --fix --verbose
   ```
   Для анализа без изменений:
   ```bash
   pnpm exec ts-node agents/typeguard/index.ts --dry-run
   ```

### В CI/CD
Добавьте шаг:
```bash
pnpm exec ts-node agents/typeguard/index.ts --fix
```

## Порядок запуска агентов
TypeGuard Agent всегда запускается первым после установки зависимостей:
1. TypeGuard Agent
2. TypeCheck Agent (`tsc --noEmit`)
3. Lint Agent (`eslint`)
4. Test Agent

## Пример конфига (quark.config.ts)
```ts
export const agents = [
  { name: 'TypeGuard', cmd: 'pnpm exec ts-node agents/typeguard/index.ts --fix' },
  { name: 'TypeCheck', cmd: 'pnpm exec tsc --noEmit' },
  { name: 'Lint', cmd: 'pnpm run lint' },
  { name: 'Test', cmd: 'pnpm run test' }
];
```

## Вывод работы
```
[TypeGuard] Removed: @types/lodash
[TypeGuard] Skipped: @types/react (used in 12 files)
[TypeGuard] OK — 1 dependency cleaned, 0 errors.
```

## Безопасность
- Все изменения обратимы: при ошибке типизации package.json восстанавливается автоматически.
- Не требует расширений VS Code.
- Не использует LLM для основной логики.

## Технические детали
- Использует только официальные API: typescript, fs, child_process, npm-registry-fetch.
- Для AST-анализа — ts-morph.
- Код агента: `agents/typeguard/index.ts`
- Конфиг: `agents/typeguard/package.json`

---

**TypeGuard Agent — ваш автоматический страж чистоты типовой инфраструктуры Quark!**
