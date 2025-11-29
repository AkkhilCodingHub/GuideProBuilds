import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  HelpCircle, 
  MessageSquare, 
  Wrench, 
  BookOpen, 
  Send, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Search,
  Cpu,
  Monitor,
  HardDrive,
  Zap,
  Settings
} from "lucide-react";

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

interface FAQCategory {
  id: string;
  name: string;
  faqs: FAQ[];
}

interface FAQData {
  categories: FAQCategory[];
}

const categoryIcons: Record<string, typeof HelpCircle> = {
  'getting-started': BookOpen,
  'pc-building': Cpu,
  'compatibility': Monitor,
  'troubleshooting': Wrench,
  'account': Settings,
};

const supportFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Please enter a valid email address'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  priority: z.enum(['low', 'medium', 'high']),
  category: z.string(),
  sendConfirmation: z.boolean(),
});

type SupportFormData = z.infer<typeof supportFormSchema>;

export default function Support() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("faq");
  
  const form = useForm<SupportFormData>({
    resolver: zodResolver(supportFormSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
      priority: "medium",
      category: "general",
      sendConfirmation: true,
    },
  });

  const { data: faqData, isLoading: faqLoading, isError: faqError } = useQuery<FAQData>({
    queryKey: ["/api/support/faq"],
  });

  const submitMutation = useMutation({
    mutationFn: async (data: SupportFormData) => {
      return await apiRequest("POST", "/api/support/tickets", data);
    },
    onSuccess: () => {
      const sendConfirmation = form.getValues("sendConfirmation");
      toast({
        title: "Message Sent",
        description: sendConfirmation 
          ? "Your support request has been submitted. Check your email for confirmation."
          : "Your support request has been submitted. We'll get back to you soon.",
      });
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit support request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SupportFormData) => {
    submitMutation.mutate(data);
  };

  const filteredFaqs = faqData?.categories.map(category => ({
    ...category,
    faqs: category.faqs.filter(faq => 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.faqs.length > 0);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        <section className="py-12 lg:py-16 border-b border-border/40">
          <div className="container px-4 md:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <Badge variant="outline" className="mb-4 border-primary/50 text-primary bg-primary/10 px-4 py-1 rounded-full" data-testid="badge-help-center">
                Help Center
              </Badge>
              <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4" data-testid="text-page-title">
                How Can We Help You?
              </h1>
              <p className="text-muted-foreground text-lg mb-8" data-testid="text-page-description">
                Find answers to common questions, troubleshooting guides, or contact our support team.
              </p>
              
              <div className="relative max-w-xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  data-testid="input-faq-search"
                  type="text"
                  placeholder="Search FAQs and troubleshooting guides..."
                  className="pl-12 h-12 text-base"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container px-4 md:px-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-5xl mx-auto">
              <TabsList className="grid w-full grid-cols-3 mb-8" data-testid="tablist-support">
                <TabsTrigger value="faq" data-testid="tab-faq" className="gap-2">
                  <HelpCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">FAQs</span>
                </TabsTrigger>
                <TabsTrigger value="troubleshooting" data-testid="tab-troubleshooting" className="gap-2">
                  <Wrench className="h-4 w-4" />
                  <span className="hidden sm:inline">Troubleshooting</span>
                </TabsTrigger>
                <TabsTrigger value="contact" data-testid="tab-contact" className="gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span className="hidden sm:inline">Contact Us</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="faq" className="space-y-8" data-testid="tabcontent-faq">
                {faqLoading ? (
                  <div className="flex items-center justify-center py-12" data-testid="status-loading">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : faqError ? (
                  <Card data-testid="card-error">
                    <CardContent className="py-12 text-center">
                      <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                      <h3 className="font-heading text-lg font-semibold mb-2">Failed to Load FAQs</h3>
                      <p className="text-muted-foreground mb-4">
                        We couldn't load the FAQ content. Please try refreshing the page.
                      </p>
                      <Button 
                        variant="outline" 
                        onClick={() => window.location.reload()}
                        data-testid="button-retry"
                      >
                        Refresh Page
                      </Button>
                    </CardContent>
                  </Card>
                ) : searchQuery && filteredFaqs?.length === 0 ? (
                  <Card data-testid="card-no-results">
                    <CardContent className="py-12 text-center">
                      <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-heading text-lg font-semibold mb-2">No Results Found</h3>
                      <p className="text-muted-foreground">
                        Try different keywords or browse the categories below.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  (searchQuery ? filteredFaqs : faqData?.categories)?.filter(cat => cat.id !== 'troubleshooting').map((category) => {
                    const IconComponent = categoryIcons[category.id] || HelpCircle;
                    return (
                      <Card key={category.id} data-testid={`card-faq-category-${category.id}`}>
                        <CardHeader>
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                              <IconComponent className="h-5 w-5" />
                            </div>
                            <CardTitle className="font-heading" data-testid={`text-category-${category.id}`}>{category.name}</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <Accordion type="single" collapsible className="w-full">
                            {category.faqs.map((faq) => (
                              <AccordionItem key={faq.id} value={faq.id} data-testid={`accordion-item-${faq.id}`}>
                                <AccordionTrigger 
                                  data-testid={`faq-question-${faq.id}`}
                                  className="text-left hover:text-primary"
                                >
                                  {faq.question}
                                </AccordionTrigger>
                                <AccordionContent 
                                  data-testid={`faq-answer-${faq.id}`}
                                  className="text-muted-foreground leading-relaxed"
                                >
                                  {faq.answer}
                                </AccordionContent>
                              </AccordionItem>
                            ))}
                          </Accordion>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </TabsContent>

              <TabsContent value="troubleshooting" className="space-y-6" data-testid="tabcontent-troubleshooting">
                <div className="grid gap-6 md:grid-cols-2 mb-8">
                  <Card className="border-border/50" data-testid="card-troubleshoot-boot">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-red-500/10 text-red-500 dark:bg-red-500/20">
                          <AlertCircle className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-base font-heading">PC Won't Boot</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Common boot issues and how to diagnose them.
                      </p>
                      <ul className="text-sm space-y-2 text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          Check all power connections
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          Verify RAM is seated properly
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          Test with minimal components
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-border/50" data-testid="card-troubleshoot-overheat">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500 dark:bg-orange-500/20">
                          <Zap className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-base font-heading">Overheating Issues</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Keep your system cool and stable.
                      </p>
                      <ul className="text-sm space-y-2 text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          Check fan orientation and speed
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          Clean dust from heatsinks
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          Reapply thermal paste if needed
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-border/50" data-testid="card-troubleshoot-display">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 dark:bg-blue-500/20">
                          <Monitor className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-base font-heading">Display Problems</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        No signal or graphics issues.
                      </p>
                      <ul className="text-sm space-y-2 text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          Connect monitor to GPU, not motherboard
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          Reseat graphics card firmly
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          Check PCIe power cables
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-border/50" data-testid="card-troubleshoot-storage">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-green-500/10 text-green-500 dark:bg-green-500/20">
                          <HardDrive className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-base font-heading">Storage Issues</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Drive not detected or slow performance.
                      </p>
                      <ul className="text-sm space-y-2 text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          Check SATA/NVMe connections
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          Verify BIOS detects the drive
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          Initialize new drives in Disk Management
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                {faqData?.categories.find(cat => cat.id === 'troubleshooting') && (
                  <Card data-testid="card-troubleshoot-detailed">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                          <Wrench className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="font-heading">Detailed Troubleshooting Guides</CardTitle>
                          <CardDescription className="mt-1">
                            In-depth solutions for common PC building issues
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Accordion type="single" collapsible className="w-full">
                        {faqData.categories.find(cat => cat.id === 'troubleshooting')?.faqs.map((faq) => (
                          <AccordionItem key={faq.id} value={faq.id} data-testid={`accordion-troubleshoot-${faq.id}`}>
                            <AccordionTrigger 
                              data-testid={`troubleshoot-question-${faq.id}`}
                              className="text-left hover:text-primary"
                            >
                              {faq.question}
                            </AccordionTrigger>
                            <AccordionContent 
                              data-testid={`troubleshoot-answer-${faq.id}`}
                              className="text-muted-foreground leading-relaxed whitespace-pre-line"
                            >
                              {faq.answer}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="contact" data-testid="tabcontent-contact">
                <div className="grid gap-8 lg:grid-cols-3">
                  <Card className="lg:col-span-2" data-testid="card-contact-form">
                    <CardHeader>
                      <CardTitle className="font-heading">Send Us a Message</CardTitle>
                      <CardDescription>
                        Fill out the form below and we'll get back to you within 24-48 hours.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                          <div className="grid gap-4 sm:grid-cols-2">
                            <FormField
                              control={form.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Name <span className="text-destructive">*</span></FormLabel>
                                  <FormControl>
                                    <Input
                                      data-testid="input-name"
                                      placeholder="Your name"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage data-testid="error-name" />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Email <span className="text-destructive">*</span></FormLabel>
                                  <FormControl>
                                    <Input
                                      data-testid="input-email"
                                      type="email"
                                      placeholder="your@email.com"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage data-testid="error-email" />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="grid gap-4 sm:grid-cols-2">
                            <FormField
                              control={form.control}
                              name="category"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Category</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger data-testid="select-category">
                                        <SelectValue placeholder="Select a category" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="general" data-testid="option-category-general">General Question</SelectItem>
                                      <SelectItem value="pc-building" data-testid="option-category-building">PC Building Help</SelectItem>
                                      <SelectItem value="compatibility" data-testid="option-category-compatibility">Compatibility Issue</SelectItem>
                                      <SelectItem value="troubleshooting" data-testid="option-category-troubleshooting">Technical Support</SelectItem>
                                      <SelectItem value="feedback" data-testid="option-category-feedback">Feedback & Suggestions</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage data-testid="error-category" />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="priority"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Priority</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger data-testid="select-priority">
                                        <SelectValue placeholder="Select priority" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="low" data-testid="option-priority-low">Low - General inquiry</SelectItem>
                                      <SelectItem value="medium" data-testid="option-priority-medium">Medium - Need help soon</SelectItem>
                                      <SelectItem value="high" data-testid="option-priority-high">High - Urgent issue</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage data-testid="error-priority" />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name="subject"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Subject <span className="text-destructive">*</span></FormLabel>
                                <FormControl>
                                  <Input
                                    data-testid="input-subject"
                                    placeholder="Brief description of your issue"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage data-testid="error-subject" />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="message"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Message <span className="text-destructive">*</span></FormLabel>
                                <FormControl>
                                  <Textarea
                                    data-testid="input-message"
                                    placeholder="Describe your issue in detail. Include any error messages, steps you've tried, and your system specifications if relevant."
                                    className="min-h-[150px] resize-y"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage data-testid="error-message" />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="sendConfirmation"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    data-testid="checkbox-confirmation"
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel className="text-sm text-muted-foreground cursor-pointer">
                                    Send me a confirmation email with my ticket details
                                  </FormLabel>
                                </div>
                              </FormItem>
                            )}
                          />

                          <Button 
                            type="submit" 
                            data-testid="button-submit"
                            className="w-full sm:w-auto"
                            disabled={submitMutation.isPending}
                          >
                            {submitMutation.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Sending...
                              </>
                            ) : (
                              <>
                                <Send className="mr-2 h-4 w-4" />
                                Send Message
                              </>
                            )}
                          </Button>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>

                  <div className="space-y-6">
                    <Card data-testid="card-quick-tips">
                      <CardHeader>
                        <CardTitle className="text-base font-heading">Quick Tips</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="p-1.5 rounded-md bg-primary/10 text-primary shrink-0">
                            <CheckCircle2 className="h-4 w-4" />
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Include your PC specs when reporting technical issues
                          </p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="p-1.5 rounded-md bg-primary/10 text-primary shrink-0">
                            <CheckCircle2 className="h-4 w-4" />
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Describe any error messages you see exactly as shown
                          </p>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="p-1.5 rounded-md bg-primary/10 text-primary shrink-0">
                            <CheckCircle2 className="h-4 w-4" />
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Check our FAQs first - your answer might be there!
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card data-testid="card-response-times">
                      <CardHeader>
                        <CardTitle className="text-base font-heading">Response Times</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm text-muted-foreground">High Priority</span>
                          <Badge variant="outline" className="text-xs" data-testid="badge-response-high">Within 24h</Badge>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm text-muted-foreground">Medium Priority</span>
                          <Badge variant="outline" className="text-xs" data-testid="badge-response-medium">24-48h</Badge>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm text-muted-foreground">Low Priority</span>
                          <Badge variant="outline" className="text-xs" data-testid="badge-response-low">2-3 days</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
