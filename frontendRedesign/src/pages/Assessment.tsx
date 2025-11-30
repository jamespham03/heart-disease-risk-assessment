import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Heart, AlertTriangle, Info, Loader2, CheckCircle } from 'lucide-react'
import Button from '../components/common/Button'
import Card from '../components/common/Card'
import Input from '../components/common/Input'
import Select from '../components/common/Select'
import api from '../services/api'
import type { PredictRequest } from '../types'

interface FormData {
  age: string
  sex: string
  cp: string
  exang: string
  trestbps: string
  chol: string
  fbs: string
  restecg: string
  thalch: string
  oldpeak: string
  slope: string
  ca: string
  thal: string
}

const fieldDescriptions: Record<string, string> = {
  age: 'Please enter your current age in years (18-120)',
  sex: 'Select your biological sex as recorded in your medical records',
  cp: 'Describe the type of chest discomfort you experience: Typical angina (pressure/squeezing during activity, relieved by rest), Atypical angina (discomfort that doesn\'t follow a clear pattern), Non-anginal pain (sharp or stabbing, not related to exertion), or Asymptomatic (no chest pain)',
  exang: 'Does physical activity or exercise trigger chest pain or discomfort?',
  trestbps: 'Enter the top/first number from your blood pressure reading (e.g., if your BP is 120/80, enter 120). Measured in mm Hg. Normal range is around 90-120. If you don\'t know, we\'ll use a median value.',
  chol: 'Your total cholesterol from a recent blood test in mg/dL. A desirable level is below 200. If you don\'t know, we\'ll use a median value.',
  fbs: 'Fasting blood sugar measured after not eating for 8+ hours. Normal is below 100 mg/dL. Select "Yes" if you have diabetes, prediabetes, or if your fasting glucose is above 120 mg/dL.',
  restecg: 'ECG results when at rest. Select the category that best describes your resting electrocardiogram findings.',
  thalch: 'The maximum heart rate you achieved during an exercise stress test. Measured in beats per minute. Typical values range from 120-200 depending on age and fitness level.',
  oldpeak: 'ST segment depression observed during exercise compared to at rest. Measured in millimeters. This is often an indicator from an exercise stress test.',
  slope: 'The slope of the ST segment during peak exercise. Select the category: Upsloping (best), Flat, or Downsloping (concerning).',
  ca: 'Number of major blood vessels (0-4) that showed narrowing when colored by fluoroscopy. This is from a coronary angiography procedure.',
  thal: 'Results from a thallium stress test. Select: Normal (no defects), Fixed defect (scar tissue), or Reversible defect (indicates ischemia).',
}

