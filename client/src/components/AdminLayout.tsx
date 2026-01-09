import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  LayoutDashboard, 
  LogOut, 
  Menu, 
  X,
  ChevronRight,
  Shield
} from "lucide-react";
import { useState } from "react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Check if user has admin or staff role
  const hasAccess = user?.role === "admin" || user?.role === "staff";
  const isAdmin = user?.role === "admin";

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="bg-card p-8 rounded-2xl border shadow-sm max-w-md w-full mx-4 text-center space-y-6">
          <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold mb-2">Admin Access Required</h1>
            <p className="text-muted-foreground">
              Please sign in to access the CRM dashboard.
            </p>
          </div>
          <Button asChild className="w-full" size="lg">
            <a href={getLoginUrl()}>Sign In</a>
          </Button>
          <Link href="/">
            <span className="text-sm text-muted-foreground hover:text-primary cursor-pointer">
              ← Back to Website
            </span>
          </Link>
        </div>
      </div>
    );
  }

  // Show access denied if user doesn't have staff/admin role
  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="bg-card p-8 rounded-2xl border shadow-sm max-w-md w-full mx-4 text-center space-y-6">
          <div className="bg-destructive/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
            <Shield className="h-8 w-8 text-destructive" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold mb-2">Access Denied</h1>
            <p className="text-muted-foreground">
              You don't have permission to access this area. Please contact an administrator if you believe this is an error.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Button variant="outline" onClick={() => logout()} className="w-full">
              Sign Out
            </Button>
            <Link href="/">
              <span className="text-sm text-muted-foreground hover:text-primary cursor-pointer">
                ← Back to Website
              </span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const navItems = [
    { href: "/admin/leads", label: "Leads", icon: Users },
  ];

  const isActive = (href: string) => location.startsWith(href);

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-card border-b z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <span className="font-heading font-bold">LVW Admin</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground hidden sm:inline">
            {user.name || user.email}
          </span>
          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full capitalize">
            {user.role}
          </span>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-card border-r z-40 transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b">
            <Link href="/admin/leads">
              <span className="font-heading font-bold text-lg cursor-pointer">
                LVW Admin
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <div
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors cursor-pointer ${
                    isActive(item.href)
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                  {isActive(item.href) && (
                    <ChevronRight className="h-4 w-4 ml-auto" />
                  )}
                </div>
              </Link>
            ))}
          </nav>

          {/* User section */}
          <div className="p-4 border-t">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-semibold">
                  {(user.name || user.email || "U")[0].toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate text-sm">
                  {user.name || "User"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full capitalize">
                {user.role}
              </span>
            </div>
            <div className="flex gap-2">
              <Link href="/" className="flex-1">
                <Button variant="outline" size="sm" className="w-full">
                  View Site
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => logout()}
                className="text-muted-foreground"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
