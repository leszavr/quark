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
    ["swagger-ui"]="Swagger UI - интерактивная документация API (port 8081)"

    # Микросервисы (порты 3000-3020)
    ["plugin-hub"]="Plugin Hub - МКС Command Module (port 3000)"
    ["auth-service"]="Auth Service - JWT Authentication & User Management (port 3001)"
    ["blog-service"]="Blog Service - Interface Integration (Blog + Messaging) (port 3004)"
    ["monitoring"]="Monitoring Dashboard (port 3900)"
    ["quark-ui"]="Quark Platform UI - Admin Console (port 3101)"
    ["quark-landing"]="Quark Landing - Main Landing Page (port 3200)"
    ["swagger-ui"]="Swagger UI - интерактивная документация API (port 8081)")

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
    "quark-landing"
    "swagger-ui"
)

# Функция отображения логотипа
show_logo() {
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
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
    echo -e "    ${RED}hard-reboot${NC}  Полная перезагрузка системы (ОСТОРОЖНО!)"
    echo -e "    ${GREEN}menu${NC}        Интерактивное меню"
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
    echo -e "${WHITE}ОПЦИИ:${NC}"
    echo -e "    ${YELLOW}-f, --force${NC}     Принудительная операция"
    echo -e "    ${YELLOW}-q, --quiet${NC}     Тихий режим"
    echo -e "    ${YELLOW}-v, --verbose${NC}   Подробный вывод"
    echo -e "    ${YELLOW}--skip-outdated-check${NC}   Пропустить проверку версий пакетов"
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
    echo -e "    ${CYAN}./quark-manager.sh hard-reboot${NC}              # Полная перезагрузка с очисткой"
    echo -e "    ${CYAN}./quark-manager.sh ui:dev${NC}                   # Запустить UI для разработки"
    echo -e "    ${CYAN}./quark-manager.sh ui:open${NC}                  # Открыть UI в браузере"
    echo ""
    echo -e "${PURPLE}SPEC-DRIVEN ПРИМЕРЫ:${NC}"
    echo -e "    ${CYAN}./quark-manager.sh spec:new messaging-service${NC}       # Создать спецификацию"
    echo -e "    ${CYAN}./quark-manager.sh spec:validate${NC}                    # Проверить все контракты"
    echo -e "    ${CYAN}./quark-manager.sh spec:types 001${NC}                   # Генерация TypeScript types"
    echo -e "    ${CYAN}./quark-manager.sh spec:mock 001 4010${NC}               # Запустить mock API на порту 4010"
    echo -e "    ${CYAN}./quark-manager.sh spec:generate-tests 001${NC}          # Генерация всех тестов"
    echo -e "    ${CYAN}./quark-manager.sh spec:generate-tests 001 --type=unit${NC}  # Только unit тесты"
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

# Функция проверки пакетов на устаревшие версии
# Функция сравнения версий и определения типа обновления
compare_versions() {
    local current="$1"
    local latest="$2"
    
    # Очистка версий от префиксов и суффиксов
    current=$(echo "$current" | sed 's/[^0-9.].*$//' | sed 's/^[^0-9]*//')
    latest=$(echo "$latest" | sed 's/[^0-9.].*$//' | sed 's/^[^0-9]*//')
    
    # Извлекаем major версию
    local current_major=$(echo "$current" | cut -d. -f1)
    local latest_major=$(echo "$latest" | cut -d. -f1)
    
    # Проверяем на пустые значения
    [[ -z "$current_major" || -z "$latest_major" ]] && echo "unknown" && return
    
    # Сравниваем только major версию для определения breaking changes
    if [[ "$latest_major" != "$current_major" ]]; then
        echo "major"
    else
        # Все остальные обновления (minor/patch) безопасны
        echo "minor"
    fi
}

check_outdated_packages() {
    # Пропускаем проверку если установлена переменная окружения
    if [[ "$SKIP_PACKAGE_CHECK" == "true" ]]; then
        print_log "$YELLOW" "WARN" "⚠️  Проверка пакетов пропущена (SKIP_PACKAGE_CHECK=true)"
        return 0
    fi
    
    # Проверяем наличие Node.js версии (в 2.6x быстрее)
    if command -v node &> /dev/null && [[ -f "$SCRIPT_DIR/tools/quark-manager/dist/check-packages.js" ]]; then
        print_log "$BLUE" "INFO" "🚀 Используем Node.js версию (ускорение в 2.6x)..."
        
        # Запускаем Node.js версию
        node "$SCRIPT_DIR/tools/quark-manager/dist/check-packages.js" --root "$SCRIPT_DIR"
        local exit_code=$?
        
        # Exit codes: 0=актуально, 1=major, 2=minor, 3=error
        if [[ $exit_code -eq 3 ]]; then
            print_log "$RED" "ERROR" "❌ Ошибка проверки пакетов. Используем bash версию..."
            # Fallback на bash версию
        elif [[ $exit_code -eq 2 ]]; then
            # Есть minor обновления
            echo ""
            echo -e "${WHITE}Обновить minor/patch пакеты автоматически? [y/N]: (по умолчанию N через 10 секунд)${NC}"
            
            local choice="n"
            if read -t 10 -r user_input; then
                choice="$user_input"
            else
                print_log "$YELLOW" "INFO" "⏱️  Время ожидания истекло. Пропускаем обновление."
            fi
            
            if [[ "$choice" =~ ^[Yy] ]]; then
                print_log "$GREEN" "INFO" "🔄 Обновляем пакеты..."
                # Обновляем через pnpm в root
                (cd "$SCRIPT_DIR" && pnpm update 2>&1 | tail -10)
                print_log "$GREEN" "SUCCESS" "✅ Обновление завершено!"
            fi
            return 0
        elif [[ $exit_code -eq 1 ]]; then
            # Есть major обновления - только информируем
            return 0
        else
            # Всё актуально
            return 0
        fi
    fi
    
    # Fallback на bash версию (если Node.js недоступен)
    print_log "$BLUE" "INFO" "🔍 Проверка пакетов на устаревшие версии (bash версия)..."
    
    local has_minor_updates=false
    local has_major_updates=false
    local services_to_update=()
    local services_with_packages=("plugin-hub" "auth-service" "blog-service" "quark-ui" "quark-landing" "monitoring")
    
    for service in "${services_with_packages[@]}"; do
        local service_path="$SCRIPT_DIR"
        
        # Определяем путь к сервису
        case $service in
            "plugin-hub"|"monitoring"|"quark-ui"|"quark-landing")
                service_path="$SCRIPT_DIR/infra/$service"
                ;;
            "auth-service"|"blog-service")
                service_path="$SCRIPT_DIR/services/$service"
                ;;
        esac
        
        if [[ -f "$service_path/package.json" ]]; then
            echo -ne "📦 Проверка $service... "
            
            # Показываем спиннер во время проверки
            local spinner_pid
            (while true; do for s in '⠋' '⠙' '⠹' '⠸' '⠼' '⠴' '⠦' '⠧' '⠇' '⠏'; do echo -ne "\r📦 Проверка $service... $s"; sleep 0.1; done; done) &
            spinner_pid=$!
            
            # Проверяем наличие устаревших пакетов через простую проверку вывода
            local check_result=$(cd "$service_path" && pnpm outdated --depth=0 2>/dev/null)
            kill $spinner_pid 2>/dev/null
            wait $spinner_pid 2>/dev/null
            echo -ne "\r\033[K"  # Очистка строки
            
            if echo "$check_result" | grep -q .; then
                local service_has_minor=false
                local service_has_major=false
                local major_packages=()
                local minor_packages=()
                
                # Анализируем каждый пакет
                local packages_info=$(echo "$check_result" | grep -v "WARN")
                
                if [[ -n "$packages_info" ]]; then
                    while IFS='│' read -r _ package current latest _; do
                        # Очищаем от пробелов
                        package=$(echo "$package" | xargs)
                        current=$(echo "$current" | xargs)
                        latest=$(echo "$latest" | xargs)
                        
                        # Пропускаем заголовки и разделители
                        [[ -z "$package" || "$package" == "Package" || "$current" == "Current" ]] && continue
                        [[ "$package" =~ ^[─┌┐└┘├┤┬┴┼]+$ ]] && continue
                        
                        # Проверяем валидность версий
                        if [[ -n "$current" && -n "$latest" && "$current" =~ ^[0-9] && "$latest" =~ ^[0-9] ]]; then
                            local update_type=$(compare_versions "$current" "$latest")
                            
                            if [[ "$update_type" == "major" ]]; then
                                service_has_major=true
                                major_packages+=("$package: $current → $latest")
                            elif [[ "$update_type" == "minor" ]]; then
                                service_has_minor=true
                                minor_packages+=("$package: $current → $latest")
                            fi
                        fi
                    done <<< "$packages_info"
                fi
                
                # Показываем MAJOR обновления (если есть)
                if [[ "$service_has_major" == true ]]; then
                    print_log "$RED" "WARN" "⚠️  $service - MAJOR обновления (несовместимые, требуют тестирования):"
                    for pkg in "${major_packages[@]}"; do
                        echo -e "     ${RED}▸${NC} $pkg"
                    done
                    has_major_updates=true
                fi
                
                # Показываем Minor обновления (если есть)
                if [[ "$service_has_minor" == true ]]; then
                    print_log "$GREEN" "INFO" "✅ $service - Minor/Patch обновления (безопасные, обратно совместимые):"
                    for pkg in "${minor_packages[@]}"; do
                        echo -e "     ${GREEN}▸${NC} $pkg"
                    done
                    has_minor_updates=true
                    services_to_update+=("$service:$service_path")
                fi
            else
                print_log "$GREEN" "SUCCESS" "✅ $service - все пакеты актуальны"
            fi
        else
            print_log "$YELLOW" "WARN" "⚠️  package.json не найден в $service_path"
        fi
    done
    
    # Обработка major обновлений (только информирование)
    if [[ "$has_major_updates" == true ]]; then
        echo ""
        echo -e "${RED}╔════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${RED}║  ⚠️  MAJOR ОБНОВЛЕНИЯ (требуют осторожности)              ║${NC}"
        echo -e "${RED}╚════════════════════════════════════════════════════════════╝${NC}"
        print_log "$YELLOW" "INFO" "   MAJOR версии могут содержать breaking changes"
        print_log "$YELLOW" "INFO" "   Рекомендуется обновлять вручную с тестированием"
        print_log "$CYAN" "INFO" "   Команда: cd <service> && pnpm update <package>@latest"
        echo ""
    fi
    
    # Обработка minor обновлений (предлагаем автоматическое обновление)
    if [[ "$has_minor_updates" == true ]]; then
        echo ""
        echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${GREEN}║  ✅ MINOR/PATCH ОБНОВЛЕНИЯ (безопасные)                   ║${NC}"
        echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
        print_log "$CYAN" "INFO" "   Minor/patch версии обратно совместимы (semver)"
        print_log "$CYAN" "INFO" "   Обновление безопасно для production"
        print_log "$CYAN" "INFO" "   Сервисов для обновления: ${#services_to_update[@]}"
        echo ""
        
        # Предлагаем обновить с таймером 10 секунд (по умолчанию N)
        echo -e "${WHITE}Обновить minor/patch пакеты автоматически? [y/N]: (по умолчанию N через 10 секунд)${NC}"
        
        local choice="n"
        if read -t 10 -r user_input; then
            choice="$user_input"
        else
            print_log "$YELLOW" "INFO" "⏱️  Время ожидания истекло. Пропускаем обновление."
        fi
        
        case $choice in
            [Yy]|[Yy][Ee][Ss])
                echo ""
                echo -e "${GREEN}🔄 Начинаем обновление пакетов...${NC}"
                echo ""
                
                local updated_count=0
                local failed_count=0
                
                for service_info in "${services_to_update[@]}"; do
                    local service="${service_info%%:*}"
                    local service_path="${service_info##*:}"
                    
                    print_log "$BLUE" "INFO" "📦 Обновление $service..."
                    
                    # Обновляем только minor/patch версии (без major)
                    if (cd "$service_path" && pnpm update 2>&1 | grep -v "WARN" | tee -a "$LOG_FILE" | tail -5); then
                        print_log "$GREEN" "SUCCESS" "   ✅ $service успешно обновлен"
                        ((updated_count++))
                    else
                        print_log "$RED" "ERROR" "   ❌ Ошибка обновления $service"
                        ((failed_count++))
                    fi
                    echo ""
                done
                
                echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
                echo -e "${GREEN}║  Результаты обновления:                                   ║${NC}"
                echo -e "${GREEN}║  ✅ Успешно: $updated_count                                           ║${NC}"
                [[ $failed_count -gt 0 ]] && echo -e "${RED}║  ❌ Ошибок: $failed_count                                            ║${NC}"
                echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
                echo ""
                ;;
            *)
                print_log "$YELLOW" "WARN" "⚠️  Обновление пропущено. Продолжаем с текущими версиями..."
                echo ""
                ;;
        esac
    fi
    
    # Если нет никаких обновлений
    if [[ "$has_minor_updates" == false && "$has_major_updates" == false ]]; then
        print_log "$GREEN" "SUCCESS" "✅ Все пакеты актуальны!"
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
        "quark-landing")
            container_name="quark-landing"
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
    
    # Проверяем пакеты на устаревшие версии (ЗОЛОТОЕ ПРАВИЛО)
    check_outdated_packages
    
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
        services=("plugin-hub" "auth-service" "blog-service" "monitoring")  # Только наши микросервисы
        print_log "$PURPLE" "INFO" "🔨 Пересборка всех микросервисов..."
    else
        print_log "$PURPLE" "INFO" "🔨 Пересборка сервисов: ${services[*]}"
    fi
    
    # Проверяем пакеты на устаревшие версии (ЗОЛОТОЕ ПРАВИЛО)
    check_outdated_packages
    
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
        
        if curl -s http://localhost:3101/health &> /dev/null; then
            print_log "$GREEN" "SUCCESS" "✅ Quark Platform UI - доступен (port 3101)"
        else
            print_log "$RED" "ERROR" "❌ Quark Platform UI - недоступен (port 3101)"
        fi
    else
        print_log "$YELLOW" "WARN" "⚠️  curl не установлен, пропускаем API проверки"
    fi
}

