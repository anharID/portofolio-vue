<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import NavBar from '@/components/NavbarComponent.vue'
import Footer from '@/components/FooterComponent.vue'
import {
  Github,
  Linkedin,
  Instagram,
  Twitter,
  Facebook,
  ExternalLink,
  Mail,
  ArrowRight,
  Loader2,
  Send,
} from 'lucide-vue-next'

// --- State ---
const profile = ref(null)
const projects = ref([])
const certificates = ref([])
const techStack = ref([])
const loading = ref(true)

// Contact Form State
const contactForm = ref({ name: '', email: '', message: '' })
const sending = ref(false)
const sentSuccess = ref(false)

// --- Fetch Data ---
const fetchData = async () => {
  try {
    // 1. Profile
    const { data: profileData } = await supabase.from('personal_info').select('*').single()
    profile.value = profileData

    // 2. Projects (Limit 3)
    const { data: projData } = await supabase
      .from('projects')
      .select('*, project_tech_stack(tech_stack(name))')
      .order('created_at', { ascending: false })
      .limit(3)
    projects.value = projData

    // 3. Certificates (Limit 3)
    const { data: certData } = await supabase
      .from('certificates')
      .select('*')
      .order('date_issued', { ascending: false })
      .limit(3)
    certificates.value = certData

    // 4. Tech Stack (All)
    const { data: stackData } = await supabase.from('tech_stack').select('*')
    techStack.value = stackData
  } catch (error) {
    console.error('Error fetching home data:', error)
  } finally {
    loading.value = false
  }
}

