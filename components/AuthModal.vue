<template>
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div class="bg-white rounded-lg p-6 w-90 max-w-md mx-4">
            <div class="text-center mb-6">
                <h2 class="text-2xl font-bold text-gray-900">{{ isLogin ? '登录' : '注册' }}</h2>
                <p class="text-gray-600 mt-2">{{ isLogin ? '欢迎回来' : '创建新账户' }}</p>
            </div>

            <form @submit.prevent="handleSubmit" class="space-y-4">
                <div v-if="!isLogin">
                    <label class="block text-sm font-medium text-gray-700 mb-1">用户名</label>
                    <input v-model="form.username" type="text" required placeholder="请输入用户名"
                        class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
                    <input v-model="form.email" type="email" required placeholder="请输入邮箱"
                        class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">密码</label>
                    <input v-model="form.password" type="password" required minlength="6" placeholder="请输入密码"
                        class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                <div class="mt-6 space-y-3">
                    <button type="submit" :disabled="loading"
                        class="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50">
                        {{ loading ? '处理中...' : (isLogin ? '登录' : '注册') }}
                    </button>

                    <button type="button" @click="toggleMode"
                        class="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
                        {{ isLogin ? '没有账户？点击注册' : '已有账户？点击登录' }}
                    </button>

                    <button type="button" @click="close"
                        class="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
                        取消
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'

const props = defineProps({
    show: {
        type: Boolean,
        default: false
    },
    defaultMode: {
        type: String,
        default: 'login' // 'login' or 'register'
    }
})

const emit = defineEmits(['close', 'success'])

const isLogin = ref(props.defaultMode === 'login')
const loading = ref(false)

const form = reactive({
    username: '',
    email: '',
    password: ''
})

const toggleMode = () => {
    isLogin.value = !isLogin.value
    // 清空表单
    form.username = ''
    form.email = ''
    form.password = ''
}

const handleSubmit = async () => {
    loading.value = true

    try {
        const url = isLogin.value ? '/api/auth/login' : '/api/auth/register'
        const body = isLogin.value
            ? { email: form.email, password: form.password }
            : { username: form.username, email: form.email, password: form.password }

        const response = await $fetch(url, {
            method: 'POST',
            body
        })

        if (response.success) {
            // 保存 token 到 cookie
            const token = response.data.token
            document.cookie = `auth-token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; secure; samesite=strict`

            // 触发成功事件
            emit('success', response.data.user)

            // 关闭弹窗
            close()

            // 显示成功消息
            showToast({
                message: response.message,
                type: 'success'
            })
        }
    } catch (error) {
        console.error('认证失败:', error)
        showToast({
            message: error.data?.message || '操作失败，请重试',
            type: 'fail'
        })
    } finally {
        loading.value = false
    }
}

const close = () => {
    emit('close')
    // 清空表单
    form.username = ''
    form.email = ''
    form.password = ''
}

// 监听 show 变化，重置模式
watch(() => props.show, (newShow) => {
    if (newShow) {
        isLogin.value = props.defaultMode === 'login'
    }
})
</script>
