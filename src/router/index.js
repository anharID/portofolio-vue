import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import DashboardView from '../views/admin/DashboardView.vue'
import LoginView from '../views/LoginView.vue'
import PersonalInfoView from '../views/admin/PersonalInfoView.vue'
import ProjectsView from '../views/admin/ProjectsView.vue'
import TechStackView from '../views/admin/TechStackView.vue'
import CertificatesView from '../views/admin/CertificatesView.vue'
import MessagesView from '../views/admin/MessagesView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login',
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { guest: true },
    },
    {
      path: '/admin',
      redirect: '/admin/dashboard',
      meta: { requiresAuth: true },
      children: [
        {
          path: 'dashboard',
          name: 'admin-dashboard',
          component: DashboardView,
        },
        {
          path: 'personal',
          name: 'admin-personal',
          component: PersonalInfoView,
        },
        {
          path: 'projects',
          name: 'admin-projects',
          component: ProjectsView,
        },
        {
          path: 'tech-stack',
          name: 'admin-tech-stack',
          component: TechStackView,
        },
        {
          path: 'certificates',
          name: 'admin-certificates',
          component: CertificatesView,
        },
        {
          path: 'messages',
          name: 'admin-messages',
          component: MessagesView,
        },
      ],
    },
  ],
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  if (!authStore.user) {
    await authStore.fetchUser()
  }

  if (to.meta.requiresAuth && !authStore.user) {
    next('/login')
  } else if (to.meta.guest && authStore.user) {
    next('/admin/dashboard')
  } else {
    next()
  }
})

export default router
