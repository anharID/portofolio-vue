<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import NavBar from '@/components/NavbarComponent.vue'
import Footer from '@/components/FooterComponent.vue'
import { Github, ExternalLink, Search, ArrowLeft, Loader2, Filter } from 'lucide-vue-next'

const projects = ref([])
const loading = ref(true)
const searchQuery = ref('')
const selectedTech = ref('All')
const availableTechs = ref(['All']) // Akan diisi otomatis dari data

// --- Fetch Data ---
const fetchProjects = async () => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*, project_tech_stack(tech_stack(name))')
      .order('created_at', { ascending: false })

    if (error) throw error
    projects.value = data

    // Ambil daftar unik semua teknologi yang dipakai
    const techSet = new Set()
    data.forEach((p) => {
      p.project_tech_stack.forEach((pt) => {
        techSet.add(pt.tech_stack.name)
      })
    })
    availableTechs.value = ['All', ...Array.from(techSet).sort()]
  } catch (error) {
    console.error('Error:', error)
  } finally {
    loading.value = false
  }
}

// --- Filter Logic ---
const filteredProjects = computed(() => {
  return projects.value.filter((project) => {
    // 1. Filter by Search Text
    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.value.toLowerCase())

    // 2. Filter by Tech Stack Badge
    const projectTechs = project.project_tech_stack.map((pt) => pt.tech_stack.name)
    const matchesTech = selectedTech.value === 'All' || projectTechs.includes(selectedTech.value)

    return matchesSearch && matchesTech
  })
})

const resetFilter = () => {
  selectedTech.value = 'All'
  searchQuery.value = ''
}

onMounted(() => {
  fetchProjects()
})
</script>

<template>
  <div
    class="min-h-screen flex flex-col font-sans bg-gray-50 dark:bg-gray-900 transition-colors duration-300"
  >
    <NavBar />

    <main class="grow pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      <div class="mb-12">
        <router-link
          to="/"
          class="inline-flex items-center text-sm text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 mb-6 transition-colors"
        >
          <ArrowLeft class="w-4 h-4 mr-2" /> Back to Home
        </router-link>

        <h1 class="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
          All
          <span class="text-transparent bg-clip-text bg-linear-to-r from-indigo-600 to-purple-600"
            >Projects</span
          >
        </h1>
        <p class="text-lg text-gray-600 dark:text-gray-300 max-w-2xl">
          Koleksi lengkap hasil karya, eksperimen koding, dan aplikasi yang telah saya bangun.
        </p>
      </div>

      <div
        class="flex flex-col md:flex-row gap-4 mb-10 items-center justify-between sticky top-20 z-30 bg-gray-50/90 dark:bg-gray-900/90 backdrop-blur-sm py-4"
      >
        <div class="relative w-full md:w-96 group">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search
              class="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors"
            />
          </div>
          <input
            v-model="searchQuery"
            type="text"
            class="block w-full pl-10 pr-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-sm"
            placeholder="Cari project..."
          />
        </div>

        <div class="w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          <div class="flex space-x-2">
            <button
              v-for="tech in availableTechs"
              :key="tech"
              @click="selectedTech = tech"
              class="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 border"
              :class="
                selectedTech === tech
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/30'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-gray-700'
              "
            >
              {{ tech }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="loading" class="flex justify-center py-32">
        <Loader2 class="w-10 h-10 text-indigo-600 animate-spin" />
      </div>

      <div v-else-if="filteredProjects.length === 0" class="text-center py-20">
        <div class="inline-flex p-4 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
          <Filter class="w-8 h-8 text-gray-400" />
        </div>
        <h3 class="text-lg font-medium text-gray-900 dark:text-white">Project tidak ditemukan</h3>
        <p class="text-gray-500 mt-1">Coba ubah kata kunci pencarian atau filter kategori.</p>
        <button @click="resetFilter" class="mt-4 text-indigo-600 hover:underline">
          Reset Filter
        </button>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div
          v-for="project in filteredProjects"
          :key="project.id"
          class="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col h-full"
        >
          <div class="h-52 overflow-hidden bg-gray-100 dark:bg-gray-700 relative">
            <img
              v-if="project.image_url"
              :src="project.image_url"
              class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
            />

            <div
              class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4 backdrop-blur-sm"
            >
              <a
                v-if="project.demo_url"
                :href="project.demo_url"
                target="_blank"
                class="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75 flex items-center gap-2 px-5 py-2.5 bg-white text-gray-900 rounded-full font-bold hover:bg-indigo-500 hover:text-white"
              >
                <ExternalLink class="w-4 h-4" /> Demo
              </a>
              <a
                v-if="project.github_url"
                :href="project.github_url"
                target="_blank"
                class="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-100 p-3 bg-gray-900 text-white rounded-full hover:bg-black border border-gray-700"
              >
                <Github class="w-5 h-5" />
              </a>
            </div>
          </div>

          <div class="p-6 flex flex-col flex-1">
            <div class="flex justify-between items-start mb-3">
              <h3
                class="text-xl font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors"
              >
                {{ project.title }}
              </h3>
            </div>

            <div class="flex flex-wrap gap-2 mb-4">
              <span
                v-for="pt in project.project_tech_stack"
                :key="pt.tech_stack.name"
                class="px-2.5 py-1 text-xs font-medium rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
              >
                {{ pt.tech_stack.name }}
              </span>
            </div>

            <p
              class="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-4 flex-1 leading-relaxed"
            >
              {{ project.description }}
            </p>

            <div
              class="pt-4 border-t border-gray-100 dark:border-gray-700 mt-auto flex items-center justify-between text-xs text-gray-400"
            >
              <span>{{ new Date(project.created_at).toLocaleDateString() }}</span>
            </div>
          </div>
        </div>
      </div>
    </main>

    <Footer />
  </div>
</template>
