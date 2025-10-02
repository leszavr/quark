#!/bin/bash

# Quark МКС Service Manager v2.0
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

# Создание папки для логов
mkdir -p "$LOG_DIR"

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

# Определение всех сервисов МКС
declare -A SERVICES=(
    # Инфраструктурные сервисы
    ["postgres"]="PostgreSQL Database (port 5432)"
    ["redis"]="Redis Cache & State Store (port 6379)"
    ["nats"]="NATS JetStream Event Bus (port 4222)"
    ["vault"]="HashiCorp Vault Secrets Manager (port 8200)"
    ["traefik"]="Traefik API Gateway (ports 80/443/8080)"
    ["minio"]="MinIO Object Storage (ports 9000/9001)"
    
    # Микросервисы (порты 3000-3020)
    ["plugin-hub"]="Plugin Hub - МКС Command Module (port 3000)"
    ["auth-service"]="Auth Service - JWT Authentication & User Management (port 3001)"
    ["blog-service"]="Blog Service - Interface Integration (Blog + Messaging) (port 3004)"
    ["monitoring"]="Monitoring Dashboard (port 3900)"
    ["quark-ui"]="Quark Platform UI - Admin Console (port 3100)"
    
    # Планируемые микросервисы
    # ["user"]="User Service (port 3002)"
    # ["media"]="Media Service (port 3003)"
    # ["messaging"]="Messaging Service (port 3005)"
)

# Порядок запуска сервисов (критически важно!)
STARTUP_ORDER=(
    "postgres"
    "redis" 
    "nats"
    "vault"
    "traefik"
    "minio"
    "plugin-hub"
    "auth-service"
    "blog-service"
    "monitoring"
    "quark-ui"
)

# Функция отображения логотипа
show_logo() {
    echo ""
    echo -e "${CYAN}🚀 ═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}   ░▒▓█ QUARK МКС SERVICE MANAGER v2.0 █▓▒░${NC}"
    echo -e "${CYAN}   Модульная Космическая Станция - Управление Микросервисами${NC}"
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
    echo -e "    ${GREEN}menu${NC}        Интерактивное меню"
    echo -e "    ${GREEN}list${NC}        Показать все доступные сервисы"
    echo ""
    echo -e "${WHITE}UI КОМАНДЫ:${NC}"
    echo -e "    ${PURPLE}ui:dev${NC}      Запустить UI в режиме разработки"
    echo -e "    ${PURPLE}ui:build${NC}    Собрать UI для продакшена"
    echo -e "    ${PURPLE}ui:start${NC}    Запустить UI через Docker"
    echo -e "    ${PURPLE}ui:open${NC}     Открыть UI в браузере"
    echo ""
    echo -e "${WHITE}ОПЦИИ:${NC}"
    echo -e "    ${YELLOW}-f, --force${NC}     Принудительная операция"
    echo -e "    ${YELLOW}-q, --quiet${NC}     Тихий режим"
    echo -e "    ${YELLOW}-v, --verbose${NC}   Подробный вывод"
    echo -e "    ${YELLOW}-h, --help${NC}      Показать эту справку"
    echo ""
    echo -e "${WHITE}ПРИМЕРЫ:${NC}"
    echo -e "    ${CYAN}./quark-manager.sh start${NC}                    # Запустить все сервисы"
    echo -e "    ${CYAN}./quark-manager.sh start plugin-hub redis${NC}   # Запустить только указанные"
    echo -e "    ${CYAN}./quark-manager.sh restart monitoring${NC}       # Перезапустить мониторинг"
    echo -e "    ${CYAN}./quark-manager.sh rebuild plugin-hub${NC}       # Пересобрать Plugin Hub"
    echo -e "    ${CYAN}./quark-manager.sh status${NC}                   # Статус всех сервисов"
    echo -e "    ${CYAN}./quark-manager.sh health${NC}                   # Health check API сервисов"
    echo -e "    ${CYAN}./quark-manager.sh logs plugin-hub${NC}          # Логи Plugin Hub"
    echo -e "    ${CYAN}./quark-manager.sh ui:dev${NC}                   # Запустить UI для разработки"
    echo -e "    ${CYAN}./quark-manager.sh ui:open${NC}                  # Открыть UI в браузере"
    echo ""
    echo -e "${WHITE}ДОСТУПНЫЕ СЕРВИСЫ:${NC}"

    for service in "${STARTUP_ORDER[@]}"; do
        if [[ -n "${SERVICES[$service]}" ]]; then
            printf "    ${GREEN}%-12s${NC} %s\n" "$service" "${SERVICES[$service]}"
        fi
    done
    echo ""
}

