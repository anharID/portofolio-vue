<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { Lock, Mail, Loader2 } from 'lucide-vue-next'

const email = ref('')
const password = ref('')
const authStore = useAuthStore()
const router = useRouter()
const errorMessage = ref('')

const handleLogin = async () => {
  errorMessage.value = ''
  try {
    await authStore.signIn(email.value, password.value)
    router.push('/admin/dashboard')
  } catch (error) {
    errorMessage.value = error.message || 'Login gagal! Periksa email atau password.'
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 px-4">
    <div class="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold text-gray-800 mb-2">Welcome Back</h1>
        <p class="text-gray-500 text-sm">Login to manage your portfolio</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail class="h-5 w-5 text-gray-400" />
            </div>
            <input
              v-model="email"
              type="email"
              required
              class="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              placeholder="admin@porto.com"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock class="h-5 w-5 text-gray-400" />
            </div>
            <input
              v-model="password"
              type="password"
              required
              class="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div v-if="errorMessage" class="p-3 rounded-lg bg-red-50 text-red-600 text-sm text-center">
          {{ errorMessage }}
        </div>

        <button
          type="submit"
          :disabled="authStore.loading"
          class="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
        >
          <Loader2 v-if="authStore.loading" class="w-5 h-5 animate-spin mr-2" />
          {{ authStore.loading ? 'Signing in...' : 'Sign In' }}
        </button>
      </form>
    </div>
  </div>
</template>
