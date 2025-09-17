<template>
    <div class="min-h-screen bg-gray-50">
        <!-- 导航栏 -->
        <div class="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
            <div class="flex items-center space-x-4" style="width: 100%;">
                <NuxtLink to="/" class="text-blue-500 hover:text-blue-600 flex items-center">
                    <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7">
                        </path>
                    </svg>
                    返回首页
                </NuxtLink>
                <h1 class="text-lg font-semibold text-gray-900" style="transform: translateX(-200%); margin-left: 50%;">
                    历史记录
                </h1>
            </div>
            <div class="flex items-center space-x-2">
                <div v-if="user" class="flex items-center space-x-2">
                    <UserProfile :user="user" @logout="handleLogout" />
                </div>
                <button v-else @click="handleLoginClick"
                    class="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
                    登录
                </button>
            </div>
        </div>

        <!-- 内容区域 -->
        <div class="max-w-4xl mx-auto p-6">
            <!-- 加载状态 -->
            <div v-if="loading" class="flex items-center justify-center h-64">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span class="ml-3 text-gray-600">加载中...</span>
            </div>

            <!-- 历史记录列表 -->
            <div v-else-if="historyList.length > 0" class="space-y-4">
                <div v-for="record in historyList" :key="record.id"
                    class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <div class="flex items-center justify-between mb-4">
                        <div>
                            <h3 class="text-lg font-medium text-gray-900">
                                {{ formatDate(record.createdAt) }}
                            </h3>
                            <p class="text-sm text-gray-500">
                                {{ getConfigSummary(record.config) }}
                            </p>
                        </div>
                        <button @click="deleteRecord(record.id)"
                            class="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors">
                            删除
                        </button>
                    </div>

                    <div class="space-y-4">
                        <!-- 配置预览 -->
                        <div class="bg-gray-50 p-4 rounded-lg">
                            <h4 class="text-sm font-medium text-gray-700 mb-2">配置:</h4>
                            <div class="text-sm text-gray-600">
                                <div v-for="section in record.config" :key="section.title" class="mb-1">
                                    <span class="font-medium">{{ section.title }}:</span>
                                    <span class="ml-1">{{ section.selectedTags.join(', ') }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- 规则预览 -->
                        <div class="bg-gray-50 p-4 rounded-lg">
                            <h4 class="text-sm font-medium text-gray-700 mb-2">生成的规则:</h4>
                            <div class="text-sm text-gray-600 max-h-32 overflow-y-auto">
                                {{ record.rules.substring(0, 300) }}{{ record.rules.length > 300 ? '...' : '' }}
                            </div>
                        </div>

                        <!-- 操作按钮 -->
                        <div class="flex gap-3">
                            <button @click="restoreRecord(record)"
                                class="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                                回溯到首页
                            </button>
                            <button @click="copyRules(record.rules)"
                                class="flex-1 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors">
                                复制规则
                            </button>
                            <button @click="showFullRules(record.rules)"
                                class="flex-1 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors">
                                查看完整规则
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 空状态 -->
            <div v-else class="flex items-center justify-center h-64">
                <div class="text-center">
                    <div class="text-6xl mb-4">📚</div>
                    <p class="text-lg font-medium text-gray-900">暂无历史记录</p>
                    <p class="text-sm text-gray-500 mb-4">开始生成你的第一个 Cursor Rules 吧！</p>
                    <NuxtLink to="/" class="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                        返回首页
                    </NuxtLink>
                </div>
            </div>
        </div>

        <!-- 完整规则查看弹窗 -->
        <div v-if="showRulesModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div class="bg-white rounded-lg w-11/12 h-4/5 flex flex-col">
                <div class="relative flex items-center justify-center p-4 border-b border-gray-200 bg-gray-50">
                    <h3 class="text-xl font-bold text-gray-900">完整规则</h3>
                    <button @click="showRulesModal = false"
                        class="absolute right-4 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 shadow-sm">
                        关闭
                    </button>
                </div>
                <div class="flex-1 overflow-y-auto p-4">
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <pre
                            class="whitespace-pre-wrap text-sm text-gray-800 font-mono leading-relaxed">{{ selectedRules }}</pre>
                    </div>
                </div>
                <div class="p-4 border-t border-gray-200">
                    <button @click="copyRules(selectedRules)"
                        class="w-full px-4 py-3 bg-blue-500 text-white rounded hover:bg-blue-600">
                        复制规则
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import UserProfile from '../../components/UserProfile.vue'

// 页面元数据
definePageMeta({
    title: '历史记录'
})

// 响应式数据
const loading = ref(false)
const historyList = ref([])
const showRulesModal = ref(false)
const selectedRules = ref('')
const user = ref(null)

// 加载历史记录
const loadHistory = async () => {
    loading.value = true
    try {
        const response = await $fetch('/api/history/list')
        if (response.success) {
            historyList.value = response.data
        }
    } catch (error) {
        console.error('加载历史记录失败:', error)
        alert('加载历史记录失败')
    } finally {
        loading.value = false
    }
}

// 删除记录
const deleteRecord = async (recordId) => {
    if (!confirm('确定要删除这条历史记录吗？')) {
        return
    }

    try {
        const response = await $fetch('/api/history/delete', {
            method: 'POST',
            body: { recordId }
        })

        if (response.success) {
            alert('删除成功')
            // 重新加载历史记录
            await loadHistory()
        }
    } catch (error) {
        console.error('删除失败:', error)
        alert('删除失败')
    }
}

// 恢复记录到首页
const restoreRecord = (record) => {
    // 将记录数据存储到 sessionStorage，供首页使用
    sessionStorage.setItem('restoreRecord', JSON.stringify(record))
    // 跳转到首页
    navigateTo('/')
}

// 复制规则
const copyRules = async (rules) => {
    try {
        await navigator.clipboard.writeText(rules)
        alert('已复制到剪贴板')
    } catch (err) {
        console.error('复制失败:', err)
        alert('复制失败，请手动复制')
    }
}

// 显示完整规则
const showFullRules = (rules) => {
    selectedRules.value = rules
    showRulesModal.value = true
}

// 格式化日期
const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    })
}

// 获取配置摘要
const getConfigSummary = (config) => {
    if (!config || !Array.isArray(config)) return '无配置信息'

    const totalTags = config.reduce((sum, section) => sum + (section.selectedTags?.length || 0), 0)
    return `共 ${config.length} 个分类，${totalTags} 个标签`
}

// 检查认证状态
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

// 处理登录点击
const handleLoginClick = () => {
    navigateTo('/')
}

// 处理登出
const handleLogout = async () => {
    try {
        await $fetch('/api/auth/logout', { method: 'POST' })
        user.value = null
        alert('已登出')
        navigateTo('/')
    } catch (error) {
        console.error('登出失败:', error)
    }
}

// 组件挂载时执行
onMounted(async () => {
    await checkAuth()
    await loadHistory()
})
</script>
