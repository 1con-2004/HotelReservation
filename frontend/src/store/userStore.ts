import { defineStore } from 'pinia';
import { login as apiLogin } from '../utils/api';

interface User {
  id: number;
  username: string;
  role: string;
}

interface UserState {
  user: User | null;
  isLoggedIn: boolean;
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    user: null,
    isLoggedIn: false,
  }),
  
  actions: {
    async login(username: string, password: string) {
      try {
        const response = await apiLogin(username, password);
        
        if (response.success) {
          this.user = response.user;
          this.isLoggedIn = true;
          
          // 保存到本地存储
          localStorage.setItem('user', JSON.stringify(response.user));
          return { success: true, message: response.message };
        }
        
        return { success: false, message: response.message };
      } catch (error: any) {
        const message = error.response?.data?.message || '登录失败，请重试';
        return { success: false, message };
      }
    },
    
    logout() {
      this.user = null;
      this.isLoggedIn = false;
      localStorage.removeItem('user');
    },
    
    initFromStorage() {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          this.user = JSON.parse(storedUser);
          this.isLoggedIn = true;
        } catch (e) {
          console.error('解析本地存储的用户信息失败', e);
          this.logout();
        }
      }
    },
    
    isAdmin(): boolean {
      return this.user?.role === 'admin';
    }
  }
}); 