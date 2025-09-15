import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './style.css'

// Создаем приложение
const app = createApp(App)

// Подключаем Pinia для state management
app.use(createPinia())

// Подключаем маршрутизацию
app.use(router)

// Глобальные свойства
app.config.globalProperties.$version = '1.0.0'

// Монтируем приложение
app.mount('#app')
