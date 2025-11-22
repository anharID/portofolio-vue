<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import AdminLayout from '@/components/admin/AdminLayout.vue'
import { Plus, Search, Edit2, Trash2, X, Loader2, Image as ImageIcon } from 'lucide-vue-next'

// --- State Management ---
const techStacks = ref([])
const loading = ref(false)
const searchQuery = ref('')

// State Modal
const showModal = ref(false)
const formLoading = ref(false)
const isEditing = ref(false)

// Pilihan Kategori (Bisa disesuaikan)
const categories = ['Frontend', 'Backend', 'Database', 'DevOps', 'Tools', 'Design', 'Mobile']

// Form Data Model
const initialForm = {
  id: null,
  name: '',
  category: 'Frontend', // Default
  icon_url: '',
}
const formData = ref({ ...initialForm })

// Upload State
const imageFile = ref(null)
const imagePreview = ref(null)

// --- Computed ---
const filteredTechStacks = computed(() => {
  if (!searchQuery.value) return techStacks.value
  return techStacks.value.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
  )
})

// --- CRUD Functions ---

// 1. READ
const fetchTechStacks = async () => {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('tech_stack')
      .select('*')
      .order('category', { ascending: true }) // Urutkan by category biar rapi

    if (error) throw error
    techStacks.value = data
  } catch (error) {
    console.error('Error fetching tech stack:', error)
  } finally {
    loading.value = false
  }
}

// 2. HANDLE UPLOAD
const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    // Validasi file (SVG/PNG diutamakan untuk icon)
    if (file.size > 1 * 1024 * 1024) {
      // 1MB Limit for icons
      alert('Ukuran file icon maksimal 1MB.')
      return
    }
    imageFile.value = file
    imagePreview.value = URL.createObjectURL(file)
  }
}

const uploadIcon = async () => {
  if (!imageFile.value) return formData.value.icon_url

  const fileExt = imageFile.value.name.split('.').pop()
  // Simpan di folder 'tech/' agar terpisah dari projects
  const fileName = `tech/${Date.now()}.${fileExt}`

  const { error } = await supabase.storage.from('portofolio').upload(fileName, imageFile.value)

  if (error) throw error

  const { data } = supabase.storage.from('portofolio').getPublicUrl(fileName)

  return data.publicUrl
}

// 3. SAVE (Create/Update)
const saveTechStack = async () => {
  formLoading.value = true
  try {
    const finalIconUrl = await uploadIcon()

    const payload = {
      name: formData.value.name,
      category: formData.value.category,
      icon_url: finalIconUrl,
      updated_at: new Date(),
    }

    if (isEditing.value) {
      const { error } = await supabase
        .from('tech_stack')
        .update(payload)
        .eq('id', formData.value.id)
      if (error) throw error
    } else {
      const { error } = await supabase.from('tech_stack').insert(payload)
      if (error) throw error
    }

    await fetchTechStacks()
    closeModal()
  } catch (error) {
    console.error('Error saving:', error)
    alert('Gagal menyimpan data.')
  } finally {
    formLoading.value = false
  }
}

// 4. DELETE
const deleteTechStack = async (id, iconUrl) => {
  if (
    !confirm(
      'Hapus tech stack ini? Project yang menggunakan ini mungkin akan kehilangan referensi iconnya.',
    )
  )
    return

  try {
    const { error } = await supabase.from('tech_stack').delete().eq('id', id)
    if (error) throw error

    // Hapus file icon dari storage jika ada
    if (iconUrl) {
      const path = iconUrl.split('/portofolio/')[1]
      if (path) await supabase.storage.from('portofolio').remove([path])
    }

    techStacks.value = techStacks.value.filter((item) => item.id !== id)
  } catch (error) {
    console.error('Error deleting:', error)
    alert('Gagal menghapus data.')
  }
}

