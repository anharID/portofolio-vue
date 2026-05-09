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

  // Home Page State
  const projects = ref([])
  const certificates = ref([])
  const techStack = ref([])

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

  // 3. Fetch Data untuk Halaman Home
  const fetchHomeData = async () => {
    try {
      if (!profile.value) {
        await fetchProfile()
      }

      // Projects (Limit 3)
      const { data: projData } = await supabase
        .from('projects')
        .select('*, project_tech_stack(tech_stack(name))')
        .order('created_at', { ascending: false })
        .limit(3)
      if (projData) projects.value = projData

      // Certificates (Limit 3)
      const { data: certData } = await supabase
        .from('certificates')
        .select('*')
        .order('date_issued', { ascending: false })
        .limit(3)
      if (certData) certificates.value = certData

      // Tech Stack (All)
      const { data: stackData } = await supabase.from('tech_stack').select('*')
      if (stackData) techStack.value = stackData
    } catch (error) {
      console.error('Error fetching home data:', error)
      throw error
    }
  }

  // 4. Submit Contact Message
  const submitContactMessage = async (contactData) => {
    const { error } = await supabase.from('contacts').insert(contactData)
    if (error) throw error
  }

  return {
    profile,
    stats,
    projects,
    certificates,
    techStack,
    fetchProfile,
    fetchStats,
    fetchHomeData,
    submitContactMessage,
  }
})