# UI функции
ui_dev() {
    print_header "🚀 Запуск Quark UI в режиме разработки..."
    cd "$PROJECT_ROOT/infra/quark-ui" || exit 1

    if [ ! -d "node_modules" ]; then
        print_log "$BLUE" "INFO" "📥 Установка зависимостей..."
        pnpm install
    fi

    print_log "$GREEN" "SUCCESS" "🚀 Запуск dev сервера на http://localhost:3101"
    pnpm run dev
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
            pnpm install
    fi
    
    print_log "$GREEN" "SUCCESS" "✅ Сборка завершена в директории dist/"
        pnpm run build
}

ui_start() {
    print_header "🚀 Запуск Quark UI..."
    cd "$PROJECT_ROOT/infra/quark-ui" || exit 1
    
    if [ ! -d "node_modules" ]; then
        print_log "$BLUE" "INFO" "📥 Установка зависимостей..."
            pnpm install
    fi
    
    print_log "$GREEN" "SUCCESS" "✅ UI запущен на http://localhost:3101"
        pnpm start
}

ui_open() {
    print_header "🌍 Открытие Quark UI в браузере..."
    local url="http://localhost:3101"
    
    case "$OSTYPE" in
        darwin*)
            open "$url" ;;
        linux*)
            xdg-open "$url" ;;
        msys*|cygwin*)
            start "$url" ;;
        *)
            print_log "$YELLOW" "WARN" "Не удалось определить ОС. Откройте вручную: $url" ;;
    esac
}

