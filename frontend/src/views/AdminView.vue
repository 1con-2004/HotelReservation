<template>
  <div class="admin-container">
    <h1 class="admin-title">管理后台</h1>
    
    <div class="admin-tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        :class="['tab-button', { active: activeTab === tab.id }]"
        @click="activeTab = tab.id"
      >
        {{ tab.name }}
      </button>
    </div>
    
    <!-- 优惠活动管理 -->
    <div v-if="activeTab === 'promotions'" class="panel-container">
      <div class="panel-header">
        <h2>优惠活动管理</h2>
        <div class="panel-actions">
          <button class="stats-btn" @click="togglePromotionStats">
            {{ showPromotionStats ? '隐藏统计' : '数据分析' }}
          </button>
          <button @click="openCreatePromotionModal" class="create-btn">添加优惠活动</button>
        </div>
      </div>
      
      <!-- 数据统计区域 -->
      <div v-if="showPromotionStats" class="stats-container">
        <div class="stats-header">
          <h3>优惠活动数据分析</h3>
          <div class="date-range">
            <label for="stats-date-from">日期范围:</label>
            <input type="date" id="stats-date-from" v-model="statsDateFrom" />
            <span>至</span>
            <input type="date" id="stats-date-to" v-model="statsDateTo" />
            <button @click="generatePromotionStats" class="refresh-stats">刷新</button>
          </div>
        </div>
        
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">{{ promotionStats.activeCount }}</div>
            <div class="stat-label">当前活动数</div>
            <div class="stat-change" :class="promotionStats.activeChange >= 0 ? 'positive' : 'negative'">
              {{ promotionStats.activeChange >= 0 ? '+' : '' }}{{ promotionStats.activeChange }}%
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-value">{{ promotionStats.usageCount }}</div>
            <div class="stat-label">优惠券使用次数</div>
            <div class="stat-change" :class="promotionStats.usageChange >= 0 ? 'positive' : 'negative'">
              {{ promotionStats.usageChange >= 0 ? '+' : '' }}{{ promotionStats.usageChange }}%
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-value">{{ promotionStats.conversionRate }}%</div>
            <div class="stat-label">转化率</div>
            <div class="stat-change" :class="promotionStats.conversionChange >= 0 ? 'positive' : 'negative'">
              {{ promotionStats.conversionChange >= 0 ? '+' : '' }}{{ promotionStats.conversionChange }}%
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-value">¥{{ promotionStats.discountAmount }}</div>
            <div class="stat-label">优惠总额</div>
            <div class="stat-change" :class="promotionStats.discountChange >= 0 ? 'positive' : 'negative'">
              {{ promotionStats.discountChange >= 0 ? '+' : '' }}{{ promotionStats.discountChange }}%
            </div>
          </div>
        </div>
        
        <div class="stats-charts">
          <div class="chart-container">
            <h4>优惠类型分布</h4>
            <div class="chart-placeholder">
              <div class="pie-chart">
                <div class="pie-slice" style="--percent: 45%; --color: #4caf50;">45%</div>
                <div class="pie-slice" style="--percent: 30%; --color: #ffc107;">30%</div>
                <div class="pie-slice" style="--percent: 15%; --color: #9c27b0;">15%</div>
                <div class="pie-slice" style="--percent: 10%; --color: #2196f3;">10%</div>
              </div>
              <div class="chart-legend">
                <div class="legend-item"><span class="legend-color" style="background-color: #4caf50;"></span>折扣 45%</div>
                <div class="legend-item"><span class="legend-color" style="background-color: #ffc107;"></span>满减 30%</div>
                <div class="legend-item"><span class="legend-color" style="background-color: #9c27b0;"></span>赠品 15%</div>
                <div class="legend-item"><span class="legend-color" style="background-color: #2196f3;"></span>服务 10%</div>
              </div>
            </div>
          </div>
          
          <div class="chart-container">
            <h4>近期活动效果对比</h4>
            <div class="chart-placeholder">
              <div class="bar-chart">
                <div class="bar-item">
                  <div class="bar-label">暑期特惠</div>
                  <div class="bar-value" style="--height: 85%;">85%</div>
                </div>
                <div class="bar-item">
                  <div class="bar-label">满减活动</div>
                  <div class="bar-value" style="--height: 65%;">65%</div>
                </div>
                <div class="bar-item">
                  <div class="bar-label">会员专享</div>
                  <div class="bar-value" style="--height: 72%;">72%</div>
                </div>
                <div class="bar-item">
                  <div class="bar-label">SPA赠券</div>
                  <div class="bar-value" style="--height: 45%;">45%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="stats-table-container">
          <h4>热门优惠活动排行</h4>
          <table class="stats-table">
            <thead>
              <tr>
                <th>排名</th>
                <th>活动名称</th>
                <th>使用次数</th>
                <th>转化率</th>
                <th>活动状态</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(stat, index) in promotionStats.topPromotions" :key="stat.id">
                <td>{{ index + 1 }}</td>
                <td>{{ stat.title }}</td>
                <td>{{ stat.usedCount }}</td>
                <td>{{ stat.conversionRate }}%</td>
                <td>
                  <span class="status-badge" :class="getStatusClass(stat.status)">
                    {{ getStatusText(stat.status) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- 筛选区域 -->
      <div class="filter-options">
        <div class="filter-row">
          <div class="filter-group">
            <label for="status-filter">状态筛选:</label>
            <select id="status-filter" v-model="statusFilter" class="filter-select">
              <option value="all">全部</option>
              <option value="active">进行中</option>
              <option value="coming">即将开始</option>
              <option value="expired">已结束</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label for="type-filter">优惠类型:</label>
            <select id="type-filter" v-model="typeFilter" class="filter-select">
              <option value="all">全部类型</option>
              <option value="percent">折扣优惠</option>
              <option value="fixed">满减优惠</option>
              <option value="gift">赠品</option>
              <option value="additional">额外服务</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label for="scope-filter">适用范围:</label>
            <select id="scope-filter" v-model="scopeFilter" class="filter-select">
              <option value="all">全部范围</option>
              <option value="all_service">全部服务</option>
              <option value="room">客房服务</option>
              <option value="dining">餐饮服务</option>
              <option value="spa">SPA服务</option>
            </select>
          </div>
          
          <div class="search-group">
            <input 
              type="text"
              v-model="searchQuery"
              placeholder="搜索优惠活动..."
              class="search-input"
              @input="debounceSearch"
            />
          </div>
        </div>
        
        <div class="filter-row">
          <div class="filter-group date-filter">
            <label>创建日期:</label>
            <div class="date-range">
              <input 
                type="date" 
                v-model="dateFrom" 
                class="date-input"
                placeholder="开始日期"
              />
              <span>至</span>
              <input 
                type="date" 
                v-model="dateTo" 
                class="date-input"
                placeholder="结束日期"
              />
            </div>
          </div>
          
          <div class="tags-filter">
            <label>标签筛选:</label>
            <div class="tags-container">
              <div 
                v-for="tag in availableTags" 
                :key="tag"
                :class="['filter-tag', { selected: selectedTags.includes(tag) }]"
                @click="toggleTagFilter(tag)"
              >
                {{ tag }}
              </div>
            </div>
          </div>
          
          <button class="clear-filter-btn" @click="clearPromotionFilters">
            清除筛选
          </button>
        </div>
      </div>
      
      <!-- 批量操作 -->
      <div class="bulk-actions" v-if="selectedPromotions.length > 0">
        <div class="selection-info">
          已选择 <span class="count">{{ selectedPromotions.length }}</span> 项
        </div>
        <div class="bulk-buttons">
          <button class="bulk-btn feature" @click="bulkFeaturePromotions">设为推荐</button>
          <button class="bulk-btn unfeature" @click="bulkUnfeaturePromotions">取消推荐</button>
          <button class="bulk-btn expire" @click="bulkExpirePromotions">设为已结束</button>
          <button class="bulk-btn delete" @click="bulkDeletePromotions">批量删除</button>
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
        <p>未找到符合条件的优惠活动</p>
        <button @click="clearPromotionFilters" class="clear-filter-btn">清除筛选条件</button>
      </div>
      
      <!-- 优惠活动表格 -->
      <div v-else class="promotions-table-container">
        <table class="promotions-table">
          <thead>
            <tr>
              <th>
                <input 
                  type="checkbox" 
                  :checked="isAllSelected"
                  @change="toggleSelectAll"
                  class="select-checkbox"
                />
              </th>
              <th>ID</th>
              <th>标题</th>
              <th>类型</th>
              <th>优惠</th>
              <th>适用范围</th>
              <th>优惠码</th>
              <th>有效期</th>
              <th>状态</th>
              <th>推荐</th>
              <th>配额</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="promotion in filteredPromotions" 
              :key="promotion.id" 
              :class="{ 
                'expired-row': promotion.status === 'expired',
                'selected-row': selectedPromotions.includes(promotion.id)
              }"
            >
              <td>
                <input 
                  type="checkbox" 
                  :checked="selectedPromotions.includes(promotion.id)"
                  @change="toggleSelectPromotion(promotion.id)"
                  class="select-checkbox"
                />
              </td>
              <td>{{ promotion.id }}</td>
              <td class="title-cell" :title="promotion.description">{{ promotion.title }}</td>
              <td>
                <span class="type-badge" :class="`type-${promotion.promotionType}`">
                  {{ getPromotionTypeText(promotion.promotionType) }}
                </span>
              </td>
              <td>
                <span v-if="promotion.promotionType === 'percent'">{{ promotion.discount }}% OFF</span>
                <span v-else-if="promotion.promotionType === 'fixed'">满{{ promotion.minAmount }}减{{ promotion.amount }}</span>
                <span v-else>{{ promotion.giftDescription }}</span>
              </td>
              <td>{{ getScopeText(promotion) }}</td>
              <td><code>{{ promotion.code }}</code></td>
              <td>{{ formatDate(promotion.startDate) }} <br> {{ formatDate(promotion.endDate) }}</td>
              <td>
                <span class="status-badge" :class="getStatusClass(promotion.status)">
                  {{ getStatusText(promotion.status) }}
                </span>
              </td>
              <td>
                <span @click="toggleFeature(promotion)" :class="['feature-badge', { 'featured': promotion.isFeature }]">
                  {{ promotion.isFeature ? '是' : '否' }}
                </span>
              </td>
              <td>
                <template v-if="promotion.quota > 0">
                  {{ promotion.quota - promotion.usedCount }}/{{ promotion.quota }}
                </template>
                <template v-else>不限</template>
              </td>
              <td class="actions-cell">
                <button @click="viewPromotionStats(promotion)" class="stats-btn small">数据</button>
                <button @click="editPromotion(promotion)" class="edit-btn">编辑</button>
                <button @click="deletePromotion(promotion)" class="delete-btn">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- 分页控件 -->
      <div class="pagination">
        <button 
          class="page-btn prev" 
          :disabled="currentPage === 1"
          @click="changePage(currentPage - 1)"
        >
          上一页
        </button>
        
        <div class="page-numbers">
          <button 
            v-for="page in displayedPages" 
            :key="page"
            :class="['page-number', { active: currentPage === page }]"
            @click="changePage(page)"
          >
            {{ page }}
          </button>
        </div>
        
        <button 
          class="page-btn next" 
          :disabled="currentPage === totalPages"
          @click="changePage(currentPage + 1)"
        >
          下一页
        </button>
      </div>
    </div>
    
    <!-- 其他管理面板（用户管理、房间管理等） -->
    <div v-else class="panel-container">
      <h2>{{ getActiveTabName() }}</h2>
      <p>该功能正在开发中...</p>
    </div>
    
    <!-- 添加/编辑优惠活动的模态框 -->
    <div v-if="showPromotionModal" class="modal-overlay" @click="closePromotionModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ isEditing ? '编辑优惠活动' : '添加优惠活动' }}</h3>
          <button class="close-btn" @click="closePromotionModal">&times;</button>
        </div>
        
        <div class="modal-body">
          <form @submit.prevent="savePromotion" class="promotion-form">
            <div class="form-group">
              <label for="title">标题 <span class="required">*</span></label>
              <input 
                type="text" 
                id="title" 
                v-model="promotionForm.title" 
                required 
                placeholder="输入优惠活动标题"
              />
            </div>
            
            <div class="form-group">
              <label for="description">描述 <span class="required">*</span></label>
              <textarea 
                id="description" 
                v-model="promotionForm.description" 
                required 
                placeholder="输入优惠活动描述"
                rows="3"
              ></textarea>
            </div>
            
            <div class="form-row">
              <div class="form-group half">
                <label for="promotionType">优惠类型 <span class="required">*</span></label>
                <select id="promotionType" v-model="promotionForm.promotionType">
                  <option value="percent">折扣优惠</option>
                  <option value="fixed">满减优惠</option>
                  <option value="gift">赠品</option>
                  <option value="additional">额外服务</option>
                </select>
              </div>
              
              <div class="form-group half">
                <label for="code">优惠码 <span class="required">*</span></label>
                <input 
                  type="text" 
                  id="code" 
                  v-model="promotionForm.code" 
                  required 
                  placeholder="例如: SUMMER2023"
                />
              </div>
            </div>
            
            <div class="form-row" v-if="promotionForm.promotionType === 'percent'">
              <div class="form-group half">
                <label for="discount">折扣率(%) <span class="required">*</span></label>
                <input 
                  type="number" 
                  id="discount" 
                  v-model="promotionForm.discount" 
                  required 
                  min="1"
                  max="100"
                  placeholder="例如: 20"
                />
              </div>
              
              <div class="form-group half">
                <label for="applicableScope">适用范围</label>
                <select id="applicableScope" v-model="promotionForm.applicableScope">
                  <option value="all">全部服务</option>
                  <option value="room">客房服务</option>
                  <option value="dining">餐饮服务</option>
                  <option value="spa">SPA服务</option>
                </select>
              </div>
            </div>
            
            <div class="form-row" v-if="promotionForm.promotionType === 'fixed'">
              <div class="form-group half">
                <label for="amount">优惠金额 <span class="required">*</span></label>
                <input 
                  type="number" 
                  id="amount" 
                  v-model="promotionForm.amount" 
                  required 
                  min="1"
                  placeholder="例如: 200"
                />
              </div>
              
              <div class="form-group half">
                <label for="minAmount">最低消费 <span class="required">*</span></label>
                <input 
                  type="number" 
                  id="minAmount" 
                  v-model="promotionForm.minAmount" 
                  required 
                  min="0"
                  placeholder="例如: 1000"
                />
              </div>
            </div>
            
            <div class="form-row" v-if="promotionForm.promotionType === 'gift' || promotionForm.promotionType === 'additional'">
              <div class="form-group">
                <label for="giftDescription">赠品/服务描述 <span class="required">*</span></label>
                <input 
                  type="text" 
                  id="giftDescription" 
                  v-model="promotionForm.giftDescription" 
                  required 
                  placeholder="例如: 价值300元SPA体验券一张"
                />
              </div>
            </div>
            
            <div class="form-row" v-if="promotionForm.applicableScope === 'room'">
              <div class="form-group">
                <label for="applicableRooms">适用房型</label>
                <div class="checkbox-grid">
                  <label v-for="room in roomOptions" :key="room.id" class="checkbox-item">
                    <input 
                      type="checkbox" 
                      :value="room.id" 
                      v-model="promotionForm.applicableRooms"
                    />
                    {{ room.name }}
                  </label>
                </div>
                <div class="hint-text">不选择表示适用于所有房型</div>
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group half">
                <label for="startDate">开始日期 <span class="required">*</span></label>
                <input 
                  type="date" 
                  id="startDate" 
                  v-model="promotionForm.startDate" 
                  required 
                />
              </div>
              
              <div class="form-group half">
                <label for="endDate">结束日期 <span class="required">*</span></label>
                <input 
                  type="date" 
                  id="endDate" 
                  v-model="promotionForm.endDate" 
                  required 
                  :min="promotionForm.startDate"
                />
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group half">
                <label for="userGroup">适用用户群体</label>
                <select id="userGroup" v-model="promotionForm.userGroup">
                  <option value="all">所有用户</option>
                  <option value="member">会员专享</option>
                  <option value="vip">VIP会员专享</option>
                </select>
              </div>
              
              <div class="form-group half">
                <label for="status">状态</label>
                <select id="status" v-model="promotionForm.status">
                  <option value="active">进行中</option>
                  <option value="coming">即将开始</option>
                  <option value="expired">已结束</option>
                </select>
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group half">
                <label for="quota">库存/配额限制</label>
                <input 
                  type="number" 
                  id="quota" 
                  v-model="promotionForm.quota" 
                  min="0"
                  placeholder="0表示不限制"
                />
              </div>
              
              <div class="form-group half">
                <label for="userLimit">每用户使用限制</label>
                <input 
                  type="number" 
                  id="userLimit" 
                  v-model="promotionForm.userLimit" 
                  min="0"
                  placeholder="0表示不限制"
                />
              </div>
            </div>
            
            <div class="form-group">
              <label for="tags">标签</label>
              <div class="tags-input-container">
                <div class="selected-tags">
                  <div 
                    v-for="tag in promotionForm.tags" 
                    :key="tag" 
                    class="tag-item"
                  >
                    {{ tag }}
                    <button type="button" class="tag-remove" @click="removeTag(tag)">×</button>
                  </div>
                </div>
                <input 
                  type="text" 
                  id="tagInput" 
                  v-model="tagInput" 
                  @keydown.enter.prevent="addTag"
                  placeholder="输入标签后按Enter添加"
                />
              </div>
            </div>
            
            <div class="form-group checkbox-group">
              <input 
                type="checkbox" 
                id="isFeature" 
                v-model="promotionForm.isFeature"
              />
              <label for="isFeature">设为推荐活动</label>
            </div>
            
            <div v-if="formError" class="form-error">
              {{ formError }}
            </div>
            
            <div class="form-actions">
              <button 
                type="button" 
                class="cancel-btn" 
                @click="closePromotionModal"
                :disabled="savingPromotion"
              >
                取消
              </button>
              <button 
                type="submit" 
                class="save-btn"
                :disabled="savingPromotion"
              >
                {{ savingPromotion ? '保存中...' : (isEditing ? '保存修改' : '创建活动') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    
    <!-- 删除确认模态框 -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="cancelDelete">
      <div class="modal-content delete-modal" @click.stop>
        <div class="modal-header">
          <h3>确认删除</h3>
          <button class="close-btn" @click="cancelDelete">&times;</button>
        </div>
        
        <div class="modal-body">
          <p>您确定要删除优惠活动 "{{ promotionToDelete?.title }}" 吗？</p>
          <p class="warning-text">此操作无法撤销！</p>
          
          <div class="form-actions">
            <button class="cancel-btn" @click="cancelDelete">取消</button>
            <button class="delete-confirm-btn" @click="confirmDelete" :disabled="deletingPromotion">
              {{ deletingPromotion ? '删除中...' : '确认删除' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { getPromotions, createPromotion, updatePromotion, deletePromotion as apiDeletePromotion } from '../utils/api';
import { useUserStore } from '../store/userStore';
import { debounce } from 'lodash';

const userStore = useUserStore();

// 确保用户是管理员
if (!userStore.isAdmin()) {
  // 如果不是管理员，跳转到首页
  window.location.href = '/home';
}

// 管理选项卡
const tabs = [
  { id: 'promotions', name: '优惠活动' },
  { id: 'users', name: '用户管理' },
  { id: 'rooms', name: '房间管理' },
  { id: 'bookings', name: '预订管理' }
];

// 状态管理
const activeTab = ref('promotions');
const promotions = ref<any[]>([]);
const loading = ref(false);
const error = ref('');
const statusFilter = ref('all');
const typeFilter = ref('all');
const scopeFilter = ref('all');
const searchQuery = ref('');
const dateFrom = ref('');
const dateTo = ref('');
const selectedTags = ref<string[]>([]);
const selectedPromotions = ref<number[]>([]);
const showPromotionStats = ref(false);
const statsDateFrom = ref(new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0]);
const statsDateTo = ref(new Date().toISOString().split('T')[0]);

// 分页状态
const itemsPerPage = 10;
const currentPage = ref(1);

// 优惠活动统计数据
const promotionStats = ref({
  activeCount: 12,
  activeChange: 33,
  usageCount: 156,
  usageChange: 27,
  conversionRate: 42,
  conversionChange: 15,
  discountAmount: 3820,
  discountChange: 18,
  topPromotions: [
    { id: 2, title: '长住优惠', usedCount: 65, conversionRate: 78, status: 'active' },
    { id: 6, title: '会员专享8.5折', usedCount: 48, conversionRate: 62, status: 'active' },
    { id: 5, title: '满1000减200', usedCount: 42, conversionRate: 53, status: 'active' },
    { id: 1, title: '暑期特惠8折', usedCount: 38, conversionRate: 45, status: 'active' },
    { id: 7, title: '入住即送SPA券', usedCount: 22, conversionRate: 37, status: 'active' }
  ]
});

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

// 切换标签筛选
const toggleTagFilter = (tag: string) => {
  const index = selectedTags.value.indexOf(tag);
  if (index === -1) {
    selectedTags.value.push(tag);
  } else {
    selectedTags.value.splice(index, 1);
  }
};

// 根据筛选条件过滤优惠活动
const filteredPromotions = computed(() => {
  let result = [...promotions.value];
  
  // 关键词搜索
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(p => 
      p.title.toLowerCase().includes(query) || 
      p.description.toLowerCase().includes(query) ||
      p.code.toLowerCase().includes(query)
    );
  }
  
  // 状态筛选
  if (statusFilter.value !== 'all') {
    result = result.filter(p => p.status === statusFilter.value);
  }
  
  // 类型筛选
  if (typeFilter.value !== 'all') {
    result = result.filter(p => p.promotionType === typeFilter.value);
  }
  
  // 范围筛选
  if (scopeFilter.value !== 'all') {
    if (scopeFilter.value === 'all_service') {
      result = result.filter(p => p.applicableScope === 'all');
    } else {
      result = result.filter(p => p.applicableScope === scopeFilter.value);
    }
  }
  
  // 日期筛选
  if (dateFrom.value) {
    const fromDate = new Date(dateFrom.value);
    result = result.filter(p => new Date(p.createdAt) >= fromDate);
  }
  
  if (dateTo.value) {
    const toDate = new Date(dateTo.value);
    toDate.setHours(23, 59, 59, 999); // 设置为当天的结束时间
    result = result.filter(p => new Date(p.createdAt) <= toDate);
  }
  
  // 标签筛选
  if (selectedTags.value.length > 0) {
    result = result.filter(p => {
      if (!p.tags || !p.tags.length) return false;
      return p.tags.some((tag: string) => selectedTags.value.includes(tag));
    });
  }
  
  return result;
});

// 分页逻辑
const totalItems = computed(() => filteredPromotions.value.length);
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage));
const paginatedPromotions = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return filteredPromotions.value.slice(startIndex, endIndex);
});

