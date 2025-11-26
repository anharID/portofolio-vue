<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import NavBar from '@/components/NavbarComponent.vue'
import Footer from '@/components/FooterComponent.vue'
import { Search, ArrowLeft, Loader2, Award, ExternalLink, Calendar } from 'lucide-vue-next'

const certificates = ref([])
const loading = ref(true)
const searchQuery = ref('')

const fetchCertificates = async () => {
  try {
    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .order('date_issued', { ascending: false })

    if (error) throw error
    certificates.value = data
  } catch (error) {
    console.error('Error:', error)
  } finally {
    loading.value = false
  }
}

const filteredCertificates = computed(() => {
  if (!searchQuery.value) return certificates.value
  const query = searchQuery.value.toLowerCase()
  return certificates.value.filter(
    (c) => c.title.toLowerCase().includes(query) || c.issuer.toLowerCase().includes(query),
  )
})

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long' })
}

onMounted(() => fetchCertificates())
</script>

<template>
  <div
    class="min-h-screen flex flex-col font-sans bg-gray-50 dark:bg-gray-900 transition-colors duration-300"
  >
    <NavBar />

    <main class="grow pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      <div class="mb-12 text-center sm:text-left">
        <router-link
          to="/"
          class="inline-flex items-center text-sm text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 mb-6 transition-colors"
        >
          <ArrowLeft class="w-4 h-4 mr-2" /> Back to Home
        </router-link>

        <h1 class="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
          My
          <span class="text-transparent bg-clip-text bg-linear-to-r from-indigo-600 to-purple-600"
            >Certificates</span
          >
        </h1>
        <p class="text-lg text-gray-600 dark:text-gray-300 max-w-2xl">
          Bukti kompetensi profesional, lisensi, dan penghargaan yang telah saya raih selama
          perjalanan karir.
        </p>
      </div>

      <div class="mb-10 max-w-md mx-auto sm:mx-0 relative group">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search
            class="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors"
          />
        </div>
        <input
          v-model="searchQuery"
          type="text"
          class="block w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-sm"
          placeholder="Cari sertifikat atau penerbit..."
        />
      </div>

      <div v-if="loading" class="flex justify-center py-32">
        <Loader2 class="w-10 h-10 text-indigo-600 animate-spin" />
      </div>

      <div v-else-if="filteredCertificates.length === 0" class="text-center py-20">
        <Award class="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <h3 class="text-lg font-medium text-gray-900 dark:text-white">Tidak ditemukan</h3>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="cert in filteredCertificates"
          :key="cert.id"
          class="group bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
        >
          <div
            class="aspect-video w-full bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden mb-5 relative border border-gray-100 dark:border-gray-600"
          >
            <img
              v-if="cert.image_url"
              :src="cert.image_url"
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div v-else class="w-full h-full flex items-center justify-center text-gray-300">
              <Award class="w-10 h-10" />
            </div>

            <a
              v-if="cert.certificate_url"
              :href="cert.certificate_url"
              target="_blank"
              class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
            >
              <span
                class="px-4 py-2 bg-white text-gray-900 rounded-full font-bold text-sm flex items-center gap-2 hover:bg-indigo-50"
              >
                Verify Credential <ExternalLink class="w-4 h-4" />
              </span>
            </a>
          </div>

          <div>
            <div
              class="flex items-center gap-2 mb-2 text-xs font-semibold tracking-wide text-indigo-600 dark:text-indigo-400 uppercase"
            >
              <Award class="w-4 h-4" />
              {{ cert.issuer }}
            </div>

            <h3
              class="text-lg font-bold text-gray-900 dark:text-white mb-2 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors"
            >
              {{ cert.title }}
            </h3>

            <div
              class="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700"
            >
              <Calendar class="w-4 h-4 mr-2" />
              Issued: {{ formatDate(cert.date_issued) }}
            </div>
          </div>
        </div>
      </div>
    </main>
    <Footer />
  </div>
</template>
