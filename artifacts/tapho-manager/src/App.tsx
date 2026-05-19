import { Switch, Route, Router as WouterRouter, Link, useRoute } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import SalePage from "@/pages/SalePage";
import RevenuePage from "@/pages/RevenuePage";

const queryClient = new QueryClient();

function NavTab({ href, label }: { href: string; label: string }) {
  const [active] = useRoute(href === "/" ? "/" : href);
  return (
    <Link
      href={href}
      className={`px-5 py-1.5 rounded-full text-sm font-medium transition-colors ${
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground hover:bg-secondary"
      }`}
    >
      {label}
    </Link>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-20 border-b border-border shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-serif font-bold text-primary flex items-center gap-2 shrink-0">
            <span className="bg-primary text-primary-foreground w-8 h-8 rounded-lg flex items-center justify-center text-lg">T</span>
            Tạp Hóa Manager
          </h1>
          <nav className="flex items-center gap-1 bg-secondary/50 rounded-full p-1">
            <NavTab href="/" label="Hàng hóa" />
            <NavTab href="/ban-hang" label="Bán hàng" />
            <NavTab href="/doanh-thu" label="Doanh thu" />
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/ban-hang" component={SalePage} />
        <Route path="/doanh-thu" component={RevenuePage} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
