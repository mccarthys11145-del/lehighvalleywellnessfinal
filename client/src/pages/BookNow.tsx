import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import CTASection from "@/components/CTASection";
import { Button } from "@/components/ui/button";
import { BookingModal } from "@/components/BookingModal";
import { Check, AlertCircle, Clock, CreditCard, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { 
  weightLossPrograms, 
  weightLossBaseFeatures,
  womensHormoneProgram, 
  mensHealthPrograms, 
  peptideProgram,
  bookingPolicy,
  insuranceNote, 
  globalDisclosures 
} from "@/config/pricing";

export default function BookNow() {
  const [selectedProgram, setSelectedProgram] = useState<{ id: string; name: string; price: number; interval: "month" | "one_time" } | null>(null);

  const openBookingModal = (id: string, name: string, priceStr: string, period: string) => {
    // Parse price from string like "$149" to number 149
    const price = parseInt(priceStr.replace(/[^0-9]/g, ''), 10);
    const interval: "month" | "one_time" = period.includes('month') ? 'month' : 'one_time';
    setSelectedProgram({ id, name, price, interval });
  };

  return (
    <Layout>
      <SEO 
        title="Book Now" 
        description="Transparent membership pricing for medical weight loss, hormone therapy, men's health, and peptide therapy. Direct-pay model for personalized care."
      />
      
      <div className="bg-primary/5 py-12 md:py-20">
        <div className="container text-center">
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-6">Book Now</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-4">
            Invest in your health with clear, predictable pricing. No hidden fees, just comprehensive medical care.
          </p>
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full">
            <CreditCard className="h-4 w-4" />
            <span className="text-sm font-medium">$50 booking deposit required • Applied to your first visit</span>
          </div>
        </div>
      </div>

      {/* Medical Weight Loss Section */}
      <section className="py-16 md:py-24 border-b">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="font-heading text-3xl font-bold mb-4">Medical Weight Loss Memberships</h2>
            <p className="text-lg font-medium text-primary mb-2">Clinician-led weight loss designed for real, sustainable results.</p>
            <p className="text-muted-foreground">
              Evidence-based plans, personalized medication options, and structured follow-up—without the "one-size-fits-all" approach.
            </p>
          </div>

          {/* Who it's for */}
          <div className="bg-muted/30 p-6 rounded-xl mb-8 max-w-3xl mx-auto">
            <h3 className="font-bold mb-3">Who it's for</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                People who have struggled to lose weight despite diet/exercise
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                Individuals who want a medically supervised approach (with labs and ongoing monitoring)
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                Patients seeking significant weight loss with a structured, accountable plan
              </li>
            </ul>
          </div>

          {/* Base features */}
          <div className="bg-card border p-6 rounded-xl mb-12 max-w-3xl mx-auto">
            <h3 className="font-bold mb-3">What's included in every tier</h3>
            <ul className="grid sm:grid-cols-2 gap-3 text-sm text-muted-foreground">
              {weightLossBaseFeatures.map((feature, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Pricing tiers */}
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-8">
            {weightLossPrograms.map((program) => (
              <div 
                key={program.id} 
                className={`relative flex flex-col rounded-2xl border bg-card p-6 shadow-sm transition-all hover:shadow-md ${
                  program.highlight ? "border-primary ring-1 ring-primary shadow-lg" : ""
                }`}
              >
                {program.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                
                <div className="mb-4">
                  <h3 className="font-heading text-lg font-bold mb-1">{program.title}</h3>
                  <p className="text-xs text-muted-foreground">Best for: {program.bestFor}</p>
                </div>
                
                <div className="mb-4">
                  <span className="text-3xl font-bold">{program.price}</span>
                  <span className="text-muted-foreground ml-1 text-sm">{program.period}</span>
                </div>
                
                <ul className="space-y-2 mb-6 flex-1 text-sm">
                  {program.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  onClick={() => openBookingModal(program.id, program.title, program.price, program.period)}
                  className="w-full" 
                  variant={program.highlight ? "default" : "outline"}
                >
                  Book Now
                </Button>
              </div>
            ))}
          </div>

          {/* Important notes */}
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-4 rounded-lg max-w-3xl mx-auto">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-800 dark:text-amber-200 mb-1">Important notes</p>
                <ul className="text-amber-700 dark:text-amber-300 space-y-1">
                  <li>• Medication costs are not included and vary by prescription, pharmacy, and insurance coverage.</li>
                  <li>• Lab work is not included and is billed separately by the lab.</li>
                  <li>• Individual results vary; no outcomes are guaranteed.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Women's Hormone Balance Section */}
      <section className="py-16 md:py-24 border-b bg-muted/20">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="font-heading text-3xl font-bold mb-4">Women's Hormone Balance & Menopause Support</h2>
            <p className="text-lg font-medium text-primary mb-2">{womensHormoneProgram.headline}</p>
            <p className="text-muted-foreground">{womensHormoneProgram.subhead}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-8">
            {/* Concerns */}
            <div className="bg-card border p-6 rounded-xl">
              <h3 className="font-bold mb-4">Common concerns we address</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {womensHormoneProgram.concerns.map((concern, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    {concern}
                  </li>
                ))}
              </ul>
            </div>

            {/* What's included */}
            <div className="bg-card border p-6 rounded-xl">
              <h3 className="font-bold mb-4">What's included</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {womensHormoneProgram.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Pricing card */}
          <div className="max-w-md mx-auto">
            <div className="bg-card border-2 border-primary p-8 rounded-2xl text-center shadow-lg">
              <h3 className="font-heading text-xl font-bold mb-2">{womensHormoneProgram.title}</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold">{womensHormoneProgram.price}</span>
                <span className="text-muted-foreground ml-2">{womensHormoneProgram.period}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                Membership covers clinical time, care planning, and follow-ups.<br />
                Labs and medications are billed separately.
              </p>
              <Button 
                onClick={() => openBookingModal(womensHormoneProgram.id, womensHormoneProgram.title, womensHormoneProgram.price, womensHormoneProgram.period)}
                size="lg" 
                className="w-full"
              >
                Book Now
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Men's Health Section */}
      <section className="py-16 md:py-24 border-b">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="font-heading text-3xl font-bold mb-4">Men's Health</h2>
            <p className="text-lg font-medium text-primary mb-2">Discreet, effective solutions for ED and hair loss.</p>
            <p className="text-muted-foreground">
              Telehealth-friendly consultations, FDA-approved options, and ongoing support—without the awkward waiting room.
            </p>
          </div>

          {/* Pricing cards */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
            {mensHealthPrograms.map((program) => (
              <div 
                key={program.id} 
                className={`flex flex-col rounded-2xl border bg-card p-6 shadow-sm transition-all hover:shadow-md ${
                  program.highlight ? "border-primary ring-1 ring-primary shadow-lg" : ""
                }`}
              >
                {program.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                    Best Value
                  </div>
                )}
                
                <div className="mb-4">
                  <h3 className="font-heading text-lg font-bold mb-1">{program.title}</h3>
                </div>
                
                <div className="mb-4">
                  <span className="text-3xl font-bold">{program.price}</span>
                  <span className="text-muted-foreground ml-1 text-sm">{program.period}</span>
                </div>
                
                <ul className="space-y-2 mb-6 flex-1 text-sm">
                  {program.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  onClick={() => openBookingModal(program.id, program.title, program.price, program.period)}
                  className="w-full" 
                  variant={program.highlight ? "default" : "outline"}
                >
                  Book Now
                </Button>
              </div>
            ))}
          </div>

          {/* Important notes */}
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-4 rounded-lg max-w-3xl mx-auto">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-800 dark:text-amber-200 mb-1">Important notes</p>
                <ul className="text-amber-700 dark:text-amber-300 space-y-1">
                  <li>• Medication costs are not included and vary by prescription and pharmacy.</li>
                  <li>• Not all patients are candidates; medical evaluation required.</li>
                  <li>• Individual results vary; no outcomes are guaranteed.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Peptide Therapy Section */}
      <section className="py-16 md:py-24 border-b bg-muted/20">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="font-heading text-3xl font-bold mb-4">Peptide Therapy</h2>
            <p className="text-lg font-medium text-primary mb-2">{peptideProgram.headline}</p>
            <p className="text-muted-foreground">{peptideProgram.subhead}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-8">
            {/* Who it's for */}
            <div className="bg-card border p-6 rounded-xl">
              <h3 className="font-bold mb-4">Who it's for</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {peptideProgram.whoFor.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* What's included */}
            <div className="bg-card border p-6 rounded-xl">
              <h3 className="font-bold mb-4">What's included</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {peptideProgram.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Pricing card */}
          <div className="max-w-md mx-auto mb-8">
            <div className="bg-card border-2 border-primary p-8 rounded-2xl text-center shadow-lg">
              <h3 className="font-heading text-xl font-bold mb-2">{peptideProgram.title}</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold">{peptideProgram.price}</span>
                <span className="text-muted-foreground ml-2">{peptideProgram.period}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                {peptideProgram.note}
              </p>
              <Button 
                onClick={() => openBookingModal(peptideProgram.id, peptideProgram.title, peptideProgram.price, peptideProgram.period)}
                size="lg" 
                className="w-full"
              >
                Book Now
              </Button>
            </div>
          </div>

          {/* Important notes */}
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-4 rounded-lg max-w-3xl mx-auto">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-800 dark:text-amber-200 mb-1">Important notes</p>
                <ul className="text-amber-700 dark:text-amber-300 space-y-1">
                  <li>• Not all patients are candidates.</li>
                  <li>• Some therapies may be prescribed off-label; your clinician will review risks/benefits/alternatives during consultation.</li>
                  <li>• Individual results vary; no outcomes are guaranteed.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Policy Section */}
      <section className="py-16 md:py-24 border-b">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
                <CreditCard className="h-4 w-4" />
                <span className="text-sm font-medium">Booking Policy</span>
              </div>
              <h2 className="font-heading text-3xl font-bold mb-4">{bookingPolicy.title}</h2>
              <p className="text-muted-foreground">{bookingPolicy.intro}</p>
            </div>

            <div className="space-y-6">
              {bookingPolicy.sections.map((section, i) => (
                <div key={i} className="bg-card border p-6 rounded-xl">
                  <h3 className="font-bold mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    {section.title}
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {section.items.map((item, j) => (
                      <li key={j}>• {item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-8 bg-muted/30 p-6 rounded-xl text-center">
              <p className="text-sm text-muted-foreground">
                <strong>Why we do this:</strong> {bookingPolicy.why}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Insurance & Disclosures */}
      <section className="py-12">
        <div className="container">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="bg-muted/30 p-8 rounded-xl border text-center">
              <h3 className="font-bold mb-4">A Note on Insurance</h3>
              <p className="text-muted-foreground leading-relaxed">
                {insuranceNote}
              </p>
            </div>

            {/* Secure payments badge */}
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="h-4 w-4" />
              <span>Secure payments powered by Stripe</span>
            </div>

            <div className="text-sm text-muted-foreground space-y-2 text-center border-t pt-8">
              {globalDisclosures.map((disclosure, i) => (
                <p key={i}>{disclosure}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <CTASection 
        title="Not sure which program is right for you?"
        description="Contact us and we'll help you determine the best path forward for your health goals."
        primaryAction={{ label: "Contact Us", href: "/contact" }}
      />

      {/* Booking Modal */}
      {selectedProgram && (
        <BookingModal
          isOpen={!!selectedProgram}
          onClose={() => setSelectedProgram(null)}
          productId={selectedProgram.id}
          productName={selectedProgram.name}
          price={selectedProgram.price}
          interval={selectedProgram.interval}
        />
      )}
    </Layout>
  );
}
