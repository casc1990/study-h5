<template>
  <div class="page">
    <van-nav-bar title="学习统计" left-arrow @click-left="router.back()" />

    <!-- 总览卡片 -->
    <div class="overview-cards">
      <div class="overview-card">
        <div class="card-value">{{ stats.totalDays }}</div>
        <div class="card-label">累计学习天数</div>
      </div>
      <div class="overview-card">
        <div class="card-value">{{ stats.totalChallenges }}</div>
        <div class="card-label">完成闯关数</div>
      </div>
      <div class="overview-card">
        <div class="card-value">{{ stats.totalQuestions }}</div>
        <div class="card-label">答题总数</div>
      </div>
      <div class="overview-card">
        <div class="card-value">{{ stats.accuracy }}%</div>
        <div class="card-label">正确率</div>
      </div>
    </div>

    <!-- 本周学习日历 -->
    <div class="card">
      <h3 class="section-title">📅 本周学习</h3>
      <div class="week-calendar">
        <div
          v-for="day in weekData"
          :key="day.date"
          class="day-item"
          :class="{ 'completed': day.completed, 'today': day.isToday }"
        >
          <span class="day-name">{{ day.name }}</span>
          <span class="day-status">{{ day.completed ? '✅' : day.isToday ? '🔄' : '○' }}</span>
        </div>
      </div>
    </div>

    <!-- 连续学习 -->
    <div class="card streak-card">
      <div class="streak-info">
        <span class="streak-icon">🔥</span>
        <span class="streak-text">连续学习 <strong>{{ stats.continuousDays }}</strong> 天</span>
      </div>
      <div v-if="stats.continuousDays >= 7" class="streak-badge">
        获得「一周之星」勋章！
      </div>
    </div>

    <!-- 学科分布 -->
    <div class="card">
      <h3 class="section-title">📊 学科分布</h3>
      <div class="subject-bars">
        <div v-for="item in subjectData" :key="item.name" class="subject-item">
          <div class="subject-info">
            <span class="subject-name">{{ item.name }}</span>
            <span class="subject-count">{{ item.count }}题</span>
          </div>
          <div class="progress-bar">
            <div
              class="progress-fill"
              :style="{
                width: (item.count / maxSubjectCount * 100) + '%',
                background: item.color
              }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 学习记录 -->
    <div class="card">
      <h3 class="section-title">📝 最近学习记录</h3>
      <div class="record-list">
        <div v-for="record in learningRecords" :key="record.id" class="record-item">
          <div class="record-info">
            <span class="record-name">{{ record.name }}</span>
            <span class="record-date">{{ record.date }}</span>
          </div>
          <div class="record-score">
            <span class="score-value">{{ record.score }}分</span>
            <span class="score-detail">{{ record.correct }}/{{ record.total }}正确</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const stats = ref({
  totalDays: 12,
  totalChallenges: 8,
  totalQuestions: 156,
  accuracy: 85,
  continuousDays: 5
})

const weekData = ref([
  { name: '周一', date: '05-21', completed: true, isToday: false },
  { name: '周二', date: '05-22', completed: true, isToday: false },
  { name: '周三', date: '05-23', completed: true, isToday: false },
  { name: '周四', date: '05-24', completed: true, isToday: false },
  { name: '周五', date: '05-25', completed: true, isToday: false },
  { name: '周六', date: '05-26', completed: false, isToday: true },
  { name: '周日', date: '05-27', completed: false, isToday: false }
])

const subjectData = ref([
  { name: '英语', count: 68, color: '#4A90E2' },
  { name: '数学', count: 52, color: '#52c41a' },
  { name: '语文', count: 36, color: '#faad14' }
])

const maxSubjectCount = computed(() => {
  return Math.max(...subjectData.value.map(s => s.count))
})

const learningRecords = ref([
  { id: '1', name: 'Unit 3 What\'s he doing?', date: '05-26', score: 90, correct: 7, total: 8 },
  { id: '2', name: '分数加减法', date: '05-25', score: 85, correct: 9, total: 10 },
  { id: '3', name: '拼音拼读练习', date: '05-24', score: 95, correct: 10, total: 10 }
])

onMounted(() => {
  // TODO: 从 D1 加载统计数据
})
</script>

<style scoped>
.overview-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 16px;
  background: linear-gradient(135deg, #4A90E2, #6DB3F2);
  border-radius: 0 0 24px 24px;
  margin-bottom: 16px;
}

.overview-card {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  color: #fff;
}

.card-value {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 4px;
}

.card-label {
  font-size: 12px;
  opacity: 0.9;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--text-secondary);
}

.week-calendar {
  display: flex;
  justify-content: space-between;
}

.day-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.day-name {
  font-size: 12px;
  color: var(--text-secondary);
}

.day-item.today .day-name {
  color: var(--primary);
  font-weight: 600;
}

.day-status {
  font-size: 20px;
}

.streak-card {
  background: linear-gradient(135deg, #ff6b6b, #ff8e53);
  color: #fff;
}

.streak-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.streak-icon {
  font-size: 28px;
}

.streak-text {
  font-size: 16px;
}

.streak-badge {
  margin-top: 8px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  font-size: 13px;
}

.subject-bars {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.subject-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.subject-info {
  display: flex;
  justify-content: space-between;
}

.subject-name {
  font-weight: 500;
}

.subject-count {
  font-size: 13px;
  color: var(--text-secondary);
}

.record-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.record-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 8px;
}

.record-name {
  font-weight: 500;
}

.record-date {
  font-size: 13px;
  color: var(--text-secondary);
  margin-top: 4px;
  display: block;
}

.record-score {
  text-align: right;
}

.score-value {
  font-weight: 700;
  color: var(--success);
  font-size: 18px;
}

.score-detail {
  font-size: 12px;
  color: var(--text-secondary);
  display: block;
}
</style>