import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Heart, MessageSquare, RotateCcw, Download, Share2, AlertTriangle, CheckCircle, AlertCircle, Printer } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import Button from '../components/common/Button'
import Card from '../components/common/Card'

interface ResultData {
  prediction: number
  confidence: number
  probabilities: {
    '0': number
    '1': number
    '2': number
  }
  risk_category: string
  risk_color: string
  action_items: string[]
}

const riskLabels: Record<number, string> = {
  0: 'No Disease',
  1: 'Mild-Moderate',
  2: 'Severe-Critical',
}

const riskIcons: Record<number, React.ReactNode> = {
  0: <CheckCircle className="h-8 w-8" />,
  1: <AlertCircle className="h-8 w-8" />,
  2: <AlertTriangle className="h-8 w-8" />,
}

const riskDescriptions: Record<number, string> = {
  0: 'Great news! Your assessment indicates no significant heart disease risk. Continue maintaining a healthy lifestyle with regular exercise and a balanced diet.',
  1: 'Your assessment indicates mild to moderate heart disease risk. Some risk factors have been identified that warrant attention. Consider consulting a healthcare provider.',
  2: 'URGENT: Your assessment indicates severe heart disease risk. Immediate medical attention is strongly recommended. Please consult a cardiologist as soon as possible.',
}

export default function Results() {
  const navigate = useNavigate()
  const [results, setResults] = useState<ResultData | null>(null)

  useEffect(() => {
    const storedResults = sessionStorage.getItem('assessmentResult')
    if (storedResults) {
      setResults(JSON.parse(storedResults))
    } else {
      navigate('/assessment')
    }
  }, [navigate])

  if (!results) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Heart className="h-12 w-12 text-primary-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading your results...</p>
        </div>
      </div>
    )
  }

  const chartData = [
    { name: 'No Disease', value: results.probabilities['0'] * 100, color: '#4CAF50' },
    { name: 'Mild-Moderate', value: results.probabilities['1'] * 100, color: '#FF9800' },
    { name: 'Severe', value: results.probabilities['2'] * 100, color: '#E91E63' },
  ]

  const handlePrint = () => {
    window.print()
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Heart Disease Risk Assessment Results',
          text: `My heart disease risk assessment: ${results.risk_category} (${Math.round(results.confidence * 100)}% confidence)`,
          url: window.location.href,
        })
      } catch (error) {
        console.log('Share cancelled or failed')
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  const handleStartChat = () => {
    navigate('/chat')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 print:py-4 print:bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 print:mb-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Assessment Results</h1>
          <p className="text-gray-600">
            Based on the clinical data you provided, here are your personalized results.
          </p>
        </div>

        <Card 
          className="mb-6 print:shadow-none print:border"
          style={{ borderTop: `4px solid ${results.risk_color}` }}
        >
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div 
              className="w-24 h-24 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${results.risk_color}20`, color: results.risk_color }}
            >
              {riskIcons[results.prediction]}
            </div>
            
            <div className="flex-grow text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                <span 
                  className="inline-flex items-center px-4 py-1.5 rounded-full text-white text-sm font-semibold"
                  style={{ backgroundColor: results.risk_color }}
                >
                  {results.risk_category}
                </span>
                <span className="text-gray-500 text-sm">
                  {Math.round(results.confidence * 100)}% confidence
                </span>
              </div>
              <p className="text-gray-600 leading-relaxed">
                {riskDescriptions[results.prediction]}
              </p>
            </div>
          </div>
        </Card>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Card className="print:shadow-none print:border">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Risk Distribution</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, value }) => `${Math.round(value)}%`}
                    labelLine={false}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => `${value.toFixed(1)}%`}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="print:shadow-none print:border">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Probability Breakdown</h2>
            <div className="space-y-4">
              {chartData.map((item, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{item.name}</span>
                    <span className="text-sm font-semibold" style={{ color: item.color }}>
                      {item.value.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${item.value}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card className="mb-6 print:shadow-none print:border">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary-600" />
            Recommended Actions
          </h2>
          <ul className="space-y-3">
            {results.action_items.map((item, index) => (
              <li key={index} className="flex items-start gap-3">
                <span 
                  className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5"
                  style={{ backgroundColor: results.risk_color }}
                >
                  {index + 1}
                </span>
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="mb-8 bg-primary-50 border border-primary-200 print:hidden">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex-shrink-0">
              <div className="w-14 h-14 bg-primary-600 rounded-full flex items-center justify-center">
                <MessageSquare className="h-7 w-7 text-white" />
              </div>
            </div>
            <div className="flex-grow text-center md:text-left">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Have Questions About Your Results?
              </h3>
              <p className="text-gray-600 text-sm">
                Chat with our AI health assistant to better understand your results and get 
                personalized guidance on next steps.
              </p>
            </div>
            <div className="flex-shrink-0">
              <Button onClick={handleStartChat} rightIcon={<MessageSquare className="h-4 w-4" />}>
                Chat with AI Assistant
              </Button>
            </div>
          </div>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4 justify-center print:hidden">
          <Button 
            variant="outline" 
            onClick={() => navigate('/assessment')}
            leftIcon={<RotateCcw className="h-4 w-4" />}
          >
            Take New Assessment
          </Button>
          <Button 
            variant="secondary" 
            onClick={handlePrint}
            leftIcon={<Printer className="h-4 w-4" />}
          >
            Print Results
          </Button>
          <Button 
            variant="secondary" 
            onClick={handleShare}
            leftIcon={<Share2 className="h-4 w-4" />}
          >
            Share Results
          </Button>
        </div>

        <Card className="mt-8 border-l-4 border-l-warning print:shadow-none print:border">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-600">
              <p className="font-medium text-gray-900 mb-1">Medical Disclaimer</p>
              <p>
                This assessment is for informational purposes only and does not constitute medical 
                advice, diagnosis, or treatment. The results are based on statistical models and 
                should not replace professional medical consultation. Always consult with a qualified 
                healthcare provider for proper diagnosis and treatment. In case of emergency, call 
                your local emergency services immediately.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
