<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import AdminLayout from '@/components/admin/AdminLayout.vue'
import { Save, Upload, Loader2, User } from 'lucide-vue-next'

const loading = ref(false)
const uploading = ref(false)
const avatarFile = ref(null)
const previewUrl = ref(null)

const formData = ref({
  id: null,
  full_name: '',
  about: '',
  photo_url: '',
  linkedin_url: '',
  github_url: '',
  instagram_url: '',
  facebook_url: '',
  twitter_url: '',
  threads_url: '',
})

const fetchData = async () => {
  loading.value = true
  try {
    const { data, error } = await supabase.from('personal_info').select('*').single()

    if (error && error.code !== 'PGRST116') throw error // PGRST116 = data kosong (aman)

    if (data) {
      formData.value = { ...data }
      previewUrl.value = data.photo_url
    }
  } catch (error) {
    console.error('Error fetching data:', error)
    alert('Gagal mengambil data profil.')
  } finally {
    loading.value = false
  }
}

const handleFileChange = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  previewUrl.value = URL.createObjectURL(file)
  avatarFile.value = file
}

const uploadAvatar = async () => {
  if (!avatarFile.value) return formData.value.photo_url

  uploading.value = true
  const fileExt = avatarFile.value.name.split('.').pop()
  const fileName = `avatar-${Date.now()}.${fileExt}`
  const filePath = `avatars/${fileName}`

  try {
    const { error: uploadError } = await supabase.storage
      .from('portofolio')
      .upload(filePath, avatarFile.value)

    if (uploadError) throw uploadError

    const { data } = supabase.storage.from('portofolio').getPublicUrl(filePath)

    return data.publicUrl
  } catch (error) {
    console.error('Upload failed:', error)
    alert('Gagal upload foto.')
    throw error
  } finally {
    uploading.value = false
  }
}

const saveProfile = async () => {
  loading.value = true
  try {
    let finalPhotoUrl = formData.value.photo_url
    if (avatarFile.value) {
      finalPhotoUrl = await uploadAvatar()
    }

    const payload = {
      ...formData.value,
      photo_url: finalPhotoUrl,
      updated_at: new Date(),
    }

    if (!payload.id) delete payload.id

    const { data, error } = await supabase.from('personal_info').upsert(payload).select().single()

    if (error) throw error

    formData.value = data
    alert('Profil berhasil disimpan!')
  } catch (error) {
    console.error('Error saving profile:', error)
    alert('Gagal menyimpan perubahan.')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <AdminLayout>
    <div class="max-w-4xl mx-auto">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 class="text-2xl font-bold text-gray-800">Personal Information</h2>
          <p class="text-gray-500 text-sm mt-1">Kelola data diri dan foto profil utama Anda.</p>
        </div>

        <button
          @click="saveProfile"
          :disabled="loading || uploading"
          class="flex items-center justify-center px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95"
        >
          <Loader2 v-if="loading || uploading" class="w-5 h-5 animate-spin mr-2" />
          <Save v-else class="w-5 h-5 mr-2" />
          {{ loading ? 'Saving...' : 'Save Changes' }}
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-1">
          <div
            class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm text-center sticky top-24"
          >
            <label class="block text-sm font-medium text-gray-700 mb-4">Profile Photo</label>

            <div class="relative w-40 h-40 mx-auto mb-6 group cursor-pointer">
              <div
                class="w-full h-full rounded-full overflow-hidden border-4 border-gray-100 bg-gray-50 flex items-center justify-center shadow-inner"
              >
                <img
                  v-if="previewUrl"
                  :src="previewUrl"
                  class="w-full h-full object-cover"
                  alt="Profile Preview"
                />
                <User v-else class="w-16 h-16 text-gray-300" />
              </div>

              <div
                class="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                @click="$refs.fileInput.click()"
              >
                <Upload class="text-white w-8 h-8" />
              </div>
            </div>

            <input
              type="file"
              ref="fileInput"
              class="hidden"
              accept="image/*"
              @change="handleFileChange"
            />

            <button
              type="button"
              @click="$refs.fileInput.click()"
              class="text-sm text-indigo-600 font-medium hover:text-indigo-800"
            >
              Change Photo
            </button>
            <p class="text-xs text-gray-400 mt-2">Recommended: Square JPG, PNG</p>
          </div>
        </div>

        <div class="lg:col-span-2 space-y-6">
          <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 class="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <User class="w-5 h-5 text-indigo-500" /> Basic Info
            </h3>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  v-model="formData.full_name"
                  type="text"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  placeholder="e.g. John Doe"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">About Me</label>
                <textarea
                  v-model="formData.about"
                  rows="5"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
                  placeholder="Write a short bio about yourself..."
                ></textarea>
              </div>
            </div>
          </div>

          <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 class="text-base font-semibold text-gray-800 mb-4">Social Media & Links</h3>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                v-for="(url, key) in {
                  LinkedIn: 'linkedin_url',
                  GitHub: 'github_url',
                  Instagram: 'instagram_url',
                  Facebook: 'facebook_url',
                  'Twitter/X': 'twitter_url',
                  Threads: 'threads_url',
                }"
                :key="key"
              >
                <label class="block text-xs font-medium text-gray-500 mb-1 uppercase">{{
                  key
                }}</label>
                <input
                  v-model="formData[url]"
                  type="url"
                  class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm"
                  :placeholder="'https://' + key.toLowerCase() + '.com/...'"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>