export default function Assessment() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      age: '',
      sex: '',
      cp: '',
      exang: '',
      trestbps: '',
      chol: '',
      fbs: '',
      restecg: '',
      thalch: '',
      oldpeak: '',
      slope: '',
      ca: '',
      thal: '',
    },
  })

  const onSubmit = async (data: FormData) => {
    if (!termsAccepted) {
      alert('Please accept the terms and disclaimer to continue.')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const requestData: PredictRequest = {
        age: parseInt(data.age),
        sex: data.sex,
        cp: data.cp,
        exang: data.exang === 'true',
        ...(data.trestbps && { trestbps: parseInt(data.trestbps) }),
        ...(data.chol && { chol: parseInt(data.chol) }),
        ...(data.fbs && { fbs: data.fbs === 'true' }),
        ...(data.restecg && { restecg: data.restecg }),
        ...(data.thalch && { thalch: parseInt(data.thalch) }),
        ...(data.oldpeak && { oldpeak: parseFloat(data.oldpeak) }),
        ...(data.slope && { slope: data.slope }),
        ...(data.ca && { ca: data.ca }),
        ...(data.thal && { thal: data.thal }),
      }
      
      const result = await api.predict(requestData)
      
      if (result.success && result.data) {
        sessionStorage.setItem('assessmentResult', JSON.stringify(result.data))
        sessionStorage.setItem('assessmentData', JSON.stringify(requestData))
        navigate('/results')
      } else {
        alert(result.error || 'An error occurred. Please try again.')
      }
    } catch (error) {
      console.error('Assessment error:', error)
      alert('An error occurred while processing your assessment. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white overflow-hidden mb-12">
        <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{backgroundImage: "url('/attached_assets/stock_images/professional_medical_295b955c.jpg')"}} />
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 opacity-90" />
        
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 relative">
          <div className="flex items-center gap-2 mb-6 w-fit bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
            <Heart className="h-4 w-4 text-red-400 animate-pulse" />
            <span className="text-sm font-medium">Complete Your Assessment</span>
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
            Heart Disease Risk Assessment
          </h1>
          <p className="text-xl text-primary-100 max-w-2xl">
            Answer the following questions to receive your personalized heart disease risk assessment 
            and recommendations based on machine learning analysis.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        <Card className="mb-6 border-l-4 border-l-warning">
          <div className="flex items-start gap-4">
            <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-gray-900 mb-1">Important Disclaimer</p>
              <p className="text-gray-600">
                This machine learning-based assessment is for informational purposes only and does not replace professional 
                medical advice. Please consult a healthcare provider for proper diagnosis and treatment.
              </p>
            </div>
          </div>
        </Card>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Card className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 text-sm font-bold">1</span>
              Required Information
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-700">Age *</label>
                <Input
                  type="number"
                  placeholder="Enter your age"
                  {...register('age', { 
                    required: 'Age is required',
                    min: { value: 18, message: 'Age must be at least 18' },
                    max: { value: 120, message: 'Age must be less than 120' },
                  })}
                  error={errors.age?.message}
                  helpText={fieldDescriptions.age}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Sex *</label>
                <Select
                  placeholder="Select sex"
                  {...register('sex', { required: 'Sex is required' })}
                  options={[
                    { value: 'male', label: 'Male' },
                    { value: 'female', label: 'Female' },
                  ]}
                  error={errors.sex?.message}
                  helpText={fieldDescriptions.sex}
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700">Chest Pain Type *</label>
                <Select
                  placeholder="Select chest pain type"
                  {...register('cp', { required: 'Chest pain type is required' })}
                  options={[
                    { value: 'asymptomatic', label: 'Asymptomatic (no chest pain)' },
                    { value: 'non-anginal', label: 'Non-Anginal Pain (not related to heart)' },
                    { value: 'atypical angina', label: 'Atypical Angina (unusual heart-related pain)' },
                    { value: 'typical angina', label: 'Typical Angina (classic heart-related pain)' },
                  ]}
                  error={errors.cp?.message}
                  helpText={fieldDescriptions.cp}
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700">Exercise-Induced Angina *</label>
                <Select
                  placeholder="Select option"
                  {...register('exang', { required: 'This field is required' })}
                  options={[
                    { value: 'false', label: 'No - I do not experience chest pain during exercise' },
                    { value: 'true', label: 'Yes - I experience chest pain during exercise' },
                  ]}
                  error={errors.exang?.message}
                  helpText={fieldDescriptions.exang}
                />
              </div>
            </div>
          </Card>

          <Card className="mb-6">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 text-sm font-bold">2</span>
                <span className="text-xl font-semibold text-gray-900">Additional Information</span>
                <span className="text-sm text-gray-500">(Optional)</span>
              </div>
              <div className={`transform transition-transform ${showAdvanced ? 'rotate-180' : ''}`}>
                <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>
            
            {showAdvanced && (
              <div className="mt-6 pt-6 border-t">
                <div className="flex items-start gap-2 mb-6 p-4 bg-blue-50 rounded-lg">
                  <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-800">
                    Providing additional clinical data can improve the accuracy of your assessment. 
                    If you don't know these values, leave them blank and we'll use healthy defaults.
                  </p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Resting Blood Pressure</label>
                    <Input
                      type="number"
                      placeholder="e.g., 120"
                      {...register('trestbps', {
                        min: { value: 70, message: 'Must be at least 70' },
                        max: { value: 250, message: 'Must be less than 250' },
                      })}
                      error={errors.trestbps?.message}
                      helpText={fieldDescriptions.trestbps}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Cholesterol Level</label>
                    <Input
                      type="number"
                      placeholder="e.g., 200"
                      {...register('chol', {
                        min: { value: 100, message: 'Must be at least 100' },
                        max: { value: 600, message: 'Must be less than 600' },
                      })}
                      error={errors.chol?.message}
                      helpText={fieldDescriptions.chol}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Fasting Blood Sugar</label>
                    <Select
                      placeholder="Select option"
                      {...register('fbs')}
                      options={[
                        { value: 'false', label: 'Normal (≤120 mg/dl)' },
                        { value: 'true', label: 'High (>120 mg/dl)' },
                      ]}
                      helpText={fieldDescriptions.fbs}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Resting ECG</label>
                    <Select
                      placeholder="Select option"
                      {...register('restecg')}
                      options={[
                        { value: 'normal', label: 'Normal' },
                        { value: 'st-t abnormality', label: 'ST-T Wave Abnormality' },
                        { value: 'lv hypertrophy', label: 'Left Ventricular Hypertrophy' },
                      ]}
                      helpText={fieldDescriptions.restecg}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Max Heart Rate</label>
                    <Input
                      type="number"
                      placeholder="e.g., 150"
                      {...register('thalch', {
                        min: { value: 60, message: 'Must be at least 60' },
                        max: { value: 220, message: 'Must be less than 220' },
                      })}
                      error={errors.thalch?.message}
                      helpText={fieldDescriptions.thalch}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">ST Depression (Oldpeak)</label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="e.g., 1.5"
                      {...register('oldpeak', {
                        min: { value: 0, message: 'Must be at least 0' },
                        max: { value: 10, message: 'Must be less than 10' },
                      })}
                      error={errors.oldpeak?.message}
                      helpText={fieldDescriptions.oldpeak}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">ST Slope</label>
                    <Select
                      placeholder="Select option"
                      {...register('slope')}
                      options={[
                        { value: 'upsloping', label: 'Upsloping (normal)' },
                        { value: 'flat', label: 'Flat' },
                        { value: 'downsloping', label: 'Downsloping' },
                      ]}
                      helpText={fieldDescriptions.slope}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Major Vessels</label>
                    <Select
                      placeholder="Select option"
                      {...register('ca')}
                      options={[
                        { value: '0.0', label: '0 vessels' },
                        { value: '1.0', label: '1 vessel' },
                        { value: '2.0', label: '2 vessels' },
                        { value: '3.0', label: '3 vessels' },
                        { value: '4.0', label: '4 vessels' },
                      ]}
                      helpText={fieldDescriptions.ca}
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">Thalassemia</label>
                    <Select
                      placeholder="Select option"
                      {...register('thal')}
                      options={[
                        { value: 'normal', label: 'Normal' },
                        { value: 'fixed defect', label: 'Fixed Defect' },
                        { value: 'reversable defect', label: 'Reversible Defect' },
                      ]}
                      helpText={fieldDescriptions.thal}
                    />
                  </div>
                </div>
              </div>
            )}
          </Card>

          <Card className="mb-6">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-1 h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-600">
                I understand that this assessment is for informational purposes only and is not a 
                substitute for professional medical advice, diagnosis, or treatment. I agree to 
                consult with a qualified healthcare provider before making any health-related decisions 
                based on these results.
              </span>
            </label>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting || !termsAccepted}
              isLoading={isSubmitting}
              leftIcon={!isSubmitting ? <CheckCircle className="h-5 w-5" /> : undefined}
            >
              {isSubmitting ? 'Analyzing Your Data...' : 'Get My Results'}
            </Button>
          </div>
          
          {isSubmitting && (
            <div className="mt-6 text-center">
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-primary-50 rounded-lg">
                <Loader2 className="h-5 w-5 text-primary-600 animate-spin" />
                <span className="text-primary-700">
                  Our AI is analyzing your health data...
                </span>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
