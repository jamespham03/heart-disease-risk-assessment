import { Link, useNavigate } from 'react-router-dom';
import { Heart, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const navigate = useNavigate();

  const handleStartAssessment = () => {
    setShowTerms(true);
    setMobileMenuOpen(false);
  };

  const handleAcceptTerms = () => {
    if (termsAccepted) {
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('current_session_id', sessionId);
      setShowTerms(false);
      setTermsAccepted(false);
      navigate('/assessment');
    }
  };

  return (
    <header className="bg-white shadow-sm">
      {/* Top section with logo and CTA button */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto" style={{ padding: '2rem 1rem' }}>
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <Heart className="w-10 h-10 text-blue-600" />
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-gray-900">HeartCare AI</span>
                <span className="text-xs text-gray-500 uppercase tracking-wide">Heart Disease Risk Assessment</span>
              </div>
            </Link>

            {/* CTA Button */}
            <button
              onClick={handleStartAssessment}
              className="hidden md:flex bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors items-center gap-2"
            >
              <Heart className="w-5 h-5" />
              Take Our Heart Health Assessment
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:text-blue-600"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="sticky top-0 z-50 bg-white">
        <div className="container mx-auto px-4">
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center justify-center gap-8 py-4">
            <Link to="/" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
              Home
            </Link>
            <Link to="/assessment" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
              Assessment
            </Link>
            <a href="#about" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
              About
            </a>
            <a href="#contact" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
              Contact
            </a>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <div className="flex flex-col gap-4">
                <Link
                  to="/"
                  className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  to="/assessment"
                  className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Assessment
                </Link>
                <a
                  href="#about"
                  className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About
                </a>
                <a
                  href="#contact"
                  className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Contact
                </a>
                {/* Mobile CTA Button */}
                <button
                  onClick={handleStartAssessment}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-left"
                >
                  Take Our Heart Health Assessment
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Terms Modal */}
      {showTerms && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-8 relative">
            <button
              onClick={() => {
                setShowTerms(false);
                setTermsAccepted(false);
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-bold mb-4">Terms and Conditions</h2>
            <div className="prose prose-sm mb-6">
              <h3 className="text-lg font-semibold mt-4 mb-2">Important Disclaimer</h3>
              <p className="text-gray-700">
                This heart disease risk assessment tool is for informational and educational 
                purposes only. It is NOT a substitute for professional medical advice, diagnosis, 
                or treatment.
              </p>
              
              <h3 className="text-lg font-semibold mt-4 mb-2">Please Note:</h3>
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                <li>Results are predictions based on machine learning models and may not be 100% accurate</li>
                <li>This tool does not diagnose heart disease</li>
                <li>Always consult with qualified healthcare professionals for medical advice</li>
                <li>If you experience chest pain or other serious symptoms, seek emergency care immediately</li>
                <li>Your data is used only for generating your risk assessment</li>
              </ul>
              
              <h3 className="text-lg font-semibold mt-4 mb-2">Data Privacy</h3>
              <p className="text-gray-700">
                We respect your privacy. Your health information is encrypted and stored securely. 
                We do not share your personal health data with third parties.
              </p>
              
              <h3 className="text-lg font-semibold mt-4 mb-2">Consent</h3>
              <p className="text-gray-700">
                By accepting these terms, you acknowledge that you understand the limitations 
                of this tool and that it is not a replacement for medical care.
              </p>
            </div>
            
            <div className="flex items-center mb-6">
              <input
                type="checkbox"
                id="terms-checkbox-header"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="terms-checkbox-header" className="ml-3 text-sm text-gray-700">
                I have read and agree to the terms and conditions
              </label>
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowTerms(false);
                  setTermsAccepted(false);
                }}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAcceptTerms}
                disabled={!termsAccepted}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Accept & Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}