<template>
  <div class="room-booking">
    <LuxuryNavbar />
    
    <div class="booking-content">
      <!-- 搜索筛选区 -->
      <div class="search-filter-section">
        <div class="container">
          <div class="search-container">
            <h1 class="section-title">房间预订</h1>
            
            <div class="search-form">
              <div class="date-picker-group">
                <div class="form-group">
                  <label for="check-in">入住日期</label>
                  <input 
                    type="date" 
                    id="check-in" 
                    class="form-control" 
                    v-model="filters.checkIn"
                    :min="todayFormatted"
                  >
                </div>
                
                <div class="form-group">
                  <label for="check-out">退房日期</label>
                  <input 
                    type="date" 
                    id="check-out" 
                    class="form-control" 
                    v-model="filters.checkOut"
                    :min="minCheckoutDate"
                  >
                </div>
              </div>
              
              <div class="form-group">
                <label for="guests">入住人数</label>
                <select id="guests" class="form-control" v-model="filters.capacity">
                  <option value="1">1 人</option>
                  <option value="2">2 人</option>
                  <option value="3">3 人</option>
                  <option value="4">4 人及以上</option>
                </select>
              </div>
              
              <button class="search-btn" @click="searchRooms">
                <span class="search-icon">🔍</span>
                搜索
              </button>
            </div>
            
            <div class="filter-options">
              <div class="filter-group">
                <label class="filter-label">房型</label>
                <div class="checkbox-group">
                  <label class="checkbox-container" v-for="type in roomTypes" :key="type">
                    <input 
                      type="checkbox" 
                      :value="type" 
                      v-model="filters.roomType"
                      @change="applyFilters"
                    >
                    <span class="checkmark"></span>
                    <span class="checkbox-text">{{ type }}</span>
                  </label>
                </div>
              </div>
              
              <div class="filter-group">
                <label class="filter-label">价格区间</label>
                <div class="price-range">
                  <div class="price-slider">
                    <input 
                      type="range" 
                      id="price-min" 
                      v-model.number="filters.minPrice" 
                      min="0" 
                      max="1000" 
                      step="50"
                      @input="applyFilters"
                    >
                    <input 
                      type="range" 
                      id="price-max" 
                      v-model.number="filters.maxPrice" 
                      min="0" 
                      max="1000" 
                      step="50"
                      @input="applyFilters"
                    >
                  </div>
                  <div class="price-values">
                    <span>¥{{ filters.minPrice }}</span>
                    <span>¥{{ filters.maxPrice }}</span>
                  </div>
                </div>
              </div>
              
              <div class="filter-group">
                <label class="filter-label">其他</label>
                <div class="checkbox-group">
                  <label class="checkbox-container">
                    <input 
                      type="checkbox" 
                      v-model="filters.hasBreakfast"
                      @change="applyFilters"
                    >
                    <span class="checkmark"></span>
                    <span class="checkbox-text">含早餐</span>
                  </label>
                  
                  <label class="checkbox-container">
                    <input 
                      type="checkbox" 
                      v-model="filters.isPromotion"
                      @change="applyFilters"
                    >
                    <span class="checkmark"></span>
                    <span class="checkbox-text">特惠房型</span>
                  </label>
                </div>
              </div>
              
              <div class="filter-actions">
                <button class="clear-btn" @click="clearFilters">清除筛选</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="container">
        <!-- 视图切换 -->
        <div class="view-toggle" v-if="rooms.length > 0 && !loading">
          <button 
            :class="['toggle-btn', { active: viewMode === 'grid' }]" 
            @click="viewMode = 'grid'"
          >
            <span class="toggle-icon">📋</span> 列表视图
          </button>
          <button 
            :class="['toggle-btn', { active: viewMode === 'map' }]" 
            @click="viewMode = 'map'"
          >
            <span class="toggle-icon">🗺️</span> 地图视图
          </button>
        </div>
          
        <!-- 内容加载提示 -->
        <div v-if="loading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>正在加载房间信息...</p>
        </div>
        
        <!-- 房间展示区(列表) -->
        <div v-else-if="rooms.length > 0 && viewMode === 'grid'" class="room-display-section">
          <div class="result-summary">
            找到 {{ rooms.length }} 个符合条件的房间
          </div>
          
          <div class="room-grid">
            <div v-for="room in rooms" :key="room.id" class="room-card">
              <div class="room-image">
                <img :src="room.images[0]" :alt="room.name">
                <div v-if="room.discount > 0" class="discount-badge">
                  {{ room.discount }}% OFF
                </div>
              </div>
              
              <div class="room-content">
                <h3 class="room-title">{{ room.name }}</h3>
                
                <div class="room-features">
                  <div class="feature-item">
                    <span class="feature-icon">🛏️</span>
                    <span>{{ room.bedType }}</span>
                  </div>
                  <div class="feature-item">
                    <span class="feature-icon">👤</span>
                    <span>{{ room.capacity }}人</span>
                  </div>
                  <div class="feature-item">
                    <span class="feature-icon">📏</span>
                    <span>{{ room.area }}㎡</span>
                  </div>
                </div>
                
                <div class="room-facilities">
                  <span v-for="(facility, index) in room.facilities.slice(0, 4)" :key="index" class="facility-tag">
                    {{ facility }}
                  </span>
                  <span v-if="room.facilities.length > 4" class="facility-tag more">
                    +{{ room.facilities.length - 4 }}
                  </span>
                </div>
                
                <div class="room-footer">
                  <div class="price-info">
                    <div v-if="room.discount > 0" class="original-price">
                      ¥{{ room.price }}
                    </div>
                    <div class="current-price">
                      ¥{{ calculateDiscountedPrice(room) }}
                    </div>
                    <div class="price-unit">/晚</div>
                  </div>
                  
                  <div class="room-actions">
                    <button class="detail-btn" @click="viewRoomDetail(room.id)">
                      查看详情
                    </button>
                    <button class="book-btn" @click="bookRoom(room.id)">
                      立即预订
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 地图展示区 -->
        <div v-else-if="rooms.length > 0 && viewMode === 'map'" class="map-display-section">
          <div class="map-container">
            <div class="hotel-map">
              <div class="map-background">
                <div 
                  v-for="room in rooms" 
                  :key="room.id" 
                  class="room-marker" 
                  :class="{ 'highlight': selectedRoomId === room.id }"
                  :style="{ left: `${room.position.x}px`, top: `${room.position.y}px` }" 
                  @click="selectRoomOnMap(room.id)"
                >
                  <div class="marker-content">{{ room.id }}</div>
                  <div class="marker-tooltip">
                    <div class="tooltip-title">{{ room.name }}</div>
                    <div class="tooltip-price">¥{{ calculateDiscountedPrice(room) }}/晚</div>
                  </div>
                </div>
                
                <!-- 酒店地图布局指示 -->
                <div class="map-layout">
                  <div class="elevator">电梯</div>
                  <div class="stairs">楼梯</div>
                  <div class="restaurant">餐厅</div>
                  <div class="lobby">大堂</div>
                </div>
              </div>
              
              <div class="map-legend">
                <div class="legend-item">
                  <div class="legend-color legend-room"></div>
                  <div class="legend-text">房间</div>
                </div>
                <div class="legend-item">
                  <div class="legend-color legend-facilities"></div>
                  <div class="legend-text">公共设施</div>
                </div>
              </div>
              
              <div class="floor-selector">
                <button 
                  v-for="floor in [2, 3, 5, 6, 8, 10]" 
                  :key="floor"
                  :class="['floor-btn', { active: currentFloor === floor }]"
                  @click="currentFloor = floor"
                >
                  {{ floor }}层
                </button>
              </div>
            </div>
            
            <!-- 地图右侧选中的房间信息 -->
            <div class="map-room-detail" v-if="selectedRoom">
              <div class="detail-image">
                <img :src="selectedRoom.images[0]" :alt="selectedRoom.name">
                <div v-if="selectedRoom.discount > 0" class="discount-badge">
                  {{ selectedRoom.discount }}% OFF
                </div>
              </div>
              
              <div class="detail-content">
                <h3 class="detail-title">{{ selectedRoom.name }}</h3>
                
                <div class="detail-features">
                  <div class="feature-item">
                    <span class="feature-icon">🛏️</span>
                    <span>{{ selectedRoom.bedType }}</span>
                  </div>
                  <div class="feature-item">
                    <span class="feature-icon">👤</span>
                    <span>{{ selectedRoom.capacity }}人</span>
                  </div>
                  <div class="feature-item">
                    <span class="feature-icon">📏</span>
                    <span>{{ selectedRoom.area }}㎡</span>
                  </div>
                </div>
                
                <div class="detail-description">
                  {{ selectedRoom.description }}
                </div>
                
                <div class="detail-facilities">
                  <span v-for="(facility, index) in selectedRoom.facilities.slice(0, 8)" :key="index" class="facility-tag">
                    {{ facility }}
                  </span>
                </div>
                
                <div class="detail-footer">
                  <div class="price-info">
                    <div v-if="selectedRoom.discount > 0" class="original-price">
                      ¥{{ selectedRoom.price }}
                    </div>
                    <div class="current-price">
                      ¥{{ calculateDiscountedPrice(selectedRoom) }}
                    </div>
                    <div class="price-unit">/晚</div>
                  </div>
                  
                  <div class="detail-actions">
                    <button class="book-btn" @click="bookRoom(selectedRoom.id)">
                      立即预订
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 右侧无选中房间时显示 -->
            <div class="map-tip" v-else>
              <div class="tip-icon">👈</div>
              <h3>请点击地图上的房间</h3>
              <p>查看房间的详细信息和预订选项</p>
            </div>
          </div>
        </div>
        
        <!-- 无结果提示 -->
        <div v-else-if="!loading" class="no-results">
          <div class="no-results-icon">🔍</div>
          <h3>未找到符合条件的房间</h3>
          <p>请尝试调整筛选条件后重新搜索</p>
          <button class="clear-btn" @click="clearFilters">清除所有筛选</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import LuxuryNavbar from '../components/LuxuryNavbar.vue';
