<template>
  <div class="auth-module">
    <!-- Page header -->
    <div class="page-header mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Аутентификация</h1>
          <p class="mt-1 text-sm text-gray-600">
            Управление пользователями, сессиями и настройками безопасности
          </p>
        </div>
        <div class="flex items-center space-x-3">
          <button 
            @click="testAPI" 
            :disabled="loading"
            class="btn-primary"
          >
            <TestTubeIcon class="w-4 h-4 mr-2" />
            Тест API
          </button>
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

    <!-- Auth Service Status -->
    <div class="mb-8">
      <div class="card">
        <div class="card-header">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium text-gray-900">Состояние Auth Service</h3>
            <span 
              :class="serviceStatus.online ? 'status-online' : 'status-offline'"
            >
              {{ serviceStatus.online ? 'Онлайн' : 'Офлайн' }}
            </span>
          </div>
        </div>
        <div class="card-body">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="text-center">
              <div class="text-2xl font-semibold text-gray-900">{{ authStats.totalUsers }}</div>
              <div class="text-sm text-gray-500">Всего пользователей</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-semibold text-gray-900">{{ authStats.activeSessions }}</div>
              <div class="text-sm text-gray-500">Активные сессии</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-semibold text-gray-900">{{ authStats.tokensIssued }}</div>
              <div class="text-sm text-gray-500">Токенов выдано</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- API Testing Interface -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- Register User -->
      <div class="card">
        <div class="card-header">
          <h3 class="text-lg font-medium text-gray-900">Регистрация пользователя</h3>
        </div>
        <div class="card-body">
          <form @submit.prevent="registerUser" class="space-y-4">
            <div>
              <label class="form-label">Email</label>
              <input 
                v-model="registerForm.email" 
                type="email" 
                class="form-input"
                placeholder="user@example.com"
                required
              />
            </div>
            <div>
              <label class="form-label">Пароль</label>
              <input 
                v-model="registerForm.password" 
                type="password" 
                class="form-input"
                placeholder="••••••••"
                required
              />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="form-label">Имя</label>
                <input 
                  v-model="registerForm.firstName" 
                  type="text" 
                  class="form-input"
                  placeholder="Иван"
                />
              </div>
              <div>
                <label class="form-label">Фамилия</label>
                <input 
                  v-model="registerForm.lastName" 
                  type="text" 
                  class="form-input"
                  placeholder="Иванов"
                />
              </div>
            </div>
            <button type="submit" :disabled="registering" class="btn-primary w-full">
              <UserPlusIcon class="w-4 h-4 mr-2" />
              {{ registering ? 'Регистрация...' : 'Зарегистрировать' }}
            </button>
          </form>
        </div>
      </div>

      <!-- Login User -->
      <div class="card">
        <div class="card-header">
          <h3 class="text-lg font-medium text-gray-900">Авторизация</h3>
        </div>
        <div class="card-body">
          <form @submit.prevent="loginUser" class="space-y-4">
            <div>
              <label class="form-label">Email</label>
              <input 
                v-model="loginForm.email" 
                type="email" 
                class="form-input"
                placeholder="user@example.com"
                required
              />
            </div>
            <div>
              <label class="form-label">Пароль</label>
              <input 
                v-model="loginForm.password" 
                type="password" 
                class="form-input"
                placeholder="••••••••"
                required
              />
            </div>
            <button type="submit" :disabled="loginingIn" class="btn-primary w-full">
              <LogInIcon class="w-4 h-4 mr-2" />
              {{ loginingIn ? 'Вход...' : 'Войти' }}
            </button>
          </form>
          
          <!-- JWT Token Display -->
          <div v-if="currentToken" class="mt-4 p-3 bg-gray-50 rounded-lg">
            <label class="form-label">JWT Token</label>
            <textarea 
              :value="currentToken" 
              readonly 
              class="form-input text-xs font-mono"
              rows="3"
            ></textarea>
            <div class="mt-2 flex items-center justify-between text-xs text-gray-500">
              <span>Токен получен: {{ tokenReceivedAt }}</span>
              <button @click="copyToken" class="text-primary-600 hover:text-primary-700">
                Копировать
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- User Profile Test -->
    <div v-if="currentToken" class="card mb-8">
      <div class="card-header">
        <h3 class="text-lg font-medium text-gray-900">Профиль пользователя</h3>
      </div>
      <div class="card-body">
        <div class="flex items-center justify-between mb-4">
          <p class="text-sm text-gray-600">Тестирование защищенного endpoint /auth/profile</p>
          <button @click="fetchProfile" :disabled="fetchingProfile" class="btn-outline">
            <UserIcon class="w-4 h-4 mr-2" />
            {{ fetchingProfile ? 'Загрузка...' : 'Получить профиль' }}
          </button>
        </div>
        
        <div v-if="userProfile" class="bg-gray-50 rounded-lg p-4">
          <pre class="text-sm text-gray-800">{{ JSON.stringify(userProfile, null, 2) }}</pre>
        </div>
      </div>
    </div>

    <!-- API Response Log -->
    <div class="card">
      <div class="card-header">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium text-gray-900">Лог API запросов</h3>
          <button @click="clearLog" class="text-sm text-gray-500 hover:text-gray-700">
            Очистить
          </button>
        </div>
      </div>
      <div class="card-body">
        <div class="space-y-3 max-h-64 overflow-y-auto">
          <div 
            v-for="log in apiLog" 
            :key="log.id"
            class="p-3 rounded-lg border border-gray-200"
            :class="log.success ? 'bg-success-50 border-success-200' : 'bg-error-50 border-error-200'"
          >
            <div class="flex items-center justify-between text-sm">
              <span class="font-medium">{{ log.method }} {{ log.endpoint }}</span>
              <span class="text-xs text-gray-500">{{ formatTime(log.timestamp) }}</span>
            </div>
            <div class="mt-1 text-xs text-gray-600">
              Status: {{ log.status }} | {{ log.message }}
            </div>
          </div>
          
          <div v-if="apiLog.length === 0" class="text-center text-gray-500 py-8">
            Пока что запросов не было. Попробуйте зарегистрировать пользователя или войти в систему.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { 
  RefreshCwIcon,
  TestTubeIcon,
  UserPlusIcon,
  LogInIcon,
  UserIcon
} from 'lucide-vue-next'

