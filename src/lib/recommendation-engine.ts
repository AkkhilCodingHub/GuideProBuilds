import { generateText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { storage } from "./storage";
import type { IPart, IPartBase } from "@/shared/schema";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

const ai = google('gemini-1.5-flash');

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
  parts: IPart[];
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
    [key: string]: IPart[];
  };
}

export async function generateRecommendation(
  request: RecommendationRequest
): Promise<BuildRecommendation> {
  const allParts: IPart[] = await storage.searchParts({});
  
  const cpus = allParts.filter((p: IPart) => p.type === "cpu");
  const gpus = allParts.filter((p: IPart) => p.type === "gpu");
  const rams = allParts.filter((p: IPart) => p.type === "ram");
  const storageParts = allParts.filter((p: IPart) => p.type === "storage");
  const motherboards = allParts.filter((p: IPart) => p.type === "motherboard");
  const psus = allParts.filter((p: IPart) => p.type === "psu");
  const cases = allParts.filter((p: IPart) => p.type === "case");

  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
    console.log("[Dev] GEMINI_API_KEY is missing, returning mock recommendation.");
    const mockParts = [cpus[0], gpus[0], rams[0], storageParts[0], motherboards[0], psus[0], cases[0]].filter(Boolean);
    return {
      name: `Mock ${request.useCase} Build`,
      description: "This is a mocked build recommendation because no API key is set.",
      category: request.useCase,
      totalPrice: mockParts.reduce((sum, p) => sum + (p ? p.price : 0), 0),
      parts: mockParts as IPart[],
      reasoning: {
        cpu: "Mock reasoning for CPU",
        gpu: "Mock reasoning for GPU",
        ram: "Mock reasoning for RAM",
        storage: "Mock reasoning for Storage",
        motherboard: "Mock reasoning for Motherboard",
        psu: "Mock reasoning for PSU",
        case: "Mock reasoning for Case"
      },
      alternatives: {}
    };
  }

  const prompt = `You are an expert PC builder. Given the following requirements, recommend the best PC build:

Budget: $${request.budget}
Use Case: ${request.useCase}
Performance Level: ${request.performance}
${request.brands?.length ? `Preferred Brands: ${request.brands.join(", ")}` : ""}

Available parts database:
CPUs: ${JSON.stringify(cpus.map((p: IPart) => ({ id: p._id.toString(), name: p.name, price: p.price, brand: p.brand, specs: p.specs })))}
GPUs: ${JSON.stringify(gpus.map((p: IPart) => ({ id: p._id.toString(), name: p.name, price: p.price, brand: p.brand, specs: p.specs })))}
RAM: ${JSON.stringify(rams.map((p: IPart) => ({ id: p._id.toString(), name: p.name, price: p.price, brand: p.brand, specs: p.specs })))}
Storage: ${JSON.stringify(storageParts.map((p: IPart) => ({ id: p._id.toString(), name: p.name, price: p.price, brand: p.brand, specs: p.specs })))}
Motherboards: ${JSON.stringify(motherboards.map((p: IPart) => ({ id: p._id.toString(), name: p.name, price: p.price, brand: p.brand, specs: p.specs })))}
PSUs: ${JSON.stringify(psus.map((p: IPart) => ({ id: p._id.toString(), name: p.name, price: p.price, brand: p.brand, specs: p.specs })))}
Cases: ${JSON.stringify(cases.map((p: IPart) => ({ id: p._id.toString(), name: p.name, price: p.price, brand: p.brand, specs: p.specs })))}

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
    const { text } = await generateText({
      model: ai,
      messages: [
        { role: 'system', content: "You are an expert PC builder. Provide detailed recommendations and reasoning for PC part selections. Always respond with valid JSON." },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7
    });

    if (!text) {
      throw new Error("No response from AI");
    }

    const jsonMatch = text.match(/```(?:json)?\n([\s\S]*?)\n```/) || [text];
    const jsonString = jsonMatch[1] || jsonMatch[0];
    const result = JSON.parse(jsonString);
    
    const buildRecommendation: BuildRecommendation = {
      name: result.name,
      description: result.description,
      category: result.category,
      totalPrice: result.totalPrice || 0,
      parts: [],
      reasoning: result.reasoning,
      alternatives: {}
    };

    const partIds = [
      result.selectedParts.cpu,
      result.selectedParts.gpu,
      result.selectedParts.ram,
      result.selectedParts.storage,
      result.selectedParts.motherboard,
      result.selectedParts.psu,
      result.selectedParts.case,
      ...(result.alternatives?.cpu || []),
      ...(result.alternatives?.gpu || [])
    ].filter(Boolean);

    const parts = await Promise.all(
      partIds.map((id: string) => storage.getPart(id))
    );

    const validParts = parts.filter((part: IPart | null): part is IPart => part !== null);
    const partMap = new Map(validParts.map((part: IPart) => [part._id.toString(), part]));

    const selectedParts = [
      partMap.get(result.selectedParts.cpu),
      partMap.get(result.selectedParts.gpu),
      partMap.get(result.selectedParts.ram),
      partMap.get(result.selectedParts.storage),
      partMap.get(result.selectedParts.motherboard),
      partMap.get(result.selectedParts.psu),
      partMap.get(result.selectedParts.case)
    ].filter((part): part is IPart => part !== undefined);
    
    buildRecommendation.parts = selectedParts;

    if (result.alternatives) {
      for (const [partType, alternativeIds] of Object.entries(result.alternatives)) {
        const alternatives = (alternativeIds as string[])
          .map((id: string) => partMap.get(id))
          .filter((part): part is IPart => part !== undefined);
        buildRecommendation.alternatives[partType] = alternatives;
      }
    }

    buildRecommendation.totalPrice = buildRecommendation.parts.reduce(
      (sum, part) => sum + part.price,
      0
    );

    return buildRecommendation;
  } catch (error) {
    console.error("Error generating recommendation:", error);
    throw new Error("Failed to generate recommendation. Please try again later.");
  }
}

export async function compareParts(partIds: string[]): Promise<{
  comparison: any;
  winner: string;
  reasoning: string;
}> {
  if (partIds.length < 2) {
    throw new Error("At least two part IDs are required for comparison");
  }

  const parts = await Promise.all(
    partIds.map(id => storage.getPart(id))
  );

  const validCompareParts = parts.filter((part: IPart | null): part is IPart => part !== null);
  const partDetails = validCompareParts.map((part: IPart) => ({
    id: part._id.toString(),
    name: part.name,
    type: part.type,
    brand: part.brand,
    price: part.price,
    specs: part.specs
  }));

  const prompt = `Compare the following PC parts and determine which one is the best based on performance, value, and specifications. Return a JSON object with a detailed comparison, a winner, and reasoning.

Parts to compare:
${JSON.stringify(partDetails, null, 2)}

Respond with a JSON object in this format:
{
  "comparison": {
    "performance": "Detailed comparison of performance",
    "value": "Detailed comparison of value for money",
    "features": "Detailed comparison of features"
  },
  "winner": "part_id",
  "reasoning": "Detailed explanation of why this part was chosen as the winner"
}`;

  try {
    const { text } = await generateText({
      model: ai,
      messages: [
        { role: 'system', content: "You are an expert at comparing PC hardware. Provide detailed comparisons and reasoning for your recommendations. Always respond with valid JSON." },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7
    });

    if (!text) {
      throw new Error("No response from AI");
    }

    const jsonMatch = text.match(/```(?:json)?\n([\s\S]*?)\n```/) || [text];
    const jsonString = jsonMatch[1] || jsonMatch[0];
    
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error comparing parts:", error);
    throw new Error("Failed to compare parts. Please try again later.");
  }
}

export async function fetchLatestPartsFromMarket(): Promise<IPart[]> {
  const { pcppService } = await import('./pcpp-service');
  return pcppService.syncPCPPToDatabase();
}

