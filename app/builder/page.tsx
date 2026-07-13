"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { generateBuild, Build } from "@/lib/mockData";
import { Check, ChevronRight, RotateCcw, ShoppingCart, Share2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BuildMethodSelector } from "@/components/builder/BuildMethodSelector";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

type BuildMethod = 'custom' | 'prebuilt';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

const itemVariants = {
  hidden: { y: 15, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: "spring" as const, stiffness: 100, damping: 15 } }
};

export default function Builder() {
  const router = useRouter();
  const [buildMethod, setBuildMethod] = useState<BuildMethod | null>(null);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    useCase: "gaming",
    budget: 150000,
    performance: "mid",
  });
  const [result, setResult] = useState<Build | null>(null);

  const { toast } = useToast();

  const generateMutation = useMutation({
    mutationFn: async () => {
      const usdBudget = Math.round(formData.budget / 100);
      
      const res = await apiRequest("POST", "/api/recommend", {
        budget: usdBudget,
        useCase: formData.useCase,
        performance: formData.performance
      });
      return await res.json();
    },
    onSuccess: (data) => {
      const mappedParts = data.parts.map((part: any) => ({
        id: part._id ? part._id.toString() : String(part.id),
        type: part.type,
        name: part.name,
        price: part.price * 100,
        brand: part.brand,
        specs: part.specs || {},
        description: part.description || ""
      }));

      setResult({
        id: "recommendation-" + Date.now(),
        name: data.name,
        description: data.description,
        category: data.category,
        totalPrice: data.totalPrice * 100,
        parts: mappedParts,
        reasoning: data.reasoning
      });
      nextStep();
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Recommendation Failed",
        description: error.message || "Failed to generate your build recommendation. Please try again.",
      });
    }
  });

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  const handleGenerate = () => {
    generateMutation.mutate();
  };

  const handleMethodSelect = (method: BuildMethod) => {
    if (method === 'prebuilt') {
      router.push('/builder/prebuilt');
    } else {
      setBuildMethod(method);
    }
  };

  const restart = () => {
    setStep(1);
    setBuildMethod(null);
    setResult(null);
    setFormData({
      useCase: "gaming",
      budget: 150000,
      performance: "mid",
    });
  };

  if (!buildMethod && step === 1) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 py-12 container mx-auto px-4 md:px-8">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h1 className="text-3xl font-bold mb-4">Choose Your Build Method</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Select how you'd like to build your PC. You can either create a custom build from scratch or choose from our curated pre-built options.
            </p>
          </div>
          <BuildMethodSelector onSelect={handleMethodSelect} />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-12 container mx-auto px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress Indicator */}
          <div className="mb-12">
            <div className="flex items-center justify-between relative">
              <div className="absolute left-0 top-1/2 w-full h-1 bg-secondary -z-10 rounded-full" />
              {[1, 2, 3, 4].map((s) => {
                let label = '';
                if (s === 1) label = 'Use Case';
                else if (s === 2) label = 'Budget';
                else if (s === 3) label = 'Preferences';
                else if (s === 4) label = 'Result';
                
                return (
                  <div key={s} className="flex flex-col items-center">
                    <div 
                      className={`flex items-center justify-center w-10 h-10 rounded-full border-4 transition-colors duration-300 bg-background ${
                        step >= s ? "border-primary text-primary" : "border-secondary text-muted-foreground"
                      }`}
                    >
                      {step > s ? <Check className="h-5 w-5" /> : <span className="font-bold">{s}</span>}
                    </div>
                    <span className="text-xs mt-2 font-medium text-muted-foreground hidden sm:inline">{label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Steps Container */}
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                variants={containerVariants}
                initial="hidden"
                animate="show"
                exit="hidden"
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                {[
                  { id: "gaming", title: "Gaming", desc: "Prioritize graphics power, fast refresh rates, and smooth gameplay.", icon: "🎮" },
                  { id: "workstation", title: "Workstation", desc: "Focus on multi-core performance for rendering, coding, and heavy apps.", icon: "💼" },
                  { id: "streaming", title: "Streaming", desc: "Balanced build capable of gaming and high-quality video encoding.", icon: "🎙️" },
                ].map((item) => (
                  <motion.div key={item.id} variants={itemVariants} className="h-full">
                    <Card 
                      className={`cursor-pointer border border-border/50 hover:border-cyan-500/30 transition-all duration-300 h-full hover:shadow-xl neon-glow-cyan-hover ${
                        formData.useCase === item.id ? "ring-2 ring-primary border-primary bg-primary/5" : ""
                      }`}
                      onClick={() => setFormData({ ...formData, useCase: item.id })}
                    >
                      <CardHeader className="text-center">
                        <div className="text-4xl mb-2">{item.icon}</div>
                        <CardTitle>{item.title}</CardTitle>
                        <CardDescription>{item.desc}</CardDescription>
                      </CardHeader>
                      <CardFooter className="justify-center">
                        <Button variant={formData.useCase === item.id ? "default" : "outline"} className="w-full">
                          {formData.useCase === item.id ? "Selected" : "Choose"}
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
                <div className="col-span-full flex justify-end mt-4">
                  <Button onClick={nextStep} size="lg" className="px-8">
                    Next Step <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card className="border-border/50 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-2xl">What is your budget?</CardTitle>
                    <CardDescription>We'll find the best parts that fit within your price range.</CardDescription>
                  </CardHeader>
                  <CardContent className="py-10 px-8 md:px-16">
                    <div className="mb-12 text-center">
                      <span className="text-5xl font-bold text-primary">₹{formData.budget.toLocaleString()}</span>
                    </div>
                    <Slider
                      defaultValue={[formData.budget]}
                      max={400000}
                      min={40000}
                      step={2000}
                      onValueChange={(val) => setFormData({ ...formData, budget: val[0] })}
                      className="mb-8"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>₹40,000</span>
                      <span>₹2,00,000</span>
                      <span>₹4,00,000+</span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="ghost" onClick={prevStep}>Back</Button>
                    <Button onClick={nextStep} size="lg" className="px-8">
                      Next Step <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card className="border-border/50 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-2xl">Performance Level</CardTitle>
                    <CardDescription>How much power do you need?</CardDescription>
                  </CardHeader>
                  <CardContent>
                     <RadioGroup 
                        defaultValue={formData.performance} 
                        onValueChange={(val) => setFormData({ ...formData, performance: val })}
                        className="space-y-4"
                     >
                       <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-4">
                         <motion.div variants={itemVariants}>
                           <div className="flex items-center space-x-2 border p-4 rounded-lg hover:bg-accent/5 transition-all duration-300 neon-glow-cyan-hover">
                             <RadioGroupItem value="entry" id="entry" />
                             <Label htmlFor="entry" className="flex-1 cursor-pointer ml-2">
                               <span className="block font-bold text-lg">Entry Level</span>
                               <span className="block text-muted-foreground">Great for 1080p gaming and basic tasks.</span>
                             </Label>
                           </div>
                         </motion.div>
                         <motion.div variants={itemVariants}>
                           <div className="flex items-center space-x-2 border p-4 rounded-lg hover:bg-accent/5 transition-all duration-300 border-primary/50 bg-primary/5 neon-glow-cyan-hover">
                             <RadioGroupItem value="mid" id="mid" />
                             <Label htmlFor="mid" className="flex-1 cursor-pointer ml-2">
                               <span className="block font-bold text-lg">Mid-Range (Recommended)</span>
                               <span className="block text-muted-foreground">Sweet spot for 1440p gaming and serious work.</span>
                             </Label>
                           </div>
                         </motion.div>
                         <motion.div variants={itemVariants}>
                           <div className="flex items-center space-x-2 border p-4 rounded-lg hover:bg-accent/5 transition-all duration-300 neon-glow-cyan-hover">
                             <RadioGroupItem value="high" id="high" />
                             <Label htmlFor="high" className="flex-1 cursor-pointer ml-2">
                               <span className="block font-bold text-lg">High-End / Enthusiast</span>
                               <span className="block text-muted-foreground">4K gaming, heavy rendering, no compromises.</span>
                             </Label>
                           </div>
                         </motion.div>
                       </motion.div>
                     </RadioGroup>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="ghost" onClick={prevStep} disabled={generateMutation.isPending}>Back</Button>
                    <Button 
                      onClick={handleGenerate} 
                      disabled={generateMutation.isPending}
                      size="lg" 
                      className="px-8 bg-primary hover:bg-primary/90"
                    >
                      {generateMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          Generate Build <Check className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            )}

            {step === 4 && result && (
              <motion.div 
                key="step4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-8"
              >
                <div className="text-center">
                  <Badge className="mb-2">Recommended Build</Badge>
                  <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-2">{result.name}</h2>
                  <p className="text-muted-foreground">{result.description}</p>
                  <div className="mt-4 text-2xl font-bold text-primary">₹{result.totalPrice.toLocaleString()}</div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-4">
                    <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
                      <div className="p-4 bg-secondary/30 border-b border-border/50 font-medium flex justify-between">
                        <span>Component List</span>
                        <span>Price</span>
                      </div>
                      <motion.div variants={containerVariants} initial="hidden" animate="show" className="divide-y divide-border/40">
                        {result.parts.map((part) => (
                          <motion.div key={part.id} variants={itemVariants}>
                            <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-secondary/10 transition-all duration-300">
                              <div className="flex items-start gap-4">
                                <div className="min-w-[4rem] px-2 h-12 rounded bg-secondary/30 flex items-center justify-center shrink-0">
                                  <span className="text-xs font-bold text-muted-foreground uppercase">{part.type}</span>
                                </div>
                                <div>
                                  <div className="font-bold">{part.name}</div>
                                  <div className="text-sm text-muted-foreground">{part.description}</div>
                                  <div className="flex gap-2 mt-1">
                                    {Object.entries(part.specs).map(([k, v]) => (
                                      <Badge key={k} variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
                                        {k}: {v}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <span className="font-bold font-mono self-end sm:self-center">₹{part.price.toLocaleString()}</span>
                                {part.pcppLink && (
                                  <a href={part.pcppLink} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                                    View on PC Part Picker <ChevronRight className="h-3 w-3" />
                                  </a>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <Card className="border-primary/20 bg-primary/5">
                      <CardHeader>
                        <CardTitle>Summary</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Estimated Power</span>
                          <span className="font-mono">~550W</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Compatibility</span>
                          <span className="text-green-500 flex items-center gap-1"><Check className="h-3 w-3" /> Verified</span>
                        </div>
                        <div className="pt-4 border-t border-border/50 flex justify-between items-center">
                           <span className="font-bold">Total</span>
                           <span className="text-2xl font-bold text-primary">₹{result.totalPrice.toLocaleString()}</span>
                        </div>
                      </CardContent>
                      <CardFooter className="flex-col gap-3">
                        <Button className="w-full h-12 text-lg shadow-lg shadow-primary/20">
                          <ShoppingCart className="mr-2 h-4 w-4" /> Buy All Parts
                        </Button>
                        <div className="flex gap-2 w-full">
                           <Button variant="outline" className="flex-1">
                             <Share2 className="mr-2 h-4 w-4" /> Share
                           </Button>
                           <Button variant="outline" className="flex-1" onClick={restart}>
                             <RotateCcw className="mr-2 h-4 w-4" /> Restart
                           </Button>
                        </div>
                      </CardFooter>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Build Notes & Reasoning</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-muted-foreground space-y-4">
                        {result.reasoning ? (
                          Object.entries(result.reasoning).map(([comp, reason]) => (
                            <div key={comp} className="space-y-1">
                              <span className="font-bold uppercase text-[10px] text-primary">{comp}:</span>
                              <p className="text-xs leading-relaxed">{reason}</p>
                            </div>
                          ))
                        ) : (
                          <>
                            <p>• This build is optimized for your selected budget of ₹{formData.budget.toLocaleString()}.</p>
                            <p>• The GPU selected is capable of high-performance gaming.</p>
                            <p>• Prices are estimates and may vary by retailer.</p>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      <Footer />
    </div>
  );
}
