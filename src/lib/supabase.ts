import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const projectRef = supabaseUrl ? supabaseUrl.split('.')[0].split('//')[1] : ''
const storageKey = `sb-${projectRef}-auth-token`

console.log('🔧 Supabase Config:', {
  url: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'MISSING',
  key: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'MISSING',
  projectRef,
  storageKey
})

let supabase: any

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables. Please check your .env.local file.')
  // Create a dummy client to prevent crashes
  const dummyClient = {
    auth: {
      getSession: () => {
        console.warn('⚠️ Using dummy Supabase client - not configured')
        return Promise.resolve({ data: { session: null }, error: { message: 'Supabase not configured' } })
      },
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signUp: () => Promise.resolve({ error: { message: 'Supabase not configured' } }),
      signInWithPassword: () => Promise.resolve({ error: { message: 'Supabase not configured' } }),
      signOut: () => Promise.resolve({ error: null })
    }
  }
  supabase = dummyClient
} else {
  console.log('✅ Creating Supabase client with persistence')
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: false,
      detectSessionInUrl: false,
    }
  })
  console.log('✅ Supabase client created successfully with persistence')
}

export { supabase, storageKey }