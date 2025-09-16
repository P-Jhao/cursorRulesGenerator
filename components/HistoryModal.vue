<template>
    <div v-if="show" class="fixed inset-0 z-50 flex flex-col" style="flex-direction: column;">
        <div class="bg-black bg-opacity-50 absolute inset-0" @click="close"></div>

        <!-- 导航栏 -->
        <div class="relative flex items-center justify-center p-4 bg-gray-50 border-b border-gray-200 z-10">
            <h2 class="text-xl font-bold text-gray-900">历史记录</h2>
            <button @click="close"
                class="absolute right-4 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 shadow-sm"
                style="margin-left: auto;">
                关闭
            </button>
        </div>

        <!-- 内容区域 -->
        <div class="bg-white rounded-b-lg flex-1 overflow-hidden z-10">
            <div class="h-full overflow-y-auto p-4">
                <!-- 加载状态 -->
                <div v-if="loading" class="flex items-center justify-center h-32">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <span class="ml-3 text-gray-600">加载中...</span>
                </div>

                <!-- 历史记录列表 -->
                <div v-else-if="historyList.length > 0" class="space-y-4">
                    <div v-for="record in historyList" :key="record.id"
                        class="bg-white border border-gray-200 rounded-lg p-4 mb-4">
                        <div class="flex items-center justify-between mb-3">
                            <div>
                                <h3 class="font-medium text-gray-900">
                                    {{ formatDate(record.createdAt) }}
                                </h3>
                                <p class="text-sm text-gray-500">
                                    {{ getConfigSummary(record.config) }}
                                </p>
                            </div>
                            <button @click="deleteRecord(record.id)"
                                class="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600">
                                删除
                            </button>
                        </div>

                        <div class="space-y-3">
                            <!-- 配置预览 -->
                            <div class="bg-gray-50 p-3 rounded-lg">
                                <h4 class="text-sm font-medium text-gray-700 mb-2">配置:</h4>
                                <div class="text-xs text-gray-600">
                                    <div v-for="section in record.config" :key="section.title" class="mb-1">
                                        <span class="font-medium">{{ section.title }}:</span>
                                        <span class="ml-1">{{ section.selectedTags.join(', ') }}</span>
                                    </div>
                                </div>
                            </div>

                            <!-- 规则预览 -->
                            <div class="bg-gray-50 p-3 rounded-lg">
                                <h4 class="text-sm font-medium text-gray-700 mb-2">生成的规则:</h4>
                                <div class="text-xs text-gray-600 max-h-20 overflow-y-auto">
                                    {{ record.rules.substring(0, 200) }}{{ record.rules.length > 200 ? '...' : '' }}
                                </div>
                            </div>

                            <!-- 操作按钮 -->
                            <div class="flex gap-2">
                                <button @click="restoreRecord(record)"
                                    class="flex-1 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                                    回溯完整规则
                                </button>
                                <button @click="copyRules(record.rules)"
                                    class="flex-1 px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                                    复制规则
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 空状态 -->
                <div v-else class="flex items-center justify-center h-64">
                    <div class="text-center">
                        <div class="text-6xl mb-4">📚</div>
                        <p class="text-lg font-medium">暂无历史记录</p>
                        <p class="text-sm">开始生成你的第一个 Cursor Rules 吧！</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- 完整规则查看弹窗 -->
        <div v-if="showRulesModal" class="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-50">
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
import { ref, watch } from 'vue'

const props = defineProps({
    show: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['close', 'restore'])

const loading = ref(false)
const historyList = ref([])
const showRulesModal = ref(false)
const selectedRules = ref('')

const close = () => {
    emit('close')
}

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

const deleteRecord = async (recordId) => {
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

const restoreRecord = (record) => {
    // 发出恢复事件，传递记录数据
    emit('restore', record)
    // 关闭历史记录弹窗
    close()
}

const copyRules = async (rules) => {
    try {
        await navigator.clipboard.writeText(rules)
        alert('已复制到剪贴板')
    } catch (err) {
        console.error('复制失败:', err)
        alert('复制失败，请手动复制')
    }
}

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

const getConfigSummary = (config) => {
    if (!config || !Array.isArray(config)) return '无配置信息'

    const totalTags = config.reduce((sum, section) => sum + (section.selectedTags?.length || 0), 0)
    return `共 ${config.length} 个分类，${totalTags} 个标签`
}

// 监听 show 变化，加载历史记录
watch(() => props.show, (newShow) => {
    if (newShow) {
        loadHistory()
    }
})
</script>
