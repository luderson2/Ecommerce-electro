'use client'

import { useActionState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { seConnecter } from '@/lib/actions/auth'
import { useState } from 'react'

export default function ConnexionForm() {
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || ''
  const [showPassword, setShowPassword] = useState(false)
  const [state, formAction, isPending] = useActionState(seConnecter, null)

  return (
    <form action={formAction} className="space-y-4">
      {/* Transmet le `next` à la server action pour la redirection */}
      <input type="hidden" name="next" value={next} />

      {state?.error && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
          {state.error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Adresse courriel</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="admin@electrometropolitain.ca"
            className="pl-9"
            required
            disabled={isPending}
            autoComplete="email"
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Mot de passe</Label>
          <Link href="/mot-de-passe-oublie" className="text-xs text-primary hover:underline">
            Oublié ?
          </Link>
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            className="pl-9 pr-10"
            required
            disabled={isPending}
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <Button type="submit" className="w-full mt-2" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Connexion...
          </>
        ) : (
          'Se connecter'
        )}
      </Button>

      <div className="text-center mt-6">
        <p className="text-sm text-muted-foreground">
          Pas de compte ?{' '}
          <Link href="/inscription" className="text-primary font-medium hover:underline">
            Créer un compte
          </Link>
        </p>
      </div>
    </form>
  )
}
