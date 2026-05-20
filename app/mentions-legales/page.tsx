import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Mentions légales — Nexartis',
  description:
    'Mentions légales du site nexartis.fr : éditeur, hébergeur, propriété intellectuelle.',
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: '/mentions-legales',
  },
}

export default function MentionsLegalesPage() {
  return (
    <article className="mx-auto max-w-3xl px-5 py-16 sm:py-20">
      <header className="mb-10">
        <p className="font-manrope text-sm font-semibold uppercase tracking-wider text-orange">
          Informations légales
        </p>
        <h1 className="mt-2 font-syne text-4xl font-bold tracking-tight text-navy sm:text-5xl">
          Mentions légales
        </h1>
        <p className="mt-3 text-sm text-navy/60">
          Dernière mise à jour : 20 mai 2026
        </p>
      </header>

      <div className="prose prose-slate max-w-none font-manrope text-[15px] leading-relaxed text-navy">
        <section className="mb-10">
          <h2 className="font-syne text-2xl font-bold text-navy">1. Éditeur du site</h2>
          <p>
            Le site <strong>nexartis.fr</strong> est édité par :
          </p>
          <ul className="list-disc pl-6">
            <li>
              <strong>Raison sociale</strong> : [À COMPLÉTER — ex : Nexartis SAS / Jérémy Schmitt EI]
            </li>
            <li>
              <strong>Forme juridique</strong> : [À COMPLÉTER — ex : Entreprise Individuelle / SAS / SARL]
            </li>
            <li>
              <strong>Capital social</strong> : [À COMPLÉTER si société, sinon supprimer]
            </li>
            <li>
              <strong>Siège social</strong> : [Adresse complète à compléter — ex : 12 rue de la Liberté, 33000 Bordeaux, France]
            </li>
            <li>
              <strong>SIRET</strong> : [À COMPLÉTER]
            </li>
            <li>
              <strong>RCS</strong> : [À COMPLÉTER — ex : RCS Bordeaux 123 456 789]
            </li>
            <li>
              <strong>Numéro de TVA intracommunautaire</strong> : [À COMPLÉTER si applicable]
            </li>
            <li>
              <strong>Téléphone</strong> : [À COMPLÉTER]
            </li>
            <li>
              <strong>Email</strong> :{' '}
              <a
                href="mailto:contact.nexartis@gmail.com"
                className="text-sky underline-offset-4 hover:underline"
              >
                contact.nexartis@gmail.com
              </a>
            </li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="font-syne text-2xl font-bold text-navy">
            2. Directeur de la publication
          </h2>
          <p>
            Le directeur de la publication est : <strong>[Nom et prénom à compléter]</strong>, en qualité de [À COMPLÉTER — ex : gérant / représentant légal / dirigeant].
          </p>
        </section>

        <section className="mb-10">
          <h2 className="font-syne text-2xl font-bold text-navy">3. Hébergement</h2>
          <p>Le site est hébergé par :</p>
          <ul className="list-disc pl-6">
            <li>
              <strong>Hébergeur principal</strong> : Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis.{' '}
              <a
                href="https://vercel.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky underline-offset-4 hover:underline"
              >
                vercel.com
              </a>
            </li>
            <li>
              <strong>Base de données et stockage</strong> : Supabase (PostgreSQL), Supabase Inc.,
              970 Toa Payoh North #07-04, Singapour. Données hébergées en France (région UE).{' '}
              <a
                href="https://supabase.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky underline-offset-4 hover:underline"
              >
                supabase.com
              </a>
            </li>
            <li>
              <strong>Paiements</strong> : Stripe Payments Europe Ltd., 1 Grand Canal Street Lower, Grand Canal Dock, Dublin, Irlande.{' '}
              <a
                href="https://stripe.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky underline-offset-4 hover:underline"
              >
                stripe.com
              </a>
            </li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="font-syne text-2xl font-bold text-navy">
            4. Propriété intellectuelle
          </h2>
          <p>
            L&apos;ensemble des contenus présents sur le site nexartis.fr (textes, images, logo, code source, design,
            charte graphique, fonctionnalités logicielles) sont la propriété exclusive de
            l&apos;éditeur ou ont fait l&apos;objet d&apos;une autorisation d&apos;utilisation. Toute reproduction, représentation,
            modification, publication, adaptation totale ou partielle des éléments du site, quel que soit le moyen
            ou le procédé utilisé, est interdite sans autorisation écrite préalable de l&apos;éditeur, sous peine
            de constituer une contrefaçon sanctionnée par les articles L.335-2 et suivants du Code de la propriété intellectuelle.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="font-syne text-2xl font-bold text-navy">5. Marques et logos</h2>
          <p>
            La marque « Nexartis » ainsi que le logo associé sont [À COMPLÉTER : marques déposées à l&apos;INPI sous le numéro XXX / marques en cours d&apos;enregistrement / noms commerciaux protégés].
            Toute utilisation non autorisée est passible de poursuites.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="font-syne text-2xl font-bold text-navy">6. Liens hypertextes</h2>
          <p>
            Les liens hypertextes mis en place dans le cadre du présent site internet en direction d&apos;autres
            ressources présentes sur le réseau Internet ne sauraient engager la responsabilité de l&apos;éditeur.
            Les utilisateurs et visiteurs du site internet ne peuvent mettre en place un hyperlien en direction
            de ce site sans l&apos;autorisation expresse et préalable de l&apos;éditeur.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="font-syne text-2xl font-bold text-navy">7. Données personnelles</h2>
          <p>
            Les traitements de données personnelles effectués via le site nexartis.fr sont décrits dans notre{' '}
            <Link href="/rgpd" className="text-sky underline-offset-4 hover:underline">
              politique de confidentialité
            </Link>
            . Pour exercer vos droits ou poser une question sur le traitement de vos données, contactez-nous à{' '}
            <a
              href="mailto:contact.nexartis@gmail.com"
              className="text-sky underline-offset-4 hover:underline"
            >
              contact.nexartis@gmail.com
            </a>
            .
          </p>
        </section>

        <section className="mb-10">
          <h2 className="font-syne text-2xl font-bold text-navy">8. Cookies</h2>
          <p>
            Le site utilise des cookies à des fins de mesure d&apos;audience et de fonctionnement. Le détail de leur
            utilisation et les modalités de retrait du consentement sont décrits dans notre{' '}
            <Link href="/cookies" className="text-sky underline-offset-4 hover:underline">
              politique cookies
            </Link>
            .
          </p>
        </section>

        <section className="mb-10">
          <h2 className="font-syne text-2xl font-bold text-navy">9. Droit applicable</h2>
          <p>
            Le présent site et les présentes mentions légales sont soumis au droit français. Tout litige
            relatif à leur application sera de la compétence exclusive des tribunaux français.
          </p>
        </section>

        <section>
          <h2 className="font-syne text-2xl font-bold text-navy">10. Contact</h2>
          <p>
            Pour toute question ou demande relative au site nexartis.fr, vous pouvez nous contacter par email à{' '}
            <a
              href="mailto:contact.nexartis@gmail.com"
              className="text-sky underline-offset-4 hover:underline"
            >
              contact.nexartis@gmail.com
            </a>
            .
          </p>
        </section>
      </div>
    </article>
  )
}
