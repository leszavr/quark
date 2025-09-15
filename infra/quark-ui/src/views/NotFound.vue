<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="text-center">
        <div class="mx-auto w-16 h-16 bg-error-100 rounded-full flex items-center justify-center">
          <AlertTriangleIcon class="w-8 h-8 text-error-600" />
        </div>
        <h2 class="mt-6 text-3xl font-extrabold text-gray-900">
          Страница не найдена
        </h2>
        <p class="mt-2 text-sm text-gray-600">
          Запрашиваемая страница не существует или была перемещена.
        </p>
      </div>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <div class="space-y-4">
          <router-link to="/" class="btn-primary w-full justify-center">
            <HomeIcon class="w-4 h-4 mr-2" />
            Вернуться на главную
          </router-link>
          <button @click="goBack" class="btn-outline w-full justify-center">
            <ArrowLeftIcon class="w-4 h-4 mr-2" />
            Назад
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { AlertTriangleIcon, HomeIcon, ArrowLeftIcon } from 'lucide-vue-next'

export default {
  name: 'NotFound',
  
  components: {
    AlertTriangleIcon,
    HomeIcon, 
    ArrowLeftIcon
  },
  
  methods: {
    goBack() {
      this.$router.go(-1)
    }
  }
}
</script>
