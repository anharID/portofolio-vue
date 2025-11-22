<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import AdminLayout from '@/components/admin/AdminLayout.vue'
import { Search, Trash2, Mail, X, Loader2, MessageSquare, Calendar } from 'lucide-vue-next'

// --- State ---
const messages = ref([])
const loading = ref(false)
const searchQuery = ref('')

// State Modal Detail
const selectedMessage = ref(null)

// --- Computed ---
const filteredMessages = computed(() => {
  if (!searchQuery.value) return messages.value
  const query = searchQuery.value.toLowerCase()
  return messages.value.filter(
    (m) =>
      m.name.toLowerCase().includes(query) ||
      m.email.toLowerCase().includes(query) ||
      m.message.toLowerCase().includes(query),
  )
})

// --- Functions ---

// 1. READ (Fetch Messages)
const fetchMessages = async () => {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false }) // Pesan terbaru di atas

    if (error) throw error
    messages.value = data
  } catch (error) {
    console.error('Error fetching messages:', error)
  } finally {
    loading.value = false
  }
}

// 2. DELETE
const deleteMessage = async (id, event) => {
  // Stop propagation agar tidak membuka modal detail saat klik delete
  if (event) event.stopPropagation()

  if (!confirm('Hapus pesan ini secara permanen?')) return

  try {
    const { error } = await supabase.from('contacts').delete().eq('id', id)
    if (error) throw error

    // Update state
    messages.value = messages.value.filter((m) => m.id !== id)

    // Jika pesan yang dihapus sedang dibuka di modal, tutup modal
    if (selectedMessage.value && selectedMessage.value.id === id) {
      closeModal()
    }
  } catch (error) {
    console.error('Error deleting:', error)
    alert('Gagal menghapus pesan.')
  }
}

// --- Helper Functions ---
const openModal = (msg) => {
  selectedMessage.value = msg
}

const closeModal = () => {
  selectedMessage.value = null
}

// Format Tanggal (Contoh: 22 Nov 2023, 14:30)
const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Format "Waktu Lalu" (Contoh: 2 jam yang lalu)
const timeAgo = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now - date) / 1000)

  let interval = seconds / 31536000
  if (interval > 1) return Math.floor(interval) + ' tahun lalu'
  interval = seconds / 2592000
  if (interval > 1) return Math.floor(interval) + ' bulan lalu'
  interval = seconds / 86400
  if (interval > 1) return Math.floor(interval) + ' hari lalu'
  interval = seconds / 3600
  if (interval > 1) return Math.floor(interval) + ' jam lalu'
  interval = seconds / 60
  if (interval > 1) return Math.floor(interval) + ' menit lalu'
  return 'Baru saja'
}

onMounted(() => {
  fetchMessages()
})
</script>

<template>
  <AdminLayout>
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <h2 class="text-2xl font-bold text-gray-800">Messages</h2>
        <p class="text-gray-500 text-sm mt-1">Kotak masuk pesan dari formulir kontak website.</p>
      </div>

      <div
        class="bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-100 text-indigo-700 text-sm font-medium"
      >
        {{ messages.length }} Pesan Masuk
      </div>
    </div>

    <div class="mb-6">
      <div class="relative max-w-md">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari pengirim atau isi pesan..."
          class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white"
        />
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-20">
      <Loader2 class="w-8 h-8 text-indigo-600 animate-spin" />
    </div>

    <div
      v-else-if="messages.length === 0"
      class="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300"
    >
      <div class="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
        <MessageSquare class="w-8 h-8 text-gray-400" />
      </div>
      <h3 class="text-lg font-medium text-gray-900">Tidak ada pesan</h3>
      <p class="text-gray-500 text-sm mt-1">Belum ada pengunjung yang mengirim pesan.</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="msg in filteredMessages"
        :key="msg.id"
        @click="openModal(msg)"
        class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col h-full relative"
      >
        <div class="flex justify-between items-start mb-4">
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm"
            >
              {{ msg.name.charAt(0).toUpperCase() }}
            </div>
            <div>
              <h4 class="font-bold text-gray-800 text-sm line-clamp-1">{{ msg.name }}</h4>
              <p class="text-xs text-gray-500">{{ timeAgo(msg.created_at) }}</p>
            </div>
          </div>
        </div>

        <p class="text-gray-600 text-sm mb-6 line-clamp-3 flex-1">
          {{ msg.message }}
        </p>

        <div class="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
          <a
            :href="`mailto:${msg.email}`"
            @click.stop
            class="text-indigo-600 hover:text-indigo-800 text-xs font-medium flex items-center"
          >
            <Mail class="w-3.5 h-3.5 mr-1.5" /> Reply
          </a>

          <button
            @click="deleteMessage(msg.id, $event)"
            class="text-gray-400 hover:text-red-600 transition-colors p-1 rounded-md hover:bg-red-50"
            title="Hapus pesan"
          >
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="selectedMessage"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      @click.self="closeModal"
    >
      <div
        class="bg-white rounded-xl w-full max-w-lg shadow-2xl flex flex-col animate-in fade-in zoom-in duration-200"
      >
        <div
          class="px-6 py-5 border-b border-gray-100 flex items-start justify-between bg-gray-50 rounded-t-xl"
        >
          <div class="flex items-center gap-4">
            <div
              class="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center text-indigo-600 font-bold text-xl shadow-sm"
            >
              {{ selectedMessage.name.charAt(0).toUpperCase() }}
            </div>
            <div>
              <h3 class="text-lg font-bold text-gray-800">{{ selectedMessage.name }}</h3>
              <p class="text-sm text-gray-500">{{ selectedMessage.email }}</p>
            </div>
          </div>
          <button
            @click="closeModal"
            class="text-gray-400 hover:text-gray-600 bg-white p-1 rounded-full border border-transparent hover:border-gray-200 transition-all"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="p-6 max-h-[60vh] overflow-y-auto">
          <div
            class="flex items-center gap-2 mb-4 text-xs text-gray-400 uppercase tracking-wider font-medium"
          >
            <Calendar class="w-3 h-3" />
            {{ formatDate(selectedMessage.created_at) }}
          </div>

          <div class="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
            {{ selectedMessage.message }}
          </div>
        </div>

        <div
          class="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-xl"
        >
          <button
            @click="deleteMessage(selectedMessage.id, null)"
            class="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
          >
            Delete
          </button>
          <a
            :href="`mailto:${selectedMessage.email}`"
            class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center shadow-sm"
          >
            <Mail class="w-4 h-4 mr-2" /> Reply via Email
          </a>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>
