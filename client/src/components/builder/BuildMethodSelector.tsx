import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wrench, ListChecks, ChevronRight } from "lucide-react";

type BuildMethod = 'custom' | 'prebuilt';

interface BuildMethodSelectorProps {
  onSelect: (method: BuildMethod) => void;
}

export function BuildMethodSelector({ onSelect }: BuildMethodSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
      <Card 
        className="hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer h-full"
        onClick={() => onSelect('custom')}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Wrench className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Custom Build</h3>
              <p className="text-muted-foreground">
                Start from scratch and select each component individually for a fully customized PC.
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      <Card 
        className="hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer h-full"
        onClick={() => onSelect('prebuilt')}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <ListChecks className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Pre-built Selection</h3>
              <p className="text-muted-foreground">
                Choose from our curated list of pre-configured builds from PC Part Picker.
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