// 显示的页码逻辑
const displayedPages = computed(() => {
  const total = totalPages.value;
  const current = currentPage.value;
  
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  
  if (current <= 3) {
    return [1, 2, 3, 4, 5];
  }
  
  if (current >= total - 2) {
    return [total - 4, total - 3, total - 2, total - 1, total];
  }
  
  return [current - 2, current - 1, current, current + 1, current + 2];
});

// 全选逻辑
const isAllSelected = computed(() => {
  return paginatedPromotions.value.length > 0 && 
    paginatedPromotions.value.every(p => selectedPromotions.value.includes(p.id));
});

// 切换全选
const toggleSelectAll = () => {
  if (isAllSelected.value) {
    // 取消当前页全选
    paginatedPromotions.value.forEach(p => {
      const index = selectedPromotions.value.indexOf(p.id);
      if (index !== -1) {
        selectedPromotions.value.splice(index, 1);
      }
    });
  } else {
    // 全选当前页
    paginatedPromotions.value.forEach(p => {
      if (!selectedPromotions.value.includes(p.id)) {
        selectedPromotions.value.push(p.id);
      }
    });
  }
};

// 切换单个选择
const toggleSelectPromotion = (id: number) => {
  const index = selectedPromotions.value.indexOf(id);
  if (index === -1) {
    selectedPromotions.value.push(id);
  } else {
    selectedPromotions.value.splice(index, 1);
  }
};

