<script setup>
import AdminSidebar from './AdminSidebar.vue'
import AdminHeader from './AdminHeader.vue'
</script>

<template>
  <div class="min-h-screen bg-gray-50 font-sans">
    <AdminSidebar />
    <div class="ml-64 transition-all duration-300">
      <AdminHeader />
      <main class="p-8">
        <slot />
      </main>
    </div>
  </div>
</template>
