<script setup>
import {
  LayoutDashboard,
  FolderGit2,
  Cpu,
  Award,
  MessageSquare,
  User,
  LogOut,
} from 'lucide-vue-next'
import { useRoute } from 'vue-router'

const route = useRoute()

const menuItems = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Personal Info', path: '/admin/personal', icon: User },
  { name: 'Projects', path: '/admin/projects', icon: FolderGit2 },
  { name: 'Tech Stack', path: '/admin/tech-stack', icon: Cpu },
  { name: 'Certificates', path: '/admin/certificates', icon: Award },
  { name: 'Messages', path: '/admin/messages', icon: MessageSquare },
]
</script>

<template>
  <aside
    class="w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 flex flex-col z-10"
  >
    <div class="h-16 flex items-center px-6 border-b border-gray-100">
      <h1 class="text-xl font-bold text-gray-800 tracking-tight">
        MyPortfolio<span class="text-indigo-600">.</span>
      </h1>
    </div>

    <nav class="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
      <router-link
        v-for="item in menuItems"
        :key="item.path"
        :to="item.path"
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
        class="flex items-center w-full px-3 py-2.5 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
      >
        <LogOut class="w-5 h-5 mr-3" />
        Sign Out
      </button>
    </div>
  </aside>
</template>
