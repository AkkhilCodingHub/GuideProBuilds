import { Monitor, Github, Twitter } from "lucide-react";
import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="border-t bg-background py-12 md:py-16">
      <div className="container px-4 md:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 font-heading font-bold text-xl">
              <div className="bg-primary/20 p-1.5 rounded-md">
                <Monitor className="h-5 w-5 text-primary" />
              </div>
              <span>PC Guide<span className="text-primary">Pro</span></span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              Your ultimate resource for building the perfect PC. Expert configurations, detailed guides, and powerful tools.
            </p>
          </div>
          
          <div>
            <h3 className="font-heading font-semibold mb-4">Tools</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/builder" className="hover:text-primary transition-colors">PC Builder</Link></li>
              <li><Link href="/compare" className="hover:text-primary transition-colors">Part Comparison</Link></li>
              <li><Link href="/guides" className="hover:text-primary transition-colors">Browse Builds</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-heading font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/guides" className="hover:text-primary transition-colors">Buying Guides</Link></li>
              <li><Link href="/support" className="hover:text-primary transition-colors">Help & Support</Link></li>
              <li><Link href="/support?tab=troubleshooting" className="hover:text-primary transition-colors">Troubleshooting</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-heading font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Affiliate Disclaimer</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 border-t pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© 2025 PC Guide Pro. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Github className="h-5 w-5 hover:text-foreground cursor-pointer transition-colors" />
            <Twitter className="h-5 w-5 hover:text-foreground cursor-pointer transition-colors" />
          </div>
        </div>
      </div>
    </footer>
  );
}
