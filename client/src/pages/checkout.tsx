import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  ShoppingCart, 
  Mail, 
  User, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  ArrowLeft,
  Package,
  Cpu,
  Monitor,
  MemoryStick,
  HardDrive,
  Zap,
  Box,
  Fan,
  Layers,
  Phone,
  MapPin,
  IndianRupee,
  FileText
} from "lucide-react";

interface Part {
  _id: string;
  name: string;
  type: string;
  brand: string;
  price: number;
  specs: Record<string, any>;
}

interface CartItem {
  partId: string;
  quantity: number;
  part: Part;
}

interface CartResponse {
  id: string;
  items: CartItem[];
  total: number;
  itemCount: number;
}

interface CheckoutResponse {
  success: boolean;
  message: string;
  emailSent: boolean;
  emailError?: string;
}

const partTypeIcons: Record<string, React.ReactNode> = {
  cpu: <Cpu className="h-4 w-4" />,
  gpu: <Monitor className="h-4 w-4" />,
  ram: <MemoryStick className="h-4 w-4" />,
  motherboard: <Layers className="h-4 w-4" />,
  storage: <HardDrive className="h-4 w-4" />,
  psu: <Zap className="h-4 w-4" />,
  case: <Box className="h-4 w-4" />,
  cooling: <Fan className="h-4 w-4" />,
};

const partTypeLabels: Record<string, string> = {
  cpu: "CPU",
  gpu: "Graphics Card",
  ram: "Memory",
  motherboard: "Motherboard",
  storage: "Storage",
  psu: "Power Supply",
  case: "Case",
  cooling: "CPU Cooler",
};

const pcRequestFormSchema = z.object({
  customerName: z.string().min(1, 'Name is required'),
  customerEmail: z.string().email('Please enter a valid email address'),
  customerPhone: z.string().optional(),
  customerCity: z.string().optional(),
  customerBudget: z.string().optional(),
  customerNotes: z.string().optional(),
});

