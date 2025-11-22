import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export const usePortofolioStore = defineStore('portofolio', () => {
  const profile = ref(null)
  const stats = ref({
    projects: 0,
    certificates: 0,
    techStack: 0,
    unreadMessages: 0,
  })

  // 1. Fetch Data Profil (Nama, Foto, dll)
  const fetchProfile = async () => {
    const { data } = await supabase.from('personal_info').select('*').single()

    if (data) profile.value = data
  }

  // 2. Fetch Statistik (Hitung jumlah baris data)
  const fetchStats = async () => {
    // Hitung Projects
    const { count: projectsCount } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })

    // Hitung Certificates
    const { count: certsCount } = await supabase
      .from('certificates')
      .select('*', { count: 'exact', head: true })

    // Hitung Tech Stack
    const { count: stackCount } = await supabase
      .from('tech_stack')
      .select('*', { count: 'exact', head: true })

    // Hitung Pesan (Contacts)
    const { count: msgCount } = await supabase
      .from('contacts')
      .select('*', { count: 'exact', head: true })

    stats.value = {
      projects: projectsCount || 0,
      certificates: certsCount || 0,
      techStack: stackCount || 0,
      unreadMessages: msgCount || 0,
    }
  }

  return { profile, stats, fetchProfile, fetchStats }
})
