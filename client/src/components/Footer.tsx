import { Link } from "wouter";
import { Phone, Mail, MapPin, Facebook } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-muted/30 border-t pt-12 pb-6">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="space-y-4">
            <Link href="/">
              <img 
                src="/images/logo.webp" 
                alt="Lehigh Valley Wellness" 
                className="h-20 w-auto mb-2 cursor-pointer"
              />
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Providing compassionate, evidence-based medical weight loss and hormone therapy services to the Lehigh Valley community and beyond.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <span>
                  6081 Hamilton Blvd, Suite 600<br />
                  Allentown, PA 18106
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" />
                <a href="tel:+14843571916" className="hover:text-primary">(484) 357-1916</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" />
                <a href="mailto:info@lehighvalleywellness.com" className="hover:text-primary">info@lehighvalleywellness.com</a>
              </li>
            </ul>
            <div className="mt-4 pt-3 border-t border-dashed">
              <p className="text-sm font-medium text-foreground">Hours</p>
              <p className="text-sm text-muted-foreground">Mon & Thur: 10 AM – 6 PM</p>
              <p className="text-xs text-muted-foreground mt-2">Telehealth available for PA residents.<br />Utah telehealth coming soon.</p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/privacy">
                  <span className="hover:text-primary cursor-pointer">Privacy Policy</span>
                </Link>
              </li>
              <li>
                <Link href="/terms">
                  <span className="hover:text-primary cursor-pointer">Terms of Service</span>
                </Link>
              </li>
              <li>
                <Link href="/disclaimer">
                  <span className="hover:text-primary cursor-pointer">Medical Disclaimer</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Lehigh Valley Wellness. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="https://www.facebook.com/profile.php?id=61552994302272" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
              <Facebook className="h-4 w-4" />
              <span className="sr-only">Facebook</span>
            </a>
          </div>
        </div>
        
        <div className="mt-4 text-xs text-muted-foreground text-center border-t border-dashed pt-4">
          <p className="mb-2">
            Stephen McCarthy, PA-C practices under physician supervision in accordance with Pennsylvania state law.
          </p>
          <p className="font-semibold text-destructive/80">
            IF THIS IS A MEDICAL EMERGENCY, PLEASE CALL 911 IMMEDIATELY.
          </p>
        </div>
      </div>
    </footer>
  );
}
