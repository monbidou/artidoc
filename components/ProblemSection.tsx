"use client";

const problems = [
  {
    title: "Des tarifs transparents et maîtrisés",
    text: "Les solutions du marché atteignent souvent 50 à 100 € par mois pour accéder à l'ensemble des fonctionnalités. Nexartis propose tous les outils à 25 € par mois, sans restriction ni option cachée.",
    circleBg: "#dcfce7",
    iconColor: "#16a34a",
    svgPaths: <><circle cx="12" cy="12" r="10"/><path d="M14.5 8a4 4 0 1 0 0 8H9"/><path d="M8 12h6"/></>,
  },
  {
    title: "Une planification fiable, sans conflit d'affectation",
    text: "Les logiciels existants proposent un calendrier basique, sans détection de conflits. Nexartis vous alerte immédiatement si un intervenant est déjà affecté à un autre chantier le même jour.",
    circleBg: "#dbeafe",
    iconColor: "#2563eb",
    svgPaths: <><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>,
  },
  {
    title: "Conçu pour une utilisation sur le terrain",
    text: "Nexartis fonctionne parfaitement sur smartphone comme sur ordinateur. L'interface a été pensée pour être utilisée rapidement, en situation de mobilité, directement depuis vos chantiers.",
    circleBg: "#ffedd5",
    iconColor: "#ea580c",
    svgPaths: <><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></>,
  },
];

export default function ProblemSection() {
  return (
    <section className="bg-white px-6 py-14 lg:py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="mx-auto max-w-3xl text-center font-syne text-2xl font-extrabold text-[#0f1a3a] md:text-3xl lg:text-4xl">
          Des outils professionnels à la hauteur de votre activité
        </h2>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {problems.map((problem, i) => (
            <div
              key={i}
              className="group rounded-2xl border border-gray-100 bg-white p-8 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div style={{width:56, height:56, borderRadius:'50%', background:problem.circleBg, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:16}}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={problem.iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {problem.svgPaths}
                </svg>
              </div>
              <h3 className="mb-3 font-syne text-xl font-bold text-[#0f1a3a]">
                {problem.title}
              </h3>
              <p className="font-manrope leading-relaxed text-[#0f1a3a]/70">
                {problem.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
