import Hero from '@/components/Hero'
import TrustBar from '@/components/TrustBar'
import ProblemSection from '@/components/ProblemSection'
import FeaturesSection from '@/components/FeaturesSection'
import PlanningDemoSection from '@/components/PlanningDemoSection'
import PricingSection from '@/components/PricingSection'
import FaqSection from '@/components/FaqSection'
import CtaSection from '@/components/CtaSection'
import ScrollReveal from '@/components/ScrollReveal'

export default function HomePage() {
  return (
    <>
      <ScrollReveal />
      <Hero />
      <TrustBar />
      <ProblemSection />
      <FeaturesSection />
      <PlanningDemoSection />
      <PricingSection />
      <FaqSection />
      <CtaSection />
    </>
  )
}
