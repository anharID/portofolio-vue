import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'vue-router'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const router = useRouter()
  const loading = ref(false)

  // Fungsi Login
  const signIn = async (email, password) => {
    loading.value = true
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    loading.value = false

    if (error) throw error

    user.value = data.user
    return data
  }

  // Fungsi Logout
  const signOut = async () => {
    await supabase.auth.signOut()
    user.value = null
    router.push('/login')
  }

  // Cek Session saat aplikasi refresh
  const fetchUser = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (session) {
      user.value = session.user
    }
  }

  return { user, signIn, signOut, fetchUser, loading }
})