export default {
  name: 'AuthModule',
  
  components: {
    RefreshCwIcon,
    TestTubeIcon,
    UserPlusIcon,
    LogInIcon,
    UserIcon
  },
  
  data() {
    return {
      loading: false,
      registering: false,
      loginingIn: false,
      fetchingProfile: false,
      
      serviceStatus: {
        online: true,
        lastCheck: new Date()
      },
      
      authStats: {
        totalUsers: 5,
        activeSessions: 2,
        tokensIssued: 47
      },
      
      registerForm: {
        email: '',
        password: '',
        firstName: '',
        lastName: ''
      },
      
      loginForm: {
        email: '',
        password: ''
      },
      
      currentToken: null,
      tokenReceivedAt: null,
      userProfile: null,
      
      apiLog: []
    }
  },
  
  mounted() {
    this.checkServiceHealth()
  },
  
  methods: {
    async checkServiceHealth() {
      try {
        const response = await fetch('http://localhost:3001/auth/health')
        this.serviceStatus.online = response.ok
        this.serviceStatus.lastCheck = new Date()
        
        this.addToLog('GET', '/auth/health', response.status, 'Health check successful', true)
      } catch (error) {
        this.serviceStatus.online = false
        this.addToLog('GET', '/auth/health', 0, `Connection failed: ${error.message}`, false)
      }
    },
    
    async registerUser() {
      this.registering = true
      
      try {
        const response = await fetch('http://localhost:3001/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this.registerForm)
        })
        
        const data = await response.json()
        
        if (response.ok) {
          const userEmail = data.user?.email || this.registerForm.email
          this.addToLog('POST', '/auth/register', response.status, `User registered: ${userEmail}`, true)
          this.resetRegisterForm()
          alert(`Пользователь ${userEmail} успешно зарегистрирован!`)
        } else {
          this.addToLog('POST', '/auth/register', response.status, data.message || 'Registration failed', false)
          alert(`Ошибка регистрации: ${data.message}`)
        }
      } catch (error) {
        this.addToLog('POST', '/auth/register', 0, `Network error: ${error.message}`, false)
        alert(`Ошибка сети: ${error.message}`)
      } finally {
        this.registering = false
      }
    },
    
    async loginUser() {
      this.loginingIn = true
      
      try {
        const response = await fetch('http://localhost:3001/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this.loginForm)
        })
        
        const data = await response.json()
        
        if (response.ok) {
          this.currentToken = data.access_token
          this.tokenReceivedAt = new Date().toLocaleTimeString()
          this.addToLog('POST', '/auth/login', response.status, 'Login successful, JWT token received', true)
          this.resetLoginForm()
          alert('Вход выполнен успешно! JWT токен получен.')
        } else {
          this.addToLog('POST', '/auth/login', response.status, data.message || 'Login failed', false)
          alert(`Ошибка входа: ${data.message}`)
        }
      } catch (error) {
        this.addToLog('POST', '/auth/login', 0, `Network error: ${error.message}`, false)
        alert(`Ошибка сети: ${error.message}`)
      } finally {
        this.loginingIn = false
      }
    },
    
    async fetchProfile() {
      if (!this.currentToken) {
        alert('Сначала необходимо войти в систему для получения токена')
        return
      }
      
      this.fetchingProfile = true
      
      try {
        const response = await fetch('http://localhost:3001/auth/profile', {
          headers: {
            'Authorization': `Bearer ${this.currentToken}`
          }
        })
        
        const data = await response.json()
        
        if (response.ok) {
          this.userProfile = data
          this.addToLog('GET', '/auth/profile', response.status, 'Profile fetched successfully', true)
        } else {
          this.addToLog('GET', '/auth/profile', response.status, data.message || 'Profile fetch failed', false)
          alert(`Ошибка получения профиля: ${data.message}`)
        }
      } catch (error) {
        this.addToLog('GET', '/auth/profile', 0, `Network error: ${error.message}`, false)
        alert(`Ошибка сети: ${error.message}`)
      } finally {
        this.fetchingProfile = false
      }
    },
    
    async testAPI() {
      await this.checkServiceHealth()
    },
    
    async refreshData() {
      this.loading = true
      try {
        await this.checkServiceHealth()
        // Обновляем статистику
        console.log('📊 Auth module data refreshed')
      } finally {
        this.loading = false
      }
    },
    
    copyToken() {
      navigator.clipboard.writeText(this.currentToken).then(() => {
        alert('JWT токен скопирован в буфер обмена')
      })
    },
    
    resetRegisterForm() {
      this.registerForm = {
        email: '',
        password: '',
        firstName: '',
        lastName: ''
      }
    },
    
    resetLoginForm() {
      this.loginForm = {
        email: '',
        password: ''
      }
    },
    
    addToLog(method, endpoint, status, message, success) {
      this.apiLog.unshift({
        id: Date.now(),
        method,
        endpoint,
        status,
        message,
        success,
        timestamp: new Date()
      })
      
      // Ограничиваем лог 20 записями
      if (this.apiLog.length > 20) {
        this.apiLog = this.apiLog.slice(0, 20)
      }
    },
    
    clearLog() {
      this.apiLog = []
    },
    
    formatTime(timestamp) {
      return timestamp.toLocaleTimeString()
    }
  }
}
</script>

<style scoped>
.page-header {
  @apply pb-4 border-b border-gray-200;
}

.auth-module {
  animation: fade-in 0.6s ease-out;
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
