'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, Loader2, ArrowLeft, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { verifyIfEmailExists } from "@/lib/actions/auth" 

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const emailExists = await verifyIfEmailExists(email)

      if (!emailExists) {
        setIsLoading(false)
        setError('Aucun compte associé à cette adresse courriel.')
        return
      }

    
      const supabase = createClient()
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/connexion/reset-password`,
      })

      setIsLoading(false)

      if (resetError) {
        setError('Une erreur est survenue lors de l\'envoi. Veuillez réessayer.')
      } else {
        setSent(true)
      }
    } catch (err: any) {
      console.error(err)
      setIsLoading(false)
      setError('Une erreur est survenue. Veuillez réessayer.')
    }
  }

  return (
    <div className="min-h-screen bg-background">
     

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <Link
            href="/connexion"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à la connexion
          </Link>

          <Card className="border bg-card">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-lg">
                  EA
                </div>
              </div>
              <CardTitle className="text-2xl">Mot de passe oublié</CardTitle>
              <CardDescription>
                {sent
                  ? 'Vérifiez votre boîte de réception'
                  : 'Entrez votre courriel pour recevoir un lien de réinitialisation'}
              </CardDescription>
            </CardHeader>

            <CardContent>
              {sent ? (
                <div className="flex flex-col items-center gap-4 py-4 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Courriel envoyé!</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Un lien de réinitialisation a été envoyé à{' '}
                      <span className="font-medium text-foreground">{email}</span>.
                      Vérifiez aussi votre dossier de courrier indésirable.
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                      {error}
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="email">Courriel</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="jean@exemple.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-9"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      'Envoyer le lien de réinitialisation'
                    )}
                  </Button>
                </form>
              )}
            </CardContent>

            <CardFooter className="justify-center">
              {sent ? (
                <Button variant="outline" className="w-full" onClick={() => { setSent(false); setEmail('') }}>
                  Renvoyer un lien
                </Button>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Vous vous souvenez de votre mot de passe?{' '}
                  <Link href="/connexion" className="text-primary font-medium hover:underline">
                    Se connecter
                  </Link>
                </p>
              )}
            </CardFooter>
          </Card>
        </div>
      </main>

    
    </div>
  )
}