import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface CTASectionProps {
  title?: string;
  description?: string;
  primaryAction?: {
    label: string;
    href: string;
  };
  secondaryAction?: {
    label: string;
    href: string;
  };
  variant?: "default" | "muted";
}

export default function CTASection({
  title = "Ready to Start Your Journey?",
  description = "Schedule a consultation today to discuss your health goals with Stephen McCarthy, PA-C.",
  primaryAction = {
    label: "Book Consultation",
    href: "/book"
  },
  secondaryAction = {
    label: "View Programs",
    href: "/book"
  },
  variant = "default"
}: CTASectionProps) {
  return (
    <section className={`py-16 ${variant === "muted" ? "bg-muted/30" : "bg-primary/5"}`}>
      <div className="container text-center max-w-3xl mx-auto">
        <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4 text-foreground">
          {title}
        </h2>
        <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
          {description}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {primaryAction.href.startsWith("http") ? (
            <a href={primaryAction.href} target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="w-full sm:w-auto gap-2">
                {primaryAction.label}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </a>
          ) : (
            <a href={primaryAction.href}>
              <Button size="lg" className="w-full sm:w-auto gap-2">
                {primaryAction.label}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </a>
          )}
          {secondaryAction && (
            <a href={secondaryAction.href}>
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                {secondaryAction.label}
              </Button>
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
