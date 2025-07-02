import React from 'react';
import { Link } from 'react-router-dom';
import { Footer } from '../components/Footer';
import { 
  Leaf, 
  Zap, 
  Shield, 
  BarChart3, 
  CheckCircle, 
  ArrowRight,
  Play,
  Star,
  Award,
  Globe,
  Users,
  TrendingUp
} from 'lucide-react';

export const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-8">
              <Award className="w-4 h-4 mr-2" />
              EU Green Claims Directive Compliant
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Make Your AI Usage 
              <span className="text-green-600"> Carbon Neutral</span>
              <br />Instantly
            </h1>
            
            <p className="text-xl text-gray-600 mb-10 leading-relaxed">
              Connect to your AI services, calculate real-time carbon impact, and automatically 
              retire verified carbon credits. Get instant, auditable proof of climate action for every prompt.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Link 
                to="/onboarding"
                className="w-full sm:w-auto px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-lg font-semibold text-center"
              >
                Get Started
              </Link>
              <button className="w-full sm:w-auto flex items-center justify-center px-8 py-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-lg font-semibold">
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">99.9%</div>
              <div className="text-gray-600 font-medium">Accuracy</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">&lt;30s</div>
              <div className="text-gray-600 font-medium">Setup Time</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">24/7</div>
              <div className="text-gray-600 font-medium">Monitoring</div>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Carbon Impact Dashboard</h2>
            <p className="text-xl text-gray-600">Real-time monitoring and carbon neutrality management</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Live Dashboard</h3>
              <Link 
                to="/dashboard"
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                <BarChart3 className="w-4 h-4" />
                <span>View Full Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-green-700">Today's Prompts</p>
                    <p className="text-3xl font-bold text-green-900">2,847</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-sm text-green-600">+12% from yesterday</p>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-blue-700">CO₂ Offset (kg)</p>
                    <p className="text-3xl font-bold text-blue-900">15.2</p>
                  </div>
                  <Leaf className="w-8 h-8 text-blue-600" />
                </div>
                <p className="text-sm text-blue-600">100% neutralized</p>
              </div>
              
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-purple-700">Credits Retired</p>
                    <p className="text-3xl font-bold text-purple-900">15.2</p>
                  </div>
                  <Award className="w-8 h-8 text-purple-600" />
                </div>
                <p className="text-sm text-purple-600">Verified by Gold Standard</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Three simple steps to make your AI usage completely carbon neutral</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">1. Connect Your AI Services</h3>
              <p className="text-gray-600">
                Seamlessly integrate with OpenAI, Anthropic, Google, and other major AI providers 
                through our secure API connections.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <BarChart3 className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">2. Real-Time Impact Calculation</h3>
              <p className="text-gray-600">
                Our advanced algorithms calculate precise carbon emissions for every API call, 
                model usage, and computational resource consumed.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">3. Automatic Credit Retirement</h3>
              <p className="text-gray-600">
                Verified carbon credits are automatically purchased and retired in real-time, 
                with immutable proof stored on blockchain ledgers.
              </p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Link 
              to="/pricing"
              className="inline-block px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-lg font-semibold"
            >
              Start Your Free Trial
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Powerful Features</h2>
            <p className="text-xl text-gray-600">
              Everything you need to achieve carbon neutrality with complete transparency
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <BarChart3 className="w-6 h-6" />,
                title: "Real-Time Monitoring",
                description: "Monitor carbon emissions in real-time across all your AI services with millisecond precision tracking."
              },
              {
                icon: <Shield className="w-6 h-6" />,
                title: "Compliance Ready",
                description: "EU Green Claims Directive compliant with automated reporting and audit-ready documentation."
              },
              {
                icon: <Award className="w-6 h-6" />,
                title: "Verified Credits",
                description: "Only Gold Standard and Verra certified credits with full traceability and blockchain verification."
              },
              {
                icon: <TrendingUp className="w-6 h-6" />,
                title: "Advanced Analytics",
                description: "Detailed insights into your carbon footprint with trend analysis and optimization recommendations."
              },
              {
                icon: <Zap className="w-6 h-6" />,
                title: "Easy Integration",
                description: "Simple SDK and API integration with comprehensive documentation and developer support."
              },
              {
                icon: <Users className="w-6 h-6" />,
                title: "Team Management",
                description: "Multi-user dashboard with role-based access controls and team collaboration features."
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 text-green-600">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Trusted by Forward-Thinking Companies</h2>
            <p className="text-xl text-gray-600">Leading organizations choose PromptNeutral for their sustainability goals</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "PromptNeutral made it incredibly easy to achieve carbon neutrality for our AI operations. The real-time tracking gives us complete peace of mind.",
                author: "Sarah Chen",
                role: "Head of Sustainability, TechCorp"
              },
              {
                quote: "The compliance features are outstanding. We're now fully prepared for upcoming regulations with auditable proof of our commitments.",
                author: "Michael Rodriguez",
                role: "CTO, InnovateLabs"
              },
              {
                quote: "Integration was seamless and the insights helped us optimize AI usage while maintaining carbon neutrality. Highly recommended!",
                author: "Emma Thompson",
                role: "CEO, GreenTech Solutions"
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="flex mb-4">
                  {[1,2,3,4,5].map((star) => (
                    <Star key={star} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic">"{testimonial.quote}"</p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.author}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-emerald-600">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Make Your AI Carbon Neutral?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Join thousands of companies already taking climate action. Set up carbon neutrality 
            for your AI operations in less than 30 seconds.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link 
              to="/onboarding"
              className="w-full sm:w-auto inline-block text-center px-8 py-4 bg-white text-green-600 rounded-lg hover:bg-gray-50 transition-colors text-lg font-semibold"
            >
              Get Started - It's Free
            </Link>
            <button className="w-full sm:w-auto px-8 py-4 border-2 border-white text-white rounded-lg hover:bg-white hover:text-green-600 transition-colors text-lg font-semibold">
              Schedule Demo
            </button>
          </div>
          <p className="text-green-100 text-sm mt-6">
            No credit card required • Cancel anytime • EU GDPR compliant
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};