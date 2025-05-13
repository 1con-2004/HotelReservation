<template>
  <div class="register-container">
    <div class="register-card">
      <h1 class="title">注册账号</h1>
      
      <div class="backend-status" :class="{ 'success': USE_MOCK_MODE || backendStatus.includes('在线'), 'error': !USE_MOCK_MODE && (backendStatus.includes('离线') || backendStatus.includes('异常')) }">
        {{ backendStatus }}
      </div>
      
      <div v-if="debugMode && debugInfo" class="debug-info">
        <p>调试信息: {{ debugInfo }}</p>
      </div>
      
      <!-- 注册进度指示器 -->
      <div class="registration-progress">
        <div class="progress-step" :class="{ 'active': step === 1, 'completed': step > 1 }">
          <div class="step-number">1</div>
          <div class="step-name">邮箱验证</div>
        </div>
        <div class="progress-connector" :class="{ 'active': step > 1 }"></div>
        <div class="progress-step" :class="{ 'active': step === 2, 'completed': step > 2 }">
          <div class="step-number">2</div>
          <div class="step-name">设置账号</div>
        </div>
        <div class="progress-connector" :class="{ 'active': step > 2 }"></div>
        <div class="progress-step" :class="{ 'active': step === 3, 'completed': step > 3 }">
          <div class="step-number">3</div>
          <div class="step-name">注册完成</div>
        </div>
      </div>
      
      <!-- 步骤1: 邮箱验证 -->
      <div v-if="step === 1" class="registration-step">
        <div class="form-group">
          <label for="email">邮箱地址</label>
          <input
            type="email"
            id="email"
            v-model="form.email"
            required
            :disabled="loading || emailChecking || codeSending || emailVerified"
            placeholder="请输入您的邮箱"
            @focus="clearError('email')"
            @input="onEmailInput"
            @blur="checkEmail"
          />
          <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
          <span v-if="emailExists" class="error-message">该邮箱已被注册，请使用其他邮箱</span>
          <span v-if="emailValid && !emailExists && !emailChecking" class="success-message">该邮箱可以使用</span>
          <span v-if="emailChecking" class="info-message">正在验证邮箱...</span>
        </div>
        
        <div v-if="emailValid && !emailExists" class="verification-code-section">
          <div class="form-group verification-code-group">
            <label for="verification-code">验证码</label>
            <div class="verification-code-input-group">
              <input
                type="text"
                id="verification-code"
                v-model="form.verificationCode"
                required
                :disabled="loading || !codeSent || emailVerified"
                placeholder="请输入6位验证码"
                maxlength="6"
                @focus="clearError('verificationCode')"
              />
              <button 
                class="send-code-btn" 
                :disabled="!emailValid || emailExists || codeSending || countdownTime > 0 || emailVerified"
                @click="sendVerificationCode"
              >
                {{ codeSending ? '发送中...' : countdownTime > 0 ? `重新发送(${countdownTime}s)` : '发送验证码' }}
              </button>
            </div>
            <span v-if="errors.verificationCode" class="error-message">{{ errors.verificationCode }}</span>
            <span v-if="codeSent && !codeSending && !errors.verificationCode" class="success-message">
              验证码已发送，有效期5分钟
              <span v-if="debugMode && debugCode" class="debug-code">调试模式验证码: {{ debugCode }}</span>
            </span>
          </div>
          
          <button 
            class="action-btn verify-btn" 
            :disabled="!canVerifyCode || loading" 
            @click="verifyCode"
          >
            {{ loading ? '验证中...' : emailVerified ? '已验证' : '验证' }}
          </button>
        </div>
        
        <div class="step-actions">
          <button class="action-btn next-btn" 
            :disabled="!canGoToNextStep" 
            @click="nextStep"
            :title="!emailVerified ? '请先完成邮箱验证' : ''"
          >
            下一步
          </button>
          <div v-if="!emailVerified && form.email" class="info-message step-info">
            请完成邮箱验证后继续
          </div>
        </div>
      </div>
      
      <!-- 步骤2: 设置账号 -->
      <div v-if="step === 2" class="registration-step">
        <div class="form-group">
          <label for="username">用户名</label>
          <input
            type="text"
            id="username"
            v-model="form.username"
            required
            :disabled="loading"
            placeholder="请设置您的用户名"
            @focus="clearError('username')"
          />
          <span v-if="errors.username" class="error-message">{{ errors.username }}</span>
        </div>
        
        <div class="form-group">
          <label for="password">密码</label>
          <div class="password-input-group">
            <input
              :type="showPassword ? 'text' : 'password'"
              id="password"
              v-model="form.password"
              required
              :disabled="loading"
              placeholder="请设置密码"
              @focus="clearError('password')"
              @input="checkPasswordStrength"
            />
            <button 
              type="button" 
              class="toggle-password-btn" 
              :class="showPassword ? 'show-password' : 'hide-password'"
              @click="showPassword = !showPassword"
              :aria-label="showPassword ? '隐藏密码' : '显示密码'"
            >
              <span class="sr-only">{{ showPassword ? '隐藏密码' : '显示密码' }}</span>
            </button>
          </div>
          <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
          
          <!-- 密码强度指示器 -->
          <div class="password-strength-indicator">
            <div class="strength-text">密码强度：{{ passwordStrengthText }}</div>
            <div class="strength-bars">
              <div 
                v-for="n in 4" 
                :key="n" 
                class="strength-bar" 
                :class="{ active: passwordStrength >= n }"
              ></div>
            </div>
          </div>
          <div class="password-requirements">
            <div class="requirement" :class="{ met: form.password.length >= 8 }">至少8个字符</div>
            <div class="requirement" :class="{ met: /[A-Z]/.test(form.password) }">包含大写字母</div>
            <div class="requirement" :class="{ met: /[a-z]/.test(form.password) }">包含小写字母</div>
            <div class="requirement" :class="{ met: /\d/.test(form.password) }">包含数字</div>
          </div>
        </div>
        
        <div class="form-group">
          <label for="confirmPassword">确认密码</label>
          <div class="password-input-group">
            <input
              :type="showConfirmPassword ? 'text' : 'password'"
              id="confirmPassword"
              v-model="form.confirmPassword"
              required
              :disabled="loading"
              placeholder="请再次输入密码"
              @focus="clearError('confirmPassword')"
            />
            <button 
              type="button" 
              class="toggle-password-btn"
              :class="showConfirmPassword ? 'show-password' : 'hide-password'"
              @click="showConfirmPassword = !showConfirmPassword"
              :aria-label="showConfirmPassword ? '隐藏确认密码' : '显示确认密码'"
            >
              <span class="sr-only">{{ showConfirmPassword ? '隐藏确认密码' : '显示确认密码' }}</span>
            </button>
          </div>
          <span v-if="errors.confirmPassword" class="error-message">{{ errors.confirmPassword }}</span>
        </div>
        
        <div class="step-actions">
          <button class="action-btn back-btn" @click="prevStep">
            返回
          </button>
          <button class="action-btn next-btn" 
            :disabled="!canRegister || loading" 
            @click="handleRegister"
            :title="!canRegister ? '请填写所有必填信息并确保密码符合要求' : ''"
          >
            {{ loading ? '注册中...' : '完成注册' }}
          </button>
        </div>
        <div v-if="!canRegister" class="info-message step-info">
          请填写所有必填信息并确保密码符合要求
        </div>
      </div>
      
      <!-- 步骤3: 注册完成 -->
      <div v-if="step === 3" class="registration-step registration-complete">
        <div class="complete-icon">✅</div>
        <h2>注册成功！</h2>
        <p>您的账号已成功创建，欢迎加入我们！</p>
        <div class="complete-actions">
          <router-link to="/login" class="action-btn login-now-btn">立即登录</router-link>
        </div>
      </div>
      
      <div v-if="serverError" class="server-error">
        {{ serverError }}
      </div>
      
      <div class="login-link">
        已有账号？<router-link to="/login">立即登录</router-link>
      </div>
      
      <!-- 第三方登录选项 -->
      <div class="third-party-login">
        <div class="divider">
          <span>或使用第三方账号</span>
        </div>
        <div class="third-party-buttons">
          <button class="third-party-btn wechat-btn" @click="thirdPartyLogin('wechat')">
            <span class="btn-icon">📱</span>
            <span>微信</span>
          </button>
          <button class="third-party-btn google-btn" @click="thirdPartyLogin('google')">
            <span class="btn-icon">G</span>
            <span>Google</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../store/userStore'
