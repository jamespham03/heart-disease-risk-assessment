import { Heart, AlertTriangle } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-primary-600 p-2 rounded-lg">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">HealthyHeart</span>
            </div>
            <p className="text-sm">
              Machine learning-powered heart disease risk assessment tool providing personalized 
              recommendations based on advanced clinical data analysis.
            </p>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/" className="hover:text-white transition-colors">Home</a></li>
              <li><a href="/assessment" className="hover:text-white transition-colors">Take Assessment</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Heart Health Guide</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Understanding Risk Factors</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact Support</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex items-start gap-3 p-4 bg-gray-800 rounded-lg mb-6">
            <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-gray-400">
              <strong className="text-gray-300">Medical Disclaimer:</strong> This tool is for informational 
              purposes only and does not constitute medical advice, diagnosis, or treatment. Always consult 
              with qualified healthcare professionals for medical concerns. In case of emergency, call your 
              local emergency services immediately.
            </p>
          </div>
          
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} HeartCheck. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
