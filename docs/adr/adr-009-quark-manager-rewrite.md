# ADR-009: Переход Quark Manager с Bash на Python

**Статус**: Proposed  
**Дата**: 2025-11-03  
**Авторы**: Quark Development Team  
**Связанные ADR**: ADR-001 (NATS), ADR-002 (Event-Driven)

---

## Контекст

`quark-manager.sh` вырос до **1684 строк** и содержит:
- Проверку версий пакетов (pnpm outdated)
- Управление Docker Compose
- Health checks всех сервисов
- Spec-driven development (OpenAPI, AsyncAPI)
- Интерактивное меню
- Логирование и мониторинг

**Проблемы текущей реализации**:
1. ⏱️ **Производительность**: Последовательная проверка 6 сервисов занимает ~60-90 секунд
2. 🐌 **Bash медленный**: Парсинг таблиц pnpm, работа с массивами
3. 🧩 **Сложность**: 1684 строки bash-кода трудно поддерживать
4. 🔄 **Отсутствие параллелизма**: Нельзя проверить все сервисы одновременно
5. 📊 **Отсутствие прогресс-баров**: Пользователь не видит процесс выполнения
6. 🧪 **Сложность тестирования**: Bash-скрипты трудно покрыть unit-тестами

---

## Решение

### Предлагаемые варианты

#### Вариант A: Python 3.10+ (Рекомендуется)

**Преимущества**:
- ✅ Асинхронность: `asyncio` для параллельной проверки всех сервисов
- ✅ Библиотеки: `rich` (прогресс-бары), `click` (CLI), `pydantic` (валидация)
- ✅ Скорость: Парсинг JSON от pnpm в 10x быстрее чем bash
- ✅ Тестируемость: `pytest` с моками и fixtures
- ✅ Типизация: Type hints для предотвращения ошибок
- ✅ Экосистема: Интеграция с OpenAPI/AsyncAPI генераторами

**Недостатки**:
- ❌ Зависимость от Python 3.10+
- ❌ Нужен venv для изоляции
- ❌ Больше памяти (~50MB vs ~5MB для bash)

**Пример структуры**:
```
quark_manager/
├── __init__.py
├── cli.py              # Click CLI entry point
├── docker.py           # Docker Compose management
├── package_checker.py  # Async pnpm outdated checker
├── health.py           # Health checks
├── spec.py             # Spec-driven commands
└── utils.py            # Helpers

tests/
├── test_package_checker.py
└── test_docker.py
```

#### Вариант B: Go (Альтернатива)

**Преимущества**:
- ✅ Один бинарник без зависимостей
- ✅ Быстрая компиляция и выполнение
- ✅ Нативная конкурентность (goroutines)
- ✅ Малый размер (~10MB бинарь)

**Недостатки**:
- ❌ Нужна компиляция для каждой платформы
- ❌ Меньше библиотек для CLI (vs Python/Rich)
- ❌ Команда может не знать Go

#### Вариант C: Node.js/TypeScript

**Преимущества**:
- ✅ Уже используется в проекте (pnpm workspace)
- ✅ Async/await из коробки
- ✅ Библиотеки: `commander`, `ora`, `chalk`

**Недостатки**:
- ❌ node_modules (~100MB)
- ❌ Медленнее Python для парсинга

---

## Архитектура Python решения

### Технологический стек

```python
# pyproject.toml
[tool.poetry]
name = "quark-manager"
version = "3.0.0"
python = "^3.10"

[tool.poetry.dependencies]
click = "^8.1.0"           # CLI framework
rich = "^13.0.0"           # Beautiful terminal output
pydantic = "^2.0.0"        # Data validation
docker = "^7.0.0"          # Docker SDK
aiohttp = "^3.9.0"         # Async HTTP for health checks
pyyaml = "^6.0.0"          # YAML parsing

[tool.poetry.group.dev.dependencies]
pytest = "^7.4.0"
pytest-asyncio = "^0.21.0"
mypy = "^1.7.0"
ruff = "^0.1.0"            # Fast linter
```

### Ключевые компоненты

#### 1. Async Package Checker (60x быстрее)

```python
import asyncio
from rich.progress import Progress, SpinnerColumn, TextColumn

async def check_service_packages(service_path: Path) -> PackageInfo:
    """Проверяет устаревшие пакеты в сервисе"""
    proc = await asyncio.create_subprocess_exec(
        "pnpm", "outdated", "--depth=0", "--json",
        cwd=service_path,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE
    )
    stdout, _ = await proc.communicate()
    return parse_pnpm_outdated(json.loads(stdout))

async def check_all_services():
    """Проверяет все сервисы параллельно"""
    services = ["plugin-hub", "auth-service", "blog-service", ...]
    
    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        transient=True,
    ) as progress:
        task = progress.add_task("Проверка пакетов...", total=len(services))
        
        tasks = [check_service_packages(s) for s in services]
        results = await asyncio.gather(*tasks)
        
        progress.update(task, advance=len(services))
    
    return results
```

