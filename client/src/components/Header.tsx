import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X, Phone } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Weight Loss", href: "/services/weight-loss" },
  { label: "Menopause HRT", href: "/services/menopause-hrt" },
  { label: "Men's Health", href: "/services/mens-health" },
  { label: "Peptides", href: "/services/peptide-therapy" },
  { label: "About", href: "/about" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

export default function Header() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const NavLink = ({ href, label, mobile = false }: { href: string; label: string; mobile?: boolean }) => {
    const isActive = location === href;
    return (
      <Link href={href}>
        <span
          className={`cursor-pointer transition-colors hover:text-primary ${
            isActive ? "text-primary font-semibold" : "text-foreground/80"
          } ${mobile ? "text-lg py-2 block" : "text-sm"}`}
          onClick={() => mobile && setIsOpen(false)}
        >
          {label}
        </span>
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 items-center justify-between">
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer">
            <img 
              src="/images/logo.webp" 
              alt="Lehigh Valley Wellness" 
              className="h-16 w-auto"
            />
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <a href="tel:+14843571916">
            <Button variant="outline" size="sm" className="gap-2">
              <Phone className="h-4 w-4" />
              (484) 357-1916
            </Button>
          </a>
          <Link href="/book">
            <Button size="sm">Book Now</Button>
          </Link>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <SheetDescription className="sr-only">Main navigation links for Lehigh Valley Wellness</SheetDescription>
              <div className="flex flex-col gap-6 mt-6">
                <nav className="flex flex-col gap-4">
                  {navItems.map((item) => (
                    <NavLink key={item.href} {...item} mobile />
                  ))}
                </nav>
                <div className="flex flex-col gap-3 mt-4">
                  <a href="tel:+14843571916" className="w-full">
                    <Button variant="outline" className="w-full gap-2">
                      <Phone className="h-4 w-4" />
                      (484) 357-1916
                    </Button>
                  </a>
                  <Link href="/book" className="w-full">
                    <Button className="w-full">Book Now</Button>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
