<template>
  <div class="h-full">
    <!-- 加载状态 -->
    <div v-if="loading" class="flex items-center justify-center h-64">
      <van-loading type="spinner" size="24px" />
      <span class="ml-3 text-gray-600">正在生成 Cursor Rules...</span>
    </div>

    <!-- 输出内容 -->
    <div v-else-if="content" class="space-y-4">
      <!-- 复制按钮 -->
      <div class="flex justify-end">
        <van-button @click="copyToClipboard" type="success" size="small" icon="copy">
          复制
        </van-button>
      </div>

      <!-- 内容显示 -->
      <van-card>
        <pre class="whitespace-pre-wrap text-sm text-gray-800 font-mono leading-relaxed">{{ content }}</pre>
      </van-card>
    </div>

    <!-- 空状态 -->
    <div v-else class="flex items-center justify-center h-64 text-gray-500">
      <div class="text-center">
        <van-empty image="https://fastly.jsdelivr.net/npm/@vant/assets/custom-empty-image.png"
          description="等待生成 Cursor Rules">
          <template #description>
            <p class="text-lg font-medium">等待生成 Cursor Rules</p>
            <p class="text-sm">请在左侧配置选项并点击生成按钮</p>
          </template>
        </van-empty>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  content: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(props.content)
    // 使用简单的alert提示，因为Vant的Toast需要额外配置
    alert('已复制到剪贴板！')
  } catch (err) {
    console.error('复制失败:', err)
    alert('复制失败，请手动复制')
  }
}
</script>