import { checkBackendStatus } from '../utils/api'

// 配置使用模拟模式
const USE_MOCK_MODE = true;
// 是否显示调试信息
const debugMode = true;

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const serverError = ref('')
const registerSuccess = ref('')
const debugInfo = ref('')
const backendStatus = ref(USE_MOCK_MODE ? '使用模拟模式，无需后端服务' : '正在检查后端状态...')

// 注册步骤
const step = ref(1)

// 邮箱验证相关状态
const emailChecking = ref(false)
const emailExists = ref(false)
const emailValid = ref(false)
const codeSending = ref(false)
const codeSent = ref(false)
const emailVerified = ref(false)
const countdownTime = ref(0)
const countdownTimer = ref<number | null>(null)
const debugCode = ref('')

// 密码强度相关
const passwordStrength = ref(0)
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const form = reactive({
  email: '',
  verificationCode: '',
  username: '',
  password: '',
  confirmPassword: ''
})

const errors = reactive({
  email: '',
  verificationCode: '',
  username: '',
  password: '',
  confirmPassword: ''
})

// 密码强度计算
const checkPasswordStrength = () => {
  let strength = 0
  
  if (form.password.length >= 8) strength++
  if (/[A-Z]/.test(form.password)) strength++
  if (/[a-z]/.test(form.password)) strength++
  if (/\d/.test(form.password)) strength++
  
  passwordStrength.value = strength
}