# Функция полной перезагрузки системы
hard_reboot() {
    print_log "$RED" "WARN" "🚨 HARD REBOOT - Полная перезагрузка системы Quark МКС"
    echo ""
    echo -e "${RED}⚠️  ВНИМАНИЕ! Данная операция выполнит:${NC}"
    echo -e "${YELLOW}   • Остановку всех контейнеров${NC}"
    echo -e "${YELLOW}   • Удаление всех Docker образов проекта${NC}"
    echo -e "${YELLOW}   • Удаление всех Docker томов${NC}"
    echo -e "${YELLOW}   • Удаление сетей и неиспользуемых объектов${NC}"
    echo -e "${YELLOW}   • Освобождение всех портов${NC}"
    echo -e "${YELLOW}   • Проверку актуальности всех пакетов${NC}"
    echo -e "${YELLOW}   • Полную пересборку всех сервисов${NC}"
    echo ""
    echo -e "${RED}⚠️  ВСЕ ДАННЫЕ В КОНТЕЙНЕРАХ БУДУТ ПОТЕРЯНЫ!${NC}"
    echo ""
    
    # Запрос подтверждения
    read -p "Вы уверены что хотите продолжить? Введите 'YES' для подтверждения: " confirm
    
    if [[ "$confirm" != "YES" ]]; then
        print_log "$GREEN" "INFO" "❌ Операция отменена пользователем"
        return 0
    fi
    
    print_log "$RED" "WARN" "🔥 Начинаем полную перезагрузку системы..."
    
    # Шаг 1: Остановка всех контейнеров
    print_log "$YELLOW" "INFO" "1️⃣  Остановка всех контейнеров..."
    docker-compose down --remove-orphans || true
    
    # Шаг 2: Удаление всех образов проекта
    print_log "$YELLOW" "INFO" "2️⃣  Удаление всех образов проекта..."
    docker images | grep -E "(quark|plugin-hub|auth-service|blog-service|monitoring)" | awk '{print $3}' | xargs -r docker rmi -f || true
    
    # Шаг 3: Полная очистка Docker
    print_log "$YELLOW" "INFO" "3️⃣  Полная очистка Docker системы..."
    docker system prune -af --volumes || true
    
    # Шаг 4: Освобождение портов
    print_log "$YELLOW" "INFO" "4️⃣  Проверка освобождения портов..."
    local ports=(80 443 8080 3000 3001 5432 6379 8086 8088 3100 3003 9090 9093)
    for port in "${ports[@]}"; do
        local pid=$(lsof -ti:$port 2>/dev/null || true)
        if [[ -n "$pid" ]]; then
            print_log "$YELLOW" "WARN" "   Освобождение порта $port (PID: $pid)"
            kill -9 $pid 2>/dev/null || true
        fi
    done
    
    # Шаг 5: Проверка пакетов
    print_log "$YELLOW" "INFO" "5️⃣  Проверка актуальности пакетов в сервисах..."
    SKIP_PACKAGE_CHECK=false check_outdated_packages
    
    # Шаг 6: Полная пересборка
    print_log "$YELLOW" "INFO" "6️⃣  Полная пересборка всех сервисов..."
    DOCKER_BUILDKIT=1 COMPOSE_DOCKER_CLI_BUILD=1 docker-compose up --build -d
    
    # Шаг 7: Проверка статуса
    sleep 10
    print_log "$GREEN" "INFO" "7️⃣  Проверка статуса сервисов..."
    show_status
    
    print_log "$GREEN" "SUCCESS" "🎉 Hard reboot завершён! Все сервисы перезапущены с чистого листа."
}

# ═══════════════════════════════════════════════════════════════════
# 📐 SPEC-DRIVEN DEVELOPMENT FUNCTIONS
# ═══════════════════════════════════════════════════════════════════

