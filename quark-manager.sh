#!/bin/bash

# Quark МКС Service Manager v2.1
# Унифицированный скрипт управления всеми микросервисами платформы Quark
# Автор: Quark Development Team
# Дата: 2 октября 2025

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Константы
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
LOG_DIR="$SCRIPT_DIR/logs"
LOG_FILE="$LOG_DIR/quark-manager.log"
COMPOSE_FILE="$SCRIPT_DIR/docker-compose.yml"
ENV_FILE="$SCRIPT_DIR/.env"

# Создание папки для логов
mkdir -p "$LOG_DIR"

# Флаги
SKIP_ENV_CHECK=false

# Проверка наличия .env файла
check_env_file() {
  if [ ! -f "$ENV_FILE" ] && [ "$SKIP_ENV_CHECK" = false ]; then
    echo -e "${RED}❌ Файл .env не найден!${NC}"
    echo -e "${YELLOW}Пожалуйста, создайте файл .env в корне проекта с необходимыми переменными окружения.${NC}"
    echo -e "${YELLOW}Вы можете скопировать .env.example (если есть) или создать новый файл с переменными:${NC}"
    echo -e "${YELLOW}POSTGRES_USER=quark_user${NC}"
    echo -e "${YELLOW}POSTGRES_PASSWORD=quark_password${NC}"
    echo -e "${YELLOW}MINIO_ROOT_USER=minioadmin${NC}"
    echo -e "${YELLOW}MINIO_ROOT_PASSWORD=minioadmin${NC}"
    echo -e "${YELLOW}VAULT_DEV_ROOT_TOKEN_ID=myroot${NC}"
    echo ""
    echo -e "${CYAN}Для пропуска этой проверки используйте флаг --skip-env-check${NC}"
    exit 1
  fi
}

# Функция логирования
log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] [$level] $message" >> "$LOG_FILE"
}

# Функция вывода с логированием
print_log() {
    local color="$1"
    local level="$2"
    shift 2
    local message="$*"
    echo -e "${color}$message${NC}"
    log "$level" "$message"
}

# Функция отображения логотипа
show_logo() {
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}         ░▒▓█ QUARK МКС SERVICE MANAGER v2.0 █▓▒░${NC}"
    echo -e "${CYAN}             МКС - Управление Микросервисами${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
    echo ""
}

# Функция отображения помощи
show_help() {
    echo ""
    echo -e "${WHITE}ИСПОЛЬЗОВАНИЕ:${NC}"
    echo "    ./quark-manager.sh [КОМАНДА] [ОПЦИИ] [СЕРВИСЫ...]"
    echo ""
    echo -e "${WHITE}КОМАНДЫ:${NC}"
    echo -e "    ${GREEN}start${NC}       Запустить сервисы (по умолчанию все)"
    echo -e "    ${GREEN}stop${NC}        Остановить сервисы"
    echo -e "    ${GREEN}restart${NC}     Перезапустить сервисы"
    echo -e "    ${GREEN}build${NC}       Пересобрать образы сервисов"
    echo -e "    ${GREEN}rebuild${NC}     Пересобрать и перезапустить"
    echo -e "    ${GREEN}status${NC}      Показать статус всех сервисов"
    echo -e "    ${GREEN}health${NC}      Проверить health всех API сервисов"
    echo -e "    ${GREEN}logs${NC}        Показать логи сервисов"
    echo -e "    ${GREEN}clean${NC}       Очистить все контейнеры и образы"
    echo -e "    ${RED}hard-reboot${NC}  Полная перезагрузка системы (ОСТОРОЖНО!)"
    echo -e "    ${GREEN}list${NC}        Показать все доступные сервисы"
    echo ""
    echo -e "${WHITE}UI КОМАНДЫ:${NC}"
    echo -e "    ${PURPLE}ui:dev${NC}      Запустить UI в режиме разработки"
    echo -e "    ${PURPLE}ui:build${NC}    Собрать UI для продакшена"
    echo -e "    ${PURPLE}ui:start${NC}    Запустить UI через Docker"
    echo -e "    ${PURPLE}ui:open${NC}     Открыть UI в браузере"
    echo ""
    echo -e "${WHITE}SPEC-DRIVEN КОМАНДЫ:${NC}"
    echo -e "    ${CYAN}spec:new <name>${NC}       Создать новую спецификацию сервиса"
    echo -e "    ${CYAN}spec:validate [dir]${NC}   Валидировать спецификации и контракты"
    echo -e "    ${CYAN}spec:types <num>${NC}      Генерировать TypeScript types из OpenAPI"
    echo -e "    ${CYAN}spec:mock <num>${NC}       Запустить mock API server"
    echo -e "    ${CYAN}spec:generate-tests <num>${NC}  Генерировать тесты из контрактов"
    echo ""
    echo -e "${WHITE}VAULT & SECURITY:${NC}"
    echo -e "    ${PURPLE}vault:init${NC}        Инициализировать Vault и создать секреты"
    echo -e "    ${PURPLE}security:check${NC}    Проверить код на наличие секретов (gitleaks)"
    echo -e "    ${PURPLE}check:structure${NC}   Проверить структуру проекта и импорты"
    echo ""
    echo -e "${WHITE}ОПЦИИ:${NC}"
    echo -e "    ${YELLOW}-f, --force${NC}     Принудительная операция"
    echo -e "    ${YELLOW}-q, --quiet${NC}     Тихий режим"
    echo -e "    ${YELLOW}-v, --verbose${NC}   Подробный вывод"
    echo -e "    ${YELLOW}--skip-outdated-check${NC}   Пропустить проверку версий пакетов"
    echo -e "    ${YELLOW}--skip-structure-check${NC}  Пропустить проверку структуры проекта"
    echo -e "    ${YELLOW}-h, --help${NC}      Показать эту справку"
    echo ""
    echo -e "${WHITE}ПРИМЕРЫ:${NC}"
    echo -e "    ${CYAN}./quark-manager.sh start${NC}                    # Запустить все сервисы"
    echo -e "    ${CYAN}./quark-manager.sh start plugin-hub redis${NC}   # Запустить только указанные"
    echo ""
}

