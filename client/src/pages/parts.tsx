import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, Filter, ShoppingCart, Star, Plus, Minus, 
  Cpu, Monitor, MemoryStick, HardDrive, Zap, Box, Fan, Layers,
  ChevronLeft, ChevronRight, AlertCircle, Check, X
} from "lucide-react";

interface Part {
  _id: string;
  name: string;
  type: string;
  brand: string;
  price: number;
  specs: Record<string, any>;
  description?: string;
  imageUrl?: string;
  inStock: boolean;
  stockCount: number;
  rating: number;
  reviewCount: number;
}

interface PartsResponse {
  parts: Part[];
  total: number;
  page: number;
  totalPages: number;
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

const partTypeIcons: Record<string, React.ReactNode> = {
  cpu: <Cpu className="h-5 w-5" />,
  gpu: <Monitor className="h-5 w-5" />,
  ram: <MemoryStick className="h-5 w-5" />,
  motherboard: <Layers className="h-5 w-5" />,
  storage: <HardDrive className="h-5 w-5" />,
  psu: <Zap className="h-5 w-5" />,
  case: <Box className="h-5 w-5" />,
  cooling: <Fan className="h-5 w-5" />,
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

export default function Parts() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [cartOpen, setCartOpen] = useState(false);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: partsData, isLoading: partsLoading } = useQuery<PartsResponse>({
    queryKey: ["parts", selectedType, selectedBrand, priceRange, inStockOnly, sortBy, sortOrder, page, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedType !== "all") params.append("type", selectedType);
      if (selectedBrand !== "all") params.append("brand", selectedBrand);
      if (priceRange[0] > 0) params.append("minPrice", priceRange[0].toString());
      if (priceRange[1] < 2000) params.append("maxPrice", priceRange[1].toString());
      if (inStockOnly) params.append("inStock", "true");
      if (searchQuery) params.append("query", searchQuery);
      params.append("sortBy", sortBy);
      params.append("sortOrder", sortOrder);
      params.append("page", page.toString());
      params.append("limit", "12");

      const res = await fetch(`/api/parts/browse?${params}`);
      if (!res.ok) throw new Error("Failed to fetch parts");
      return res.json();
    },
  });

  const { data: brands } = useQuery<string[]>({
    queryKey: ["brands"],
    queryFn: async () => {
      const res = await fetch("/api/parts/brands");
      if (!res.ok) throw new Error("Failed to fetch brands");
      return res.json();
    },
  });

  const { data: types } = useQuery<string[]>({
    queryKey: ["types"],
    queryFn: async () => {
      const res = await fetch("/api/parts/types");
      if (!res.ok) throw new Error("Failed to fetch types");
      return res.json();
    },
  });

  const { data: cart, refetch: refetchCart } = useQuery<CartResponse>({
    queryKey: ["cart"],
    queryFn: async () => {
      const res = await fetch("/api/cart");
      if (!res.ok) throw new Error("Failed to fetch cart");
      return res.json();
    },
  });

  const addToCartMutation = useMutation({
    mutationFn: async (partId: string) => {
      const res = await fetch("/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partId, quantity: 1 }),
      });
      if (!res.ok) throw new Error("Failed to add to cart");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast({
        title: "Added to build",
        description: "Part has been added to your build.",
      });
    },
  });

  const updateCartMutation = useMutation({
    mutationFn: async ({ partId, quantity }: { partId: string; quantity: number }) => {
      const res = await fetch("/api/cart/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partId, quantity }),
      });
      if (!res.ok) throw new Error("Failed to update cart");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  const removeFromCartMutation = useMutation({
    mutationFn: async (partId: string) => {
      const res = await fetch(`/api/cart/remove/${partId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to remove from cart");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast({
        title: "Removed from build",
        description: "Part has been removed from your build.",
      });
    },
  });

  const { data: compatibility, refetch: checkCompatibility } = useQuery({
    queryKey: ["compatibility", cart?.items?.map(i => i.partId)],
    queryFn: async () => {
      if (!cart?.items?.length) return null;
      const res = await fetch("/api/compatibility/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partIds: cart.items.map(i => i.partId) }),
      });
      if (!res.ok) throw new Error("Failed to check compatibility");
      return res.json();
    },
    enabled: !!cart?.items?.length,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const resetFilters = () => {
    setSelectedType("all");
    setSelectedBrand("all");
    setPriceRange([0, 2000]);
    setInStockOnly(false);
    setSortBy("name");
    setSortOrder("asc");
    setSearchQuery("");
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 container py-8 px-4 md:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="w-full lg:w-64 shrink-0">
            <Card className="sticky top-24">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between text-lg">
                  <span className="flex items-center gap-2">
                    <Filter className="h-4 w-4" /> Filters
                  </span>
                  <Button variant="ghost" size="sm" onClick={resetFilters}>
                    Reset
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search */}
                <form onSubmit={handleSearch}>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search parts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </form>

                {/* Part Type */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <Select value={selectedType} onValueChange={(v) => { setSelectedType(v); setPage(1); }}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {types?.map((type) => (
                        <SelectItem key={type} value={type}>
                          <span className="flex items-center gap-2">
                            {partTypeIcons[type]}
                            {partTypeLabels[type] || type}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Brand */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Brand</label>
                  <Select value={selectedBrand} onValueChange={(v) => { setSelectedBrand(v); setPage(1); }}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Brands" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Brands</SelectItem>
                      {brands?.map((brand) => (
                        <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Price Range: ${priceRange[0]} - ${priceRange[1]}
                  </label>
                  <Slider
                    value={priceRange}
                    onValueChange={(v) => setPriceRange(v as [number, number])}
                    min={0}
                    max={2000}
                    step={50}
                    className="mt-2"
                  />
                </div>

                {/* In Stock Only */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="inStock"
                    checked={inStockOnly}
                    onCheckedChange={(v) => { setInStockOnly(!!v); setPage(1); }}
                  />
                  <label htmlFor="inStock" className="text-sm font-medium cursor-pointer">
                    In Stock Only
                  </label>
                </div>

                {/* Sort */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Sort By</label>
                  <div className="flex gap-2">
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="price">Price</SelectItem>
                        <SelectItem value="rating">Rating</SelectItem>
                        <SelectItem value="brand">Brand</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                    >
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold">Browse PC Parts</h1>
                <p className="text-muted-foreground">
                  {partsData?.total || 0} parts available
                </p>
              </div>

              {/* Cart Button */}
              <Sheet open={cartOpen} onOpenChange={setCartOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="relative">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    My Build
                    {cart && cart.itemCount > 0 && (
                      <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                        {cart.itemCount}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-lg">
                  <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                      <ShoppingCart className="h-5 w-5" /> Your Build
                    </SheetTitle>
                  </SheetHeader>
                  
                  <div className="mt-6 space-y-4">
                    {/* Compatibility Warning */}
                    {compatibility && !compatibility.compatible && (
                      <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                        <div className="flex items-center gap-2 text-destructive font-medium mb-2">
                          <AlertCircle className="h-4 w-4" />
                          Compatibility Issues
                        </div>
                        <ul className="text-sm text-destructive/80 space-y-1">
                          {compatibility.issues.map((issue: string, i: number) => (
                            <li key={i}>• {issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {compatibility && compatibility.compatible && cart && cart.itemCount > 0 && (
                      <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                        <div className="flex items-center gap-2 text-green-600 font-medium">
                          <Check className="h-4 w-4" />
                          All parts are compatible!
                        </div>
                      </div>
                    )}

                    {/* Cart Items */}
                    {cart?.items?.length ? (
                      <div className="space-y-3">
                        {cart.items.map((item) => (
                          <div
                            key={item.partId}
                            className="flex items-center gap-3 p-3 rounded-lg border bg-card"
                          >
                            <div className="w-10 h-10 rounded bg-secondary flex items-center justify-center">
                              {partTypeIcons[item.part.type] || <Box className="h-5 w-5" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{item.part.name}</p>
                              <p className="text-sm text-muted-foreground">
                                ${item.part.price.toFixed(2)}
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => updateCartMutation.mutate({
                                  partId: item.partId,
                                  quantity: item.quantity - 1
                                })}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center text-sm">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => updateCartMutation.mutate({
                                  partId: item.partId,
                                  quantity: item.quantity + 1
                                })}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive"
                                onClick={() => removeFromCartMutation.mutate(item.partId)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p>Your build is empty</p>
                        <p className="text-sm">Add parts to start building</p>
                      </div>
                    )}

                    {/* Cart Total */}
                    {cart && cart.itemCount > 0 && (
                      <div className="border-t pt-4 mt-4">
                        <div className="flex justify-between items-center text-lg font-bold">
                          <span>Total</span>
                          <span>${cart.total.toFixed(2)}</span>
                        </div>
                        <Button className="w-full mt-4" size="lg">
                          Save Build
                        </Button>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Parts Grid */}
            {partsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-5 w-full" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4 mt-1" />
                    </CardContent>
                    <CardFooter>
                      <Skeleton className="h-9 w-full" />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : partsData?.parts?.length ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {partsData.parts.map((part) => (
                    <Card
                      key={part._id}
                      className="overflow-hidden hover:border-primary/50 transition-colors group"
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="flex items-center gap-1">
                            {partTypeIcons[part.type]}
                            {partTypeLabels[part.type] || part.type}
                          </Badge>
                          {!part.inStock && (
                            <Badge variant="destructive">Out of Stock</Badge>
                          )}
                        </div>
                        <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                          {part.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-2xl font-bold">${part.price.toFixed(2)}</span>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                            <span>{part.rating?.toFixed(1) || "4.0"}</span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{part.brand}</p>
                        {part.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {part.description}
                          </p>
                        )}
                        {/* Specs */}
                        <div className="flex flex-wrap gap-1 mt-3">
                          {Object.entries(part.specs || {}).slice(0, 3).map(([key, value]) => (
                            <Badge key={key} variant="outline" className="text-xs">
                              {key}: {String(value)}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter className="pt-2">
                        <Button
                          className="w-full"
                          disabled={!part.inStock || addToCartMutation.isPending}
                          onClick={() => addToCartMutation.mutate(part._id)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add to Build
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {partsData.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {page} of {partsData.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page === partsData.totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground/20" />
                <h3 className="text-lg font-medium mb-2">No parts found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your filters or search query
                </p>
                <Button variant="outline" onClick={resetFilters}>
                  Reset Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