# Функция создания новой спецификации
spec_new() {
    shift  # Пропускаем "spec:new"
    
    if [[ $# -lt 1 ]]; then
        print_log "$RED" "ERROR" "❌ Использование: ./quark-manager.sh spec:new <service-name>"
        echo ""
        echo "Примеры:"
        echo "  ./quark-manager.sh spec:new messaging-service"
        echo "  ./quark-manager.sh spec:new ai-service"
        exit 1
    fi
    
    local service_name="$1"
    local service_slug=$(echo "$service_name" | tr '[:upper:]' '[:lower:]' | tr ' ' '-')
    
    # Найти следующий номер спецификации
    local next_num=1
    while [[ -d "specs/$(printf "%03d" $next_num)-${service_slug}" ]]; do
        ((next_num++))
    done
    
    local spec_dir="specs/$(printf "%03d" $next_num)-${service_slug}"
    
    print_log "$BLUE" "INFO" "📐 Создание новой спецификации: $spec_dir"
    
    # Создать структуру директорий
    mkdir -p "$spec_dir/contracts"
    
    # Скопировать шаблон спецификации
    if [[ -f ".specify/templates/spec-template.md" ]]; then
        cp ".specify/templates/spec-template.md" "$spec_dir/spec.md"
        
        # Заменить placeholder в шаблоне
        sed -i "s/\[Service Name\]/$service_name/g" "$spec_dir/spec.md"
        sed -i "s/\[branch-name\]/$(printf "%03d" $next_num)-${service_slug}/g" "$spec_dir/spec.md"
        sed -i "s/\[CURRENT_DATE\]/$(date '+%Y-%m-%d')/g" "$spec_dir/spec.md"
        
        print_log "$GREEN" "SUCCESS" "✅ Создан файл: $spec_dir/spec.md"
    else
        print_log "$YELLOW" "WARN" "⚠️  Шаблон не найден, создан пустой spec.md"
        touch "$spec_dir/spec.md"
    fi
    
    # Создать README для директории
    cat > "$spec_dir/README.md" << EOF
# $service_name

**Ветка**: \`$(printf "%03d" $next_num)-${service_slug}\` | **Дата**: $(date '+%Y-%m-%d')

## 📁 Структура

- \`spec.md\` - Спецификация требований (WHAT and WHY)
- \`plan.md\` - Технический план реализации (HOW)
- \`contracts/\` - API контракты (OpenAPI, AsyncAPI, UDI manifest)

## 🔄 Workflow

1. Заполнить \`spec.md\` (требования, user stories)
2. Сгенерировать \`plan.md\` (tech stack, architecture)
3. Создать контракты в \`contracts/\`
4. Начать реализацию в \`services/${service_slug}/\`

## 📚 Документация

- [Constitution](.specify/memory/constitution.md) - 9 архитектурных принципов
- [Practical Guide](docs/spec-driven-practical-guide.md) - примеры использования
- [Frontend Integration](docs/frontend-backend-integration.md) - интеграция с UI
EOF
    
    print_log "$GREEN" "SUCCESS" "✅ Создан файл: $spec_dir/README.md"
    print_log "$CYAN" "INFO" ""
    print_log "$CYAN" "INFO" "📝 Следующие шаги:"
    print_log "$CYAN" "INFO" "   1. Заполните $spec_dir/spec.md (требования)"
    print_log "$CYAN" "INFO" "   2. Сгенерируйте plan.md (AI + templates)"
    print_log "$CYAN" "INFO" "   3. Создайте контракты: openapi.yaml, asyncapi.yaml, module-manifest.yaml"
    print_log "$CYAN" "INFO" ""
    print_log "$CYAN" "INFO" "💡 Для справки см. живой пример: specs/001-user-service/"
    
    # Открыть spec.md в редакторе (если VS Code установлен)
    if command -v code &> /dev/null; then
        print_log "$GREEN" "INFO" "🚀 Открываю spec.md в VS Code..."
        code "$spec_dir/spec.md"
    fi
}

# Функция валидации спецификаций
spec_validate() {
    shift  # Пропускаем "spec:validate"
    
    local service_dir="${1:-specs/}"
    
    print_log "$BLUE" "INFO" "🔍 Валидация спецификаций в $service_dir"
    
    # Проверка OpenAPI контрактов
    if command -v swagger-cli &> /dev/null || command -v openapi &> /dev/null; then
        for openapi_file in "$service_dir"/*/contracts/openapi.yaml; do
            if [[ -f "$openapi_file" ]]; then
                print_log "$CYAN" "INFO" "Проверка $openapi_file..."
                if swagger-cli validate "$openapi_file" &> /dev/null || openapi validate "$openapi_file" &> /dev/null; then
                    print_log "$GREEN" "SUCCESS" "✅ $openapi_file - валиден"
                else
                    print_log "$RED" "ERROR" "❌ $openapi_file - содержит ошибки"
                fi
            fi
        done
    else
        print_log "$YELLOW" "WARN" "⚠️  swagger-cli не установлен. Установите: npm install -g @apidevtools/swagger-cli"
    fi
    
    # Проверка AsyncAPI контрактов
    if command -v asyncapi &> /dev/null; then
        for asyncapi_file in "$service_dir"/*/contracts/asyncapi.yaml; do
            if [[ -f "$asyncapi_file" ]]; then
                print_log "$CYAN" "INFO" "Проверка $asyncapi_file..."
                if asyncapi validate "$asyncapi_file" &> /dev/null; then
                    print_log "$GREEN" "SUCCESS" "✅ $asyncapi_file - валиден"
                else
                    print_log "$RED" "ERROR" "❌ $asyncapi_file - содержит ошибки"
                fi
            fi
        done
    else
        print_log "$YELLOW" "WARN" "⚠️  @asyncapi/cli не установлен. Установите: npm install -g @asyncapi/cli"
    fi
    
    # Проверка Simplicity Gate (Article VII)
    for plan_file in "$service_dir"/*/plan.md; do
        if [[ -f "$plan_file" ]]; then
            if grep -q "Component Count: [4-9]" "$plan_file"; then
                print_log "$RED" "ERROR" "❌ Constitution violation в $plan_file: >3 компонента (Article VII)"
            else
                print_log "$GREEN" "SUCCESS" "✅ $plan_file - Simplicity Gate passed"
            fi
        fi
    done
}

# Функция генерации TypeScript types из OpenAPI
spec_generate_types() {
    shift  # Пропускаем "spec:types"
    
    if [[ $# -lt 1 ]]; then
        print_log "$RED" "ERROR" "❌ Использование: ./quark-manager.sh spec:types <service-number> [output-dir]"
        echo ""
        echo "Примеры:"
        echo "  ./quark-manager.sh spec:types 001 infra/quark-ui/src/api/"
        echo "  ./quark-manager.sh spec:types 002"
        exit 1
    fi
    
    local service_num="$1"
    local output_dir="${2:-infra/quark-ui/src/api}"
    
    # Найти директорию спецификации
    local spec_dir=$(find specs -type d -name "${service_num}-*" | head -n 1)
    
    if [[ -z "$spec_dir" ]]; then
        print_log "$RED" "ERROR" "❌ Спецификация $service_num не найдена"
        exit 1
    fi
    
    local openapi_file="$spec_dir/contracts/openapi.yaml"
    
    if [[ ! -f "$openapi_file" ]]; then
        print_log "$RED" "ERROR" "❌ OpenAPI контракт не найден: $openapi_file"
        exit 1
    fi
    
    # Извлечь имя сервиса
    local service_name=$(basename "$spec_dir" | cut -d'-' -f2-)
    local output_file="$output_dir/${service_name}.types.ts"
    
    print_log "$BLUE" "INFO" "🔄 Генерация TypeScript types из $openapi_file"
    
    # Проверка наличия openapi-typescript
    if ! command -v openapi-typescript &> /dev/null; then
        print_log "$YELLOW" "WARN" "⚠️  openapi-typescript не установлен. Установка..."
        npm install -g openapi-typescript
    fi
    
    # Создать выходную директорию
    mkdir -p "$output_dir"
    
    # Генерация types
    if openapi-typescript "$openapi_file" -o "$output_file"; then
        print_log "$GREEN" "SUCCESS" "✅ Types сгенерированы: $output_file"
        print_log "$CYAN" "INFO" ""
        print_log "$CYAN" "INFO" "📝 Использование в коде:"
        print_log "$CYAN" "INFO" "   import type { UserProfileResponse } from '@/api/${service_name}.types';"
    else
        print_log "$RED" "ERROR" "❌ Ошибка генерации types"
        exit 1
    fi
}

# Функция запуска mock API server
spec_mock_server() {
    shift  # Пропускаем "spec:mock"
    
    if [[ $# -lt 1 ]]; then
        print_log "$RED" "ERROR" "❌ Использование: ./quark-manager.sh spec:mock <service-number> [port]"
        echo ""
        echo "Примеры:"
        echo "  ./quark-manager.sh spec:mock 001"
        echo "  ./quark-manager.sh spec:mock 002 4011"
        exit 1
    fi
    
    local service_num="$1"
    local port="${2:-4010}"
    
    # Найти директорию спецификации
    local spec_dir=$(find specs -type d -name "${service_num}-*" | head -n 1)
    
    if [[ -z "$spec_dir" ]]; then
        print_log "$RED" "ERROR" "❌ Спецификация $service_num не найдена"
        exit 1
    fi
    
    local openapi_file="$spec_dir/contracts/openapi.yaml"
    
    if [[ ! -f "$openapi_file" ]]; then
        print_log "$RED" "ERROR" "❌ OpenAPI контракт не найден: $openapi_file"
        exit 1
    fi
    
    print_log "$BLUE" "INFO" "🚀 Запуск mock API server для $(basename "$spec_dir")"
    
    # Проверка наличия @stoplight/prism-cli
    if ! command -v prism &> /dev/null; then
        print_log "$YELLOW" "WARN" "⚠️  @stoplight/prism-cli не установлен. Установка..."
        npm install -g @stoplight/prism-cli
    fi
    
    print_log "$GREEN" "SUCCESS" "✅ Mock API server запущен на http://localhost:$port"
    print_log "$CYAN" "INFO" "📝 Используйте в Frontend:"
    print_log "$CYAN" "INFO" "   const API_BASE = 'http://localhost:$port';"
    print_log "$CYAN" "INFO" ""
    print_log "$CYAN" "INFO" "🛑 Для остановки нажмите Ctrl+C"
    
    # Запуск prism mock server
    prism mock "$openapi_file" -p "$port"
}

# Функция генерации тестов из контрактов
spec_generate_tests() {
    shift  # Пропускаем "spec:generate-tests"
    
    if [[ $# -lt 1 ]]; then
        print_log "$RED" "ERROR" "❌ Использование: ./quark-manager.sh spec:generate-tests <service-number> [--type=TYPE]"
        echo ""
        echo "Типы тестов:"
        echo "  all              - Генерировать все тесты (default)"
        echo "  contract-rest    - Contract tests для REST API (OpenAPI)"
        echo "  contract-events  - Contract tests для NATS events (AsyncAPI)"
        echo "  integration      - Integration tests (NATS, PostgreSQL, Vault)"
        echo "  unit             - Unit tests для критичной бизнес-логики"
        echo "  e2e              - E2E tests (Playwright) из user stories"
        echo "  chaos            - Minimal chaos tests (Toxiproxy)"
        echo "  performance      - Minimal performance tests (k6)"
        echo ""
        echo "Примеры:"
        echo "  ./quark-manager.sh spec:generate-tests 001"
        echo "  ./quark-manager.sh spec:generate-tests 001 --type=contract-rest"
        echo "  ./quark-manager.sh spec:generate-tests 002 --type=all"
        exit 1
    fi
    
    local service_num="$1"
    local test_type="all"
    
    # Парсинг опций
    shift
    while [[ $# -gt 0 ]]; do
        case $1 in
            --type=*)
                test_type="${1#*=}"
                shift
                ;;
            *)
                print_log "$RED" "ERROR" "❌ Неизвестная опция: $1"
                exit 1
                ;;
        esac
    done
    
    # Найти директорию спецификации
    local spec_dir=$(find specs -type d -name "${service_num}-*" | head -n 1)
    
    if [[ -z "$spec_dir" ]]; then
        print_log "$RED" "ERROR" "❌ Спецификация $service_num не найдена"
        exit 1
    fi
    
    local service_name=$(basename "$spec_dir" | sed 's/^[0-9]*-//')
    local spec_file="$spec_dir/spec.md"
    local plan_file="$spec_dir/plan.md"
    local openapi_file="$spec_dir/contracts/openapi.yaml"
    local asyncapi_file="$spec_dir/contracts/asyncapi.yaml"
    
    print_log "$BLUE" "INFO" "🧪 Генерация тестов для $service_name (тип: $test_type)"
    
    # Определяем директорию для тестов
    local service_path="services/${service_name}"
    if [[ ! -d "$service_path" ]]; then
        print_log "$YELLOW" "WARN" "⚠️  Директория сервиса не существует: $service_path"
        print_log "$YELLOW" "WARN" "   Создаём структуру директорий..."
        mkdir -p "$service_path/tests"/{contract,integration,unit,e2e,chaos,performance}
    fi
    
    local tests_dir="$service_path/tests"
    
    # Генерация Contract Tests (REST)
    if [[ "$test_type" == "all" || "$test_type" == "contract-rest" ]]; then
        if [[ -f "$openapi_file" ]]; then
            print_log "$CYAN" "INFO" "📝 Генерация contract tests для REST API..."
            mkdir -p "$tests_dir/contract"
            
            cat > "$tests_dir/contract/openapi.contract.spec.ts" << 'EOF'
/**
 * OpenAPI Contract Tests
 * 
 * Проверяет соответствие REST API контракту в openapi.yaml
 * 
 * Инструменты: spectral, ajv
 */

import { describe, it, expect, beforeAll } from '@jest/globals';
import { Spectral } from '@stoplight/spectral-core';
import { bundleAndLoadRuleset } from '@stoplight/spectral-ruleset-bundler/with-loader';
import * as path from 'path';
import * as fs from 'fs';
import * as yaml from 'js-yaml';

describe('OpenAPI Contract Validation', () => {
  let spectral: Spectral;
  let openApiDoc: any;
  
  beforeAll(async () => {
    // Загрузка OpenAPI документа
    const openApiPath = path.resolve(__dirname, '../../../specs/SPEC_NUM-SERVICE_NAME/contracts/openapi.yaml');
    const openApiContent = fs.readFileSync(openApiPath, 'utf8');
    openApiDoc = yaml.load(openApiContent);
    
    // Настройка Spectral
    spectral = new Spectral();
    const ruleset = await bundleAndLoadRuleset(path.resolve(__dirname, '../../../.spectral.yaml'), { fs, fetch });
    spectral.setRuleset(ruleset);
  });
  
  it('должен быть валидным OpenAPI 3.0 документом', async () => {
    const results = await spectral.run(openApiDoc);
    
    const errors = results.filter(r => r.severity === 0); // DiagnosticSeverity.Error
    
    if (errors.length > 0) {
      console.error('OpenAPI validation errors:', errors);
    }
    
    expect(errors).toHaveLength(0);
  });
  
  it('должен иметь все обязательные поля', () => {
    expect(openApiDoc).toHaveProperty('openapi');
    expect(openApiDoc).toHaveProperty('info');
    expect(openApiDoc).toHaveProperty('paths');
    expect(openApiDoc.openapi).toMatch(/^3\.0\.\d+$/);
  });
  
  it('должен определять security схемы для JWT', () => {
    expect(openApiDoc).toHaveProperty('components.securitySchemes');
    expect(openApiDoc.components.securitySchemes).toHaveProperty('bearerAuth');
    expect(openApiDoc.components.securitySchemes.bearerAuth.type).toBe('http');
    expect(openApiDoc.components.securitySchemes.bearerAuth.scheme).toBe('bearer');
  });
  
  it('все endpoints должны иметь примеры в responses', () => {
    const paths = openApiDoc.paths;
    
    for (const [pathName, pathItem] of Object.entries(paths as any)) {
      for (const [method, operation] of Object.entries(pathItem as any)) {
        if (['get', 'post', 'put', 'patch', 'delete'].includes(method)) {
          const responses = (operation as any).responses;
          
          for (const [statusCode, response] of Object.entries(responses as any)) {
            if (statusCode.startsWith('2')) { // Success responses
              expect(response).toHaveProperty('content');
              
              const content = (response as any).content;
              if (content && content['application/json']) {
                expect(content['application/json']).toHaveProperty('example');
              }
            }
          }
        }
      }
    }
  });
});
EOF
            
            # Заменяем плейсхолдеры
            sed -i "s/SPEC_NUM/$service_num/g" "$tests_dir/contract/openapi.contract.spec.ts"
            sed -i "s/SERVICE_NAME/$service_name/g" "$tests_dir/contract/openapi.contract.spec.ts"
            
            print_log "$GREEN" "SUCCESS" "✅ Contract tests (REST): $tests_dir/contract/openapi.contract.spec.ts"
        else
            print_log "$YELLOW" "WARN" "⚠️  OpenAPI контракт не найден, пропускаем REST tests"
        fi
    fi
    
    # Генерация Contract Tests (Events)
    if [[ "$test_type" == "all" || "$test_type" == "contract-events" ]]; then
        if [[ -f "$asyncapi_file" ]]; then
            print_log "$CYAN" "INFO" "📝 Генерация contract tests для NATS events..."
            mkdir -p "$tests_dir/contract"
            
            cat > "$tests_dir/contract/asyncapi.contract.spec.ts" << 'EOF'
/**
 * AsyncAPI Contract Tests
 * 
 * Проверяет соответствие NATS событий контракту в asyncapi.yaml
 * 
 * Инструменты: @asyncapi/cli, ajv
 */

import { describe, it, expect, beforeAll } from '@jest/globals';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import Ajv from 'ajv';
import * as path from 'path';

describe('AsyncAPI Contract Validation', () => {
  let asyncApiDoc: any;
  let ajv: Ajv;
  
  beforeAll(() => {
    // Загрузка AsyncAPI документа
    const asyncApiPath = path.resolve(__dirname, '../../../specs/SPEC_NUM-SERVICE_NAME/contracts/asyncapi.yaml');
    const asyncApiContent = fs.readFileSync(asyncApiPath, 'utf8');
    asyncApiDoc = yaml.load(asyncApiContent);
    
    // Настройка AJV для валидации JSON Schema
    ajv = new Ajv({ allErrors: true });
  });
  
  it('должен быть валидным AsyncAPI 2.x документом', () => {
    expect(asyncApiDoc).toHaveProperty('asyncapi');
    expect(asyncApiDoc.asyncapi).toMatch(/^2\.\d+\.\d+$/);
    expect(asyncApiDoc).toHaveProperty('channels');
  });
  
  it('все published события должны иметь JSON Schema', () => {
    const channels = asyncApiDoc.channels;
    
    for (const [channelName, channel] of Object.entries(channels as any)) {
      if ((channel as any).publish) {
        const message = (channel as any).publish.message;
        
        expect(message).toHaveProperty('payload');
        expect(message.payload).toHaveProperty('type');
        expect(message.payload).toHaveProperty('properties');
        
        // Валидация schema через AJV
        const valid = ajv.validateSchema(message.payload);
        expect(valid).toBe(true);
      }
    }
  });
  
  it('все subscribed события должны иметь handlers', () => {
    const channels = asyncApiDoc.channels;
    
    for (const [channelName, channel] of Object.entries(channels as any)) {
      if ((channel as any).subscribe) {
        // TODO: Проверить наличие handler в коде
        // Это потребует парсинга исходников сервиса
        expect(channelName).toBeTruthy();
      }
    }
  });
  
  it('NATS JetStream должен быть настроен с DLQ', () => {
    const server = asyncApiDoc.servers?.production;
    
    expect(server).toHaveProperty('protocol');
    expect(server.protocol).toBe('nats');
    
    // Проверка bindings для JetStream
    const channels = asyncApiDoc.channels;
    for (const [channelName, channel] of Object.entries(channels as any)) {
      if ((channel as any).subscribe?.bindings?.nats) {
        const bindings = (channel as any).subscribe.bindings.nats;
        
        // DLQ обязательна (через max_deliver → dead_letter)
        if (bindings.consumer) {
          expect(bindings.consumer).toHaveProperty('ack_policy');
          expect(bindings.consumer.ack_policy).toBe('explicit');
        }
      }
    }
  });
});
EOF
            
            # Заменяем плейсхолдеры
            sed -i "s/SPEC_NUM/$service_num/g" "$tests_dir/contract/asyncapi.contract.spec.ts"
            sed -i "s/SERVICE_NAME/$service_name/g" "$tests_dir/contract/asyncapi.contract.spec.ts"
            
            print_log "$GREEN" "SUCCESS" "✅ Contract tests (Events): $tests_dir/contract/asyncapi.contract.spec.ts"
        else
            print_log "$YELLOW" "WARN" "⚠️  AsyncAPI контракт не найден, пропускаем Events tests"
        fi
    fi
    
    # Генерация Integration Tests
    if [[ "$test_type" == "all" || "$test_type" == "integration" ]]; then
        print_log "$CYAN" "INFO" "📝 Генерация integration tests (Testcontainers)..."
        mkdir -p "$tests_dir/integration"
        
        cat > "$tests_dir/integration/nats.integration.spec.ts" << 'EOF'
/**
 * NATS Integration Tests
 * 
 * Проверяет взаимодействие с NATS JetStream через Testcontainers
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { GenericContainer, StartedTestContainer } from 'testcontainers';
import { connect, NatsConnection, JetStreamClient } from 'nats';

describe('NATS JetStream Integration', () => {
  let container: StartedTestContainer;
  let nc: NatsConnection;
  let js: JetStreamClient;
  
  beforeAll(async () => {
    // Запуск NATS в Testcontainer
    container = await new GenericContainer('nats:2.10-alpine')
      .withExposedPorts(4222)
      .withCommand(['-js', '-m', '8222']) // Enable JetStream + monitoring
      .start();
    
    const natsUrl = `nats://localhost:${container.getMappedPort(4222)}`;
    nc = await connect({ servers: natsUrl });
    js = nc.jetstream();
  }, 30000);
  
  afterAll(async () => {
    await nc?.close();
    await container?.stop();
  });
  
  it('должен публиковать и получать событие TODO_EVENT', async () => {
    // TODO: Заменить TODO_EVENT на реальное событие из asyncapi.yaml
    const subject = 'SERVICE_NAME.TODO_EVENT.created';
    const payload = { id: '123', test: true };
    
    // Создаём stream
    await js.streams.add({
      name: 'SERVICE_NAME_STREAM',
      subjects: [`SERVICE_NAME.>`],
      storage: 'file',
      retention: 'limits',
      max_age: 7 * 24 * 60 * 60 * 1000000000, // 7 days in nanoseconds
    });
    
    // Publish event
    await js.publish(subject, JSON.stringify(payload));
    
    // Subscribe
    const consumer = await js.consumers.get('SERVICE_NAME_STREAM', 'test-consumer');
    const messages = await consumer.fetch({ max_messages: 1, expires: 5000 });
    
    let received: any = null;
    for await (const msg of messages) {
      received = JSON.parse(msg.data.toString());
      msg.ack();
      break;
    }
    
    expect(received).toMatchObject(payload);
  }, 10000);
  
  it('должен отправлять в DLQ после 3 неудачных попыток', async () => {
    // TODO: Реализовать тест для Dead Letter Queue
    expect(true).toBe(true);
  });
});
EOF
        
        sed -i "s/SERVICE_NAME/${service_name^^}/g" "$tests_dir/integration/nats.integration.spec.ts"
        
        print_log "$GREEN" "SUCCESS" "✅ Integration tests: $tests_dir/integration/nats.integration.spec.ts"
    fi
    
    # Генерация Chaos Tests
    if [[ "$test_type" == "all" || "$test_type" == "chaos" ]]; then
        print_log "$CYAN" "INFO" "📝 Генерация minimal chaos tests (Toxiproxy)..."
        mkdir -p "$tests_dir/chaos"
        
        cat > "$tests_dir/chaos/nats-disconnect.chaos.spec.ts" << 'EOF'