// --- Helper Functions ---
const openModal = (item = null) => {
  if (item) {
    isEditing.value = true
    formData.value = { ...item }
    imagePreview.value = item.icon_url
  } else {
    isEditing.value = false
    formData.value = { ...initialForm }
    imagePreview.value = null
  }
  imageFile.value = null
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

// Helper untuk warna badge kategori
const getCategoryColor = (category) => {
  const colors = {
    Frontend: 'bg-blue-100 text-blue-700 border-blue-200',
    Backend: 'bg-green-100 text-green-700 border-green-200',
    Database: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    DevOps: 'bg-purple-100 text-purple-700 border-purple-200',
    Design: 'bg-pink-100 text-pink-700 border-pink-200',
    Tools: 'bg-gray-100 text-gray-700 border-gray-200',
  }
  return colors[category] || 'bg-gray-100 text-gray-600'
}

onMounted(() => {
  fetchTechStacks()
})
</script>

<template>
  <AdminLayout>
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <h2 class="text-2xl font-bold text-gray-800">Tech Stack</h2>
        <p class="text-gray-500 text-sm mt-1">
          Daftar teknologi, bahasa pemrograman, dan tools yang dikuasai.
        </p>
      </div>

      <button
        @click="openModal()"
        class="flex items-center justify-center px-4 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-all shadow-sm active:scale-95"
      >
        <Plus class="w-5 h-5 mr-2" /> Add Tech
      </button>
    </div>

    <div class="mb-6">
      <div class="relative max-w-md">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari teknologi (e.g. Vue, Python)..."
          class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white"
        />
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-20">
      <Loader2 class="w-8 h-8 text-indigo-600 animate-spin" />
    </div>

    <div v-else class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20"
              >
                Icon
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Name
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Category
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-if="filteredTechStacks.length === 0">
              <td colspan="4" class="px-6 py-10 text-center text-gray-500 text-sm">
                Data tidak ditemukan.
              </td>
            </tr>

            <tr
              v-for="item in filteredTechStacks"
              :key="item.id"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div
                  class="h-10 w-10 rounded-lg bg-gray-100 border border-gray-200 p-1.5 flex items-center justify-center"
                >
                  <img
                    v-if="item.icon_url"
                    :src="item.icon_url"
                    class="w-full h-full object-contain"
                    :alt="item.name"
                  />
                  <ImageIcon v-else class="w-5 h-5 text-gray-400" />
                </div>
              </td>

              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm font-medium text-gray-900">{{ item.name }}</span>
              </td>

              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
                  :class="getCategoryColor(item.category)"
                >
                  {{ item.category }}
                </span>
              </td>

              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex items-center justify-end gap-2">
                  <button
                    @click="openModal(item)"
                    class="p-2 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                  >
                    <Edit2 class="w-4 h-4" />
                  </button>
                  <button
                    @click="deleteTechStack(item.id, item.icon_url)"
                    class="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div
      v-if="showModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      @click.self="closeModal"
    >
      <div class="bg-white rounded-xl w-full max-w-md shadow-2xl flex flex-col">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 class="text-lg font-bold text-gray-800">
            {{ isEditing ? 'Edit Tech Stack' : 'Add Tech Stack' }}
          </h3>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="p-6 space-y-5">
          <div class="flex items-center gap-4">
            <div
              class="w-16 h-16 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center shrink-0 overflow-hidden relative group cursor-pointer"
              @click="$refs.fileInput.click()"
            >
              <img
                v-if="imagePreview"
                :src="imagePreview"
                class="w-full h-full object-contain p-2"
              />
              <ImageIcon v-else class="w-6 h-6 text-gray-400" />
              <div
                class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <span class="text-xs text-white font-medium">Change</span>
              </div>
            </div>
            <div class="flex-1">
              <label class="block text-sm font-medium text-gray-700 mb-1">Icon / Logo</label>
              <input
                ref="fileInput"
                type="file"
                @change="handleFileChange"
                accept="image/*"
                class="block w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Technology Name</label>
            <input
              v-model="formData.name"
              type="text"
              placeholder="e.g. Vue.js"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              v-model="formData.category"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
            >
              <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
          </div>
        </div>

        <div
          class="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-xl"
        >
          <button
            @click="closeModal"
            class="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg"
          >
            Cancel
          </button>
          <button
            @click="saveTechStack"
            :disabled="formLoading"
            class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center"
          >
            <Loader2 v-if="formLoading" class="w-4 h-4 animate-spin mr-2" />
            {{ formLoading ? 'Saving...' : 'Save' }}
          </button>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>
