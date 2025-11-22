<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import AdminLayout from '@/components/admin/AdminLayout.vue'
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  ExternalLink,
  Github,
  Loader2,
  Image as ImageIcon,
  Check,
} from 'lucide-vue-next'

// --- State Management ---
const projects = ref([])
const allTechStacks = ref([]) // Menyimpan daftar semua tech stack untuk pilihan di form
const loading = ref(false)
const searchQuery = ref('') // State untuk pencarian

// State untuk Modal Form
const showModal = ref(false)
const formLoading = ref(false)
const isEditing = ref(false)

// Form Data Model
const initialForm = {
  id: null,
  title: '',
  description: '',
  image_url: '',
  demo_url: '',
  github_url: '',
}
const formData = ref({ ...initialForm })
const selectedTechIds = ref([]) // Array untuk menyimpan ID tech stack yang dipilih

// State khusus Upload
const imageFile = ref(null)
const imagePreview = ref(null)

// --- Computed Properties ---
// Filter projects berdasarkan search query
const filteredProjects = computed(() => {
  if (!searchQuery.value) return projects.value
  return projects.value.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.value.toLowerCase()),
  )
})

// --- CRUD Functions ---

// 1. READ (Fetch Data Projects & Tech Stacks)
const loadInitialData = async () => {
  loading.value = true
  try {
    // A. Fetch Projects beserta relasi Tech Stack-nya
    const { data: projectsData, error: projectsError } = await supabase
      .from('projects')
      .select(
        `
        *,
        project_tech_stack (
          tech_stack ( id, name, icon_url, category )
        )
      `,
      )
      .order('created_at', { ascending: false })

    if (projectsError) throw projectsError

    // Flatten data structure agar mudah dibaca di template
    // Mengubah structure nested object menjadi array tech_stack langsung di dalam project
    projects.value = projectsData.map((p) => ({
      ...p,
      tech_stack: p.project_tech_stack.map((pts) => pts.tech_stack),
    }))

    // B. Fetch All Tech Stacks (Untuk opsi pilihan di Form)
    const { data: techData, error: techError } = await supabase
      .from('tech_stack')
      .select('*')
      .order('name')

    if (techError) throw techError
    allTechStacks.value = techData
  } catch (error) {
    console.error('Error loading data:', error)
  } finally {
    loading.value = false
  }
}

// 2. HANDLE IMAGE UPLOAD
const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    // Validasi ukuran (optional, misal 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran file terlalu besar! Maksimal 2MB.')
      return
    }
    imageFile.value = file
    imagePreview.value = URL.createObjectURL(file)
  }
}

const uploadImage = async () => {
  if (!imageFile.value) return formData.value.image_url

  const fileExt = imageFile.value.name.split('.').pop()
  const fileName = `projects/${Date.now()}.${fileExt}` // Simpan di folder projects/

  const { error: uploadError } = await supabase.storage
    .from('portofolio')
    .upload(fileName, imageFile.value)

  if (uploadError) throw uploadError

  const { data } = supabase.storage.from('portofolio').getPublicUrl(fileName)

  return data.publicUrl
}

// 3. CREATE & UPDATE (Save Logic with Relations)
const saveProject = async () => {
  formLoading.value = true
  try {
    // Upload gambar dulu jika ada file baru
    const finalImageUrl = await uploadImage()

    const projectPayload = {
      title: formData.value.title,
      description: formData.value.description,
      demo_url: formData.value.demo_url,
      github_url: formData.value.github_url,
      image_url: finalImageUrl,
      updated_at: new Date(),
    }

    let projectId = formData.value.id

    // Step A: Simpan Data Project Utama
    if (isEditing.value) {
      // Update
      const { error } = await supabase.from('projects').update(projectPayload).eq('id', projectId)
      if (error) throw error
    } else {
      // Insert
      const { data, error } = await supabase
        .from('projects')
        .insert(projectPayload)
        .select()
        .single()
      if (error) throw error
      projectId = data.id // Ambil ID dari project baru
    }

    // Step B: Update Relasi Tech Stack (Many-to-Many)
    // 1. Hapus semua relasi lama untuk project ini
    const { error: deleteRelError } = await supabase
      .from('project_tech_stack')
      .delete()
      .eq('project_id', projectId)
    if (deleteRelError) throw deleteRelError

    // 2. Insert relasi baru (jika ada yang dipilih)
    if (selectedTechIds.value.length > 0) {
      const relationPayload = selectedTechIds.value.map((techId) => ({
        project_id: projectId,
        tech_stack_id: techId,
      }))

      const { error: insertRelError } = await supabase
        .from('project_tech_stack')
        .insert(relationPayload)
      if (insertRelError) throw insertRelError
    }

    // Refresh data & tutup modal
    await loadInitialData()
    closeModal()
  } catch (error) {
    console.error('Error saving project:', error)
    alert('Gagal menyimpan project: ' + error.message)
  } finally {
    formLoading.value = false
  }
}

