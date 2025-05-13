<template>
  <div class="home">
    <LuxuryNavbar />
    
    <!-- 轮播图区域 -->
    <div class="carousel-section">
      <div class="carousel-container">
        <div class="carousel-track" :style="{ transform: `translateX(-${currentSlide * 100}%)` }">
          <div v-for="(slide, index) in carouselSlides" :key="index" class="carousel-slide">
            <div class="slide-content">
              <h2>{{ slide.title }}</h2>
              <p>{{ slide.description }}</p>
              <router-link :to="slide.buttonLink" class="slide-button">{{ slide.buttonText }}</router-link>
            </div>
            <div class="slide-overlay"></div>
            <img :src="slide.imageUrl" :alt="slide.title" class="slide-image">
          </div>
        </div>
        
        <button class="carousel-arrow prev" @click="prevSlide" aria-label="上一张">
          <span>❮</span>
        </button>
        <button class="carousel-arrow next" @click="nextSlide" aria-label="下一张">
          <span>❯</span>
        </button>
        
        <div class="carousel-indicators">
          <button 
            v-for="(_, index) in carouselSlides" 
            :key="index"
            :class="['indicator', { active: currentSlide === index }]"
            @click="goToSlide(index)"
            :aria-label="`转到第${index + 1}张轮播图`"
          ></button>
        </div>
      </div>
    </div>
    
    <!-- 快速导航区 -->
    <div class="quick-nav">
      <div class="container">
        <div class="nav-card" v-for="(item, index) in quickNavItems" :key="index">
          <div class="nav-icon" v-html="item.icon"></div>
          <h3>{{ item.title }}</h3>
          <p>{{ item.description }}</p>
          <router-link :to="item.link" class="nav-button">{{ item.buttonText }}</router-link>
        </div>
      </div>
    </div>
    
    <!-- 精选优惠区 -->
    <div class="featured-promotions" v-if="featuredPromotions.length > 0">
      <div class="container">
        <h2 class="section-title">精选优惠</h2>
        <p class="section-description">享受我们为您精心挑选的专属礼遇</p>
        
        <div class="promotions-grid">
          <div 
            v-for="promotion in featuredPromotions" 
            :key="promotion.id" 
            class="promotion-card"
          >
            <div class="promotion-badge" v-if="promotion.isFeature">推荐</div>
            <div class="promotion-header">
              <h3 class="promotion-title">{{ promotion.title }}</h3>
              <div class="promotion-discount">{{ promotion.discount }}% OFF</div>
            </div>
            <p class="promotion-description">{{ promotion.description }}</p>
            <div class="promotion-date" v-if="promotion.validUntil">
              <span class="calendar-icon">📅</span>
              <span>有效期至: {{ formatDate(promotion.validUntil) }}</span>
            </div>
            <router-link to="/promotions" class="view-more-btn">查看详情</router-link>
          </div>
        </div>
        
        <div class="view-all-container">
          <router-link to="/promotions" class="view-all-btn">
            查看全部优惠
            <span class="arrow-icon">→</span>
          </router-link>
        </div>
      </div>
    </div>
    
    <!-- 酒店设施展示区 -->
    <div class="facilities-section">
      <div class="container">
        <h2 class="section-title">酒店设施</h2>
        <p class="section-description">为您的住宿体验锦上添花</p>
        
        <div class="facilities-grid">
          <div class="facility-card" v-for="(facility, index) in hotelFacilities" :key="index">
            <div class="facility-icon" v-html="facility.icon"></div>
            <h3 class="facility-title">{{ facility.title }}</h3>
            <p class="facility-description">{{ facility.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import LuxuryNavbar from '../components/LuxuryNavbar.vue';
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { getPromotions } from '../utils/api';

// 轮播图数据
const carouselSlides = [
  {
    title: "豪华客房限时特惠",
    description: "享受五星级住宿体验，高达30%的折扣",
    buttonText: "立即预订",
    buttonLink: "/room-booking",
    imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80"
  },
  {
    title: "会员专享礼遇",
    description: "成为我们的会员，享受专属服务与优惠",
    buttonText: "了解更多",
    buttonLink: "/membership",
    imageUrl: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80"
  },
  {
    title: "美食盛宴",
    description: "品味精致美食，满足您的味蕾",
    buttonText: "查看菜单",
    buttonLink: "/dining",
    imageUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80"
  }
];

// 快速导航区数据
const quickNavItems = [
  {
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>',
    title: "房间预订",
    description: "浏览我们的房型并预订",
    link: "/room-booking",
    buttonText: "预订房间"
  },
  {
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>',
    title: "优惠活动",
    description: "探索我们的专属优惠",
    link: "/promotions",
    buttonText: "查看优惠"
  },
  {
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>',
    title: "会员专区",
    description: "加入会员，享受更多礼遇",
    link: "/membership",
    buttonText: "了解更多"
  }
];

// 酒店设施数据
const hotelFacilities = [
  {
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path></svg>',
    title: "豪华泳池",
    description: "室内恒温泳池，全天候开放"
  },
  {
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>',
    title: "SPA中心",
    description: "专业的SPA服务，让您彻底放松"
  },
  {
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>',
    title: "24小时前台",
    description: "随时为您提供贴心服务与帮助"
  },
  {
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25"></path><line x1="8" y1="16" x2="8.01" y2="16"></line><line x1="8" y1="20" x2="8.01" y2="20"></line><line x1="12" y1="18" x2="12.01" y2="18"></line><line x1="12" y1="22" x2="12.01" y2="22"></line><line x1="16" y1="16" x2="16.01" y2="16"></line><line x1="16" y1="20" x2="16.01" y2="20"></line></svg>',
    title: "免费WiFi",
    description: "高速网络覆盖酒店各区域"
  }
];

// 轮播图状态
const currentSlide = ref(0);
const autoplayInterval = ref<number | null>(null);

// 优惠活动
const featuredPromotions = ref<any[]>([]);

// 轮播图控制
const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % carouselSlides.length;
  resetAutoplay();
};

const prevSlide = () => {
  currentSlide.value = (currentSlide.value - 1 + carouselSlides.length) % carouselSlides.length;
  resetAutoplay();
};

const goToSlide = (index: number) => {
  currentSlide.value = index;
  resetAutoplay();
};

// 重置自动播放
const resetAutoplay = () => {
  if (autoplayInterval.value) {
    clearInterval(autoplayInterval.value);
  }
  startAutoplay();
};

// 开始自动播放
const startAutoplay = () => {
  autoplayInterval.value = window.setInterval(() => {
    nextSlide();
  }, 5000) as unknown as number;
};

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// 获取精选优惠活动
const fetchFeaturedPromotions = async () => {
  try {
    const response = await getPromotions('active');
    
    if (response.success) {
      // 只展示最多3个推荐的活动
      featuredPromotions.value = response.data
        .filter((p: any) => p.isFeature)
        .slice(0, 3);
    }
  } catch (error) {
    console.error('获取精选优惠活动失败:', error);
  }
};

onMounted(() => {
  fetchFeaturedPromotions();
  startAutoplay();
});

onBeforeUnmount(() => {
  if (autoplayInterval.value) {
    clearInterval(autoplayInterval.value);
  }
});
</script>

<style scoped>
.home {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding-top: 70px; /* 为固定导航栏留出空间 */
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 轮播图样式 */
.carousel-section {
  position: relative;
  width: 100%;
  height: 600px;
  overflow: hidden;
}

.carousel-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.carousel-track {
  display: flex;
  height: 100%;
  transition: transform 0.5s ease-in-out;
}

.carousel-slide {
  position: relative;
  min-width: 100%;
  height: 100%;
}

.slide-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.slide-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.6));
}

