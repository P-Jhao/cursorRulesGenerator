<template>
    <div class="flex items-center space-x-3">
        <div class="text-right">
            <div class="text-sm font-medium text-gray-900">{{ user?.username }}</div>
            <div class="text-xs text-gray-500">{{ user?.email }}</div>
        </div>
        <button @click="showProfileMenu = true" class="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600">
            👤
        </button>
    </div>

    <!-- 用户菜单 -->
    <div v-if="showProfileMenu" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div class="bg-white rounded-lg p-4 w-64">
            <h3 class="text-lg font-semibold mb-4">用户菜单</h3>
            <div class="space-y-2">
                <button @click="handleProfileAction({ name: '历史记录' })"
                    class="w-full text-left px-3 py-2 hover:bg-gray-100 rounded">
                    📚 历史记录
                </button>
                <button @click="handleProfileAction({ name: '登出' })"
                    class="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-red-600">
                    🚪 登出
                </button>
                <button @click="showProfileMenu = false" class="w-full text-left px-3 py-2 hover:bg-gray-100 rounded">
                    取消
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
    user: {
        type: Object,
        default: null
    }
})

const emit = defineEmits(['logout', 'showHistory'])

const showProfileMenu = ref(false)

const profileActions = computed(() => [
    {
        name: '历史记录',
        icon: 'clock-o',
        color: '#1989fa'
    },
    {
        name: '登出',
        icon: 'logout',
        color: '#ee0a24'
    }
])

const handleProfileAction = (action) => {
    showProfileMenu.value = false

    if (action.name === '历史记录') {
        emit('showHistory')
    } else if (action.name === '登出') {
        emit('logout')
    }
}
</script>
