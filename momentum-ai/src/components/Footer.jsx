import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-slate-900 text-slate-400 py-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-semibold mb-4">Momentum AI</h3>
            <p className="text-sm">Empowering creators with AI-driven content tools to streamline workflows and maximize impact.</p>
          </div>
          <div>
            <h4 className="text-white font-medium mb-4">Product</h4>
            <ul className="space-y-2">
              <li><Link to="/features" className="hover:text-white transition-colors">Features</Link></li>
              <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              <li><Link to="/templates" className="hover:text-white transition-colors">Templates</Link></li>
              <li><Link to="/integrations" className="hover:text-white transition-colors">Integrations</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-medium mb-4">Resources</h4>
            <ul className="space-y-2">
              <li><Link to="/blog" className="hover:text-white transition-colors">Blog</Link></li>
              <li><Link to="/documentation" className="hover:text-white transition-colors">Documentation</Link></li>
              <li><Link to="/tutorials" className="hover:text-white transition-colors">Tutorials</Link></li>
              <li><Link to="/support" className="hover:text-white transition-colors">Support</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-medium mb-4">Company</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/careers" className="hover:text-white transition-colors">Careers</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-slate-800 text-sm text-center">
          <p>© {currentYear} Momentum AI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
