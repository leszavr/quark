<template>
  <div class="dashboard">
    <!-- Page header -->
    <div class="page-header mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Главная панель</h1>
          <p class="mt-1 text-sm text-gray-600">
            Обзор состояния платформы Quark и активных сервисов
          </p>
        </div>
        <div class="flex items-center space-x-3">
          <button 
            @click="refreshData" 
            :disabled="loading"
            class="btn-outline"
          >
            <RefreshCwIcon class="w-4 h-4 mr-2" :class="{ 'animate-spin': loading }" />
            Обновить
          </button>
        </div>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="stats-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <!-- Services Status -->
      <div class="card">
        <div class="card-body">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <ServerIcon class="h-8 w-8 text-primary-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Активные сервисы
                </dt>
                <dd class="flex items-baseline">
                  <div class="text-2xl font-semibold text-gray-900">
                    {{ stats.activeServices }}/{{ stats.totalServices }}
                  </div>
                  <div class="ml-2 flex items-baseline text-sm font-semibold text-success-600">
                    <ArrowUpIcon class="self-center flex-shrink-0 h-3 w-3" />
                    <span class="sr-only">Increased by</span>
                    100%
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <!-- Registered Users -->
      <div class="card">
        <div class="card-body">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <UsersIcon class="h-8 w-8 text-primary-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Пользователи
                </dt>
                <dd class="flex items-baseline">
                  <div class="text-2xl font-semibold text-gray-900">
                    {{ stats.totalUsers }}
                  </div>
                  <div class="ml-2 flex items-baseline text-sm font-semibold text-success-600">
                    <ArrowUpIcon class="self-center flex-shrink-0 h-3 w-3" />
                    <span class="sr-only">Increased by</span>
                    +{{ stats.newUsersToday }}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <!-- API Requests -->
      <div class="card">
        <div class="card-body">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <ActivityIcon class="h-8 w-8 text-primary-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  API запросы/час
                </dt>
                <dd class="flex items-baseline">
                  <div class="text-2xl font-semibold text-gray-900">
                    {{ stats.apiRequestsPerHour }}
                  </div>
                  <div class="ml-2 flex items-baseline text-sm font-semibold text-success-600">
                    <ArrowUpIcon class="self-center flex-shrink-0 h-3 w-3" />
                    <span class="sr-only">Increased by</span>
                    12%
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <!-- System Health -->
      <div class="card">
        <div class="card-body">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <ShieldCheckIcon class="h-8 w-8 text-primary-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Здоровье системы
                </dt>
                <dd class="flex items-baseline">
                  <div class="text-2xl font-semibold text-gray-900">
                    {{ stats.systemHealth }}%
                  </div>
                  <div class="ml-2">
                    <span class="status-online">Отлично</span>
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Services Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Services Status -->
      <div class="card">
        <div class="card-header">
          <h3 class="text-lg font-medium text-gray-900">Состояние сервисов</h3>
        </div>
        <div class="card-body">
          <div class="space-y-4">
            <div 
              v-for="service in services" 
              :key="service.name"
              class="flex items-center justify-between p-3 rounded-lg border border-gray-100"
            >
              <div class="flex items-center space-x-3">
                <component 
                  :is="getServiceIcon(service.type)" 
                  class="w-5 h-5 text-gray-400"
                />
                <div>
                  <p class="text-sm font-medium text-gray-900">{{ service.name }}</p>
                  <p class="text-xs text-gray-500">{{ service.description }}</p>
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <span 
                  :class="getStatusClass(service.status)"
                  class="status-badge"
                >
                  {{ getStatusText(service.status) }}
                </span>
                <span class="text-xs text-gray-500">{{ service.uptime }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="card">
        <div class="card-header">
          <h3 class="text-lg font-medium text-gray-900">Недавняя активность</h3>
        </div>
        <div class="card-body">
          <div class="space-y-4">
            <div 
              v-for="activity in recentActivity" 
              :key="activity.id"
              class="flex items-start space-x-3"
            >
              <div 
                class="flex-shrink-0 w-2 h-2 mt-2 rounded-full"
                :class="getActivityColor(activity.type)"
              ></div>
              <div class="flex-1 min-w-0">
                <p class="text-sm text-gray-900">{{ activity.message }}</p>
                <p class="text-xs text-gray-500">{{ formatTime(activity.timestamp) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { 
  ServerIcon, 
  UsersIcon, 
  ActivityIcon, 
  ShieldCheckIcon,
  RefreshCwIcon,
  ArrowUpIcon,
  KeyIcon,
  MonitorIcon,
  PuzzleIcon,
  DatabaseIcon
} from 'lucide-vue-next'

export default {
  name: 'Dashboard',
  
  components: {
    ServerIcon,
    UsersIcon,
    ActivityIcon,
    ShieldCheckIcon,
    RefreshCwIcon,
    ArrowUpIcon,
    KeyIcon,
    MonitorIcon,
    PuzzleIcon,
    DatabaseIcon
  },
  
  data() {
    return {
      loading: false,
      stats: {
        activeServices: 4,
        totalServices: 4,
        totalUsers: 12,
        newUsersToday: 3,
        apiRequestsPerHour: 1247,
        systemHealth: 98
      },
      services: [
        {
          name: 'Auth Service',
          description: 'JWT аутентификация и управление пользователями',
          status: 'online',
          type: 'auth',
          uptime: '12:34:56'
        },
        {
          name: 'Plugin Hub',
          description: 'Центральный узел управления модулями',
          status: 'online',
          type: 'hub',
          uptime: '12:34:45'
        },
        {
          name: 'Monitoring',
          description: 'Мониторинг состояния системы',
          status: 'online',
          type: 'monitoring',
          uptime: '12:34:32'
        },
        {
          name: 'PostgreSQL',
          description: 'Основная база данных',
          status: 'online',
          type: 'database',
          uptime: '12:34:21'
        }
      ],
      recentActivity: [
        {
          id: 1,
          type: 'success',
          message: 'Auth Service успешно зарегистрирован в Plugin Hub',
          timestamp: new Date(Date.now() - 5 * 60 * 1000)
        },
        {
          id: 2,
          type: 'info',
          message: 'Обновлена конфигурация мониторинга',
          timestamp: new Date(Date.now() - 15 * 60 * 1000)
        },
        {
          id: 3,
          type: 'success',
          message: 'Пользователь admin выполнил вход в систему',
          timestamp: new Date(Date.now() - 25 * 60 * 1000)
        },
        {
          id: 4,
          type: 'info',
          message: 'Запущена процедура резервного копирования',
          timestamp: new Date(Date.now() - 45 * 60 * 1000)
        }
      ]
    }
  },
  
  mounted() {
    this.loadDashboardData()
  },
  
  methods: {
    async loadDashboardData() {
      try {
        this.loading = true
        // Здесь будем загружать реальные данные от API
        await new Promise(resolve => setTimeout(resolve, 1000))
        console.log('📊 Dashboard data loaded')
      } catch (error) {
        console.error('❌ Error loading dashboard data:', error)
      } finally {
        this.loading = false
      }
    },
    
    async refreshData() {
      await this.loadDashboardData()
    },
    
    getServiceIcon(type) {
      const icons = {
        auth: KeyIcon,
        hub: PuzzleIcon,
        monitoring: MonitorIcon,
        database: DatabaseIcon
      }
      return icons[type] || ServerIcon
    },
    
    getStatusClass(status) {
      const classes = {
        online: 'status-online',
        warning: 'status-warning',
        offline: 'status-offline'
      }
      return classes[status] || 'status-offline'
    },
    
    getStatusText(status) {
      const texts = {
        online: 'Онлайн',
        warning: 'Предупреждение',
        offline: 'Офлайн'
      }
      return texts[status] || 'Неизвестно'
    },
    
    getActivityColor(type) {
      const colors = {
        success: 'bg-success-500',
        warning: 'bg-warning-500',
        error: 'bg-error-500',
        info: 'bg-primary-500'
      }
      return colors[type] || 'bg-gray-500'
    },
    
    formatTime(timestamp) {
      const now = new Date()
      const diff = now - timestamp
      const minutes = Math.floor(diff / (1000 * 60))
      
      if (minutes < 1) return 'Только что'
      if (minutes < 60) return `${minutes} мин назад`
      
      const hours = Math.floor(minutes / 60)
      if (hours < 24) return `${hours} ч назад`
      
      const days = Math.floor(hours / 24)
      return `${days} дн назад`
    }
  }
}
</script>

<style scoped>
.page-header {
  @apply pb-4 border-b border-gray-200;
}

.stats-grid {
  animation: fade-in 0.6s ease-out;
}

.card {
  animation: slide-in 0.6s ease-out;
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slide-in {
  from { opacity: 0; transform: translateX(-10px); }
  to { opacity: 1; transform: translateX(0); }
}
</style>
