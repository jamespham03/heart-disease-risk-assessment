import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Send, ArrowLeft, Heart, Bot, User, Loader2, RefreshCcw, Info } from 'lucide-react'
import Button from '../components/common/Button'
import Card from '../components/common/Card'
import api from '../services/api'
import type { ChatMessage, ChatSession } from '../types'

export default function Chat() {
  const navigate = useNavigate()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [session, setSession] = useState<ChatSession | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    initializeChat()
  }, [])

  const initializeChat = async () => {
    try {
      const storedResults = sessionStorage.getItem('assessmentResult')
      if (!storedResults) {
        navigate('/assessment')
        return
      }

      setIsLoading(true)
      const newSession = await api.createChatSession(1)
      setSession(newSession)
      
      const history = await api.getChatHistory(newSession.session_token)
      setMessages(history.messages)
    } catch (error) {
      console.error('Failed to initialize chat:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault()
    
    if (!inputValue.trim() || !session || isLoading) return

    const userMessage = inputValue.trim()
    setInputValue('')
    
    const tempUserMessage: ChatMessage = {
      id: Date.now(),
      role: 'user',
      content: userMessage,
      created_at: new Date().toISOString(),
      references_prediction: false,
      references_assessment_data: false,
    }
    setMessages(prev => [...prev, tempUserMessage])

    setIsLoading(true)
    try {
      const response = await api.sendChatMessage(session.session_token, userMessage)
      const history = await api.getChatHistory(session.session_token)
      setMessages(history.messages)
    } catch (error) {
      console.error('Failed to send message:', error)
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          content: 'I apologize, but I encountered an error. Please try again.',
          created_at: new Date().toISOString(),
          references_prediction: false,
          references_assessment_data: false,
        },
      ])
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  const quickQuestions = [
    'What does my risk level mean?',
    'How can I lower my cholesterol?',
    'What exercises are good for heart health?',
    'Should I see a cardiologist?',
    'What diet is best for my heart?',
  ]

  const handleQuickQuestion = (question: string) => {
    setInputValue(question)
    inputRef.current?.focus()
  }

  const formatMessage = (content: string) => {
    const lines = content.split('\n')
    return lines.map((line, index) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={index} className="font-semibold text-gray-900 mt-3 mb-1">{line.replace(/\*\*/g, '')}</p>
      }
      if (line.startsWith('• ') || line.startsWith('- ')) {
        return <li key={index} className="ml-4 text-gray-700">{line.replace(/^[•-]\s/, '')}</li>
      }
      if (line.match(/^\d+\.\s/)) {
        return <li key={index} className="ml-4 text-gray-700">{line}</li>
      }
      if (line.startsWith('🚨') || line.startsWith('✅') || line.startsWith('❌')) {
        return <p key={index} className="my-1">{line}</p>
      }
      if (line.trim() === '') {
        return <br key={index} />
      }
      return <p key={index} className="text-gray-700">{line}</p>
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/results')}
                leftIcon={<ArrowLeft className="h-4 w-4" />}
              >
                Back to Results
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <Bot className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <h1 className="font-semibold text-gray-900">Heart Health Assistant</h1>
                <p className="text-xs text-gray-500">AI-powered guidance</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={initializeChat}
              leftIcon={<RefreshCcw className="h-4 w-4" />}
            >
              New Chat
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-grow overflow-hidden">
        <div className="max-w-4xl mx-auto h-full flex flex-col">
          <div className="flex-grow overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
            {messages.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-primary-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Welcome to Heart Health Chat
                </h2>
                <p className="text-gray-600 max-w-md mx-auto">
                  Ask me anything about your assessment results, heart health, or lifestyle 
                  recommendations.
                </p>
              </div>
            )}

            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-3 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === 'user' 
                        ? 'bg-primary-600' 
                        : 'bg-gray-100'
                    }`}>
                      {message.role === 'user' 
                        ? <User className="h-4 w-4 text-white" />
                        : <Bot className="h-4 w-4 text-gray-600" />
                      }
                    </div>
                    <div className={`rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-primary-600 text-white rounded-tr-sm'
                        : 'bg-white shadow-sm border rounded-tl-sm'
                    }`}>
                      {message.role === 'user' ? (
                        <p>{message.content}</p>
                      ) : (
                        <div className="markdown-content">
                          {formatMessage(message.content)}
                        </div>
                      )}
                      {(message.references_prediction || message.references_assessment_data) && (
                        <div className="mt-2 pt-2 border-t border-gray-100 flex items-center gap-1 text-xs text-gray-500">
                          <Info className="h-3 w-3" />
                          <span>Based on your assessment data</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex gap-3 max-w-[85%]">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="bg-white shadow-sm border rounded-2xl rounded-tl-sm px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-primary-600" />
                        <span className="text-gray-500">Thinking...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="border-t bg-white px-4 sm:px-6 lg:px-8 py-4">
            {messages.length < 3 && (
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-2">Quick questions:</p>
                <div className="flex flex-wrap gap-2">
                  {quickQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickQuestion(question)}
                      className="text-sm px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <form onSubmit={handleSendMessage} className="flex gap-3">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask a question about your heart health..."
                className="flex-grow px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                disabled={isLoading}
              />
              <Button 
                type="submit" 
                disabled={!inputValue.trim() || isLoading}
                className="px-6"
              >
                <Send className="h-5 w-5" />
              </Button>
            </form>
            
            <p className="text-xs text-gray-500 mt-3 text-center">
              This AI assistant provides general health information only. Always consult a healthcare 
              professional for medical advice.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
