"use client";

import React from "react";

interface FeatureCard {
  title: string;
  text: string;
  tag: string;
  tagColor: "green" | "gold";
  exclusive?: boolean;
  circleBg: string;
  iconColor: string;
  svgPaths: React.ReactNode;
}

const cards: FeatureCard[] = [
  {
    title: "Devis et factures en quelques minutes",
    text: "Sélectionnez votre client et vos prestations. Le devis est envoyé par email ou SMS. Votre client signe directement sur son téléphone.",
    tag: "✓ Conforme légalement",
    tagColor: "green",
    circleBg: "#dbeafe",
    iconColor: "#2563eb",
    svgPaths: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></>,
  },
  {
    title: "Planning qui évite les conflits",
    text: "Glissez vos chantiers sur le calendrier. Si vous affectez quelqu'un deux fois le même jour, une alerte orange apparaît immédiatement.",
    tag: "★ EXCLUSIF Nexartis",
    tagColor: "gold",
    exclusive: true,
    circleBg: "#fef9c3",
    iconColor: "#ca8a04",
    svgPaths: <><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>,
  },
  {
    title: "Suivi financier en temps réel",
    text: "Combien vous avez facturé ce mois-ci. Ce qui n'est pas encore payé. Ce qui arrive la semaine prochaine. Tout affiché simplement.",
    tag: "✓ Temps réel",
    tagColor: "green",
    circleBg: "#dcfce7",
    iconColor: "#16a34a",
    svgPaths: <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>,
  },
  {
    title: "Plus d'impayés qui traînent",
    text: "Nexartis envoie automatiquement des rappels polis à vos clients qui n'ont pas payé. Vous n'avez plus à le faire vous-même.",
    tag: "✓ Automatique",
    tagColor: "green",
    circleBg: "#ede9fe",
    iconColor: "#7c3aed",
    svgPaths: <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></>,
  },
  {
    title: "Conforme à la loi 2026",
    text: "Depuis septembre 2026, la facture électronique est obligatoire. Nexartis est déjà certifié. Vous ne risquez aucune amende.",
    tag: "⚠️ Obligatoire en 2026",
    tagColor: "gold",
    circleBg: "#ffedd5",
    iconColor: "#ea580c",
    svgPaths: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></>,
  },
  {
    title: "Fonctionne sur votre téléphone",
    text: "Créez un devis depuis votre chantier et envoyez-le en quelques instants. Votre client signe directement sur son téléphone.",
    tag: "✓ iOS & Android",
    tagColor: "green",
    circleBg: "#f1f5f9",
    iconColor: "#475569",
    svgPaths: <><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></>,
  },
];

export default function FeaturesSection() {
  return (
    <section id="fonctionnalites" className="bg-[#0f1a3a] py-14 lg:py-20 px-4">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <h2 className="font-syne text-3xl font-extrabold text-white text-center md:text-4xl lg:text-5xl">
          Toutes les fonctionnalités dont votre entreprise a besoin
        </h2>
        <p className="mt-4 text-center text-lg text-[rgba(255,255,255,0.75)]">
          Prise en main immédiate. Efficacité durable.
        </p>

        {/* Cards grid */}
        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <div
              key={card.title}
              className={`
                group flex flex-col rounded-2xl bg-[#1a2d5a] p-8
                transition-transform duration-300 hover:-translate-y-1
                ${
                  card.exclusive
                    ? "border-2 border-[#f5c842] shadow-[0_0_24px_rgba(245,200,66,0.2)] md:scale-105"
                    : ""
                }
              `}
            >
              <div style={{width:56, height:56, borderRadius:'50%', background:card.circleBg, display:'flex', alignItems:'center', justifyContent:'center'}}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={card.iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {card.svgPaths}
                </svg>
              </div>
              <h3 className="mt-5 font-syne text-xl font-bold text-white">
                {card.title}
              </h3>
              <p className="mt-3 flex-1 text-[rgba(255,255,255,0.75)] leading-relaxed">
                {card.text}
              </p>
              <span
                className={`
                  mt-5 inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-semibold
                  ${
                    card.tagColor === "green"
                      ? "bg-[rgba(34,197,94,0.15)] text-[#22c55e]"
                      : "bg-[rgba(245,200,66,0.15)] text-[#f5c842]"
                  }
                `}
              >
                {card.tag}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
