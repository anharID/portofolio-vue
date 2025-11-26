<script setup>
import {
  LayoutDashboard,
  FolderGit2,
  Cpu,
  Award,
  MessageSquare,
  User,
  LogOut,
  X,
} from 'lucide-vue-next'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits(['close'])

const route = useRoute()

const menuItems = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Personal Info', path: '/admin/personal', icon: User },
  { name: 'Projects', path: '/admin/projects', icon: FolderGit2 },
  { name: 'Tech Stack', path: '/admin/tech-stack', icon: Cpu },
  { name: 'Certificates', path: '/admin/certificates', icon: Award },
  { name: 'Messages', path: '/admin/messages', icon: MessageSquare },
]

const authStore = useAuthStore()

const handleLogout = () => {
  authStore.signOut()
}

const handleItemClick = () => {
  if (window.innerWidth < 768) {
    emit('close')
  }
}
</script>

<template>
  <aside
    class="fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out transform md:translate-x-0 shadow-lg md:shadow-none"
    :class="isOpen ? 'translate-x-0' : '-translate-x-full'"
  >
    <div class="h-16 flex items-center justify-between px-6 border-b border-gray-100">
      <h1 class="text-xl font-bold text-gray-800 tracking-tight">
        Anhar<span class="text-indigo-600">.</span>
      </h1>

      <button @click="$emit('close')" class="md:hidden text-gray-500 hover:text-gray-700">
        <X class="w-6 h-6" />
      </button>
    </div>

    <nav class="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
      <router-link
        v-for="item in menuItems"
        :key="item.path"
        :to="item.path"
        @click="handleItemClick"
        class="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 group"
        :class="[
          route.path.startsWith(item.path)
            ? 'bg-indigo-50 text-indigo-600'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
        ]"
      >
        <component
          :is="item.icon"
          class="w-5 h-5 mr-3 transition-colors"
          :class="
            route.path.startsWith(item.path)
              ? 'text-indigo-600'
              : 'text-gray-400 group-hover:text-gray-600'
          "
        />
        {{ item.name }}
      </router-link>
    </nav>

    <div class="p-4 border-t border-gray-100">
      <button
        class="flex items-center w-full px-3 py-2.5 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
        @click="handleLogout"
      >
        <LogOut class="w-5 h-5 mr-3" />
        Sign Out
      </button>
    </div>
  </aside>
</template>
