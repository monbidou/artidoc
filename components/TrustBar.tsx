"use client";

const items = [
  "Conforme Factur-X 2026",
  "Certifié anti-fraude TVA",
  "Données hébergées en France",
  "Support réactif par email",
];

export default function TrustBar() {
  return (
    <section className="bg-[var(--bg)] py-7 px-5 lg:px-10 border-b border-[var(--border)]">
      <div className="mx-auto max-w-[1200px] flex items-center justify-center flex-wrap gap-8">
        {items.map((item) => (
          <div key={item} className="flex items-center gap-2 text-sm font-semibold text-[var(--text-2)]">
            <div className="w-5 h-5 rounded-md bg-[rgba(34,197,94,0.1)] text-[var(--green)] flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            {item}
          </div>
        ))}
      </div>
    </section>
  );
}
