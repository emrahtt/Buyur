'use client'

import { Eye, EyeOff, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signIn, signUp } from '@/lib/auth-client'
import { normalizePhone } from '@/lib/format'
import { tr } from '@/lib/i18n/tr'

export function AuthForm({ mode, next, asProvider }: { mode: 'sign-in' | 'sign-up'; next: string; asProvider?: boolean }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const isSignUp = mode === 'sign-up'

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    const form = new FormData(event.currentTarget)
    const email = String(form.get('email') ?? '').trim()
    const password = String(form.get('password') ?? '')

    setPending(true)
    try {
      if (isSignUp) {
        const name = String(form.get('name') ?? '').trim()
        const rawPhone = String(form.get('phone') ?? '').trim()
        const phone = rawPhone ? normalizePhone(rawPhone) : null
        if (rawPhone && !phone) {
          setError('Telefon numarası 05xx ile başlamalı.')
          setPending(false)
          return
        }
        const { error } = await signUp.email({ name, email, password, ...(phone ? { phone } : {}) })
        if (error) {
          console.error('[auth] sign-up failed', error)
          setError(error.code === 'PASSWORD_TOO_SHORT' ? 'Şifren en az 8 karakter olmalı.' : tr.errors.signUp)
          setPending(false)
          return
        }
      } else {
        const { error } = await signIn.email({ email, password })
        if (error) {
          console.error('[auth] sign-in failed', error)
          setError(tr.errors.auth)
          setPending(false)
          return
        }
      }
      router.push(next)
      router.refresh()
    } catch {
      setError(tr.errors.generic)
      setPending(false)
    }
  }

  const switchHref = `${isSignUp ? '/giris' : '/kayit'}?next=${encodeURIComponent(next)}`

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate={false}>
      {isSignUp ? (
        <div className="flex flex-col gap-2">
          <Label htmlFor="name" className="text-base">
            {asProvider ? 'Adın soyadın' : 'Adın'}
          </Label>
          <Input id="name" name="name" required minLength={2} maxLength={60} autoComplete="name" className="h-12 text-base" />
        </div>
      ) : null}

      <div className="flex flex-col gap-2">
        <Label htmlFor="email" className="text-base">
          E-posta
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          autoCapitalize="none"
          className="h-12 text-base"
        />
      </div>

      {isSignUp ? (
        <div className="flex flex-col gap-2">
          <Label htmlFor="phone" className="text-base">
            Cep telefonu{' '}
            {asProvider ? null : <span className="font-normal text-muted-foreground">(isteğe bağlı)</span>}
          </Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            required={asProvider}
            placeholder="05xx xxx xx xx"
            className="h-12 text-base"
          />
        </div>
      ) : null}

      <div className="flex flex-col gap-2">
        <Label htmlFor="password" className="text-base">
          Şifre
        </Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            required
            minLength={8}
            autoComplete={isSignUp ? 'new-password' : 'current-password'}
            aria-describedby={isSignUp ? 'password-hint' : undefined}
            className="h-12 pr-12 text-base"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
            aria-pressed={showPassword}
            className="absolute top-0 right-0 flex size-12 items-center justify-center text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
          </button>
        </div>
        {isSignUp ? (
          <p id="password-hint" className="text-sm text-muted-foreground">
            En az 8 karakter.
          </p>
        ) : null}
      </div>

      {isSignUp ? (
        <p className="text-sm leading-relaxed text-muted-foreground">
          Hesap açarak{' '}
          <Link href="/kosullar" className="text-primary underline underline-offset-4">
            Kullanım Koşulları
          </Link>
          ’nı kabul etmiş olursun. Kişisel verilerin{' '}
          <Link href="/kvkk" className="text-primary underline underline-offset-4">
            KVKK Aydınlatma Metni
          </Link>
          ’ne göre işlenir.
        </p>
      ) : null}

      {error ? (
        <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? <Loader2 data-icon="inline-start" className="animate-spin" /> : null}
        {isSignUp ? 'Hesap aç' : 'Giriş yap'}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {isSignUp ? 'Zaten hesabın var mı?' : 'Hesabın yok mu?'}{' '}
        <Link href={switchHref} className="font-medium text-primary underline underline-offset-4">
          {isSignUp ? 'Giriş yap' : 'Hesap aç'}
        </Link>
      </p>
    </form>
  )
}
