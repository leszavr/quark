# 📚 Документация Quark

> **Модульная, ИИ-нативная платформа для блогов и мессенджера**

Этот каталог содержит **полную, согласованную и живую документацию** для системы **Quark** — высокодинамичной, масштабируемой платформы, спроектированной с участием ИИ и ориентированной на модульность, безопасность и автономность.

---

## 🗂️ Структура каталога

```
docs/
├── ai/                     # ИИ-агенты, этика, мониторинг
├── api/                    # API, контракты, схемы
├── architecture/           # Архитектурные диаграммы и ADR
├── backup/                 # Резервное копирование
├── capacity-plan/          # Производительность и масштабируемость
├── data/                   # Модели данных и жизненный цикл
├── devops/                 # Мониторинг, SLO, disaster recovery
├── examples/               # Примеры модулей и кода
├── quality/                # Тестирование, ревью, метрики документации
├── security/               # Безопасность, compliance, инциденты
├── team/                   # Команда, процессы, onboarding
├── tools/                  # Автоматизация документации
├── templates/              # Шаблоны (post-mortem)
└── other/                  # Прочие материалы (выбор LLM)
```

---

## 📚 Полный список документов

### 🤖 1. Искусственный интеллект (AI)
| Файл | Описание |
|------|---------|
| [`ai/monitoring.md`](ai/monitoring.md) | Мониторинг ИИ: accuracy, latency, drift |
| [`ai/ai-ops/ai-ops.md`](ai/ai-ops/ai-ops.md) | Общее описание AI Ops |
| [`ai/ai-ops/ai-ops-agent.md`](ai/ai-ops/ai-ops-agent.md) | Агент по самооптимизации системы |
| [`ai/ai-ops/workflow-example.md`](ai/ai-ops/workflow-example.md) | Пример workflow: AI предлагает исправление → PR |
| [`ai/data-governance.md`](ai/data-governance.md) | Управление данными ИИ: согласие, аудит, шифрование |
| [`ai/ethics-guidelines.md`](ai/ethics-guidelines.md) | Этические принципы: прозрачность, контроль, запрет на вред |
| [`ai/model-lifecycle.md`](ai/model-lifecycle.md) | Жизненный цикл ИИ-моделей: обучение, деплой, мониторинг |

---

### 🌐 2. API и контракты
| Файл | Описание |
|------|---------|
| [`api/api-governance.md`](api/api-governance.md) | Правила проектирования API |
| [`api/asyncapi-events.yaml`](api/asyncapi-events.yaml) | Контракты событий (NATS) |
| [`api/resource-schema.md`](api/resource-schema.md) | Общая структура ресурсов (посты, пользователи) |
| [`api/openapi/auth-service.yaml`](api/openapi/auth-service.yaml) | OpenAPI для `auth-service` |
| [`api/openapi/blog-service.yaml`](api/openapi/blog-service.yaml) | OpenAPI для `blog-service` |
| [`api/openapi/messaging-service.yaml`](api/openapi/messaging-service.yaml) | OpenAPI для `messaging-service` |

---

### 🏗️ 3. Архитектура
| Файл | Описание |
|------|---------|
| [`architecture/context.md`](architecture/context.md) | System Context Diagram (C4 Level 1) |
| [`architecture/containers.md`](architecture/containers.md) | Container Diagram (C4 Level 2) |
| [`architecture/components.md`](architecture/components.md) | Component Diagram (C4 Level 3) |
| [`architecture/deployment.md`](architecture/deployment.md) | Deployment Diagram |
| [`architecture/adr-001-nats-vs-kafka.md`](architecture/adr-001-nats-vs-kafka.md) | ADR: выбор NATS |
| [`architecture/adr-002-event-driven.md`](architecture/adr-002-event-driven.md) | ADR: event-driven архитектура |
| [`architecture/adr-003-module-docking.md`](architecture/adr-003-module-docking.md) | ADR: модульность по принципу "МКС" |
| [`architecture/adr-004-ai-ops-agent.md`](architecture/adr-004-ai-ops-agent.md) | ADR: AI Ops Agent |
| [`architecture/adr-005-jwt-auth.md`](architecture/adr-005-jwt-auth.md) | ADR: JWT как единый стандарт аутентификации |
| [`architecture/adr-006-grpc.md`](architecture/adr-006-grpc.md) | ADR: использование gRPC для внутренних вызовов |
| [`architecture/adr-007-wasm-modules.md`](architecture/adr-007-wasm-modules.md) | ADR: WebAssembly для безопасных модулей |
| [`architecture/tech-matrix.md`](architecture/tech-matrix.md) | Сравнительная матрица технологий |

---

### 💾 4. Резервное копирование и восстановление
| Файл | Описание |
|------|---------|
| [`backup/backup-strategy.md`](backup/backup-strategy.md) | Стратегия бэкапов: частота, хранилища |
| [`backup/recovery-checklist.md`](backup/recovery-checklist.md) | Чек-лист восстановления после сбоя |

---

### 📈 5. Производительность и масштабируемость
| Файл | Описание |
|------|---------|
| [`capacity-plan/bottleneck-analysis.md`](capacity-plan/bottleneck-analysis.md) | Анализ узких мест (NATS, PostgreSQL, AI) |
| [`capacity-plan/capacity-plan.md`](capacity-plan/capacity-plan.md) | Расчёт ресурсов, RPS, масштабирование |

