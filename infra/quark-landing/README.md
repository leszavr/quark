# Quark Landing

## О проекте
Современный лендинг на Next.js 16, TypeScript, Radix UI, Tailwind CSS и **pnpm**. Проект полностью подготовлен для CI/CD, не содержит ошибок ESLint, легко масштабируется и разворачивается в продакшен.

## Основной пакетный менеджер
**pnpm** — все команды, скрипты и пайплайн рассчитаны на работу с pnpm.

## Ветки
- `master` — основная ветка для разработки и публикации.
- `prod` — ветка для деплоя. Все изменения, которые должны попасть в production, пушьте в ветку `prod`. CI/CD пайплайн настроен на автоматический деплой из этой ветки.

## Быстрый старт

1. **Установите зависимости:**
   ```bash
   pnpm install
   ```
2. **Запустите проект в dev-режиме:**
   ```bash
   pnpm dev
   ```
3. **Сборка и запуск в продакшен:**
   ```bash
   pnpm build
   pnpm start
   ```

## Комплексная проверка
- `pnpm install && pnpm run lint && pnpm run type-check && pnpm run build` — полный цикл проверки и сборки

## Скрипты
- `pnpm dev` — запуск в dev-режиме
- `pnpm build` — сборка
- `pnpm start` — запуск продакшен
- `pnpm lint` — строгий ESLint

## Структура проекта
```
vercel/
├── app/                # Главные страницы и layout
├── components/         # UI-компоненты и блоки лендинга
│   └── ui/             # Библиотека переиспользуемых компонентов
├── hooks/              # Пользовательские хуки
├── lib/                # Вспомогательные функции и i18n
├── public/             # Статика
├── styles/             # Глобальные стили
├── package.json        # Зависимости и скрипты
├── next.config.mjs     # Конфигурация Next.js
├── tsconfig.json       # Конфигурация TypeScript
├── postcss.config.mjs  # Конфигурация PostCSS
└── read_me.md           # Документация
```

## Мультиязычность

- Поддержка языков: русский, английский, испанский, французский и др.
- Переключение языка через компонент `LanguageSelector`.

## Качество и CI/CD
- Все исходные файлы проходят строгий ESLint (`pnpm lint`).
- SSR-проверки для window/document/localStorage/setTimeout/HTMLCanvasElement.
- Неиспользуемые переменные помечены через подчёркивание.
- Build-артефакты и .next/ игнорируются при линтинге.

## Стеклянный эффект (glassmorphism)
Для форм авторизации и регистрации реализован стеклянный эффект с помощью Tailwind CSS:
```tsx
<div className="backdrop-blur-lg bg-white/40 dark:bg-neutral-900/40 border border-white/30 dark:border-neutral-800/30 shadow-xl rounded-2xl ...">
  ...
</div>
```
Настройка в `components/auth-modal.tsx`.

## Разработка и расширение
- Все UI-компоненты лежат в `components/ui/`.
- Для новых страниц используйте папку `app/`.
- Для новых языков — расширяйте `lib/i18n.ts`.

## ESLint
- Flat config (`eslint.config.js`).
- Отключён стандартный `no-unused-vars`, включён `@typescript-eslint/no-unused-vars` с `argsIgnorePattern` и `varsIgnorePattern: "^_"`.
- Исключены `.next`, `node_modules`, `out`, `public`, `*.js`.

## Деплой через GitLab CI/CD

- Все изменения для production пушьте в ветку `prod`.
- Пайплайн автоматически собирает, тестирует и деплоит проект.

## Контакты и поддержка
- GitHub: [https://github.com/leszavr/quark_landing](https://github.com/leszavr/quark_landing)
- Вопросы и предложения — через Issues или Pull Requests.

---

**Quark Landing** — быстрый старт для современных SaaS, AI, IT-продуктов и сервисов.
lf