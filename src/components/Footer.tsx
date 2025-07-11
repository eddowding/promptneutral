import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <img 
                src="/430xlogo.png" 
                alt="430xAI Logo" 
                className="w-10 h-10"
              />
              <span className="text-xl font-bold">430xAI</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              AI savings → Climate impact. Turn your AI cost savings into planetary-scale restoration projects.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/why-430x" className="hover:text-white transition-colors">Why 430x</Link></li>
              <li><Link to="/research" className="hover:text-white transition-colors">Research</Link></li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-gray-400 text-sm">
            © 2024 430xAI. All rights reserved.
          </p>
          <div className="flex items-center space-x-6 mt-4 md:mt-0">
            <Link to="/" className="text-gray-400 hover:text-white transition-colors text-sm">
              Privacy Policy
            </Link>
            <Link to="/" className="text-gray-400 hover:text-white transition-colors text-sm">
              Terms of Service
            </Link>
            <Link to="/" className="text-gray-400 hover:text-white transition-colors text-sm">
              Status Page
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};