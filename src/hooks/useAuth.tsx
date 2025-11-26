import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { Profile } from '@/types/profile'

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error?: string }>
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

// Helper para adicionar timeout em operações do Supabase
const withTimeout = <T,>(promise: Promise<T>, timeoutMs: number = 5000): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error(`Timeout após ${timeoutMs}ms`)), timeoutMs)
    )
  ])
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    console.log('🔄 AuthProvider: Iniciando useEffect')
    
    // Get initial session with timeout
    const initializeAuth = async () => {
      console.log('🔐 AuthProvider: Iniciando initializeAuth')
      try {
        console.log('🔐 AuthProvider: Chamando getSession()')
        
        // Adicionar timeout de 3 segundos para evitar travamento
        const sessionPromise = supabase.auth.getSession()
        const timeoutPromise = new Promise<any>((resolve) => {
          setTimeout(() => {
            console.warn('⚠️ AuthProvider: Timeout atingido, assumindo sem sessão')
            resolve({ data: { session: null }, error: null })
          }, 3000)
        })
        
        const result = await Promise.race([sessionPromise, timeoutPromise])
        const { data: { session }, error: sessionError } = result
        
        console.log('🔐 AuthProvider: getSession retornou:', { session: !!session, error: sessionError })
        
        if (!mounted) {
          console.log('⚠️ AuthProvider: Componente desmontado, abortando')
          return
        }
        
        if (sessionError) {
          console.error('❌ AuthProvider: Erro ao carregar sessão:', sessionError)
        }
        
        console.log('✅ AuthProvider: Sessão carregada, user:', session?.user?.email || 'nenhum')
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          try {
            console.log('👤 AuthProvider: Buscando profile do usuário')
            const { data: profileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single()
            console.log('👤 AuthProvider: Profile carregado:', profileData)
            if (mounted) {
              setProfile(profileData)
            }
          } catch (profileError) {
            console.error('❌ AuthProvider: Erro ao carregar profile:', profileError)
          }
        }
        
        if (mounted) {
          console.log('✅ AuthProvider: Finalizando inicialização, setLoading(false)')
          setLoading(false)
        }
      } catch (error) {
        console.error('💥 AuthProvider: Erro fatal ao inicializar:', error)
        if (mounted) {
          setSession(null)
          setUser(null)
          setProfile(null)
          setLoading(false)
        }
      }
    }
    
    // Initialize auth first
    console.log('🚀 AuthProvider: Chamando initializeAuth()')
    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return
        
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          try {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single()
            if (mounted) {
              setProfile(profileData)
            }
          } catch (error) {
            console.error('Error loading profile in onAuthStateChange:', error)
          }
        } else {
          setProfile(null)
        }
        
        if (mounted) {
          setLoading(false)
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      console.log('🔐 signUp: Criando conta para', email)
      const result = await withTimeout(
        supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName || ''
            }
          }
        }),
        5000
      )
      console.log('✅ signUp: Conta criada', { user: result.data?.user?.email })
      return { error: result.error?.message }
    } catch (err: any) {
      console.error('❌ signUp error:', err)
      return { error: err.message || 'Erro ao criar conta. Tente novamente.' }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔐 signIn: Tentando login para', email)
      const result = await withTimeout(
        supabase.auth.signInWithPassword({
          email,
          password,
        }),
        5000
      )
      console.log('✅ signIn: Login bem sucedido', { user: result.data?.user?.email })
      return { error: result.error?.message }
    } catch (err: any) {
      console.error('❌ signIn error:', err)
      return { error: err.message || 'Erro ao fazer login. Tente novamente.' }
    }
  }

  const signOut = async () => {
    try {
      console.log('🚪 signOut: Fazendo logout')
      await withTimeout(supabase.auth.signOut(), 3000)
      console.log('✅ signOut: Logout concluído')
    } catch (err) {
      console.error('❌ signOut error:', err)
    }
  }

  const value = {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}