import { ref, computed, onMounted, watch } from 'vue';
import { getRooms, getRoomDetail } from '../utils/api';

// 房间类型列表
const roomTypes = ['单人间', '双人间', '套房', '家庭房'];

// 加载状态
const loading = ref(false);

// 房间列表
const rooms = ref<any[]>([]);

// 视图模式：grid(列表) 或 map(地图)
const viewMode = ref('grid');

// 地图相关状态
const currentFloor = ref(5); // 默认楼层
const selectedRoomId = ref<number | null>(null);
const selectedRoom = ref<any>(null);

// 监听楼层变化，筛选房间
watch(currentFloor, () => {
  // 移除选中状态
  selectedRoomId.value = null;
  selectedRoom.value = null;
});

// 监听选中的房间ID变化
watch(selectedRoomId, async (newId) => {
  if (newId) {
    const room = rooms.value.find(r => r.id === newId);
    if (room) {
      selectedRoom.value = room;
    }
  } else {
    selectedRoom.value = null;
  }
});

// 今天的日期（格式化为YYYY-MM-DD）
const todayFormatted = computed(() => {
  const today = new Date();
  return formatDate(today);
});

// 最小退房日期（入住日期后一天）
const minCheckoutDate = computed(() => {
  if (!filters.value.checkIn) return todayFormatted.value;
  
  const checkInDate = new Date(filters.value.checkIn);
  const nextDay = new Date(checkInDate);
  nextDay.setDate(nextDay.getDate() + 1);
  return formatDate(nextDay);
});

