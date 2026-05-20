import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Politique de confidentialité — Nexartis',
  description:
    'Politique de confidentialité Nexartis : données collectées, finalités, durée de conservation, vos droits RGPD.',
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: '/rgpd',
  },
}

export default function RgpdPage() {
  return (
    <article className="mx-auto max-w-3xl px-5 py-16 sm:py-20">
      <header className="mb-10">
        <p className="font-manrope text-sm font-semibold uppercase tracking-wider text-orange">
          Vos données, votre contrôle
        </p>
        <h1 className="mt-2 font-syne text-4xl font-bold tracking-tight text-navy sm:text-5xl">
          Politique de confidentialité
        </h1>
        <p className="mt-3 text-sm text-navy/60">
          Dernière mise à jour : 20 mai 2026 — Conforme au Règlement (UE) 2016/679 (RGPD)
        </p>
      </header>

      <div className="prose prose-slate max-w-none font-manrope text-[15px] leading-relaxed text-navy">
        <section className="mb-10">
          <h2 className="font-syne text-2xl font-bold text-navy">1. Préambule</h2>
          <p>
            La présente politique de confidentialité décrit la manière dont Nexartis traite vos données
            personnelles dans le cadre de la fourniture du service de gestion de devis, factures et chantiers
            accessible à l&apos;adresse nexartis.fr. Nous nous engageons à respecter le Règlement Général sur
            la Protection des Données (RGPD) et la loi française « Informatique et Libertés ».
          </p>
        </section>

        <section className="mb-10">
          <h2 className="font-syne text-2xl font-bold text-navy">
            2. Responsable du traitement
          </h2>
          <p>Le responsable du traitement des données est :</p>
          <ul className="list-disc pl-6">
            <li><strong>[Raison sociale à compléter]</strong></li>
            <li>[Adresse complète à compléter]</li>
            <li>SIRET : [À compléter]</li>
            <li>
              Email :{' '}
              <a
                href="mailto:contact.nexartis@gmail.com"
                className="text-sky underline-offset-4 hover:underline"
              >
                contact.nexartis@gmail.com
              </a>
            </li>
          </ul>
          <p>
            <strong>Délégué à la protection des données (DPO)</strong> : [À compléter — non obligatoire pour une petite structure mais recommandé d&apos;indiquer un contact]
          </p>
        </section>

        <section className="mb-10">
          <h2 className="font-syne text-2xl font-bold text-navy">
            3. Données collectées et finalités
          </h2>

          <h3 className="font-syne text-lg font-bold text-navy mt-6">3.1. Création de compte</h3>
          <p><strong>Données collectées</strong> : email, mot de passe (chiffré), nom, prénom, raison sociale, SIRET, adresse postale, téléphone.</p>
          <p><strong>Finalité</strong> : permettre la création et la gestion du compte utilisateur.</p>
          <p><strong>Base légale</strong> : exécution du contrat (article 6.1.b du RGPD).</p>

          <h3 className="font-syne text-lg font-bold text-navy mt-6">3.2. Utilisation du service</h3>
          <p><strong>Données collectées</strong> : données de devis, factures, chantiers, clients, paiements saisies par l&apos;utilisateur ; logs de connexion ; adresse IP ; identifiant de session.</p>
          <p><strong>Finalité</strong> : fournir le service, maintenir la sécurité, assurer la traçabilité.</p>
          <p><strong>Base légale</strong> : exécution du contrat + obligations légales (conservation des factures pendant 10 ans, art. L.123-22 du Code de commerce).</p>

          <h3 className="font-syne text-lg font-bold text-navy mt-6">3.3. Paiement</h3>
          <p><strong>Données collectées</strong> : informations de carte bancaire (collectées et traitées directement par Stripe, jamais stockées par Nexartis), historique de paiement.</p>
          <p><strong>Finalité</strong> : encaisser l&apos;abonnement.</p>
          <p><strong>Base légale</strong> : exécution du contrat.</p>

          <h3 className="font-syne text-lg font-bold text-navy mt-6">3.4. Communication marketing (optionnelle)</h3>
          <p><strong>Données collectées</strong> : email, prénom, métier (si renseigné).</p>
          <p><strong>Finalité</strong> : envoi de la newsletter et d&apos;informations sur les nouveautés.</p>
          <p><strong>Base légale</strong> : consentement de l&apos;utilisateur (article 6.1.a du RGPD), révocable à tout moment.</p>

          <h3 className="font-syne text-lg font-bold text-navy mt-6">3.5. Mesure d&apos;audience</h3>
          <p><strong>Données collectées</strong> : pages visitées, durée des sessions, type d&apos;appareil, navigateur, anonymisées via Google Analytics.</p>
          <p><strong>Finalité</strong> : améliorer le service, mesurer la fréquentation.</p>
          <p><strong>Base légale</strong> : consentement via la bannière cookies.</p>
        </section>

        <section className="mb-10">
          <h2 className="font-syne text-2xl font-bold text-navy">4. Durée de conservation</h2>
          <ul className="list-disc pl-6">
            <li><strong>Données de compte actif</strong> : pendant toute la durée de l&apos;abonnement.</li>
            <li><strong>Données après résiliation</strong> : 90 jours pour permettre l&apos;export, puis suppression complète.</li>
            <li><strong>Factures et données comptables</strong> : 10 ans (obligation légale, art. L.123-22 Code de commerce).</li>
            <li><strong>Logs techniques</strong> : 12 mois maximum.</li>
            <li><strong>Données marketing</strong> : 3 ans après le dernier contact ou dès retrait du consentement.</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="font-syne text-2xl font-bold text-navy">5. Destinataires des données</h2>
          <p>Vos données ne sont jamais vendues ni partagées à des fins commerciales. Elles sont accessibles uniquement à :</p>
          <ul className="list-disc pl-6">
            <li>L&apos;équipe Nexartis (administration, support, développement) dans la limite stricte de la nécessité.</li>
            <li>Nos sous-traitants techniques, encadrés contractuellement :</li>
          </ul>

          <h3 className="font-syne text-lg font-bold text-navy mt-6">Sous-traitants techniques</h3>
          <ul className="list-disc pl-6">
            <li><strong>Vercel Inc.</strong> (États-Unis) — hébergement applicatif. Conforme aux Clauses Contractuelles Types (CCT) européennes.</li>
            <li><strong>Supabase Inc.</strong> — base de données. Données hébergées en France (région UE).</li>
            <li><strong>Stripe Payments Europe Ltd.</strong> (Irlande) — paiements.</li>
            <li><strong>Resend / [À COMPLÉTER selon votre fournisseur d&apos;emails]</strong> — envoi d&apos;emails transactionnels.</li>
            <li><strong>Google LLC (Google Analytics 4)</strong> — mesure d&apos;audience anonymisée, activée uniquement après consentement.</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="font-syne text-2xl font-bold text-navy">
            6. Transferts hors Union Européenne
          </h2>
          <p>
            Certains de nos sous-traitants (Vercel, Stripe, Google) peuvent traiter vos données depuis les
            États-Unis. Ces transferts sont encadrés par les <strong>Clauses Contractuelles Types</strong>{' '}
            (CCT) approuvées par la Commission européenne, ainsi que par le <strong>EU-US Data Privacy
            Framework</strong> lorsque le sous-traitant y adhère. Vos données sont chiffrées en transit et
            au repos.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="font-syne text-2xl font-bold text-navy">7. Vos droits</h2>
          <p>Conformément au RGPD, vous disposez des droits suivants :</p>
          <ul className="list-disc pl-6">
            <li><strong>Droit d&apos;accès</strong> : connaître les données que nous détenons sur vous.</li>
            <li><strong>Droit de rectification</strong> : corriger des données inexactes.</li>
            <li><strong>Droit à l&apos;effacement</strong> (« droit à l&apos;oubli ») : demander la suppression de vos données, sous réserve des obligations légales de conservation.</li>
            <li><strong>Droit à la portabilité</strong> : recevoir vos données dans un format structuré lisible par machine (CSV, JSON).</li>
            <li><strong>Droit d&apos;opposition</strong> : vous opposer à un traitement pour motif légitime.</li>
            <li><strong>Droit à la limitation</strong> : demander la suspension du traitement en cas de contestation.</li>
            <li><strong>Droit de retirer votre consentement</strong> à tout moment pour les traitements basés sur le consentement.</li>
            <li><strong>Droit de définir des directives post-mortem</strong> sur le sort de vos données après votre décès.</li>
          </ul>
          <p className="mt-4">
            Pour exercer ces droits, contactez-nous à{' '}
            <a
              href="mailto:contact.nexartis@gmail.com"
              className="text-sky underline-offset-4 hover:underline"
            >
              contact.nexartis@gmail.com
            </a>
            . Une réponse vous sera fournie dans un délai d&apos;un mois.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="font-syne text-2xl font-bold text-navy">
            8. Réclamation auprès de la CNIL
          </h2>
          <p>
            Si vous estimez, après nous avoir contactés, que vos droits ne sont pas respectés, vous pouvez
            adresser une réclamation à la Commission Nationale de l&apos;Informatique et des Libertés (CNIL) :
          </p>
          <ul className="list-disc pl-6">
            <li>Adresse : 3 place de Fontenoy, TSA 80715, 75334 Paris cedex 07</li>
            <li>Téléphone : 01 53 73 22 22</li>
            <li>
              Site web :{' '}
              <a
                href="https://www.cnil.fr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky underline-offset-4 hover:underline"
              >
                www.cnil.fr
              </a>
            </li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="font-syne text-2xl font-bold text-navy">9. Sécurité</h2>
          <p>
            Nexartis met en œuvre des mesures techniques et organisationnelles pour protéger vos données :
            chiffrement TLS en transit, chiffrement au repos, contrôles d&apos;accès stricts (Row Level Security),
            authentification avec mot de passe haché, sauvegarde régulière, journalisation des accès,
            limitation des autorisations à ce qui est strictement nécessaire.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="font-syne text-2xl font-bold text-navy">10. Cookies</h2>
          <p>
            L&apos;utilisation des cookies sur le site nexartis.fr est décrite dans notre{' '}
            <Link href="/cookies" className="text-sky underline-offset-4 hover:underline">
              politique cookies
            </Link>
            . Vous pouvez à tout moment modifier vos préférences via le lien « Gérer les cookies » présent
            en bas de page.
          </p>
        </section>

        <section>
          <h2 className="font-syne text-2xl font-bold text-navy">11. Modifications de la politique</h2>
          <p>
            Nous pouvons mettre à jour la présente politique pour refléter des changements légaux ou
            techniques. La date de la dernière mise à jour figure en haut du document. Toute modification
            substantielle vous sera notifiée par email.
          </p>
        </section>
      </div>
    </article>
  )
}
