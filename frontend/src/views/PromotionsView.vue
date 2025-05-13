<template>
  <div class="promotions-container">
    <LuxuryNavbar />
    
    <div class="promotions-content">
      <h1 class="page-title">优惠活动</h1>
      
      <!-- 筛选工具栏 -->
      <div class="filter-section">
        <!-- 状态筛选 -->
        <div class="filter-bar">
          <div class="tab-buttons">
            <button 
              v-for="tab in tabs" 
              :key="tab.value"
              :class="['tab-button', { active: selectedStatus === tab.value }]"
              @click="selectedStatus = tab.value"
            >
              {{ tab.label }}
            </button>
          </div>
        </div>
        
        <!-- 高级筛选 -->
        <div class="advanced-filters">
          <div class="filter-dropdown">
            <button class="filter-trigger" @click="toggleFilterDropdown('type')">
              优惠类型 <span class="trigger-icon">{{ showTypeFilter ? '▲' : '▼' }}</span>
            </button>
            <div class="filter-options" v-if="showTypeFilter">
              <label v-for="type in promotionTypes" :key="type.value" class="filter-checkbox">
                <input 
                  type="checkbox" 
                  :value="type.value" 
                  v-model="selectedTypes"
                  @change="applyFilters" 
                />
                {{ type.label }}
              </label>
            </div>
          </div>
          
          <div class="filter-dropdown">
            <button class="filter-trigger" @click="toggleFilterDropdown('scope')">
              适用范围 <span class="trigger-icon">{{ showScopeFilter ? '▲' : '▼' }}</span>
            </button>
            <div class="filter-options" v-if="showScopeFilter">
              <label v-for="scope in scopeOptions" :key="scope.value" class="filter-checkbox">
                <input 
                  type="checkbox" 
                  :value="scope.value" 
                  v-model="selectedScopes"
                  @change="applyFilters" 
                />
                {{ scope.label }}
              </label>
            </div>
          </div>
          
          <div class="filter-dropdown">
            <button class="filter-trigger" @click="toggleFilterDropdown('tags')">
              优惠标签 <span class="trigger-icon">{{ showTagsFilter ? '▲' : '▼' }}</span>
            </button>
            <div class="filter-options" v-if="showTagsFilter">
              <label v-for="tag in availableTags" :key="tag" class="filter-checkbox">
                <input 
                  type="checkbox" 
                  :value="tag" 
                  v-model="selectedTags"
                  @change="applyFilters" 
                />
                {{ tag }}
              </label>
            </div>
          </div>
          
          <button class="clear-filters" @click="clearFilters">清除筛选</button>
        </div>
      </div>
      
      <!-- 加载中状态 -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>加载中...</p>
      </div>
      
      <!-- 错误状态 -->
      <div v-else-if="error" class="error-container">
        <p class="error-message">{{ error }}</p>
        <button @click="fetchPromotions" class="retry-button">重试</button>
      </div>
      
      <!-- 空数据状态 -->
      <div v-else-if="filteredPromotions.length === 0" class="empty-container">
        <div class="empty-icon">🔍</div>
        <p>{{ getEmptyMessage() }}</p>
        <button v-if="hasActiveFilters" @click="clearFilters" class="clear-filters-btn">清除筛选条件</button>
      </div>
      
      <!-- 优惠活动卡片列表 -->
      <div v-else class="promotions-grid">
        <div 
          v-for="promotion in filteredPromotions" 
          :key="promotion.id" 
          class="promotion-card"
          :class="{ 
            'is-featured': promotion.isFeature,
            'is-active': promotion.status === 'active',
            'is-coming': promotion.status === 'coming',
            'is-expired': promotion.status === 'expired',
            [`type-${promotion.promotionType}`]: true
          }"
        >
          <!-- 状态和推荐标记 -->
          <div class="promotion-status" v-if="promotion.status !== 'active'">
            {{ getStatusText(promotion.status) }}
          </div>
          <div class="promotion-badge" v-if="promotion.isFeature">推荐</div>
          
          <!-- 优惠类型标记 -->
          <div class="promotion-type-badge" :class="`type-${promotion.promotionType}`">
            {{ getPromotionTypeText(promotion.promotionType) }}
          </div>
          
          <!-- 收藏按钮 -->
          <button 
            class="favorite-btn" 
            :class="{ 'is-favorite': isFavorite(promotion.id) }"
            @click.stop="toggleFavorite(promotion.id)"
          >
            <span v-if="isFavorite(promotion.id)">★</span>
            <span v-else>☆</span>
          </button>
          
          <!-- 优惠内容 -->
          <div class="promotion-header">
            <h2 class="promotion-title">{{ promotion.title }}</h2>
            <div class="promotion-discount" v-if="promotion.promotionType === 'percent'">
              {{ promotion.discount }}% OFF
            </div>
            <div class="promotion-discount fixed" v-else-if="promotion.promotionType === 'fixed'">
              满{{ promotion.minAmount }}减{{ promotion.amount }}
            </div>
            <div class="promotion-discount gift" v-else-if="promotion.promotionType === 'gift' || promotion.promotionType === 'additional'">
              {{ promotion.giftDescription }}
            </div>
          </div>
          
          <p class="promotion-description">{{ promotion.description }}</p>
          
          <!-- 适用范围标签 -->
          <div class="promotion-scope">
            <span>适用范围:</span>
            <span class="scope-value">{{ getScopeText(promotion) }}</span>
          </div>
          
          <!-- 标签 -->
          <div class="promotion-tags">
            <span class="tag" v-for="tag in promotion.tags" :key="tag">{{ tag }}</span>
          </div>
          
          <!-- 有效期和配额 -->
          <div class="promotion-details">
            <div class="promotion-dates">
              <div class="date-label">有效期</div>
              <div class="date-value">{{ formatDate(promotion.startDate) }} - {{ formatDate(promotion.endDate) }}</div>
            </div>
            
            <div class="promotion-quota" v-if="promotion.quota > 0">
              <div class="quota-label">剩余</div>
              <div class="quota-value">{{ promotion.quota - promotion.usedCount }}/{{ promotion.quota }}</div>
            </div>
          </div>
          
          <!-- 优惠码和按钮 -->
          <div class="promotion-footer">
            <div class="promotion-code-container">
              <div class="code-label">优惠码</div>
              <div class="code-value">{{ promotion.code }}</div>
            </div>
            
            <div class="promotion-actions">
              <button 
                class="copy-code-btn"
                @click="copyPromotionCode(promotion.code)"
                :disabled="promotion.status !== 'active'"
              >
                {{ codeCopied === promotion.code ? '已复制' : '复制优惠码' }}
              </button>
              
              <button class="details-btn" @click="showPromotionDetails(promotion)">
                详情
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 优惠详情弹窗 -->
      <div v-if="selectedPromotion" class="promotion-details-modal" @click="closePromotionDetails">
        <div class="modal-content" @click.stop>
          <button class="close-btn" @click="closePromotionDetails">&times;</button>
          
          <h2 class="modal-title">{{ selectedPromotion.title }}</h2>
          
          <div class="detail-row status">
            <div class="detail-label">状态:</div>
            <div class="detail-value">
              <span class="status-badge" :class="`status-${selectedPromotion.status}`">
                {{ getStatusText(selectedPromotion.status) }}
              </span>
            </div>
          </div>
          
          <div class="detail-row">
            <div class="detail-label">优惠说明:</div>
            <div class="detail-value description">{{ selectedPromotion.description }}</div>
          </div>
          
          <div class="detail-row">
            <div class="detail-label">优惠类型:</div>
            <div class="detail-value">{{ getPromotionTypeText(selectedPromotion.promotionType) }}</div>
          </div>
          
          <div class="detail-row" v-if="selectedPromotion.promotionType === 'percent'">
            <div class="detail-label">折扣率:</div>
            <div class="detail-value">{{ selectedPromotion.discount }}% OFF</div>
          </div>
          
          <div class="detail-row" v-if="selectedPromotion.promotionType === 'fixed'">
            <div class="detail-label">优惠金额:</div>
            <div class="detail-value">满{{ selectedPromotion.minAmount }}元减{{ selectedPromotion.amount }}元</div>
          </div>
          
          <div class="detail-row" v-if="selectedPromotion.promotionType === 'gift' || selectedPromotion.promotionType === 'additional'">
            <div class="detail-label">赠品/服务:</div>
            <div class="detail-value">{{ selectedPromotion.giftDescription }}</div>
          </div>
          
          <div class="detail-row">
            <div class="detail-label">适用范围:</div>
            <div class="detail-value">{{ getScopeText(selectedPromotion) }}</div>
          </div>
          
          <div class="detail-row">
            <div class="detail-label">有效期:</div>
            <div class="detail-value">{{ formatDate(selectedPromotion.startDate) }} - {{ formatDate(selectedPromotion.endDate) }}</div>
          </div>
          
          <div class="detail-row">
            <div class="detail-label">适用用户:</div>
            <div class="detail-value">{{ getUserGroupText(selectedPromotion.userGroup) }}</div>
          </div>
          
          <div class="detail-row" v-if="selectedPromotion.userLimit > 0">
            <div class="detail-label">使用限制:</div>
            <div class="detail-value">每位用户限用{{ selectedPromotion.userLimit }}次</div>
          </div>
          
          <div class="detail-row" v-if="selectedPromotion.quota > 0">
            <div class="detail-label">剩余配额:</div>
            <div class="detail-value">{{ selectedPromotion.quota - selectedPromotion.usedCount }}/{{ selectedPromotion.quota }}</div>
          </div>
          
          <div class="detail-row code">
            <div class="detail-label">优惠码:</div>
            <div class="detail-value promotion-code">
              <span class="code">{{ selectedPromotion.code }}</span>
              <button 
                class="copy-btn" 
                @click="copyPromotionCode(selectedPromotion.code)"
              >
                {{ codeCopied === selectedPromotion.code ? '已复制' : '复制' }}
              </button>
            </div>
          </div>
          
          <div class="detail-row tags">
            <div class="detail-label">标签:</div>
            <div class="detail-value">
              <span class="tag" v-for="tag in selectedPromotion.tags" :key="tag">{{ tag }}</span>
            </div>
          </div>
          
          <div class="modal-actions">
            <button 
              class="favorite-action" 
              @click="toggleFavorite(selectedPromotion.id)"
            >
              {{ isFavorite(selectedPromotion.id) ? '取消收藏' : '收藏' }}
            </button>
            
            <button 
              class="use-action" 
              :disabled="selectedPromotion.status !== 'active'"
              @click="usePromotion(selectedPromotion)"
            >
              立即使用
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { getPromotions } from '../utils/api';
import LuxuryNavbar from '../components/LuxuryNavbar.vue';
import { useUserStore } from '../store/userStore';