// --- Submit Contact ---
const submitContact = async () => {
  if (!contactForm.value.name || !contactForm.value.email || !contactForm.value.message) return

  sending.value = true
  try {
    const { error } = await supabase.from('contacts').insert({
      name: contactForm.value.name,
      email: contactForm.value.email,
      message: contactForm.value.message,
    })

    if (error) throw error

    sentSuccess.value = true
    contactForm.value = { name: '', email: '', message: '' }
    setTimeout(() => (sentSuccess.value = false), 5000) // Reset success msg
  } catch (error) {
    alert('Gagal mengirim pesan. Silakan coba lagi.')
  } finally {
    sending.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="min-h-screen flex flex-col font-sans">
    <NavBar />

    <main class="grow pt-16">
      <div
        v-if="loading"
        class="h-screen flex items-center justify-center bg-white dark:bg-gray-900"
      >
        <Loader2 class="w-10 h-10 animate-spin text-indigo-600" />
      </div>

      <div v-else>
        <section
          id="home"
          class="relative py-20 lg:py-32 bg-white dark:bg-gray-900 overflow-hidden"
        >
          <div
            class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col-reverse lg:flex-row items-center gap-12"
          >
            <div class="flex-1 text-center lg:text-left">
              <span
                class="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider text-indigo-600 uppercase bg-indigo-50 rounded-full dark:bg-indigo-900/30 dark:text-indigo-400"
              >
                Fullstack Developer
              </span>
              <h1
                class="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight mb-6"
              >
                Hi, I'm
                <span
                  class="text-transparent bg-clip-text bg-linear-to-r from-indigo-600 to-purple-600"
                  >{{ profile?.full_name }}</span
                >
              </h1>
              <p
                class="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed"
              >
                {{ profile?.about || 'Building digital experiences with modern technologies.' }}
              </p>

              <div class="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                <a
                  href="#contact"
                  class="px-8 py-3.5 text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all shadow-lg shadow-indigo-500/30"
                >
                  Contact Me
                </a>
                <a
                  href="#projects"
                  class="px-8 py-3.5 text-base font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-all"
                >
                  View Projects
                </a>
              </div>

              <div class="mt-8 flex items-center justify-center lg:justify-start gap-5">
                <a
                  v-if="profile?.github_url"
                  :href="profile?.github_url"
                  target="_blank"
                  class="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  ><Github class="w-6 h-6"
                /></a>
                <a
                  v-if="profile?.linkedin_url"
                  :href="profile?.linkedin_url"
                  target="_blank"
                  class="text-gray-400 hover:text-blue-600 transition-colors"
                  ><Linkedin class="w-6 h-6"
                /></a>
                <a
                  v-if="profile?.instagram_url"
                  :href="profile?.instagram_url"
                  target="_blank"
                  class="text-gray-400 hover:text-pink-600 transition-colors"
                  ><Instagram class="w-6 h-6"
                /></a>
                <a
                  v-if="profile?.twitter_url"
                  :href="profile?.twitter_url"
                  target="_blank"
                  class="text-gray-400 hover:text-blue-600 transition-colors"
                  ><Twitter class="w-6 h-6"
                /></a>
                <a
                  v-if="profile?.facebook_url"
                  :href="profile?.facebook_url"
                  target="_blank"
                  class="text-gray-400 hover:text-blue-600 transition-colors"
                  ><Facebook class="w-6 h-6"
                /></a>
              </div>
            </div>

            <div class="flex-1 flex justify-center lg:justify-end">
              <div class="relative w-64 h-64 sm:w-80 sm:h-80 lg:w-[400px] lg:h-[400px]">
                <div
                  class="absolute inset-0 bg-indigo-600 rounded-full blur-3xl opacity-20 animate-pulse"
                ></div>
                <img
                  v-if="profile?.photo_url"
                  :src="profile.photo_url"
                  class="relative w-full h-full object-cover rounded-full border-4 border-white dark:border-gray-800 shadow-2xl"
                  alt="Profile"
                />
              </div>
            </div>
          </div>
        </section>

        <div
          class="py-10 bg-gray-50 dark:bg-gray-800/50 border-y border-gray-200 dark:border-gray-800"
        >
          <div class="max-w-7xl mx-auto px-4 overflow-hidden">
            <div
              class="flex flex-wrap justify-center gap-8 opacity-70 grayscale hover:grayscale-0 transition-all duration-500"
            >
              <div
                v-for="tech in techStack"
                :key="tech.id"
                class="flex items-center gap-2"
                :title="tech.name"
              >
                <img v-if="tech.icon_url" :src="tech.icon_url" class="h-8 w-8 object-contain" />
                <span v-else class="text-sm font-bold text-gray-500">{{ tech.name }}</span>
              </div>
            </div>
          </div>
        </div>

        <section id="projects" class="py-20 bg-white dark:bg-gray-900">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-end mb-12">
              <div>
                <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Featured Projects
                </h2>
                <p class="text-gray-500 dark:text-gray-400">Some of my latest works.</p>
              </div>
              <router-link
                to="/all-projects"
                class="hidden sm:flex items-center text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
              >
                View All <ArrowRight class="w-4 h-4 ml-1" />
              </router-link>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div
                v-for="project in projects"
                :key="project.id"
                class="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div class="h-48 overflow-hidden bg-gray-100 dark:bg-gray-700 relative">
                  <img
                    v-if="project.image_url"
                    :src="project.image_url"
                    class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div
                    class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4"
                  >
                    <a
                      v-if="project.demo_url"
                      :href="project.demo_url"
                      target="_blank"
                      class="p-2 bg-white rounded-full text-gray-900 hover:text-indigo-600"
                      title="Live Demo"
                      ><ExternalLink class="w-5 h-5"
                    /></a>
                    <a
                      v-if="project.github_url"
                      :href="project.github_url"
                      target="_blank"
                      class="p-2 bg-white rounded-full text-gray-900 hover:text-indigo-600"
                      title="Source Code"
                      ><Github class="w-5 h-5"
                    /></a>
                  </div>
                </div>

                <div class="p-6">
                  <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">
                    {{ project.title }}
                  </h3>
                  <div class="flex flex-wrap gap-2 mb-4">
                    <span
                      v-for="pt in project.project_tech_stack.slice(0, 3)"
                      :key="pt.tech_stack.name"
                      class="text-xs px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 rounded"
                    >
                      {{ pt.tech_stack.name }}
                    </span>
                  </div>
                  <p class="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-4">
                    {{ project.description }}
                  </p>
                </div>
              </div>
            </div>

            <div class="mt-8 text-center sm:hidden">
              <router-link
                to="/all-projects"
                class="inline-flex items-center text-indigo-600 font-medium"
              >
                View All Projects <ArrowRight class="w-4 h-4 ml-1" />
              </router-link>
            </div>
          </div>
        </section>

        <section id="certificates" class="py-20 bg-gray-50 dark:bg-gray-800/50">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-end mb-12">
              <div>
                <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Certificates</h2>
                <p class="text-gray-500 dark:text-gray-400">
                  Professional certifications & awards.
                </p>
              </div>
              <router-link
                to="/all-certificates"
                class="hidden sm:flex items-center text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
              >
                View All <ArrowRight class="w-4 h-4 ml-1" />
              </router-link>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div
                v-for="cert in certificates"
                :key="cert.id"
                class="flex gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
              >
                <div class="w-20 h-20 shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    v-if="cert.image_url"
                    :src="cert.image_url"
                    class="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 class="font-bold text-gray-900 dark:text-white line-clamp-2">
                    {{ cert.title }}
                  </h4>
                  <p class="text-sm text-indigo-600 dark:text-indigo-400 mb-1">{{ cert.issuer }}</p>
                  <p class="text-xs text-gray-500">
                    {{ new Date(cert.date_issued).toLocaleDateString() }}
                  </p>
                  <a
                    v-if="cert.certificate_url"
                    :href="cert.certificate_url"
                    target="_blank"
                    class="text-xs font-medium text-gray-400 hover:text-gray-900 dark:hover:text-white mt-2 inline-block"
                    >Verify Credential &rarr;</a
                  >
                </div>
              </div>
            </div>

            <div class="mt-8 text-center sm:hidden">
              <router-link
                to="/all-certificates"
                class="inline-flex items-center text-indigo-600 font-medium"
              >
                View All Certificates <ArrowRight class="w-4 h-4 ml-1" />
              </router-link>
            </div>
          </div>
        </section>

        <section id="contact" class="py-20 bg-white dark:bg-gray-900">
          <div class="max-w-3xl mx-auto px-4 text-center">
            <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">Get In Touch</h2>
            <p class="text-gray-600 dark:text-gray-300 mb-10">
              Have a project in mind or just want to say hi? Feel free to send me a message.
            </p>

            <form
              @submit.prevent="submitContact"
              class="space-y-4 text-left bg-gray-50 dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700"
            >
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >Name</label
                  >
                  <input
                    v-model="contactForm.name"
                    required
                    type="text"
                    class="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-colors dark:text-white"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >Email</label
                  >
                  <input
                    v-model="contactForm.email"
                    required
                    type="email"
                    class="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-colors dark:text-white"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >Message</label
                >
                <textarea
                  v-model="contactForm.message"
                  required
                  rows="4"
                  class="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-colors dark:text-white resize-none"
                  placeholder="Tell me about your project..."
                ></textarea>
              </div>

              <button
                type="submit"
                :disabled="sending"
                class="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-all flex items-center justify-center disabled:opacity-70"
              >
                <Loader2 v-if="sending" class="w-5 h-5 animate-spin mr-2" />
                <Send v-else class="w-5 h-5 mr-2" />
                {{ sending ? 'Sending...' : 'Send Message' }}
              </button>

              <div
                v-if="sentSuccess"
                class="p-3 bg-green-100 text-green-700 text-sm rounded-lg text-center mt-4"
              >
                Thank you! Your message has been sent successfully.
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>

    <Footer />
  </div>
</template>
