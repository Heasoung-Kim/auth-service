import { createRouter, createWebHistory } from 'vue-router';
import { isLoggedIn } from "@/api/modules/token-utils";

// 라우트 정의
const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/LoginView.vue'),
    meta: { requiresAuth: false }
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 네비게이션 가드 설정
router.beforeEach((to, from, next) => {
  // 인증이 필요한 페이지인지 확인
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  // 인증이 필요하고 로그인이 안 되어 있으면 로그인 페이지로 리다이렉트
  if (requiresAuth && !isLoggedIn()) {
    next('/login');
  } else {
    next();
  }
});

export default router;