// 密码强度文本
const passwordStrengthText = computed(() => {
  switch (passwordStrength.value) {
    case 0: return '非常弱'
    case 1: return '弱'
    case 2: return '中等'
    case 3: return '强'
    case 4: return '非常强'
    default: return '未知'
  }
})

// 检查后端服务器是否在线
const checkBackendState = async () => {
  if (USE_MOCK_MODE) {
    backendStatus.value = '使用模拟模式，无需后端服务';
    return true;
  }
  
  try {
    const isOnline = await checkBackendStatus();
    
    if (isOnline) {
      backendStatus.value = '后端服务在线';
      return true;
    } else {
      backendStatus.value = '后端服务离线或不可访问，将使用模拟模式';
      return false;
    }
  } catch (error) {
    backendStatus.value = '后端服务离线或不可访问，将使用模拟模式';
    console.error('后端连接失败:', error);
    return false;
  }
};

// 在组件加载时检查后端状态
onMounted(async () => {
  await checkBackendState();
});

// 清除指定字段的错误
const clearError = (field: string) => {
  if (field in errors) {
    // @ts-ignore - We know the field exists
    errors[field] = '';
  }
  if (serverError.value) {
    serverError.value = '';
  }
}

// 邮箱输入处理
const onEmailInput = () => {
  emailExists.value = false
  emailValid.value = false
  clearError('email')
  
  // 验证邮箱格式
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  emailValid.value = emailRegex.test(form.email)
}

// 检查邮箱是否已注册
const checkEmail = async () => {
  if (!emailValid.value) return
  
  emailChecking.value = true
  
  try {
    const result = await userStore.checkEmailExists(form.email)
    if (result.success) {
      emailExists.value = result.exists
    } else {
      errors.email = result.message
    }
  } catch (error: any) {
    console.error('检查邮箱出错:', error)
    errors.email = '检查邮箱失败，请稍后重试'
  } finally {
    emailChecking.value = false
  }
}

// 发送验证码
const sendVerificationCode = async () => {
  if (!emailValid.value || emailExists.value || codeSending.value) return
  
  codeSending.value = true
  clearError('verificationCode')
  
  try {
    console.log('发送验证码到', form.email);
    const result = await userStore.sendEmailVerificationCode(form.email)
    
    if (result.success) {
      codeSent.value = true
      
      // 在模拟模式下，显示验证码方便调试
      if (result.debugCode) {
        debugCode.value = result.debugCode
        console.log('调试模式验证码:', debugCode.value);
      }
      
      // 启动倒计时
      startCountdown()
    } else {
      errors.verificationCode = result.message
      console.error('发送验证码失败:', result.message);
    }
  } catch (error: any) {
    console.error('发送验证码失败:', error)
    errors.verificationCode = '发送验证码失败，请稍后重试'
  } finally {
    codeSending.value = false
  }
}