type PCRequestFormData = z.infer<typeof pcRequestFormSchema>;

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [orderComplete, setOrderComplete] = useState<CheckoutResponse | null>(null);

  const form = useForm<PCRequestFormData>({
    resolver: zodResolver(pcRequestFormSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      customerCity: "",
      customerBudget: "",
      customerNotes: "",
    },
  });

  const { data: cart, isLoading: cartLoading } = useQuery<CartResponse>({
    queryKey: ["cart"],
    queryFn: async () => {
      const res = await fetch("/api/cart");
      if (!res.ok) throw new Error("Failed to fetch cart");
      return res.json();
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: async (data: PCRequestFormData): Promise<CheckoutResponse> => {
      if (!cart) throw new Error("Cart not found");

      const subtotal = cart.items.reduce((sum, item) => sum + (item.part.price * item.quantity), 0);
      const tax = subtotal * 0.0825;
      const total = subtotal + tax;

      const requestBody = {
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone || undefined,
        customerCity: data.customerCity || undefined,
        customerBudget: data.customerBudget ? parseFloat(data.customerBudget) : undefined,
        customerNotes: data.customerNotes || undefined,
        items: cart.items.map(item => ({
          partId: item.partId,
          quantity: item.quantity,
          partName: item.part.name,
          partType: item.part.type,
          partBrand: item.part.brand,
          price: item.part.price,
        })),
        subtotal,
        tax,
        total,
        currency: 'INR',
      };

      const res = await apiRequest("POST", "/api/pc-request", requestBody);
      return await res.json();
    },
    onSuccess: (response: CheckoutResponse) => {
      setOrderComplete(response);
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      
      if (response.emailSent) {
        toast({
          title: "Request Sent!",
          description: response.message,
        });
      } else {
        toast({
          title: "Request Sent",
          description: response.message,
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Request Failed",
        description: error.message || "Failed to send request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PCRequestFormData) => {
    checkoutMutation.mutate(data);
  };

  const formatCurrency = (amount: number, currency: string = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const subtotal = cart?.items?.reduce((sum, item) => sum + (item.part.price * item.quantity), 0) || 0;
  const tax = subtotal * 0.0825;
  const total = subtotal + tax;

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        
        <main className="flex-1 container py-12 px-4 md:px-8">
          <div className="max-w-2xl mx-auto">
            <Card className="border-blue-200 dark:border-blue-800">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-2xl font-bold" data-testid="text-request-success">
                  PC Request Sent!
                </CardTitle>
                <CardDescription className="text-base">
                  Thank you for your request
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                  <p className="text-blue-800 dark:text-blue-200 font-medium" data-testid="text-success-message">
                    Your PC build request has been sent to an expert builder.
                  </p>
                  <p className="text-blue-700 dark:text-blue-300 text-sm mt-2">
                    We will contact you through your email soon.
                  </p>
                </div>

                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <h3 className="font-semibold text-sm mb-3">Request Summary</h3>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Items:</span>
                    <span>{cart?.itemCount || 0} {(cart?.itemCount || 0) === 1 ? 'item' : 'items'}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Tax:</span>
                    <span>{formatCurrency(tax)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-primary" data-testid="text-request-total">{formatCurrency(total)}</span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col sm:flex-row gap-3">
                <Button 
                  variant="outline" 
                  className="w-full sm:w-auto"
                  onClick={() => setLocation('/parts')}
                  data-testid="button-continue-shopping"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Continue Shopping
                </Button>
                <Button 
                  className="w-full sm:w-auto"
                  onClick={() => setLocation('/')}
                  data-testid="button-go-home"
                >
                  <Package className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </CardFooter>
            </Card>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  if (cartLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 container py-12 px-4 md:px-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        
        <main className="flex-1 container py-12 px-4 md:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <Card>
              <CardContent className="py-12">
                <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-40" />
                <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
                <p className="text-muted-foreground mb-6">
                  Add some parts to your build before checking out
                </p>
                <Button onClick={() => setLocation('/parts')} data-testid="button-browse-parts">
                  Browse Parts
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 container py-8 px-4 md:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => setLocation('/parts')}
              className="mb-4"
              data-testid="button-back-to-cart"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Parts
            </Button>
            <h1 className="text-2xl md:text-3xl font-bold" data-testid="text-page-title">PC Build Request</h1>
            <p className="text-muted-foreground mt-2">Submit your build to an expert builder</p>
          </div>

          <div className="grid lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    <CardTitle>Your Details</CardTitle>
                  </div>
                  <CardDescription>
                    Fill in your information so an expert builder can contact you
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="customerName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name <span className="text-destructive">*</span></FormLabel>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                  data-testid="input-customer-name"
                                  placeholder="John Doe"
                                  className="pl-10"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage data-testid="error-customer-name" />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="customerEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address <span className="text-destructive">*</span></FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                  data-testid="input-customer-email"
                                  type="email"
                                  placeholder="john@example.com"
                                  className="pl-10"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage data-testid="error-customer-email" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="customerPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number (Optional)</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                  data-testid="input-customer-phone"
                                  type="tel"
                                  placeholder="+1 (555) 000-0000"
                                  className="pl-10"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage data-testid="error-customer-phone" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="customerCity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City / Region (Optional)</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                  data-testid="input-customer-city"
                                  placeholder="New York, NY"
                                  className="pl-10"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage data-testid="error-customer-city" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="customerBudget"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Budget (Optional)</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                  data-testid="input-customer-budget"
                                  type="number"
                                  placeholder="1500"
                                  className="pl-10"
                                  step="0.01"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage data-testid="error-customer-budget" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="customerNotes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Notes / Special Requests (Optional)</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Textarea
                                  data-testid="input-customer-notes"
                                  placeholder="Tell us about your preferences, performance goals, or any special requests..."
                                  className="pl-10 pt-8"
                                  rows={4}
                                  {...field}
                                />
                                <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              </div>
                            </FormControl>
                            <FormMessage data-testid="error-customer-notes" />
                          </FormItem>
                        )}
                      />

                      <div className="pt-4">
                        <Button 
                          type="submit" 
                          size="lg" 
                          className="w-full"
                          disabled={checkoutMutation.isPending}
                          data-testid="button-submit-request"
                        >
                          {checkoutMutation.isPending ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Sending Request...
                            </>
                          ) : (
                            <>
                              <Mail className="h-4 w-4 mr-2" />
                              Submit Build Request
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2">
              <Card className="sticky top-24">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-primary" />
                    <CardTitle>Build Summary</CardTitle>
                  </div>
                  <CardDescription>
                    {cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'} in your build
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {cart.items.map((item) => (
                      <div
                        key={item.partId}
                        className="flex items-center gap-3 p-2 rounded-lg border bg-card"
                        data-testid={`checkout-item-${item.partId}`}
                      >
                        <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center shrink-0">
                          {partTypeIcons[item.part.type] || <Box className="h-4 w-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{item.part.name}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{partTypeLabels[item.part.type] || item.part.type}</span>
                            <span>x{item.quantity}</span>
                          </div>
                        </div>
                        <p className="font-medium text-sm shrink-0">
                          {formatCurrency(item.part.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span data-testid="text-subtotal">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax (8.25%)</span>
                      <span data-testid="text-tax">{formatCurrency(tax)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-primary" data-testid="text-total">{formatCurrency(total)}</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Badge variant="outline" className="w-full justify-center py-2">
                      <Mail className="h-3 w-3 mr-2" />
                      Request will be sent to an expert
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