// 4. DELETE
const deleteProject = async (id, imageUrl) => {
  if (!confirm('Apakah Anda yakin ingin menghapus project ini?')) return

  try {
    const { error } = await supabase.from('projects').delete().eq('id', id)
    if (error) throw error

    // Opsional: Hapus gambar dari storage agar hemat
    if (imageUrl) {
      const path = imageUrl.split('/portofolio/')[1] // Ambil path relatif
      if (path) {
        await supabase.storage.from('portofolio').remove([path])
      }
    }

    // Update state lokal
    projects.value = projects.value.filter((p) => p.id !== id)
  } catch (error) {
    console.error('Error deleting:', error)
    alert('Gagal menghapus project.')
  }
}

// --- Helper Functions ---

// Toggle checkbox tech stack
const toggleTechStack = (id) => {
  if (selectedTechIds.value.includes(id)) {
    selectedTechIds.value = selectedTechIds.value.filter((i) => i !== id)
  } else {
    selectedTechIds.value.push(id)
  }
}

const openModal = (project = null) => {
  if (project) {
    isEditing.value = true
    formData.value = { ...project }
    imagePreview.value = project.image_url
    // Populate selectedTechIds dari data yang ada
    selectedTechIds.value = project.tech_stack ? project.tech_stack.map((t) => t.id) : []
  } else {
    isEditing.value = false
    formData.value = { ...initialForm }
    imagePreview.value = null
    selectedTechIds.value = []
  }
  imageFile.value = null
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

onMounted(() => {
  loadInitialData()
})
</script>

<template>
  <AdminLayout>
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <h2 class="text-2xl font-bold text-gray-800">Projects</h2>
        <p class="text-gray-500 text-sm mt-1">Kelola daftar portofolio project kamu.</p>
      </div>

      <button
        @click="openModal()"
        class="flex items-center justify-center px-4 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-all shadow-sm active:scale-95"
      >
        <Plus class="w-5 h-5 mr-2" />
        Add New Project
      </button>
    </div>

    <div class="mb-6">
      <div class="relative max-w-md">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari project..."
          class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white"
        />
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-20">
      <Loader2 class="w-8 h-8 text-indigo-600 animate-spin" />
    </div>

    <div
      v-else-if="projects.length === 0"
      class="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300"
    >
      <div class="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
        <ImageIcon class="w-8 h-8 text-gray-400" />
      </div>
      <h3 class="text-lg font-medium text-gray-900">Belum ada project</h3>
      <p class="text-gray-500 text-sm mt-1">Mulai tambahkan karya terbaikmu sekarang.</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="project in filteredProjects"
        :key="project.id"
        class="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col h-full"
      >
        <div class="relative h-48 bg-gray-100 overflow-hidden border-b border-gray-100">
          <img
            v-if="project.image_url"
            :src="project.image_url"
            class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            alt="Project Thumbnail"
          />
          <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
            <ImageIcon class="w-10 h-10" />
          </div>

          <div
            class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2"
          >
            <button
              @click="openModal(project)"
              class="p-2 bg-white text-gray-700 rounded-lg hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
              title="Edit"
            >
              <Edit2 class="w-5 h-5" />
            </button>
            <button
              @click="deleteProject(project.id, project.image_url)"
              class="p-2 bg-white text-gray-700 rounded-lg hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Delete"
            >
              <Trash2 class="w-5 h-5" />
            </button>
          </div>
        </div>

        <div class="p-5 flex flex-col flex-1">
          <h3 class="font-bold text-gray-800 mb-2 line-clamp-1">{{ project.title }}</h3>

          <div class="flex flex-wrap gap-1.5 mb-3">
            <span
              v-for="tech in project.tech_stack"
              :key="tech.id"
              class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100"
            >
              {{ tech.name }}
            </span>
            <span
              v-if="!project.tech_stack || project.tech_stack.length === 0"
              class="text-xs text-gray-400 italic"
            >
              No tech stack selected
            </span>
          </div>

          <p class="text-sm text-gray-500 mb-4 line-clamp-3 flex-1">{{ project.description }}</p>

          <div class="flex items-center gap-3 mt-auto pt-4 border-t border-gray-100">
            <a
              v-if="project.github_url"
              :href="project.github_url"
              target="_blank"
              class="text-gray-400 hover:text-gray-800 transition-colors"
            >
              <Github class="w-5 h-5" />
            </a>
            <a
              v-if="project.demo_url"
              :href="project.demo_url"
              target="_blank"
              class="text-gray-400 hover:text-indigo-600 transition-colors"
            >
              <ExternalLink class="w-5 h-5" />
            </a>
            <span class="text-xs text-gray-300 ml-auto">
              {{ new Date(project.created_at).toLocaleDateString() }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="showModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      @click.self="closeModal"
    >
      <div
        class="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col"
      >
        <div
          class="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10"
        >
          <h3 class="text-lg font-bold text-gray-800">
            {{ isEditing ? 'Edit Project' : 'Add New Project' }}
          </h3>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
            <X class="w-6 h-6" />
          </button>
        </div>

        <div class="p-6 space-y-5">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Thumbnail</label>
            <div class="flex items-start gap-4">
              <div
                class="w-32 h-24 bg-gray-100 rounded-lg border border-gray-200 overflow-hidden shrink-0"
              >
                <img v-if="imagePreview" :src="imagePreview" class="w-full h-full object-cover" />
                <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
                  <ImageIcon class="w-8 h-8" />
                </div>
              </div>
              <div class="flex-1">
                <input
                  type="file"
                  @change="handleFileChange"
                  accept="image/*"
                  class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
                <p class="text-xs text-gray-400 mt-2">PNG, JPG, GIF up to 2MB</p>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Project Title</label>
            <input
              v-model="formData.title"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="e.g. E-Commerce App"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              v-model="formData.description"
              rows="4"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
              placeholder="Explain tech stack, features, etc."
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Technologies Used</label>

            <div
              v-if="allTechStacks.length === 0"
              class="p-3 bg-yellow-50 text-yellow-700 text-sm rounded-lg border border-yellow-200"
            >
              Belum ada data Tech Stack. Silakan tambahkan di menu "Tech Stack" terlebih dahulu.
            </div>

            <div
              v-else
              class="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 border border-gray-200 rounded-lg bg-gray-50"
            >
              <div
                v-for="tech in allTechStacks"
                :key="tech.id"
                @click="toggleTechStack(tech.id)"
                class="flex items-center px-3 py-2 rounded-lg border cursor-pointer transition-all select-none"
                :class="
                  selectedTechIds.includes(tech.id)
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-sm'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                "
              >
                <div
                  class="w-4 h-4 rounded border flex items-center justify-center mr-2 transition-colors"
                  :class="
                    selectedTechIds.includes(tech.id)
                      ? 'bg-indigo-600 border-indigo-600'
                      : 'border-gray-300 bg-white'
                  "
                >
                  <Check v-if="selectedTechIds.includes(tech.id)" class="w-3 h-3 text-white" />
                </div>
                <span class="text-sm truncate">{{ tech.name }}</span>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">GitHub URL</label>
              <input
                v-model="formData.github_url"
                type="url"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="https://github.com/..."
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Demo URL</label>
              <input
                v-model="formData.demo_url"
                type="url"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="https://my-app.vercel.app"
              />
            </div>
          </div>
        </div>

        <div
          class="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 sticky bottom-0"
        >
          <button
            @click="closeModal"
            class="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            @click="saveProject"
            :disabled="formLoading"
            class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-70 flex items-center"
          >
            <Loader2 v-if="formLoading" class="w-4 h-4 animate-spin mr-2" />
            {{ formLoading ? 'Saving...' : isEditing ? 'Update Project' : 'Create Project' }}
          </button>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>