// 验证码倒计时
const startCountdown = () => {
  // 清除之前的计时器
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value)
  }
  
  countdownTime.value = 60
  
  countdownTimer.value = setInterval(() => {
    if (countdownTime.value > 0) {
      countdownTime.value--
    } else {
      if (countdownTimer.value) {
        clearInterval(countdownTimer.value)
        countdownTimer.value = null
      }
    }
  }, 1000) as unknown as number
}

// 验证码验证
const verifyCode = async () => {
  if (!form.verificationCode || loading.value) return
  
  loading.value = true
  clearError('verificationCode')
  
  try {
    console.log('验证邮箱验证码', form.email, form.verificationCode);
    const result = await userStore.verifyEmailCode(form.email, form.verificationCode)
    
    if (result.success) {
      emailVerified.value = true
      console.log('验证码验证成功');
    } else {
      errors.verificationCode = result.message
      console.error('验证码验证失败:', result.message);
    }
  } catch (error: any) {
    console.error('验证码验证失败:', error)
    errors.verificationCode = '验证码验证失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

// 是否可以验证验证码
const canVerifyCode = computed(() => {
  return codeSent.value && form.verificationCode.length === 6 && !emailVerified.value
})

// 是否可以进行下一步
const canGoToNextStep = computed(() => {
  return emailVerified.value
})

// 进入下一步
const nextStep = () => {
  if (step.value < 3) {
    step.value++
  }
}

// 返回上一步
const prevStep = () => {
  if (step.value > 1) {
    step.value--
  }
}

// 表单验证
const validateForm = () => {
  let isValid = true
  
  // 用户名验证
  if (!form.username) {
    errors.username = '请输入用户名';
    isValid = false;
  } else if (form.username.length < 3) {
    errors.username = '用户名至少需要3个字符';
    isValid = false;
  } else {
    errors.username = '';
  }
  
  // 密码验证
  if (!form.password) {
    errors.password = '请输入密码';
    isValid = false;
  } else if (form.password.length < 8) {
    errors.password = '密码至少需要8个字符';
    isValid = false;
  } else if (!((/[A-Z]/.test(form.password)) && (/[a-z]/.test(form.password)) && (/\d/.test(form.password)))) {
    errors.password = '密码强度不足，需包含大小写字母和数字';
    isValid = false;
  } else {
    errors.password = '';
  }
  
  // 确认密码验证
  if (!form.confirmPassword) {
    errors.confirmPassword = '请确认密码';
    isValid = false;
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = '两次输入的密码不一致';
    isValid = false;
  } else {
    errors.confirmPassword = '';
  }
  
  return isValid
}

// 是否可以注册
const canRegister = computed(() => {
  return (
    form.username.length >= 3 && 
    form.password.length >= 8 && 
    /[A-Z]/.test(form.password) && 
    /[a-z]/.test(form.password) && 
    /\d/.test(form.password) &&
    form.password === form.confirmPassword &&
    emailVerified.value // 确保邮箱已验证
  );
})

// 注册处理函数
const handleRegister = async () => {
  // 添加调试信息
  console.log('开始注册过程', {
    email: form.email,
    username: form.username,
    passwordLength: form.password.length,
    passwordMatch: form.password === form.confirmPassword,
    emailVerified: emailVerified.value,
    canRegister: canRegister.value
  });

  // 检查是否使用验证过的邮箱
  if (!emailVerified.value) {
    console.error('邮箱未验证');
    serverError.value = '请先完成邮箱验证';
    return;
  }

  // 执行表单验证，如果不通过则停止并显示错误信息
  if (!validateForm()) {
    console.log('表单验证失败', errors);
    return;
  }
  
  // 每次注册前重新检查后端状态
  if (!USE_MOCK_MODE) {
    await checkBackendState();
  }
  
  loading.value = true;
  serverError.value = '';
  debugInfo.value = '';
  
  try {
    if (debugMode) debugInfo.value = '开始注册请求...';
    
    // 记录准备发送的数据
    if (debugMode) {
      debugInfo.value += `\n请求数据: ${JSON.stringify({
        email: form.email,
        username: form.username,
        password: '******'
      })}`;
    }
    
    console.log('注册请求参数:', {
      email: form.email,
      username: form.username,
      passwordLength: form.password.length,
      verificationCode: form.verificationCode
    });
    
    // 使用带验证码的注册API
    const result = await userStore.registerWithVerification(
      form.email, 
      form.password, 
      form.username, 
      form.verificationCode
    );
    
    console.log('注册API返回结果:', result);
    
    if (debugMode) debugInfo.value += `\n注册结果: ${JSON.stringify(result)}`;
    
    if (result.success) {
      // 注册成功，进入完成步骤
      step.value = 3;
      
      // 清空表单
      form.email = '';
      form.verificationCode = '';
      form.username = '';
      form.password = '';
      form.confirmPassword = '';
    } else {
      // 显示后端返回的错误信息
      if (result.message?.includes('无法连接到服务器')) {
        serverError.value = '注册失败：后端服务不可用，已自动切换到模拟模式';
      } else {
        serverError.value = result.message || '注册失败，请稍后重试';
      }
    }
  } catch (err: any) {
    // 处理注册错误
    const errResp = err.response?.data;
    const errStatus = err.response?.status;
    
    if (debugMode) {
      debugInfo.value += `\n注册异常: 
      - 消息: ${err.message}
      - 状态码: ${errStatus || 'N/A'}
      - 响应数据: ${JSON.stringify(errResp || {})}`;
    }
    
    if (!err.response) {
      serverError.value = '无法连接到服务器，已切换到模拟模式';
    } else {
      serverError.value = errResp?.message || '注册失败，请稍后重试';
    }
    console.error('注册错误:', err);
  } finally {
    loading.value = false;
  }
}

// 第三方登录处理（模拟）
const thirdPartyLogin = (provider: string) => {
  alert(`${provider}登录功能正在开发中，敬请期待！`);
}

// 组件销毁时清除计时器
onUnmounted(() => {
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value);
    countdownTimer.value = null;
  }
});
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 80px);
  padding: 20px;
  background-color: #f5f5f5;
}

