"use client";

import { useState, useMemo } from "react";
import { useFactures, useDevis, useChantiers, LoadingSkeleton } from "@/lib/hooks";

// --- Month names with correct Unicode ---
const MONTH_NAMES = [
  "Jan", "F\u00e9v", "Mar", "Avr", "Mai", "Jun",
  "Jul", "Ao\u00fb", "Sep", "Oct", "Nov", "D\u00e9c",
];

function formatCurrency(n: number): string {
  return n.toLocaleString("fr-FR", { maximumFractionDigits: 0 }) + " \u20AC";
}

// --- Stat card component ---
function StatCard({
  label,
  value,
  valueColor = "text-[#1a1a2e]",
  size = "2xl",
}: {
  label: string;
  value: string;
  valueColor?: string;
  size?: "2xl" | "3xl";
}) {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
      <p className="text-sm text-[#6b7280] font-manrope mb-2">{label}</p>
      <p
        className={`font-syne font-bold ${
          size === "3xl" ? "text-3xl" : "text-2xl"
        } ${valueColor}`}
      >
        {value}
      </p>
    </div>
  );
}

// --- Section header ---
function SectionHeader({ title }: { title: string }) {
  return (
    <h2 className="font-syne font-bold text-xl text-[#1a1a2e] mb-4 mt-10 first:mt-0">
      {title}
    </h2>
  );
}