// 获取用户存储
const userStore = useUserStore();

// 状态标签
const tabs = [
  { label: '当前优惠', value: 'active' },
  { label: '即将开始', value: 'coming' },
  { label: '已过期', value: 'expired' },
  { label: '全部', value: 'all' }
];

// 优惠类型选项
const promotionTypes = [
  { label: '折扣优惠', value: 'percent' },
  { label: '满减优惠', value: 'fixed' },
  { label: '赠品', value: 'gift' },
  { label: '额外服务', value: 'additional' }
];

// 适用范围选项
const scopeOptions = [
  { label: '全部服务', value: 'all' },
  { label: '客房预订', value: 'room' },
  { label: '餐饮服务', value: 'dining' },
  { label: 'SPA服务', value: 'spa' }
];

// 状态管理
const promotions = ref<any[]>([]);
const loading = ref(false);
const error = ref('');
const selectedStatus = ref('active');
const codeCopied = ref('');

// 筛选条件状态
const selectedTypes = ref<string[]>([]);
const selectedScopes = ref<string[]>([]);
const selectedTags = ref<string[]>([]);
const showTypeFilter = ref(false);
const showScopeFilter = ref(false);
const showTagsFilter = ref(false);

// 收藏状态
const favorites = ref<number[]>(
  JSON.parse(localStorage.getItem('favoritePromotions') || '[]')
);

