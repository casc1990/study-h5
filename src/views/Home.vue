<template>
  <div class="page">
    <div class="home-header">
      <h1 class="page-title">📚 小学课后强化学习助手</h1>
      <p class="subtitle">上传资料，AI 生成闯关练习</p>
    </div>

    <!-- 今日学习进度 -->
    <div class="card today-progress">
      <div class="progress-header">
        <span class="progress-label">今日学习进度</span>
        <span class="progress-value">{{ todayProgress }}/{{ todayGoal }}关</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: (todayProgress / todayGoal * 100) + '%' }"></div>
      </div>
    </div>

    <!-- 快速入口 -->
    <div class="quick-actions">
      <van-grid :column-num="2" :gutter="12">
        <van-grid-item icon="photograph" text="上传资料" to="/upload" />
        <van-grid-item icon="chart-orders-o" text="学习统计" to="/stats" />
      </van-grid>
    </div>

    <!-- 待完成闯关 -->
    <div class="section">
      <h2 class="section-title">🎯 待完成闯关</h2>
      <div v-if="pendingChallenges.length === 0" class="empty-state">
        <div class="empty-icon">📖</div>
        <p>暂无待完成的闯关</p>
        <p class="empty-hint">上传学习资料，开始今天的练习吧！</p>
      </div>
      <div v-else class="challenge-list">
        <div v-for="item in pendingChallenges" :key="item.id" class="challenge-item card" @click="goChallenge(item.id)">
          <div class="challenge-info">
            <span class="challenge-name">{{ item.name }}</span>
            <span class="badge badge-primary">{{ item.subject }}</span>
          </div>
          <div class="challenge-meta">
            <span class="meta-item">📚 {{ item.questionCount }}题</span>
            <span class="meta-item">⏱️ 约{{ item.estimateTime }}分钟</span>
          </div>
          <van-icon name="arrow" class="arrow-icon" />
        </div>
      </div>
    </div>

    <!-- 已完成记录 -->
    <div class="section">
      <h2 class="section-title">✅ 最近完成</h2>
      <div v-if="completedChallenges.length === 0" class="empty-state small">
        <p>还没有完成记录，开始学习吧！</p>
      </div>
      <div v-else class="completed-list">
        <div v-for="item in completedChallenges" :key="item.id" class="completed-item">
          <span class="completed-name">{{ item.name }}</span>
          <span class="completed-score">{{ item.score }}分</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'

const router = useRouter()

const todayProgress = ref(2)
const todayGoal = ref(5)
const pendingChallenges = ref([
  { id: '1', name: 'Unit 3 What\'s he doing?', subject: '英语', questionCount: 8, estimateTime: 5 },
  { id: '2', name: '分数加减法', subject: '数学', questionCount: 10, estimateTime: 8 }
])
const completedChallenges = ref([
  { id: '3', name: '拼音拼读练习', score: 95 },
  { id: '4', name: '长度单位换算', score: 88 }
])

const goChallenge = (id: string) => {
  router.push(`/challenge/${id}`)
}

onMounted(() => {
  // TODO: 从 D1 加载数据
})
</script>

<style scoped>
.home-header {
  text-align: center;
  padding: 20px 0;
  background: linear-gradient(135deg, #4A90E2, #6DB3F2);
  border-radius: 0 0 24px 24px;
  color: #fff;
  margin-bottom: 16px;
}

.home-header .page-title {
  color: #fff;
  margin-bottom: 8px;
}

.subtitle {
  font-size: 14px;
  opacity: 0.9;
}

.today-progress {
  margin: 0 16px 16px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.progress-label {
  font-weight: 500;
}

.progress-value {
  color: var(--primary);
  font-weight: 600;
}

.section {
  padding: 0 16px;
  margin-bottom: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  background: #fff;
  border-radius: var(--radius);
}

.empty-state.small {
  padding: 20px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.empty-state p {
  color: var(--text-secondary);
}

.empty-hint {
  font-size: 14px;
  margin-top: 8px;
}

.challenge-item {
  display: flex;
  align-items: center;
  padding: 16px;
  cursor: pointer;
}

.challenge-info {
  flex: 1;
}

.challenge-name {
  font-weight: 500;
  display: block;
  margin-bottom: 6px;
}

.challenge-meta {
  display: flex;
  gap: 12px;
}

.meta-item {
  font-size: 13px;
  color: var(--text-secondary);
}

.arrow-icon {
  color: var(--text-secondary);
}

.completed-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #fff;
  border-radius: var(--radius);
  margin-bottom: 8px;
}

.completed-name {
  color: var(--text-secondary);
}

.completed-score {
  font-weight: 600;
  color: var(--success);
}
</style>