// 格式化日期为YYYY-MM-DD
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 设置默认筛选条件
const defaultFilters = {
  checkIn: todayFormatted.value,
  checkOut: minCheckoutDate.value,
  capacity: 1,
  roomType: [],
  minPrice: 0,
  maxPrice: 1000,
  hasBreakfast: false,
  isPromotion: false
};

// 筛选条件
const filters = ref({ ...defaultFilters });

// 搜索房间
const searchRooms = async () => {
  loading.value = true;
  selectedRoomId.value = null;
  selectedRoom.value = null;
  
  // 检查localStorage中是否存在房间数据
  try {
    const localRooms = localStorage.getItem('mock_rooms');
    console.log('检查localStorage是否有房间数据:', localRooms ? true : false);
    if (!localRooms) {
      console.log('本地存储中没有房间数据，初始化模拟数据');
      // 强制初始化模拟数据
      const mockData = [
        {
          id: 1,
          name: '测试房间',
          price: 100,
          discount: 0,
          roomType: '单人间',
          bedType: '单人床',
          area: 20,
          capacity: 1,
          hasBreakfast: true,
          hasWindow: true,
          description: '测试房间描述',
          facilities: ['WiFi', '电视'],
          images: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'],
          floor: 1,
          position: { x: 10, y: 10 },
          available: true,
          isPromotion: false
        }
      ];
      localStorage.setItem('mock_rooms', JSON.stringify(mockData));
    }
  } catch (e) {
    console.error('检查localStorage失败:', e);
  }
  
  try {
    const response = await getRooms(filters.value);
    
    if (response.success) {
      rooms.value = response.data;
    } else {
      console.error('获取房间失败:', response.message);
      rooms.value = [];
    }
  } catch (error) {
    console.error('搜索房间失败:', error);
    rooms.value = [];
  } finally {
    loading.value = false;
  }
};

