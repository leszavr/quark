<template>
  <div class="dashboard-layout">
    <!-- Header -->
    <header class="header bg-white shadow-sm border-b border-gray-200">
      <div class="flex items-center justify-between px-6 py-4">
        <!-- Logo и навигация -->
        <div class="flex items-center space-x-8">
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-sm">Q</span>
            </div>
            <div>
              <h1 class="text-lg font-semibold text-gray-900">Quark Platform</h1>
              <p class="text-xs text-gray-500">Admin Console</p>
            </div>
          </div>
          
          <!-- Breadcrumbs -->
          <nav class="hidden md:flex" aria-label="Breadcrumb">
            <ol class="flex items-center space-x-2">
              <li>
                <router-link to="/" class="text-gray-400 hover:text-gray-600 transition-colors">
                  <HomeIcon class="w-4 h-4" />
                </router-link>
              </li>
              <li v-if="$route.name !== 'Dashboard'">
                <ChevronRightIcon class="w-4 h-4 text-gray-400" />
              </li>
              <li v-if="$route.name !== 'Dashboard'">
                <span class="text-sm font-medium text-gray-600">
                  {{ $route.meta.title }}
                </span>
              </li>
            </ol>
          </nav>
        </div>
        
        <!-- Системная информация -->
        <div class="flex items-center space-x-4">
          <!-- Status indicator -->
          <div class="flex items-center space-x-2">
            <div class="w-2 h-2 bg-success-500 rounded-full animate-pulse-slow"></div>
            <span class="text-sm text-gray-600">Система работает</span>
          </div>
          
          <!-- User menu -->
          <div class="flex items-center space-x-2">
            <div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <UserIcon class="w-4 h-4 text-gray-600" />
            </div>
            <span class="text-sm text-gray-700">Admin</span>
          </div>
        </div>
      </div>
    </header>
    
    <!-- Main content area -->
    <div class="main-container">
      <!-- Sidebar -->
      <aside class="sidebar bg-white border-r border-gray-200">
        <nav class="mt-6">
          <div class="px-3">
            <ul class="space-y-1">
              <li v-for="route in navigationRoutes" :key="route.name">
                <router-link
                  :to="route.name === 'Dashboard' ? '/' : route.path"
                  class="nav-link group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors"
                  :class="isActiveRoute(route.name) ? 'nav-link-active' : 'nav-link-inactive'"
                >
                  <component 
                    :is="getIcon(route.meta.icon)" 
                    class="nav-icon mr-3 h-5 w-5 flex-shrink-0"
                    :class="isActiveRoute(route.name) ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'"
                  />
                  {{ route.meta.title }}
                </router-link>
              </li>
            </ul>
          </div>
          
          <!-- Системная информация в сайдбаре -->
          <div class="mt-8 px-3">
            <div class="card">
              <div class="card-body">
                <h3 class="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                  Система
                </h3>
                <div class="space-y-2">
                  <div class="flex items-center justify-between text-xs">
                    <span class="text-gray-500">Версия</span>
                    <span class="text-gray-900 font-medium">v1.0.0</span>
                  </div>
                  <div class="flex items-center justify-between text-xs">
                    <span class="text-gray-500">Uptime</span>
                    <span class="text-gray-900 font-medium">{{ uptime }}</span>
                  </div>
                  <div class="flex items-center justify-between text-xs">
                    <span class="text-gray-500">Сервисы</span>
                    <span class="status-online">{{ activeServicesCount }}/{{ totalServicesCount }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </aside>
      
      <!-- Page content -->
      <main class="main-content">
        <div class="page-container">
          <router-view />
        </div>
      </main>
    </div>
  </div>
</template>

<script>
import { 
  HomeIcon, 
  ChevronRightIcon, 
  UserIcon,
  LayoutDashboardIcon,
  KeyIcon,
  ActivityIcon,
  PuzzleIcon
} from 'lucide-vue-next'

export default {
  name: 'DashboardLayout',
  
  components: {
    HomeIcon,
    ChevronRightIcon,
    UserIcon,
    LayoutDashboardIcon,
    KeyIcon,
    ActivityIcon,
    PuzzleIcon
  },
  
  data() {
    return {
      uptime: '00:00:00',
      activeServicesCount: 3,
      totalServicesCount: 4,
      startTime: Date.now()
    }
  },
  
  computed: {
    navigationRoutes() {
      return this.$router.options.routes[0].children.filter(route => 
        route.meta && route.meta.title && route.meta.icon
      )
    }
  },
  
  mounted() {
    this.updateUptime()
    setInterval(this.updateUptime, 1000)
  },
  
  methods: {
    isActiveRoute(routeName) {
      return this.$route.name === routeName
    },
    
    getIcon(iconName) {
      const icons = {
        'layout-dashboard': LayoutDashboardIcon,
        'key': KeyIcon,
        'activity': ActivityIcon,
        'puzzle': PuzzleIcon
      }
      return icons[iconName] || LayoutDashboardIcon
    },
    
    updateUptime() {
      const now = Date.now()
      const diff = now - this.startTime
      
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      
      this.uptime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
  }
}
</script>

<style scoped>
.dashboard-layout {
  @apply min-h-screen bg-gray-50;
  display: grid;
  grid-template-rows: auto 1fr;
  grid-template-columns: 250px 1fr;
  grid-template-areas: 
    "header header"
    "sidebar main";
}

.header {
  grid-area: header;
}

.main-container {
  display: contents;
}

.sidebar {
  grid-area: sidebar;
  @apply h-full overflow-y-auto;
}

.main-content {
  grid-area: main;
  @apply overflow-y-auto;
}

.page-container {
  @apply p-6;
}

.nav-link {
  @apply transition-all duration-200;
}

.nav-link-active {
  @apply bg-primary-50 text-primary-700 border-r-2 border-primary-600;
}

.nav-link-inactive {
  @apply text-gray-600 hover:bg-gray-50 hover:text-gray-900;
}

.nav-icon {
  @apply transition-colors duration-200;
}

@media (max-width: 768px) {
  .dashboard-layout {
    grid-template-columns: 1fr;
    grid-template-areas: 
      "header"
      "main";
  }
  
  .sidebar {
    display: none;
  }
}
</style>
