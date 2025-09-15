import { createRouter, createWebHistory } from 'vue-router'

// Layout компоненты
import DashboardLayout from '@/layouts/DashboardLayout.vue'

// Page компоненты
import Dashboard from '@/views/Dashboard.vue'
import AuthModule from '@/modules/auth/AuthModule.vue'
import MonitoringModule from '@/modules/monitoring/MonitoringModule.vue'
import PluginHubModule from '@/modules/plugin-hub/PluginHubModule.vue'

const routes = [
  {
    path: '/',
    component: DashboardLayout,
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: Dashboard,
        meta: { 
          title: 'Главная панель',
          icon: 'layout-dashboard'
        }
      },
      {
        path: '/auth',
        name: 'Auth',
        component: AuthModule,
        meta: { 
          title: 'Аутентификация',
          icon: 'key'
        }
      },
      {
        path: '/monitoring',
        name: 'Monitoring', 
        component: MonitoringModule,
        meta: { 
          title: 'Мониторинг',
          icon: 'activity'
        }
      },
      {
        path: '/plugins',
        name: 'PluginHub',
        component: PluginHubModule,
        meta: { 
          title: 'Plugin Hub',
          icon: 'puzzle'
        }
      }
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { 
      layout: 'auth',
      title: 'Вход в систему' 
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: { 
      title: 'Страница не найдена' 
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// Navigation guards
router.beforeEach((to, from, next) => {
  // Устанавливаем title страницы
  if (to.meta.title) {
    document.title = `${to.meta.title} - Quark Platform`
  }
  
  next()
})

export default router