# Функция проверки Docker и Docker Compose
check_requirements() {
    if ! command -v docker &> /dev/null; then
        print_log "$RED" "ERROR" "❌ Docker не установлен!"
        exit 1
    fi

    if ! command -v docker compose &> /dev/null; then
        print_log "$RED" "ERROR" "❌ Docker Compose не установлен!"
        exit 1
    fi

    if [[ ! -f "$COMPOSE_FILE" ]]; then
        print_log "$RED" "ERROR" "❌ Файл docker compose.yml не найден: $COMPOSE_FILE"
        exit 1
    fi
}

# Функция проверки существования сервиса
validate_service() {
    # Простая проверка сервиса через docker-compose
    if ! docker compose config --services | grep -q "^$1$"; then
        print_log "$RED" "ERROR" "❌ Неизвестный сервис: $1"
        print_log "$YELLOW" "INFO" "Доступные сервисы:"
        docker compose config --services | sed 's/^/  /'
        return 1
    fi
    return 0
}

# Функция отображения статуса всех сервисов
show_status() {
    echo ""
    print_log "$BLUE" "INFO" "📊 Статус сервисов МКС Quark"
    echo ""
    
    # Получаем список всех сервисов
    local services=$(docker compose ps --format '{{.Name}}' 2>/dev/null)
    
    if [[ -z "$services" ]]; then
        print_log "$YELLOW" "WARN" "⚠️  Нет запущенных сервисов"
        echo ""
        print_log "$CYAN" "INFO" "💡 Запустите: ./quark-manager.sh start"
        echo ""
        return
    fi
    
    # Краткий список со статусами
    echo -e "${WHITE}Краткий обзор:${NC}"
    echo ""
    
    while IFS= read -r container; do
        if [[ -z "$container" ]]; then
            continue
        fi
        
        # Получаем информацию о контейнере
        local status=$(docker inspect --format '{{.State.Status}}' "$container" 2>/dev/null || echo "unknown")
        local health=$(docker inspect --format '{{.State.Health.Status}}' "$container" 2>/dev/null || echo "none")
        
        # Определяем иконку статуса
        local status_icon=""
        local status_color="$NC"
        
        if [[ "$status" == "running" ]]; then
            if [[ "$health" == "healthy" ]]; then
                status_icon="✅"
                status_color="$GREEN"
            elif [[ "$health" == "starting" ]]; then
                status_icon="⏳"
                status_color="$YELLOW"
            elif [[ "$health" == "unhealthy" ]]; then
                status_icon="❌"
                status_color="$RED"
            else
                status_icon="▶️"
                status_color="$GREEN"
            fi
        elif [[ "$status" == "restarting" ]]; then
            status_icon="🔄"
            status_color="$YELLOW"
        elif [[ "$status" == "exited" ]]; then
            status_icon="⏹️"
            status_color="$RED"
        else
            status_icon="❓"
            status_color="$YELLOW"
        fi
        
        # Форматируем имя сервиса (убираем префикс quark-)
        local service_name="${container#quark-}"
        
        # Выводим строку
        echo -e "  ${status_color}${status_icon} ${service_name}${NC}"
            
    done <<< "$services"
    
    echo ""
    
    # Статистика
    local total=$(echo "$services" | grep -c .)
    local running=$(docker compose ps --filter "status=running" --format '{{.Name}}' 2>/dev/null | wc -l)
    local stopped=$(docker compose ps --filter "status=exited" --format '{{.Name}}' 2>/dev/null | wc -l)
    
    echo -e "${CYAN}📈 Всего: $total | ▶️  Запущено: $running | ⏹️  Остановлено: $stopped${NC}"
    echo ""
    
    # Подробная таблица от Docker Compose
    echo -e "${WHITE}Подробная информация:${NC}"
    echo ""
    docker compose ps
    echo ""
}