// 计算折扣后价格
const calculateDiscountedPrice = (room: any) => {
  if (room.discount > 0) {
    return Math.round(room.price * (1 - room.discount / 100));
  }
  return room.price;
};

// 查看房间详情
const viewRoomDetail = (roomId: number) => {
  // 这里可以使用路由导航到详情页，或者显示详情弹窗
  alert(`查看房间ID: ${roomId} 的详情`);
};

// 预订房间
const bookRoom = (roomId: number) => {
  // 这里可以导航到预订流程页面
  alert(`预订房间ID: ${roomId}`);
};

// 在地图上选择房间
const selectRoomOnMap = (roomId: number) => {
  selectedRoomId.value = roomId;
};

// 应用筛选
const applyFilters = () => {
  searchRooms();
};

// 清除筛选条件
const clearFilters = () => {
  filters.value = { ...defaultFilters };
  searchRooms();
};

// 页面加载时获取房间数据
onMounted(() => {
  searchRooms();
});
</script>

<style scoped>
.room-booking {
  min-height: 100vh;
  background-color: var(--background-color);
  padding-top: 70px; /* 为固定导航栏留出空间 */
}

.booking-content {
  width: 100%;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.section-title {
  font-size: 1.8rem;
  color: var(--text-color);
  margin-bottom: 1.5rem;
  font-weight: 600;
}

/* 搜索筛选区样式 */
.search-filter-section {
  background-color: white;
  padding: 30px 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  margin-bottom: 30px;
}

.search-container {
  width: 100%;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 25px;
  align-items: flex-end;
}

.date-picker-group {
  display: flex;
  gap: 15px;
  flex: 1;
}

.form-group {
  flex: 1;
  min-width: 200px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--text-color);
}

.form-control {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: var(--border-radius);
  background-color: white;
  color: var(--text-color);
  font-size: 1rem;
}

.form-control:focus {
  border-color: var(--primary-color);
  outline: none;
  box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
}

.search-btn {
  padding: 12px 25px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 44px;
}

.search-btn:hover {
  background-color: #3a7bc8;
}

.search-icon {
  margin-right: 8px;
}

/* 筛选选项样式 */
.filter-options {
  display: flex;
  flex-wrap: wrap;
  gap: 30px;
  margin-top: 20px;
}

.filter-group {
  min-width: 200px;
}

.filter-label {
  display: block;
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--text-color);
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.checkbox-container {
  display: flex;
  align-items: center;
  position: relative;
  padding-left: 30px;
  cursor: pointer;
  user-select: none;
}

.checkbox-container input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkmark {
  position: absolute;
  left: 0;
  height: 20px;
  width: 20px;
  background-color: #eee;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.checkbox-container:hover input ~ .checkmark {
  background-color: #ccc;
}

.checkbox-container input:checked ~ .checkmark {
  background-color: var(--primary-color);
}

.checkmark:after {
  content: "";
  position: absolute;
  display: none;
}

.checkbox-container input:checked ~ .checkmark:after {
  display: block;
}

