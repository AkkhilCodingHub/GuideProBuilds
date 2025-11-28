import { storage } from "./storage";
import type { InsertPart, InsertGuide } from "@shared/schema";

const PARTS_DATA: InsertPart[] = [
  // CPUs
  { externalId: "cpu-i9-14900k", type: "cpu", name: "Intel Core i9-14900K", price: 549, brand: "Intel", specs: { cores: 24, threads: 32, baseClock: "3.2 GHz", socket: "LGA1700" }, description: "Top-tier performance for gaming and heavy workloads." },
  { externalId: "cpu-r9-7950x3d", type: "cpu", name: "AMD Ryzen 9 7950X3D", price: 699, brand: "AMD", specs: { cores: 16, threads: 32, baseClock: "4.2 GHz", socket: "AM5" }, description: "The king of gaming processors with 3D V-Cache technology." },
  { externalId: "cpu-i5-13600k", type: "cpu", name: "Intel Core i5-13600K", price: 299, brand: "Intel", specs: { cores: 14, threads: 20, baseClock: "3.5 GHz", socket: "LGA1700" }, description: "Best value CPU for gaming and productivity." },
  { externalId: "cpu-r5-7600", type: "cpu", name: "AMD Ryzen 5 7600", price: 229, brand: "AMD", specs: { cores: 6, threads: 12, baseClock: "3.8 GHz", socket: "AM5" }, description: "Excellent entry-level AM5 processor." },
  { externalId: "cpu-i7-14700k", type: "cpu", name: "Intel Core i7-14700K", price: 409, brand: "Intel", specs: { cores: 20, threads: 28, baseClock: "3.4 GHz", socket: "LGA1700" }, description: "Great balance for gaming and productivity." },
  { externalId: "cpu-r7-7800x3d", type: "cpu", name: "AMD Ryzen 7 7800X3D", price: 449, brand: "AMD", specs: { cores: 8, threads: 16, baseClock: "4.2 GHz", socket: "AM5" }, description: "The best gaming CPU with 3D V-Cache." },

  // GPUs
  { externalId: "gpu-rtx-4090", type: "gpu", name: "NVIDIA RTX 4090", price: 1599, brand: "NVIDIA", specs: { vram: "24GB", memoryType: "GDDR6X", tdp: 450 }, description: "The ultimate graphics card for 4K gaming and rendering." },
  { externalId: "gpu-rtx-4080s", type: "gpu", name: "NVIDIA RTX 4080 Super", price: 999, brand: "NVIDIA", specs: { vram: "16GB", memoryType: "GDDR6X", tdp: 320 }, description: "High-end performance for 4K gaming." },
  { externalId: "gpu-rtx-4070s", type: "gpu", name: "NVIDIA RTX 4070 Super", price: 599, brand: "NVIDIA", specs: { vram: "12GB", memoryType: "GDDR6X", tdp: 220 }, description: "Great balance of performance and price for 1440p gaming." },
  { externalId: "gpu-rtx-4070ti", type: "gpu", name: "NVIDIA RTX 4070 Ti Super", price: 799, brand: "NVIDIA", specs: { vram: "16GB", memoryType: "GDDR6X", tdp: 285 }, description: "Excellent 1440p and entry 4K performance." },
  { externalId: "gpu-rx-7900xtx", type: "gpu", name: "AMD Radeon RX 7900 XTX", price: 899, brand: "AMD", specs: { vram: "24GB", memoryType: "GDDR6", tdp: 355 }, description: "AMD's flagship GPU for 4K gaming." },
  { externalId: "gpu-rx-7800xt", type: "gpu", name: "AMD Radeon RX 7800 XT", price: 499, brand: "AMD", specs: { vram: "16GB", memoryType: "GDDR6", tdp: 263 }, description: "Strong rasterization performance and plenty of VRAM." },
  { externalId: "gpu-rtx-4060", type: "gpu", name: "NVIDIA RTX 4060", price: 299, brand: "NVIDIA", specs: { vram: "8GB", memoryType: "GDDR6", tdp: 115 }, description: "Solid 1080p gaming performance on a budget." },
  { externalId: "gpu-rx-7600", type: "gpu", name: "AMD Radeon RX 7600", price: 269, brand: "AMD", specs: { vram: "8GB", memoryType: "GDDR6", tdp: 165 }, description: "Budget-friendly 1080p gaming." },

  // RAM
  { externalId: "ram-corsair-32gb-ddr5", type: "ram", name: "Corsair Vengeance 32GB (2x16GB) DDR5-6000", price: 110, brand: "Corsair", specs: { speed: "6000MHz", capacity: "32GB", type: "DDR5" }, description: "Fast DDR5 memory for modern platforms." },
  { externalId: "ram-gskill-64gb-ddr5", type: "ram", name: "G.Skill Trident Z5 64GB (2x32GB) DDR5-6400", price: 229, brand: "G.Skill", specs: { speed: "6400MHz", capacity: "64GB", type: "DDR5" }, description: "High capacity and high speed for workstations." },
  { externalId: "ram-teamgroup-16gb-ddr4", type: "ram", name: "TeamGroup T-Force 16GB (2x8GB) DDR4-3200", price: 45, brand: "TeamGroup", specs: { speed: "3200MHz", capacity: "16GB", type: "DDR4" }, description: "Reliable budget memory." },
  { externalId: "ram-kingston-32gb-ddr5", type: "ram", name: "Kingston Fury Beast 32GB (2x16GB) DDR5-5600", price: 95, brand: "Kingston", specs: { speed: "5600MHz", capacity: "32GB", type: "DDR5" }, description: "Good value DDR5 memory." },
  { externalId: "ram-corsair-16gb-ddr4", type: "ram", name: "Corsair Vengeance LPX 16GB (2x8GB) DDR4-3600", price: 55, brand: "Corsair", specs: { speed: "3600MHz", capacity: "16GB", type: "DDR4" }, description: "Popular DDR4 kit for Intel and AMD." },

  // Motherboards
  { externalId: "mobo-asus-z790", type: "motherboard", name: "ASUS ROG Maximus Z790 Hero", price: 599, brand: "ASUS", specs: { socket: "LGA1700", formFactor: "ATX", chipset: "Z790", memoryType: "DDR5" }, description: "Premium motherboard with robust power delivery.", compatibility: ["LGA1700", "DDR5"] },
  { externalId: "mobo-msi-b650", type: "motherboard", name: "MSI MAG B650 Tomahawk WiFi", price: 219, brand: "MSI", specs: { socket: "AM5", formFactor: "ATX", chipset: "B650", memoryType: "DDR5" }, description: "Solid feature set for Ryzen 7000 series.", compatibility: ["AM5", "DDR5"] },
  { externalId: "mobo-gigabyte-b760m", type: "motherboard", name: "Gigabyte B760M DS3H", price: 119, brand: "Gigabyte", specs: { socket: "LGA1700", formFactor: "mATX", chipset: "B760", memoryType: "DDR4" }, description: "Budget-friendly choice for Intel builds.", compatibility: ["LGA1700", "DDR4"] },
  { externalId: "mobo-asus-x670e", type: "motherboard", name: "ASUS ROG Crosshair X670E Hero", price: 699, brand: "ASUS", specs: { socket: "AM5", formFactor: "ATX", chipset: "X670E", memoryType: "DDR5" }, description: "Top-tier AM5 motherboard for enthusiasts.", compatibility: ["AM5", "DDR5"] },
  { externalId: "mobo-msi-z790", type: "motherboard", name: "MSI MPG Z790 Edge WiFi", price: 349, brand: "MSI", specs: { socket: "LGA1700", formFactor: "ATX", chipset: "Z790", memoryType: "DDR5" }, description: "Feature-rich Intel motherboard.", compatibility: ["LGA1700", "DDR5"] },

  // Storage
  { externalId: "ssd-samsung-990-2tb", type: "storage", name: "Samsung 990 Pro 2TB", price: 169, brand: "Samsung", specs: { capacity: "2TB", type: "NVMe Gen4", readSpeed: "7450 MB/s" }, description: "Blazing fast storage for OS and games." },
  { externalId: "ssd-crucial-p3-1tb", type: "storage", name: "Crucial P3 Plus 1TB", price: 65, brand: "Crucial", specs: { capacity: "1TB", type: "NVMe Gen4", readSpeed: "5000 MB/s" }, description: "Good value NVMe storage." },
  { externalId: "ssd-wd-blue-500gb", type: "storage", name: "WD Blue SN570 500GB", price: 39, brand: "Western Digital", specs: { capacity: "500GB", type: "NVMe Gen3", readSpeed: "3500 MB/s" }, description: "Budget NVMe drive for basic builds." },
  { externalId: "ssd-samsung-980-1tb", type: "storage", name: "Samsung 980 Pro 1TB", price: 99, brand: "Samsung", specs: { capacity: "1TB", type: "NVMe Gen4", readSpeed: "7000 MB/s" }, description: "Premium SSD with excellent speeds." },
  { externalId: "ssd-seagate-4tb", type: "storage", name: "Seagate Barracuda 4TB HDD", price: 79, brand: "Seagate", specs: { capacity: "4TB", type: "HDD SATA", readSpeed: "190 MB/s" }, description: "Large capacity for game libraries." },

  // PSU
  { externalId: "psu-corsair-1000w", type: "psu", name: "Corsair RM1000e", price: 159, brand: "Corsair", specs: { wattage: 1000, modular: "Fully", efficiency: "80+ Gold" }, description: "High wattage for power-hungry components." },
  { externalId: "psu-evga-750w", type: "psu", name: "EVGA SuperNOVA 750 GT", price: 89, brand: "EVGA", specs: { wattage: 750, modular: "Fully", efficiency: "80+ Gold" }, description: "Reliable mid-range power supply." },
  { externalId: "psu-evga-600w", type: "psu", name: "EVGA 600 W1", price: 49, brand: "EVGA", specs: { wattage: 600, modular: "Non-Modular", efficiency: "80+ White" }, description: "Basic power supply for budget builds." },
  { externalId: "psu-corsair-850w", type: "psu", name: "Corsair RM850x", price: 139, brand: "Corsair", specs: { wattage: 850, modular: "Fully", efficiency: "80+ Gold" }, description: "Sweet spot for high-end builds." },
  { externalId: "psu-seasonic-1200w", type: "psu", name: "Seasonic Prime TX-1200", price: 299, brand: "Seasonic", specs: { wattage: 1200, modular: "Fully", efficiency: "80+ Titanium" }, description: "Premium PSU for extreme builds." },

  // Cases
  { externalId: "case-lian-li-o11", type: "case", name: "Lian Li O11 Dynamic Evo", price: 159, brand: "Lian Li", specs: { formFactor: "ATX", color: "Black", includedFans: 0 }, description: "The classic showcase chassis." },
  { externalId: "case-nzxt-h5", type: "case", name: "NZXT H5 Flow", price: 94, brand: "NZXT", specs: { formFactor: "ATX", color: "White", includedFans: 2 }, description: "Great airflow and clean aesthetics." },
  { externalId: "case-montech-x3", type: "case", name: "Montech X3 Mesh", price: 59, brand: "Montech", specs: { formFactor: "ATX", color: "Black", includedFans: 4 }, description: "Budget case with included fans." },
  { externalId: "case-fractal-torrent", type: "case", name: "Fractal Design Torrent", price: 219, brand: "Fractal Design", specs: { formFactor: "ATX", color: "Black", includedFans: 5 }, description: "Top airflow performance case." },
  { externalId: "case-corsair-4000d", type: "case", name: "Corsair 4000D Airflow", price: 104, brand: "Corsair", specs: { formFactor: "ATX", color: "Black", includedFans: 2 }, description: "Popular mid-tower with great airflow." },

  // CPU Coolers
  { externalId: "cooler-noctua-d15", type: "cooling", name: "Noctua NH-D15", price: 99, brand: "Noctua", specs: { type: "Air", tdpCapacity: 250, noiseLevel: "24.6 dBA" }, description: "Legendary air cooler performance.", compatibility: ["LGA1700", "AM5"] },
  { externalId: "cooler-corsair-h150i", type: "cooling", name: "Corsair iCUE H150i Elite", price: 169, brand: "Corsair", specs: { type: "AIO 360mm", tdpCapacity: 300, noiseLevel: "35 dBA" }, description: "Premium 360mm AIO with RGB." },
  { externalId: "cooler-deepcool-ak400", type: "cooling", name: "DeepCool AK400", price: 35, brand: "DeepCool", specs: { type: "Air", tdpCapacity: 200, noiseLevel: "28 dBA" }, description: "Excellent budget air cooler." },
  { externalId: "cooler-arctic-lf2", type: "cooling", name: "Arctic Liquid Freezer II 280", price: 99, brand: "Arctic", specs: { type: "AIO 280mm", tdpCapacity: 280, noiseLevel: "22.5 dBA" }, description: "Best value AIO cooler." },
];

