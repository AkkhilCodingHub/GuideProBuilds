import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { ArrowRight, Cpu, Gamepad2, Briefcase, DollarSign, Zap, CheckCircle2, Layers } from "lucide-react";
import { motion } from "framer-motion";

// Import generated images
import heroBg from "@assets/generated_images/futuristic_dark_blue_abstract_tech_background.png";
import gamingImg from "@assets/generated_images/high-end_rgb_gaming_pc_setup.png";
import workstationImg from "@assets/generated_images/professional_minimalist_workstation.png";
import budgetImg from "@assets/generated_images/budget_pc_components_flatlay.png";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 lg:pt-32 lg:pb-40">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={heroBg} 
            alt="Background" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/90 to-background" />
        </div>

        <div className="container mx-auto relative z-10 px-4 md:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-3xl"
          >
            <Badge variant="outline" className="mb-4 border-primary/50 text-primary bg-primary/10 px-4 py-1 rounded-full">
              The Ultimate PC Building Assistant
            </Badge>
            <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-6xl mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-blue-200">
              Build Your Dream PC <br />
              <span className="text-primary">Without The Guesswork</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Get personalized hardware recommendations based on your budget, games, and workflow. 
              Stop worrying about compatibility and start building.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="h-12 px-8 text-base shadow-lg shadow-primary/20">
                <Link href="/builder">
                  Start Your Build <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base bg-background/50 backdrop-blur-sm hover:bg-background/80">
                <Link href="/guides">View Buying Guides</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-secondary/20">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-heading font-bold mb-4">Choose Your Path</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Whether you're a hardcore gamer, a creative professional, or on a tight budget, 
              we have the perfect configuration for you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {/* Gaming Card */}
            <Link href="/builder?preset=gaming" className="block group h-full">
                <Card className="h-full overflow-hidden border-border/50 bg-card/50 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10">
                  <div className="h-48 overflow-hidden relative">
                     <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10" />
                     <img src={gamingImg} alt="Gaming PC" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                     <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 text-white font-bold text-lg">
                        <Gamepad2 className="h-5 w-5 text-primary" /> Gaming
                     </div>
                  </div>
                  <CardContent className="pt-6">
                    <p className="text-muted-foreground mb-4">
                      Optimized for high frame rates, ray tracing, and low latency. 
                      Perfect for competitive shooters and AAA titles.
                    </p>
                    <ul className="space-y-2 text-sm text-muted-foreground/80">
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> High Refresh Rate Ready</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> RGB Aesthetics</li>
                    </ul>
                  </CardContent>
                </Card>
            </Link>

            {/* Workstation Card */}
            <Link href="/builder?preset=workstation" className="block group h-full">
                <Card className="h-full overflow-hidden border-border/50 bg-card/50 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10">
                  <div className="h-48 overflow-hidden relative">
                     <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10" />
                     <img src={workstationImg} alt="Workstation PC" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                     <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 text-white font-bold text-lg">
                        <Briefcase className="h-5 w-5 text-primary" /> Workstation
                     </div>
                  </div>
                  <CardContent className="pt-6">
                    <p className="text-muted-foreground mb-4">
                      Built for rendering, video editing, and code compilation. 
                      Focus on multi-core performance and stability.
                    </p>
                    <ul className="space-y-2 text-sm text-muted-foreground/80">
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> High Core Count CPUs</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Large RAM Capacity</li>
                    </ul>
                  </CardContent>
                </Card>
            </Link>

            {/* Budget Card */}
            <Link href="/builder?preset=budget" className="block group h-full">
                <Card className="h-full overflow-hidden border-border/50 bg-card/50 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10">
                  <div className="h-48 overflow-hidden relative">
                     <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10" />
                     <img src={budgetImg} alt="Budget PC" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                     <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 text-white font-bold text-lg">
                        <DollarSign className="h-5 w-5 text-primary" /> Budget Friendly
                     </div>
                  </div>
                  <CardContent className="pt-6">
                    <p className="text-muted-foreground mb-4">
                      Maximum performance per dollar. Great for entry-level gaming 
                      and general home office use without breaking the bank.
                    </p>
                    <ul className="space-y-2 text-sm text-muted-foreground/80">
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Best Value Components</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Upgrade Path Included</li>
                    </ul>
                  </CardContent>
                </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Cpu, title: "Smart Compatibility", desc: "We automatically check component compatibility so you don't have to worry." },
              { icon: Zap, title: "Performance First", desc: "Recommendations prioritized by real-world benchmarks and reviews." },
              { icon: DollarSign, title: "Price Tracking", desc: "We find the best deals across major retailers to save you money." }, // Mock feature
              { icon: Layers, title: "Detailed Guides", desc: "Step-by-step assembly instructions for every build level." },
            ].map((feature, i) => (
              <div key={i} className="flex flex-col items-start p-6 rounded-2xl bg-card/30 border border-border/50">
                <div className="p-3 rounded-lg bg-primary/10 text-primary mb-4">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="font-heading font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