.checkbox-container .checkmark:after {
  left: 7px;
  top: 3px;
  width: 6px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.checkbox-text {
  font-size: 0.95rem;
  color: var(--text-light);
}

/* 价格滑块样式 */
.price-range {
  width: 100%;
  margin-top: 10px;
}

.price-slider {
  position: relative;
  height: 30px;
}

.price-slider input[type="range"] {
  position: absolute;
  width: 100%;
  height: 5px;
  background: none;
  pointer-events: none;
  outline: none;
  -webkit-appearance: none;
}

.price-slider input[type="range"]::-webkit-slider-thumb {
  pointer-events: auto;
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--primary-color);
  cursor: pointer;
  margin-top: -6px;
}

.price-values {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  color: var(--text-light);
  font-size: 0.9rem;
}

.filter-actions {
  margin-top: 20px;
}

.clear-btn {
  padding: 8px 15px;
  background-color: transparent;
  color: var(--text-light);
  border: 1px solid #ddd;
  border-radius: var(--border-radius);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s;
}

.clear-btn:hover {
  background-color: #f5f5f5;
  color: var(--text-color);
}

/* 加载指示器样式 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px 0;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(74, 144, 226, 0.3);
  border-radius: 50%;
  border-top: 4px solid var(--primary-color);
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 响应式样式 */
@media (max-width: 768px) {
  .search-form {
    flex-direction: column;
  }
  
  .date-picker-group {
    flex-direction: column;
  }
  
  .filter-options {
    flex-direction: column;
    gap: 20px;
  }
  
  .filter-group {
    width: 100%;
  }
}

/* 房间展示区样式 */
.room-display-section {
  margin-bottom: 40px;
}

.result-summary {
  margin-bottom: 20px;
  color: var(--text-light);
  font-size: 0.95rem;
}

.room-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 25px;
}

.room-card {
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
}

.room-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
}

.room-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.room-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}

.room-card:hover .room-image img {
  transform: scale(1.05);
}

.discount-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: var(--secondary-color);
  color: white;
  padding: 5px 10px;
  font-size: 0.8rem;
  font-weight: 600;
  border-radius: 20px;
}

.room-content {
  padding: 20px;
}

.room-title {
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 15px;
  color: var(--text-color);
}

.room-features {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 5px;
  color: var(--text-light);
  font-size: 0.9rem;
}

.feature-icon {
  font-size: 1.1rem;
}

.room-facilities {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.facility-tag {
  background-color: #f0f4f8;
  color: var(--text-light);
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
}

.facility-tag.more {
  background-color: #e1e6eb;
}

.room-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #eee;
  padding-top: 15px;
}

.price-info {
  display: flex;
  align-items: baseline;
}

.original-price {
  color: var(--text-light);
  font-size: 0.9rem;
  text-decoration: line-through;
  margin-right: 8px;
}

.current-price {
  color: var(--primary-color);
  font-size: 1.5rem;
  font-weight: 700;
}

.price-unit {
  color: var(--text-light);
  font-size: 0.9rem;
  margin-left: 2px;
}

.room-actions {
  display: flex;
  gap: 10px;
}

.detail-btn, .book-btn {
  padding: 8px 15px;
  border-radius: var(--border-radius);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.detail-btn {
  background-color: transparent;
  color: var(--primary-color);
  border: 1px solid var(--primary-color);
}

.detail-btn:hover {
  background-color: rgba(74, 144, 226, 0.1);
}

.book-btn {
  background-color: var(--secondary-color);
  color: white;
  border: none;
}

.book-btn:hover {
  background-color: #c19d2c;
}

/* 无结果提示样式 */
.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  text-align: center;
}

.no-results-icon {
  font-size: 3rem;
  margin-bottom: 20px;
  opacity: 0.5;
}

.no-results h3 {
  font-size: 1.3rem;
  color: var(--text-color);
  margin-bottom: 10px;
}

.no-results p {
  color: var(--text-light);
  margin-bottom: 20px;
}

/* 响应式样式补充 */
@media (max-width: 768px) {
  .room-grid {
    grid-template-columns: 1fr;
  }
  
  .room-footer {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }
  
  .room-actions {
    width: 100%;
    justify-content: space-between;
  }
}