// 优惠详情
const selectedPromotion = ref<any>(null);

// 获取所有可用标签
const availableTags = computed(() => {
  const tags = new Set<string>();
  promotions.value.forEach(promotion => {
    if (promotion.tags && promotion.tags.length) {
      promotion.tags.forEach((tag: string) => tags.add(tag));
    }
  });
  return Array.from(tags);
});

// 判断是否激活了任何筛选条件
const hasActiveFilters = computed(() => {
  return selectedTypes.value.length > 0 || 
         selectedScopes.value.length > 0 || 
         selectedTags.value.length > 0;
});

// 根据筛选条件过滤优惠活动
const filteredPromotions = computed(() => {
  let result = promotions.value;
  
  // 状态筛选
  if (selectedStatus.value !== 'all') {
    result = result.filter(p => p.status === selectedStatus.value);
  }
  
  // 类型筛选
  if (selectedTypes.value.length > 0) {
    result = result.filter(p => selectedTypes.value.includes(p.promotionType));
  }
  
  // 范围筛选
  if (selectedScopes.value.length > 0) {
    result = result.filter(p => {
      // 全部适用的优惠活动匹配所有范围
      if (p.applicableScope === 'all') return true;
      // 特定范围的优惠活动只匹配对应范围
      return selectedScopes.value.includes(p.applicableScope);
    });
  }
  
  // 标签筛选
  if (selectedTags.value.length > 0) {
    result = result.filter(p => {
      if (!p.tags || !p.tags.length) return false;
      // 至少包含一个选中的标签
      return p.tags.some((tag: string) => selectedTags.value.includes(tag));
    });
  }
  
  return result;
});

