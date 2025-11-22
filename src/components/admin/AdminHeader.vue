<script setup>
import { onMounted } from 'vue'
import { usePortofolioStore } from '@/stores/portofolio'
import { Menu } from 'lucide-vue-next' // Import icon Menu

defineProps({
  title: { type: String, default: 'Dashboard' },
})

// Emit event untuk buka sidebar
defineEmits(['toggleSidebar'])

const portofolioStore = usePortofolioStore()

onMounted(() => {
  if (!portofolioStore.profile) {
    portofolioStore.fetchProfile()
  }
})
</script>

<template>
  <header
    class="h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-20"
  >
    <div class="flex items-center gap-4">
      <button
        @click="$emit('toggleSidebar')"
        class="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
      >
        <Menu class="w-6 h-6" />
      </button>

      <h2 class="text-lg font-semibold text-gray-800">{{ title }}</h2>
    </div>

    <div class="flex items-center gap-4">
      <div class="flex items-center gap-3">
        <div class="text-right hidden sm:block">
          <p class="text-sm font-medium text-gray-700">
            {{ portofolioStore.profile?.full_name || 'Admin' }}
          </p>
          <p class="text-xs text-gray-500">Administrator</p>
        </div>

        <div class="h-9 w-9 rounded-full bg-gray-100 border border-gray-200 overflow-hidden">
          <img
            v-if="portofolioStore.profile?.photo_url"
            :src="portofolioStore.profile.photo_url"
            class="w-full h-full object-cover"
          />
          <div
            v-else
            class="w-full h-full flex items-center justify-center text-gray-400 font-bold"
          >
            A
          </div>
        </div>
      </div>
    </div>
  </header>
</template>
