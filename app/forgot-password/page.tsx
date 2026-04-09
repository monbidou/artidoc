'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Mail } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-[420px]">
        <div className="bg-white shadow-lg rounded-2xl p-10 border border-gray-100">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail size={28} className="text-green-600" />
              </div>
              <h1 className="font-syne font-bold text-xl text-[#1a1a2e] mb-2">Email envoyé</h1>
              <p className="text-sm text-gray-500 font-manrope mb-6">
                Si un compte existe avec l&apos;adresse <strong>{email}</strong>, vous recevrez un lien de réinitialisation.
              </p>
              <Link href="/login" className="text-sm text-[#5ab4e0] font-manrope font-medium hover:underline">
                Retour à la connexion
              </Link>
            </div>
          ) : (
            <>
              <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-gray-500 font-manrope hover:text-[#1a1a2e] mb-6">
                <ArrowLeft size={16} />
                Retour
              </Link>
              <h1 className="font-syne font-bold text-2xl text-[#1a1a2e] mb-2">Mot de passe oublié</h1>
              <p className="text-sm text-gray-500 font-manrope mb-8">
                Saisissez votre email, nous vous enverrons un lien de réinitialisation.
              </p>

              {error && (
                <div className="bg-red-50 text-red-600 text-sm font-manrope rounded-lg px-4 py-3 mb-6">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block font-manrope font-medium text-sm text-gray-700 mb-1.5">Adresse email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="votre@email.com"
                    className="w-full h-12 rounded-lg border border-gray-200 px-4 font-manrope text-sm text-[#1a1a2e] placeholder:text-gray-400 focus:border-[#5ab4e0] focus:ring-1 focus:ring-[#5ab4e0] outline-none transition"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-[52px] bg-[#e87a2a] hover:bg-[#f09050] text-white font-syne font-bold text-base rounded-xl transition disabled:opacity-60"
                >
                  {loading ? 'Envoi...' : 'Envoyer le lien'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