// 切换筛选下拉框
const toggleFilterDropdown = (type: string) => {
  if (type === 'type') {
    showTypeFilter.value = !showTypeFilter.value;
    showScopeFilter.value = false;
    showTagsFilter.value = false;
  } else if (type === 'scope') {
    showScopeFilter.value = !showScopeFilter.value;
    showTypeFilter.value = false;
    showTagsFilter.value = false;
  } else if (type === 'tags') {
    showTagsFilter.value = !showTagsFilter.value;
    showTypeFilter.value = false;
    showScopeFilter.value = false;
  }
};

// 清除所有筛选条件
const clearFilters = () => {
  selectedTypes.value = [];
  selectedScopes.value = [];
  selectedTags.value = [];
  showTypeFilter.value = false;
  showScopeFilter.value = false;
  showTagsFilter.value = false;
};

// 获取优惠活动列表
const fetchPromotions = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    const response = await getPromotions(selectedStatus.value);
    
    if (response.success) {
      promotions.value = response.data;
    } else {
      error.value = response.message || '获取优惠活动失败';
    }
  } catch (err: any) {
    console.error('获取优惠活动出错:', err);
    error.value = err.message || '获取优惠活动时发生错误';
  } finally {
    loading.value = false;
  }
};

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

// 获取状态文本
const getStatusText = (status: string) => {
  switch (status) {
    case 'active': return '进行中';
    case 'coming': return '即将开始';
    case 'expired': return '已结束';
    default: return status;
  }
};

// 获取优惠类型文本
const getPromotionTypeText = (type: string) => {
  switch (type) {
    case 'percent': return '折扣';
    case 'fixed': return '满减';
    case 'gift': return '赠品';
    case 'additional': return '服务';
    default: return type;
  }
};

// 获取适用范围文本
const getScopeText = (promotion: any) => {
  if (promotion.applicableScope === 'all') return '全部服务';
  if (promotion.applicableScope === 'room') {
    if (promotion.applicableRooms && promotion.applicableRooms.length > 0) {
      return `指定房型`;
    }
    return '所有房型';
  }
  if (promotion.applicableScope === 'dining') return '餐饮服务';
  if (promotion.applicableScope === 'spa') return 'SPA服务';
  return promotion.applicableScope;
};

// 获取用户组文本
const getUserGroupText = (group: string) => {
  switch (group) {
    case 'all': return '所有用户';
    case 'member': return '会员专享';
    case 'vip': return 'VIP会员专享';
    default: return group;
  }
};

