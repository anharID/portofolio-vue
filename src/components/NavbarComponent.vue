<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Menu, X, Moon, Sun, Code2 } from 'lucide-vue-next'

const isMenuOpen = ref(false)
const isDark = ref(false)

// Fungsi Update Class di HTML
const applyTheme = (dark) => {
  if (dark) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
  isDark.value = dark
}

// Toggle Manual (Button Click)
const toggleTheme = () => {
  const newTheme = !isDark.value
  applyTheme(newTheme)
  // Simpan pilihan user agar diingat saat refresh
  localStorage.setItem('theme', newTheme ? 'dark' : 'light')
}

// Listener untuk memantau perubahan tema sistem (Real-time)
const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

const handleSystemThemeChange = (e) => {
  // Hanya ikuti sistem jika user BELUM pernah set manual di localStorage
  if (!localStorage.getItem('theme')) {
    applyTheme(e.matches)
  }
}

onMounted(() => {
  // 1. Cek apakah ada simpanan manual user?
  const savedTheme = localStorage.getItem('theme')

  if (savedTheme) {
    // Jika ada, pakai itu
    applyTheme(savedTheme === 'dark')
  } else {
    // Jika tidak ada, pakai tema perangkat saat ini
    applyTheme(mediaQuery.matches)
  }

  // 2. Pasang pendengar perubahan sistem
  mediaQuery.addEventListener('change', handleSystemThemeChange)
})

onUnmounted(() => {
  // Bersihkan listener saat komponen di-destroy (best practice)
  mediaQuery.removeEventListener('change', handleSystemThemeChange)
})

const navLinks = [
  { name: 'Home', href: '/#home' },
  { name: 'Projects', href: '/#projects' },
  { name: 'Certificates', href: '/#certificates' },
  { name: 'Contact', href: '/#contact' },
]
</script>

<template>
  <header
    class="fixed top-0 w-full z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-colors duration-300"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <router-link
          to="/"
          class="flex items-center gap-2 font-bold text-xl text-indigo-600 dark:text-indigo-400"
        >
          <Code2 class="w-8 h-8" />
          <span>Anhar<span class="text-gray-800 dark:text-white">.</span></span>
        </router-link>

        <nav class="hidden md:flex items-center gap-8">
          <a
            v-for="link in navLinks"
            :key="link.name"
            :href="link.href"
            class="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            {{ link.name }}
          </a>

          <button
            @click="toggleTheme"
            class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-300 ring-1 ring-gray-200 dark:ring-gray-700"
            :title="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
          >
            <Sun v-if="isDark" class="w-5 h-5 text-yellow-400" />
            <Moon v-else class="w-5 h-5 text-gray-600" />
          </button>
        </nav>

        <div class="flex items-center gap-4 md:hidden">
          <button @click="toggleTheme" class="text-gray-600 dark:text-gray-300 p-2">
            <Sun v-if="isDark" class="w-5 h-5 text-yellow-400" />
            <Moon v-else class="w-5 h-5" />
          </button>

          <button @click="isMenuOpen = !isMenuOpen" class="text-gray-800 dark:text-white p-2">
            <Menu v-if="!isMenuOpen" class="w-6 h-6" />
            <X v-else class="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="isMenuOpen"
      class="md:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 shadow-xl"
    >
      <div class="px-4 pt-2 pb-6 space-y-1">
        <a
          v-for="link in navLinks"
          :key="link.name"
          :href="link.href"
          @click="isMenuOpen = false"
          class="block px-3 py-3 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-indigo-600"
        >
          {{ link.name }}
        </a>
      </div>
    </div>
  </header>
</template>
