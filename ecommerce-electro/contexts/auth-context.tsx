'use client'

import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User as SupabaseUser } from '@supabase/supabase-js'


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

function withTimeout<T>(promise: PromiseLike<T>, ms = 15000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      window.setTimeout(() => reject(new Error('La requete a expire. Veuillez reessayer.')), ms)
    }),
  ])
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = useMemo(() => createClient(), [])

const fetchUserProfile = async (supabaseUser: SupabaseUser): Promise<User> => {
    const { data: profile, error } = await withTimeout(
      supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single()
    )

    if (error || !profile) {
      return {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        profile: null,
      }
    }

    
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      profile,
    }
  }

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user: supabaseUser } } = await withTimeout(supabase.auth.getUser())
        if (supabaseUser) {
          const userData = await fetchUserProfile(supabaseUser)
          setUser(userData)
        }
      } catch (error) {
        console.error('Erreur lors du chargement de la session:', error)
        // Session invalide ou erreur reseau: on reste deconnecte.
      } finally {
        setIsLoading(false)
      }
    }

    getUser()

  
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          if (event === 'SIGNED_IN' && session?.user) {
            const userData = await fetchUserProfile(session.user)
            setUser(userData)
          } else if (event === 'SIGNED_OUT') {
            setUser(null)
          }
        } catch (error) {
          console.error('Erreur lors du changement de session:', error)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  // Le client Supabase est memoïsé; ce chargement doit rester exécuté une seule fois.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const refreshUser = async () => {
    const { data: { user: supabaseUser } } = await withTimeout(supabase.auth.getUser())
    if (supabaseUser) {
      const userData = await fetchUserProfile(supabaseUser)
      setUser(userData)
    }
  }

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> => {
    try {
      const { data, error } = await withTimeout(
        supabase.auth.signInWithPassword({
          email,
          password,
        })
      )

      if (error) {
        let errorMessage = "Courriel ou mot de passe incorrect"
        if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Veuillez confirmer votre courriel avant de vous connecter'
        }
        return { success: false, error: errorMessage }
      }

      if (data.user) {
        const userData = await fetchUserProfile(data.user)
        setUser(userData)
        return { success: true, user: userData }
      }

      return { success: true }
    } catch {
      return { success: false, error: 'Une erreur est survenue lors de la connexion' }
    }
  }

  const register = async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data: authData, error } = await withTimeout(
        supabase.auth.signUp({
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
      )

      if (error) {
        let errorMessage = error.message
        if (error.message.includes('User already registered')) {
          errorMessage = 'Un compte existe déjà avec ce courriel'
        }
        return { success: false, error: errorMessage }
      }

      
      if (authData.user && !authData.session) {
        return { 
          success: true, 
          error: 'Un courriel de confirmation a été envoyé. Veuillez vérifier votre boîte de réception.' 
        }
      }

      if (authData.user) {
        const userData = await fetchUserProfile(authData.user)
        setUser(userData)
      }

      return { success: true }
    } catch {
      return { success: false, error: "Erreur lors de la création du compte" }
    }
  }

  
  const logout = async () => {
    try {
      await withTimeout(supabase.auth.signOut())
    } catch (error) {
      console.error('Erreur lors de la deconnexion:', error)
    }
    setUser(null)
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
