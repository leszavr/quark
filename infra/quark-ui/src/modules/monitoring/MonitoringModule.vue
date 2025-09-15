<template>
  <div class="monitoring-module">
    <!-- Page header -->
    <div class="page-header mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Мониторинг</h1>
          <p class="mt-1 text-sm text-gray-600">
            Мониторинг состояния системы и сервисов в режиме реального времени
          </p>
        </div>
        <div class="flex items-center space-x-3">
          <button 
            @click="openExternalMonitoring" 
            class="btn-primary"
          >
            <ExternalLinkIcon class="w-4 h-4 mr-2" />
            Открыть мониторинг
          </button>
        </div>
      </div>
    </div>

    <!-- Monitoring Dashboard Embed -->
    <div class="card mb-8">
      <div class="card-header">
        <h3 class="text-lg font-medium text-gray-900">Панель мониторинга</h3>
      </div>
      <div class="card-body p-0">
        <iframe 
          src="http://localhost:3900" 
          class="w-full h-96 border-0 rounded-lg"
          frameborder="0"
        ></iframe>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="card">
        <div class="card-body text-center">
          <ActivityIcon class="w-8 h-8 text-primary-600 mx-auto mb-2" />
          <div class="text-2xl font-semibold text-gray-900">98%</div>
          <div class="text-sm text-gray-500">Uptime</div>
        </div>
      </div>
      
      <div class="card">
        <div class="card-body text-center">
          <ServerIcon class="w-8 h-8 text-primary-600 mx-auto mb-2" />
          <div class="text-2xl font-semibold text-gray-900">4/4</div>
          <div class="text-sm text-gray-500">Сервисы онлайн</div>
        </div>
      </div>
      
      <div class="card">
        <div class="card-body text-center">
          <ZapIcon class="w-8 h-8 text-primary-600 mx-auto mb-2" />
          <div class="text-2xl font-semibold text-gray-900">45ms</div>
          <div class="text-sm text-gray-500">Среднее время ответа</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { 
  ExternalLinkIcon,
  ActivityIcon,
  ServerIcon,
  ZapIcon
} from 'lucide-vue-next'

export default {
  name: 'MonitoringModule',
  
  components: {
    ExternalLinkIcon,
    ActivityIcon,
    ServerIcon,
    ZapIcon
  },
  
  methods: {
    openExternalMonitoring() {
      window.open('http://localhost:3900', '_blank')
    }
  }
}
</script>

<style scoped>
.page-header {
  @apply pb-4 border-b border-gray-200;
}
</style>
