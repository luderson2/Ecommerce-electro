'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Lock, Loader2, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'


import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isValidSession, setIsValidSession] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' && session) {
        setIsValidSession(true)
        setCheckingSession(false)
      } else if (event === 'SIGNED_IN' && session) {
        
        setIsValidSession(true)
        setCheckingSession(false)
      }
    })

    
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const accessToken = hashParams.get('access_token')
    const refreshToken = hashParams.get('refresh_token')
    const type = hashParams.get('type')

    if (accessToken && refreshToken && type === 'recovery') {
      
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      }).then(({ data, error }) => {
        if (data.session && !error) {
          setIsValidSession(true)
        }
        setCheckingSession(false)
      })
    } else {
     
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setIsValidSession(true)
        }
        setCheckingSession(false)
      })
    }

    return () => subscription.unsubscribe()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caracteres')
      return
    }
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    setIsLoading(true)
    const supabase = createClient()
    
    // Update the password in Supabase Auth
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setIsLoading(false)
      setError('Une erreur est survenue. Le lien est peut-etre expire. Veuillez recommencer.')
    } else {
     
      await supabase.auth.signOut()
      setIsLoading(false)
      setSuccess(true)
      setTimeout(() => router.push('/connexion'), 3000)
    }
  }

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-background">

        <main className="container mx-auto px-4 py-12 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </main>
        
      </div>
    )
  }

  if (!isValidSession) {
    return (
      <div className="min-h-screen bg-background">
      
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto">
            <Card className="border bg-card text-center">
              <CardHeader>
                <CardTitle>Lien invalide ou expire</CardTitle>
                <CardDescription>
                  Ce lien de reinitialisation est invalide ou a expire. Veuillez faire une nouvelle demande.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => router.push('/connexion/forgot-password')} className="w-full">
                  Nouvelle demande
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
       
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
    

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <Card className="border bg-card">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-lg">
                  EA
                </div>
              </div>
              <CardTitle className="text-2xl">Nouveau mot de passe</CardTitle>
              <CardDescription>
                {success
                  ? 'Votre mot de passe a ete mis a jour avec succes'
                  : 'Choisissez un nouveau mot de passe pour votre compte'}
              </CardDescription>
            </CardHeader>

            <CardContent>
              {success ? (
                <div className="flex flex-col items-center gap-4 py-4 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Mot de passe mis a jour!</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Vous allez etre redirige vers la page de connexion dans quelques secondes...
                    </p>
                  </div>
                  <Button onClick={() => router.push('/connexion')} className="w-full mt-2">
                    Se connecter maintenant
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                      {error}
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="password">Nouveau mot de passe</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Minimum 6 caracteres"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-9 pr-10"
                        required
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        <span className="sr-only">{showPassword ? 'Masquer' : 'Afficher'} le mot de passe</span>
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm">Confirmer le mot de passe</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="confirm"
                        type={showConfirm ? 'text' : 'password'}
                        placeholder="Repetez le mot de passe"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-9 pr-10"
                        required
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        <span className="sr-only">{showConfirm ? 'Masquer' : 'Afficher'} le mot de passe</span>
                      </button>
                    </div>
                  </div>

                  {/* Password strength indicator */}
                  {password.length > 0 && (
                    <div className="space-y-1">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-colors ${
                              password.length >= i * 3
                                ? password.length >= 12 ? 'bg-green-500'
                                  : password.length >= 8 ? 'bg-yellow-500'
                                  : 'bg-red-400'
                                : 'bg-muted'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {password.length < 6 ? 'Trop court'
                          : password.length < 8 ? 'Faible'
                          : password.length < 12 ? 'Moyen'
                          : 'Fort'}
                      </p>
                    </div>
                  )}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Mise a jour...
                      </>
                    ) : (
                      'Mettre a jour le mot de passe'
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

     
    </div>
  )
}
