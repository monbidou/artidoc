'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

/**
 * Page client pour gérer la confirmation email.
 * Supabase redirige ici avec un #access_token dans l'URL (hash fragment).
 * Cette page lit le token, établit la session, et redirige vers le dashboard.
 */
export default function AuthConfirmPage() {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  useEffect(() => {
    async function handleConfirm() {
      const supabase = createClient()

      // Supabase met les tokens dans le hash fragment (#access_token=...&refresh_token=...)
      // Le client Supabase les détecte automatiquement via onAuthStateChange
      // On attend juste que la session soit établie
      const { data: { session }, error } = await supabase.auth.getSession()

      if (session && !error) {
        setStatus('success')
        // Petit délai pour que le cookie de session soit bien posé
        setTimeout(() => router.push('/dashboard'), 500)
        return
      }

      // Si pas de session immédiate, attendre un changement d'état auth
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
        if (event === 'SIGNED_IN' && newSession) {
          setStatus('success')
          subscription.unsubscribe()
          setTimeout(() => router.push('/dashboard'), 500)
        }
      })

      // Timeout : si rien après 5 secondes, afficher une erreur
      setTimeout(() => {
        setStatus(prev => {
          if (prev === 'loading') {
            subscription.unsubscribe()
            return 'error'
          }
          return prev
        })
      }, 5000)
    }

    handleConfirm()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="text-center max-w-md">
        {status === 'loading' && (
          <>
            <div className="w-12 h-12 border-4 border-gray-200 border-t-[#e87a2a] rounded-full animate-spin mx-auto mb-6" />
            <h1 className="font-syne font-bold text-xl text-[#1a1a2e] mb-2">Confirmation en cours...</h1>
            <p className="font-manrope text-sm text-gray-500">Votre compte est en cours d&apos;activation.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h1 className="font-syne font-bold text-xl text-[#1a1a2e] mb-2">Compte confirmé !</h1>
            <p className="font-manrope text-sm text-gray-500">Redirection vers votre espace...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
            <h1 className="font-syne font-bold text-xl text-[#1a1a2e] mb-2">Lien expiré ou invalide</h1>
            <p className="font-manrope text-sm text-gray-500 mb-6">
              Le lien de confirmation a peut-être expiré. Essayez de vous connecter ou demandez un nouveau lien.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => router.push('/login')}
                className="px-6 py-2.5 bg-[#e87a2a] text-white font-syne font-bold text-sm rounded-xl hover:bg-[#f09050] transition"
              >
                Se connecter
              </button>
              <button
                onClick={() => router.push('/register')}
                className="px-6 py-2.5 border border-gray-200 text-[#1a1a2e] font-manrope font-medium text-sm rounded-xl hover:bg-gray-50 transition"
              >
                S&apos;inscrire
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
