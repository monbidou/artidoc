"use client";

import { useState, useMemo } from "react";
import { useFactures, useDevis, useChantiers, LoadingSkeleton } from "@/lib/hooks";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const MONTH_NAMES = [
  "Jan", "Fév", "Mar", "Avr", "Mai", "Jun",
  "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc",
];

function formatCurrency(n: number): string {
  return n.toLocaleString("fr-FR", { maximumFractionDigits: 0 }) + " €";
}

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

function SectionHeader({ title }: { title: string }) {
  return (
    <h2 className="font-syne font-bold text-xl text-[#1a1a2e] mb-4 mt-10 first:mt-0">
      {title}
    </h2>
  );
}

export default function StatistiquesPage() {
  const [chartYear, setChartYear] = useState(new Date().getFullYear());

  const { data: factures, loading: loadingF } = useFactures();
  const { data: devis, loading: loadingD } = useDevis();
  const { data: chantiers, loading: loadingCh } = useChantiers();

  const loading = loadingF || loadingD || loadingCh;

  const stats = useMemo(() => {
    const facs = factures.map((f) => f as Record<string, unknown>);
    const devs = devis.map((d) => d as Record<string, unknown>);
    const chants = chantiers.map((c) => c as Record<string, unknown>);

    // CA facturé = toutes les factures émises (hors brouillon)
    const emittedFactures = facs.filter((f) => {
      const s = (f.statut as string) ?? "";
      return s !== "brouillon";
    });
    const totalCAFacture = emittedFactures.reduce((s, f) => s + ((f.montant_ttc as number) ?? 0), 0);

    // CA encaissé = factures payées ou archivées
    const paidFactures = facs.filter((f) => {
      const s = (f.statut as string) ?? "";
      return s === "payee" || s === "archivee" || s === "Encaissée";
    });
    const totalCA = paidFactures.reduce((s, f) => s + ((f.montant_ttc as number) ?? 0), 0);

    const resteAEncaisser = totalCAFacture - totalCA;

    const monthlyFacture: number[] = new Array(12).fill(0);
    const monthlyEncaisse: number[] = new Array(12).fill(0);

    for (const f of facs) {
      const statut = (f.statut as string) ?? "";
      if (statut === "brouillon") continue;
      const dateStr = (f.date_emission as string) || (f.created_at as string);
      if (!dateStr) continue;
      const d = new Date(dateStr);
      if (d.getFullYear() !== chartYear) continue;
      const month = d.getMonth();
      monthlyFacture[month] += (f.montant_ttc as number) ?? 0;
      if (statut === "payee" || statut === "archivee" || statut === "Encaissée") {
        monthlyEncaisse[month] += (f.montant_ttc as number) ?? 0;
      }
    }

    const chartData = MONTH_NAMES.map((name, i) => ({
      month: name,
      facture: monthlyFacture[i],
      encaisse: monthlyEncaisse[i],
    }));

    const maxChartValue = Math.max(...chartData.map((d) => d.facture), 1);
    const yMax = Math.ceil(maxChartValue / 5000) * 5000;
    const yAxisValues = [0, Math.round(yMax / 3), Math.round((yMax * 2) / 3), yMax];

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

    const chantiersActifs = chants.filter((c) => {
      const s = (c.statut as string) ?? "";
      return s === "en_cours" || s === "planifie";
    }).length;

    return {
      totalCA,
      totalCAFacture,
      resteAEncaisser,
      chartData,
      maxChartValue: yMax || 1,
      yAxisValues,
      tauxTransformation,
      montantMoyenDevis,
      montantImpaye,
      facturesEnRetard,
      tauxEncaissement,
      chantiersActifs,
    };
  }, [factures, devis, chantiers, chartYear]);

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
        <h1 className="font-syne font-bold text-2xl text-[#1a1a2e] mb-8">
          Statistiques
        </h1>

        <SectionHeader title="Chiffre d'affaires" />

        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <p className="text-sm text-[#6b7280] font-manrope">
                CA encaissé {chartYear}
              </p>
              <p className="font-syne font-bold text-3xl text-[#22c55e]">
                {formatCurrency(stats.totalCA)}
              </p>
              <div className="flex gap-4 mt-1">
                <span className="text-xs text-[#6b7280] font-manrope">Facturé : <strong className="text-[#1a1a2e]">{formatCurrency(stats.totalCAFacture)}</strong></span>
                <span className="text-xs text-[#6b7280] font-manrope">Reste : <strong className="text-[#e87a2a]">{formatCurrency(stats.resteAEncaisser)}</strong></span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setChartYear(chartYear - 1)} className="px-3 py-1.5 text-xs font-medium text-[#6b7280] hover:bg-gray-50 border border-gray-200 rounded-lg">&larr; {chartYear - 1}</button>
              <span className="px-3 py-1.5 text-xs font-bold bg-[#0f1a3a] text-white rounded-lg">{chartYear}</span>
              <button onClick={() => setChartYear(chartYear + 1)} disabled={chartYear >= new Date().getFullYear()} className="px-3 py-1.5 text-xs font-medium text-[#6b7280] hover:bg-gray-50 border border-gray-200 rounded-lg disabled:opacity-30">{chartYear + 1} &rarr;</button>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b7280' }} />
              <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)} />
              <Tooltip
                formatter={(value, name) => [
                  `${Number(value).toLocaleString('fr-FR')} €`,
                  name === 'facture' ? 'CA facturé' : 'CA encaissé',
                ]}
                contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13 }}
              />
              <Legend formatter={(value: string) => value === 'facture' ? 'CA facturé' : 'CA encaissé'} />
              <Bar dataKey="facture" fill="#5ab4e0" radius={[4, 4, 0, 0]} />
              <Bar dataKey="encaisse" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <SectionHeader title="Devis" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Taux de transformation"
            value={`${stats.tauxTransformation}%`}
            valueColor="text-[#22c55e]"
            size="3xl"
          />
          <StatCard label="Délai moyen signature" value="—" />
          <StatCard label="Montant moyen" value={formatCurrency(stats.montantMoyenDevis)} />
          <StatCard
            label="Devis signés"
            value={`${devis.filter((d) => { const s = ((d as Record<string, unknown>).statut as string) ?? ''; return s === 'signe' || s === 'facture'; }).length}`}
          />
        </div>

        <SectionHeader title="Factures" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Délai moyen paiement" value="—" />
          <StatCard
            label="Reste à encaisser"
            value={formatCurrency(stats.resteAEncaisser)}
            valueColor="text-[#e87a2a]"
          />
          <StatCard
            label="Factures en retard"
            value={String(stats.facturesEnRetard)}
            valueColor="text-[#ef4444]"
          />
          <StatCard label="Taux encaissement" value={`${stats.tauxEncaissement}%`} />
        </div>

        <SectionHeader title="Planning" />
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          <StatCard label="Taux occupation" value="—" />
          <StatCard label="Jour le plus chargé" value="—" />
          <StatCard label="Chantiers actifs" value={String(stats.chantiersActifs)} />
        </div>
      </div>
    </div>
  );
}
