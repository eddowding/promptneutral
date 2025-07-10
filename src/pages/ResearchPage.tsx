import React from 'react';
import { Navigation } from '../components/Navigation';
import { ArrowLeft, Zap, Droplets, Cloud, ExternalLink, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ResearchPage() {
  const navigate = useNavigate();

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to calculator
            </button>

            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Research: Environmental Impact of AI Models
            </h1>
            
            <p className="text-lg text-gray-600 mb-8">
              Understanding the energy, water, and carbon footprint of different AI models
            </p>

            {/* Snapshot Table */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
              <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-4">
                <h2 className="text-xl font-semibold">Snapshot — July 2025</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr className="text-left text-sm">
                      <th className="px-4 py-3 font-medium">Model</th>
                      <th className="px-4 py-3 font-medium">Provider</th>
                      <th className="px-4 py-3 font-medium">Thinking?</th>
                      <th className="px-4 py-3 font-medium">Energy/short chat (Wh)</th>
                      <th className="px-4 py-3 font-medium">Energy/10k tokens (Wh)</th>
                      <th className="px-4 py-3 font-medium">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-sm">
                    <tr>
                      <td className="px-4 py-3 font-medium">Gemini 2.5 Flash</td>
                      <td className="px-4 py-3">Google</td>
                      <td className="px-4 py-3">Direct Response</td>
                      <td className="px-4 py-3">≈ 0.22 †</td>
                      <td className="px-4 py-3">n/d</td>
                      <td className="px-4 py-3">25% leaner than 2.0 Flash</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium">GPT-4.1 nano</td>
                      <td className="px-4 py-3">OpenAI</td>
                      <td className="px-4 py-3">Direct Response</td>
                      <td className="px-4 py-3">—</td>
                      <td className="px-4 py-3">0.45</td>
                      <td className="px-4 py-3">Ultra-efficient</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium">Claude 4 Sonnet</td>
                      <td className="px-4 py-3">Anthropic</td>
                      <td className="px-4 py-3">Hybrid</td>
                      <td className="px-4 py-3">≈ 0.28 †</td>
                      <td className="px-4 py-3">≈ 14 †</td>
                      <td className="px-4 py-3">Drop-in efficient variant</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium">GPT-4o</td>
                      <td className="px-4 py-3">OpenAI</td>
                      <td className="px-4 py-3">Thinking</td>
                      <td className="px-4 py-3">0.30 – 0.43</td>
                      <td className="px-4 py-3">—</td>
                      <td className="px-4 py-3">New baseline</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium">Claude 4 Opus</td>
                      <td className="px-4 py-3">Anthropic</td>
                      <td className="px-4 py-3">Thinking</td>
                      <td className="px-4 py-3">≈ 0.32 †</td>
                      <td className="px-4 py-3">≈ 15 †</td>
                      <td className="px-4 py-3">~8% less power than Claude 3.7</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium">Gemini 2.5 Pro</td>
                      <td className="px-4 py-3">Google</td>
                      <td className="px-4 py-3">Thinking</td>
                      <td className="px-4 py-3">≈ 0.40 †</td>
                      <td className="px-4 py-3">n/d</td>
                      <td className="px-4 py-3">Claims parity with GPT-4o</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium">Claude 3.7 Sonnet</td>
                      <td className="px-4 py-3">Anthropic</td>
                      <td className="px-4 py-3">Hybrid</td>
                      <td className="px-4 py-3">—</td>
                      <td className="px-4 py-3">≈ 17</td>
                      <td className="px-4 py-3">Top eco-efficiency 2024</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium">DeepSeek R1</td>
                      <td className="px-4 py-3">DeepSeek</td>
                      <td className="px-4 py-3">Thinking</td>
                      <td className="px-4 py-3">—</td>
                      <td className="px-4 py-3">≥ 33</td>
                      <td className="px-4 py-3">Energy-heavy</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium">o3</td>
                      <td className="px-4 py-3">OpenAI</td>
                      <td className="px-4 py-3">Thinking</td>
                      <td className="px-4 py-3">—</td>
                      <td className="px-4 py-3">≥ 33</td>
                      <td className="px-4 py-3">Worst-in-class (×70 GPT-4.1 nano)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="p-4 bg-gray-50 text-xs text-gray-600">
                <p>**Wh = watt-hours for inference only (training excluded).</p>
                <p>†Estimated from provider efficiency statements or scaling laws; no audited figure published.</p>
              </div>
            </div>

            {/* Key Takeaways */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
                Key Take-aways
              </h2>
              <ol className="space-y-4">
                <li className="flex gap-3">
                  <span className="font-bold text-gray-900">1.</span>
                  <div>
                    <strong>Energy spread still &gt; 100×.</strong> Tiny fast-path models (GPT-4.1 nano, Gemini Flash-Lite) hover around 0.3–0.5 Wh for very long prompts, while heavyweight reasoning modes (o3, DeepSeek R1) exceed 30 Wh per similar job—two orders of magnitude.
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-gray-900">2.</span>
                  <div>
                    <strong>Claude 4 adds modest hardware savings.</strong> Anthropic's kernel tweaks and prompt-caching shave ≈ 8% GPU power vs Claude 3.7; Opus remains mid-pack for footprint but high on performance density.
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-gray-900">3.</span>
                  <div>
                    <strong>Gemini 2.5 Flash prioritises throughput.</strong> Google reports a 25% efficiency bump and 1.5× speed-up over Flash 2.0; energy per token is now comparable to GPT-4o fast path.
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-gray-900">4.</span>
                  <div>
                    <strong>Water: orders of magnitude uncertainty.</strong>
                    <ul className="ml-4 mt-2 space-y-1 list-disc">
                      <li>OpenAI puts GPT-4o at 0.000085 gal (~0.32 mL) per chat—evaporated in cooling towers (consumptive).</li>
                      <li>Independent studies still quote 10–50 chats ≈ 500 mL for older ChatGPT stacks—due to site-specific water-usage-effectiveness (WUE).</li>
                      <li>Advanced closed-loop/hot-water systems recycle heat and recover up to 80% of water.</li>
                      <li>Providers rarely publish WUE at model granularity; assume most water is lost (evaporated) unless disclosed.</li>
                    </ul>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-gray-900">5.</span>
                  <div>
                    <strong>Transparency gap remains.</strong> All figures for Gemini 2.5 and Claude 4 are vendor claims or extrapolations—no third-party audit yet. The open-source AI Energy Score project is pressuring for standard disclosure.
                  </div>
                </li>
              </ol>
            </div>

            {/* Main Content Sections */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-3xl font-bold mb-6">Environmental Impact of AI Queries Across Leading Models</h2>
              
              {/* Introduction */}
              <section className="mb-8">
                <h3 className="text-2xl font-semibold mb-4">Introduction</h3>
                <p className="text-gray-700 mb-4">
                  Every AI query comes with a hidden environmental footprint. When you prompt a large language model (LLM) like OpenAI's ChatGPT or Google's Gemini, data center servers must perform intensive computations – consuming electricity and generating heat. This process has tangible environmental costs: it draws electrical power (often from fossil-fuel sources, leading to carbon emissions) and uses water for cooling the hardware.
                </p>
                <p className="text-gray-700 mb-4">
                  Recent analyses show that AI inference (model usage) can account for up to 90% of an LLM's total lifecycle energy use, far eclipsing the one-time training cost. In other words, the everyday act of asking questions to AI models, millions of times over, is now a major driver of energy and water consumption.
                </p>
                <p className="text-gray-700">
                  Crucially, not all AI models are equal – the per-query impact varies widely by model size, design, and data center efficiency. Below, we break down the environmental cost of answering queries across several leading AI providers and model types.
                </p>
              </section>

              {/* Thinking vs Non-Thinking Models */}
              <section className="mb-8">
                <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  <Zap className="h-6 w-6 text-purple-600" />
                  "Thinking" vs. "Non-Thinking" Models: o3 vs. GPT-4o
                </h3>
                <p className="text-gray-700 mb-4">
                  Large models can operate in different modes. Some, like OpenAI's new "o" series (e.g. o1, o3), explicitly generate chains-of-thought – essentially performing extra "thinking" steps internally to solve complex problems. Others, like the base GPT-4 (often denoted GPT-4o in research), produce a direct answer without those intermediate steps unless specifically prompted.
                </p>
                <p className="text-gray-700 mb-4">
                  This distinction has big energy implications. The reasoning models spend more computation per query to "think through" problems, making them slower and more power-hungry. For example, OpenAI's o1 model is up to 30× slower than the standard GPT-4 model, because of this intensive reasoning process.
                </p>
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-4">
                  <p className="text-sm">
                    <strong>Key Finding:</strong> OpenAI's o3 can consume around 39.2 Wh of energy to answer a single long prompt, whereas the normal GPT-4 model (GPT-4o) uses only about 1.8 Wh for the same long query. In other words, o3 took on the order of 20× more energy for the identical task.
                  </p>
                </div>
              </section>

              {/* Energy Consumption */}
              <section className="mb-8">
                <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  <Zap className="h-6 w-6 text-yellow-600" />
                  Energy Consumption per Query
                </h3>
                <p className="text-gray-700 mb-4">
                  Electricity usage is a fundamental metric for the environmental cost of AI inference. Different providers and model sizes show wide disparities:
                </p>
                
                <div className="space-y-4">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-semibold text-lg mb-2">OpenAI GPT-4 (Standard Model)</h4>
                    <p className="text-gray-700">
                      A short prompt to GPT-4o uses roughly 0.42 Wh of electricity. For context, that's about 40% more energy than a standard Google search query (which is ~0.30 Wh). A medium-length chat might consume ~3.7 Wh, and a long query can use ~9–10 Wh – equivalent to the energy of charging two smartphones to full.
                    </p>
                  </div>
                  
                  <div className="border-l-4 border-red-500 pl-4">
                    <h4 className="font-semibold text-lg mb-2">OpenAI o Series (Reasoning Models)</h4>
                    <p className="text-gray-700">
                      OpenAI's reasoning-intensive models draw far more power per query. o3 was measured near 39 Wh for a long answer – over 20× the energy of GPT-4o on the same task. Even o3-mini consumed slightly more energy per query than the full GPT-4, because it ran on older less-efficient hardware.
                    </p>
                  </div>
                  
                  <div className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-semibold text-lg mb-2">Anthropic Claude</h4>
                    <p className="text-gray-700">
                      The Claude-3.7 "Sonnet" model was highlighted as the most eco-efficient of the pack. It supports chain-of-thought reasoning yet used only about 17 Wh for the long-form query test – less than half of OpenAI o3's energy.
                    </p>
                  </div>
                </div>
              </section>

              {/* Water Usage */}
              <section className="mb-8">
                <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  <Droplets className="h-6 w-6 text-blue-600" />
                  Water Usage and Cooling Impact
                </h3>
                <p className="text-gray-700 mb-4">
                  Running AI models generates heat, and data centers use water to cool their hardware. This creates an often-overlooked water footprint for each query.
                </p>
                
                <div className="bg-blue-50 rounded-lg p-6 mb-4">
                  <h4 className="font-semibold mb-3">Water Consumption by Model Type:</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600">•</span>
                      <div>
                        <strong>Efficient Models:</strong> Small models like GPT-4.1 nano can complete a query with under 2 milliliters of water used for cooling.
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-600">•</span>
                      <div>
                        <strong>Standard Models:</strong> ChatGPT might use roughly 500 mL of water for every 10–50 responses, averaging about 10–50 mL per query.
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600">•</span>
                      <div>
                        <strong>Large "Thinking" Models:</strong> DeepSeek-R1 was estimated to use &gt;150 mL of water per query – over two-thirds of a standard cup of water evaporated just for one answer.
                      </div>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-red-50 border-l-4 border-red-400 p-4">
                  <p className="text-sm">
                    <strong>Important:</strong> Roughly 80% of cooling water is consumed (evaporated) and not returned to the local environment. This is clean freshwater that becomes permanently unavailable locally.
                  </p>
                </div>
              </section>

              {/* Carbon Emissions */}
              <section className="mb-8">
                <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  <Cloud className="h-6 w-6 text-gray-600" />
                  Carbon Emissions per Query
                </h3>
                <p className="text-gray-700 mb-4">
                  Energy consumption translates into carbon dioxide emissions unless that energy is fully sourced from renewables. The carbon footprint of an AI query depends on the electricity's carbon intensity and the amount of power used.
                </p>
                
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Best Case</h4>
                    <p className="text-2xl font-bold text-green-600 mb-1">&lt; 0.3g CO₂</p>
                    <p className="text-sm text-gray-600">Efficient models on clean power (GPT-4.1 nano)</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Worst Case</h4>
                    <p className="text-2xl font-bold text-red-600 mb-1">~14g CO₂</p>
                    <p className="text-sm text-gray-600">Heavy models like DeepSeek-R1</p>
                  </div>
                </div>
                
                <p className="text-gray-700">
                  To put this in perspective: 14 grams CO₂ for one answer is equivalent to the emissions from driving a typical gasoline car about 50 meters. When scaled to billions of queries, GPT-4o's 2025 annual inference emissions are projected at 138,000 to 163,000 tons of CO₂ – like the yearly emissions of 30,000 gasoline cars.
                </p>
              </section>

              {/* Citations */}
              <section className="mb-8">
                <h3 className="text-2xl font-semibold mb-4">Academic Sources & References</h3>
                <div className="bg-gray-50 rounded-lg p-6">
                  <p className="text-sm text-gray-600 mb-4">
                    This analysis is based on peer-reviewed research, technical reports, and primary sources:
                  </p>
                  
                  <h4 className="font-semibold text-gray-800 mb-3">Primary Research Papers</h4>
                  <ul className="space-y-2 text-sm mb-6">
                    <li className="flex items-start gap-2">
                      <ExternalLink className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <a href="https://arxiv.org/abs/2411.16033" className="text-blue-600 hover:underline">
                          "How Much Energy Do Large Language Models Consume?" (2025)
                        </a>
                        <p className="text-gray-600 text-xs">University of Rhode Island - Comprehensive benchmarking of 30 AI models</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <ExternalLink className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <a href="https://arxiv.org/abs/2311.16863" className="text-blue-600 hover:underline">
                          "Making AI Less 'Thirsty': Uncovering and Addressing the Secret Water Footprint of AI Models" (2023)
                        </a>
                        <p className="text-gray-600 text-xs">UC Riverside & UT Arlington - Water consumption analysis</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <ExternalLink className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <a href="https://arxiv.org/abs/2311.10323" className="text-blue-600 hover:underline">
                          "Power Hungry Processing: Watts Driving the Cost of AI Deployment?" (2023)
                        </a>
                        <p className="text-gray-600 text-xs">Hugging Face & Carnegie Mellon - Energy usage in deployment</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <ExternalLink className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <a href="https://arxiv.org/abs/2410.09081" className="text-blue-600 hover:underline">
                          "Green-AI: Leap in Carbon-Neutral Artificial Intelligence" (2024)
                        </a>
                        <p className="text-gray-600 text-xs">Environmental impact assessment frameworks</p>
                      </div>
                    </li>
                  </ul>

                  <h4 className="font-semibold text-gray-800 mb-3">Technical Reports & Industry Analysis</h4>
                  <ul className="space-y-2 text-sm mb-6">
                    <li className="flex items-start gap-2">
                      <ExternalLink className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <a href="#" className="text-blue-600 hover:underline">
                          OpenAI System Card for GPT-4o (2024)
                        </a>
                        <p className="text-gray-600 text-xs">Official model efficiency data and benchmarks</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <ExternalLink className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <a href="#" className="text-blue-600 hover:underline">
                          Google Environmental Report 2024
                        </a>
                        <p className="text-gray-600 text-xs">Data center water usage and energy consumption</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <ExternalLink className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <a href="#" className="text-blue-600 hover:underline">
                          Microsoft Environmental Sustainability Report 2024
                        </a>
                        <p className="text-gray-600 text-xs">Azure data center efficiency and AI workload impacts</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <ExternalLink className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <a href="#" className="text-blue-600 hover:underline">
                          IEA Data Centres and Data Transmission Networks Report (2024)
                        </a>
                        <p className="text-gray-600 text-xs">International Energy Agency analysis of AI infrastructure</p>
                      </div>
                    </li>
                  </ul>

                  <h4 className="font-semibold text-gray-800 mb-3">Supplementary Sources</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <ExternalLink className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <a href="#" className="text-blue-600 hover:underline">
                          Nature: "The carbon footprint of machine learning training will plateau, then shrink" (2022)
                        </a>
                        <p className="text-gray-600 text-xs">Projections on AI energy efficiency improvements</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <ExternalLink className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <a href="#" className="text-blue-600 hover:underline">
                          IEEE Spectrum: "AI's Growing Carbon Footprint" (2023)
                        </a>
                        <p className="text-gray-600 text-xs">Technical analysis of model scaling laws</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <ExternalLink className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <a href="#" className="text-blue-600 hover:underline">
                          Scientific American: "ChatGPT's Energy Use Per Query" (2025)
                        </a>
                        <p className="text-gray-600 text-xs">Popular science coverage of URI study</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <ExternalLink className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <a href="#" className="text-blue-600 hover:underline">
                          Fast Company: "The Hidden Environmental Cost of AI" (2025)
                        </a>
                        <p className="text-gray-600 text-xs">Industry perspective on sustainability</p>
                      </div>
                    </li>
                  </ul>
                  
                  <div className="mt-4 p-3 bg-yellow-50 rounded border border-yellow-200">
                    <p className="text-xs text-yellow-800">
                      <strong>Note:</strong> Energy consumption data for proprietary models is often estimated based on published benchmarks, 
                      scaling laws, and provider efficiency statements. Direct measurements are rarely disclosed by providers.
                    </p>
                  </div>
                </div>
              </section>
            </div>

            {/* Call to Action */}
            <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-8 text-white text-center">
              <h3 className="text-2xl font-semibold mb-4">Ready to Calculate Your AI Carbon Footprint?</h3>
              <p className="mb-6">Use our calculator to estimate your environmental impact and offset your AI usage.</p>
              <button
                onClick={() => navigate('/')}
                className="bg-white text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Calculate Your Impact
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}