// 清除优惠活动筛选
const clearPromotionFilters = () => {
  statusFilter.value = 'all';
  typeFilter.value = 'all';
  scopeFilter.value = 'all';
  searchQuery.value = '';
  dateFrom.value = '';
  dateTo.value = '';
  selectedTags.value = [];
  currentPage.value = 1;
};

// 搜索防抖
const debounceSearch = debounce(() => {
  currentPage.value = 1;
}, 300);

// 切换数据统计显示
const togglePromotionStats = () => {
  showPromotionStats.value = !showPromotionStats.value;
  if (showPromotionStats.value) {
    generatePromotionStats();
  }
};

// 生成优惠活动统计数据
const generatePromotionStats = () => {
  // 实际项目中这里会调用API获取统计数据
  // 这里使用模拟数据
  promotionStats.value = {
    activeCount: 12,
    activeChange: Math.floor(Math.random() * 50) - 10,
    usageCount: 156,
    usageChange: Math.floor(Math.random() * 50) - 10,
    conversionRate: 42,
    conversionChange: Math.floor(Math.random() * 30) - 5,
    discountAmount: 3820,
    discountChange: Math.floor(Math.random() * 40) - 5,
    topPromotions: [
      { id: 2, title: '长住优惠', usedCount: 65, conversionRate: 78, status: 'active' },
      { id: 6, title: '会员专享8.5折', usedCount: 48, conversionRate: 62, status: 'active' },
      { id: 5, title: '满1000减200', usedCount: 42, conversionRate: 53, status: 'active' },
      { id: 1, title: '暑期特惠8折', usedCount: 38, conversionRate: 45, status: 'active' },
      { id: 7, title: '入住即送SPA券', usedCount: 22, conversionRate: 37, status: 'active' }
    ]
  };
};

