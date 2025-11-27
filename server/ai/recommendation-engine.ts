import { generateText } from 'ai';
import { perplexity } from '@ai-sdk/perplexity';
import { storage } from "../storage";
import type { IPart, IPartBase } from "@shared/schema";

// the newest Perplexity AI model is "sonar-medium-online" which was released recently. do not change this unless explicitly requested by the user
const ai = perplexity('sonar-medium-online');

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

    // Extract JSON from the response (removing markdown code blocks if present)
    const jsonMatch = text.match(/```(?:json)?\n([\s\S]*?)\n```/) || [text];
    const jsonString = jsonMatch[1] || jsonMatch[0];
    const result = JSON.parse(jsonString);
    
    // Convert the response to the expected format
    const buildRecommendation: BuildRecommendation = {
      name: result.name,
      description: result.description,
      category: result.category,
      totalPrice: result.totalPrice || 0,
      parts: [],
      reasoning: result.reasoning,
      alternatives: {}
    };

    // Get all part IDs from the response
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

    // Fetch all parts at once
    const parts = await Promise.all(
      partIds.map((id: string) => storage.getPart(id))
    );

    // Create a map of part IDs to part objects
    const partMap = new Map(parts.filter((part): part is IPart => part !== null).map(part => [part._id.toString(), part]));

    // Set the selected parts with type safety
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

    // Set the alternatives
    if (result.alternatives) {
      for (const [partType, alternativeIds] of Object.entries(result.alternatives)) {
        const alternatives = (alternativeIds as string[])
          .map((id: string) => partMap.get(id))
          .filter((part): part is IPart => part !== undefined);
        buildRecommendation.alternatives[partType] = alternatives;
      }
    }

    // Calculate total price
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

  const partDetails = parts.filter((part): part is IPart => part !== null).map(part => ({
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

    // Extract JSON from the response (removing markdown code blocks if present)
    const jsonMatch = text.match(/```(?:json)?\n([\s\S]*?)\n```/) || [text];
    const jsonString = jsonMatch[1] || jsonMatch[0];
    
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error comparing parts:", error);
    throw new Error("Failed to compare parts. Please try again later.");
  }
}
