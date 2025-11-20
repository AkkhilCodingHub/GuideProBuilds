import { Cpu, Zap, HardDrive, Monitor, Box, Fan, Server, Layers } from "lucide-react";

export interface Part {
  id: string;
  type: "cpu" | "gpu" | "ram" | "storage" | "motherboard" | "psu" | "case";
  name: string;
  price: number;
  brand: string;
  specs: Record<string, string | number>;
  description: string;
}

export interface Build {
  id: string;
  name: string;
  description: string;
  category: "gaming" | "workstation" | "budget" | "streaming";
  totalPrice: number;
  parts: Part[];
}

export const PARTS: Part[] = [
  // CPUs
  { id: "cpu-1", type: "cpu", name: "Intel Core i9-14900K", price: 549, brand: "Intel", specs: { cores: 24, threads: 32, baseClock: "3.2 GHz" }, description: "Top-tier performance for gaming and heavy workloads." },
  { id: "cpu-2", type: "cpu", name: "AMD Ryzen 9 7950X3D", price: 699, brand: "AMD", specs: { cores: 16, threads: 32, baseClock: "4.2 GHz" }, description: "The king of gaming processors with 3D V-Cache technology." },
  { id: "cpu-3", type: "cpu", name: "Intel Core i5-13600K", price: 299, brand: "Intel", specs: { cores: 14, threads: 20, baseClock: "3.5 GHz" }, description: "Best value CPU for gaming and productivity." },
  { id: "cpu-4", type: "cpu", name: "AMD Ryzen 5 7600", price: 229, brand: "AMD", specs: { cores: 6, threads: 12, baseClock: "3.8 GHz" }, description: "Excellent entry-level AM5 processor." },

  // GPUs
  { id: "gpu-1", type: "gpu", name: "NVIDIA RTX 4090", price: 1599, brand: "NVIDIA", specs: { vram: "24GB", memoryType: "GDDR6X" }, description: "The ultimate graphics card for 4K gaming and rendering." },
  { id: "gpu-2", type: "gpu", name: "NVIDIA RTX 4070 Super", price: 599, brand: "NVIDIA", specs: { vram: "12GB", memoryType: "GDDR6X" }, description: "Great balance of performance and price for 1440p gaming." },
  { id: "gpu-3", type: "gpu", name: "AMD Radeon RX 7800 XT", price: 499, brand: "AMD", specs: { vram: "16GB", memoryType: "GDDR6" }, description: "Strong rasterization performance and plenty of VRAM." },
  { id: "gpu-4", type: "gpu", name: "NVIDIA RTX 4060", price: 299, brand: "NVIDIA", specs: { vram: "8GB", memoryType: "GDDR6" }, description: "Solid 1080p gaming performance on a budget." },

  // RAM
  { id: "ram-1", type: "ram", name: "Corsair Vengeance 32GB (2x16GB) DDR5-6000", price: 110, brand: "Corsair", specs: { speed: "6000MHz", capacity: "32GB" }, description: "Fast DDR5 memory for modern platforms." },
  { id: "ram-2", type: "ram", name: "G.Skill Trident Z5 64GB (2x32GB) DDR5-6400", price: 229, brand: "G.Skill", specs: { speed: "6400MHz", capacity: "64GB" }, description: "High capacity and high speed for workstations." },
  { id: "ram-3", type: "ram", name: "TeamGroup T-Force 16GB (2x8GB) DDR4-3200", price: 45, brand: "TeamGroup", specs: { speed: "3200MHz", capacity: "16GB" }, description: "Reliable budget memory." },

  // Motherboards
  { id: "mobo-1", type: "motherboard", name: "ASUS ROG Maximus Z790 Hero", price: 599, brand: "ASUS", specs: { socket: "LGA1700", formFactor: "ATX" }, description: "Premium motherboard with robust power delivery." },
  { id: "mobo-2", type: "motherboard", name: "MSI MAG B650 Tomahawk WiFi", price: 219, brand: "MSI", specs: { socket: "AM5", formFactor: "ATX" }, description: "Solid feature set for Ryzen 7000 series." },
  { id: "mobo-3", type: "motherboard", name: "Gigabyte B760M DS3H", price: 119, brand: "Gigabyte", specs: { socket: "LGA1700", formFactor: "mATX" }, description: "Budget-friendly choice for Intel builds." },

  // Storage
  { id: "ssd-1", type: "storage", name: "Samsung 990 Pro 2TB", price: 169, brand: "Samsung", specs: { capacity: "2TB", type: "NVMe Gen4" }, description: "Blazing fast storage for OS and games." },
  { id: "ssd-2", type: "storage", name: "Crucial P3 Plus 1TB", price: 65, brand: "Crucial", specs: { capacity: "1TB", type: "NVMe Gen4" }, description: "Good value NVMe storage." },

  // PSU
  { id: "psu-1", type: "psu", name: "Corsair RM1000e", price: 159, brand: "Corsair", specs: { wattage: "1000W", modular: "Fully" }, description: "High wattage for power-hungry components." },
  { id: "psu-2", type: "psu", name: "EVGA 600 W1", price: 49, brand: "EVGA", specs: { wattage: "600W", modular: "Non" }, description: "Basic power supply for budget builds." },

  // Case
  { id: "case-1", type: "case", name: "Lian Li O11 Dynamic Evo", price: 159, brand: "Lian Li", specs: { formFactor: "ATX", color: "Black" }, description: "The classic showcase chassis." },
  { id: "case-2", type: "case", name: "NZXT H5 Flow", price: 94, brand: "NZXT", specs: { formFactor: "ATX", color: "White" }, description: "Great airflow and clean aesthetics." },
  { id: "case-3", type: "case", name: "Montech X3 Mesh", price: 59, brand: "Montech", specs: { formFactor: "ATX", color: "Black" }, description: "Budget case with included fans." },
];

