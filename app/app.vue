<template>
  <div class="min-h-screen bg-gray-50">
    <NuxtRouteAnnouncer />
    <div
      class="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <h1 class="text-lg font-semibold text-gray-900">Cursor Rules 生成器</h1>
      <div class="flex items-center space-x-2">
        <div v-if="user" class="flex items-center space-x-2">
          <UserProfile :user="user" @logout="handleLogout" @showHistory="showHistoryModal = true" />
        </div>
        <button v-else @click="handleLoginClick"
          class="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
          登录
        </button>
      </div>
    </div>
    <div class="flex h-screen pt-12">
      <!-- 左侧配置区域 -->
      <div class="w-1/2 bg-white border-r border-gray-200 p-6 overflow-y-auto">
        <div class="space-y-6">
          <!-- 选项卡列表 -->
          <div class="space-y-4">
            <div v-for="(tab, index) in tabs" :key="tab.id" class="border border-gray-200 rounded-lg p-4">
              <div class="flex items-center justify-between mb-3">
                <h3 class="text-lg font-medium text-gray-900">{{ tab.title }}</h3>
                <button v-if="tabs.length > 1" @click="removeTab(index)"
                  class="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600">
                  删除
                </button>
              </div>

              <!-- 标签列表 -->
              <div class="flex flex-wrap gap-2 mb-3">
                <span v-for="tag in tab.tags" :key="tag.id" @click="toggleTag(tab.id, tag.id)"
                  :class="tag.selected ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'"
                  class="px-2 py-1 text-sm rounded cursor-pointer hover:opacity-80">
                  {{ tag.name }}
                </span>
              </div>

              <!-- 添加标签输入框 -->
              <div class="flex gap-2">
                <input v-model="tab.newTag" @keyup.enter="addTag(tab.id)" placeholder="添加自定义标签..."
                  class="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <button @click="addTag(tab.id)" class="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                  添加
                </button>
              </div>
            </div>
          </div>

          <!-- 添加新选项卡 -->
          <div class="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <div class="flex gap-2">
              <input v-model="newTabTitle" @keyup.enter="addTab" placeholder="新选项卡标题..."
                class="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <button @click="addTab" class="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                添加选项卡
              </button>
            </div>
          </div>

          <!-- 额外补充输入框 -->
          <div class="border border-gray-200 rounded-lg p-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">额外补充</label>
            <textarea v-model="supplementText" placeholder="额外对生成的规则进行补充..."
              class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows="3"></textarea>
          </div>

          <!-- 生成按钮 -->
          <div class="pt-4">
            <button @click="generateRules" :disabled="isGenerating"
              class="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed">
              {{ isGenerating ? '生成中...' : '生成 Cursor Rules' }}
            </button>
          </div>
        </div>
      </div>

      <!-- 右侧输出区域 -->
      <div class="w-1/2 bg-gray-50 p-6 overflow-y-auto">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">生成的 Cursor Rules</h2>

        <!-- 加载状态 -->
        <div v-if="isGenerating" class="flex items-center justify-center h-64" style="flex-direction: column;">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <div class="ml-3 text-gray-600">正在生成 Cursor Rules...</div>
          <div class="ml-3 text-gray-600">这个过程可能要30-60s请耐心等待</div>
        </div>

        <!-- 输出内容 -->
        <div v-else-if="generatedRules" class="space-y-4">
          <!-- 复制按钮 -->
          <div class="flex justify-end">
            <button @click="copyToClipboard" class="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600">
              复制
            </button>
          </div>

          <!-- 内容显示 -->
          <div class="bg-white border border-gray-200 rounded-lg p-4">
            <pre class="whitespace-pre-wrap text-sm text-gray-800 font-mono leading-relaxed">{{ generatedRules }}</pre>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="flex items-center justify-center h-64 text-gray-500">
          <div class="text-center">
            <div class="text-6xl mb-4">📝</div>
            <p class="text-lg font-medium">等待生成 Cursor Rules</p>
            <p class="text-sm">请在左侧配置选项并点击生成按钮</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 认证弹窗 -->
    <div v-if="showAuthModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-white rounded-lg p-6 w-90 max-w-md mx-4">
        <div class="text-center mb-6">
          <h2 class="text-2xl font-bold text-gray-900">{{ isLogin ? '登录' : '注册' }}</h2>
          <p class="text-gray-600 mt-2">{{ isLogin ? '欢迎回来' : '创建新账户' }}</p>
        </div>

        <form @submit.prevent="handleAuthSubmit" class="space-y-4">
          <div v-if="!isLogin">
            <label class="block text-sm font-medium text-gray-700 mb-1">用户名</label>
            <input v-model="authForm.username" type="text" required placeholder="请输入用户名"
              class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
            <input v-model="authForm.email" type="email" required placeholder="请输入邮箱"
              class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">密码</label>
            <input v-model="authForm.password" type="password" required minlength="6" placeholder="请输入密码"
              class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div class="mt-6 space-y-3">
            <button type="submit" :disabled="authLoading"
              class="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50">
              {{ authLoading ? '处理中...' : (isLogin ? '登录' : '注册') }}
            </button>

            <button type="button" @click="toggleAuthMode"
              class="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
              {{ isLogin ? '没有账户？点击注册' : '已有账户？点击登录' }}
            </button>

            <button type="button" @click="showAuthModal = false"
              class="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
              取消
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 历史记录弹窗 -->
    <HistoryModal v-model:show="showHistoryModal" @close="showHistoryModal = false" @restore="handleRestoreRecord" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import generateRulesPost from "../server/api/generate-rules.post.ts"
