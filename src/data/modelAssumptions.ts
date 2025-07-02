import { ModelEnvironmentalData } from '../types/environmental';

// Based on research from various sources including:
// - OpenAI pricing: https://openai.com/pricing
// - Energy estimates from academic papers on LLM energy consumption
// - Global average CO2 intensity: ~475g CO2/kWh (IEA 2023)

export const MODEL_ASSUMPTIONS: ModelEnvironmentalData[] = [
  {
    model: 'gpt-4',
    costPer1kTokens: 0.03, // $0.03 per 1k tokens (input/output average)
    kWhPer1kTokens: 0.047, // Estimated based on model size and compute
    co2gPerkWh: 475, // Global average grid intensity
    co2gPer1kTokens: 22.3, // 0.047 * 475
  },
  {
    model: 'gpt-4-turbo',
    costPer1kTokens: 0.015,
    kWhPer1kTokens: 0.042,
    co2gPerkWh: 475,
    co2gPer1kTokens: 20.0,
  },
  {
    model: 'gpt-3.5-turbo',
    costPer1kTokens: 0.002,
    kWhPer1kTokens: 0.0023,
    co2gPerkWh: 475,
    co2gPer1kTokens: 1.1,
  },
  {
    model: 'o1-preview',
    costPer1kTokens: 0.06, // Higher due to reasoning compute
    kWhPer1kTokens: 0.087,
    co2gPerkWh: 475,
    co2gPer1kTokens: 41.3,
  },
  {
    model: 'o1-mini',
    costPer1kTokens: 0.012,
    kWhPer1kTokens: 0.032,
    co2gPerkWh: 475,
    co2gPer1kTokens: 15.2,
  },
  {
    model: 'o3-mini',
    costPer1kTokens: 0.015, // Estimated - new model
    kWhPer1kTokens: 0.035,
    co2gPerkWh: 475,
    co2gPer1kTokens: 16.6,
  },
  {
    model: 'dall-e-2',
    costPer1kTokens: 20.0, // $0.020 per image, ~1k tokens equivalent
    kWhPer1kTokens: 2.3, // Higher energy for image generation
    co2gPerkWh: 475,
    co2gPer1kTokens: 1092.5,
  },
  {
    model: 'dall-e-3',
    costPer1kTokens: 40.0, // $0.040 per image
    kWhPer1kTokens: 3.8,
    co2gPerkWh: 475,
    co2gPer1kTokens: 1805.0,
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
  
  // Default fallback (similar to gpt-4)
  if (!assumption) {
    assumption = {
      model: modelName,
      costPer1kTokens: 0.03,
      kWhPer1kTokens: 0.047,
      co2gPerkWh: 475,
      co2gPer1kTokens: 22.3,
    };
  }
  
  return assumption;
};