# Функция проверки Docker и Docker Compose
check_requirements() {
    if ! command -v docker &> /dev/null; then
        print_log "$RED" "ERROR" "❌ Docker не установлен!"
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        print_log "$RED" "ERROR" "❌ Docker Compose не установлен!"
        exit 1
    fi

    if [[ ! -f "$COMPOSE_FILE" ]]; then
        print_log "$RED" "ERROR" "❌ Файл docker-compose.yml не найден: $COMPOSE_FILE"
        exit 1
    fi
}

# Функция проверки существования сервиса
validate_service() {
    local service="$1"
    if [[ -z "${SERVICES[$service]}" ]]; then
        print_log "$RED" "ERROR" "❌ Неизвестный сервис: $service"
        print_log "$YELLOW" "INFO" "Доступные сервисы: ${!SERVICES[*]}"
        return 1
    fi
    return 0
}

# Функция получения статуса сервиса
get_service_status() {
    local service="$1"
    local container_name
    
    # Специальные случаи для именования контейнеров
    case $service in
        "auth-service")
            container_name="quark-auth"
            ;;
        "plugin-hub")
            container_name="quark-plugin-hub"
            ;;
        "quark-ui")
            container_name="quark-ui"
            ;;
        *)
            container_name="quark-$service"
            ;;
    esac
    
    if docker ps --format "table {{.Names}}\t{{.Status}}" | grep -q "^$container_name"; then
        echo "running"
    elif docker ps -a --format "table {{.Names}}\t{{.Status}}" | grep -q "^$container_name"; then
        echo "stopped"
    else
        echo "not_created"
    fi
}

# Функция отображения статуса всех сервисов
show_status() {
    print_log "$BLUE" "INFO" "📊 Статус сервисов МКС Quark:"
    print_log "$BLUE" "INFO" "════════════════════════════════════════════"
    
    for service in "${STARTUP_ORDER[@]}"; do
        local status=$(get_service_status "$service")
        local description="${SERVICES[$service]}"
        
        case $status in
            "running")
                print_log "$GREEN" "INFO" "✅ $service - РАБОТАЕТ ($description)"
                ;;
            "stopped")
                print_log "$YELLOW" "WARN" "⏸️  $service - ОСТАНОВЛЕН ($description)"
                ;;
            "not_created")
                print_log "$RED" "ERROR" "❌ $service - НЕ СОЗДАН ($description)"
                ;;
        esac
    done
    
    echo ""
    docker-compose ps
}

