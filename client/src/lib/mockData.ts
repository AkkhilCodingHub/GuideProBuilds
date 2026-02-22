import { Cpu, Zap, HardDrive, Monitor, Box, Fan, Server, Layers } from "lucide-react";

export interface Part {
  id: string;
  type: "cpu" | "gpu" | "ram" | "storage" | "motherboard" | "psu" | "case";
  name: string;
  price: number;
  brand: string;
  specs: Record<string, string | number>;
  description: string;
  pcppLink?: string;
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
  { id: "cpu-1", type: "cpu", name: "Intel Core i9-14900K", price: 54900, brand: "Intel", specs: { cores: 24, threads: 32, baseClock: "3.2 GHz" }, description: "Top-tier performance for gaming and heavy workloads.", pcppLink: "https://in.pcpartpicker.com/product/ZPNYcf/intel-core-i9-14900k-32-ghz-24-core-processor-bx8071514900k" },
  { id: "cpu-2", type: "cpu", name: "AMD Ryzen 9 7950X3D", price: 59000, brand: "AMD", specs: { cores: 16, threads: 32, baseClock: "4.2 GHz" }, description: "The king of gaming processors with 3D V-Cache.", pcppLink: "https://in.pcpartpicker.com/product/XcgFf7/amd-ryzen-9-7950x3d-42-ghz-16-core-processor-100-100000908wof" },
  { id: "cpu-3", type: "cpu", name: "Intel Core i5-13600K", price: 27500, brand: "Intel", specs: { cores: 14, threads: 20, baseClock: "3.5 GHz" }, description: "Best value CPU for gaming and productivity.", pcppLink: "https://in.pcpartpicker.com/product/LfNxFT/intel-core-i5-13600k-35-ghz-14-core-processor-bx8071513600k" },
  { id: "cpu-4", type: "cpu", name: "AMD Ryzen 5 7600", price: 18500, brand: "AMD", specs: { cores: 6, threads: 12, baseClock: "3.8 GHz" }, description: "Excellent entry-level AM5 processor.", pcppLink: "https://in.pcpartpicker.com/product/yXmmP6/amd-ryzen-5-7600-38-ghz-6-core-processor-100-100001015box" },

  // GPUs
  { id: "gpu-1", type: "gpu", name: "NVIDIA RTX 4090", price: 215000, brand: "NVIDIA", specs: { vram: "24GB", memoryType: "GDDR6X" }, description: "The ultimate graphics card for 4K gaming and rendering.", pcppLink: "https://in.pcpartpicker.com/product/vFyH99/asus-tuf-gaming-geforce-rtx-4090-24-gb-video-card-tuf-rtx4090-24g-gaming" },
  { id: "gpu-2", type: "gpu", name: "NVIDIA RTX 4070 Super", price: 62000, brand: "NVIDIA", specs: { vram: "12GB", memoryType: "GDDR6X" }, description: "Great balance of performance and price for 1440p gaming.", pcppLink: "https://in.pcpartpicker.com/product/BqP8TW/asus-dual-geforce-rtx-4070-super-12-gb-video-card-dual-rtx4070s-12g" },
  { id: "gpu-3", type: "gpu", name: "AMD Radeon RX 7800 XT", price: 54000, brand: "AMD", specs: { vram: "16GB", memoryType: "GDDR6" }, description: "Strong rasterization performance and plenty of VRAM.", pcppLink: "https://in.pcpartpicker.com/product/fcBzK8/sapphire-pulse-radeon-rx-7800-xt-16-gb-video-card-11330-02-20g" },
  { id: "gpu-4", type: "gpu", name: "NVIDIA RTX 4060", price: 29500, brand: "NVIDIA", specs: { vram: "8GB", memoryType: "GDDR6" }, description: "Solid 1080p gaming performance on a budget.", pcppLink: "https://in.pcpartpicker.com/product/X7Hqqs/zotac-gaming-solo-geforce-rtx-4060-8-gb-video-card-zt-d40600g-10l" },

  // RAM
  { id: "ram-1", type: "ram", name: "Corsair Vengeance 32GB (2x16GB) DDR5-6000", price: 11000, brand: "Corsair", specs: { speed: "6000MHz", capacity: "32GB" }, description: "Fast DDR5 memory for modern platforms.", pcppLink: "https://in.pcpartpicker.com/product/xQcgXL/corsair-vengeance-32-gb-2-x-16-gb-ddr5-6000-cl36-memory-cmk32gx5m2d6000z36" },
  { id: "ram-2", type: "ram", name: "G.Skill Trident Z5 64GB (2x32GB) DDR5-6400", price: 22000, brand: "G.Skill", specs: { speed: "6400MHz", capacity: "64GB" }, description: "High capacity and high speed for workstations.", pcppLink: "https://in.pcpartpicker.com/product/MkYmP6/gskill-trident-z5-rgb-64-gb-2-x-32-gb-ddr5-6400-cl32-memory-f5-6400j3239g32gx2-tz5rk" },
  { id: "ram-3", type: "ram", name: "TeamGroup T-Force 16GB (2x8GB) DDR4-3200", price: 3800, brand: "TeamGroup", specs: { speed: "3200MHz", capacity: "16GB" }, description: "Reliable budget memory.", pcppLink: "https://in.pcpartpicker.com/product/z3VD4D/team-t-force-vulcan-z-16-gb-2-x-8-gb-ddr4-3200-memory-tlzgd416g3200hc16cdc01" },