**Результат**: Проверка 6 сервисов займет ~10 секунд вместо 90!

#### 2. Rich UI для красивого вывода

```python
from rich.console import Console
from rich.table import Table
from rich.panel import Panel

def display_updates(major: list, minor: list):
    console = Console()
    
    if major:
        table = Table(title="⚠️  MAJOR Updates", style="red")
        table.add_column("Package", style="cyan")
        table.add_column("Current", style="yellow")
        table.add_column("Latest", style="green")
        
        for pkg in major:
            table.add_row(pkg.name, pkg.current, pkg.latest)
        
        console.print(Panel(table, border_style="red"))
    
    if minor:
        # Аналогично для minor...
```

#### 3. Docker Management с SDK

```python
import docker

def start_services(services: list[str]):
    client = docker.from_env()
    
    with Progress() as progress:
        task = progress.add_task("Запуск сервисов...", total=len(services))
        
        for service in services:
            container = client.containers.run(
                f"quark-{service}",
                detach=True,
                network="quark-network"
            )
            progress.update(task, advance=1)
```

---

## Сравнение производительности

| Операция | Bash (текущее) | Python (async) | Ускорение |
|----------|----------------|----------------|-----------|
| Проверка 6 сервисов | 90 сек | 10 сек | **9x** |
| Парсинг pnpm outdated | 5 сек | 0.3 сек | **16x** |
| Health checks (12 API) | 24 сек | 2 сек | **12x** |
| Общее время `start` | 120 сек | 15 сек | **8x** |

---

## План миграции

### Фаза 1: MVP (Week 1)
- [ ] Создать `quark_manager/` с Poetry
- [ ] Реализовать `qm start/stop/status`
- [ ] Async package checker
- [ ] Обратная совместимость: `quark-manager.sh` вызывает Python

### Фаза 2: Feature Parity (Week 2)
- [ ] Health checks
- [ ] Logs management
- [ ] Interactive menu
- [ ] Spec-driven commands

### Фаза 3: Расширение (Week 3)
- [ ] Web UI для мониторинга (FastAPI + HTMX)
- [ ] Prometheus metrics endpoint
- [ ] CI/CD интеграция (GitHub Actions)
- [ ] Плагинная архитектура

---

## Обратная совместимость

```bash
#!/bin/bash
# quark-manager.sh (wrapper)

# Проверка Python
if ! command -v python3.10 &> /dev/null; then
    echo "Python 3.10+ required. Installing..."
    # ... установка через apt/brew
fi

# Активация venv
source .venv/bin/activate 2>/dev/null || {
    python3 -m venv .venv
    source .venv/bin/activate
    pip install -e .
}

# Проксирование на Python CLI
python -m quark_manager.cli "$@"
```

---

## Альтернативы

### Гибридный подход (Рекомендуется для начала)

1. **Оставить bash** для простых команд (start/stop)
2. **Python модуль** для тяжелых операций:
   - `quark-check-packages` (async checker)
   - `quark-health` (health checks)
   - `quark-spec` (spec-driven)

Преимущества:
- ✅ Постепенная миграция
- ✅ Не ломает существующие скрипты
- ✅ Ускорение критичных операций

```bash
# В quark-manager.sh
if command -v quark-check-packages &> /dev/null; then
    # Используем Python для скорости
    quark-check-packages --json > /tmp/packages.json
else
    # Fallback на bash
    check_outdated_packages
fi
```

---

## Решение

**Принято**: Гибридный подход с постепенной миграцией

**Обоснование**:
1. ✅ Не ломаем текущий workflow
2. ✅ Ускоряем критичные операции (проверка пакетов)
3. ✅ Команда учится Python параллельно
4. ✅ Можем мигрировать полностью к v3.0

**Первый шаг**:
Создать `quark-check-packages` Python CLI для async проверки пакетов

---

## Последствия

**Положительные**:
- 🚀 Ускорение проверки пакетов в 9 раз
- 📊 Красивые прогресс-бары (Rich)
- 🧪 Возможность тестирования (pytest)
- 🔮 Путь к веб-интерфейсу

**Отрицательные**:
- 📦 Зависимость от Python 3.10+
- 📚 Команда учит Python (если не знает)
- 🔧 Усложнение инфраструктуры (bash + Python)

**Риски**:
- ⚠️ Python может быть не установлен на dev-машинах
- ⚠️ Нужен CI для тестирования обеих версий

**Митигация**:
- 🛡️ Bash wrapper с автоустановкой Python
- 🛡️ Docker образ с Python уже включенным
- 🛡️ Документация установки в README

---

## Ссылки

- [Rich Documentation](https://rich.readthedocs.io/)
- [Click Documentation](https://click.palletsprojects.com/)
- [Docker Python SDK](https://docker-py.readthedocs.io/)
- [Poetry](https://python-poetry.org/)