.register-card {
  width: 100%;
  max-width: 600px;
  padding: 40px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.title {
  text-align: center;
  color: #333;
  margin-bottom: 20px;
  font-size: 28px;
}

.backend-status {
  margin-bottom: 15px;
  padding: 10px;
  border-radius: 4px;
  text-align: center;
  font-size: 14px;
}

.backend-status.success {
  background-color: #e8f5e9;
  color: #4caf50;
}

.backend-status.error {
  background-color: #ffebee;
  color: #f44336;
}

.debug-info {
  margin-bottom: 15px;
  padding: 10px;
  background-color: #f0f8ff;
  border-radius: 4px;
  font-size: 12px;
  color: #333;
  word-break: break-all;
}

/* 注册进度指示器 */
.registration-progress {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 30px 0;
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.step-number {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: #e0e0e0;
  color: #757575;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-bottom: 8px;
  transition: all 0.3s;
}

.step-name {
  font-size: 12px;
  color: #757575;
  transition: all 0.3s;
}

.progress-step.active .step-number {
  background-color: #4caf50;
  color: white;
}

.progress-step.active .step-name {
  color: #4caf50;
  font-weight: 500;
}

.progress-step.completed .step-number {
  background-color: #4caf50;
  color: white;
}

.progress-connector {
  flex-grow: 1;
  height: 2px;
  background-color: #e0e0e0;
  max-width: 80px;
  transition: all 0.3s;
}

.progress-connector.active {
  background-color: #4caf50;
}

/* 注册步骤 */
.registration-step {
  margin-top: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 20px;
}

label {
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

input {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  transition: border-color 0.3s;
}

input:focus {
  outline: none;
  border-color: #4caf50;
}

.error-message {
  color: #f44336;
  font-size: 12px;
  margin-top: 4px;
}

.success-message {
  color: #4caf50;
  font-size: 12px;
  margin-top: 4px;
}

.info-message {
  color: #2196f3;
  font-size: 12px;
  margin-top: 4px;
}

.server-error {
  margin: 10px 0;
  padding: 10px;
  background-color: #ffebee;
  border-radius: 4px;
  font-size: 14px;
  color: #f44336;
}

/* 验证码相关样式 */
.verification-code-input-group {
  display: flex;
  gap: 10px;
}

.verification-code-input-group input {
  flex: 1;
}

.send-code-btn {
  min-width: 110px;
  padding: 0 12px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.send-code-btn:hover:not(:disabled) {
  background-color: #45a049;
}

.send-code-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.debug-code {
  margin-left: 10px;
  font-weight: bold;
  color: #ff5722;
}

/* 密码输入组 */
.password-input-group {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input-group input {
  width: 100%;
  padding-right: 40px;
}

.toggle-password-btn {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  color: #757575;
  cursor: pointer;
  font-size: 16px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.toggle-password-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

/* 替换眼睛图标为更美观的SVG图标 */
.toggle-password-btn::before {
  content: "";
  display: inline-block;
  width: 20px;
  height: 20px;
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
}

.toggle-password-btn.show-password::before {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23757575'%3E%3Cpath d='M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z'/%3E%3C/svg%3E");
}

.toggle-password-btn.hide-password::before {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23757575'%3E%3Cpath d='M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z'/%3E%3C/svg%3E");
}

/* 密码强度指示器 */
.password-strength-indicator {
  margin-top: 8px;
}

.strength-text {
  font-size: 12px;
  margin-bottom: 4px;
  color: #757575;
}

.strength-bars {
  display: flex;
  gap: 5px;
}

.strength-bar {
  height: 4px;
  flex: 1;
  background-color: #e0e0e0;
  border-radius: 2px;
  transition: all 0.3s;
}

.strength-bar.active:nth-child(1) { background-color: #f44336; }
.strength-bar.active:nth-child(2) { background-color: #ff9800; }
.strength-bar.active:nth-child(3) { background-color: #ffeb3b; }
.strength-bar.active:nth-child(4) { background-color: #4caf50; }

.password-requirements {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 8px;
}

.requirement {
  font-size: 12px;
  color: #757575;
  padding: 2px 8px;
  background-color: #f5f5f5;
  border-radius: 12px;
  transition: all 0.3s;
}

.requirement.met {
  background-color: #e8f5e9;
  color: #4caf50;
}

/* 步骤操作按钮 */
.step-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 30px;
}

.action-btn {
  padding: 12px 24px;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
  font-weight: 500;
}

.next-btn, .verify-btn {
  background-color: #4caf50;
  color: white;
}

.next-btn:hover:not(:disabled), .verify-btn:hover:not(:disabled) {
  background-color: #45a049;
}

.back-btn {
  background-color: #f5f5f5;
  color: #333;
}

.back-btn:hover {
  background-color: #e0e0e0;
}

.next-btn:disabled, .verify-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

/* 注册完成样式 */
.registration-complete {
  text-align: center;
  padding: 30px 0;
}

.complete-icon {
  font-size: 60px;
  margin-bottom: 20px;
}

.registration-complete h2 {
  margin-bottom: 10px;
  color: #4caf50;
}

.registration-complete p {
  color: #757575;
  margin-bottom: 30px;
}

.complete-actions {
  margin-top: 20px;
}

.login-now-btn {
  background-color: #4caf50;
  color: white;
  text-decoration: none;
  display: inline-block;
}

.login-now-btn:hover {
  background-color: #45a049;
}

/* 登录链接 */
.login-link {
  margin-top: 20px;
  text-align: center;
  font-size: 14px;
}

.login-link a {
  color: #4caf50;
  text-decoration: none;
  font-weight: 500;
}

.login-link a:hover {
  text-decoration: underline;
}

/* 第三方登录 */
.third-party-login {
  margin-top: 30px;
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin-bottom: 20px;
}

.divider::before, .divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid #eee;
}

.divider span {
  padding: 0 10px;
  color: #757575;
  font-size: 12px;
}

.third-party-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.third-party-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 4px;
  border: 1px solid #eee;
  background-color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.third-party-btn:hover {
  background-color: #f5f5f5;
}

.wechat-btn {
  color: #09bb07;
}

.google-btn {
  color: #4285f4;
}

.btn-icon {
  font-size: 18px;
}

/* 响应式样式 */
@media (max-width: 576px) {
  .register-card {
    padding: 20px;
  }
  
  .third-party-buttons {
    flex-direction: column;
    gap: 10px;
  }
  
  .verification-code-input-group {
    flex-direction: column;
  }
  
  .step-name {
    display: none;
  }
}

.step-info {
  margin-top: 10px;
  text-align: center;
  font-style: italic;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style> 