<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import NavBar from '@/components/NavbarComponent.vue'
import Footer from '@/components/FooterComponent.vue'
import { Github, ExternalLink, Search, ArrowLeft, Loader2, Filter, X } from 'lucide-vue-next'

const projects = ref([])
const loading = ref(true)
const searchQuery = ref('')
const selectedTech = ref('All')
const availableTechs = ref(['All'])

// State untuk Modal Read More
const selectedProject = ref(null)

// --- Fetch Data ---
const fetchProjects = async () => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*, project_tech_stack(tech_stack(name))')
      .order('created_at', { ascending: false })

    if (error) throw error
    projects.value = data

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
    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.value.toLowerCase())

    const projectTechs = project.project_tech_stack.map((pt) => pt.tech_stack.name)
    const matchesTech = selectedTech.value === 'All' || projectTechs.includes(selectedTech.value)

    return matchesSearch && matchesTech
  })
})

const resetFilter = () => {
  selectedTech.value = 'All'
  searchQuery.value = ''
}

// --- Modal Logic ---
const openModal = (project) => {
  selectedProject.value = project
  document.body.style.overflow = 'hidden' // Mencegah scroll body saat modal buka
}

const closeModal = () => {
  selectedProject.value = null
  document.body.style.overflow = 'auto' // Mengembalikan scroll
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
      <div class="mb-8">
        <router-link
          to="/"
          class="inline-flex items-center text-sm text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 mb-6 transition-colors"
        >
          <ArrowLeft class="w-4 h-4 mr-2" /> Back to Home
        </router-link>

        <h1 class="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
          All
          <span
            class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600"
          >
            Projects
          </span>
        </h1>
        <p class="text-lg text-gray-600 dark:text-gray-300 max-w-2xl">
          Koleksi lengkap hasil karya, eksperimen koding, dan aplikasi yang telah saya bangun.
        </p>
      </div>

      <div
        class="sticky top-20 z-30 mb-10 p-2 md:p-3 rounded-2xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-gray-200/60 dark:border-gray-700/60 shadow-lg shadow-gray-200/20 dark:shadow-black/20 transition-all duration-300 flex flex-col md:flex-row gap-3 items-center justify-between"
      >
        <div class="relative w-full md:w-80 group">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search
              class="h-4 w-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors"
            />
          </div>
          <input
            v-model="searchQuery"
            type="text"
            class="block w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-800 transition-all"
            placeholder="Cari project..."
          />
        </div>

        <div class="w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
          <div class="flex space-x-2 px-1">
            <button
              v-for="tech in availableTechs"
              :key="tech"
              @click="selectedTech = tech"
              class="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 border"
              :class="
                selectedTech === tech
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/30'
                  : 'bg-transparent text-gray-600 dark:text-gray-300 border-transparent hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-indigo-600 dark:hover:text-indigo-400'
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
              <button
                @click="openModal(project)"
                class="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 px-4 py-2 bg-white/20 backdrop-blur-md text-white border border-white/50 rounded-full font-medium hover:bg-white hover:text-black"
              >
                View Details
              </button>
            </div>
          </div>

          <div class="p-6 flex flex-col flex-1">
            <div class="flex justify-between items-start mb-3">
              <h3
                class="text-xl font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1"
              >
                {{ project.title }}
              </h3>
            </div>

            <div class="flex flex-wrap gap-2 mb-4">
              <span
                v-for="pt in project.project_tech_stack.slice(0, 3)"
                :key="pt.tech_stack.name"
                class="px-2.5 py-1 text-xs font-medium rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
              >
                {{ pt.tech_stack.name }}
              </span>
              <span
                v-if="project.project_tech_stack.length > 3"
                class="px-2.5 py-1 text-xs font-medium rounded-md bg-gray-50 dark:bg-gray-800 text-gray-500"
              >
                +{{ project.project_tech_stack.length - 3 }}
              </span>
            </div>

            <p
              class="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-2 flex-1 leading-relaxed"
            >
              {{ project.description }}
            </p>

            <button
              @click="openModal(project)"
              class="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline mb-4 text-left w-fit"
            >
              Read more...
            </button>

            <div
              class="pt-4 border-t border-gray-100 dark:border-gray-700 mt-auto flex items-center justify-between text-xs text-gray-400"
            >
              <span>{{ new Date(project.created_at).toLocaleDateString() }}</span>

              <div class="flex gap-3">
                <a
                  v-if="project.demo_url"
                  :href="project.demo_url"
                  target="_blank"
                  class="hover:text-indigo-500"
                >
                  <ExternalLink class="w-4 h-4" />
                </a>
                <a
                  v-if="project.github_url"
                  :href="project.github_url"
                  target="_blank"
                  class="hover:text-indigo-500"
                >
                  <Github class="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <div
      v-if="selectedProject"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      <div
        @click="closeModal"
        class="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      ></div>

      <div
        class="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto flex flex-col animate-in fade-in zoom-in-95 duration-200"
      >
        <button
          @click="closeModal"
          class="absolute top-4 right-4 z-10 p-2 bg-white/80 dark:bg-black/50 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <X class="w-5 h-5 text-gray-700 dark:text-white" />
        </button>

        <div class="w-full h-64 sm:h-80 bg-gray-200 dark:bg-gray-800 shrink-0">
          <img
            v-if="selectedProject.image_url"
            :src="selectedProject.image_url"
            class="w-full h-full object-cover"
          />
        </div>

        <div class="p-6 sm:p-8">
          <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {{ selectedProject.title }}
          </h2>

          <div class="flex flex-wrap gap-2 mb-6">
            <span
              v-for="pt in selectedProject.project_tech_stack"
              :key="pt.tech_stack.name"
              class="px-3 py-1 text-sm font-medium rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800"
            >
              {{ pt.tech_stack.name }}
            </span>
          </div>

          <div
            class="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 mb-8 leading-relaxed whitespace-pre-line"
          >
            {{ selectedProject.description }}
          </div>

          <div
            class="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-100 dark:border-gray-800"
          >
            <a
              v-if="selectedProject.demo_url"
              :href="selectedProject.demo_url"
              target="_blank"
              class="flex-1 inline-flex justify-center items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors shadow-lg shadow-indigo-500/30"
            >
              <ExternalLink class="w-5 h-5 mr-2" /> Live Demo
            </a>
            <a
              v-if="selectedProject.github_url"
              :href="selectedProject.github_url"
              target="_blank"
              class="flex-1 inline-flex justify-center items-center px-6 py-3 bg-gray-900 dark:bg-gray-800 hover:bg-black dark:hover:bg-gray-700 text-white rounded-xl font-semibold transition-colors border border-gray-700"
            >
              <Github class="w-5 h-5 mr-2" /> Source Code
            </a>
          </div>
        </div>
      </div>
    </div>

    <Footer />
  </div>
</template>
