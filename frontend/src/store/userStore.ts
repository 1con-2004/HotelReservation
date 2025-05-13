import { defineStore } from 'pinia';
import { 
  login as apiLogin, 
  register as apiRegister, 
  checkBackendStatus,
  checkEmailExists as apiCheckEmailExists,
  sendEmailVerificationCode as apiSendEmailCode,
  verifyEmailCode as apiVerifyEmailCode,
  registerWithVerification as apiRegisterWithVerification
} from '../utils/api';

// 与API模块保持一致的模拟模式标志
const USE_MOCK_MODE = true;

interface User {
  id: number;
  username: string;
  role: string;
  email?: string;
  emailVerified?: boolean;
}

interface UserState {
  user: User | null;
  isLoggedIn: boolean;
  isBackendOnline: boolean;
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    user: null,
    isLoggedIn: false,
    isBackendOnline: false
  }),
  
  actions: {
    async checkBackend() {
      if (USE_MOCK_MODE) {
        this.isBackendOnline = true;
        return true;
      }
      
      try {
        this.isBackendOnline = await checkBackendStatus();
        return this.isBackendOnline;
      } catch (error) {
        console.error('后端检查失败:', error);
        this.isBackendOnline = false;
        return false;
      }
    },
    
    async login(username: string, password: string) {
      try {
        console.log('尝试登录，用户名:', username);
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
        console.error('登录处理错误:', error);
        
        // 检查是否为网络错误
        if (!error.response) {
          return { success: false, message: '无法连接到服务器，请检查网络连接' };
        }
        
        const message = error.response?.data?.message || '登录失败，请重试';
        return { success: false, message };
      }
    },
    
    async register(email: string, password: string, username: string) {
      try {
        // 检查后端状态
        await this.checkBackend();
        
        console.log('[userStore] 开始注册:', { email, username });
        const response = await apiRegister(email, password, username);
        console.log('[userStore] 注册响应:', response);
        
        if (response && response.success) {
          return { success: true, message: response.message || '注册成功' };
        } else {
          return { 
            success: false, 
            message: (response && response.message) || '注册失败，服务器未返回成功状态' 
          };
        }
      } catch (error: any) {
        console.error('[userStore] 注册错误:', error);
        
        // 网络错误的情况
        if (!error.response) {
          if (USE_MOCK_MODE) {
            console.log('使用模拟模式注册');
            try {
              const result = await apiRegister(email, password, username);
              return result;
            } catch (mockError) {
              console.error('模拟模式注册失败:', mockError);
              return { success: false, message: '模拟模式注册失败' };
            }
          }
          return { 
            success: false, 
            message: '无法连接到服务器，请检查网络连接或确认后端服务器是否运行' 
          };
        }
        
        // 处理服务器返回的错误信息
        const status = error.response?.status;
        const message = error.response?.data?.message || '注册失败，请稍后重试';
        
        // 提供更详细的错误信息
        if (status === 409) {
          return { success: false, message };
        } else if (status === 400) {
          return { success: false, message };
        } else {
          return { success: false, message: `注册失败(${status}): ${message}` };
        }
      }
    },
    
    // 新增: 检查邮箱是否已被注册
    async checkEmailExists(email: string) {
      try {
        await this.checkBackend();
        console.log('[userStore] 检查邮箱是否已注册:', email);
        const response = await apiCheckEmailExists(email);
        console.log('[userStore] 检查邮箱响应:', response);
        return response;
      } catch (error: any) {
        console.error('[userStore] 检查邮箱错误:', error);
        return { 
          success: false, 
          message: '检查邮箱失败，请稍后重试' 
        };
      }
    },
    
    // 新增: 发送邮箱验证码
    async sendEmailVerificationCode(email: string) {
      try {
        await this.checkBackend();
        console.log('[userStore] 发送邮箱验证码:', email);
        const response = await apiSendEmailCode(email);
        console.log('[userStore] 发送验证码响应:', response);
        return response;
      } catch (error: any) {
        console.error('[userStore] 发送验证码错误:', error);
        return { 
          success: false, 
          message: '发送验证码失败，请稍后重试' 
        };
      }
    },
    
    // 新增: 验证邮箱验证码
    async verifyEmailCode(email: string, code: string) {
      try {
        await this.checkBackend();
        console.log('[userStore] 验证邮箱验证码:', { email, code });
        const response = await apiVerifyEmailCode(email, code);
        console.log('[userStore] 验证验证码响应:', response);
        return response;
      } catch (error: any) {
        console.error('[userStore] 验证验证码错误:', error);
        return { 
          success: false, 
          message: '验证码验证失败，请稍后重试' 
        };
      }
    },
    
    // 新增: 使用验证码注册
    async registerWithVerification(email: string, password: string, username: string, code: string) {
      try {
        await this.checkBackend();
        console.log('[userStore] 使用验证码注册:', { email, username });
        const response = await apiRegisterWithVerification(email, password, username, code);
        console.log('[userStore] 验证码注册响应:', response);
        
        if (response && response.success) {
          return { success: true, message: response.message || '注册成功' };
        } else {
          return { 
            success: false, 
            message: (response && response.message) || '注册失败，服务器未返回成功状态' 
          };
        }
      } catch (error: any) {
        console.error('[userStore] 验证码注册错误:', error);
        
        // 网络错误的情况
        if (!error.response) {
          return { 
            success: false, 
            message: '无法连接到服务器，请检查网络连接或确认后端服务器是否运行' 
          };
        }
        
        // 处理服务器返回的错误信息
        const status = error.response?.status;
        const message = error.response?.data?.message || '注册失败，请稍后重试';
        
        return { success: false, message: `注册失败(${status}): ${message}` };
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