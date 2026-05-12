import { Link, useLocation } from "wouter";
import { UserButton } from "@clerk/react";
import { 
  Home, MessageSquare, BookOpen, GraduationCap, 
  Mic, Trophy, Medal 
} from "lucide-react";
import { ReactNode } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/lessons", label: "Lessons", icon: GraduationCap },
  { href: "/chat", label: "AI Chat", icon: MessageSquare },
  { href: "/speaking", label: "Speaking", icon: Mic },
  { href: "/vocabulary", label: "Vocabulary", icon: BookOpen },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/badges", label: "Badges", icon: Medal },
];

export default function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="font-bold text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">English AI Coach</span>
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href || location.startsWith(`${item.href}/`);
            return (
              <Link key={item.href} href={item.href}>
                <span 
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                  data-testid={`nav-${item.label.toLowerCase()}`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-border flex items-center gap-3">
          <UserButton afterSignOutUrl="/" />
          <span className="text-sm font-medium">My Account</span>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-background/50">
        {children}
      </main>
    </div>
  );
}
