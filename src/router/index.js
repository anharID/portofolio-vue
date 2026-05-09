import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
const DashboardView = () => import('../views/admin/DashboardView.vue')
const LoginView = () => import('../views/LoginView.vue')
const PersonalInfoView = () => import('../views/admin/PersonalInfoView.vue')
const ProjectsView = () => import('../views/admin/ProjectsView.vue')
const TechStackView = () => import('../views/admin/TechStackView.vue')
const CertificatesView = () => import('../views/admin/CertificatesView.vue')
const MessagesView = () => import('../views/admin/MessagesView.vue')
const HomeView = () => import('../views/HomeView.vue')
const AllProjectsView = () => import('../views/AllProjectsView.vue')
const AllCertificatesView = () => import('../views/AllCertificatesView.vue')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
        top: 80, // Offset supaya tidak tertutup Navbar
      }
    }
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  },
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/all-projects',
      name: 'all-projects',
      component: AllProjectsView,
    },
    {
      path: '/all-certificates',
      name: 'all-certificates',
      component: AllCertificatesView,
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
