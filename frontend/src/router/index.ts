import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '../store/userStore';
import HomeView from '../views/HomeView.vue';
import LoginView from '../views/LoginView.vue';
import RoomBookingView from '../views/RoomBookingView.vue';
import MembershipView from '../views/MembershipView.vue';
import PromotionsView from '../views/PromotionsView.vue';
import AdminView from '../views/AdminView.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { guest: true }
  },
  {
    path: '/room-booking',
    name: 'RoomBooking',
    component: RoomBookingView,
    meta: { requiresAuth: true }
  },
  {
    path: '/membership',
    name: 'Membership',
    component: MembershipView,
    meta: { requiresAuth: true }
  },
  {
    path: '/promotions',
    name: 'Promotions',
    component: PromotionsView,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: AdminView,
    meta: { requiresAuth: true, requiresAdmin: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 导航守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore();
  
  // 初始化用户状态
  if (!userStore.isLoggedIn) {
    userStore.initFromStorage();
  }
  
  // 需要登录的路由
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!userStore.isLoggedIn) {
      next({ name: 'Login' });
      return;
    }
    
    // 需要管理员权限的路由
    if (to.matched.some(record => record.meta.requiresAdmin) && !userStore.isAdmin()) {
      next({ name: 'Home' });
      return;
    }
  }
  
  // 已登录用户不能访问登录页面
  if (to.matched.some(record => record.meta.guest) && userStore.isLoggedIn) {
    next({ name: 'Home' });
    return;
  }
  
  next();
});

export default router; 