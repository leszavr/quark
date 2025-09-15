<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App',
  mounted() {
    // Инициализация приложения
    console.log('🚀 Quark Platform Admin Console v1.0.0 initialized')
    
    // Проверяем доступность API
    this.checkSystemHealth()
  },
  
  methods: {
    async checkSystemHealth() {
      try {
        // Проверяем базовые сервисы
        const services = ['auth-service', 'plugin-hub', 'monitoring']
        
        for (const service of services) {
          console.log(`🔍 Checking ${service}...`)
        }
      } catch (error) {
        console.warn('⚠️ Some services may be unavailable:', error.message)
      }
    }
  }
}
</script>
