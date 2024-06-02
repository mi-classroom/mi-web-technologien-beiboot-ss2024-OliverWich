import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue')
    },
    {
      path: '/create',
      name: 'createProject',
      component: () => import('../views/CreateProject.vue')
    },
    {
      path: '/project',
      name: 'emptyProject',
      redirect: '/dashboard',
    },
    {
      path: '/project/:projectName',
      name: 'project',
      props: true,
      "component": () => import('../views/ProjectView.vue'),
    }
  ]
})

export default router