.slide-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: white;
  width: 80%;
  max-width: 800px;
  z-index: 2;
}

.slide-content h2 {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.slide-content p {
  font-size: 1.5rem;
  margin-bottom: 2rem;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
}

.slide-button {
  display: inline-block;
  padding: 15px 30px;
  background-color: #D4AF37;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-size: 1.1rem;
  font-weight: 500;
  transition: background-color 0.3s;
}

.slide-button:hover {
  background-color: #c19d2c;
}

.carousel-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.2);
  border: none;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  transition: background-color 0.3s;
  z-index: 10;
}

.carousel-arrow:hover {
  background: rgba(255, 255, 255, 0.4);
}

.carousel-arrow.prev {
  left: 20px;
}

.carousel-arrow.next {
  right: 20px;
}

.carousel-indicators {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 12px;
  z-index: 10;
}

.indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.5);
  border: none;
  cursor: pointer;
  transition: all 0.3s;
}

.indicator.active {
  background-color: #D4AF37;
  transform: scale(1.2);
}

/* 快速导航区域 */
.quick-nav {
  padding: 60px 0;
  background-color: white;
}

.quick-nav .container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.nav-card {
  background-color: #f8f9fa;
  border-radius: 10px;
  padding: 30px;
  text-align: center;
  transition: transform 0.3s, box-shadow 0.3s;
}

.nav-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.nav-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.nav-icon svg {
  width: 48px;
  height: 48px;
  stroke: #4A90E2;
}

.nav-card h3 {
  font-size: 1.5rem;
  margin-bottom: 10px;
  color: #333;
}

