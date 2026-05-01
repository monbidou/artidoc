'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

/**
 * Cette page est conservée pour rétrocompatibilité avec d'anciens emails ou liens
 * externes qui pointeraient encore vers /subscription-expired.
 * Le flow standard redirige désormais directement vers /dashboard/abonnement?expired=1
 * (géré par le middleware et le useEffect du dashboard layout).
 */
export default function SubscriptionExpiredPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/dashboard/abonnement?expired=1')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <Loader2 className="w-8 h-8 text-[#e87a2a] animate-spin mx-auto mb-4" />
        <p className="text-sm text-gray-500 font-manrope">
          Redirection vers la page de souscription...
        </p>
      </div>
    </div>
  )
}
