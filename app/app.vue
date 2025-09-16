<template>
  <div class="min-h-screen bg-gray-50">
    <NuxtRouteAnnouncer />
    <van-nav-bar title="Cursor Rules 生成器" fixed />
    <div class="flex h-screen pt-12">
      <!-- 左侧配置区域 -->
      <div class="w-1/2 bg-white border-r border-gray-200 p-6 overflow-y-auto">
        <div class="space-y-6">
          <!-- 选项卡列表 -->
          <div class="space-y-4">
            <div v-for="(tab, index) in tabs" :key="tab.id" class="border border-gray-200 rounded-lg p-4">
              <div class="flex items-center justify-between mb-3">
                <h3 class="text-lg font-medium text-gray-900">{{ tab.title }}</h3>
                <van-button v-if="tabs.length > 1" @click="removeTab(index)" type="danger" size="mini" plain>
                  删除
                </van-button>
              </div>

              <!-- 标签列表 -->
              <div class="flex flex-wrap gap-2 mb-3">
                <van-tag v-for="tag in tab.tags" :key="tag.id" @click="toggleTag(tab.id, tag.id)"
                  :type="tag.selected ? 'primary' : 'default'" :plain="!tag.selected" class="cursor-pointer">
                  {{ tag.name }}
                </van-tag>
              </div>

              <!-- 添加标签输入框 -->
              <div class="flex gap-2">
                <van-field v-model="tab.newTag" @keyup.enter="addTag(tab.id)" placeholder="添加自定义标签..." class="flex-1" />
                <van-button @click="addTag(tab.id)" type="primary" size="small">
                  添加
                </van-button>
              </div>
            </div>
          </div>

          <!-- 添加新选项卡 -->
          <div class="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <div class="flex gap-2">
              <van-field v-model="newTabTitle" @keyup.enter="addTab" placeholder="新选项卡标题..." class="flex-1" />
              <van-button @click="addTab" type="success" size="small">
                添加选项卡
              </van-button>
            </div>
          </div>

          <!-- 生成按钮 -->
          <div class="pt-4">
            <van-button @click="generateRules" :loading="isGenerating" type="primary" size="large" block round>
              {{ isGenerating ? '生成中...' : '生成 Cursor Rules' }}
            </van-button>
          </div>
        </div>
      </div>

      <!-- 右侧输出区域 -->
      <div class="w-1/2 bg-gray-50 p-6 overflow-y-auto">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">生成的 Cursor Rules</h2>

        <!-- 加载状态 -->
        <div v-if="isGenerating" class="flex items-center justify-center h-64">
          <van-loading type="spinner" size="24px" />
          <span class="ml-3 text-gray-600">正在生成 Cursor Rules...</span>
        </div>

        <!-- 输出内容 -->
        <div v-else-if="generatedRules" class="space-y-4">
          <!-- 复制按钮 -->
          <div class="flex justify-end">
            <van-button @click="copyToClipboard" type="success" size="small" icon="copy">
              复制
            </van-button>
          </div>

          <!-- 内容显示 -->
          <div class="bg-white border border-gray-200 rounded-lg p-4">
            <pre class="whitespace-pre-wrap text-sm text-gray-800 font-mono leading-relaxed">{{ generatedRules }}</pre>
          </div>
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
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const generatedRules = ref('')
const isGenerating = ref(false)
const newTabTitle = ref('')

// 初始选项卡数据
const tabs = reactive([
  {
    id: 'role',
    title: '角色',
    newTag: '',
    tags: [
      { id: 'web-engineer', name: 'Web工程师', selected: false },
      { id: 'java-engineer', name: 'Java工程师', selected: false },
      { id: 'python-engineer', name: 'Python工程师', selected: false },
      { id: 'frontend-engineer', name: '前端工程师', selected: false },
      { id: 'backend-engineer', name: '后端工程师', selected: false },
      { id: 'fullstack-engineer', name: '全栈工程师', selected: false }
    ]
  },
  {
    id: 'goal',
    title: '目标',
    newTag: '',
    tags: [
      { id: 'easy-understand', name: '易理解', selected: false },
      { id: 'high-performance', name: '性能优异', selected: false },
      { id: 'good-ux', name: '用户体验良好', selected: false },
      { id: 'maintainable', name: '可维护', selected: false },
      { id: 'scalable', name: '可扩展', selected: false },
      { id: 'secure', name: '安全可靠', selected: false }
    ]
  },
  {
    id: 'requirements',
    title: '要求',
    newTag: '',
    tags: [
      { id: 'clean-code', name: '代码整洁', selected: false },
      { id: 'documentation', name: '文档完善', selected: false },
      { id: 'testing', name: '测试覆盖', selected: false },
      { id: 'error-handling', name: '错误处理', selected: false },
      { id: 'optimization', name: '性能优化', selected: false },
      { id: 'best-practices', name: '最佳实践', selected: false }
    ]
  }
])

const toggleTag = (tabId, tagId) => {
  const tab = tabs.find(t => t.id === tabId)
  if (tab) {
    const tag = tab.tags.find(t => t.id === tagId)
    if (tag) {
      tag.selected = !tag.selected
    }
  }
}

const addTag = (tabId) => {
  const tab = tabs.find(t => t.id === tabId)
  if (tab && tab.newTag.trim()) {
    const newTag = {
      id: `custom-${Date.now()}`,
      name: tab.newTag.trim(),
      selected: false
    }
    tab.tags.push(newTag)
    tab.newTag = ''
  }
}

const addTab = () => {
  if (newTabTitle.value.trim()) {
    const newTab = {
      id: `tab-${Date.now()}`,
      title: newTabTitle.value.trim(),
      newTag: '',
      tags: []
    }
    tabs.push(newTab)
    newTabTitle.value = ''
  }
}

const removeTab = (index) => {
  tabs.splice(index, 1)
}

const generateRules = async () => {
  isGenerating.value = true

  // 收集选中的配置
  const config = tabs.map(tab => ({
    title: tab.title,
    selectedTags: tab.tags.filter(tag => tag.selected).map(tag => tag.name)
  })).filter(tab => tab.selectedTags.length > 0)

  try {
    const response = await $fetch('/api/generate-rules', {
      method: 'POST',
      body: config
    })
    if (response.success) {
      generatedRules.value = response.data
    } else {
      generatedRules.value = `生成失败: ${response.error}`
    }
  } catch (error) {
    console.error('生成失败:', error)
    generatedRules.value = '生成失败，请重试。'
  } finally {
    isGenerating.value = false
  }
}

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(generatedRules.value)
    alert('已复制到剪贴板！')
  } catch (err) {
    console.error('复制失败:', err)
    alert('复制失败，请手动复制')
  }
}
</script>
