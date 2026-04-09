"use client";

import React from "react";

interface FeatureCard {
  title: string;
  text: string;
  tag: string;
  tagBg: string;
  tagColor: string;
  exclusive?: boolean;
  iconBg: string;
  iconColor: string;
  svgPaths: React.ReactNode;
}

const cards: FeatureCard[] = [
  {
    title: "Devis et factures en quelques minutes",
    text: "Sélectionnez votre client et vos prestations. Le devis est envoyé par email ou SMS. Votre client signe directement sur son téléphone.",
    tag: "✓ Conforme légalement",
    tagBg: "rgba(34,197,94,0.12)",
    tagColor: "#22c55e",
    iconBg: "rgba(90,180,224,0.12)",
    iconColor: "#5ab4e0",
    svgPaths: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </>
    ),
  },
  {
    title: "Planning qui évite les conflits",
    text: "Glissez vos chantiers sur le calendrier. Si vous affectez quelqu\u2019un deux fois le même jour, une alerte orange apparaît immédiatement.",
    tag: "★ EXCLUSIF Nexartis",
    tagBg: "rgba(245,200,66,0.15)",
    tagColor: "#f5c842",
    exclusive: true,
    iconBg: "rgba(245,200,66,0.12)",
    iconColor: "#f5c842",
    svgPaths: (
      <>
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </>
    ),
  },
  {
    title: "Suivi financier en temps réel",
    text: "Combien vous avez facturé ce mois-ci. Ce qui n\u2019est pas encore payé. Ce qui arrive la semaine prochaine. Tout affiché simplement.",
    tag: "✓ Temps réel",
    tagBg: "rgba(34,197,94,0.12)",
    tagColor: "#22c55e",
    iconBg: "rgba(34,197,94,0.12)",
    iconColor: "#22c55e",
    svgPaths: (
      <>
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </>
    ),
  },
  {
    title: "Plus d\u2019impayés qui traînent",
    text: "Nexartis envoie automatiquement des rappels polis à vos clients qui n\u2019ont pas payé. Vous n\u2019avez plus à le faire vous-même.",
    tag: "✓ Automatique",
    tagBg: "rgba(34,197,94,0.12)",
    tagColor: "#22c55e",
    iconBg: "rgba(124,58,237,0.12)",
    iconColor: "#7c3aed",
    svgPaths: (
      <>
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </>
    ),
  },
  {
    title: "Conforme à la loi 2026",
    text: "Depuis septembre 2026, la facture électronique est obligatoire. Nexartis est déjà certifié. Vous ne risquez aucune amende.",
    tag: "⚠️ Obligatoire en 2026",
    tagBg: "rgba(245,200,66,0.15)",
    tagColor: "#f5c842",
    iconBg: "rgba(232,122,42,0.12)",
    iconColor: "#e87a2a",
    svgPaths: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  },
  {
    title: "Fonctionne sur votre téléphone",
    text: "Créez un devis depuis votre chantier et envoyez-le en quelques instants. Votre client signe directement sur son téléphone.",
    tag: "✓ iOS & Android",
    tagBg: "rgba(34,197,94,0.12)",
    tagColor: "#22c55e",
    iconBg: "rgba(71,85,105,0.1)",
    iconColor: "#475569",
    svgPaths: (
      <>
        <rect x="5" y="2" width="14" height="20" rx="2" />
        <line x1="12" y1="18" x2="12.01" y2="18" />
      </>
    ),
  },
];

export default function FeaturesSection() {
  return (
    <section id="fonctionnalites" className="bg-[var(--navy)] py-[100px] px-5 lg:px-10">
      <div className="mx-auto max-w-[1200px]">
        {/* Header */}
        <div className="text-center mb-[60px]">
          <span className="inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.06em] px-4 py-1.5 rounded-full mb-5 bg-[rgba(90,180,224,0.1)] text-[var(--sky)]">
            Fonctionnalités
          </span>
          <h2 className="text-[28px] sm:text-[38px] font-[800] tracking-[-0.03em] text-white mb-3.5">
            Toutes les fonctionnalités dont votre entreprise a besoin
          </h2>
          <p className="text-[17px] text-white/50 font-medium max-w-[560px] mx-auto">
            Prise en main immédiate. Efficacité durable.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {cards.map((card) => (
            <div
              key={card.title}
              className={`flex flex-col rounded-[var(--radius)] p-[32px_28px] transition-all duration-300 hover:-translate-y-[2px] ${
                card.exclusive
                  ? "border border-[rgba(245,200,66,0.3)] bg-[linear-gradient(135deg,rgba(245,200,66,0.06)_0%,rgba(255,255,255,0.04)_100%)] shadow-[0_0_30px_rgba(245,200,66,0.06)]"
                  : "bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.07] hover:border-white/[0.12]"
              }`}
            >
              {/* Tag */}
              <span
                className="inline-block text-[11px] font-bold px-3 py-1 rounded-lg mb-4 w-fit"
                style={{ background: card.tagBg, color: card.tagColor }}
              >
                {card.tag}
              </span>

              {/* Icon */}
              <div
                className="w-12 h-12 rounded-[14px] flex items-center justify-center mb-5"
                style={{ background: card.iconBg }}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={card.iconColor}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {card.svgPaths}
                </svg>
              </div>

              <h3 className="text-[17px] font-[800] text-white mb-2 tracking-[-0.01em]">
                {card.title}
              </h3>
              <p className="flex-1 text-[13px] text-white/50 font-medium leading-[1.65]">
                {card.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
