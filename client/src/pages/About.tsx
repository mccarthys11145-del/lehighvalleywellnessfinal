import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import CTASection from "@/components/CTASection";
import { CheckCircle2 } from "lucide-react";

export default function About() {
  return (
    <Layout>
      <SEO 
        title="About Stephen McCarthy, PA-C" 
        description="Meet Stephen McCarthy, PA-C, founder of Lehigh Valley Wellness. Dedicated to evidence-based medical weight loss and hormone therapy in Pennsylvania."
      />
      
      <div className="bg-muted/30 py-12 md:py-20">
        <div className="container">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-center mb-6">About Lehigh Valley Wellness</h1>
          <p className="text-xl text-muted-foreground text-center max-w-2xl mx-auto">
            A practice built on the belief that healthcare should be personalized, compassionate, and rooted in science.
          </p>
        </div>
      </div>

      <section className="py-16 md:py-24">
        <div className="container">
          <div className="flex flex-col md:flex-row gap-12 items-start">
            <div className="w-full md:w-1/3 sticky top-24">
              <div className="rounded-2xl overflow-hidden shadow-lg aspect-[3/4] bg-muted">
                {/* Provider Headshot */}
                <img 
                  src="/images/stephen-mccarthy.jpg" 
                  alt="Stephen McCarthy, PA-C" 
                  className="w-full h-full object-cover object-top"
                />
              </div>
            </div>
            
            <div className="w-full md:w-2/3 space-y-8">
              <div>
                <h2 className="font-heading text-3xl font-bold mb-4">Stephen McCarthy, PA-C</h2>
                <p className="text-lg text-primary font-medium mb-4">Founder & Lead Provider</p>
                <div className="prose prose-lg text-muted-foreground">
                  <p>
                    Stephen McCarthy is a Physician Assistant focused on evidence-based care for significant weight loss, metabolic health, and women’s perimenopause/menopause support. He takes a practical, outcomes-focused approach that combines clinical evaluation, lifestyle strategy, and thoughtful medication management where appropriate.
                  </p>
                  <p>
                    Lehigh Valley Wellness was built for people who are tired of one-size-fits-all care—especially patients dealing with weight gain, fatigue, sleep disruption, mood changes, and the complex body changes that often occur in midlife. Stephen’s goal is to deliver clear plans, transparent pricing, and follow-up that actually fits real life.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-heading text-2xl font-bold mb-4">Our Philosophy</h3>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="bg-card p-6 rounded-xl border">
                    <h4 className="font-bold mb-2 flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      Individualized Plans
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Evidence-based, individualized treatment plans tailored to your unique biology and goals.
                    </p>
                  </div>
                  <div className="bg-card p-6 rounded-xl border">
                    <h4 className="font-bold mb-2 flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      Shared Decision-Making
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Clear education and partnership in your care. We work with you, not just on you.
                    </p>
                  </div>
                  <div className="bg-card p-6 rounded-xl border">
                    <h4 className="font-bold mb-2 flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      Sustainable Change
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Focus on long-term results and lifestyle integration—not quick fixes or temporary trends.
                    </p>
                  </div>
                  <div className="bg-card p-6 rounded-xl border">
                    <h4 className="font-bold mb-2 flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      Judgment-Free
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Respectful, compassionate care that honors your journey and lived experience.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-heading text-2xl font-bold mb-4">Credentials & Affiliations</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Certified Physician Assistant (NCCPA)</li>
                  <li>Licensed in Pennsylvania & Utah</li>
                  <li>Member, Obesity Medicine Association</li>
                  <li>Member, North American Menopause Society (NAMS)</li>
                </ul>
                <p className="text-sm text-muted-foreground mt-4 italic">
                  Stephen McCarthy, PA-C practices under physician supervision in accordance with Pennsylvania state law.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CTASection />
    </Layout>
  );
}
