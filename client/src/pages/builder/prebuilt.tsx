import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PREBUILT_BUILDS } from "@/lib/mockData";
import { ArrowLeft, Search, ExternalLink } from "lucide-react";

export default function PrebuiltBuilds() {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredBuilds = PREBUILT_BUILDS.filter(build => 
    build.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    build.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <Button 
        variant="ghost" 
        className="mb-6" 
        onClick={() => navigate('/builder')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Builder
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Pre-built PC Selections</h1>
        <p className="text-muted-foreground">
          Browse our curated selection of pre-configured builds from PC Part Picker
        </p>
      </div>

      <div className="mb-8 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search builds by name or category..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBuilds.map((build) => (
          <Card key={build.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{build.name}</CardTitle>
                  <Badge variant="outline" className="mt-2">
                    {build.category}
                  </Badge>
                </div>
                <Badge variant="secondary" className="px-3 py-1 text-sm">₹{build.totalPrice.toLocaleString()}</Badge>
              </div>
              <CardDescription className="line-clamp-2">
                {build.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {build.parts.slice(0, 4).map((part) => (
                  <div key={part.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{part.type.toUpperCase()}</span>
                    <div className="flex items-center">
                      <span className="font-medium truncate max-w-[180px] mr-2">{part.name}</span>
                      <div className="font-bold font-mono self-end sm:self-center">₹{part.price.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
                {build.parts.length > 4 && (
                  <div className="text-sm text-muted-foreground">
                    +{build.parts.length - 4} more components
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" size="sm" asChild>
                <a 
                  href={`https://in.pcpartpicker.com/list/${build.id}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View on PCPP
                </a>
              </Button>
              <Button size="sm" onClick={() => {
                // Here you would typically navigate to a build detail page
                // or add to cart functionality
                console.log('Selected build:', build.id);
              }}>
                Select Build
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
