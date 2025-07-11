import React from 'react';
import { Navigation } from '../components/Navigation';
import { Footer } from '../components/Footer';
import { TreePine, Globe, TrendingUp, Info } from 'lucide-react';

export function Why430xPage() {
  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <h1 className="text-4xl font-bold text-center mb-8 text-primary">Why 430x?</h1>
          
          <div className="space-y-8">
            {/* We're at 430ppm CO₂ */}
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Globe className="h-6 w-6 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-primary">We're at 430ppm CO₂</h2>
              </div>
              <p className="text-lg text-neutral-dark mb-4">
                Earth's atmosphere is about 430ppm CO₂. AI emissions are individually tiny, but cumulatively ENORMOUS. 
                And since we're at an inflection point with both AI and climate, let's use this opportunity to invest 
                some of the savings that you've made by using AI into planetary-scale restoration projects.
              </p>
            </div>

            {/* Less than you think */}
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Info className="h-6 w-6 text-yellow-600" />
                </div>
                <h2 className="text-2xl font-bold text-primary">Less than you think, still not enough</h2>
              </div>
              <p className="text-lg text-neutral-dark mb-4">
                Most people overestimate AI offset costs by 500x-10,000x. If you offset 430x that's ~10% of your AI spend - 
                far less than most initial guesses, yet enough to make a massive impact to climate restoration projects around the world.
              </p>
            </div>

            {/* Beyond neutral */}
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-primary">Beyond neutral to climate positive</h2>
              </div>
              <p className="text-lg text-neutral-dark mb-4">
                We're suggesting 430x because we need to remove <strong>at least 70 to 220 Gt of CO₂</strong> from the atmosphere 
                between now and 2050, even with the fastest feasible emissions reductions. Join the movement of companies 
                going beyond neutrality to reverse climate change.
              </p>
            </div>

            {/* Detailed Information */}
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-primary mb-6">How Many Gigatonnes of Historic Emissions Must Be Removed by 2050?</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3">Cumulative Historic Emissions</h3>
                  <ul className="list-disc pl-6 space-y-2 text-neutral-dark">
                    <li>Since 1850, human activity has emitted approximately <strong>2,650 gigatonnes (Gt) of CO₂</strong> into the atmosphere</li>
                    <li>About <strong>1,050 Gt</strong> of that CO₂ remains in the atmosphere after natural absorption by oceans and land</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">Carbon Removal Needed by 2050</h3>
                  <ul className="list-disc pl-6 space-y-2 text-neutral-dark">
                    <li>To limit global warming to 1.5°C, the world will need to remove <strong>at least 70 to 220 Gt of CO₂</strong> from the atmosphere between now and 2050, even with the fastest feasible emissions reductions</li>
                    <li>Other credible estimates for required carbon removal by 2050 range from <strong>6 to 10 Gt per year</strong> by mid-century, totaling <strong>~150–250 Gt</strong> over 25 years</li>
                    <li>These targets are based on scenarios that combine rapid decarbonization with carbon removal to address "residual" emissions and to actively draw down historic emissions</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">Summary Table</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Estimate Source
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total CO₂ to Remove by 2050 (Gt)
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Notes
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            Energy Transitions Commission
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                            70–220
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            For 1.5°C pathway, cumulative 2020–2050
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            Carbon Direct
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                            10 Gt/year by 2050
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            Implies ~150–250 Gt cumulative by 2050
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            Carbonfuture/IPCC
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                            6–10 Gt/year by 2050
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            Implies ~150–250 Gt cumulative by 2050
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">Key Points</h3>
                  <ul className="list-disc pl-6 space-y-2 text-neutral-dark">
                    <li><strong>At least 70–220 Gt of CO₂</strong> must be removed from the atmosphere by 2050 to meet climate targets and address historic emissions</li>
                    <li>This is a global effort requiring both natural and engineered carbon removal solutions</li>
                    <li>The scale of removal required is unprecedented, demanding rapid innovation and deployment across sectors</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">Context</h3>
                  <ul className="list-disc pl-6 space-y-2 text-neutral-dark">
                    <li>These numbers reflect the need to not only reach net zero for ongoing emissions but also to actively reverse some of the historic CO₂ accumulation to stabilize the climate</li>
                    <li>The exact amount will depend on the success of emissions reductions and the pace of global decarbonization</li>
                  </ul>
                </div>

                <div className="bg-blue-50 rounded-lg p-6 mt-6">
                  <p className="text-lg font-semibold text-primary">
                    In summary: To meet global climate goals and address historic emissions, the world must remove between 
                    70 and 220 gigatonnes of CO₂ from the atmosphere by 2050, with higher estimates reflecting slower 
                    decarbonization or more ambitious climate targets.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}