# Функция запуска сервисов
start_services() {
    local services=("$@")
    
    if [[ ${#services[@]} -eq 0 ]]; then
        services=("${STARTUP_ORDER[@]}")
        print_log "$GREEN" "INFO" "🚀 Запуск всех сервисов МКС в правильном порядке..."
    else
        print_log "$GREEN" "INFO" "🚀 Запуск выбранных сервисов: ${services[*]}"
    fi
    
    # Проверяем корректность имен сервисов
    for service in "${services[@]}"; do
        validate_service "$service" || exit 1
    done
    
    # Создаем сеть через docker-compose если не существует
    if ! docker network ls | grep -q "quark_quark-network"; then
        print_log "$BLUE" "INFO" "🌐 Создание Docker-сети через docker-compose..."
        docker-compose up --no-start
    fi
    
    # Запускаем сервисы
    for service in "${services[@]}"; do
        print_log "$BLUE" "INFO" "📦 Запуск $service (${SERVICES[$service]})..."
        docker-compose up -d "$service"
        
        # Даем время на инициализацию критически важных сервисов
        case $service in
            "postgres"|"redis"|"vault")
                print_log "$YELLOW" "INFO" "⏳ Ожидание инициализации $service (5 сек)..."
                sleep 5
                ;;
        esac
    done
    
    print_log "$GREEN" "SUCCESS" "✅ Запуск завершен!"
}

# Функция остановки сервисов
stop_services() {
    local services=("$@")
    
    if [[ ${#services[@]} -eq 0 ]]; then
        print_log "$YELLOW" "INFO" "⏹️  Остановка всех сервисов..."
        docker-compose down
    else
        print_log "$YELLOW" "INFO" "⏹️  Остановка сервисов: ${services[*]}"
        for service in "${services[@]}"; do
            validate_service "$service" || exit 1
            print_log "$YELLOW" "INFO" "📦 Остановка $service..."
            docker-compose stop "$service"
        done
    fi
    
    print_log "$YELLOW" "SUCCESS" "✅ Остановка завершена!"
}

# Функция пересборки образов
rebuild_services() {
    local services=("$@")
    
    if [[ ${#services[@]} -eq 0 ]]; then
        services=("plugin-hub" "auth-service" "monitoring")  # Только наши микросервисы
        print_log "$PURPLE" "INFO" "🔨 Пересборка всех микросервисов..."
    else
        print_log "$PURPLE" "INFO" "🔨 Пересборка сервисов: ${services[*]}"
    fi
    
    for service in "${services[@]}"; do
        validate_service "$service" || exit 1
        print_log "$PURPLE" "INFO" "🔨 Пересборка $service..."
        docker-compose build --no-cache "$service"
    done
    
    print_log "$PURPLE" "SUCCESS" "✅ Пересборка завершена!"
}

# Функция health check API сервисов
health_check() {
    print_log "$CYAN" "INFO" "🏥 Проверка health API сервисов..."
    print_log "$CYAN" "INFO" "════════════════════════════════════════"
    
    # Plugin Hub health check
    if command -v curl &> /dev/null; then
        if curl -s http://localhost:3000/health &> /dev/null; then
            print_log "$GREEN" "SUCCESS" "✅ Plugin Hub - API доступен (port 3000)"
        else
            print_log "$RED" "ERROR" "❌ Plugin Hub - API недоступен (port 3000)"
        fi
        
        if curl -s http://localhost:3001/auth/health &> /dev/null; then
            print_log "$GREEN" "SUCCESS" "✅ Auth Service - API доступен (port 3001)"
        else
            print_log "$RED" "ERROR" "❌ Auth Service - API недоступен (port 3001)"
        fi
        
        if curl -s http://localhost:3900 &> /dev/null; then
            print_log "$GREEN" "SUCCESS" "✅ Monitoring Dashboard - доступен (port 3900)"
        else
            print_log "$RED" "ERROR" "❌ Monitoring Dashboard - недоступен (port 3900)"
        fi
        
        if curl -s http://localhost:3100/health &> /dev/null; then
            print_log "$GREEN" "SUCCESS" "✅ Quark Platform UI - доступен (port 3100)"
        else
            print_log "$RED" "ERROR" "❌ Quark Platform UI - недоступен (port 3100)"
        fi
    else
        print_log "$YELLOW" "WARN" "⚠️  curl не установлен, пропускаем API проверки"
    fi
}

# UI функции
ui_dev() {
    print_log "$PURPLE" "UI" "🎨 Запуск Quark Platform UI в режиме разработки..."
    
    if [ ! -d "$SCRIPT_DIR/infra/quark-ui" ]; then
        print_log "$RED" "ERROR" "❌ Директория quark-ui не найдена"
        return 1
    fi
    
    cd "$SCRIPT_DIR/infra/quark-ui"
    
    if [ ! -f "package.json" ]; then
        print_log "$RED" "ERROR" "❌ package.json не найден в quark-ui"
        return 1
    fi
    
    if [ ! -d "node_modules" ]; then
        print_log "$YELLOW" "WARN" "⚠️  node_modules не найден, устанавливаем зависимости..."
        npm install
    fi
    
    print_log "$GREEN" "SUCCESS" "🚀 Запуск dev сервера на http://localhost:3100"
    npm run dev
}

ui_build() {
    print_log "$PURPLE" "UI" "🔨 Сборка Quark Platform UI для продакшена..."
    
    if [ ! -d "$SCRIPT_DIR/infra/quark-ui" ]; then
        print_log "$RED" "ERROR" "❌ Директория quark-ui не найдена"
        return 1
    fi
    
    cd "$SCRIPT_DIR/infra/quark-ui"
    
    if [ ! -d "node_modules" ]; then
        print_log "$YELLOW" "WARN" "⚠️  node_modules не найден, устанавливаем зависимости..."
        npm install
    fi
    
    print_log "$GREEN" "SUCCESS" "✅ Сборка завершена в директории dist/"
    npm run build
}

ui_start() {
    print_log "$PURPLE" "UI" "🐳 Запуск Quark Platform UI через Docker..."
    
    # Останавливаем существующий контейнер если есть
    if docker ps -q -f name=quark-ui > /dev/null 2>&1; then
        print_log "$YELLOW" "WARN" "⚠️  Останавливаем существующий контейнер quark-ui"
        docker stop quark-ui > /dev/null 2>&1
        docker rm quark-ui > /dev/null 2>&1
    fi
    
    # Запускаем через docker-compose
    docker-compose up -d quark-ui
    
    print_log "$GREEN" "SUCCESS" "✅ UI запущен на http://localhost:3100"
}

ui_open() {
    print_log "$PURPLE" "UI" "🌐 Открытие Quark Platform UI в браузере..."
    
    local url="http://localhost:3100"
    
    # Проверяем доступность UI
    if command -v curl &> /dev/null; then
        if ! curl -s "$url" > /dev/null 2>&1; then
            print_log "$YELLOW" "WARN" "⚠️  UI недоступен, попытка запуска..."
            ui_start
            sleep 3
        fi
    fi
    
    # Определяем команду для открытия браузера
    if command -v xdg-open &> /dev/null; then
        xdg-open "$url"
    elif command -v open &> /dev/null; then
        open "$url"
    elif command -v start &> /dev/null; then
        start "$url"
    else
        print_log "$YELLOW" "WARN" "⚠️  Не удалось определить команду для открытия браузера"
        print_log "$CYAN" "INFO" "🌐 Откройте браузер и перейдите по адресу: $url"
    fi
    
    print_log "$GREEN" "SUCCESS" "✅ UI открыт по адресу: $url"
}

# Основная функция
main() {
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
            start|stop|restart|build|rebuild|status|health|logs|clean|menu|list|ui:dev|ui:build|ui:start|ui:open)
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
                docker-compose logs
            else
                docker-compose logs "${services[@]}"
            fi
            ;;
        clean)
            print_log "$RED" "WARN" "🧹 Очистка всех контейнеров и образов..."
            docker-compose down --rmi all --volumes --remove-orphans
            docker system prune -f
            print_log "$RED" "SUCCESS" "✅ Очистка завершена!"
            ;;
        list)
            echo ""
            echo -e "${WHITE}📋 Доступные сервисы МКС Quark:${NC}"
            echo "════════════════════════════════════════════════════════"
            for service in "${STARTUP_ORDER[@]}"; do
                printf "  ${GREEN}%-12s${NC} %s\n" "$service" "${SERVICES[$service]}"
            done
            echo ""
            ;;
        menu)
            print_log "$BLUE" "INFO" "🔧 Интерактивное меню будет добавлено в следующей версии..."
            ;;
        ui:dev)
            ui_dev
            ;;
        ui:build)
            ui_build
            ;;
        ui:start)
            ui_start
            ;;
        ui:open)
            ui_open
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
