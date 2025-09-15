<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="text-center">
        <div class="mx-auto w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center">
          <span class="text-white font-bold text-lg">Q</span>
        </div>
        <h2 class="mt-6 text-3xl font-extrabold text-gray-900">
          Вход в Quark Platform
        </h2>
        <p class="mt-2 text-sm text-gray-600">
          Административный интерфейс управления платформой
        </p>
      </div>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <p class="text-center text-gray-500">
          Функция входа будет реализована в следующих версиях.
        </p>
        <div class="mt-6">
          <router-link to="/" class="btn-primary w-full justify-center">
            Перейти к панели управления
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Login'
}
</script>
