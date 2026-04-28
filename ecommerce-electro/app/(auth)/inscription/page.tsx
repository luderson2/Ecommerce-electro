'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, Mail, Lock, User, Phone, Check, X, Loader2, MailCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { sInscrire } from '@/lib/actions/auth'

export default function InscriptionPage() {
  const [state, formAction, isPending] = useActionState(sInscrire, null)
  const [showPassword, setShowPassword] = useState(false)

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const updateField = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
  }

  
  const passwordChecks = {
    length: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    lowercase: /[a-z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
  }

  const allPasswordChecks = Object.values(passwordChecks).every(Boolean)
  const passwordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword.length > 0

  // Compte créé, attente de confirmation email
  if (state?.needsConfirmation) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-12">
          <Card className="border bg-card w-full max-w-md mx-auto text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <MailCheck className="h-8 w-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-xl">Vérifiez vos courriels</CardTitle>
              <CardDescription className="mt-2">
                Un lien de confirmation a été envoyé à votre adresse courriel.
                Cliquez dessus pour activer votre compte.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Vous ne trouvez pas le courriel ?  Vérifiez vos indésirables.
              </p>
              <Link
                href="/connexion"
                className="mt-4 inline-block text-sm text-primary font-medium hover:underline"
              >
                Retour à la connexion
              </Link>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-12">
        <Card className="border bg-card w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-lg">
                EA
              </div>
            </div>
            <CardTitle className="text-2xl">Créer un compte</CardTitle>
            <CardDescription>Rejoignez Électro Métropolitain pour vos achats</CardDescription>
          </CardHeader>

          <CardContent>
           
            <form action={formAction} className="space-y-4">
              
              {state?.error && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                  {state.error}
                </div>
              )}

              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="firstName"
                      name="firstName" 
                      placeholder="Jean"
                      value={formData.firstName}
                      onChange={(e) => updateField('firstName', e.target.value)}
                      className="pl-9"
                      required
                      disabled={isPending}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom</Label>
                  <Input
                    id="lastName"
                    name="lastName" 
                    placeholder="Tremblay"
                    value={formData.lastName}
                    onChange={(e) => updateField('lastName', e.target.value)}
                    required
                    disabled={isPending}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Courriel</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="jean@exemple.com"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    className="pl-9"
                    required
                    disabled={isPending}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone (optionnel)</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+1 (514) 123-4567"
                    className="pl-9"
                    disabled={isPending}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Créer un mot de passe"
                    value={formData.password}
                    onChange={(e) => updateField('password', e.target.value)}
                    className="pl-9 pr-10"
                    required
                    disabled={isPending}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {/* Checklist de sécurité en temps réel */}
                {formData.password.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {Object.entries({
                      length: 'Au moins 8 caractères',
                      uppercase: 'Une lettre majuscule',
                      number: 'Un chiffre',
                    }).map(([key, label]) => (
                      <div
                        key={key}
                        className={`flex items-center gap-2 text-xs ${
                          passwordChecks[key as keyof typeof passwordChecks] ? 'text-green-600' : 'text-muted-foreground'
                        }`}
                      >
                        {passwordChecks[key as keyof typeof passwordChecks] ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        {label}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Confirmez votre mot de passe"
                    value={formData.confirmPassword}
                    onChange={(e) => updateField('confirmPassword', e.target.value)}
                    className="pl-9"
                    required
                    disabled={isPending}
                  />
                </div>
                {formData.confirmPassword.length > 0 && (
                  <div className={`flex items-center gap-2 text-xs ${passwordsMatch ? 'text-green-600' : 'text-destructive'}`}>
                    {passwordsMatch ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                    {passwordsMatch ? 'Les mots de passe correspondent' : 'Les mots de passe ne correspondent pas'}
                  </div>
                )}
              </div>

              <div className="flex items-start space-x-2 pt-2">
                <Checkbox id="terms" required disabled={isPending} />
                <Label htmlFor="terms" className="text-xs cursor-pointer leading-none">
                  J&apos;accepte les <Link href="/conditions" className="text-primary underline">conditions d&apos;utilisation</Link>
                </Label>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isPending || !allPasswordChecks || !passwordsMatch}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création en cours...
                  </>
                ) : (
                  'Créer un compte'
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter>
            <p className="text-sm text-center w-full text-muted-foreground">
              Déjà un compte ?{' '}
              <Link href="/connexion" className="text-primary font-medium hover:underline">
                Se connecter
              </Link>
            </p>
          </CardFooter>
        </Card>
      </main>

      <Footer />
    </div>
  )
}
