'use client'

import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'

export default function SubscriptionExpiredPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md text-center">
        <div className="bg-white shadow-lg rounded-2xl p-10 border border-gray-100">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle size={32} className="text-[#e87a2a]" />
          </div>
          <h1 className="font-syne font-bold text-2xl text-[#1a1a2e] mb-3">
            Votre abonnement a expiré
          </h1>
          <p className="text-sm text-gray-500 font-manrope mb-8 leading-relaxed">
            Votre période d&apos;essai ou votre abonnement Nexartis est arrivé à terme.
            Renouvelez pour retrouver l&apos;accès à tous vos devis, factures et chantiers.
          </p>
          <Link
            href="/tarifs"
            className="inline-flex h-[52px] items-center justify-center w-full rounded-xl bg-[#e87a2a] hover:bg-[#f09050] text-white font-syne font-bold text-base transition"
          >
            Renouveler mon abonnement
          </Link>
          <p className="text-xs text-gray-400 font-manrope mt-4">
            Vos données sont conservées et seront accessibles dès la réactivation.
          </p>
        </div>
      </div>
    </div>
  )
}
