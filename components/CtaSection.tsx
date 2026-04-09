"use client";

import Link from "next/link";

export default function CtaSection() {
  return (
    <section className="relative overflow-hidden bg-cta-gradient py-[100px] px-5 lg:px-10 text-center text-white">
      {/* Decorative blob */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(232,122,42,0.06)_0%,transparent_70%)]" />

      <div className="relative z-[1] mx-auto max-w-[1200px]">
        <h2 className="text-[28px] sm:text-[42px] font-[800] tracking-[-0.03em] mb-4">
          Prenez le contrôle de votre gestion d&apos;entreprise
        </h2>

        <p className="text-[18px] text-white/50 max-w-[480px] mx-auto mb-9">
          14 jours d&apos;accès complet, gratuit, sans carte bancaire requise.
        </p>

        <form
          className="flex w-full max-w-xl mx-auto flex-col gap-4 sm:flex-row"
          onSubmit={(e) => e.preventDefault()}
        >
          <input
            type="email"
            placeholder="Votre adresse email"
            className="h-[56px] flex-1 rounded-2xl bg-white px-6 text-[16px] text-[var(--navy)] placeholder-gray-400 outline-none focus:ring-2 focus:ring-[var(--sky)] font-medium"
          />
          <Link
            href="/register"
            className="btn-pricing shrink-0 flex items-center justify-center h-[56px] px-8 text-[16px]"
          >
            Commencer gratuitement →
          </Link>
        </form>

        <p className="mt-5 text-[13px] text-white/35 font-medium">
          Vos données sont hébergées en France et ne sont jamais partagées.
        </p>
        <p className="mt-3 text-[13px] text-white/35 font-medium">
          Une question ? Écrivez-nous : contact@nexartis.fr (Lun-Ven 9h-18h)
        </p>
      </div>
    </section>
  );
}
