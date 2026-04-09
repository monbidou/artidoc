"use client";

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

const comparisonRows = [
  { label: "Prix", nexartis: "25€/mois", obat: "49€+/mois", tolteck: "25€/mois (limité)" },
  { label: "Planning intelligent", nexartis: true, obat: false, tolteck: false },
  { label: "Alertes conflits", nexartis: true, obat: false, tolteck: false },
  { label: "Tout inclus", nexartis: true, obat: false, tolteck: false },
  { label: "Mobile-first", nexartis: true, obat: "partial", tolteck: "partial" },
];

function CellValue({ value }: { value: boolean | string }) {
  if (value === true) return <span className="text-lg text-emerald-400">✓</span>;
  if (value === false) return <span className="text-lg text-red-400">✗</span>;
  if (value === "partial") return <span className="text-lg text-yellow-400">~</span>;
  return <span className="text-sm text-white">{value}</span>;
}

export default function PricingSection() {
  return (
    <section className="bg-cream py-14 lg:py-20">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="mb-14 text-center font-syne text-3xl font-extrabold text-navy md:text-4xl lg:text-5xl">
          Un abonnement unique. Toutes les fonctionnalités incluses.
        </h2>

        <div className="mx-auto max-w-3xl rounded-3xl bg-navy p-8 shadow-2xl md:p-10">
          <p className="mb-2 text-center font-manrope text-base text-gray-400">
            L&apos;intégralité des outils pour gérer votre entreprise artisanale
          </p>

          <div className="mb-1 text-center">
            <span className="font-syne text-7xl font-black text-white md:text-8xl">25€</span>
          </div>
          <p className="mb-8 text-center font-manrope text-sm font-light text-gray-400">
            par mois HT · Sans engagement · Résiliation à tout moment
          </p>

          <div className="mb-8 h-px w-full bg-white/10" />

          <div className="mb-8 grid grid-cols-1 gap-3 md:grid-cols-2">
            {features.map((f) => (
              <div key={f} className="flex items-start gap-2">
                <span className="mt-0.5 text-emerald-400">✓</span>
                <span className="font-manrope text-sm text-gray-200">{f}</span>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col items-center">
            <button className="h-16 w-full max-w-md rounded-xl bg-orange px-8 font-syne text-lg font-bold text-white transition-colors hover:bg-orange-hover">
              Commencer maintenant — 14 jours gratuits
            </button>
            <p className="mt-3 font-manrope text-sm text-gray-400">
              Aucune carte bancaire demandée. Annulez quand vous voulez.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