.nav-card p {
  color: #666;
  margin-bottom: 20px;
}

.nav-button {
  display: inline-block;
  padding: 10px 20px;
  background-color: #4A90E2;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.nav-button:hover {
  background-color: #3a7bc8;
}

/* 精选优惠区域 */
.featured-promotions {
  padding: 80px 0;
  background-color: #f5f7fa;
}

.section-title {
  font-size: 2rem;
  color: #333;
  text-align: center;
  margin-bottom: 10px;
}

.section-description {
  text-align: center;
  color: #666;
  margin-bottom: 40px;
  font-size: 1.1rem;
}

.promotions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 30px;
  margin-bottom: 40px;
}

.promotion-card {
  position: relative;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  padding: 30px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  overflow: hidden;
}

.promotion-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.promotion-badge {
  position: absolute;
  top: 0;
  right: 0;
  background-color: #D4AF37;
  color: white;
  padding: 8px 16px;
  font-size: 0.8rem;
  font-weight: bold;
  border-bottom-left-radius: 10px;
}

.promotion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.promotion-title {
  font-size: 1.4rem;
  font-weight: 600;
  color: #333;
  margin: 0;
  flex: 1;
}

.promotion-discount {
  background-color: #4A90E2;
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
}

.promotion-description {
  color: #666;
  margin-bottom: 20px;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.promotion-date {
  display: flex;
  align-items: center;
  color: #888;
  margin-bottom: 20px;
  font-size: 0.9rem;
}

.calendar-icon {
  margin-right: 8px;
}

.view-more-btn {
  display: inline-block;
  padding: 10px 20px;
  background-color: transparent;
  color: #4A90E2;
  border: 1px solid #4A90E2;
  border-radius: 4px;
  text-decoration: none;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.view-more-btn:hover {
  background-color: #4A90E2;
  color: white;
}

.view-all-container {
  text-align: center;
}

.view-all-btn {
  display: inline-flex;
  align-items: center;
  padding: 12px 24px;
  background-color: #4A90E2;
  color: white;
  border: none;
  border-radius: 4px;
  text-decoration: none;
  font-size: 1rem;
  transition: background-color 0.3s ease;
}

.view-all-btn:hover {
  background-color: #3a7bc8;
}

.arrow-icon {
  margin-left: 8px;
  transition: transform 0.3s;
}

.view-all-btn:hover .arrow-icon {
  transform: translateX(5px);
}

/* 酒店设施区域 */
.facilities-section {
  padding: 80px 0;
  background-color: white;
}

.facilities-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 30px;
}

.facility-card {
  text-align: center;
  padding: 30px 20px;
  border-radius: 10px;
  background-color: #f8f9fa;
  transition: transform 0.3s;
}

.facility-card:hover {
  transform: translateY(-5px);
}

.facility-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.facility-icon svg {
  width: 48px;
  height: 48px;
  stroke: #D4AF37;
}

.facility-title {
  font-size: 1.2rem;
  margin-bottom: 10px;
  color: #333;
}

.facility-description {
  color: #666;
  font-size: 0.9rem;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .carousel-section {
    height: 500px;
  }
  
  .slide-content h2 {
    font-size: 2.5rem;
  }
  
  .slide-content p {
    font-size: 1.3rem;
  }
}

@media (max-width: 768px) {
  .carousel-section {
    height: 400px;
  }
  
  .slide-content h2 {
    font-size: 2rem;
  }
  
  .slide-content p {
    font-size: 1.1rem;
  }
  
  .slide-button {
    padding: 12px 24px;
    font-size: 1rem;
  }
  
  .carousel-arrow {
    width: 40px;
    height: 40px;
  }
  
  .nav-card {
    padding: 20px;
  }
  
  .section-title {
    font-size: 1.8rem;
  }
  
  .section-description {
    font-size: 1rem;
  }
  
  .promotion-card {
    padding: 20px;
  }
}

@media (max-width: 480px) {
  .carousel-section {
    height: 350px;
  }
  
  .slide-content h2 {
    font-size: 1.5rem;
  }
  
  .slide-content p {
    font-size: 1rem;
    margin-bottom: 1.5rem;
  }
  
  .slide-button {
    padding: 10px 20px;
    font-size: 0.9rem;
  }
  
  .carousel-arrow {
    width: 35px;
    height: 35px;
    font-size: 1.2rem;
  }
  
  .carousel-indicators {
    bottom: 15px;
  }
  
  .indicator {
    width: 10px;
    height: 10px;
  }
  
  .quick-nav,
  .featured-promotions,
  .facilities-section {
    padding: 40px 0;
  }
  
  .promotions-grid,
  .facilities-grid {
    grid-template-columns: 1fr;
  }
}
</style> 