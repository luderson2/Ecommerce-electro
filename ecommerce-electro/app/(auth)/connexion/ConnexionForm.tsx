'use client'

import { FormEvent, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'

const DESTINATIONS: Record<string, string> = {
  admin: '/admin',
  employee: '/admin',
  client: '/',
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      window.setTimeout(() => reject(new Error('timeout')), ms)
    }),
  ])
}

export default function ConnexionForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || searchParams.get('redirect') || ''
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isPending, setIsPending] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setIsPending(true)

    const formData = new FormData(event.currentTarget)
    const email = String(formData.get('email') || '')
    const password = String(formData.get('password') || '')

    try {
      const result = await withTimeout(login(email, password), 15000)

      if (!result.success) {
        setError(result.error || 'Courriel ou mot de passe incorrect.')
        return
      }

      const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : null
      const destination = safeNext ?? DESTINATIONS[result.user?.profile?.role ?? ''] ?? '/'
      router.replace(destination)
    } catch {
      setError('La connexion prend trop de temps. Vérifiez votre connexion et réessayez.')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
          {error}
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
            placeholder="Mot de passe"
            className="pl-9 pr-10"
            required
            disabled={isPending}
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            disabled={isPending}
            aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
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