  // Motherboards
  { id: "mobo-1", type: "motherboard", name: "MSI MAG Z790 TOMAHAWK WIFI", price: 28000, brand: "MSI", specs: { socket: "LGA1700", formFactor: "ATX" }, description: "Premium motherboard with robust power delivery.", pcppLink: "https://in.pcpartpicker.com/product/9B2WGX/msi-mag-z790-tomahawk-wifi-atx-lga1700-motherboard-mag-z790-tomahawk-wifi" },
  { id: "mobo-2", type: "motherboard", name: "MSI MAG B650 TOMAHAWK WIFI", price: 21500, brand: "MSI", specs: { socket: "AM5", formFactor: "ATX" }, description: "Solid feature set for Ryzen 7000 series.", pcppLink: "https://in.pcpartpicker.com/product/LwNxFT/msi-mag-b650-tomahawk-wifi-atx-am5-motherboard-mag-b650-tomahawk-wifi" },
  { id: "mobo-3", type: "motherboard", name: "Gigabyte B760M DS3H", price: 11500, brand: "Gigabyte", specs: { socket: "LGA1700", formFactor: "mATX" }, description: "Budget-friendly choice for Intel builds.", pcppLink: "https://in.pcpartpicker.com/product/pv1Pt6/gigabyte-b760m-ds3h-micro-atx-lga1700-motherboard-b760m-ds3h" },

  // Storage
  { id: "ssd-1", type: "storage", name: "Samsung 990 Pro 2TB", price: 16500, brand: "Samsung", specs: { capacity: "2TB", type: "NVMe Gen4" }, description: "Blazing fast storage for OS and games.", pcppLink: "https://in.pcpartpicker.com/product/34ytt6/samsung-990-pro-2-tb-m2-2280-pcie-40-x4-nvme-solid-state-drive-mz-v9p2t0bw" },
  { id: "ssd-2", type: "storage", name: "Crucial P3 Plus 1TB", price: 5800, brand: "Crucial", specs: { capacity: "1TB", type: "NVMe Gen4" }, description: "Good value NVMe storage.", pcppLink: "https://in.pcpartpicker.com/product/chzhP6/crucial-p3-plus-1-tb-m2-2280-nvme-solid-state-drive-ct1000p3pssd8" },

  // PSU
  { id: "psu-1", type: "psu", name: "Corsair RM1000e (2023)", price: 14500, brand: "Corsair", specs: { wattage: "1000W", modular: "Fully" }, description: "High wattage for power-hungry components.", pcppLink: "https://in.pcpartpicker.com/product/fxGhP6/corsair-rm1000e-2023-1000-w-80-gold-certified-fully-modular-atx-power-supply-cp-9020264-na" },
  { id: "psu-2", type: "psu", name: "Corsair CX650M", price: 6200, brand: "Corsair", specs: { wattage: "650W", modular: "Semi" }, description: "Reliable power supply for budget builds.", pcppLink: "https://in.pcpartpicker.com/product/x96p99/corsair-cx650m-2021-650-w-80-bronze-certified-semi-modular-atx-power-supply-cp-9020221-na" },

  // Case
  { id: "case-1", type: "case", name: "Lian Li O11 Dynamic EVO", price: 14500, brand: "Lian Li", specs: { formFactor: "ATX", color: "Black" }, description: "The classic showcase chassis.", pcppLink: "https://in.pcpartpicker.com/product/Ykytt6/lian-li-o11-dynamic-evo-atx-mid-tower-case-pc-o11dex" },
  { id: "case-2", type: "case", name: "NZXT H5 Flow", price: 8200, brand: "NZXT", specs: { formFactor: "ATX", color: "White" }, description: "Great airflow and clean aesthetics.", pcppLink: "https://in.pcpartpicker.com/product/92pzK8/nzxt-h5-flow-atx-mid-tower-case-cc-h51fw-01" },
  { id: "case-3", type: "case", name: "Deepcool CC560", price: 4200, brand: "Deepcool", specs: { formFactor: "ATX", color: "Black" }, description: "Budget case with included fans.", pcppLink: "https://in.pcpartpicker.com/product/YLGbt6/deepcool-cc560-atx-mid-tower-case-r-cc560-bkgaa4-g-1" },
];

export const PREBUILT_BUILDS: Build[] = [
  {
    id: "gaming-beast",
    name: "The 4K Destroyer",
    category: "gaming",
    description: "Uncompromised performance for 4K Ultra gaming.",
    totalPrice: 351000,
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
    totalPrice: 135400,
    parts: [
      PARTS.find(p => p.id === "cpu-4")!,
      PARTS.find(p => p.id === "gpu-2")!,
      PARTS.find(p => p.id === "ram-1")!,
      PARTS.find(p => p.id === "mobo-2")!,
      PARTS.find(p => p.id === "ssd-2")!,
      PARTS.find(p => p.id === "psu-2")!,
      PARTS.find(p => p.id === "case-2")!,
    ]
  },
  {
    id: "budget-starter",
    name: "Console Killer",
    category: "budget",
    description: "Great entry level PC for 1080p gaming.",
    totalPrice: 65500,
    parts: [
      PARTS.find(p => p.id === "cpu-3")!,
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
  // Simple mock logic to return a build based on new INR budget thresholds
  if (budget >= 250000) return PREBUILT_BUILDS[0];
  if (budget >= 100000) return PREBUILT_BUILDS[1];
  return PREBUILT_BUILDS[2];
}
