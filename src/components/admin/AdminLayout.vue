<script setup>
import { ref } from 'vue'
import AdminSidebar from './AdminSidebar.vue'
import AdminHeader from './AdminHeader.vue'

// State untuk mengontrol Sidebar di Mobile
const isSidebarOpen = ref(false)

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const closeSidebar = () => {
  isSidebarOpen.value = false
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 font-sans">
    <div
      v-if="isSidebarOpen"
      @click="closeSidebar"
      class="fixed inset-0 bg-black/50 z-20 md:hidden transition-opacity"
    ></div>

    <AdminSidebar :is-open="isSidebarOpen" @close="closeSidebar" />

    <div class="transition-all duration-300 md:ml-64">
      <AdminHeader @toggle-sidebar="toggleSidebar" />

      <main class="p-4 sm:p-8">
        <slot />
      </main>
    </div>
  </div>
</template>
