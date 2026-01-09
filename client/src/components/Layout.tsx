import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import ChatWidget from "./ChatWidget";
import { HelmetProvider } from "react-helmet-async";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <HelmetProvider>
      <div className="min-h-screen flex flex-col bg-background font-sans antialiased">
        <Header />
        <main className="flex-1 flex flex-col">
          {children}
        </main>
        <Footer />
        <ChatWidget />
      </div>
    </HelmetProvider>
  );
}
