"use client";

import { useState } from "react";

const faqs = [
  {
    q: "Nexartis est-il accessible si je n\u2019utilise pas beaucoup les outils informatiques ?",
    a: "Nexartis a été conçu spécifiquement pour les artisans, qu\u2019ils soient ou non à l\u2019aise avec les outils numériques. La prise en main est guidée pas à pas. En règle générale, les premiers devis sont créés dans les dix minutes suivant l\u2019inscription.",
  },
  {
    q: "L\u2019application Nexartis est-elle disponible sur smartphone ?",
    a: "Oui, sur tous les téléphones Android et iPhone. Nexartis fonctionne aussi bien sur un téléphone que sur un ordinateur. Vous pouvez créer un devis depuis votre chantier.",
  },
  {
    q: "Est-il possible d\u2019essayer Nexartis avant de souscrire ?",
    a: "Oui. 14 jours d\u2019essai complet, gratuit, sans entrer votre carte bancaire. Vous avez accès à tout pendant ces 14 jours.",
  },
  {
    q: "Nexartis est-il conforme à la réforme de la facturation électronique 2026 ?",
    a: "Depuis septembre 2026, la loi française oblige toutes les entreprises à pouvoir recevoir et envoyer des factures dans un format spécial appelé Factur-X. Si votre logiciel n\u2019est pas conforme, vous risquez une amende. Nexartis est certifié conforme — vous ne risquez rien.",
  },
  {
    q: "Comment résilier mon abonnement Nexartis ?",
    a: "La résiliation s\u2019effectue directement depuis votre espace Nexartis, sans formulaire, sans appel téléphonique et sans pénalité.",
  },
  {
    q: "Comment fonctionne le planning de chantier Nexartis ?",
    a: "Vous voyez tous vos chantiers sur une semaine, avec des couleurs différentes pour chaque client. Vous pouvez déplacer un chantier en le glissant avec votre doigt. Si vous essayez de mettre deux personnes au même endroit le même jour, Nexartis vous prévient avec une alerte orange.",
  },
  {
    q: "Nexartis gère-t-il les équipes avec plusieurs intervenants ?",
    a: "Nexartis inclut la gestion de votre équipe. Chaque membre de votre équipe reçoit son planning sur son téléphone. Tout le monde sait où il doit aller et quand.",
  },
  {
    q: "Où sont hébergées mes données et comment sont-elles protégées ?",
    a: "Vos données sont hébergées en France, sur des serveurs sécurisés. Elles ne sont jamais vendues ni partagées. Si vous arrêtez Nexartis, vous pouvez tout exporter en PDF ou Excel.",
  },
  {
    q: "Nexartis peut-il remplacer mon expert-comptable ?",
    a: "Non, et ce n\u2019est pas son but. Nexartis vous aide à créer vos devis et factures, et à les envoyer à votre comptable en un clic au format qu\u2019il utilise. Ça lui fait gagner du temps, et donc ça vous coûte moins cher.",
  },
  {
    q: "Comment Nexartis propose-t-il autant de fonctionnalités à 25 € par mois ?",
    a: "Nous pensons qu\u2019un bon logiciel artisan ne devrait pas coûter le prix d\u2019un repas au restaurant par semaine. Nous avons décidé de rendre tous les outils accessibles à un prix honnête, sans version premium, sans mauvaise surprise.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.a,
    },
  })),
};

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <section className="bg-white py-[100px] px-5 lg:px-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className="mx-auto max-w-[1200px]">
        {/* Section header */}
        <div className="text-center mb-[60px]">
          <span className="inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.06em] px-4 py-1.5 rounded-full mb-5 bg-[rgba(90,180,224,0.08)] text-[var(--sky-dark)]">
            FAQ
          </span>
          <h2 className="text-[28px] sm:text-[38px] font-[800] tracking-[-0.03em] text-[var(--navy)] mb-3.5">
            Vos questions, répondues simplement
          </h2>
        </div>

        {/* FAQ list */}
        <div className="mx-auto max-w-[760px]">
          {faqs.map((faq, i) => (
            <div key={i} className="border-b border-[var(--border)]">
              <button
                onClick={() => toggle(i)}
                className="w-full flex items-center justify-between py-[22px] bg-transparent border-none cursor-pointer text-left text-[17px] font-bold text-[var(--navy)] transition-colors hover:text-[var(--sky-dark)]"
              >
                <span>{faq.q}</span>
                <span
                  className={`w-8 h-8 rounded-[10px] flex items-center justify-center flex-shrink-0 ml-4 text-[18px] transition-all duration-300 ${
                    openIndex === i
                      ? "bg-[var(--sky)] text-white rotate-45"
                      : "bg-[var(--bg)] text-[var(--muted)]"
                  }`}
                >
                  +
                </span>
              </button>
              <div
                className="overflow-hidden transition-[max-height] duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{
                  maxHeight: openIndex === i ? "300px" : "0px",
                }}
              >
                <p className="pb-[22px] text-[15px] text-[var(--muted)] leading-[1.7] font-medium">
                  {faq.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
