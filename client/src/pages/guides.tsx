import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Wrench, AlertTriangle, Cpu } from "lucide-react";

export default function Guides() {
  const guides = [
    {
      category: "Buying Guide",
      title: "GPU Guide 2025: Which Card Do You Really Need?",
      desc: "A comprehensive breakdown of NVIDIA RTX 40-series vs AMD Radeon RX 7000 series for every budget.",
      date: "Nov 15, 2025",
      readTime: "10 min read",
      icon: Cpu
    },
    {
      category: "Building",
      title: "How to Build a PC: Step-by-Step for Beginners",
      desc: "Don't panic! We walk you through the entire assembly process with clear photos and safety tips.",
      date: "Oct 22, 2025",
      readTime: "25 min read",
      icon: Wrench
    },
    {
      category: "Troubleshooting",
      title: "PC Won't POST? 5 Common Mistakes to Check",
      desc: "Black screen after hitting power? Check these simple things before returning your parts.",
      date: "Nov 02, 2025",
      readTime: "5 min read",
      icon: AlertTriangle
    },
    {
      category: "Deep Dive",
      title: "Understanding DDR5 RAM Speeds and Latency",
      desc: "Does 6000MHz matter? What is CAS latency? We explain memory specs in plain English.",
      date: "Sep 30, 2025",
      readTime: "15 min read",
      icon: BookOpen
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-12 container px-4 md:px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-heading font-bold mb-4">Guides & Articles</h1>
          <p className="text-muted-foreground max-w-2xl">
            Learn everything you need to know about PC hardware, from picking parts to assembling your machine.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {guides.map((guide, i) => (
            <Card key={i} className="group hover:border-primary/50 transition-all cursor-pointer hover:shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary">{guide.category}</Badge>
                  <guide.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <CardTitle className="text-xl group-hover:text-primary transition-colors">
                  {guide.title}
                </CardTitle>
                <CardDescription className="flex gap-4 text-xs pt-2">
                  <span>{guide.date}</span>
                  <span>•</span>
                  <span>{guide.readTime}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {guide.desc}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
