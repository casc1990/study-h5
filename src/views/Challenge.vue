<template>
  <div class="page challenge-page">
    <van-nav-bar
      :title="challengeName"
      left-arrow
      @click-left="router.back()"
    />

    <!-- 知识点概览 -->
    <div class="card knowledge-overview">
      <h3 class="overview-title">📚 本关知识点</h3>
      <div class="knowledge-tags">
        <span v-for="k in knowledgePoints" :key="k" class="knowledge-tag">
          {{ k }}
        </span>
      </div>
    </div>

    <!-- 闯关进度 -->
    <div class="card progress-overview">
      <div class="progress-info">
        <span>闯关进度</span>
        <span class="progress-num">{{ currentQuestion }}/{{ totalQuestions }}</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: (currentQuestion / totalQuestions * 100) + '%' }"></div>
      </div>
      <div class="score-info">
        <span>当前得分: <strong>{{ score }}分</strong></span>
        <span class="streak" v-if="streak > 1">🔥 连击 {{ streak }}</span>
      </div>
    </div>

    <!-- 题目区域 -->
    <div class="card question-card">
      <div class="question-header">
        <span class="question-type">{{ currentQuestionData.type }}</span>
        <span class="question-score">{{ currentQuestionData.score }}分</span>
      </div>

      <div class="question-content">
        <p class="question-text">{{ currentQuestionData.question }}</p>
      </div>

      <!-- 选择题选项 -->
      <div v-if="currentQuestionData.type === '选择题'" class="options-list">
        <div
          v-for="(option, index) in currentQuestionData.options"
          :key="index"
          class="option-item"
          :class="{
            'selected': selectedAnswer === option.key,
            'correct': showResult && option.key === currentQuestionData.answer,
            'wrong': showResult && selectedAnswer === option.key && option.key !== currentQuestionData.answer
          }"
          @click="!showResult && selectAnswer(option.key)"
        >
          <span class="option-key">{{ option.key }}</span>
          <span class="option-text">{{ option.text }}</span>
        </div>
      </div>

      <!-- 填空题 -->
      <div v-else-if="currentQuestionData.type === '填空题'" class="fill-blank">
        <van-field
          v-model="fillAnswer"
          placeholder="请输入答案"
          :disabled="showResult"
          @keyup.enter="submitAnswer"
        />
      </div>

      <!-- 结果反馈 -->
      <div v-if="showResult" class="result-feedback" :class="isCorrect ? 'correct' : 'wrong'">
        <div class="feedback-icon">{{ isCorrect ? '✅' : '❌' }}</div>
        <div class="feedback-text">
          <p class="feedback-title">{{ isCorrect ? '回答正确！' : '回答错误' }}</p>
          <p v-if="!isCorrect" class="feedback-answer">正确答案：{{ currentQuestionData.answer }}</p>
          <p v-if="currentQuestionData.explanation" class="feedback-explain">
            {{ currentQuestionData.explanation }}
          </p>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="action-area">
      <van-button
        v-if="!showResult"
        type="primary"
        block
        :disabled="!hasAnswer"
        @click="submitAnswer"
      >
        确认答案
      </van-button>
      <van-button
        v-else
        type="primary"
        block
        @click="nextQuestion"
      >
        {{ isLastQuestion ? '查看结果' : '下一题' }}
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast, showSuccessToast } from 'vant'

const router = useRouter()
const route = useRoute()

const challengeName = ref('Unit 3 What\'s he doing?')
const currentQuestion = ref(1)
const totalQuestions = ref(8)
const score = ref(80)
const streak = ref(2)
const selectedAnswer = ref('')
const fillAnswer = ref('')
const showResult = ref(false)
const isCorrect = ref(false)

const knowledgePoints = ref(['现在进行时', '现在进行时疑问句', '动词-ing形式'])

