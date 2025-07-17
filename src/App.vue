<template>
  <div id="app">
    <div class="app-container">
      <el-card class="hero-card" v-loading="loading">
        <template #header>
          <div class="card-header">
            <div class="date">{{ currentDate }}</div>
            <div class="title">LOLM今日黄历</div>
            <div class="subtitle">搞笑娱乐版</div>
          </div>
        </template>

        <div class="hero-section" v-if="selectedHero">
          <div class="hero-avatar">
            <div class="avatar-container">
              <img 
                v-if="selectedHero.avatar" 
                :src="selectedHero.avatar" 
                :alt="selectedHero.name"
                class="hero-avatar-img"
                @error="handleAvatarError"
                crossorigin="anonymous"
              />
              <div v-else class="avatar-placeholder">⚔️</div>
            </div>
          </div>
          
          <div class="hero-info">
            <h2 class="hero-name">{{ selectedHero.name }}</h2>
            <p class="hero-title">{{ selectedHero.title }}</p>
            <div class="hero-tags">
              <el-tag type="success" size="small" class="hero-tag">
                {{ selectedHero.lane }}
              </el-tag>
              <el-tag 
                v-for="role in selectedHero.roles" 
                :key="role" 
                type="warning" 
                size="small" 
                class="hero-tag"
              >
                {{ role }}
              </el-tag>
            </div>
          </div>

          <el-divider></el-divider>

          <div class="quote-section">
            <el-text type="primary" size="large" tag="p" class="quote-text">
              "{{ selectedHero.introShort || '人在塔在' }}"
            </el-text>
            <el-text type="info" size="small" class="quote-author">
              — {{ selectedHero.name }}
            </el-text>
          </div>

          <el-divider></el-divider>

          <div class="lmao-section">
            <el-text type="warning" size="large" class="lmao-title">
              📅 今日LOLM黄历
            </el-text>
            <div class="lmao-content" v-html="lmaoContent"></div>
          </div>

          <el-divider></el-divider>

          <div class="actions">
            <el-button type="primary" @click="exportCard" :loading="exporting">
              {{ exporting ? '生成中...' : '📱 保存分享' }}
            </el-button>
            <el-button @click="refreshHero">
              🔄 换一换
            </el-button>
          </div>
        </div>

        <div v-else class="empty-state">
          <el-empty description="加载中..." />
        </div>
      </el-card>

      <el-dialog
        v-model="qrDialogVisible"
        title="扫码分享"
        width="300px"
        center
      >
        <div class="qr-dialog">
          <div id="qrCode" class="qr-code"></div>
          <p class="qr-tip">扫码查看今日英雄推荐</p>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import html2canvas from 'html2canvas'
import qrcode from 'qrcode-generator'
import { loadHeroData, loadAlmanacData, loadActivitiesData, generateLmaoContent } from './utils/dataLoader'

const loading = ref(true)
const exporting = ref(false)
const heroes = ref([])
const almanac = ref({})
const activities = ref(null)
const selectedHero = ref(null)
const qrDialogVisible = ref(false)

const currentDate = computed(() => {
  const today = new Date()
  return today.getFullYear() + '年' + (today.getMonth() + 1) + '月' + today.getDate() + '日'
})

const lmaoContent = computed(() => {
  if (!selectedHero.value) return ''
  const todayAlmanac = getTodayAlmanac()
  return generateLmaoContent(todayAlmanac, selectedHero.value, activities.value)
})

function getTodayAlmanac() {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth() + 1
  const day = today.getDate()
  
  try {
    return almanac.value[year]?.[month]?.[day] || null
  } catch (error) {
    return null
  }
}

function selectRandomHero() {
  if (heroes.value.length > 0) {
    const randomIndex = Math.floor(Math.random() * heroes.value.length)
    selectedHero.value = heroes.value[randomIndex]
  }
}

function refreshHero() {
  selectRandomHero()
}

async function loadData() {
  try {
    loading.value = true
    const [heroData, almanacData, activitiesData] = await Promise.all([
      loadHeroData(),
      loadAlmanacData(),
      loadActivitiesData()
    ])
    heroes.value = heroData
    almanac.value = almanacData
    activities.value = activitiesData
    selectRandomHero()
  } catch (error) {
    ElMessage.error('数据加载失败：' + error.message)
  } finally {
    loading.value = false
  }
}