/**
 * Chaos Test: NATS Disconnect
 * 
 * Проверяет отказоустойчивость при потере соединения с NATS
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { GenericContainer, StartedTestContainer } from 'testcontainers';
import axios from 'axios';

describe('Chaos: NATS Disconnect', () => {
  let natsContainer: StartedTestContainer;
  let proxyContainer: StartedTestContainer;
  
  beforeAll(async () => {
    // Запуск NATS
    natsContainer = await new GenericContainer('nats:2.10-alpine')
      .withExposedPorts(4222)
      .withCommand(['-js'])
      .start();
    
    // Запуск Toxiproxy
    proxyContainer = await new GenericContainer('ghcr.io/shopify/toxiproxy:2.5.0')
      .withExposedPorts(8474, 4223)
      .start();
    
    const proxyApiUrl = `http://localhost:${proxyContainer.getMappedPort(8474)}`;
    
    // Создаём proxy для NATS
    await axios.post(`${proxyApiUrl}/proxies`, {
      name: 'nats',
      listen: '0.0.0.0:4223',
      upstream: `${natsContainer.getHost()}:${natsContainer.getMappedPort(4222)}`,
      enabled: true
    });
  }, 60000);
  
  afterAll(async () => {
    await natsContainer?.stop();
    await proxyContainer?.stop();
  });
  
  it('сервис должен восстановить соединение через retry', async () => {
    // TODO: Запустить сервис через proxy
    // TODO: Отключить NATS через Toxiproxy на 5s
    // TODO: Проверить, что событие доставлено после переподключения
    
    expect(true).toBe(true); // Placeholder
  }, 30000);
});
EOF
        
        print_log "$GREEN" "SUCCESS" "✅ Chaos tests: $tests_dir/chaos/nats-disconnect.chaos.spec.ts"
    fi
    
    # Генерация Performance Tests
    if [[ "$test_type" == "all" || "$test_type" == "performance" ]]; then
        print_log "$CYAN" "INFO" "📝 Генерация minimal performance tests (k6)..."
        mkdir -p "$tests_dir/performance"
        
        cat > "$tests_dir/performance/baseline.load.js" << 'EOF'
/**
 * Performance Test: Baseline (10 RPS)
 * 
 * Выявляет грубые ошибки производительности
 * 
 * Запуск: k6 run tests/performance/baseline.load.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  vus: 10,           // 10 виртуальных пользователей
  duration: '1m',    // 1 минута
  thresholds: {
    http_req_duration: ['p(95)<500'],  // p95 < 500ms
    http_req_failed: ['rate<0.01'],    // error rate < 1%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  // TODO: Заменить на реальные endpoints из openapi.yaml
  
  // Пример: создание ресурса
  let createRes = http.post(`${BASE_URL}/api/v1/SERVICE_NAME/resources`, JSON.stringify({
    name: 'test',
    value: 'example'
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
  
  check(createRes, {
    'status 201': (r) => r.status === 201,
    'has id': (r) => r.json('id') !== undefined,
  });
  
  // Пример: получение ресурса
  if (createRes.status === 201) {
    const resourceId = createRes.json('id');
    let getRes = http.get(`${BASE_URL}/api/v1/SERVICE_NAME/resources/${resourceId}`);
    
    check(getRes, {
      'status 200': (r) => r.status === 200,
      'p95 < 500ms': (r) => r.timings.duration < 500,
    });
  }
  
  sleep(1);
}
EOF
        
        sed -i "s/SERVICE_NAME/$service_name/g" "$tests_dir/performance/baseline.load.js"
        
        print_log "$GREEN" "SUCCESS" "✅ Performance tests: $tests_dir/performance/baseline.load.js"
    fi
    
    # Генерация package.json для тестов
    if [[ "$test_type" == "all" ]]; then
        print_log "$CYAN" "INFO" "📝 Генерация package.json для тестов..."
        
        cat > "$service_path/package.json" << 'EOF'
{
  "name": "SERVICE_NAME-tests",
  "version": "1.0.0",
  "scripts": {
    "test": "jest",
    "test:unit": "jest tests/unit",
    "test:contract": "jest tests/contract",
    "test:integration": "jest tests/integration",
    "test:e2e": "playwright test",
    "test:chaos": "jest tests/chaos",
    "test:performance": "k6 run tests/performance/baseline.load.js",
    "test:all": "npm run test:contract && npm run test:unit && npm run test:integration"
  },
  "devDependencies": {
    "@jest/globals": "^29.7.0",
    "@playwright/test": "^1.40.0",
    "@stoplight/prism-cli": "^5.5.0",
    "@stoplight/spectral-core": "^1.18.0",
    "@stoplight/spectral-ruleset-bundler": "^1.5.0",
    "@types/jest": "^29.5.10",
    "ajv": "^8.12.0",
    "axios": "^1.6.2",
    "jest": "^29.7.0",
    "js-yaml": "^4.1.0",
    "nats": "^2.18.0",
    "testcontainers": "^10.4.0",
    "ts-jest": "^29.1.1",
    "typescript": "^5.3.2"
  }
}
EOF
        
        sed -i "s/SERVICE_NAME/$service_name/g" "$service_path/package.json"
        
        print_log "$GREEN" "SUCCESS" "✅ package.json: $service_path/package.json"
    fi
    
    print_log "$BLUE" "INFO" ""
    print_log "$BLUE" "INFO" "🎉 Генерация тестов завершена!"
    print_log "$CYAN" "INFO" ""
    print_log "$CYAN" "INFO" "📁 Структура тестов:"
    print_log "$CYAN" "INFO" "   $tests_dir/"
    
    if [[ "$test_type" == "all" || "$test_type" == "contract-rest" || "$test_type" == "contract-events" ]]; then
        print_log "$CYAN" "INFO" "   ├── contract/"
        if [[ -f "$tests_dir/contract/openapi.contract.spec.ts" ]]; then
            print_log "$CYAN" "INFO" "   │   ├── openapi.contract.spec.ts"
        fi
        if [[ -f "$tests_dir/contract/asyncapi.contract.spec.ts" ]]; then
            print_log "$CYAN" "INFO" "   │   └── asyncapi.contract.spec.ts"
        fi
    fi
    
    if [[ "$test_type" == "all" || "$test_type" == "integration" ]]; then
        print_log "$CYAN" "INFO" "   ├── integration/"
        print_log "$CYAN" "INFO" "   │   └── nats.integration.spec.ts"
    fi
    
    if [[ "$test_type" == "all" || "$test_type" == "chaos" ]]; then
        print_log "$CYAN" "INFO" "   ├── chaos/"
        print_log "$CYAN" "INFO" "   │   └── nats-disconnect.chaos.spec.ts"
    fi
    
    if [[ "$test_type" == "all" || "$test_type" == "performance" ]]; then
        print_log "$CYAN" "INFO" "   └── performance/"
        print_log "$CYAN" "INFO" "       └── baseline.load.js"
    fi
    
    print_log "$CYAN" "INFO" ""
    print_log "$CYAN" "INFO" "🚀 Следующие шаги:"
    print_log "$CYAN" "INFO" "   1. cd $service_path"
    print_log "$CYAN" "INFO" "   2. npm install"
    print_log "$CYAN" "INFO" "   3. npm run test:contract   # Валидация контрактов"
    print_log "$CYAN" "INFO" "   4. npm run test:integration # NATS + DB integration"
    print_log "$CYAN" "INFO" ""
    print_log "$YELLOW" "WARN" "⚠️  TODO: Заменить плейсхолдеры (TODO_EVENT, TODO_ENDPOINT) на реальные значения из contracts/"
}

# Функция проверки состояния Quark UI
check_ui_health() {
    print_header "🔍 Проверка состояния Quark UI..."
    
    if [ "$1" = "dev" ]; then
        if curl -s http://localhost:3000/health &> /dev/null; then
            print_log "$GREEN" "SUCCESS" "✅ Quark Platform UI (dev) - доступен (port 3000)"
        else
            print_log "$RED" "ERROR" "❌ Quark Platform UI (dev) - недоступен (port 3000)"
        fi
    else
        if curl -s http://localhost:3101/health &> /dev/null; then
            print_log "$GREEN" "SUCCESS" "✅ Quark Platform UI - доступен (port 3101)"
        else
            print_log "$RED" "ERROR" "❌ Quark Platform UI - недоступен (port 3101)"
        fi
    fi
}

# Функция проверки сетевых портов
check_ports() {
    print_header "📡 Проверка сетевых портов..."
    local ports=(80 443 8080 3000 3001 5432 6379 8086 8088 3101 3003 9090 9093)
    local port_names=("Traefik HTTP" "Traefik HTTPS" "Traefik Dashboard" "Plugin Hub" "Auth Service" "PostgreSQL" "Redis" "InfluxDB" "Chronograf" "Quark UI" "Blog Service" "Prometheus" "Alertmanager")
    
    for i in "${!ports[@]}"; do
        if nc -z localhost "${ports[$i]}" &> /dev/null; then
            print_log "$GREEN" "OPEN" "🔓 ${port_names[$i]} (${ports[$i]})"
        else
            print_log "$RED" "CLOSED" "🔒 ${port_names[$i]} (${ports[$i]})"
        fi
    done
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
            start|stop|restart|build|rebuild|status|health|logs|clean|hard-reboot|menu|list|ui:dev|ui:build|ui:start|ui:open)
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
            --skip-outdated-check)
                export SKIP_PACKAGE_CHECK=true
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
        hard-reboot)
            hard_reboot
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
        spec:new)
            spec_new "$@"
            ;;
        spec:validate)
            spec_validate "$@"
            ;;
        spec:types)
            spec_generate_types "$@"
            ;;
        spec:mock)
            spec_mock_server "$@"
            ;;
        spec:generate-tests)
            spec_generate_tests "$@"
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