// 查看单个活动的统计数据
const viewPromotionStats = (promotion: any) => {
  // 实际项目中这里会打开单个活动的详细统计页面或弹窗
  alert(`${promotion.title} 的详细数据分析功能开发中...`);
};

// 修改页码
const changePage = (page: number) => {
  currentPage.value = page;
};

// 优惠活动批量操作
const bulkFeaturePromotions = () => {
  if (selectedPromotions.value.length === 0) return;
  
  if (confirm(`确定将选中的 ${selectedPromotions.value.length} 个优惠活动设为推荐吗？`)) {
    promotions.value = promotions.value.map(p => {
      if (selectedPromotions.value.includes(p.id)) {
        return { ...p, isFeature: true };
      }
      return p;
    });
    
    saveLocalPromotions(promotions.value);
    selectedPromotions.value = [];
    showSuccessMessage('已成功设置为推荐活动');
  }
};

const bulkUnfeaturePromotions = () => {
  if (selectedPromotions.value.length === 0) return;
  
  if (confirm(`确定将选中的 ${selectedPromotions.value.length} 个优惠活动取消推荐吗？`)) {
    promotions.value = promotions.value.map(p => {
      if (selectedPromotions.value.includes(p.id)) {
        return { ...p, isFeature: false };
      }
      return p;
    });
    
    saveLocalPromotions(promotions.value);
    selectedPromotions.value = [];
    showSuccessMessage('已成功取消推荐活动');
  }
};

