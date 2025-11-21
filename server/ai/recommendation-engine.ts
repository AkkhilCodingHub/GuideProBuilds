import OpenAI from "openai";
import { storage } from "../storage";
import type { Part } from "@shared/schema";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface RecommendationRequest {
  budget: number;
  useCase: string;
  performance: string;
  brands?: string[];
}

export interface BuildRecommendation {
  name: string;
  description: string;
  category: string;
  totalPrice: number;
  parts: Part[];
  reasoning: {
    cpu: string;
    gpu: string;
    ram: string;
    storage: string;
    motherboard: string;
    psu: string;
    case: string;
  };
  alternatives: {
    [key: string]: Part[];
  };
}

export async function generateRecommendation(
  request: RecommendationRequest
): Promise<BuildRecommendation> {
  const allParts: Part[] = await storage.searchParts({});
  
  const cpus = allParts.filter((p: Part) => p.type === "cpu");
  const gpus = allParts.filter((p: Part) => p.type === "gpu");
  const rams = allParts.filter((p: Part) => p.type === "ram");
  const storageParts = allParts.filter((p: Part) => p.type === "storage");
  const motherboards = allParts.filter((p: Part) => p.type === "motherboard");
  const psus = allParts.filter((p: Part) => p.type === "psu");
  const cases = allParts.filter((p: Part) => p.type === "case");

  const prompt = `You are an expert PC builder. Given the following requirements, recommend the best PC build:

Budget: $${request.budget}
Use Case: ${request.useCase}
Performance Level: ${request.performance}
${request.brands?.length ? `Preferred Brands: ${request.brands.join(", ")}` : ""}

Available parts database:
CPUs: ${JSON.stringify(cpus.map((p: Part) => ({ id: p.id, name: p.name, price: p.price, brand: p.brand, specs: p.specs })))}
GPUs: ${JSON.stringify(gpus.map((p: Part) => ({ id: p.id, name: p.name, price: p.price, brand: p.brand, specs: p.specs })))}
RAM: ${JSON.stringify(rams.map((p: Part) => ({ id: p.id, name: p.name, price: p.price, brand: p.brand, specs: p.specs })))}
Storage: ${JSON.stringify(storageParts.map((p: Part) => ({ id: p.id, name: p.name, price: p.price, brand: p.brand, specs: p.specs })))}
Motherboards: ${JSON.stringify(motherboards.map((p: Part) => ({ id: p.id, name: p.name, price: p.price, brand: p.brand, specs: p.specs })))}
PSUs: ${JSON.stringify(psus.map((p: Part) => ({ id: p.id, name: p.name, price: p.price, brand: p.brand, specs: p.specs })))}
Cases: ${JSON.stringify(cases.map((p: Part) => ({ id: p.id, name: p.name, price: p.price, brand: p.brand, specs: p.specs })))}

Please return a JSON response with the following structure:
{
  "name": "Build name (creative and descriptive)",
  "description": "Brief description of what this build excels at",
  "category": "gaming|workstation|budget|streaming",
  "selectedParts": {
    "cpu": part_id,
    "gpu": part_id,
    "ram": part_id,
    "storage": part_id,
    "motherboard": part_id,
    "psu": part_id,
    "case": part_id
  },
  "reasoning": {
    "cpu": "Why this CPU was chosen",
    "gpu": "Why this GPU was chosen",
    "ram": "Why this RAM was chosen",
    "storage": "Why this storage was chosen",
    "motherboard": "Why this motherboard was chosen",
    "psu": "Why this PSU was chosen",
    "case": "Why this case was chosen"
  },
  "alternatives": {
    "cpu": [part_id, part_id],
    "gpu": [part_id, part_id]
  }
}

Ensure compatibility between parts (CPU socket matching motherboard, PSU wattage sufficient, etc.). Stay as close to the budget as possible without exceeding it. Prioritize value and performance for the stated use case.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are an expert PC hardware specialist. Always respond with valid JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 4096,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    const selectedParts: Part[] = [];
    const partMap = new Map(allParts.map((p: Part) => [p.id, p]));
    
    for (const type of ["cpu", "gpu", "ram", "storage", "motherboard", "psu", "case"]) {
      const partId = result.selectedParts[type];
      const part = partMap.get(partId);
      if (part) {
        selectedParts.push(part);
      }
    }

    const totalPrice = selectedParts.reduce((sum: number, p: Part) => sum + parseFloat(p.price), 0);

    const alternatives: { [key: string]: Part[] } = {};
    for (const [type, partIds] of Object.entries(result.alternatives || {})) {
      alternatives[type] = (partIds as number[])
        .map((id: number) => partMap.get(id))
        .filter((p: Part | undefined) => p !== undefined) as Part[];
    }

    return {
      name: result.name || "Custom Build",
      description: result.description || "A balanced PC build",
      category: result.category || request.useCase,
      totalPrice,
      parts: selectedParts,
      reasoning: result.reasoning || {},
      alternatives,
    };
  } catch (error: any) {
    console.error("AI recommendation error:", error);
    throw new Error("Failed to generate AI recommendation");
  }
}

export async function compareParts(partIds: number[]): Promise<{
  comparison: any;
  winner: number;
  reasoning: string;
}> {
  const parts = await Promise.all(
    partIds.map((id: number) => storage.getPart(id))
  );

  const validParts = parts.filter((p: Part | undefined) => p !== undefined) as Part[];

  if (validParts.length < 2) {
    throw new Error("Need at least 2 parts to compare");
  }

  const prompt = `Compare the following PC components and determine which is the best value:

${validParts.map((p: Part, i: number) => `
Part ${i + 1}:
Name: ${p.name}
Brand: ${p.brand}
Price: $${p.price}
Specs: ${JSON.stringify(p.specs)}
`).join("\n")}

Return JSON with:
{
  "comparison": {
    "performance": "analysis of performance differences",
    "value": "price-to-performance analysis",
    "features": "feature comparison"
  },
  "winner": part_index (0-based),
  "reasoning": "Brief explanation of why this part wins"
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-5",
    messages: [
      { role: "system", content: "You are a PC hardware expert. Respond with JSON only." },
      { role: "user", content: prompt }
    ],
    response_format: { type: "json_object" },
    max_completion_tokens: 2048,
  });

  const result = JSON.parse(response.choices[0].message.content || "{}");

  return {
    comparison: result.comparison,
    winner: validParts[result.winner]?.id || validParts[0].id,
    reasoning: result.reasoning || "Analysis complete",
  };
}