# Функция проверки структуры проекта
check_project_structure() {
    print_log "$CYAN" "INFO" "🔍 Проверка структуры проекта..."
    
    if command -v node &> /dev/null; then
        local tool_path="$SCRIPT_DIR/tools/quark-manager/dist/check-structure.js"
        
        if [[ -f "$tool_path" ]]; then
            if node "$tool_path" --root "$SCRIPT_DIR" --quiet; then
                print_log "$GREEN" "SUCCESS" "✅ Структура проекта корректна"
                return 0
            else
                print_log "$RED" "ERROR" "❌ Обнаружены нарушения структуры проекта!"
                print_log "$YELLOW" "INFO" "💡 Запустите: ./quark-manager.sh check:structure"
                print_log "$YELLOW" "INFO" "💡 Для пропуска проверки используйте: --skip-structure-check"
                return 1
            fi
        else
            print_log "$YELLOW" "WARN" "⚠️  Инструмент check-structure.js не найден, пропускаем проверку"
            return 0
        fi
    else
        print_log "$YELLOW" "WARN" "⚠️  Node.js не установлен, пропускаем проверку структуры"
        return 0
    fi
}

# Функция запуска сервисов
start_services() {
    local services=("$@")
    
    if [[ ${#services[@]} -eq 0 ]]; then
        print_log "$GREEN" "INFO" "🚀 Запуск всех сервисов МКС..."
        docker compose up -d
    else
        print_log "$GREEN" "INFO" "🚀 Запуск выбранных сервисов: ${services[*]}"
        # Проверяем корректность имен сервисов
        for service in "${services[@]}"; do
            validate_service "$service" || exit 1
        done
        docker compose up -d "${services[@]}"
    fi
    
    print_log "$GREEN" "SUCCESS" "✅ Запуск завершен!"
}

# Функция остановки сервисов
stop_services() {
    local services=("$@")
    
    if [[ ${#services[@]} -eq 0 ]]; then
        print_log "$YELLOW" "INFO" "⏹️  Остановка всех сервисов..."
        docker compose down
    else
        print_log "$YELLOW" "INFO" "⏹️  Остановка сервисов: ${services[*]}"
        for service in "${services[@]}"; do
            validate_service "$service" || exit 1
        done
        for service in "${services[@]}"; do
            print_log "$YELLOW" "INFO" "📦 Остановка $service..."
            docker compose stop "$service"
        done
    fi
    
    print_log "$YELLOW" "SUCCESS" "✅ Остановка завершена!"
}

# Функция пересборки образов
rebuild_services() {
    local services=("$@")
    
    if [[ ${#services[@]} -eq 0 ]]; then
        print_log "$PURPLE" "INFO" "🔨 Пересборка всех сервисов..."
        docker compose build --no-cache
    else
        print_log "$PURPLE" "INFO" "🔨 Пересборка сервисов: ${services[*]}"
        for service in "${services[@]}"; do
            validate_service "$service" || exit 1
        done
        docker compose build --no-cache "${services[@]}"
    fi
    
    print_log "$PURPLE" "SUCCESS" "✅ Пересборка завершена!"
}

# Функция health check API сервисов
health_check() {
    print_log "$CYAN" "INFO" "🏥 Проверка health API сервисов..."
    print_log "$CYAN" "════════════════════════════════════════"
    
    # Простая проверка через docker compose
    for service in $(docker compose config --services); do
        if docker compose ps --format json | grep -q "\"$service\""; then
            if docker compose ps --format json | grep "\"$service\"" | grep -q '"running"'; then
                print_log "$GREEN" "SUCCESS" "✅ $service - работает"
            else
                print_log "$YELLOW" "WARN" "⚠️  $service - остановлен"
            fi
        else
            print_log "$RED" "ERROR" "❌ $service - не создан"
        fi
    done
}

# Основная функция запуска
main() {
    # Проверка наличия .env файла
    check_env_file
    
    show_logo
    check_requirements
    
    # Парсинг аргументов
    local command=""
    local force=false
    local quiet=false
    local verbose=false
    local services=()
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            start|stop|restart|build|rebuild|status|health|logs|clean|hard-reboot|menu|list|ui:dev|ui:build|ui:start|ui:open|spec:new|spec:validate|spec:types|spec:mock|spec:generate-tests|vault:init|security:check|check:structure)
                command="$1"
                shift
                ;;
            -f|--force)
                force=true
                shift
                ;;
            -q|--quiet)
                quiet=true
                shift
                ;;
            -v|--verbose)
                verbose=true
                shift
                ;;
            --skip-env-check)
                SKIP_ENV_CHECK=true
                shift
                ;;
            --skip-outdated-check)
                export SKIP_PACKAGE_CHECK=true
                shift
                ;;
            --skip-structure-check)
                export SKIP_STRUCTURE_CHECK=true
                shift
                ;;
            -h|--help)
                show_help
                exit 0
                ;;
            *)
                services+=("$1")
                shift
                ;;
        esac
    done
    
    # Если команда не указана, показываем помощь
    if [[ -z "$command" ]]; then
        show_help
        exit 0
    fi
    
    # Проверка структуры проекта для команд, которые это требуют
    if [[ "$command" != "help" ]] && [[ "$command" != "--help" ]] && [[ -z "$SKIP_STRUCTURE_CHECK" ]]; then
        check_project_structure || true  # Не останавливаем выполнение при ошибке
    fi
    
    # Выполнение команд
    case $command in
        start)
            start_services "${services[@]}"
            show_status
            ;;
        stop)
            stop_services "${services[@]}"
            ;;
        restart)
            stop_services "${services[@]}"
            sleep 2
            start_services "${services[@]}"
            show_status
            ;;
        build)
            rebuild_services "${services[@]}"
            ;;
        rebuild)
            rebuild_services "${services[@]}"
            start_services "${services[@]}"
            show_status
            ;;
        status)
            show_status
            ;;
        health)
            health_check
            ;;
        logs)
            if [[ ${#services[@]} -eq 0 ]]; then
                docker compose logs
            else
                docker compose logs "${services[@]}"
            fi
            ;;
        clean)
            print_log "$RED" "WARN" "🧹 Очистка всех контейнеров и образов..."
            docker compose down --rmi all --volumes --remove-orphans
            docker system prune -f
            print_log "$RED" "SUCCESS" "✅ Очистка завершена!"
            ;;
        hard-reboot)
            print_log "$RED" "WARN" "⚠️  ВНИМАНИЕ: Полная перезагрузка системы!"
            print_log "$RED" "WARN" "Это остановит и удалит ВСЕ контейнеры, образы и volumes."
            read -p "Вы уверены? (yes/no): " -r
            if [[ $REPLY == "yes" ]]; then
                docker compose down --rmi all --volumes --remove-orphans
                docker system prune -af --volumes
                print_log "$GREEN" "SUCCESS" "✅ Система полностью очищена. Запустите start для пересборки."
            else
                print_log "$YELLOW" "INFO" "Операция отменена."
            fi
            ;;
        list)
            echo ""
            echo -e "${WHITE}📋 Доступные сервисы МКС Quark:${NC}"
            echo "════════════════════════════════════════════════════════"
            docker compose config --services
            echo ""
            ;;
        menu)
            print_log "$BLUE" "INFO" "🔧 Интерактивное меню будет добавлено в следующей версии..."
            ;;
        check:structure)
            check_project_structure
            ;;
        vault:init|security:check|ui:dev|ui:build|ui:start|ui:open|spec:new|spec:validate|spec:types|spec:mock|spec:generate-tests)
            print_log "$YELLOW" "WARN" "⚠️  Команда $command еще не реализована в этой версии"
            print_log "$CYAN" "INFO" "💡 Обратитесь к документации или используйте --help"
            ;;
        *)
            print_log "$RED" "ERROR" "❌ Неизвестная команда: $command"
            show_help
            exit 1
            ;;
    esac
}

# Запуск основной функции
main "$@"