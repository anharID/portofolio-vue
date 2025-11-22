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
  Loader2,
  Image as ImageIcon,
  Award,
  Calendar,
} from 'lucide-vue-next'

// --- State Management ---
const certificates = ref([])
const loading = ref(false)
const searchQuery = ref('')

// State Modal
const showModal = ref(false)
const formLoading = ref(false)
const isEditing = ref(false)

// Form Data Model
const initialForm = {
  id: null,
  title: '',
  issuer: '',
  date_issued: '',
  certificate_url: '', // Link ke kredensial asli (opsional)
  image_url: '',
}
const formData = ref({ ...initialForm })

// Upload State
const imageFile = ref(null)
const imagePreview = ref(null)

// --- Computed ---
const filteredCertificates = computed(() => {
  if (!searchQuery.value) return certificates.value
  const query = searchQuery.value.toLowerCase()
  return certificates.value.filter(
    (c) => c.title.toLowerCase().includes(query) || c.issuer.toLowerCase().includes(query),
  )
})

// --- CRUD Functions ---

// 1. READ
const fetchCertificates = async () => {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .order('date_issued', { ascending: false }) // Urutkan dari yang terbaru

    if (error) throw error
    certificates.value = data
  } catch (error) {
    console.error('Error fetching certificates:', error)
  } finally {
    loading.value = false
  }
}

// 2. HANDLE UPLOAD
const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran file maksimal 2MB.')
      return
    }
    imageFile.value = file
    imagePreview.value = URL.createObjectURL(file)
  }
}

const uploadImage = async () => {
  if (!imageFile.value) return formData.value.image_url

  const fileExt = imageFile.value.name.split('.').pop()
  // Simpan di folder 'certificates/'
  const fileName = `certificates/${Date.now()}.${fileExt}`

  const { error } = await supabase.storage.from('portofolio').upload(fileName, imageFile.value)

  if (error) throw error

  const { data } = supabase.storage.from('portofolio').getPublicUrl(fileName)

  return data.publicUrl
}

// 3. SAVE (Create/Update)
const saveCertificate = async () => {
  formLoading.value = true
  try {
    const finalImageUrl = await uploadImage()

    const payload = {
      title: formData.value.title,
      issuer: formData.value.issuer,
      date_issued: formData.value.date_issued,
      certificate_url: formData.value.certificate_url,
      image_url: finalImageUrl,
      updated_at: new Date(),
    }

    if (isEditing.value) {
      const { error } = await supabase
        .from('certificates')
        .update(payload)
        .eq('id', formData.value.id)
      if (error) throw error
    } else {
      const { error } = await supabase.from('certificates').insert(payload)
      if (error) throw error
    }

    await fetchCertificates()
    closeModal()
  } catch (error) {
    console.error('Error saving:', error)
    alert('Gagal menyimpan data: ' + error.message)
  } finally {
    formLoading.value = false
  }
}

// 4. DELETE
const deleteCertificate = async (id, imageUrl) => {
  if (!confirm('Yakin ingin menghapus sertifikat ini?')) return

  try {
    const { error } = await supabase.from('certificates').delete().eq('id', id)
    if (error) throw error

    if (imageUrl) {
      const path = imageUrl.split('/portofolio/')[1]
      if (path) await supabase.storage.from('portofolio').remove([path])
    }

    certificates.value = certificates.value.filter((c) => c.id !== id)
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
    imagePreview.value = item.image_url
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

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

onMounted(() => {
  fetchCertificates()
})
</script>

<template>
  <AdminLayout>
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <h2 class="text-2xl font-bold text-gray-800">Certificates</h2>
        <p class="text-gray-500 text-sm mt-1">Kelola sertifikat, lisensi, dan penghargaan.</p>
      </div>

      <button
        @click="openModal()"
        class="flex items-center justify-center px-4 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-all shadow-sm active:scale-95"
      >
        <Plus class="w-5 h-5 mr-2" /> Add Certificate
      </button>
    </div>

    <div class="mb-6">
      <div class="relative max-w-md">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari sertifikat..."
          class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white"
        />
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-20">
      <Loader2 class="w-8 h-8 text-indigo-600 animate-spin" />
    </div>

    <div
      v-else-if="certificates.length === 0"
      class="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300"
    >
      <div class="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
        <Award class="w-8 h-8 text-gray-400" />
      </div>
      <h3 class="text-lg font-medium text-gray-900">Belum ada sertifikat</h3>
      <p class="text-gray-500 text-sm mt-1">Tambahkan pencapaian terbaikmu.</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="cert in filteredCertificates"
        :key="cert.id"
        class="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col h-full"
      >
        <div class="relative h-48 bg-gray-100 overflow-hidden border-b border-gray-100">
          <img
            v-if="cert.image_url"
            :src="cert.image_url"
            class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            alt="Certificate"
          />
          <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
            <Award class="w-10 h-10" />
          </div>

          <div
            class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2"
          >
            <button
              @click="openModal(cert)"
              class="p-2 bg-white text-gray-700 rounded-lg hover:text-indigo-600"
              title="Edit"
            >
              <Edit2 class="w-5 h-5" />
            </button>
            <button
              @click="deleteCertificate(cert.id, cert.image_url)"
              class="p-2 bg-white text-gray-700 rounded-lg hover:text-red-600"
              title="Delete"
            >
              <Trash2 class="w-5 h-5" />
            </button>
          </div>
        </div>

        <div class="p-5 flex flex-col flex-1">
          <h3 class="font-bold text-gray-800 mb-1 line-clamp-2">{{ cert.title }}</h3>
          <p class="text-sm text-indigo-600 font-medium mb-3">{{ cert.issuer }}</p>

          <div
            class="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 text-sm"
          >
            <div class="flex items-center text-gray-500">
              <Calendar class="w-4 h-4 mr-2" />
              {{ formatDate(cert.date_issued) }}
            </div>

            <a
              v-if="cert.certificate_url"
              :href="cert.certificate_url"
              target="_blank"
              class="text-gray-400 hover:text-indigo-600 transition-colors flex items-center gap-1"
              title="View Credential"
            >
              <span class="text-xs">Verify</span>
              <ExternalLink class="w-4 h-4" />
            </a>
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
        class="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col"
      >
        <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 class="text-lg font-bold text-gray-800">
            {{ isEditing ? 'Edit Certificate' : 'Add Certificate' }}
          </h3>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="p-6 space-y-5">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Certificate Image</label>
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
                <p class="text-xs text-gray-400 mt-2">Upload bukti sertifikat (JPG/PNG)</p>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Certificate Title</label>
            <input
              v-model="formData.title"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="e.g. AWS Certified Developer"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Issuer / Organization</label
            >
            <input
              v-model="formData.issuer"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="e.g. Amazon Web Services"
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Date Issued</label>
              <input
                v-model="formData.date_issued"
                type="date"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Credential URL</label>
              <input
                v-model="formData.certificate_url"
                type="url"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="https://..."
              />
            </div>
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
            @click="saveCertificate"
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
