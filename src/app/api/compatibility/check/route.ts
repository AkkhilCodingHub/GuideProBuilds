import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { storage } from "@/lib/storage";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const { partIds } = await req.json();
    if (!Array.isArray(partIds) || partIds.length === 0) {
      return NextResponse.json({ error: "partIds must be a non-empty array" }, { status: 400 });
    }

    const parts = await storage.getPartsByIds(partIds);
    const issues: string[] = [];
    let compatible = true;

    const cpu = parts.find(p => p.type === 'cpu');
    const motherboard = parts.find(p => p.type === 'motherboard');
    const ram = parts.find(p => p.type === 'ram');
    const gpu = parts.find(p => p.type === 'gpu');
    const psu = parts.find(p => p.type === 'psu');
    const cooler = parts.find(p => p.type === 'cooling');

    if (cpu && motherboard) {
      const cpuSocket = cpu.specs?.socket;
      const moboSocket = motherboard.specs?.socket;
      if (cpuSocket && moboSocket && cpuSocket !== moboSocket) {
        issues.push(`CPU socket (${cpuSocket}) is not compatible with motherboard socket (${moboSocket})`);
        compatible = false;
      }
    }

    if (ram && motherboard) {
      const ramType = ram.specs?.type;
      const moboMemoryType = motherboard.specs?.memoryType;
      if (ramType && moboMemoryType && ramType !== moboMemoryType) {
        issues.push(`RAM type (${ramType}) is not compatible with motherboard memory type (${moboMemoryType})`);
        compatible = false;
      }
    }

    if (cpu && cooler) {
      const cpuSocket = cpu.specs?.socket;
      const coolerCompatibility = cooler.compatibility || [];
      if (cpuSocket && coolerCompatibility.length > 0 && !coolerCompatibility.includes(cpuSocket)) {
        issues.push(`CPU cooler may not be compatible with ${cpuSocket} socket`);
        compatible = false;
      }
    }

    if (psu) {
      let estimatedPower = 100; // Base system power
      if (cpu) estimatedPower += 125; // Average CPU TDP
      if (gpu && gpu.specs?.tdp) {
        estimatedPower += typeof gpu.specs.tdp === 'number' ? gpu.specs.tdp : parseInt(gpu.specs.tdp);
      }
      
      const psuWattage = typeof psu.specs?.wattage === 'number' 
        ? psu.specs.wattage 
        : parseInt(psu.specs?.wattage?.replace('W', '') || '0');
      
      if (psuWattage > 0 && estimatedPower > psuWattage * 0.8) {
        issues.push(`PSU (${psuWattage}W) may be insufficient for estimated power draw (~${estimatedPower}W). Consider 20% headroom.`);
      }
    }

    return NextResponse.json({
      compatible,
      issues,
      checkedParts: parts.map(p => ({ id: p._id, name: p.name, type: p.type }))
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
