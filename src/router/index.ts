import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue')
    },
    {
      path: '/overview/:id',
      name: 'overview',
      component: () => import('@/views/OverView.vue')
    },
    {
      path: '/play/:id',
      name: 'play',
      component: () => import('@/views/Play.vue')
    }
  ]
})

export default router
