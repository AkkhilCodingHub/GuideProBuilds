"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowRight, Cpu, Gamepad2, Briefcase, DollarSign, Zap, CheckCircle2, Layers } from "lucide-react";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { TiltCard } from "@/components/effects/TiltCard";
import { RevealText } from "@/components/effects/RevealText";
import { Magnetic } from "@/components/effects/Magnetic";
import { ParallaxImage } from "@/components/effects/ParallaxImage";
import { Spotlight } from "@/components/effects/Spotlight";

import gamingImg from "@/attached_assets/generated_images/high-end_rgb_gaming_pc_setup.png";
import workstationImg from "@/attached_assets/generated_images/professional_minimalist_workstation.png";
import budgetImg from "@/attached_assets/generated_images/budget_pc_components_flatlay.png";

const brandsList = [
  "AMD Ryzen", "NVIDIA GeForce", "Intel Core", "ASUS ROG", "MSI Gaming",
  "Gigabyte AORUS", "Corsair", "G.Skill", "Samsung SSD", "Western Digital",
  "NZXT", "Crucial", "Noctua", "Razer", "EVGA", "Kingston"
];

const scrollContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12
    }
  }
};

const scrollItemVariants = {
  hidden: { y: 60, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: "spring" as const, stiffness: 60, damping: 20 } }
};