export const PREBUILT_BUILDS: Build[] = [
  {
    id: "gaming-beast",
    name: "The 4K Destroyer",
    category: "gaming",
    description: "Uncompromised performance for 4K Ultra gaming.",
    totalPrice: 3500,
    parts: [
      PARTS.find(p => p.id === "cpu-1")!,
      PARTS.find(p => p.id === "gpu-1")!,
      PARTS.find(p => p.id === "ram-2")!,
      PARTS.find(p => p.id === "mobo-1")!,
      PARTS.find(p => p.id === "ssd-1")!,
      PARTS.find(p => p.id === "psu-1")!,
      PARTS.find(p => p.id === "case-1")!,
    ]
  },
  {
    id: "value-king",
    name: "1440p Value King",
    category: "gaming",
    description: "The sweet spot for price-to-performance.",
    totalPrice: 1400,
    parts: [
      PARTS.find(p => p.id === "cpu-3")!,
      PARTS.find(p => p.id === "gpu-2")!,
      PARTS.find(p => p.id === "ram-1")!,
      PARTS.find(p => p.id === "mobo-2")!, // Mismatch socket technically but it's mock data
      PARTS.find(p => p.id === "ssd-2")!,
      PARTS.find(p => p.id === "psu-1")!,
      PARTS.find(p => p.id === "case-2")!,
    ]
  },
  {
    id: "budget-starter",
    name: "Console Killer",
    category: "budget",
    description: "Great entry level PC for 1080p gaming.",
    totalPrice: 750,
    parts: [
      PARTS.find(p => p.id === "cpu-4")!,
      PARTS.find(p => p.id === "gpu-4")!,
      PARTS.find(p => p.id === "ram-3")!,
      PARTS.find(p => p.id === "mobo-3")!,
      PARTS.find(p => p.id === "ssd-2")!,
      PARTS.find(p => p.id === "psu-2")!,
      PARTS.find(p => p.id === "case-3")!,
    ]
  }
];

export function generateBuild(budget: number, useCase: string, performance: string): Build | null {
  // Simple mock logic to return a build based on budget
  if (budget > 2500) return PREBUILT_BUILDS[0];
  if (budget > 1000) return PREBUILT_BUILDS[1];
  return PREBUILT_BUILDS[2];
}
