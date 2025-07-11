import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Footer } from '../components/Footer';
import { useCurrency } from '../contexts/CurrencyContext';
import { 
  Check, 
  X, 
  Award,
  Leaf,
  ChevronDown,
  ChevronUp,
  Globe,
  Heart,
  Coffee,
  ArrowRight
} from 'lucide-react';

interface PricingTier {
  name: string;
  price: string;
  period: string;
  description: string;
  highlight?: boolean;
  features: { text: string; included: boolean }[];
  cta: string;
  badge?: string;
}

interface CarbonProject {
  name: string;
  location: string;
  type: string;
  pricePerTon: number;
  certification: string;
  description: string;
  impact: string;
}

export const PricingPage: React.FC = () => {
  const { currency } = useCurrency();
  const [apiCalls, setApiCalls] = useState(50000);
  const [selectedProject, setSelectedProject] = useState(0);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  
  const individualPrice = `${currency.symbol}5`;

  const pricingTiers: PricingTier[] = [
    {
      name: "Starter",
      price: "Free",
      period: "forever",
      description: "Perfect for individuals and small projects getting started with AI carbon neutrality",
      features: [
        { text: "Up to 1,000 API calls/month", included: true },
        { text: "Basic carbon footprint dashboard", included: true },
        { text: "Email support", included: true },
        { text: "Standard carbon credit projects", included: true },
        { text: "Monthly sustainability reports", included: true },
        { text: "API integration", included: true },
        { text: "Advanced analytics", included: false },
        { text: "Priority support", included: false },
        { text: "White-label solution", included: false },
        { text: "Dedicated account manager", included: false }
      ],
      cta: "Start Free"
    },
    {
      name: "Professional",
      price: "$49",
      period: "per month",
      description: "Ideal for growing businesses that need comprehensive carbon neutrality management",
      highlight: true,
      badge: "Most Popular",
      features: [
        { text: "Up to 100,000 API calls/month", included: true },
        { text: "Advanced analytics dashboard", included: true },
        { text: "Priority email & chat support", included: true },
        { text: "Premium carbon credit projects", included: true },
        { text: "Real-time compliance monitoring", included: true },
        { text: "Custom reporting & exports", included: true },
        { text: "Team collaboration tools", included: true },
        { text: "API rate limit optimization", included: true },
        { text: "Advanced carbon project selection", included: true },
        { text: "White-label solution", included: false },
        { text: "Dedicated account manager", included: false }
      ],
      cta: "Start 14-Day Free Trial"
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "contact us",
      description: "For large organizations requiring unlimited scale and custom solutions",
      features: [
        { text: "Unlimited API calls", included: true },
        { text: "White-label dashboard solution", included: true },
        { text: "Dedicated account manager", included: true },
        { text: "Custom carbon credit portfolios", included: true },
        { text: "Advanced compliance automation", included: true },
        { text: "Custom integrations & APIs", included: true },
        { text: "24/7 phone & email support", included: true },
        { text: "SLA guarantees", included: true },
        { text: "Custom reporting & analytics", included: true },
        { text: "Multi-region deployment", included: true },
        { text: "Custom contract terms", included: true }
      ],
      cta: "Contact Sales"
    }
  ];

  const carbonProjects: CarbonProject[] = [
    {
      name: "Amazon Rainforest Conservation",
      location: "Brazil",
      type: "Forest Protection",
      pricePerTon: 12,
      certification: "Verra VCS",
      description: "Protecting 50,000 hectares of pristine Amazon rainforest",
      impact: "Biodiversity protection, indigenous community support"
    },
    {
      name: "Wind Farm Development",
      location: "Texas, USA",
      type: "Renewable Energy",
      pricePerTon: 15,
      certification: "Gold Standard",
      description: "300MW wind farm generating clean electricity",
      impact: "Renewable energy generation, job creation"
    },
    {
      name: "Cookstove Distribution",
      location: "Kenya",
      type: "Clean Technology",
      pricePerTon: 18,
      certification: "Gold Standard",
      description: "Distributing efficient cookstoves to rural communities",
      impact: "Health improvements, deforestation reduction"
    },
    {
      name: "Soil Carbon Sequestration",
      location: "Australia",
      type: "Agriculture",
      pricePerTon: 22,
      certification: "Verra VCS",
      description: "Regenerative agriculture practices storing carbon in soil",
      impact: "Soil health improvement, farmer income increase"
    }
  ];

  const faqs = [
    {
      question: "How is carbon footprint calculated for AI usage?",
      answer: "We use scientifically validated methodologies that account for energy consumption across the entire AI infrastructure stack, including training, inference, data centers, and cooling systems. Our calculations are based on real-time energy grid carbon intensity and are verified by third-party auditors."
    },
    {
      question: "What types of carbon credits do you retire?",
      answer: "We only work with verified carbon credits from Gold Standard and Verra (VCS) certified projects. These include reforestation, renewable energy, methane capture, and clean technology projects. All credits are additional, permanent, and regularly audited."
    },
    {
      question: "Can I upgrade or downgrade my plan at any time?",
      answer: "Yes, you can change your plan at any time. Upgrades take effect immediately, while downgrades will take effect at the start of your next billing cycle. We'll prorate any charges accordingly."
    },
    {
      question: "Do you offer custom pricing for large enterprises?",
      answer: "Absolutely. Our Enterprise plan includes custom pricing based on your specific needs, usage patterns, and requirements. Contact our sales team for a personalized quote and demo."
    },
    {
      question: "How do you ensure compliance with environmental regulations?",
      answer: "Our platform is designed to meet EU Green Claims Directive requirements and other international standards. We provide automated compliance reporting, audit trails, and all necessary documentation for regulatory compliance."
    },
    {
      question: "What happens if I exceed my API call limit?",
      answer: "For the Starter plan, additional calls are temporarily suspended until the next month. Professional plan users can purchase additional capacity at $0.50 per 1,000 calls. Enterprise customers have unlimited usage included."
    }
  ];

  const calculateCost = () => {
    const baseCost = apiCalls <= 1000 ? 0 : apiCalls <= 100000 ? 49 : 0;
    const additionalCallCost = apiCalls > 100000 ? ((apiCalls - 100000) / 1000) * 0.5 : 0;
    const carbonCost = (apiCalls * 0.0001 * carbonProjects[selectedProject].pricePerTon);
    return { baseCost, carbonCost, total: baseCost + additionalCallCost + carbonCost };
  };

  const costs = calculateCost();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-8">
              <Award className="w-4 h-4 mr-2" />
              Transparent, Usage-Based Pricing
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Simple Pricing for
              <span className="text-green-600"> Carbon Neutral</span>
              <br />AI Operations
            </h1>
            
            <p className="text-xl text-gray-600 mb-10 leading-relaxed">
              Pay only for what you use. No hidden fees, no setup costs. 
              Carbon credits included in all plans with full transparency and verified impact.
            </p>
          </div>
        </div>
      </section>

      {/* Individual Plans Section */}
      <section className="py-16 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="lg:w-1/2">
              <div className="flex items-center gap-3 mb-4">
                <Heart className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-blue-900">For Individuals</h2>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Simple AI Carbon Offsets
              </h3>
              <p className="text-lg text-gray-600 mb-6">
                Personal subscriptions for guilt-free AI usage. Choose the services you use 
                and we'll offset your carbon footprint automatically.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-700">Per-service subscriptions starting at {individualPrice}/month</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-700">OpenAI, Claude, Google AI, and more</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-700">No tracking or complex setup</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-700">Cancel anytime</span>
                </div>
              </div>
              <Link 
                to="/individual-plans"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                <Coffee className="w-5 h-5" />
                Get Personal Plan
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="lg:w-1/2">
              <div className="bg-white rounded-2xl p-8 shadow-xl border border-blue-200">
                <div className="text-center mb-6">
                  <div className="text-3xl mb-4">🤖❤️🌱</div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Popular Individual Services</h4>
                  <p className="text-gray-600">Choose what you use, pay per service</p>
                </div>
                
                <div className="space-y-4">
                  {[
                    { name: 'OpenAI (ChatGPT, GPT-4)', icon: '🤖' },
                    { name: 'Claude (Anthropic)', icon: '🧠' },
                    { name: 'Google AI (Gemini)', icon: '🔍' },
                    { name: 'Microsoft AI (Copilot)', icon: '💼' }
                  ].map((service, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{service.icon}</span>
                        <span className="font-medium text-gray-900">{service.name}</span>
                      </div>
                      <span className="text-blue-600 font-semibold">{individualPrice}/mo</span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg">
                  <p className="text-center text-sm text-blue-800">
                    <strong>Example:</strong> Use ChatGPT + Claude = {currency.symbol}10/month total
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Business Plans Divider */}
      <section className="py-12 bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Business Plans</h2>
          <p className="text-xl text-gray-600">
            For companies with AI API usage that need detailed tracking and compliance
          </p>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {pricingTiers.map((tier) => (
              <div 
                key={tier.name}
                className={`relative bg-white rounded-2xl border-2 p-8 ${
                  tier.highlight 
                    ? 'border-green-500 shadow-2xl scale-105' 
                    : 'border-gray-200 shadow-lg'
                }`}
              >
                {tier.badge && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-full text-sm font-medium">
                      {tier.badge}
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">{tier.price}</span>
                    {tier.price !== "Free" && tier.price !== "Custom" && (
                      <span className="text-gray-500 ml-2">/{tier.period}</span>
                    )}
                    {tier.price === "Free" && (
                      <span className="text-gray-500 ml-2">{tier.period}</span>
                    )}
                  </div>
                  <p className="text-gray-600">{tier.description}</p>
                </div>

                <ul className="space-y-4 mb-8">
                  {tier.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      {feature.included ? (
                        <Check className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                      ) : (
                        <X className="w-5 h-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                      )}
                      <span className={feature.included ? 'text-gray-900' : 'text-gray-400'}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <button 
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                    tier.highlight
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {tier.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Feature Comparison</h2>
            <p className="text-xl text-gray-600">Compare all features across our pricing tiers</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Features</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Starter</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 bg-green-50">Professional</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Enterprise</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {[
                    { feature: "Monthly API Calls", starter: "1,000", professional: "100,000", enterprise: "Unlimited" },
                    { feature: "Real-time Dashboard", starter: true, professional: true, enterprise: true },
                    { feature: "Carbon Credit Retirement", starter: true, professional: true, enterprise: true },
                    { feature: "Compliance Reporting", starter: "Basic", professional: "Advanced", enterprise: "Custom" },
                    { feature: "Support Level", starter: "Email", professional: "Priority", enterprise: "24/7 Phone" },
                    { feature: "Team Members", starter: "1", professional: "10", enterprise: "Unlimited" },
                    { feature: "API Integration", starter: true, professional: true, enterprise: true },
                    { feature: "Custom Branding", starter: false, professional: false, enterprise: true },
                    { feature: "SLA Guarantee", starter: false, professional: false, enterprise: true }
                  ].map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.feature}</td>
                      <td className="px-6 py-4 text-center">
                        {typeof row.starter === 'boolean' ? (
                          row.starter ? <Check className="w-5 h-5 text-green-600 mx-auto" /> : <X className="w-5 h-5 text-gray-400 mx-auto" />
                        ) : (
                          <span className="text-sm text-gray-600">{row.starter}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center bg-green-50">
                        {typeof row.professional === 'boolean' ? (
                          row.professional ? <Check className="w-5 h-5 text-green-600 mx-auto" /> : <X className="w-5 h-5 text-gray-400 mx-auto" />
                        ) : (
                          <span className="text-sm text-gray-600 font-medium">{row.professional}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {typeof row.enterprise === 'boolean' ? (
                          row.enterprise ? <Check className="w-5 h-5 text-green-600 mx-auto" /> : <X className="w-5 h-5 text-gray-400 mx-auto" />
                        ) : (
                          <span className="text-sm text-gray-600">{row.enterprise}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Usage-Based Pricing Calculator */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Pricing Calculator</h2>
            <p className="text-xl text-gray-600">Calculate your monthly cost based on usage and carbon offset preferences</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Configure Your Usage</h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Monthly API Calls
                    </label>
                    <input
                      type="range"
                      min="1000"
                      max="1000000"
                      step="1000"
                      value={apiCalls}
                      onChange={(e) => setApiCalls(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-sm text-gray-500 mt-1">
                      <span>1K</span>
                      <span className="font-medium text-gray-900">{apiCalls.toLocaleString()}</span>
                      <span>1M</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Carbon Offset Project
                    </label>
                    <div className="space-y-3">
                      {carbonProjects.map((project, index) => (
                        <label key={index} className="flex items-start cursor-pointer">
                          <input
                            type="radio"
                            name="project"
                            value={index}
                            checked={selectedProject === index}
                            onChange={() => setSelectedProject(index)}
                            className="mt-1 text-green-600"
                          />
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {project.name} - ${project.pricePerTon}/ton
                            </div>
                            <div className="text-xs text-gray-500">
                              {project.location} • {project.type} • {project.certification}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Monthly Cost Breakdown</h3>
                
                <div className="bg-white rounded-xl p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Platform Subscription</span>
                    <span className="font-semibold">${costs.baseCost}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Carbon Credits</span>
                    <span className="font-semibold">${costs.carbonCost.toFixed(2)}</span>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center text-lg">
                      <span className="font-semibold text-gray-900">Total Monthly Cost</span>
                      <span className="font-bold text-green-600">${costs.total.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4 mt-4">
                    <div className="flex items-center mb-2">
                      <Leaf className="w-5 h-5 text-green-600 mr-2" />
                      <span className="text-sm font-medium text-green-800">Environmental Impact</span>
                    </div>
                    <p className="text-sm text-green-700">
                      Your usage will offset approximately {(apiCalls * 0.0001).toFixed(2)} kg of CO₂ monthly
                      through {carbonProjects[selectedProject].name}.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Carbon Offset Projects */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Carbon Offset Projects</h2>
            <p className="text-xl text-gray-600">Choose from verified, high-impact projects around the world</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {carbonProjects.map((project, index) => (
              <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{project.name}</h3>
                    <div className="flex items-center text-sm text-gray-500 space-x-4">
                      <span className="flex items-center">
                        <Globe className="w-4 h-4 mr-1" />
                        {project.location}
                      </span>
                      <span className="flex items-center">
                        <Award className="w-4 h-4 mr-1" />
                        {project.certification}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">${project.pricePerTon}</div>
                    <div className="text-sm text-gray-500">per ton CO₂</div>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-4">{project.description}</p>
                
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="text-sm font-medium text-green-800 mb-1">Additional Impact</div>
                  <div className="text-sm text-green-700">{project.impact}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">Get answers to common questions about our pricing and plans</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-lg">
                <button
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                >
                  <span className="font-semibold text-gray-900">{faq.question}</span>
                  {expandedFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </button>
                {expandedFaq === index && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-emerald-600">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Your Carbon Neutral Journey?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Join thousands of companies already making their AI operations carbon neutral. 
            Start with our free tier or get a custom quote for your enterprise needs.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <button className="w-full sm:w-auto px-8 py-4 bg-white text-green-600 rounded-lg hover:bg-gray-50 transition-colors text-lg font-semibold">
              Start Free Today
            </button>
            <button className="w-full sm:w-auto px-8 py-4 border-2 border-white text-white rounded-lg hover:bg-white hover:text-green-600 transition-colors text-lg font-semibold">
              Contact Sales
            </button>
          </div>
          <p className="text-green-100 text-sm mt-6">
            No credit card required for free tier • 14-day free trial for Professional • Cancel anytime
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};