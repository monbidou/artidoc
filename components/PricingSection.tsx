"use client";

import Link from "next/link";

const features = [
  "Devis illimités",
  "Factures illimitées",
  "Signature électronique",
  "Planning chantiers",
  "Alertes conflits équipe",
  "Tableau de bord CA",
  "Relances impayés automatiques",
  "Application mobile iOS & Android",
  "Facture électronique Factur-X (loi 2026)",
  "Bibliothèque de vos prestations",
  "TVA 5.5%, 10%, 20% automatique",
  "Attestations TVA rénovation auto",
  "Acomptes et situations de travaux",
  "Avoirs et rectifications",
  "Export comptable (CSV/PDF)",
  "Données hébergées en France",
  "Support par chat et email",
  "Mises à jour incluses à vie",
  "Aucune limite de clients",
  "Aucune limite de chantiers",
];

export default function PricingSection() {
  return (
    <section className="bg-[var(--bg)] py-[100px] px-5 lg:px-10">
      <div className="mx-auto max-w-[1200px]">
        {/* Section header */}
        <div className="text-center mb-[60px]">
          <span className="inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.06em] px-4 py-1.5 rounded-full mb-5 bg-[rgba(232,122,42,0.1)] text-[var(--orange)]">
            Tarification
          </span>
          <h2 className="text-[28px] sm:text-[38px] font-[800] tracking-[-0.03em] text-[var(--navy)] mb-3.5">
            Un abonnement unique. Toutes les fonctionnalités incluses.
          </h2>
        </div>

        {/* Pricing Card */}
        <div className="mx-auto max-w-[820px] bg-[var(--navy)] rounded-[28px] p-[56px] relative overflow-hidden shadow-[0_20px_60px_rgba(15,26,58,0.3)]">
          {/* Decorative blob */}
          <div className="absolute -top-20 -right-20 w-[250px] h-[250px] rounded-full bg-[radial-gradient(circle,rgba(90,180,224,0.1)_0%,transparent_70%)]" />

          <div className="relative z-[1]">
            <p className="text-[14px] text-white/50 font-medium mb-5 text-center">
              L&apos;intégralité des outils pour gérer votre entreprise artisanale
            </p>

            {/* Price */}
            <div className="text-center mb-1.5">
              <span className="text-[72px] sm:text-[80px] font-[800] text-white tracking-[-0.04em] leading-none tabular-nums">
                25€
              </span>
              <span className="text-[20px] font-semibold text-white/50 ml-1">/mois HT</span>
            </div>
            <p className="text-center text-[14px] text-white/40 mb-10">
              Sans engagement · Résiliation à tout moment
            </p>

            <div className="h-px w-full bg-white/10 mb-10" />

            {/* Features grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 gap-x-8 mb-10">
              {features.map((f) => (
                <div key={f} className="flex items-center gap-2.5 text-[14px] text-white/75 font-medium">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--green)"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="flex-shrink-0"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {f}
                </div>
              ))}
            </div>

            {/* CTA */}
            <Link
              href="/register"
              className="btn-pricing block text-center"
            >
              Commencer maintenant — 14 jours gratuits
            </Link>
            <p className="text-center text-[13px] text-white/35 mt-4">
              Aucune carte bancaire demandée. Annulez quand vous voulez.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
