import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { GraduationCap, MessageSquare, Mic, Trophy, Zap, Star } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Navbar */}
      <nav className="h-16 flex items-center justify-between px-6 md:px-12 border-b border-white/5 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <span className="font-bold text-xl tracking-tight text-white">English AI Coach</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/pricing" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors">Pricing</Link>
          <Link href="/sign-in" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors">Sign In</Link>
          <Link href="/sign-up">
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-full px-6">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 md:px-12 flex flex-col items-center justify-center text-center overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 max-w-4xl mx-auto space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
            <Zap className="w-4 h-4" /> Vibe checked for Vietnamese learners
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight text-white">
            Master English with a <br/>
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] animate-gradient bg-clip-text text-transparent">
              personalized AI companion
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Ditch the boring textbooks. Practice speaking, writing, and vocabulary in a gamified environment that feels like hanging out in a Discord server you love.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/sign-up">
              <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-full px-8 h-14 text-lg shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all">
                Start Learning for Free
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto w-full relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to become fluent</h2>
          <p className="text-muted-foreground text-lg">Designed specifically to solve the challenges Vietnamese learners face.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-card/40 border border-white/5 p-8 rounded-3xl backdrop-blur-sm hover:bg-card/60 transition-colors group">
            <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <MessageSquare className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">AI Conversation Partner</h3>
            <p className="text-muted-foreground leading-relaxed">
              Chat naturally about any topic. Get instant grammar corrections with Vietnamese explanations when you make mistakes.
            </p>
          </div>

          <div className="bg-card/40 border border-white/5 p-8 rounded-3xl backdrop-blur-sm hover:bg-card/60 transition-colors group">
            <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Mic className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Pronunciation Analysis</h3>
            <p className="text-muted-foreground leading-relaxed">
              Speak into your mic and get immediate feedback on your phonemes. Master the "th" and ending sounds perfectly.
            </p>
          </div>

          <div className="bg-card/40 border border-white/5 p-8 rounded-3xl backdrop-blur-sm hover:bg-card/60 transition-colors group">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Trophy className="w-6 h-6 text-orange-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Gamified Progression</h3>
            <p className="text-muted-foreground leading-relaxed">
              Maintain streaks, earn XP, unlock badges, and climb the leaderboard. Learning English is now an addictive game.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 md:px-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to transform your English?</h2>
          <p className="text-xl text-muted-foreground mb-10">Join thousands of Vietnamese learners already leveling up.</p>
          <Link href="/sign-up">
            <Button size="lg" className="bg-white text-black hover:bg-gray-200 font-bold rounded-full px-10 h-14 text-lg">
              Create Your Free Account
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
