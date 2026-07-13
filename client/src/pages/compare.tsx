import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PREBUILT_BUILDS, Build } from "@/lib/mockData";
import { Check, X, Minus } from "lucide-react";

export default function Compare() {
  const build1 = PREBUILT_BUILDS[0]; // High end
  const build2 = PREBUILT_BUILDS[1]; // Mid range

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-12 container px-4 md:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-heading font-bold mb-4">Compare Builds</h1>
          <p className="text-muted-foreground">See the difference between performance tiers.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Labels Column (Hidden on mobile, handled differently) */}
          <div className="hidden md:flex flex-col gap-4 pt-24">
             <div className="h-12 flex items-center font-bold text-muted-foreground">Price</div>
             <div className="h-12 flex items-center font-bold text-muted-foreground">CPU</div>
             <div className="h-12 flex items-center font-bold text-muted-foreground">GPU</div>
             <div className="h-12 flex items-center font-bold text-muted-foreground">RAM</div>
             <div className="h-12 flex items-center font-bold text-muted-foreground">Storage</div>
             <div className="h-12 flex items-center font-bold text-muted-foreground">4K Gaming</div>
             <div className="h-12 flex items-center font-bold text-muted-foreground">Ray Tracing</div>
          </div>

          {/* Build 1 */}
          <Card className="border-primary/50 shadow-lg shadow-primary/5 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
             <CardHeader className="pb-2">
                <Badge className="w-fit mb-2">Enthusiast</Badge>
                <CardTitle className="text-2xl">{build1.name}</CardTitle>
             </CardHeader>
             <CardContent className="flex flex-col gap-4">
                <div className="h-12 flex items-center text-2xl font-bold text-primary border-b border-border/50 md:border-none">
                    ₹{build1.totalPrice.toLocaleString()}
                </div>
                <div className="h-12 flex items-center border-b border-border/50 md:border-none">
                    <span className="md:hidden font-bold mr-2">CPU:</span> {build1.parts.find(p => p.type === 'cpu')?.name}
                </div>
                <div className="h-12 flex items-center border-b border-border/50 md:border-none">
                    <span className="md:hidden font-bold mr-2">GPU:</span> {build1.parts.find(p => p.type === 'gpu')?.name}
                </div>
                <div className="h-12 flex items-center border-b border-border/50 md:border-none">
                    <span className="md:hidden font-bold mr-2">RAM:</span> {build1.parts.find(p => p.type === 'ram')?.name}
                </div>
                <div className="h-12 flex items-center border-b border-border/50 md:border-none">
                    <span className="md:hidden font-bold mr-2">Storage:</span> {build1.parts.find(p => p.type === 'storage')?.name}
                </div>
                <div className="h-12 flex items-center text-green-500 gap-2 border-b border-border/50 md:border-none">
                    <span className="md:hidden font-bold text-foreground mr-2">4K Gaming:</span> <Check className="h-5 w-5" /> Excellent
                </div>
                <div className="h-12 flex items-center text-green-500 gap-2 border-b border-border/50 md:border-none">
                    <span className="md:hidden font-bold text-foreground mr-2">Ray Tracing:</span> <Check className="h-5 w-5" /> Ultra
                </div>
                <Button className="mt-8 w-full">Select This Build</Button>
             </CardContent>
          </Card>

          {/* Build 2 */}
          <Card className="border-border/50">
             <CardHeader className="pb-2">
                <Badge variant="outline" className="w-fit mb-2">Mid-Range</Badge>
                <CardTitle className="text-2xl">{build2.name}</CardTitle>
             </CardHeader>
             <CardContent className="flex flex-col gap-4">
                <div className="h-12 flex items-center text-2xl font-bold text-foreground border-b border-border/50 md:border-none">
                    ₹{build2.totalPrice.toLocaleString()}
                </div>
                <div className="h-12 flex items-center border-b border-border/50 md:border-none">
                    <span className="md:hidden font-bold mr-2">CPU:</span> {build2.parts.find(p => p.type === 'cpu')?.name}
                </div>
                <div className="h-12 flex items-center border-b border-border/50 md:border-none">
                    <span className="md:hidden font-bold mr-2">GPU:</span> {build2.parts.find(p => p.type === 'gpu')?.name}
                </div>
                <div className="h-12 flex items-center border-b border-border/50 md:border-none">
                    <span className="md:hidden font-bold mr-2">RAM:</span> {build2.parts.find(p => p.type === 'ram')?.name}
                </div>
                <div className="h-12 flex items-center border-b border-border/50 md:border-none">
                    <span className="md:hidden font-bold mr-2">Storage:</span> {build2.parts.find(p => p.type === 'storage')?.name}
                </div>
                <div className="h-12 flex items-center text-yellow-500 gap-2 border-b border-border/50 md:border-none">
                    <span className="md:hidden font-bold text-foreground mr-2">4K Gaming:</span> <Minus className="h-5 w-5" /> Playable
                </div>
                <div className="h-12 flex items-center text-green-500 gap-2 border-b border-border/50 md:border-none">
                    <span className="md:hidden font-bold text-foreground mr-2">Ray Tracing:</span> <Check className="h-5 w-5" /> Good
                </div>
                <Button variant="outline" className="mt-8 w-full">Select This Build</Button>
             </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
