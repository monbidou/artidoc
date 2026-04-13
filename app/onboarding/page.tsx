'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

/**
 * L'onboarding a été supprimé.
 * Si quelqu'un arrive ici (lien en cache, ancien bookmark),
 * on le redirige directement vers le dashboard.
 */
export default function OnboardingPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/dashboard')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <p className="font-manrope text-gray-400 text-sm">Redirection...</p>
    </div>
  )
}