/* 视图切换按钮 */
.view-toggle {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.toggle-btn {
  display: flex;
  align-items: center;
  padding: 8px 15px;
  background-color: white;
  border: 1px solid #ddd;
  color: var(--text-light);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s;
}

.toggle-btn:first-child {
  border-radius: var(--border-radius) 0 0 var(--border-radius);
}

.toggle-btn:last-child {
  border-radius: 0 var(--border-radius) var(--border-radius) 0;
}

.toggle-btn.active {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.toggle-icon {
  margin-right: 5px;
}

/* 地图展示区样式 */
.map-display-section {
  margin-bottom: 40px;
}

.map-container {
  display: flex;
  gap: 30px;
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
  padding: 20px;
  min-height: 600px;
}

.hotel-map {
  flex: 7;
  position: relative;
}

.map-background {
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 8px;
  height: 500px;
  position: relative;
  overflow: hidden;
}

.room-marker {
  position: absolute;
  width: 30px;
  height: 30px;
  background-color: var(--primary-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  z-index: 10;
}

.room-marker:hover, .room-marker.highlight {
  transform: scale(1.2);
  background-color: var(--secondary-color);
  z-index: 20;
}

.marker-content {
  font-size: 0.8rem;
}

.marker-tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background-color: white;
  padding: 8px 12px;
  border-radius: 6px;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
  min-width: 120px;
  text-align: center;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s;
  pointer-events: none;
  margin-bottom: 8px;
}

.marker-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-width: 6px;
  border-style: solid;
  border-color: white transparent transparent transparent;
}

.room-marker:hover .marker-tooltip {
  opacity: 1;
  visibility: visible;
}

.tooltip-title {
  color: var(--text-color);
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 4px;
}

.tooltip-price {
  color: var(--primary-color);
  font-size: 0.85rem;
  font-weight: 600;
}

.map-layout {
  position: absolute;
}

.map-layout div {
  position: absolute;
  padding: 10px;
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  color: #666;
  font-size: 0.8rem;
  text-align: center;
}

.elevator {
  top: 200px;
  left: 350px;
  width: 60px;
  height: 60px;
}

.stairs {
  top: 300px;
  left: 350px;
  width: 60px;
  height: 60px;
}

.restaurant {
  top: 150px;
  left: 450px;
  width: 100px;
  height: 80px;
}

.lobby {
  top: 300px;
  left: 450px;
  width: 120px;
  height: 100px;
}

.map-legend {
  display: flex;
  gap: 20px;
  margin-top: 15px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
}

.legend-room {
  background-color: var(--primary-color);
}

.legend-facilities {
  background-color: rgba(0, 0, 0, 0.1);
}

.legend-text {
  color: var(--text-light);
  font-size: 0.9rem;
}

.floor-selector {
  position: absolute;
  right: 20px;
  top: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 10;
}

.floor-btn {
  padding: 8px 12px;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s;
}

.floor-btn.active {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

/* 地图右侧房间详情 */
.map-room-detail {
  flex: 5;
  display: flex;
  flex-direction: column;
}

.detail-image {
  position: relative;
  height: 200px;
  overflow: hidden;
  border-radius: 8px;
  margin-bottom: 20px;
}

.detail-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.detail-title {
  font-size: 1.5rem;
  margin-bottom: 15px;
  color: var(--text-color);
}

.detail-features {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
}

.detail-description {
  color: var(--text-light);
  margin-bottom: 20px;
  line-height: 1.6;
}

.detail-facilities {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.detail-footer {
  margin-top: auto;
  border-top: 1px solid #eee;
  padding-top: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-actions {
  display: flex;
  gap: 10px;
}

/* 无选中房间提示 */
.map-tip {
  flex: 5;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: var(--text-light);
}

.tip-icon {
  font-size: 3rem;
  margin-bottom: 20px;
  opacity: 0.5;
}

.map-tip h3 {
  font-size: 1.3rem;
  color: var(--text-color);
  margin-bottom: 10px;
}

.map-tip p {
  color: var(--text-light);
}

/* 响应式样式补充 */
@media (max-width: 992px) {
  .map-container {
    flex-direction: column;
  }
  
  .map-room-detail,
  .map-tip {
    margin-top: 20px;
  }
}
</style>