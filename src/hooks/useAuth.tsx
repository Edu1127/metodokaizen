import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, storageKey } from '@/lib/supabase'
import { Profile } from '@/types/profile'

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error?: string }>
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ error?: string }>
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
        
        let session = null
        
        // Check for persisted session
        const persistedSessionStr = localStorage.getItem(storageKey)
        if (persistedSessionStr) {
          try {
            const persistedSession = JSON.parse(persistedSessionStr)
            console.log('🔐 AuthProvider: Sessão persistida encontrada, tentando restaurar')
            
            console.log('🔐 AuthProvider: Restaurando sessão via setSession')
            const { data, error } = await supabase.auth.setSession({
              access_token: persistedSession.access_token,
              refresh_token: persistedSession.refresh_token
            })

            if (error) {
              console.log('🔐 AuthProvider: Erro ao restaurar sessão:', error.message)
              localStorage.removeItem(storageKey)
            } else if (data.session) {
              console.log('🔐 AuthProvider: Sessão restaurada com sucesso')
              session = data.session
              // Atualizar o token no storage caso tenha sido renovado
              localStorage.setItem(storageKey, JSON.stringify(data.session))
            }
          } catch (error) {
            console.error('❌ AuthProvider: Erro ao carregar sessão persistida:', error)
            localStorage.removeItem(storageKey)
          }
        }
        
        // If no session from persisted, try getSession
        if (!session) {
          // Adicionar timeout de 10 segundos para evitar travamento
          const sessionPromise = supabase.auth.getSession()
          const timeoutPromise = new Promise<any>((resolve) => {
            setTimeout(() => {
              console.warn('⚠️ AuthProvider: Timeout atingido, assumindo sem sessão')
              resolve({ data: { session: null }, error: null })
            }, 10000)
          })
          
          const result = await Promise.race([sessionPromise, timeoutPromise])
          const { data: { session: currentSession }, error: sessionError } = result
          
          console.log('🔐 AuthProvider: getSession retornou:', { session: !!currentSession, error: sessionError })
          
          if (sessionError) {
            console.error('❌ AuthProvider: Erro ao carregar sessão:', sessionError)
          }
          
          session = currentSession
        }
        
        if (!mounted) {
          console.log('⚠️ AuthProvider: Componente desmontado, abortando')
          return
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
    
    // Listen for auth changes first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return
        
        console.log('🔐 AuthProvider: onAuthStateChange event:', event, 'session:', !!session, 'user:', !!session?.user)

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          // Se existe uma sessão salva (usuário marcou "manter conectado"), atualiza ela
          if (session && localStorage.getItem(storageKey)) {
            localStorage.setItem(storageKey, JSON.stringify(session))
          }
        }

        if (event === 'SIGNED_OUT') {
          localStorage.removeItem(storageKey)
        }
        
        // Setar session e user PRIMEIRO
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          console.log('👤 AuthProvider: Carregando profile para', session.user.email)
          
          // Carregar profile com timeout
          const loadProfile = async () => {
            try {
              const { data: profileData } = await withTimeout(
                supabase
                  .from('profiles')
                  .select('*')
                  .eq('id', session.user.id)
                  .single(),
                5000
              )
              if (mounted) {
                setProfile(profileData)
                console.log('👤 AuthProvider: Profile carregado')
              }
            } catch (error) {
              console.error('Error loading profile in onAuthStateChange:', error)
            }
          }
          
          // Carregar profile em background
          loadProfile()
          
          // Desativar loading imediatamente quando temos um usuário válido
          if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && mounted) {
            console.log('🔓 AuthProvider: Desativando loading após', event)
            setLoading(false)
          }
        } else {
          setProfile(null)
          console.log('👤 AuthProvider: Nenhum usuário na sessão')
        }
      }
    )

    // Initialize auth first
    console.log('🚀 AuthProvider: Chamando initializeAuth()')
    initializeAuth()

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
        30000
      )
      console.log('✅ signUp: Conta criada', { user: result.data?.user?.email })
      return { error: result.error?.message }
    } catch (err: any) {
      console.error('❌ signUp error:', err)
      return { error: err.message || 'Erro ao criar conta. Tente novamente.' }
    }
  }

  const signIn = async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      console.log('🔐 signIn: Tentando login para', email, 'rememberMe:', rememberMe)
      const result = await withTimeout(
        supabase.auth.signInWithPassword({
          email,
          password,
        }),
        30000
      )
      if (result.error) {
        console.error('❌ signIn error:', result.error)
        return { error: result.error.message }
      }
      console.log('✅ signIn: Login bem sucedido', { user: result.data?.user?.email })
      
      // If remember me, persist the session in localStorage
      if (rememberMe && result.data.session) {
        localStorage.setItem(storageKey, JSON.stringify(result.data.session))
        console.log('💾 signIn: saved to localStorage')
      } else {
        console.log('🗑️ signIn: not saving to localStorage')
      }
      
      return { error: undefined }
    } catch (err: any) {
      console.error('❌ signIn error:', err)
      return { error: err.message || 'Erro ao fazer login. Tente novamente.' }
    }
  }

  const signOut = async () => {
    try {
      console.log('🚪 signOut: Fazendo logout')
      await withTimeout(supabase.auth.signOut(), 10000)
      localStorage.removeItem(storageKey)
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