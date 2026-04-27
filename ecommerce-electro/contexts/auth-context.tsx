'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Session, User as SupabaseUser } from '@supabase/supabase-js'

export interface UserProfile {
  id: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  address_street: string | null
  address_apartment: string | null
  address_city: string | null
  address_province: string | null
  address_postal_code: string | null
  address_country: string | null
  role: 'client' | 'admin' | 'employee'
}

export interface User {
  id: string
  email: string
  profile: UserProfile | null
}

interface RegisterData {
  firstName: string
  lastName: string
  email: string
  password: string
  phone?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: User }>
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = useMemo(() => createClient(), [])

  const fetchUserProfile = useCallback(async (supabaseUser: SupabaseUser): Promise<User> => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single()

      if (error || !profile) {
        return { id: supabaseUser.id, email: supabaseUser.email ?? '', profile: null }
      }

      return { id: supabaseUser.id, email: supabaseUser.email ?? '', profile }
    } catch {
      return { id: supabaseUser.id, email: supabaseUser.email ?? '', profile: null }
    }
  }, [supabase])

  useEffect(() => {
    let isActive = true
    const loadingGuard = window.setTimeout(() => {
      if (isActive) {
        setIsLoading(false)
      }
    }, 4000)

    const syncSession = async (session: Session | null) => {
      try {
        if (!session?.user) {
          if (isActive) {
            setUser(null)
          }
          return
        }

        const userData = await fetchUserProfile(session.user)
        if (isActive) {
          setUser(userData)
        }
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    const bootstrapSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          throw error
        }

        await syncSession(data.session)
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de la session:', error)
        if (isActive) {
          setUser(null)
          setIsLoading(false)
        }
      }
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        if (isActive) {
          setUser(null)
          setIsLoading(false)
        }
        return
      }

      void syncSession(session)
    })

    void bootstrapSession()

    return () => {
      isActive = false
      window.clearTimeout(loadingGuard)
      subscription.unsubscribe()
    }
  }, [fetchUserProfile, supabase])

  const refreshUser = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user) {
        const userData = await fetchUserProfile(session.user)
        setUser(userData)
        return
      }
    } catch (error) {
      console.error('Erreur lors du rafraichissement de la session:', error)
    }

    setUser(null)
    setIsLoading(false)
  }

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        const errorMessage = error.message.includes('Email not confirmed')
          ? 'Veuillez confirmer votre courriel avant de vous connecter'
          : 'Courriel ou mot de passe incorrect'
        setIsLoading(false)
        return { success: false, error: errorMessage }
      }

      if (data.user) {
        const userData = await fetchUserProfile(data.user)
        setUser(userData)
        setIsLoading(false)
        return { success: true, user: userData }
      }

      setIsLoading(false)
      return { success: true }
    } catch {
      setUser(null)
      setIsLoading(false)
      return { success: false, error: 'Une erreur est survenue lors de la connexion' }
    }
  }

  const register = async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/compte/profil`,
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            phone: data.phone || null,
          },
        },
      })

      if (error) {
        const errorMessage = error.message.includes('User already registered')
          ? 'Un compte existe deja avec ce courriel'
          : error.message
        return { success: false, error: errorMessage }
      }

      if (authData.user && !authData.session) {
        return {
          success: true,
          error: 'Un courriel de confirmation a ete envoye. Veuillez verifier votre boite de reception.',
        }
      }

      if (authData.user) {
        const userData = await fetchUserProfile(authData.user)
        setUser(userData)
      }

      setIsLoading(false)
      return { success: true }
    } catch {
      setIsLoading(false)
      return { success: false, error: 'Erreur lors de la creation du compte' }
    }
  }

  const logout = async () => {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Erreur lors de la deconnexion:', error)
    }
    setUser(null)
    setIsLoading(false)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