const bulkExpirePromotions = () => {
  if (selectedPromotions.value.length === 0) return;
  
  if (confirm(`确定将选中的 ${selectedPromotions.value.length} 个优惠活动设为已结束吗？`)) {
    promotions.value = promotions.value.map(p => {
      if (selectedPromotions.value.includes(p.id)) {
        return { ...p, status: 'expired' };
      }
      return p;
    });
    
    saveLocalPromotions(promotions.value);
    selectedPromotions.value = [];
    showSuccessMessage('已成功设置为已结束');
  }
};

const bulkDeletePromotions = () => {
  if (selectedPromotions.value.length === 0) return;
  
  if (confirm(`确定删除选中的 ${selectedPromotions.value.length} 个优惠活动吗？此操作不可恢复！`)) {
    promotions.value = promotions.value.filter(p => !selectedPromotions.value.includes(p.id));
    
    saveLocalPromotions(promotions.value);
    selectedPromotions.value = [];
    showSuccessMessage('已成功删除选中活动');
  }
};

// 切换单个活动的推荐状态
const toggleFeature = (promotion: any) => {
  const updatedPromotion = { ...promotion, isFeature: !promotion.isFeature };
  
  updatePromotion(promotion.id, updatedPromotion)
    .then(response => {
      if (response.success) {
        const index = promotions.value.findIndex(p => p.id === promotion.id);
        if (index !== -1) {
          promotions.value[index] = updatedPromotion;
        }
        showSuccessMessage(updatedPromotion.isFeature ? '已设为推荐活动' : '已取消推荐');
      } else {
        showErrorMessage(response.message || '操作失败');
      }
    })
    .catch(err => {
      console.error('更新优惠活动失败:', err);
      showErrorMessage('操作失败，请重试');
    });
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

// 获取活动选项卡的名称
const getActiveTabName = () => {
  const tab = tabs.find(t => t.id === activeTab.value);
  return tab ? tab.name : '';
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

// 获取状态样式类
const getStatusClass = (status: string) => {
  return {
    'status-active': status === 'active',
    'status-coming': status === 'coming',
    'status-expired': status === 'expired'
  };
};

// 模态框状态
const showPromotionModal = ref(false);
const showDeleteModal = ref(false);
const isEditing = ref(false);
const savingPromotion = ref(false);
const deletingPromotion = ref(false);
const formError = ref('');
const promotionToDelete = ref<any>(null);
const tagInput = ref('');
const roomOptions = ref([
  { id: 1, name: '豪华单人间' },
  { id: 2, name: '豪华双人间' },
  { id: 3, name: '行政双床房' },
  { id: 4, name: '豪华套房' },
  { id: 5, name: '家庭房' },
  { id: 6, name: '经济单人间' },
]);

// 表单数据
const defaultForm = {
  id: null,
  title: '',
  description: '',
  promotionType: 'percent',
  discount: 20,
  amount: 0,
  minAmount: 0,
  giftDescription: '',
  applicableScope: 'all',
  applicableRooms: [],
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
  code: '',
  status: 'active',
  isFeature: false,
  quota: 0,
  userLimit: 0,
  usedCount: 0,
  userGroup: 'all',
  tags: [],
  createdAt: new Date().toISOString().split('T')[0],
  updatedAt: new Date().toISOString().split('T')[0],
};

const promotionForm = ref({...defaultForm});

// 打开创建优惠活动模态框
const openCreatePromotionModal = () => {
  isEditing.value = false;
  promotionForm.value = {...defaultForm};
  
  // 自动生成优惠码
  const randomCode = generateRandomCode();
  promotionForm.value.code = randomCode;
  
  showPromotionModal.value = true;
};

// 生成随机优惠码
const generateRandomCode = () => {
  const prefix = ['HOTEL', 'FENG', 'LUXURY', 'VIP', 'SAVE', 'SPECIAL'][Math.floor(Math.random() * 6)];
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = prefix;
  for (let i = 0; i < 4; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// 编辑优惠活动
const editPromotion = (promotion: any) => {
  isEditing.value = true;
  
  // 深拷贝以避免直接修改引用
  promotionForm.value = JSON.parse(JSON.stringify(promotion));
  
  // 如果没有applicableRooms属性，初始化为空数组
  if (!promotionForm.value.applicableRooms) {
    promotionForm.value.applicableRooms = [];
  }
  
  // 如果没有tags属性，初始化为空数组
  if (!promotionForm.value.tags) {
    promotionForm.value.tags = [];
  }
  
  showPromotionModal.value = true;
};

// 关闭优惠活动模态框
const closePromotionModal = () => {
  showPromotionModal.value = false;
  formError.value = '';
};

// 添加标签
const addTag = () => {
  if (!tagInput.value.trim()) return;
  
  // 如果标签不存在，添加它
  if (!promotionForm.value.tags.includes(tagInput.value.trim())) {
    promotionForm.value.tags.push(tagInput.value.trim());
  }
  
  tagInput.value = '';
};

// 移除标签
const removeTag = (tag: string) => {
  const index = promotionForm.value.tags.indexOf(tag);
  if (index !== -1) {
    promotionForm.value.tags.splice(index, 1);
  }
};

// 保存优惠活动
const savePromotion = async () => {
  savingPromotion.value = true;
  formError.value = '';
  
  try {
    const now = new Date().toISOString().split('T')[0];
    const formData = { ...promotionForm.value };
    
    // 验证表单字段
    if (formData.promotionType === 'percent' && (formData.discount <= 0 || formData.discount > 100)) {
      formError.value = '折扣率必须在1-100之间';
      savingPromotion.value = false;
      return;
    }
    
    if (formData.promotionType === 'fixed' && formData.amount <= 0) {
      formError.value = '优惠金额必须大于0';
      savingPromotion.value = false;
      return;
    }
    
    if (formData.endDate < formData.startDate) {
      formError.value = '结束日期不能早于开始日期';
      savingPromotion.value = false;
      return;
    }
    
    // 根据优惠类型重置无关字段
    if (formData.promotionType !== 'percent') {
      formData.discount = 0;
    }
    
    if (formData.promotionType !== 'fixed') {
      formData.amount = 0;
      formData.minAmount = 0;
    }
    
    if (formData.promotionType !== 'gift' && formData.promotionType !== 'additional') {
      formData.giftDescription = '';
    }
    
    if (formData.applicableScope !== 'room') {
      formData.applicableRooms = [];
    }
    
    // 更新时间
    formData.updatedAt = now;
    if (!isEditing.value) {
      formData.createdAt = now;
    }
    
    // 调用API保存数据
    let response;
    if (isEditing.value) {
      response = await updatePromotion(formData.id, formData);
    } else {
      response = await createPromotion(formData);
    }
    
    if (response.success) {
      // 更新本地数据
      if (isEditing.value) {
        const index = promotions.value.findIndex(p => p.id === formData.id);
        if (index !== -1) {
          promotions.value[index] = response.data;
        }
      } else {
        promotions.value.push(response.data);
      }
      
      // 关闭模态框
      closePromotionModal();
      showSuccessMessage(isEditing.value ? '优惠活动已更新' : '优惠活动已创建');
    } else {
      formError.value = response.message || '保存失败';
    }
  } catch (err: any) {
    console.error('保存优惠活动失败:', err);
    formError.value = err.message || '保存过程中出现错误';
  } finally {
    savingPromotion.value = false;
  }
};

// 删除优惠活动
const deletePromotion = (promotion: any) => {
  promotionToDelete.value = promotion;
  showDeleteModal.value = true;
};

// 取消删除
const cancelDelete = () => {
  showDeleteModal.value = false;
  promotionToDelete.value = null;
};

// 确认删除
const confirmDelete = async () => {
  if (!promotionToDelete.value) return;
  
  deletingPromotion.value = true;
  
  try {
    const response = await apiDeletePromotion(promotionToDelete.value.id);
    
    if (response.success) {
      // 刷新优惠活动列表
      await fetchPromotions();
      cancelDelete();
    } else {
      error.value = response.message || '删除优惠活动失败';
    }
  } catch (err: any) {
    console.error('删除优惠活动出错:', err);
    error.value = err.message || '删除优惠活动时发生错误';
  } finally {
    deletingPromotion.value = false;
  }
};

// 在组件挂载时获取数据
onMounted(() => {
  fetchPromotions();
});
</script>

<style scoped>
.admin-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.admin-title {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
  text-align: center;
}

.admin-tabs {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
  border-bottom: 1px solid #e0e0e0;
}

.tab-button {
  padding: 12px 20px;
  border: none;
  background-color: transparent;
  font-size: 16px;
  color: #666;
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;
}

.tab-button:hover {
  color: #4caf50;
}

.tab-button.active {
  color: #4caf50;
  font-weight: 500;
}

.tab-button.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 3px;
  background-color: #4caf50;
}

.panel-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.panel-header h2 {
  font-size: 22px;
  font-weight: 500;
  color: #333;
  margin: 0;
}

.panel-actions {
  display: flex;
  align-items: center;
}

.create-btn {
  padding: 10px 16px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.create-btn:hover {
  background-color: #45a049;
}

.filter-options {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
}

.filter-row {
  display: flex;
  gap: 16px;
}

.filter-group {
  display: flex;
  align-items: center;
}

.filter-group label {
  margin-right: 8px;
  font-size: 14px;
  color: #666;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.search-group {
  flex: 1;
}

.search-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.date-filter {
  flex: 1;
}

.date-range {
  display: flex;
  gap: 8px;
}

.date-input {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.tags-filter {
  flex: 1;
}

.tags-container {
  display: flex;
  gap: 8px;
}

.filter-tag {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.filter-tag.selected {
  background-color: #4caf50;
  color: white;
}

.clear-filter-btn {
  padding: 8px 16px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.loading-container, .error-container, .empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #4caf50;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  color: #f44336;
  font-size: 16px;
  margin-bottom: 15px;
}

.retry-button {
  padding: 8px 16px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.empty-container p {
  font-size: 16px;
  color: #777;
}

.promotions-table-container {
  overflow-x: auto;
}

.promotions-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.promotions-table th, 
.promotions-table td {
  padding: 12px 15px;
  border-bottom: 1px solid #e0e0e0;
}

.promotions-table th {
  background-color: #f9f9f9;
  font-weight: 500;
  color: #333;
}

.promotions-table tr:hover {
  background-color: #f5f5f5;
}

.expired-row {
  opacity: 0.7;
}

.status-badge {
  display: inline-block;
  padding: 4px 8px;
  font-size: 12px;
  border-radius: 4px;
  font-weight: 500;
}

.status-active {
  background-color: #e8f5e9;
  color: #4caf50;
}

.status-coming {
  background-color: #e3f2fd;
  color: #2196f3;
}

.status-expired {
  background-color: #f5f5f5;
  color: #9e9e9e;
}

.feature-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  background-color: #f5f5f5;
  color: #9e9e9e;
}

.feature-badge.featured {
  background-color: #fff8e1;
  color: #ffa000;
}

.actions-cell {
  white-space: nowrap;
}

.edit-btn, .delete-btn {
  padding: 5px 10px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  margin-right: 5px;
}

.edit-btn {
  background-color: #2196f3;
  color: white;
}

.delete-btn {
  background-color: #f44336;
  color: white;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  width: 100%;
  max-width: 600px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.delete-modal {
  max-width: 400px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h3 {
  font-size: 18px;
  font-weight: 500;
  color: #333;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #888;
  cursor: pointer;
}

.modal-body {
  padding: 20px;
}

/* 表单样式 */
.promotion-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-row {
  display: flex;
  gap: 16px;
}

.half {
  flex: 1;
}

.checkbox-group {
  flex-direction: row;
  align-items: center;
}

.checkbox-group input {
  margin-right: 8px;
}

label {
  font-size: 14px;
  color: #666;
}

.required {
  color: #f44336;
}

input[type="text"],
input[type="number"],
input[type="date"],
textarea,
select {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-error {
  color: #f44336;
  font-size: 14px;
  margin-top: 5px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 10px;
}

.cancel-btn, .submit-btn, .delete-confirm-btn {
  padding: 10px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
}

.cancel-btn {
  background-color: #f5f5f5;
  color: #666;
}

.submit-btn {
  background-color: #4caf50;
  color: white;
}

.delete-confirm-btn {
  background-color: #f44336;
  color: white;
}

.submit-btn:disabled, .delete-confirm-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.warning-text {
  color: #f44336;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
    gap: 16px;
  }
  
  .admin-tabs {
    flex-wrap: wrap;
  }
  
  .tab-button {
    padding: 10px 15px;
    font-size: 14px;
  }
}

/* 数据统计区域 */
.stats-container {
  background-color: #f9f9f9;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 30px;
}

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.stats-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.refresh-stats {
  padding: 5px 10px;
  background-color: #0F1A3D;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background-color: white;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  position: relative;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 15px;
}

.stat-change {
  position: absolute;
  bottom: 15px;
  right: 15px;
  font-size: 14px;
  font-weight: 500;
}

.stat-change.positive {
  color: #4caf50;
}

.stat-change.negative {
  color: #f44336;
}

.stats-charts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 30px;
}

.chart-container {
  background-color: white;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.chart-container h4 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 16px;
  color: #333;
}

.chart-placeholder {
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 饼图模拟 */
.pie-chart {
  position: relative;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background-color: #f0f0f0;
  overflow: hidden;
}

.pie-slice {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  clip-path: polygon(50% 50%, 50% 0%, calc(50% + var(--percent) * 3.6px) 0%);
  background-color: var(--color);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 12px;
  color: white;
  font-weight: bold;
}

.chart-legend {
  display: flex;
  flex-direction: column;
  margin-left: 20px;
}

.legend-item {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
  font-size: 12px;
}

.legend-color {
  width: 12px;
  height: 12px;
  margin-right: 5px;
  border-radius: 2px;
}

/* 柱状图模拟 */
.bar-chart {
  width: 100%;
  height: 180px;
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
}

.bar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 60px;
}

.bar-value {
  width: 40px;
  height: calc(var(--height) * 1.6px);
  background-color: #2196f3;
  border-radius: 4px 4px 0 0;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 5px;
  color: white;
  font-size: 12px;
  font-weight: bold;
}

.bar-label {
  margin-top: 5px;
  text-align: center;
  font-size: 12px;
  color: #555;
}

/* 统计表格 */
.stats-table-container {
  background-color: white;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.stats-table-container h4 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 16px;
  color: #333;
}

.stats-table {
  width: 100%;
  border-collapse: collapse;
}

.stats-table th,
.stats-table td {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.stats-table th {
  font-weight: 600;
  background-color: #f5f5f5;
}

.stats-table tr:last-child td {
  border-bottom: none;
}

/* 批量操作区域 */
.bulk-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #f0f5ff;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.selection-info {
  font-size: 14px;
  color: #333;
}

.selection-info .count {
  font-weight: 600;
  color: #1976d2;
}

.bulk-buttons {
  display: flex;
  gap: 10px;
}

.bulk-btn {
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.bulk-btn.feature {
  background-color: #4caf50;
  color: white;
}

.bulk-btn.unfeature {
  background-color: #ff9800;
  color: white;
}

.bulk-btn.expire {
  background-color: #607d8b;
  color: white;
}

.bulk-btn.delete {
  background-color: #f44336;
  color: white;
}

.bulk-btn:hover {
  opacity: 0.9;
}

/* 选择框样式 */
.select-checkbox {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.selected-row {
  background-color: #f0f5ff;
}

/* 表格其他样式调整 */
.title-cell {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.type-badge {
  display: inline-block;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.type-percent {
  background-color: #e8f5e9;
  color: #388e3c;
}

.type-fixed {
  background-color: #fff8e1;
  color: #ffa000;
}

.type-gift {
  background-color: #f3e5f5;
  color: #8e24aa;
}

.type-additional {
  background-color: #e3f2fd;
  color: #1976d2;
}

.feature-badge {
  cursor: pointer;
  display: inline-block;
  padding: 2px 10px;
  border-radius: 4px;
  background-color: #f5f5f5;
  color: #9e9e9e;
}

.feature-badge.featured {
  background-color: #fff8e1;
  color: #ffa000;
  font-weight: 500;
}

.stats-btn {
  background-color: #0F1A3D;
  color: white;
}

.stats-btn.small {
  padding: 4px 8px;
  font-size: 12px;
  margin-right: 5px;
}

/* 分页控件 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 30px;
}

.page-btn {
  padding: 8px 15px;
  border: 1px solid #ccc;
  background-color: white;
  border-radius: 4px;
  margin: 0 5px;
  cursor: pointer;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 5px;
}

.page-number {
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #ccc;
  background-color: white;
  border-radius: 4px;
  cursor: pointer;
}

.page-number.active {
  background-color: #0F1A3D;
  color: white;
  border-color: #0F1A3D;
}

/* 响应式布局 */
@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .stats-charts {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .filter-row {
    flex-direction: column;
    gap: 10px;
  }
  
  .filter-group, 
  .search-group, 
  .date-filter,
  .tags-filter {
    width: 100%;
  }
  
  .bulk-actions {
    flex-direction: column;
    gap: 10px;
  }
  
  .promotions-table {
    display: block;
    overflow-x: auto;
  }
  
  .pagination {
    flex-wrap: wrap;
  }
}

.checkbox-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin: 5px 0;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
  color: #555;
  cursor: pointer;
}

.hint-text {
  font-size: 12px;
  color: #888;
  margin-top: 5px;
}

.tags-input-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  min-height: 30px;
}

.tag-item {
  display: flex;
  align-items: center;
  gap: 5px;
  background-color: #f0f0f0;
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 12px;
}

.tag-remove {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  color: #999;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tag-remove:hover {
  color: #f44336;
}
</style> 