<script setup>
import { onMounted } from 'vue'
import AdminLayout from '@/components/admin/AdminLayout.vue'
import { usePortofolioStore } from '@/stores/portofolio'
import { FolderGit2, Award, Cpu, MessageSquare, ExternalLink } from 'lucide-vue-next'

const portofolioStore = usePortofolioStore()

onMounted(() => {
  portofolioStore.fetchStats()
  portofolioStore.fetchProfile()
})

// Data statis untuk loop card (biar kodingan rapi)
const statCards = [
  {
    title: 'Total Projects',
    key: 'projects',
    icon: FolderGit2,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    title: 'Certificates',
    key: 'certificates',
    icon: Award,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  {
    title: 'Tech Stack',
    key: 'techStack',
    icon: Cpu,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    title: 'Messages',
    key: 'unreadMessages',
    icon: MessageSquare,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
]
</script>

<template>
  <AdminLayout>
    <div class="space-y-8">
      <div
        class="bg-linear-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden"
      >
        <div class="relative z-10">
          <h1 class="text-3xl font-bold mb-2">
            Welcome back, {{ portofolioStore.profile?.full_name?.split(' ')[0] || 'Admin' }}! 👋
          </h1>
          <p class="text-indigo-100 max-w-xl">
            Portofolio kamu saat ini berjalan lancar. Kamu bisa menambahkan project baru atau
            mengecek pesan yang masuk.
          </p>

          <div class="mt-6 flex gap-3">
            <router-link
              to="/admin/projects"
              class="px-5 py-2.5 bg-white text-indigo-600 font-medium rounded-lg shadow-sm hover:bg-indigo-50 transition-colors inline-flex items-center"
            >
              Manage Projects
            </router-link>
            <a
              href="/"
              target="_blank"
              class="px-5 py-2.5 bg-indigo-500/30 text-white font-medium rounded-lg hover:bg-indigo-500/40 backdrop-blur-sm transition-colors inline-flex items-center border border-indigo-400/30"
            >
              View Live Site <ExternalLink class="w-4 h-4 ml-2" />
            </a>
          </div>
        </div>

        <div
          class="absolute -right-10 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"
        ></div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          v-for="card in statCards"
          :key="card.key"
          class="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
        >
          <div class="flex items-center justify-between mb-4">
            <div :class="`p-3 rounded-lg ${card.bg}`">
              <component :is="card.icon" :class="`w-6 h-6 ${card.color}`" />
            </div>
            <span class="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-full"
              >Updated</span
            >
          </div>
          <h3 class="text-3xl font-bold text-gray-800 mb-1">
            {{ portofolioStore.stats[card.key] }}
          </h3>
          <p class="text-sm text-gray-500">{{ card.title }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">Quick Tips</h3>
          <div class="space-y-4">
            <div class="flex gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div class="bg-blue-100 p-2 rounded-full h-fit text-blue-600">
                <FolderGit2 class="w-5 h-5" />
              </div>
              <div>
                <h4 class="font-medium text-gray-800">Update Project Secara Rutin</h4>
                <p class="text-sm text-gray-500 mt-1">
                  Menambahkan project terbaru meningkatkan kredibilitas portofolio kamu di mata
                  rekruter.
                </p>
              </div>
            </div>
            <div class="flex gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div class="bg-purple-100 p-2 rounded-full h-fit text-purple-600">
                <Award class="w-5 h-5" />
              </div>
              <div>
                <h4 class="font-medium text-gray-800">Highlight Sertifikat Utama</h4>
                <p class="text-sm text-gray-500 mt-1">
                  Pastikan sertifikat yang relevan dengan tech stack ditampilkan paling atas.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div
          class="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center text-center"
        >
          <div class="w-20 h-20 rounded-full overflow-hidden mb-4 border-2 border-indigo-100 p-1">
            <img
              v-if="portofolioStore.profile?.photo_url"
              :src="portofolioStore.profile.photo_url"
              class="w-full h-full object-cover rounded-full"
            />
            <div v-else class="w-full h-full bg-gray-200 rounded-full"></div>
          </div>
          <h3 class="font-bold text-gray-800">
            {{ portofolioStore.profile?.full_name || 'Admin' }}
          </h3>
          <p class="text-sm text-gray-500 mb-6 line-clamp-2">
            {{ portofolioStore.profile?.about || 'No bio yet.' }}
          </p>

          <router-link
            to="/admin/personal"
            class="w-full py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
          >
            Edit Profile
          </router-link>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>
