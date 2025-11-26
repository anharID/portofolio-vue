<script setup>
const year = new Date().getFullYear()
</script>

<template>
  <footer
    class="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-8 transition-colors duration-300"
  >
    <div class="max-w-7xl mx-auto px-4 text-center">
      <p class="text-gray-500 dark:text-gray-400 text-sm">
        © {{ year }} Built with Vue 3, Tailwind & Supabase. All rights reserved.
      </p>
    </div>
  </footer>
</template>
