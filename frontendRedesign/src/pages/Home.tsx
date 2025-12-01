import { Link } from 'react-router-dom'
import { Heart, Shield, Activity, CheckCircle, ArrowRight, AlertTriangle, Users, Brain, Clock } from 'lucide-react'
import Button from '../components/common/Button'
import Card from '../components/common/Card'

export default function Home() {
  const features = [
    {
      icon: <Brain className="h-8 w-8 text-primary-600" />,
      title: 'ML-Powered Analysis',
      description: 'Our advanced machine learning model analyzes your clinical data to provide accurate risk assessment.',
    },
    {
      icon: <Shield className="h-8 w-8 text-primary-600" />,
      title: 'Privacy First',
      description: 'Your health data is private and never shared. We prioritize your privacy and security.',
    },
    {
      icon: <Activity className="h-8 w-8 text-primary-600" />,
      title: 'Personalized Insights',
      description: 'Receive tailored recommendations based on your unique health profile and risk factors.',
    },
  ]

  const steps = [
    {
      number: 1,
      title: 'Complete Assessment',
      description: 'Answer questions about your health, symptoms, and lifestyle factors.',
    },
    {
      number: 2,
      title: 'Get Your Results',
      description: 'Our machine learning model analyzes your data and provides a comprehensive risk assessment.',
    },
    {
      number: 3,
      title: 'Review Recommendations',
      description: 'Receive personalized action items based on your risk level.',
    },
  ]

  const stats = [
    { value: '3', label: 'Risk Categories' },
    { value: '13', label: 'Clinical Features' },
    { value: 'ML', label: 'Powered Analysis' },
  ]

  return (
    <div>
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDE0di0yaDIyek0zNiAxNHYySDE0di0yaDIyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-20" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                <Heart className="h-4 w-4 text-red-400 animate-pulse" />
                <span className="text-sm font-medium">Demo Assessment Tool</span>
              </div>

              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight mb-6">
                Know Your Heart Health in Minutes
              </h1>
              
              <p className="text-xl text-primary-100 mb-8 leading-relaxed">
                Take our free, machine learning-powered heart disease risk assessment and receive personalized 
                recommendations to protect your cardiovascular health.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/assessment">
                  <Button 
                    size="lg" 
                    className="w-full sm:w-auto bg-white !text-primary-700 hover:!bg-gray-100"
                    rightIcon={<ArrowRight className="h-5 w-5" />}
                  >
                    Start Free Assessment
                  </Button>
                </Link>
                <a href="#how-it-works">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10"
                  >
                    Learn More
                  </Button>
                </a>
              </div>
              
              <div className="flex items-center gap-6 mt-8 text-sm text-primary-200">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Free to use</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>5 minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span>100% Private</span>
                </div>
              </div>
            </div>
            
            <div className="hidden lg:flex justify-center">
              <img 
                src="/attached_assets/stock_images/professional_medical_b36a23d2.jpg"
                alt="Healthcare professional"
                className="rounded-2xl shadow-2xl object-cover w-full h-96 opacity-90 hover:opacity-100 transition-opacity"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-primary-600">{stat.value}</div>
                <div className="text-gray-600 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Key Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A demonstration of how machine learning can be applied to cardiovascular risk assessment,
              providing educational insights about heart health factors.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-xl mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <img 
              src="/attached_assets/stock_images/professional_medical_295b955c.jpg"
              alt="Medical assessment"
              className="rounded-2xl shadow-lg w-full h-96 object-cover mb-8 opacity-90 hover:opacity-100 transition-opacity"
            />
          </div>
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get your personalized heart health assessment in three simple steps.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="w-14 h-14 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-7 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-0.5 bg-primary-200" />
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <Link to="/assessment">
              <Button size="lg" rightIcon={<ArrowRight className="h-5 w-5" />}>
                Start Your Assessment
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-primary-600 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <img 
              src="/attached_assets/stock_images/professional_medical_6b5501db.jpg"
              alt="Healthcare journey"
              className="rounded-2xl shadow-2xl w-full h-96 object-cover opacity-90 hover:opacity-100 transition-opacity"
            />
            <div className="text-center lg:text-left">
              <Users className="h-16 w-16 mx-auto lg:mx-0 mb-6 opacity-80" />
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Take Control of Your Heart Health
              </h2>
              <p className="text-xl text-primary-100 mb-8">
                Understanding your heart disease risk is the first step toward a healthier life.
                Try our demo assessment tool to see how machine learning can analyze cardiovascular health data.
              </p>
              <Link to="/assessment">
                <Button 
                  size="lg" 
                  className="bg-white !text-primary-700 hover:!bg-gray-100"
                  rightIcon={<ArrowRight className="h-5 w-5" />}
                >
                  Get Started Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="border-l-4 border-l-warning">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 text-warning flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Important Notice</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  This is a <strong>demonstration project</strong> for educational purposes only. It is not
                  a medical device and should not be used for actual health assessment or diagnosis.
                  The machine learning model and results are for illustrative purposes to demonstrate the
                  application of ML techniques to cardiovascular data.
                </p>
                <p className="text-gray-600 text-sm leading-relaxed mt-2">
                  For real health concerns, always consult with qualified healthcare professionals.
                  If you think you may have a medical emergency, call your doctor or emergency services immediately.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  )
}
