<template>
  <div class="page">
    <van-nav-bar title="上传学习资料" left-arrow @click-left="router.back()" />

    <div class="upload-tip">
      <p>支持 <strong>视频、图片、PDF</strong> 格式</p>
      <p>上传后 AI 会自动识别知识点，生成闯关练习</p>
    </div>

    <!-- 上传区域 -->
    <div class="card">
      <van-uploader
        :max-count="1"
        :after-read="afterRead"
        :before-read="beforeRead"
        accept="video/mp4,image/*,application/pdf"
        :preview-size="120"
      >
        <div class="upload-area">
          <van-icon name="plus" size="48" color="#4A90E2" />
          <p class="upload-text">点击上传学习资料</p>
        </div>
      </van-uploader>
    </div>

    <!-- 文件预览 -->
    <div v-if="fileInfo" class="card file-preview">
      <div class="file-info">
        <van-icon :name="fileIcon" size="40" />
        <div class="file-detail">
          <p class="file-name">{{ fileInfo.name }}</p>
          <p class="file-size">{{ fileInfo.size }}</p>
        </div>
        <van-icon name="cross" @click="clearFile" />
      </div>
    </div>

    <!-- 学科选择 -->
    <div class="card">
      <h3 class="form-label">选择学科</h3>
      <van-radio-group v-model="subject" direction="horizontal">
        <van-radio name="语文">语文</van-radio>
        <van-radio name="数学">数学</van-radio>
        <van-radio name="英语">英语</van-radio>
        <van-radio name="其他">其他</van-radio>
      </van-radio-group>
    </div>

    <!-- 年级选择 -->
    <div class="card">
      <h3 class="form-label">选择年级</h3>
      <van-cell-group>
        <van-field
          v-model="grade"
          is-link
          readonly
          label="年级"
          placeholder="请选择年级"
          @click="showGradePicker = true"
        />
      </van-cell-group>
      <van-popup v-model:show="showGradePicker" position="bottom">
        <van-picker
          :columns="gradeColumns"
          @confirm="onGradeConfirm"
          @cancel="showGradePicker = false"
        />
      </van-popup>
    </div>

    <!-- 上传按钮 -->
    <div class="action-area">
      <van-button
        type="primary"
        block
        :loading="uploading"
        :disabled="!canUpload"
        @click="handleUpload"
      >
        {{ uploading ? '正在分析...' : '开始分析生成闯关' }}
      </van-button>
    </div>

    <!-- 处理状态 -->
    <div v-if="processing" class="processing-status card">
      <van-loading type="spinner" />
      <p>{{ statusText }}</p>
      <p class="processing-hint">请耐心等待，AI 正在分析学习资料...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showSuccessToast } from 'vant'
import type { UploaderFileListItem } from 'vant'

const router = useRouter()

const fileInfo = ref<{ name: string; size: string; type: string } | null>(null)
const fileContent = ref<File | null>(null)
const uploading = ref(false)
const processing = ref(false)
const statusText = ref('')
const subject = ref('英语')
const grade = ref('')
const showGradePicker = ref(false)

const gradeColumns = [
  { text: '一年级', value: '1' },
  { text: '二年级', value: '2' },
  { text: '三年级', value: '3' },
  { text: '四年级', value: '4' },
  { text: '五年级', value: '5' },
  { text: '六年级', value: '6' }
]

const fileIcon = computed(() => {
  if (!fileInfo.value) return ''
  const type = fileInfo.value.type
  if (type.startsWith('video')) return 'video-o'
  if (type.includes('pdf')) return 'description'
  return 'photograph'
})

const canUpload = computed(() => {
  return fileContent.value && grade.value && subject.value
})

const beforeRead = (file: File) => {
  const maxSize = 50 * 1024 * 1024 // 50MB
  if (file.size > maxSize) {
    showToast('文件大小不能超过 50MB')
    return false
  }
  return true
}

const afterRead = (item: UploaderFileListItem) => {
  fileContent.value = item.file as File
  fileInfo.value = {
    name: item.file.name,
    size: formatFileSize(item.file.size),
    type: item.file.type
  }
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

const onGradeConfirm = ({ selectedValues }: { selectedValues: string[] }) => {
  grade.value = selectedValues[0]
  showGradePicker.value = false
}

const clearFile = () => {
  fileInfo.value = null
  fileContent.value = null
}

const handleUpload = async () => {
  if (!fileContent.value) {
    showToast('请先上传学习资料')
    return
  }

  uploading.value = true
  processing.value = true
  statusText.value = '上传文件中...'

  try {
    // TODO: 调用后端 API 上传文件
    // 1. 视频: Whisper 转文字 → VLM 提取知识点
    // 2. 图片: VLM 直接提取知识点
    // 3. PDF: 提取文本 → 知识点整理

    statusText.value = '正在识别知识点...'
    await new Promise(r => setTimeout(r, 2000))

    statusText.value = '正在生成闯关题目...'
    await new Promise(r => setTimeout(r, 2000))

    showSuccessToast('闯关已生成！')
    
    // 跳转到闯关页面
    router.push('/challenge/new')
  } catch (error) {
    showToast('处理失败，请重试')
    console.error(error)
  } finally {
    uploading.value = false
    processing.value = false
  }
}
</script>

<style scoped>
.upload-tip {
  text-align: center;
  padding: 16px;
  color: var(--text-secondary);
  font-size: 14px;
}

.upload-area {
  width: 100%;
  padding: 30px;
}

.file-preview {
  margin-top: 12px;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.file-detail {
  flex: 1;
}

.file-name {
  font-weight: 500;
  word-break: break-all;
}

.file-size {
  font-size: 13px;
  color: var(--text-secondary);
  margin-top: 4px;
}

.form-label {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.action-area {
  padding: 16px;
  margin-top: 16px;
}

.processing-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
  padding: 30px;
}

.processing-hint {
  font-size: 13px;
  color: var(--text-secondary);
}
</style>