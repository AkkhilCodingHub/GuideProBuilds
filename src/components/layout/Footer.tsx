import { Monitor, Github, Twitter, Youtube, Disc as Discord, ArrowRight, ShieldCheck, Cpu } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-black/90 text-foreground pt-16 pb-12 overflow-hidden">
      {}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-64 bg-primary/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="container mx-auto px-4 md:px-8 relative z-10">
        {}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12 mb-12 border-b border-white/10 items-center">
          <div className="lg:col-span-6">
            <div className="flex items-center gap-3 font-heading font-black text-2xl md:text-3xl tracking-tight mb-3">
              <div className="bg-primary/20 p-2 rounded-xl border border-primary/30 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                <Monitor className="h-6 w-6 text-primary" />
              </div>
              <span>PC Guide<span className="text-primary">Pro</span></span>
            </div>
            <p className="text-muted-foreground text-base max-w-md">
              The next-generation custom PC builder & hardware intelligence platform. Powered by AI and real-time benchmark analytics.
            </p>
          </div>

          <div className="lg:col-span-6 flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="Enter your email for hardware drops & guides..."
              className="flex-1 bg-white/5 border border-white/15 rounded-full px-5 py-3.5 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
            <Button className="rounded-full px-7 py-3.5 bg-primary text-black font-semibold hover:bg-cyan-400 hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] transition-all flex items-center justify-center gap-2">
              Subscribe <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-12">
          <div className="col-span-2 md:col-span-2">
            <h4 className="font-heading text-sm font-semibold tracking-wider text-muted-foreground uppercase mb-4">
              Platform Status
            </h4>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono mb-4">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              All Systems Operational
            </div>
            <p className="text-xs text-muted-foreground/80 leading-relaxed max-w-sm">
              Live price tracking across Amazon, Newegg, and B&H. Dynamic compatibility verification engine active.
            </p>
          </div>

          <div>
            <h4 className="font-heading text-sm font-semibold tracking-wider text-muted-foreground uppercase mb-4">
              Builder Tools
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/builder" className="text-muted-foreground hover:text-primary transition-colors">Custom PC Builder</Link></li>
              <li><Link href="/parts" className="text-muted-foreground hover:text-primary transition-colors">Browse Components</Link></li>
              <li><Link href="/compare" className="text-muted-foreground hover:text-primary transition-colors">Part Comparison</Link></li>
              <li><Link href="/builder?preset=gaming" className="text-muted-foreground hover:text-primary transition-colors">Preset Builds</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-sm font-semibold tracking-wider text-muted-foreground uppercase mb-4">
              Knowledge Base
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/guides" className="text-muted-foreground hover:text-primary transition-colors">Assembly Guides</Link></li>
              <li><Link href="/support" className="text-muted-foreground hover:text-primary transition-colors">Help Center</Link></li>
              <li><Link href="/support?tab=faq" className="text-muted-foreground hover:text-primary transition-colors">Hardware FAQ</Link></li>
              <li><Link href="/support?tab=troubleshooting" className="text-muted-foreground hover:text-primary transition-colors">Troubleshooting</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-sm font-semibold tracking-wider text-muted-foreground uppercase mb-4">
              Legal & Policy
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/legal/privacy" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/legal/terms" className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link href="/legal/disclaimer" className="text-muted-foreground hover:text-primary transition-colors">Affiliate Disclaimer</Link></li>
            </ul>
          </div>
        </div>

        {}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} PC Guide Pro Inc. Built for PC Enthusiasts worldwide.</p>

          <div className="flex items-center gap-6">
            <Link href="https://github.com" target="_blank" className="hover:text-primary transition-colors">
              <Github className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </Link>
            <Link href="https://twitter.com" target="_blank" className="hover:text-primary transition-colors">
              <Twitter className="h-5 w-5" />
              <span className="sr-only">Twitter</span>
            </Link>
            <Link href="https://youtube.com" target="_blank" className="hover:text-primary transition-colors">
              <Youtube className="h-5 w-5" />
              <span className="sr-only">YouTube</span>
            </Link>
            <Link href="https://discord.com" target="_blank" className="hover:text-primary transition-colors">
              <Discord className="h-5 w-5" />
              <span className="sr-only">Discord</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
