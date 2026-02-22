import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Builder from "@/pages/builder";
import Prebuilt from "@/pages/builder/prebuilt";
import Compare from "@/pages/compare";
import Guides from "@/pages/guides";
import Parts from "@/pages/parts";
import Support from "@/pages/support";
import Checkout from "@/pages/checkout";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/builder" component={Builder} />
      <Route path="/builder/prebuilt" component={Prebuilt} />
      <Route path="/parts" component={Parts} />
      <Route path="/compare" component={Compare} />
      <Route path="/guides" component={Guides} />
      <Route path="/support" component={Support} />
      <Route path="/checkout" component={Checkout} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