// --- Page ---
export default function StatistiquesPage() {
  const [period, setPeriod] = useState("Mois");
  const periods = ["Semaine", "Mois", "Trimestre", "Ann\u00e9e"];

  const { data: factures, loading: loadingF } = useFactures();
  const { data: devis, loading: loadingD } = useDevis();
  const { data: chantiers, loading: loadingCh } = useChantiers();

  const loading = loadingF || loadingD || loadingCh;

  // Computed stats
  const stats = useMemo(() => {
    const facs = factures.map((f) => f as Record<string, unknown>);
    const devs = devis.map((d) => d as Record<string, unknown>);
    const chants = chantiers.map((c) => c as Record<string, unknown>);

    // --- CA ---
    const paidFactures = facs.filter((f) => (f.statut as string) === "payee");
    const totalCA = paidFactures.reduce((s, f) => s + ((f.montant_ttc as number) ?? 0), 0);

    // Monthly chart: group factures by month of date_facture
    const monthlyFacture: number[] = new Array(12).fill(0);
    const monthlyEncaisse: number[] = new Array(12).fill(0);
    const currentYear = new Date().getFullYear();

    for (const f of facs) {
      const dateStr = f.date_facture as string | null;
      if (!dateStr) continue;
      const d = new Date(dateStr);
      if (d.getFullYear() !== currentYear) continue;
      const month = d.getMonth();
      monthlyFacture[month] += (f.montant_ttc as number) ?? 0;
      if ((f.statut as string) === "payee") {
        monthlyEncaisse[month] += (f.montant_ttc as number) ?? 0;
      }
    }

    const chartData = MONTH_NAMES.map((name, i) => ({
      month: name,
      facture: monthlyFacture[i],
      encaisse: monthlyEncaisse[i],
    }));

    const maxChartValue = Math.max(...chartData.map((d) => d.facture), 1);

    // Round up to nice y-axis
    const yMax = Math.ceil(maxChartValue / 5000) * 5000;
    const yAxisValues = [0, Math.round(yMax / 3), Math.round((yMax * 2) / 3), yMax];

    // --- Devis ---
    const totalDevis = devs.length;
    const signedDevis = devs.filter((d) => {
      const s = (d.statut as string) ?? "";
      return s === "signe" || s === "facture";
    }).length;
    const tauxTransformation = totalDevis > 0 ? Math.round((signedDevis / totalDevis) * 100) : 0;

    const devisMontants = devs
      .map((d) => (d.montant_ttc as number) ?? 0)
      .filter((m) => m > 0);
    const montantMoyenDevis = devisMontants.length > 0
      ? Math.round(devisMontants.reduce((a, b) => a + b, 0) / devisMontants.length)
      : 0;

    // --- Factures stats ---
    const totalFacturesHT = facs.reduce((s, f) => s + ((f.montant_ht as number) ?? 0), 0);
    const impayees = facs.filter((f) => {
      const s = (f.statut as string) ?? "";
      return s === "en_retard" || s === "en_attente" || s === "partielle";
    });
    const montantImpaye = impayees.reduce((s, f) => {
      const ttc = (f.montant_ttc as number) ?? 0;
      const paye = (f.montant_paye as number) ?? 0;
      return s + (ttc - paye);
    }, 0);
    const facturesEnRetard = facs.filter((f) => (f.statut as string) === "en_retard").length;

    const totalFacturesTTC = facs.reduce((s, f) => s + ((f.montant_ttc as number) ?? 0), 0);
    const totalPaye = facs.reduce((s, f) => s + ((f.montant_paye as number) ?? 0), 0);
    const tauxEncaissement = totalFacturesTTC > 0
      ? Math.round((totalPaye / totalFacturesTTC) * 100)
      : 0;

    // --- Planning ---
    const chantiersActifs = chants.filter((c) => {
      const s = (c.statut as string) ?? "";
      return s === "en_cours" || s === "planifie";
    }).length;

    return {
      totalCA,
      chartData,
      maxChartValue: yMax || 1,
      yAxisValues,
      tauxTransformation,
      montantMoyenDevis,
      totalFacturesHT,
      montantImpaye,
      facturesEnRetard,
      tauxEncaissement,
      chantiersActifs,
    };
  }, [factures, devis, chantiers]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="font-syne font-bold text-2xl text-[#1a1a2e] mb-8">
            Statistiques
          </h1>
          <LoadingSkeleton rows={8} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page title */}
        <h1 className="font-syne font-bold text-2xl text-[#1a1a2e] mb-8">
          Statistiques
        </h1>

        {/* ===================== */}
        {/* Section 1: Chiffre d'affaires */}
        {/* ===================== */}
        <SectionHeader title="Chiffre d'affaires" />

        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          {/* Header row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <p className="text-sm text-[#6b7280] font-manrope">
                Total CA ann&eacute;e
              </p>
              <p className="font-syne font-bold text-3xl text-[#1a1a2e]">
                {formatCurrency(stats.totalCA)} HT
              </p>
            </div>
            <div className="flex rounded-lg border border-gray-200 overflow-hidden self-start">
              {periods.map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                    period === p
                      ? "bg-[#0f1a3a] text-white"
                      : "text-[#6b7280] hover:bg-gray-50"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex gap-6 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-[#5ab4e0]" />
              <span className="text-xs text-[#6b7280]">CA factur&eacute;</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-[#22c55e]" />
              <span className="text-xs text-[#6b7280]">
                CA encaiss&eacute;
              </span>
            </div>
          </div>

          {/* Chart (larger) */}
          <div className="flex items-end gap-1">
            {/* Y-axis */}
            <div className="flex flex-col justify-between h-[280px] mr-3 pb-6">
              {[...stats.yAxisValues].reverse().map((v) => (
                <span key={v} className="text-xs text-[#6b7280] leading-none">
                  {v === 0 ? "0" : `${(v / 1000).toFixed(0)}k`}
                </span>
              ))}
            </div>

            {/* Bars */}
            <div className="flex-1 flex items-end gap-2">
              {stats.chartData.map((d) => {
                const barH = (d.facture / stats.maxChartValue) * 280;
                const greenH = (d.encaisse / stats.maxChartValue) * 280;
                return (
                  <div
                    key={d.month}
                    className="flex-1 flex flex-col items-center group"
                  >
                    {/* Tooltip on hover */}
                    <div className="hidden group-hover:block text-xs text-center mb-1">
                      <span className="text-[#5ab4e0] font-medium">
                        {d.facture.toLocaleString("fr-FR")} &euro;
                      </span>
                      <br />
                      <span className="text-[#22c55e] font-medium">
                        {d.encaisse.toLocaleString("fr-FR")} &euro;
                      </span>
                    </div>
                    <div
                      className="w-full relative rounded-t-sm"
                      style={{ height: `${barH}px` }}
                    >
                      <div
                        className="absolute bottom-0 w-full bg-[#5ab4e0] rounded-t-sm"
                        style={{ height: `${barH}px` }}
                      />
                      <div
                        className="absolute bottom-0 w-full bg-[#22c55e] rounded-t-sm opacity-70"
                        style={{ height: `${greenH}px` }}
                      />
                    </div>
                    <span className="text-xs text-[#6b7280] mt-2">
                      {d.month}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ===================== */}
        {/* Section 2: Devis */}
        {/* ===================== */}
        <SectionHeader title="Devis" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Taux de transformation"
            value={`${stats.tauxTransformation}%`}
            valueColor="text-[#22c55e]"
            size="3xl"
          />
          <StatCard label="D\u00e9lai moyen signature" value="\u2014" />
          <StatCard label="Montant moyen" value={formatCurrency(stats.montantMoyenDevis)} />
          <StatCard
            label="Devis sign\u00e9s"
            value={`${devis.filter((d) => { const s = ((d as Record<string, unknown>).statut as string) ?? ''; return s === 'signe' || s === 'facture'; }).length}`}
          />
        </div>

        {/* ===================== */}
        {/* Section 3: Factures */}
        {/* ===================== */}
        <SectionHeader title="Factures" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="D\u00e9lai moyen paiement" value="\u2014" />
          <StatCard
            label="Montant impay\u00e9"
            value={formatCurrency(stats.montantImpaye)}
            valueColor="text-[#e87a2a]"
          />
          <StatCard
            label="Factures en retard"
            value={String(stats.facturesEnRetard)}
            valueColor="text-[#ef4444]"
          />
          <StatCard label="Taux encaissement" value={`${stats.tauxEncaissement}%`} />
        </div>

        {/* ===================== */}
        {/* Section 4: Planning */}
        {/* ===================== */}
        <SectionHeader title="Planning" />
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          <StatCard label="Taux occupation" value="\u2014" />
          <StatCard label="Jour le plus charg\u00e9" value="\u2014" />
          <StatCard label="Chantiers actifs" value={String(stats.chantiersActifs)} />
        </div>
      </div>
    </div>
  );
}