// 获取空状态消息
const getEmptyMessage = () => {
  if (hasActiveFilters.value) {
    return '没有找到符合筛选条件的优惠活动';
  }
  
  switch (selectedStatus.value) {
    case 'active': return '当前没有正在进行的优惠活动';
    case 'coming': return '暂无即将开始的优惠活动';
    case 'expired': return '没有已过期的优惠活动';
    default: return '没有找到任何优惠活动';
  }
};

// 复制优惠码到剪贴板
const copyPromotionCode = (code: string) => {
  navigator.clipboard.writeText(code)
    .then(() => {
      codeCopied.value = code;
      setTimeout(() => {
        if (codeCopied.value === code) {
          codeCopied.value = '';
        }
      }, 2000);
    })
    .catch(err => {
      console.error('复制失败:', err);
    });
};

// 检查优惠活动是否收藏
const isFavorite = (id: number) => {
  return favorites.value.includes(id);
};

// 切换收藏状态
const toggleFavorite = (id: number) => {
  const index = favorites.value.indexOf(id);
  if (index === -1) {
    // 添加收藏
    favorites.value.push(id);
  } else {
    // 取消收藏
    favorites.value.splice(index, 1);
  }
  
  // 保存到本地存储
  localStorage.setItem('favoritePromotions', JSON.stringify(favorites.value));
};

// 显示优惠详情
const showPromotionDetails = (promotion: any) => {
  selectedPromotion.value = promotion;
};

// 关闭优惠详情
const closePromotionDetails = () => {
  selectedPromotion.value = null;
};

// 使用优惠券
const usePromotion = (promotion: any) => {
  if (promotion.status !== 'active') return;
  
  // 根据适用范围跳转到不同页面
  if (promotion.applicableScope === 'room' || promotion.applicableScope === 'all') {
    // 跳转到房间预订页面并应用优惠码
    window.location.href = `/room-booking?code=${promotion.code}`;
  } else if (promotion.applicableScope === 'dining') {
    // 跳转到餐饮预订页面
    alert('餐饮服务预订功能即将上线，敬请期待！');
  } else if (promotion.applicableScope === 'spa') {
    // 跳转到SPA预订页面
    alert('SPA服务预订功能即将上线，敬请期待！');
  }
};

// 应用筛选
const applyFilters = () => {
  // 触发computed重新计算
  // 这个函数不需要实际执行任何代码，因为筛选逻辑在computed中
};

// 监听状态变化，重新获取数据
watch(selectedStatus, () => {
  fetchPromotions();
});

// 组件挂载时获取数据
onMounted(() => {
  fetchPromotions();
  
  // 关闭筛选下拉框的点击外部监听
  document.addEventListener('click', (e) => {
    if (showTypeFilter.value || showScopeFilter.value || showTagsFilter.value) {
      const target = e.target as HTMLElement;
      if (!target.closest('.filter-dropdown')) {
        showTypeFilter.value = false;
        showScopeFilter.value = false;
        showTagsFilter.value = false;
      }
    }
  });
});
</script>

<style scoped>
.promotions-container {
  min-height: 100vh;
  background-color: var(--background-color, #f5f7fa);
}

.promotions-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 90px 20px 40px;
}

.page-title {
  font-size: 32px;
  font-weight: 600;
  color: #333;
  margin-bottom: 30px;
  text-align: center;
  position: relative;
}

.page-title::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 3px;
  background: linear-gradient(to right, #0F1A3D, #D4AF37);
  border-radius: 3px;
}

/* 筛选区域 */
.filter-section {
  margin-bottom: 30px;
}

.filter-bar {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.tab-buttons {
  display: flex;
  background-color: #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.tab-button {
  padding: 12px 24px;
  border: none;
  background-color: transparent;
  cursor: pointer;
  font-size: 16px;
  color: #666;
  transition: all 0.3s ease;
}

.tab-button:hover {
  background-color: #e6e6e6;
}

.tab-button.active {
  background-color: #0F1A3D;
  color: white;
  font-weight: 500;
}

/* 高级筛选 */
.advanced-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-top: 15px;
  justify-content: center;
  padding: 0 20px;
}

.filter-dropdown {
  position: relative;
  margin-bottom: 10px;
}

