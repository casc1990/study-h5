<template>
  <div class="page">
    <van-nav-bar title="知识详情" left-arrow @click-left="router.back()" />

    <div class="card">
      <h2 class="challenge-name">{{ challengeInfo.name }}</h2>
      <div class="meta-tags">
        <span class="badge badge-primary">{{ challengeInfo.subject }}</span>
        <span class="badge badge-primary">{{ challengeInfo.grade }}年级</span>
      </div>
    </div>

    <div class="card">
      <h3 class="section-title">📚 知识点</h3>
      <div class="knowledge-list">
        <div v-for="point in challengeInfo.knowledgePoints" :key="point" class="knowledge-item">
          {{ point }}
        </div>
      </div>
    </div>

    <div class="card">
      <h3 class="section-title">📋 闯关规则</h3>
      <ul class="rules-list">
        <li>共 {{ challengeInfo.questionCount }} 道题</li>
        <li>每题 {{ challengeInfo.scorePerQuestion }} 分</li>
        <li>答对加分，答错不扣分</li>
        <li>连续答对有连击奖励</li>
      </ul>
    </div>

    <div class="action-area">
      <van-button type="primary" block size="large" @click="startChallenge">
        开始闯关
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'

const router = useRouter()
const route = useRoute()

const challengeInfo = ref({
  name: 'Unit 3 What\'s he doing?',
  subject: '英语',
  grade: '3',
  knowledgePoints: ['现在进行时', '现在进行时疑问句', '动词-ing形式'],
  questionCount: 8,
  scorePerQuestion: 10
})

const startChallenge = () => {
  router.push(`/challenge/${route.params.id}`)
}

onMounted(() => {
  const id = route.params.id
  if (id) {
    // TODO: 从 API 加载闯关详情
    console.log('加载闯关:', id)
  }
})
</script>

<style scoped>
.challenge-name {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
}

.meta-tags {
  display: flex;
  gap: 8px;
}

.section-title {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.knowledge-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.knowledge-item {
  padding: 10px 14px;
  background: rgba(74, 144, 226, 0.08);
  border-radius: 8px;
  color: var(--primary);
}

.rules-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rules-list li {
  padding-left: 20px;
  position: relative;
}

.rules-list li::before {
  content: '•';
  position: absolute;
  left: 6px;
  color: var(--primary);
}

.action-area {
  padding: 16px;
  margin-top: 20px;
}
</style>