---

### 🧱 6. Модели данных
| Файл | Описание |
|------|---------|
| [`data/data-lifecycle.md`](data/data-lifecycle.md) | Жизненный цикл данных: сроки хранения, удаление |
| [`data/data-model.md`](data/data-model.md) | ER-диаграмма: связи между сущностями |
| [`data/resource-schema.md`](data/resource-schema.md) | Структура данных (пост, пользователь, медиа) |
| [`data/data-flow.md`](data/data-flow.md) | Data Flow Diagrams (DFD) |

---

### 🔐 7. Безопасность и соответствие
| Файл | Описание |
|------|---------|
| [`security/threat-model-report.md`](security/threat-model-report.md) | Полный STRIDE-анализ угроз |
| [`security/secure-arch-guidelines.md`](security/secure-arch-guidelines.md) | Руководство по безопасной архитектуре |
| [`security/iam.md`](security/iam.md) | Управление доступом (JWT, RBAC) |
| [`security/identity-access.md`](security/identity-access.md) | Детали аутентификации и авторизации |
| [`security/compliance-checklist.md`](security/compliance-checklist.md) | Соответствие GDPR, ФЗ-152, ФЗ-149 |
| [`security/disaster-recovery-plan.md`](security/disaster-recovery-plan.md) | План восстановления (RTO/RPO) |
| [`security/incident-response.md`](security/incident-response.md) | Playbook реагирования на инциденты |

---

### 🧪 8. Качество и тестирование
| Файл | Описание |
|------|---------|
| [`quality/test-plan.md`](quality/test-plan.md) | Полный план тестирования (unit, e2e, load) |
| [`quality/code-review.md`](quality/code-review.md) | Правила код-ревью |
| [`quality/testing-strategy.md`](quality/testing-strategy.md) | Стратегия тестирования |
| [`quality/load-test-scenarios.md`](quality/load-test-scenarios.md) | Сценарии нагрузочного тестирования (k6) |
| [`quality/PR Process.md`](quality/PR%20Process.md) | Процесс слияния кода (CI → ревью → деплой) |
| [`quality/docs-metrics.md`](quality/docs-metrics.md) | SLO для документации (актуальность, покрытие) |

---

### 🛠️ 9. DevOps и эксплуатация
| Файл | Описание |
|------|---------|
| [`devops/monitoring.md`](devops/monitoring.md) | Стратегия мониторинга (OpenTelemetry, Grafana) |
| [`devops/slo.md`](devops/slo.md) | SLO, error budget, алертинг |

---

### 🧩 10. Примеры и шаблоны
| Файл | Описание |
|------|---------|
| [`examples/module-template/module-manifest.yaml`](examples/module-template/module-manifest.yaml) | Шаблон manifest для модуля |
| [`examples/module-template/main.py`](examples/module-template/main.py) | Пример кода модуля |
| [`examples/ai-ops-event-publisher.py`](examples/ai-ops-event-publisher.py) | Пример: AI Ops → GitHub PR |
| [`templates/incident-postmortem-template.md`](templates/incident-postmortem-template.md) | Шаблон post-mortem отчёта |

---

### 👥 11. Команда и процессы
| Файл | Описание |
|------|---------|
| [`team/brd.md`](team/brd.md) | Бизнес-требования |
| [`team/roadmap.md`](team/roadmap.md) | Дорожная карта (MVP → v2) |
| [`team/team-charter.md`](team/team-charter.md) | Цели и ценности команды |
| [`team/raci.md`](team/raci.md) | Матрица ответственности (с участием ИИ) |
| [`team/onboarding.md`](team/onboarding.md) | Инструкция для новых разработчиков |
| [`team/glossary.md`](team/glossary.md) | Глоссарий терминов |
| [`team/srs.md`](team/srs.md) | Технические требования |
| [`team/privacy-policy.md`](team/privacy-policy.md) | Политика конфиденциальности |

---

### 🔧 12. Инструменты и автоматизация
| Файл | Описание |
|------|---------|
| [`tools/auto-docs.md`](tools/auto-docs.md) | Автоматическая генерация документации (Swagger, Buf, MkDocs) |

---

### 📦 13. Прочее
| Файл | Описание |
|------|---------|
| [`other/LLM_choice.md`](other/LLM_choice.md) | Обоснование выбора LLM (Ollama, Llama 3, phi) |
| [`ci-cd-pipeline.yml`](ci-cd-pipeline.yml) | Пример CI/CD pipeline |

---

## 🚀 Как использовать
- 🔍 Начни с [`architecture/context.md`](architecture/context.md) — чтобы понять систему в целом
- 📊 Перейди к [`architecture/containers.md`](architecture/containers.md) — чтобы увидеть сервисы
- 🛠️ Изучи [`ai/ethics-guidelines.md`](ai/ethics-guidelines.md) и [`security/secure-arch-guidelines.md`](security/secure-arch-guidelines.md) — для безопасной разработки
- 🧪 Ознакомься с [`quality/test-plan.md`](quality/test-plan.md) — перед внесением изменений
- 🧩 Посмотри [`examples/module-template/`](examples/module-template/) — чтобы создать свой модуль

---

## ✅ Статус
- [x] Все документы на месте
- [x] Ссылки рабочие
- [x] Готово к использованию в production

> 💡 **Quark — это не просто платформа. Это экосистема будущего.**