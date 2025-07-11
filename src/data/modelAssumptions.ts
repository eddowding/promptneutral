import { ModelEnvironmentalData } from '../types/environmental';

// Based on research data from July 2025 snapshot
// Energy values from:
// - Third-party measurements (Epoch AI)
// - Vendor claims and guidance
// - Expert estimates with ±1 order of magnitude uncertainty
// - Grid carbon: 0.475 kg CO₂/kWh (global avg 2024)
// - Water usage: 0.25 L/kWh (typical US datacenter)
// Note: Energy values vary ×50-100 based on GPU type, batch size, and reasoning mode

export const MODEL_ASSUMPTIONS: ModelEnvironmentalData[] = [
  // GPT-4o - Epoch AI measured: 0.22-0.35 Wh/query, avg 0.285 Wh
  // Assuming 2.5k tokens per query: 0.285/2.5 = 0.114 Wh/k tokens = 0.000114 kWh/k tokens
  {
    model: 'gpt-4o',
    costPer1kTokens: 0.01, // ~$0.01 per query (from research)
    kWhPer1kTokens: 0.000114,
    co2gPerkWh: 475,
    co2gPer1kTokens: 0.054,
  },
  {
    model: 'gpt-4',
    costPer1kTokens: 0.03,
    kWhPer1kTokens: 0.00014, // Similar to GPT-4o but slightly higher
    co2gPerkWh: 475,
    co2gPer1kTokens: 0.067,
  },
  {
    model: 'gpt-4-turbo',
    costPer1kTokens: 0.015,
    kWhPer1kTokens: 0.00012,
    co2gPerkWh: 475,
    co2gPer1kTokens: 0.057,
  },
  // GPT-4.1 nano - 0.04-0.08 Wh/k tokens (speculative)
  {
    model: 'gpt-4.1-nano',
    costPer1kTokens: 0.001,
    kWhPer1kTokens: 0.00006, // 0.06 Wh/k tokens
    co2gPerkWh: 475,
    co2gPer1kTokens: 0.029,
  },
  {
    model: 'gpt-3.5-turbo',
    costPer1kTokens: 0.002,
    kWhPer1kTokens: 0.00008, // Between nano and GPT-4o
    co2gPerkWh: 475,
    co2gPer1kTokens: 0.038,
  },
  // Claude models - vendor guidance
  {
    model: 'claude-4-sonnet',
    costPer1kTokens: 0.015,
    kWhPer1kTokens: 0.0001, // 0.20-0.30 Wh/query, avg 0.25 Wh → 0.1 Wh/k tokens
    co2gPerkWh: 475,
    co2gPer1kTokens: 0.048,
  },
  {
    model: 'claude-4-opus',
    costPer1kTokens: 0.075,
    kWhPer1kTokens: 0.00016, // ~0.40 Wh/query → 0.16 Wh/k tokens
    co2gPerkWh: 475,
    co2gPer1kTokens: 0.076,
  },
  {
    model: 'claude-3.7-sonnet',
    costPer1kTokens: 0.015,
    kWhPer1kTokens: 0.0017, // ~1.7 Wh/k tokens from 2024 benchmark
    co2gPerkWh: 475,
    co2gPer1kTokens: 0.808,
  },
  // Gemini models
  {
    model: 'gemini-2.5-flash',
    costPer1kTokens: 0.00025,
    kWhPer1kTokens: 0.00008, // 0.022-0.24 Wh/query, avg 0.13 → 0.052 Wh/k tokens
    co2gPerkWh: 475,
    co2gPer1kTokens: 0.038,
  },
  {
    model: 'gemini-2.5-pro',
    costPer1kTokens: 0.0125,
    kWhPer1kTokens: 0.00016, // ~0.40 Wh/query → 0.16 Wh/k tokens
    co2gPerkWh: 475,
    co2gPer1kTokens: 0.076,
  },
  // o1 models - higher due to reasoning compute
  {
    model: 'o1-preview',
    costPer1kTokens: 0.06,
    kWhPer1kTokens: 0.00035, // Higher compute for reasoning
    co2gPerkWh: 475,
    co2gPer1kTokens: 0.166,
  },
  {
    model: 'o1-mini',
    costPer1kTokens: 0.012,
    kWhPer1kTokens: 0.00025,
    co2gPerkWh: 475,
    co2gPer1kTokens: 0.119,
  },
  // o3 - Chain-of-thought heavy: ~39 Wh/k tokens
  {
    model: 'o3',
    costPer1kTokens: 0.50, // ~$0.50/query from research
    kWhPer1kTokens: 0.039, // 39 Wh/k tokens
    co2gPerkWh: 475,
    co2gPer1kTokens: 18.525,
  },
  {
    model: 'o3-mini',
    costPer1kTokens: 0.015,
    kWhPer1kTokens: 0.004, // 10x less than o3
    co2gPerkWh: 475,
    co2gPer1kTokens: 1.9,
  },
  {
    model: 'o3-pro',
    costPer1kTokens: 0.50, // Similar to o3 full
    kWhPer1kTokens: 0.039, // Same as o3
    co2gPerkWh: 475,
    co2gPer1kTokens: 18.525,
  },
  // DeepSeek R1 - Extended reasoning: 33-40 Wh/k tokens
  {
    model: 'deepseek-r1',
    costPer1kTokens: 0.25,
    kWhPer1kTokens: 0.0365, // avg 36.5 Wh/k tokens
    co2gPerkWh: 475,
    co2gPer1kTokens: 17.338,
  },
  // Image generation models
  {
    model: 'dall-e-2',
    costPer1kTokens: 20.0,
    kWhPer1kTokens: 0.01, // Estimated 25 Wh per image
    co2gPerkWh: 475,
    co2gPer1kTokens: 4.75,
  },
  {
    model: 'dall-e-3',
    costPer1kTokens: 40.0,
    kWhPer1kTokens: 0.02, // Estimated 50 Wh per image
    co2gPerkWh: 475,
    co2gPer1kTokens: 9.5,
  },
];

export const getModelAssumptions = (modelName: string): ModelEnvironmentalData => {
  // Try exact match first
  let assumption = MODEL_ASSUMPTIONS.find(a => a.model === modelName);
  
  // If no exact match, try partial matching
  if (!assumption) {
    assumption = MODEL_ASSUMPTIONS.find(a => 
      modelName.toLowerCase().includes(a.model.toLowerCase()) ||
      a.model.toLowerCase().includes(modelName.toLowerCase())
    );
  }
  
  // Default fallback (similar to GPT-4o)
  if (!assumption) {
    assumption = {
      model: modelName,
      costPer1kTokens: 0.01,
      kWhPer1kTokens: 0.000114, // Default to GPT-4o levels
      co2gPerkWh: 475,
      co2gPer1kTokens: 0.054,
    };
  }
  
  return assumption;
};