"use client";

import Link from "next/link";
import { useState } from "react";
import { useDevis, useFactures, usePlanning, useClients, useIntervenants, LoadingSkeleton } from "@/lib/hooks";
import EmptyDashboard from "@/components/dashboard/EmptyDashboard";

function formatEuro(n: number) {
  return n.toLocaleString("fr-FR", { maximumFractionDigits: 0 }) + " €";
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `il y a ${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `il y a ${days}j`;
  return `il y a ${Math.floor(days / 7)} sem`;
}

// --- Page ---

export default function DashboardPage() {
  const { data: factures, loading: fLoading } = useFactures();
  const { data: devis, loading: dLoading } = useDevis();
  const { data: planning, loading: pLoading } = usePlanning();
  const { data: clients } = useClients();
  const { data: intervenants } = useIntervenants();
  const [period, setPeriod] = useState("Mois");

  const loading = fLoading || dLoading || pLoading;

  // Computed metrics
  const facturesPayees = factures.filter((f: Record<string, unknown>) => f.statut === 'payee');
  const caFacture = factures.reduce((sum: number, f: Record<string, unknown>) => sum + Number(f.montant_ttc || 0), 0);
  const caEncaisse = facturesPayees.reduce((sum: number, f: Record<string, unknown>) => sum + Number(f.montant_ttc || 0), 0);
  const resteAEncaisser = caFacture - caEncaisse;
  const facturesImpayees = factures.filter((f: Record<string, unknown>) => f.statut === 'en_retard' || f.statut === 'envoyee');
  const devisEnCours = devis.filter((d: Record<string, unknown>) => d.statut === 'envoye' || d.statut === 'brouillon');
  const devisEnCoursMontant = devisEnCours.reduce((sum: number, d: Record<string, unknown>) => sum + Number(d.montant_ht || 0), 0);

  // Client name resolver
  const clientName = (id: unknown) => {
    const c = clients.find((c: Record<string, unknown>) => c.id === id) as Record<string, unknown> | undefined;
    if (!c) return '';
    return c.prenom ? `${c.prenom} ${c.nom}` : String(c.nom || '');
  };

  // Intervenant name
  const intervenantName = (id: unknown) => {
    const i = intervenants.find((i: Record<string, unknown>) => i.id === id) as Record<string, unknown> | undefined;
    if (!i) return '';
    return `${String(i.prenom || '').charAt(0)}. ${i.nom}`;
  };

  // Planning this week
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  monday.setHours(0, 0, 0, 0);
  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);
  friday.setHours(23, 59, 59, 999);

  const weekPlanning = planning.filter((p: Record<string, unknown>) => {
    const d = new Date(p.date_debut as string);
    return d >= monday && d <= friday;
  });

  const dayLabels = ["Lun", "Mar", "Mer", "Jeu", "Ven"];
  const planningByDay = dayLabels.map((label, idx) => {
    const dayDate = new Date(monday);
    dayDate.setDate(monday.getDate() + idx);
    const dayStr = dayDate.toISOString().split('T')[0];
    const entries = weekPlanning.filter((p: Record<string, unknown>) => String(p.date_debut).startsWith(dayStr));
    return { day: label, entries };
  });

  const bgColors = ["bg-[#5ab4e0]/10", "bg-[#e87a2a]/10", "bg-[#22c55e]/10", "bg-purple-500/10", "bg-amber-500/10", "bg-rose-500/10"];

  // Chart data from factures grouped by month
  const monthLabels = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];
  const currentYear = new Date().getFullYear();
  const chartData = monthLabels.map((label, monthIdx) => {
    const monthFactures = factures.filter((f: Record<string, unknown>) => {
      const d = new Date(f.date_emission as string);
      return d.getFullYear() === currentYear && d.getMonth() === monthIdx;
    });
    const facture = monthFactures.reduce((s: number, f: Record<string, unknown>) => s + Number(f.montant_ttc || 0), 0);
    const encaisse = monthFactures.filter((f: Record<string, unknown>) => f.statut === 'payee')
      .reduce((s: number, f: Record<string, unknown>) => s + Number(f.montant_ttc || 0), 0);
    return { month: label, facture, encaisse };
  });
  const maxChartValue = Math.max(...chartData.map((d) => d.facture), 1);
  const yMax = Math.ceil(maxChartValue / 5000) * 5000 || 5000;
  const yAxisValues = [0, Math.round(yMax / 3), Math.round((yMax * 2) / 3), yMax];

  // Recent activity (last devis/factures by date)
  type ActivityItem = { icon: string; desc: string; detail: string; amount: string; time: string };
  const activityData: ActivityItem[] = [];
  const sortedDevis = [...devis].sort((a: Record<string, unknown>, b: Record<string, unknown>) =>
    new Date(b.created_at as string).getTime() - new Date(a.created_at as string).getTime()
  ).slice(0, 4);
  const sortedFactures = [...factures].sort((a: Record<string, unknown>, b: Record<string, unknown>) =>
    new Date(b.created_at as string).getTime() - new Date(a.created_at as string).getTime()
  ).slice(0, 4);

  for (const d of sortedDevis) {
    const statusLabel = d.statut === 'signe' ? 'signé' : d.statut === 'envoye' ? 'envoyé' : 'créé';
    activityData.push({
      icon: "📄", desc: `Devis ${d.numero} ${statusLabel}`,
      detail: clientName(d.client_id), amount: d.montant_ttc ? formatEuro(Number(d.montant_ttc)) : '',
      time: timeAgo(d.created_at as string),
    });
  }
  for (const f of sortedFactures) {
    const statusLabel = f.statut === 'payee' ? 'payée' : 'envoyée';
    activityData.push({
      icon: f.statut === 'payee' ? "✅" : "🧾", desc: `Facture ${f.numero} ${statusLabel}`,
      detail: clientName(f.client_id), amount: f.montant_ttc ? formatEuro(Number(f.montant_ttc)) : '',
      time: timeAgo(f.created_at as string),
    });
  }
  activityData.sort((a, b) => {
    const parse = (t: string) => { const m = t.match(/(\d+)/); return m ? parseInt(m[1]) : 999; };
    return parse(a.time) - parse(b.time);
  });

  // Empty state
  const hasData = factures.length > 0 || devis.length > 0;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-syne font-bold text-2xl text-[#1a1a2e] mb-6">Tableau de bord</h1>
        <LoadingSkeleton rows={8} />
      </div>
    );
  }

  if (!hasData) {
    return <EmptyDashboard userName="" />;
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-syne font-bold text-2xl text-[#1a1a2e] mb-6">Tableau de bord</h1>

        {/* Alerts */}
        {facturesImpayees.length > 0 && (
          <div className="space-y-3 mb-8">
            <div className="bg-[#fff7ed] border-l-4 border-[#e87a2a] p-4 rounded flex items-center justify-between">
              <span className="text-sm text-[#1a1a2e]">
                ⚠ {facturesImpayees.length} facture{facturesImpayees.length > 1 ? 's' : ''} en attente de paiement
              </span>
              <Link href="/dashboard/factures" className="text-sm font-semibold text-[#e87a2a] hover:underline whitespace-nowrap ml-4">
                Voir les factures &rarr;
              </Link>
            </div>
          </div>
        )}

        {/* Metric cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <p className="text-sm text-[#6b7280] font-manrope mb-1">CA facturé</p>
            <p className="font-syne font-bold text-2xl text-[#1a1a2e]">{formatEuro(caFacture)} HT</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <p className="text-sm text-[#6b7280] font-manrope mb-1">CA encaissé</p>
            <p className="font-syne font-bold text-2xl text-[#1a1a2e]">{formatEuro(caEncaisse)}</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <p className="text-sm text-[#6b7280] font-manrope mb-1">Reste à encaisser</p>
            <p className="font-syne font-bold text-2xl text-[#e87a2a]">{formatEuro(resteAEncaisser)}</p>
            <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-[#e87a2a]/10 text-xs font-medium text-[#e87a2a]">
              {facturesImpayees.length} facture{facturesImpayees.length > 1 ? 's' : ''}
            </span>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <p className="text-sm text-[#6b7280] font-manrope mb-1">Devis en cours</p>
            <p className="font-syne font-bold text-2xl text-[#1a1a2e]">{devisEnCours.length}</p>
            <span className="text-sm text-[#6b7280] mt-1 inline-block">{formatEuro(devisEnCoursMontant)} HT</span>
          </div>
        </div>

        {/* Two columns: Planning + Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-syne font-bold text-lg text-[#1a1a2e]">Planning de la semaine</h2>
                <Link href="/dashboard/planning" className="text-sm text-[#5ab4e0] hover:underline">
                  Voir le planning complet &rarr;
                </Link>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {planningByDay.map((day) => (
                  <div key={day.day} className="min-h-[120px]">
                    <p className="text-xs font-semibold text-[#6b7280] text-center mb-2 uppercase tracking-wide">{day.day}</p>
                    <div className="space-y-2">
                      {day.entries.length === 0 ? (
                        <div className="border-2 border-dashed border-gray-200 rounded-lg p-2 flex items-center justify-center min-h-[80px]">
                          <span className="text-xs text-[#6b7280]">Libre</span>
                        </div>
                      ) : (
                        day.entries.map((entry: Record<string, unknown>, j: number) => (
                          <div key={j} className={`${bgColors[j % bgColors.length]} rounded-lg p-2`}>
                            <p className="text-xs text-[#6b7280]">{intervenantName(entry.intervenant_id)}</p>
                            <p className="text-sm font-semibold text-[#1a1a2e]">{clientName(entry.client_id)}</p>
                            <p className="text-xs text-[#5ab4e0]">{String(entry.titre || '')}</p>
                            <p className="text-xs text-[#6b7280] mt-0.5">{String(entry.heure_debut || '8:00')}→{String(entry.heure_fin || '17:00')}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
              <h2 className="font-syne font-bold text-lg text-[#1a1a2e] mb-4">Activité récente</h2>
              {activityData.length === 0 ? (
                <p className="text-sm text-[#6b7280] font-manrope py-8 text-center">Aucune activité pour le moment</p>
              ) : (
                <div>
                  {activityData.slice(0, 8).map((item, i) => (
                    <div key={i} className={`py-3 flex gap-3 items-start ${i < Math.min(activityData.length, 8) - 1 ? "border-b border-gray-100" : ""}`}>
                      <span className="text-lg mt-0.5">{item.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#1a1a2e]">{item.desc}</p>
                        <p className="text-xs text-[#6b7280]">
                          {item.detail}
                          {item.amount && <span className="text-[#1a1a2e] font-medium"> &mdash; {item.amount}</span>}
                        </p>
                      </div>
                      <span className="text-xs text-[#6b7280] whitespace-nowrap mt-1">{item.time}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CA Chart */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-syne font-bold text-lg text-[#1a1a2e]">Chiffre d&apos;affaires</h2>
            <div className="flex rounded-lg border border-gray-200 overflow-hidden">
              {["Semaine", "Mois", "Trimestre", "Année"].map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${period === p ? "bg-[#0f1a3a] text-white" : "text-[#6b7280] hover:bg-gray-50"}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-6 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-[#5ab4e0]" />
              <span className="text-xs text-[#6b7280]">CA facturé</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-[#22c55e]" />
              <span className="text-xs text-[#6b7280]">CA encaissé</span>
            </div>
          </div>
          <div className="flex items-end gap-1">
            <div className="flex flex-col justify-between h-[200px] mr-2 pb-6">
              {[...yAxisValues].reverse().map((v) => (
                <span key={v} className="text-xs text-[#6b7280] leading-none">
                  {v === 0 ? "0" : `${(v / 1000).toFixed(0)}k`}
                </span>
              ))}
            </div>
            <div className="flex-1 flex items-end gap-1">
              {chartData.map((d) => {
                const barH = maxChartValue > 0 ? (d.facture / yMax) * 200 : 0;
                const greenH = maxChartValue > 0 ? (d.encaisse / yMax) * 200 : 0;
                return (
                  <div key={d.month} className="flex-1 flex flex-col items-center">
                    <div className="w-full relative rounded-t-sm" style={{ height: `${barH}px` }}>
                      <div className="absolute bottom-0 w-full bg-[#5ab4e0] rounded-t-sm" style={{ height: `${barH}px` }} />
                      <div className="absolute bottom-0 w-full bg-[#22c55e] rounded-t-sm opacity-70" style={{ height: `${greenH}px` }} />
                    </div>
                    <span className="text-xs text-[#6b7280] mt-2">{d.month}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