const GUIDES_DATA: InsertGuide[] = [
  {
    category: "Buying Guide",
    title: "GPU Guide 2025: Which Card Do You Really Need?",
    description: "A comprehensive breakdown of NVIDIA RTX 40-series vs AMD Radeon RX 7000 series for every budget.",
    content: `# GPU Guide 2025: Which Card Do You Really Need?

## Introduction
Choosing the right graphics card can make or break your PC build. In 2025, we have two major players: NVIDIA's RTX 40-series and AMD's Radeon RX 7000 series.

## Budget Tier ($200-$400)
The NVIDIA RTX 4060 and AMD RX 7600 XT dominate this segment. Both offer excellent 1080p performance...

## Mid-Range ($400-$700)
The sweet spot for most gamers. The RTX 4070 Super and RX 7800 XT compete fiercely here...

## High-End ($700+)
For enthusiasts who demand the best. The RTX 4090 remains the king...

## Conclusion
Consider your monitor resolution, target frame rates, and budget when making your choice.`,
    readTime: "10 min read",
    tags: ["gpu", "buying guide", "nvidia", "amd"],
  },
  {
    category: "Building",
    title: "How to Build a PC: Step-by-Step for Beginners",
    description: "Don't panic! We walk you through the entire assembly process with clear photos and safety tips.",
    content: `# How to Build a PC: Step-by-Step Guide

## Before You Begin
- Gather all your components
- Prepare a clean workspace
- Ground yourself to avoid static discharge

## Step 1: Install the CPU
Carefully align the CPU with the socket. Look for the golden triangle marker...

## Step 2: Install RAM
Open the clips on both sides of the RAM slots. Align the notch and press firmly...

## Conclusion
Building a PC is easier than you think! Take your time and enjoy the process.`,
    readTime: "25 min read",
    tags: ["building", "tutorial", "beginner"],
  },
  {
    category: "Troubleshooting",
    title: "PC Won't POST? 5 Common Mistakes to Check",
    description: "Black screen after hitting power? Check these simple things before returning your parts.",
    content: `# PC Won't POST? Troubleshooting Guide

## 1. RAM Not Fully Seated
The number one cause of POST failures. Push until you hear the click...

## 2. Power Connectors
Check both the 24-pin motherboard connector AND the 8-pin CPU power...

## 3. Monitor Cable
Make sure you're plugged into the GPU, not the motherboard!

## Conclusion
Most POST issues are simple fixes. Don't give up!`,
    readTime: "5 min read",
    tags: ["troubleshooting", "post", "beginner"],
  },
];

export async function seedDatabase() {
  console.log("Seeding database...");

  try {
    // Seed parts
    for (const partData of PARTS_DATA) {
      await storage.upsertPartByExternalId(partData.externalId!, partData);
    }
    console.log(`Seeded ${PARTS_DATA.length} parts`);

    // Seed guides
    for (const guideData of GUIDES_DATA) {
      await storage.createGuide(guideData);
    }
    console.log(`Seeded ${GUIDES_DATA.length} guides`);

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
