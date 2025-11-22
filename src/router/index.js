import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/admin/DashboardView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // { path: '/', name: 'home', component: () => import('../views/HomeView.vue') }, // frontend nanti
    { path: '/admin', redirect: '/admin/dashboard' },
    { path: '/admin/dashboard', name: 'admin-dashboard', component: DashboardView },
  ],
})
export default router