async function exportCard() {
  try {
    exporting.value = true
    
    // 创建专门的导出容器
    const exportContainer = document.createElement('div')
    exportContainer.style.position = 'absolute'
    exportContainer.style.left = '-9999px'
    exportContainer.style.top = '0'
    exportContainer.style.backgroundColor = '#ffffff'
    exportContainer.style.width = '400px'
    exportContainer.style.padding = '20px'
    exportContainer.style.borderRadius = '15px'
    exportContainer.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)'
    exportContainer.style.fontFamily = 'Noto Sans SC, sans-serif'
    
    // 构建导出内容
    exportContainer.innerHTML = `
      <div style="width: 400px; background: #ffffff; padding: 40px 20px; font-family: 'Noto Sans SC', sans-serif;">
        <div style="text-align: center;margin:0 auto;">
          <h1 style="font-size: 28px; color: #333; margin-bottom: 30px; font-weight: 700;">LOLM黄历</h1>
          
          <div style="margin-bottom: 25px;">
            <img 
              src="${selectedHero.value.avatar}" 
              alt="${selectedHero.value.name}"
              style="width: 120px; height: 120px; border-radius: 50%; object-fit: cover; border: 4px solid #667eea;"
              crossorigin="anonymous"
            />
          </div>
          
          <div style="margin-bottom: 20px;">
            <h2 style="font-size: 26px; color: #333; margin: 0 0 8px 0; font-weight: 700;">${selectedHero.value.name}</h2>
            <p style="font-size: 20px; color: #666; margin: 0 0 15px 0;">${selectedHero.value.title}</p>
            <div style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap;">
              <span style="background: #67c23a; color: white; padding: 6px 14px; border-radius: 15px; font-size: 14px; font-weight: 500;">${selectedHero.value.lane}</span>
              ${selectedHero.value.roles.map(role => 
                `<span style="background: #e6a23c; color: white; padding: 6px 14px; border-radius: 15px; font-size: 14px; font-weight: 500;">${role}</span>`
              ).join('')}
            </div>
          </div>
          
          <div style="background: linear-gradient(135deg, #ffeaa7, #fab1a0); padding: 30px; border-radius: 15px; margin: 25px 0;">
            <h3 style="font-size: 22px; color: #2d3436; margin: 0 0 15px 0; font-weight: 700;">📅 今日LOLM黄历</h3>
            <div style="font-size: 16px; line-height: 1.8; color: #2d3436;">${lmaoContent.value}</div>
          </div>
          
          <div style="margin-top: 30px;">
            <div id="export-qr" style="margin: 0 auto 15px;"></div>
            <p style="font-size: 14px; color: #666; margin: 0;">扫码查看更多英雄推荐</p>
          </div>
          
          <div style="margin-top: 20px; font-size: 14px; color: #999;">
            ${new Date().toLocaleDateString('zh-CN')}
          </div>
        </div>
      </div>
    `
    
    document.body.appendChild(exportContainer)
    
    try {
      // 生成二维码
      const qr = qrcode(4, 'L')
      qr.addData(window.location.href)
      qr.make()
      
      const qrDiv = exportContainer.querySelector('#export-qr')
      if (qrDiv) {
        qrDiv.innerHTML = qr.createImgTag(3)
        const qrImg = qrDiv.querySelector('img')
        if (qrImg) {
          qrImg.style.width = '80px'
          qrImg.style.height = '80px'
        }
      }
      
      const canvas = await html2canvas(exportContainer, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: 485,
        height: exportContainer.offsetHeight
      })
      
      const link = document.createElement('a')
      link.download = `LOLM黄历-${new Date().toLocaleDateString()}.png`
      link.href = canvas.toDataURL('image/png', 1.0)
      link.click()
      
      ElMessage.success('卡片已保存！')
    } finally {
      document.body.removeChild(exportContainer)
    }
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败：' + error.message)
  } finally {
    exporting.value = false
  }
}

function generateQR() {
  const qr = qrcode(4, 'L')
  qr.addData(window.location.href)
  qr.make()
  
  const qrDiv = document.getElementById('qrCode')
  if (qrDiv) {
    qrDiv.innerHTML = qr.createImgTag(4)
  }
}

function handleAvatarError(event) {
  console.warn('头像加载失败，使用占位符')
  event.target.style.display = 'none'
  event.target.parentElement.querySelector('.avatar-placeholder').style.display = 'flex'
}

onMounted(async () => {
  await loadData()
})
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  font-family: 'Noto Sans SC', sans-serif;
}

.hero-card {
  width: 100%;
  max-width: 400px;
  border-radius: 15px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  margin: 0 auto;
}

.card-header {
  text-align: center;
  padding: 20px;
  background: linear-gradient(135deg, #ff6b6b, #ffa500);
  color: white;
  border-radius: 20px 20px 0 0;
}

.date {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 5px;
}

.title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 2px;
}

.subtitle {
  font-size: 14px;
  opacity: 0.8;
}

.hero-section {
  padding: 30px;
  text-align: center;
}

.hero-avatar {
  margin-bottom: 20px;
}

.avatar-container {
  position: relative;
  display: inline-block;
}

.hero-avatar-img {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.avatar-placeholder {
  font-size: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 90px;
  height: 90px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 50%;
  color: white;
}

.hero-info {
  margin-bottom: 20px;
}

.hero-name {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin-bottom: 5px;
}

.hero-title {
  font-size: 16px;
  color: #666;
  margin-bottom: 10px;
}

.hero-tags {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
}

.hero-tag {
  font-size: 12px;
  font-weight: 500;
}

.quote-section {
  margin: 20px 0;
}

.quote-text {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 10px;
}

.quote-author {
  font-size: 14px;
}

.lmao-section {
  background: linear-gradient(135deg, #ffeaa7, #fab1a0);
  padding: 20px;
  border-radius: 12px;
  margin: 20px 0;
}

.lmao-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 10px;
  color: #2d3436;
}

.lmao-content {
  font-size: 14px;
  line-height: 1.6;
  color: #2d3436;
}

.actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.empty-state {
  padding: 40px;
}

.qr-dialog {
  text-align: center;
}

.qr-code {
  margin: 0 auto;
}

.qr-tip {
  margin-top: 10px;
  color: #666;
}

@media (max-width: 480px) {
  .hero-card {
    margin: 10px;
  }
  
  .actions {
    flex-direction: column;
  }
}
</style>