const questions = ref([
  {
    type: '选择题',
    score: 10,
    question: 'Sam is ______ his room now.',
    options: [
      { key: 'A', text: 'tidying' },
      { key: 'B', text: 'tidy' },
      { key: 'C', text: 'tidied' },
      { key: 'D', text: 'to tidy' }
    ],
    answer: 'A',
    explanation: '现在进行时态结构：主语 + is/am/are + 动词-ing。tidying 是 tidy 的-ing形式。'
  },
  {
    type: '选择题',
    score: 10,
    question: 'Is Amy doing her homework? Yes, ______.',
    options: [
      { key: 'A', text: 'she is' },
      { key: 'B', text: 'she does' },
      { key: 'C', text: 'she can' },
      { key: 'D', text: 'she is not' }
    ],
    answer: 'A',
    explanation: '现在进行时一般疑问句的回答：Yes, she is. / No, she isn\'t.'
  },
  {
    type: '填空题',
    score: 10,
    question: 'Amy is ______ a picture of flowers. (draw)',
    options: [],
    answer: 'drawing',
    explanation: 'draw 的现在分词形式要去 e 加 ing，draw → drawing'
  }
])

const currentQuestionData = computed(() => {
  return questions.value[currentQuestion.value - 1] || questions.value[0]
})

const hasAnswer = computed(() => {
  if (currentQuestionData.value.type === '填空题') {
    return fillAnswer.value.trim() !== ''
  }
  return selectedAnswer.value !== ''
})

const isLastQuestion = computed(() => {
  return currentQuestion.value >= totalQuestions.value
})

const selectAnswer = (key: string) => {
  selectedAnswer.value = key
}

const submitAnswer = () => {
  if (!hasAnswer.value) {
    showToast('请选择或输入答案')
    return
  }

  const answer = currentQuestionData.value.type === '填空题'
    ? fillAnswer.value.trim()
    : selectedAnswer.value

  isCorrect.value = answer === currentQuestionData.value.answer
  showResult.value = true

  if (isCorrect.value) {
    score.value += currentQuestionData.value.score
    streak.value++
  } else {
    streak.value = 1
  }
}

const nextQuestion = () => {
  if (isLastQuestion.value) {
    showSuccessToast('闯关完成！')
    router.push('/stats')
    return
  }

  currentQuestion.value++
  selectedAnswer.value = ''
  fillAnswer.value = ''
  showResult.value = false
  isCorrect.value = false
}

onMounted(() => {
  // TODO: 从路由参数获取 challenge ID，加载题目数据
})
</script>

<style scoped>
.knowledge-overview {
  margin-bottom: 12px;
}

.overview-title {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.knowledge-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.knowledge-tag {
  padding: 6px 12px;
  background: rgba(74, 144, 226, 0.1);
  color: var(--primary);
  border-radius: 16px;
  font-size: 13px;
}

.progress-overview {
  margin-bottom: 16px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.progress-num {
  font-weight: 600;
  color: var(--primary);
}

.score-info {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 14px;
}

.streak {
  color: #ff6b6b;
  font-weight: 600;
}

.question-card {
  margin-bottom: 16px;
}

.question-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.question-type {
  padding: 4px 10px;
  background: var(--primary);
  color: #fff;
  border-radius: 4px;
  font-size: 12px;
}

.question-score {
  color: var(--text-secondary);
  font-size: 13px;
}

.question-text {
  font-size: 18px;
  line-height: 1.8;
  margin-bottom: 20px;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: #f5f5f5;
  border-radius: var(--radius);
  cursor: pointer;
  transition: all 0.2s;
}

.option-item:active {
  transform: scale(0.98);
}

.option-item.selected {
  background: rgba(74, 144, 226, 0.1);
  border: 2px solid var(--primary);
}

.option-item.correct {
  background: rgba(82, 196, 26, 0.1);
  border: 2px solid var(--success);
}

.option-item.wrong {
  background: rgba(245, 34, 45, 0.1);
  border: 2px solid var(--danger);
}

.option-key {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: 50%;
  font-weight: 600;
}

.option-text {
  flex: 1;
  font-size: 16px;
}

.result-feedback {
  display: flex;
  gap: 12px;
  padding: 16px;
  border-radius: var(--radius);
  margin-top: 16px;
}

.result-feedback.correct {
  background: rgba(82, 196, 26, 0.1);
}

.result-feedback.wrong {
  background: rgba(245, 34, 45, 0.1);
}

.feedback-icon {
  font-size: 28px;
}

.feedback-title {
  font-weight: 600;
  margin-bottom: 4px;
}

.feedback-answer {
  color: var(--danger);
}

.feedback-explain {
  font-size: 13px;
  color: var(--text-secondary);
  margin-top: 6px;
}

.action-area {
  padding: 0 16px;
}
</style>