<template>
  <div class="plugin-hub-module">
    <!-- Page header -->
    <div class="page-header mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Plugin Hub</h1>
          <p class="mt-1 text-sm text-gray-600">
            Управление модулями и сервисами в экосистеме Quark Platform
          </p>
        </div>
        <div class="flex items-center space-x-3">
          <button 
            @click="refreshServices" 
            :disabled="loading"
            class="btn-outline"
          >
            <RefreshCwIcon class="w-4 h-4 mr-2" :class="{ 'animate-spin': loading }" />
            Обновить
          </button>
        </div>
      </div>
    </div>

    <!-- Plugin Hub Status -->
    <div class="card mb-8">
      <div class="card-header">
        <h3 class="text-lg font-medium text-gray-900">Состояние Plugin Hub</h3>
      </div>
      <div class="card-body">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div class="text-center">
            <div class="text-2xl font-semibold text-gray-900">{{ hubStats.registeredServices }}</div>
            <div class="text-sm text-gray-500">Зарегистрированных сервисов</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-semibold text-gray-900">{{ hubStats.activeServices }}</div>
            <div class="text-sm text-gray-500">Активных сервисов</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-semibold text-gray-900">{{ hubStats.totalEvents }}</div>
            <div class="text-sm text-gray-500">Событий обработано</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-semibold text-gray-900">{{ hubStats.uptime }}</div>
            <div class="text-sm text-gray-500">Время работы</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Registered Services -->
    <div class="card">
      <div class="card-header">
        <h3 class="text-lg font-medium text-gray-900">Зарегистрированные сервисы</h3>
      </div>
      <div class="card-body">
        <div class="space-y-4">
          <div 
            v-for="service in registeredServices" 
            :key="service.id"
            class="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
          >
            <div class="flex items-center space-x-4">
              <div 
                class="w-10 h-10 rounded-lg flex items-center justify-center"
                :class="getServiceBadgeClass(service.type)"
              >
                <component 
                  :is="getServiceIcon(service.type)" 
                  class="w-5 h-5 text-white"
                />
              </div>
              <div>
                <h4 class="text-sm font-medium text-gray-900">{{ service.name }}</h4>
                <p class="text-xs text-gray-500">{{ service.description }}</p>
                <div class="flex items-center space-x-4 mt-1">
                  <span class="text-xs text-gray-400">v{{ service.version }}</span>
                  <span class="text-xs text-gray-400">{{ service.url }}</span>
                </div>
              </div>
            </div>
            <div class="flex items-center space-x-3">
              <span 
                :class="getStatusClass(service.status)"
                class="status-badge"
              >
                {{ getStatusText(service.status) }}
              </span>
              <div class="text-xs text-gray-500 text-right">
                <div>Последний heartbeat:</div>
                <div>{{ formatTime(service.lastHeartbeat) }}</div>
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
  RefreshCwIcon,
  KeyIcon,
  MonitorIcon,
  PuzzleIcon,
  DatabaseIcon,
  ServerIcon
} from 'lucide-vue-next'

export default {
  name: 'PluginHubModule',
  
  components: {
    RefreshCwIcon,
    KeyIcon,
    MonitorIcon,
    PuzzleIcon,
    DatabaseIcon,
    ServerIcon
  },
  
  data() {
    return {
      loading: false,
      
      hubStats: {
        registeredServices: 4,
        activeServices: 4,
        totalEvents: 156,
        uptime: '12:34:56'
      },
      
      registeredServices: [
        {
          id: 'auth-service',
          name: 'Auth Service',
          description: 'JWT аутентификация и управление пользователями',
          type: 'authentication',
          version: '1.0.0',
          url: 'http://auth-service:3001',
          status: 'online',
          lastHeartbeat: new Date(Date.now() - 15000)
        },
        {
          id: 'plugin-hub',
          name: 'Plugin Hub',
          description: 'Центральный узел управления модулями',
          type: 'hub',
          version: '1.0.0',
          url: 'http://plugin-hub:3000',
          status: 'online',
          lastHeartbeat: new Date(Date.now() - 10000)
        },
        {
          id: 'monitoring',
          name: 'Monitoring Service',
          description: 'Мониторинг состояния системы',
          type: 'monitoring',
          version: '1.0.0',
          url: 'http://monitoring:3900',
          status: 'online',
          lastHeartbeat: new Date(Date.now() - 20000)
        },
        {
          id: 'postgres',
          name: 'PostgreSQL',
          description: 'Основная база данных',
          type: 'database',
          version: '15.0',
          url: 'postgresql://postgres:5432',
          status: 'online',
          lastHeartbeat: new Date(Date.now() - 5000)
        }
      ]
    }
  },
  
  mounted() {
    this.loadServices()
  },
  
  methods: {
    async loadServices() {
      try {
        this.loading = true
        // Здесь будем загружать реальные данные от Plugin Hub API
        console.log('🔌 Loading services from Plugin Hub...')
        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (error) {
        console.error('❌ Error loading services:', error)
      } finally {
        this.loading = false
      }
    },
    
    async refreshServices() {
      await this.loadServices()
    },
    
    getServiceIcon(type) {
      const icons = {
        authentication: KeyIcon,
        hub: PuzzleIcon,
        monitoring: MonitorIcon,
        database: DatabaseIcon
      }
      return icons[type] || ServerIcon
    },
    
    getServiceBadgeClass(type) {
      const classes = {
        authentication: 'bg-primary-600',
        hub: 'bg-purple-600',
        monitoring: 'bg-green-600',
        database: 'bg-blue-600'
      }
      return classes[type] || 'bg-gray-600'
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
    
    formatTime(timestamp) {
      const now = new Date()
      const diff = now - timestamp
      const seconds = Math.floor(diff / 1000)
      
      if (seconds < 60) return `${seconds} сек назад`
      
      const minutes = Math.floor(seconds / 60)
      if (minutes < 60) return `${minutes} мин назад`
      
      const hours = Math.floor(minutes / 60)
      return `${hours} ч назад`
    }
  }
}
</script>

<style scoped>
.page-header {
  @apply pb-4 border-b border-gray-200;
}
</style>