.filter-trigger {
  padding: 8px 15px;
  background-color: #f8f8f8;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.2s ease;
}

.filter-trigger:hover {
  background-color: #f0f0f0;
}

.trigger-icon {
  font-size: 10px;
  transition: transform 0.2s;
}

.filter-options {
  position: absolute;
  top: 100%;
  left: 0;
  width: 180px;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 10px;
  z-index: 100;
  margin-top: 5px;
}

.filter-checkbox {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #555;
}

.filter-checkbox:last-child {
  margin-bottom: 0;
}

.filter-checkbox input {
  margin-right: 8px;
}

.clear-filters {
  padding: 8px 15px;
  background-color: transparent;
  border: 1px solid #ddd;
  border-radius: 4px;
  color: #888;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.clear-filters:hover {
  background-color: #f0f0f0;
  color: #555;
}

/* 加载状态 */
.loading-container, .error-container, .empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  width: 100%;
  padding: 40px 0;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #0F1A3D;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  color: #f44336;
  font-size: 18px;
  margin-bottom: 20px;
}

.retry-button, .clear-filters-btn {
  padding: 10px 20px;
  background-color: #0F1A3D;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.retry-button:hover, .clear-filters-btn:hover {
  background-color: #1c2d5e;
}

.empty-icon {
  font-size: 60px;
  color: #ccc;
  margin-bottom: 20px;
}

/* 优惠活动卡片 */
.promotions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 25px;
}

.promotion-card {
  position: relative;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  padding: 25px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.promotion-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.promotion-card.is-featured {
  border: 1px solid #D4AF37;
}

.promotion-card.is-coming {
  background-color: #f8fbff;
}

.promotion-card.is-expired {
  opacity: 0.7;
}

.promotion-badge {
  position: absolute;
  top: 0;
  right: 0;
  background-color: #D4AF37;
  color: white;
  padding: 5px 12px;
  font-size: 12px;
  font-weight: bold;
  border-bottom-left-radius: 8px;
  z-index: 1;
}

.promotion-status {
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  z-index: 1;
}

.is-coming .promotion-status {
  background-color: #e0f7fa;
  color: #0097a7;
}

.is-expired .promotion-status {
  background-color: #f5f5f5;
  color: #9e9e9e;
}

.promotion-type-badge {
  position: absolute;
  top: 40px;
  left: 10px;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  z-index: 1;
}

.type-percent .promotion-type-badge {
  background-color: #e8f5e9;
  color: #388e3c;
}

.type-fixed .promotion-type-badge {
  background-color: #fff8e1;
  color: #ffa000;
}

.type-gift .promotion-type-badge {
  background-color: #f3e5f5;
  color: #8e24aa;
}

.type-additional .promotion-type-badge {
  background-color: #e3f2fd;
  color: #1976d2;
}

.favorite-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: transparent;
  border: none;
  font-size: 24px;
  color: #ccc;
  cursor: pointer;
  transition: color 0.2s;
  z-index: 2;
}

.promotion-card.is-featured .favorite-btn {
  right: 45px;
}

.favorite-btn.is-favorite, .favorite-btn:hover {
  color: #D4AF37;
}

.promotion-header {
  margin-bottom: 15px;
  padding-top: 30px;
}

.promotion-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 15px;
  line-height: 1.4;
}

.promotion-discount {
  display: inline-block;
  padding: 5px 10px;
  background-color: #e8f5e9;
  color: #388e3c;
  border-radius: 4px;
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 10px;
}

.promotion-discount.fixed {
  background-color: #fff8e1;
  color: #ffa000;
}

.promotion-discount.gift {
  background-color: #f3e5f5;
  color: #8e24aa;
}

.promotion-description {
  font-size: 14px;
  color: #666;
  margin-bottom: 15px;
  flex-grow: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.5;
}

.promotion-scope {
  font-size: 13px;
  color: #777;
  margin-bottom: 10px;
}

.scope-value {
  font-weight: 500;
  color: #555;
}

.promotion-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 15px;
}

.tag {
  padding: 3px 8px;
  background-color: #f0f0f0;
  border-radius: 12px;
  font-size: 12px;
  color: #666;
}