import UserProfile from "../components/UserProfile.vue"
import HistoryModal from "../components/HistoryModal.vue"

const generatedRules = ref('')
const isGenerating = ref(false)
const newTabTitle = ref('')
const supplementText = ref('')
const user = ref(null)
const showAuthModal = ref(false)
const showHistoryModal = ref(false)
const isLogin = ref(true)
const authLoading = ref(false)
const authForm = reactive({
  username: '',
  email: '',
  password: ''
})

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

  // 准备请求数据，包含补充内容
  const requestData = {
    config,
    supplement: supplementText.value.trim()
  }

  const response = await generateRulesPost(requestData)
  console.log("response", response)

  if (response.success) {
    generatedRules.value = response.data

    // 如果用户已登录，保存历史记录
    if (user.value && config.length > 0) {
      await saveHistory(config, response.data)
    }
  } else {
    generatedRules.value = `生成失败: ${response.error}`
  }

  isGenerating.value = false
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

// 认证相关方法
const handleLoginClick = () => {
  console.log('登录按钮被点击了')
  showAuthModal.value = true
  console.log('showAuthModal 设置为:', showAuthModal.value)
}

const toggleAuthMode = () => {
  isLogin.value = !isLogin.value
  // 清空表单
  authForm.username = ''
  authForm.email = ''
  authForm.password = ''
}

const handleAuthSubmit = async () => {
  authLoading.value = true

  try {
    const url = isLogin.value ? '/api/auth/login' : '/api/auth/register'
    const body = isLogin.value
      ? { email: authForm.email, password: authForm.password }
      : { username: authForm.username, email: authForm.email, password: authForm.password }

    const response = await $fetch(url, {
      method: 'POST',
      body
    })

    if (response.success) {
      // 保存 token 到 cookie
      const token = response.data.token
      document.cookie = `auth-token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; secure; samesite=strict`

      // 更新用户状态
      user.value = response.data.user

      // 关闭弹窗
      showAuthModal.value = false

      // 清空表单
      authForm.username = ''
      authForm.email = ''
      authForm.password = ''

      // 显示成功消息
      alert(response.message)
    }
  } catch (error) {
    console.error('认证失败:', error)
    alert(error.data?.message || '操作失败，请重试')
  } finally {
    authLoading.value = false
  }
}

const checkAuth = async () => {
  try {
    const response = await $fetch('/api/auth/me')
    if (response.success) {
      user.value = response.data
    }
  } catch (error) {
    console.error('认证检查失败:', error)
    user.value = null
  }
}

const handleAuthSuccess = (userData) => {
  user.value = userData
  showAuthModal.value = false
}

const handleLogout = async () => {
  try {
    await $fetch('/api/auth/logout', { method: 'POST' })
    user.value = null
    alert('已登出')
  } catch (error) {
    console.error('登出失败:', error)
  }
}

// 保存历史记录
const saveHistory = async (config, rules) => {
  if (!user.value) return

  try {
    await $fetch('/api/history/save', {
      method: 'POST',
      body: { config, rules }
    })
  } catch (error) {
    console.error('保存历史记录失败:', error)
  }
}

// 处理历史记录恢复
const handleRestoreRecord = (record) => {
  // 恢复配置选项卡
  restoreConfigFromRecord(record.config)

  // 恢复生成的规则到右侧显示区域
  generatedRules.value = record.rules

}

// 根据历史记录恢复配置选项卡
const restoreConfigFromRecord = (config) => {
  // 重置所有选项卡的选中状态
  tabs.forEach(tab => {
    tab.tags.forEach(tag => {
      tag.selected = false
    })
  })

  // 根据历史记录配置恢复选中状态
  config.forEach(configSection => {
    const tab = tabs.find(t => t.title === configSection.title)
    if (tab) {
      configSection.selectedTags.forEach(tagName => {
        // 首先尝试在现有标签中找到匹配的
        let tag = tab.tags.find(t => t.name === tagName)

        // 如果在现有标签中找不到，则添加为自定义标签
        if (!tag) {
          tag = {
            id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: tagName,
            selected: true
          }
          tab.tags.push(tag)
        } else {
          tag.selected = true
        }
      })
    }
  })
}

// 组件挂载时检查认证状态
onMounted(() => {
  checkAuth()
})
</script>
