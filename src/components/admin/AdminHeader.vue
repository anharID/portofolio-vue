<script setup>
defineProps({
  title: { type: String, default: 'Dashboard' },
})
</script>

<template>
  <header
    class="h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-20"
  >
    <h2 class="text-lg font-semibold text-gray-800">{{ title }}</h2>
    <div class="flex items-center gap-4">
      <div class="flex items-center gap-3">
        <div class="text-right hidden sm:block">
          <p class="text-sm font-medium text-gray-700">Admin</p>
        </div>
        <div
          class="h-9 w-9 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold"
        >
          A
        </div>
      </div>
    </div>
  </header>
</template>