.promotion-details {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  font-size: 13px;
  color: #777;
}

.date-label, .quota-label {
  font-weight: 500;
  margin-bottom: 3px;
}

.promotion-footer {
  border-top: 1px solid #eee;
  padding-top: 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.promotion-code-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.code-label {
  font-size: 13px;
  color: #777;
  white-space: nowrap;
}

.code-value {
  padding: 5px 10px;
  background-color: #f5f5f5;
  border-radius: 4px;
  font-size: 14px;
  color: #333;
  font-family: monospace;
  font-weight: 600;
  letter-spacing: 1px;
}

.promotion-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.copy-code-btn, .details-btn {
  padding: 8px 15px;
  font-size: 14px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;
}

.copy-code-btn {
  background-color: #0F1A3D;
  color: white;
  border: none;
}

.copy-code-btn:hover:not(:disabled) {
  background-color: #1c2d5e;
}

.copy-code-btn:disabled {
  background-color: #ddd;
  cursor: not-allowed;
}

.details-btn {
  background-color: transparent;
  border: 1px solid #0F1A3D;
  color: #0F1A3D;
}

.details-btn:hover {
  background-color: rgba(15, 26, 61, 0.05);
}

/* 详情弹窗 */
.promotion-details-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background-color: white;
  border-radius: 10px;
  padding: 30px;
  width: 100%;
  max-width: 550px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  background: transparent;
  border: none;
  font-size: 28px;
  color: #999;
  cursor: pointer;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #333;
}

.modal-title {
  font-size: 24px;
  color: #333;
  margin-bottom: 20px;
  padding-right: 30px;
}

.detail-row {
  display: flex;
  margin-bottom: 15px;
}

.detail-label {
  width: 100px;
  font-weight: 500;
  color: #666;
  flex-shrink: 0;
}

.detail-value {
  flex: 1;
  color: #333;
}

.detail-value.description {
  line-height: 1.6;
}

.status-badge {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.status-active {
  background-color: #e8f5e9;
  color: #388e3c;
}

.status-coming {
  background-color: #e0f7fa;
  color: #0097a7;
}

.status-expired {
  background-color: #f5f5f5;
  color: #9e9e9e;
}

.detail-row.code .detail-value {
  display: flex;
  align-items: center;
  gap: 10px;
}

.promotion-code {
  padding: 5px 12px;
  background-color: #f5f5f5;
  border-radius: 4px;
  font-family: monospace;
  font-weight: 600;
  letter-spacing: 1px;
}

.copy-btn {
  padding: 5px 10px;
  background-color: #0F1A3D;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.copy-btn:hover {
  background-color: #1c2d5e;
}

.detail-row.tags .detail-value {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.modal-actions {
  display: flex;
  gap: 15px;
  margin-top: 25px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.favorite-action, .use-action {
  flex: 1;
  padding: 12px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.favorite-action {
  background-color: transparent;
  border: 1px solid #D4AF37;
  color: #D4AF37;
}

.favorite-action:hover {
  background-color: rgba(212, 175, 55, 0.1);
}

.use-action {
  background-color: #0F1A3D;
  color: white;
  border: none;
}

.use-action:hover:not(:disabled) {
  background-color: #1c2d5e;
}

.use-action:disabled {
  background-color: #ddd;
  cursor: not-allowed;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .promotions-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
  
  .promotion-card {
    padding: 20px;
  }
  
  .modal-content {
    padding: 20px;
  }
  
  .detail-row {
    flex-direction: column;
  }
  
  .detail-label {
    width: 100%;
    margin-bottom: 5px;
  }
}

@media (max-width: 480px) {
  .tab-button {
    padding: 10px 15px;
    font-size: 14px;
  }
  
  .advanced-filters {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
  
  .filter-dropdown {
    width: 100%;
  }
  
  .filter-trigger {
    width: 100%;
    justify-content: space-between;
  }
  
  .filter-options {
    width: 100%;
  }
  
  .promotions-grid {
    grid-template-columns: 1fr;
  }
  
  .promotion-actions {
    flex-direction: column;
  }
  
  .modal-actions {
    flex-direction: column;
  }
}
</style> 