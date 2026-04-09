"use client";

const problems = [
  {
    title: "Des tarifs transparents et maîtrisés",
    text: "Les solutions du marché atteignent souvent 50 à 100 € par mois pour accéder à l\u2019ensemble des fonctionnalités. Nexartis propose tous les outils à 25 € par mois, sans restriction ni option cachée.",
    iconBg: "rgba(34,197,94,0.1)",
    iconColor: "#16a34a",
    svgPaths: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M14.5 8a4 4 0 1 0 0 8H9" />
        <path d="M8 12h6" />
      </>
    ),
  },
  {
    title: "Une planification fiable, sans conflit d\u2019affectation",
    text: "Les logiciels existants proposent un calendrier basique, sans détection de conflits. Nexartis vous alerte immédiatement si un intervenant est déjà affecté à un autre chantier le même jour.",
    iconBg: "rgba(90,180,224,0.1)",
    iconColor: "#2d8bc9",
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
    title: "Conçu pour une utilisation sur le terrain",
    text: "Nexartis fonctionne parfaitement sur smartphone comme sur ordinateur. L\u2019interface a été pensée pour être utilisée rapidement, en situation de mobilité, directement depuis vos chantiers.",
    iconBg: "rgba(232,122,42,0.1)",
    iconColor: "#ea580c",
    svgPaths: (
      <>
        <rect x="5" y="2" width="14" height="20" rx="2" />
        <line x1="12" y1="18" x2="12.01" y2="18" />
      </>
    ),
  },
];

export default function ProblemSection() {
  return (
    <section className="py-[100px] px-5 lg:px-10 bg-white">
      <div className="mx-auto max-w-[1200px]">
        {/* Section header */}
        <div className="text-center mb-[60px]">
          <span className="inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.06em] px-4 py-1.5 rounded-full mb-5 bg-[rgba(34,197,94,0.08)] text-[var(--green-dark)]">
            Pourquoi Nexartis
          </span>
          <h2 className="text-[28px] sm:text-[38px] font-[800] tracking-[-0.03em] text-[var(--navy)] mb-3.5">
            Des outils professionnels à la hauteur de votre activité
          </h2>
          <p className="text-[17px] text-[var(--muted)] font-medium max-w-[560px] mx-auto">
            Trois problèmes que les artisans rencontrent tous les jours, résolus en un seul logiciel.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 reveal">
          {problems.map((problem, i) => (
            <div
              key={i}
              className={`bg-white border border-[var(--border)] rounded-[var(--radius)] p-[36px_30px] shadow-[var(--shadow)] transition-all duration-300 hover:shadow-[var(--shadow-hover)] hover:-translate-y-[3px] reveal reveal-delay-${i + 1}`}
            >
              <div
                className="w-[52px] h-[52px] rounded-[16px] flex items-center justify-center mb-[22px]"
                style={{ background: problem.iconBg }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={problem.iconColor}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {problem.svgPaths}
                </svg>
              </div>
              <h3 className="text-[18px] font-[800] text-[var(--navy)] mb-2.5 tracking-[-0.01em]">
                {problem.title}
              </h3>
              <p className="text-[14px] text-[var(--muted)] font-medium leading-[1.65]">
                {problem.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