export default function Home() {
  const containerRef = useRef(null);
  const horizontalScrollRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const { scrollYProgress: horizontalProgress } = useScroll({
    target: horizontalScrollRef,
    offset: ["start start", "end end"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, 800]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -800]);
  
  const xTransform = useTransform(horizontalProgress, [0, 1], ["0%", "-60%"]);

  return (
    <div className="min-h-screen bg-transparent flex flex-col" ref={containerRef}>
      <Navbar />

      {}
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden flex flex-col justify-center opacity-10">
        <motion.div style={{ y: y1, WebkitTextStroke: '2px rgba(6,182,212,0.5)' }} className="font-heading font-black text-[20vw] leading-none whitespace-nowrap text-transparent">
          PERFORMANCE
        </motion.div>
        <motion.div style={{ y: y2, x: "-10vw", WebkitTextStroke: '2px rgba(16,185,129,0.5)' }} className="font-heading font-black text-[20vw] leading-none whitespace-nowrap text-transparent">
          PRECISION
        </motion.div>
      </div>
      
      {}
      <section className="sticky top-0 min-h-screen flex flex-col justify-center overflow-hidden bg-transparent pt-16">
        <div className="container mx-auto relative z-10 px-4 md:px-8 pt-12 md:pt-16 pb-12">
          <motion.div
            initial={false}
            animate={{ opacity: [0, 1] }}
            transition={{ duration: 1, delay: 0.2 }}
            className="max-w-4xl"
          >
            <Badge variant="outline" className="mb-6 border-primary/30 text-primary bg-primary/5 px-4 py-1.5 rounded-full backdrop-blur-md">
              The Ultimate PC Building Assistant
            </Badge>
            
            <div className="font-heading text-5xl sm:text-7xl lg:text-9xl font-bold tracking-tighter mb-8 leading-[1.05]">
              <RevealText 
                text="Build Your Dream PC" 
                delay={0.1} 
                splitBy="letter"
                className="bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-white/40 inline-block pb-2" 
              />
              <br />
              <RevealText 
                text="Without The Guesswork." 
                delay={0.6} 
                splitBy="letter"
                className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-cyan-300 to-primary/50 mt-2 inline-block pb-2" 
              />
            </div>

            <motion.p 
              initial={false}
              animate={{ opacity: [0, 1], y: [20, 0] }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="text-lg md:text-2xl text-muted-foreground mb-10 max-w-2xl leading-relaxed"
            >
              Get personalized hardware recommendations based on your budget, games, and workflow. 
              Stop worrying about compatibility and start building.
            </motion.p>

            <motion.div 
              initial={false}
              animate={{ opacity: [0, 1], y: [20, 0] }}
              transition={{ delay: 1, duration: 0.8 }}
              className="flex flex-col sm:flex-row items-start gap-6 mt-12"
            >
              <Magnetic intensity={0.2}>
                <Button asChild size="lg" className="h-16 px-12 text-xl font-bold shadow-[0_0_40px_-5px] shadow-primary/50 rounded-full bg-primary text-black hover:bg-white hover:shadow-white/50 transition-all duration-500">
                  <Link href="/builder">
                    Start Your Build <ArrowRight className="ml-3 h-6 w-6" />
                  </Link>
                </Button>
              </Magnetic>
              <Magnetic intensity={0.1}>
                <Button asChild variant="outline" size="lg" className="h-16 px-12 text-xl font-medium bg-transparent border-white/20 hover:bg-white/10 rounded-full transition-all duration-500 backdrop-blur-sm">
                  <Link href="/guides">View Buying Guides</Link>
                </Button>
              </Magnetic>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {}
      <section className="relative py-16 md:py-24 border-y border-white/10 overflow-hidden bg-black/90 backdrop-blur-3xl shadow-xl z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black z-10 pointer-events-none" />
        <div className="relative w-full">
          <div className="flex gap-24 animate-marquee whitespace-nowrap items-center">
            {Array.from({ length: 2 }).map((_, idx) => (
              <div key={idx} className="flex gap-24 items-center text-7xl md:text-9xl font-black tracking-tighter text-transparent" style={{ WebkitTextStroke: '2px rgba(255,255,255,0.05)' }}>
                {brandsList.map((brand, i) => (
                  <span key={i} className="flex items-center gap-8 hover:text-primary transition-colors duration-500 cursor-default" style={{ WebkitTextStroke: '0px' }}>
                    <span className="h-4 w-4 rounded-full bg-primary/40 shadow-[0_0_20px_rgba(6,182,212,0.5)]" />
                    <span className="hover:text-primary transition-colors duration-500" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.1)' }}>{brand}</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {}
      <section className="relative min-h-screen flex flex-col justify-center pt-24 pb-16 bg-black/90 backdrop-blur-xl border-t border-white/10 shadow-[0_-20px_50px_rgba(0,0,0,0.9)] z-20">
        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <div className="mb-12 md:mb-16">
            <RevealText text="Choose Your Path" className="text-4xl md:text-6xl font-heading font-bold mb-6 text-white" />
            <motion.p 
              initial={false}
              animate={{ opacity: 1 }}
              className="text-xl text-muted-foreground max-w-2xl"
            >
              Whether you're a hardcore gamer, a creative professional, or on a tight budget, 
              we have the perfect configuration for you.
            </motion.p>
          </div>

          <motion.div 
            variants={scrollContainerVariants}
            initial={false}
            animate="show"
            whileInView="show"
            viewport={{ once: true, margin: "0px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12"
          >
            {}
            <motion.div variants={scrollItemVariants} className="h-full">
              <TiltCard className="h-full">
                <Link href="/builder?preset=gaming" className="block group h-full">
                  <Card className="h-full overflow-hidden border-white/10 bg-black/40 backdrop-blur-xl hover:border-cyan-500/50 transition-all duration-500 hover:shadow-2xl neon-glow-cyan-hover rounded-2xl">
                    <div className="h-64 overflow-hidden relative group">
                       <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10" />
                       <ParallaxImage src={gamingImg.src} alt="Gaming PC" className="w-full h-full group-hover:scale-110 transition-transform duration-700 ease-out" offset={30} />
                       <div className="absolute bottom-6 left-6 z-20 flex items-center gap-3 text-white font-bold text-2xl">
                          <Gamepad2 className="h-8 w-8 text-cyan-400" /> Gaming
                       </div>
                    </div>
                    <CardContent className="pt-8 pb-8">
                      <p className="text-muted-foreground/90 mb-6 text-base leading-relaxed">
                        Optimized for high frame rates, ray tracing, and low latency. 
                        Perfect for competitive shooters and AAA titles.
                      </p>
                      <ul className="space-y-3 text-sm text-muted-foreground">
                        <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-cyan-500" /> High Refresh Rate Ready</li>
                        <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-cyan-500" /> Premium Aesthetics</li>
                      </ul>
                    </CardContent>
                  </Card>
                </Link>
              </TiltCard>
            </motion.div>

            {}
            <motion.div variants={scrollItemVariants} className="h-full">
              <TiltCard className="h-full">
                <Link href="/builder?preset=workstation" className="block group h-full">
                  <Card className="h-full overflow-hidden border-white/10 bg-black/40 backdrop-blur-xl hover:border-emerald-500/50 transition-all duration-500 hover:shadow-2xl neon-glow-emerald-hover rounded-2xl">
                    <div className="h-64 overflow-hidden relative group">
                       <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10" />
                       <ParallaxImage src={workstationImg.src} alt="Workstation PC" className="w-full h-full group-hover:scale-110 transition-transform duration-700 ease-out" offset={30} />
                       <div className="absolute bottom-6 left-6 z-20 flex items-center gap-3 text-white font-bold text-2xl">
                          <Briefcase className="h-8 w-8 text-emerald-400" /> Workstation
                       </div>
                    </div>
                    <CardContent className="pt-8 pb-8">
                      <p className="text-muted-foreground/90 mb-6 text-base leading-relaxed">
                        Built for rendering, video editing, and code compilation. 
                        Focus on multi-core performance and absolute stability.
                      </p>
                      <ul className="space-y-3 text-sm text-muted-foreground">
                        <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-emerald-500" /> High Core Count CPUs</li>
                        <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-emerald-500" /> Massive RAM Capacity</li>
                      </ul>
                    </CardContent>
                  </Card>
                </Link>
              </TiltCard>
            </motion.div>

            {}
            <motion.div variants={scrollItemVariants} className="h-full">
              <TiltCard className="h-full">
                <Link href="/builder?preset=budget" className="block group h-full">
                  <Card className="h-full overflow-hidden border-white/10 bg-black/40 backdrop-blur-xl hover:border-blue-500/50 transition-all duration-500 hover:shadow-2xl neon-glow-cyan-hover rounded-2xl">
                    <div className="h-64 overflow-hidden relative group">
                       <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10" />
                       <ParallaxImage src={budgetImg.src} alt="Budget PC" className="w-full h-full group-hover:scale-110 transition-transform duration-700 ease-out" offset={30} />
                       <div className="absolute bottom-6 left-6 z-20 flex items-center gap-3 text-white font-bold text-2xl">
                          <DollarSign className="h-8 w-8 text-blue-400" /> Budget Friendly
                       </div>
                    </div>
                    <CardContent className="pt-8 pb-8">
                      <p className="text-muted-foreground/90 mb-6 text-base leading-relaxed">
                        Maximum performance per dollar. Great for entry-level gaming 
                        and general home office use without breaking the bank.
                      </p>
                      <ul className="space-y-3 text-sm text-muted-foreground">
                        <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-blue-500" /> Best Value Components</li>
                        <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-blue-500" /> Easy Upgrade Path</li>
                      </ul>
                    </CardContent>
                  </Card>
                </Link>
              </TiltCard>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {}
      <section ref={horizontalScrollRef} className="relative h-[300vh] bg-black z-30">
        <Spotlight className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden border-t border-white/5 bg-black/95 backdrop-blur-3xl shadow-[0_-20px_50px_rgba(0,0,0,1)]" spotlightSize={600}>
          <div className="absolute left-10 md:left-20 top-24 md:top-28 z-20">
            <h2 className="text-5xl md:text-7xl font-heading font-bold text-white mb-4">Why GuidePro?</h2>
            <p className="text-xl text-muted-foreground">Keep scrolling to discover.</p>
          </div>
          
          <motion.div 
            style={{ x: xTransform }}
            className="flex gap-12 w-[160vw] px-10 md:px-32 mt-20"
          >
            {[
              { icon: Cpu, title: "Smart Compatibility", desc: "We automatically check component compatibility so you don't have to worry." },
              { icon: Zap, title: "Performance First", desc: "Recommendations prioritized by real-world benchmarks and reviews." },
              { icon: DollarSign, title: "Price Tracking", desc: "We find the best deals across major retailers to save you money." },
              { icon: Layers, title: "Detailed Guides", desc: "Step-by-step assembly instructions for every build level." },
            ].map((feature, i) => (
              <div 
                key={i} 
                className="flex-shrink-0 w-[400px] flex flex-col items-start group border border-white/10 bg-white/5 p-10 rounded-3xl hover:bg-white/10 transition-colors duration-500"
              >
                <div className="p-5 rounded-2xl bg-white/10 text-white mb-8 group-hover:bg-primary group-hover:text-black transition-colors duration-300">
                  <feature.icon className="h-10 w-10" />
                </div>
                <h3 className="font-heading font-bold text-3xl mb-4 text-white">{feature.title}</h3>
                <p className="text-lg text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </motion.div>
        </Spotlight>
      </section>

      <Footer />
    </div>
  );
}
