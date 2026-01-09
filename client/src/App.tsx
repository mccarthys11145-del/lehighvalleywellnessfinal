import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import BookNow from "./pages/BookNow";
import WeightLoss from "./pages/services/WeightLoss";
import MenopauseHRT from "./pages/services/MenopauseHRT";
import MensHealth from "./pages/services/MensHealth";
import PeptideTherapy from "./pages/services/PeptideTherapy";
import Privacy from "./pages/legal/Privacy";
import Terms from "./pages/legal/Terms";
import Disclaimer from "./pages/legal/Disclaimer";
import LeadsList from "./pages/admin/LeadsList";
import LeadDetail from "./pages/admin/LeadDetail";

import PaymentSuccess from "./pages/PaymentSuccess";

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/faq" component={FAQ} />
      <Route path="/book" component={BookNow} />
      <Route path="/programs">
        <Redirect to="/book" />
      </Route>
      <Route path="/services/weight-loss" component={WeightLoss} />
      <Route path="/services/menopause-hrt" component={MenopauseHRT} />
      <Route path="/services/mens-health" component={MensHealth} />
      <Route path="/services/peptide-therapy" component={PeptideTherapy} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="/disclaimer" component={Disclaimer} />
      

      
      {/* Payment */}
      <Route path="/payment/success" component={PaymentSuccess} />
      
      {/* Admin routes */}
      <Route path="/admin">
        <Redirect to="/admin/leads" />
      </Route>
      <Route path="/admin/leads" component={LeadsList} />
      <Route path="/admin/leads/:id" component={LeadDetail} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
