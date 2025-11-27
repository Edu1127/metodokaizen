import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('🔧 Supabase Config:', {
  url: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'MISSING',
  key: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'MISSING'
})

let supabase: any
let supabasePersistent: any

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables. Please check your .env.local file.')
  // Create dummy clients to prevent crashes
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
  supabasePersistent = dummyClient
} else {
  console.log('✅ Creating Supabase clients')
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
      storage: undefined,
      flowType: 'implicit'
    }
  })
  supabasePersistent = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      storage: window.localStorage,
      flowType: 'implicit'
    }
  })
  console.log('✅ Supabase clients created successfully')
}

export { supabase, supabasePersistent }