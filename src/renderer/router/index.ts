import { createRouter, createWebHashHistory } from 'vue-router';

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/Home.vue'),
    },
    {
      path: '/repositories',
      name: 'repositories',
      component: () => import('../views/Repositories.vue'),
    },
    {
      path: '/analytics',
      name: 'analytics',
      component: () => import('../views/Analytics.vue'),
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/Settings.vue'),
    },
  ],
});

export default router; 