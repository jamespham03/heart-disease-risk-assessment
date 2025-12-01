import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Heart, AlertTriangle, Info, Loader2, CheckCircle, HelpCircle } from 'lucide-react'
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

// Short help text displayed below fields
const fieldDescriptions: Record<string, string> = {
  age: 'Your current age (older age increases heart disease risk)',
  sex: 'Biological sex (men and women have different risk patterns)',
  cp: 'Different types of chest pain indicate different heart conditions',
  exang: 'Chest pain during physical activity is a key warning sign',
  trestbps: 'The force of blood against artery walls when your heart beats (top number only)',
  chol: 'Fatty substance in blood that can clog arteries if too high',
  fbs: 'High blood sugar (diabetes) damages blood vessels and increases heart risk',
  restecg: 'Heart rhythm test that shows electrical activity and potential problems',
  thalch: 'How fast your heart can beat during maximum physical effort',
  oldpeak: 'Measure from stress test showing if heart muscle gets enough blood during exercise',
  slope: 'The direction of a specific line on your stress test results (upsloping is best)',
  ca: 'How many of your main heart arteries have blockages (from specialized X-ray)',
  thal: 'Test showing blood flow to heart muscle (detects areas not getting enough blood)',
}

// Detailed tooltips shown on hover
const fieldTooltips: Record<string, string> = {
  age: 'Enter your current age. Heart disease risk increases with age, especially after 45 for men and 55 for women.',
  sex: 'Select your biological sex as recorded in your medical records. Men and women have different heart disease risk patterns.',
  cp: 'Chest pain type helps identify heart problems. Angina is heart-related chest pressure/tightness that typically occurs during activity. Non-anginal pain is usually sharp and not heart-related. If you have no chest pain, select "Asymptomatic".',
  exang: 'Do you experience chest pain, pressure, or discomfort during physical activities like walking upstairs, exercising, or doing chores? This is an important indicator of heart problems.',
  trestbps: 'Enter only the TOP number from your blood pressure reading (e.g., the "120" in 120/80). This measures the pressure when your heart beats. Normal is around 120 or below. High blood pressure (140+) damages arteries over time. Default if blank: 130 mm Hg (median value).',
  chol: 'Cholesterol is a waxy substance in your blood. Too much can build up in arteries and restrict blood flow to your heart. Measured in mg/dL from a blood test. Desirable level: below 200. High: 240+. Default if blank: 200 mg/dL (median value).',
  fbs: 'Measured after not eating for 8+ hours (usually morning blood test). High blood sugar damages blood vessels and nerves controlling your heart. Normal: below 100 mg/dL. Prediabetes: 100-125. Diabetes: 126+. Select "High" if you have diabetes/prediabetes or levels above 120. Default if blank: Normal (≤120 mg/dL).',
  restecg: 'ECG/EKG is a test where stickers on your chest measure your heart\'s electrical signals. Shows if your heart rhythm is normal or has abnormalities. Takes about 5 minutes. "LV hypertrophy" means thickened heart muscle from working too hard (often from high blood pressure). Default if blank: Normal.',
  thalch: 'From an exercise stress test where you walk/run on a treadmill while monitored. Measures the fastest your heart beat during the test. Lower max heart rates may indicate poor cardiovascular fitness or heart problems. Default if blank: Estimated as 220 minus your age (e.g., 170 bpm for a 50-year-old).',
  oldpeak: 'This measures changes in your heart\'s electrical pattern during exercise compared to rest. From a stress test. Higher numbers mean your heart muscle may not be getting enough oxygen-rich blood during exercise (possible blockage). Measured in millimeters on the ECG printout. Default if blank: 0.0 (assumes no test done).',
  slope: 'From a stress test ECG. Describes the angle/direction of a particular wave pattern at peak exercise. Upsloping (going up) is normal/healthy. Flat may indicate problems. Downsloping (going down) is more concerning and suggests possible heart disease. Default if blank: Upsloping (favorable).',
  ca: 'From a cardiac catheterization/angiogram - a procedure where dye is injected and X-rays show blood flow through heart arteries. The number (0-4) indicates how many major vessels have significant narrowing. 0 = no blockages (best). Higher numbers mean more blockages (worse). This is an invasive test usually only done if heart disease is suspected. Default if blank: 0 (no blockages detected).',
  thal: 'From a nuclear stress test or thallium scan where a small amount of radioactive material is injected to create images of blood flow to your heart muscle. Normal = good blood flow everywhere. Fixed defect = permanent damage/scar (from past heart attack). Reversible defect = area that gets poor blood flow during stress but normal at rest (suggests blockage). Default if blank: Normal (normal blood flow).',
}

// Component for field label with tooltip
const FieldLabel = ({ label, tooltip }: { label: string; tooltip?: string }) => (
  <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
    <span>{label}</span>
    {tooltip && (
      <div className="group relative inline-block">
        <HelpCircle className="h-4 w-4 text-gray-400 hover:text-primary-600 cursor-help" />
        <div className="invisible group-hover:visible absolute z-10 left-0 top-6 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg">
          {tooltip}
          <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
        </div>
      </div>
    )}
  </label>
)

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

        <Card className="mb-6 border-l-4 border-l-blue-500 bg-blue-50">
          <div className="flex items-start gap-4">
            <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-blue-900 mb-1">Quick Note</p>
              <p className="text-blue-800">
                Only <strong>4 fields are required</strong> (age, sex, chest pain type, exercise-induced angina).
                All other fields are optional - if you don't know the values, leave them blank and we'll use sensible defaults.
              </p>
            </div>
          </div>
        </Card>

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
                <FieldLabel label="Age *" tooltip={fieldTooltips.age} />
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
                <FieldLabel label="Sex *" tooltip={fieldTooltips.sex} />
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
                <FieldLabel label="Chest Pain Type *" tooltip={fieldTooltips.cp} />
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
                <FieldLabel label="Exercise-Induced Angina *" tooltip={fieldTooltips.exang} />
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
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">Optional Fields - Skip if Unknown</p>
                    <p>
                      Providing additional clinical data can improve the accuracy of your assessment.
                      If you don't know these values, leave them blank and sensible defaults will be used
                      (e.g., median blood pressure of 130, cholesterol of 200, normal test results).
                    </p>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <FieldLabel label="Resting Blood Pressure" tooltip={fieldTooltips.trestbps} />
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
                    <FieldLabel label="Cholesterol Level" tooltip={fieldTooltips.chol} />
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
                    <FieldLabel label="Fasting Blood Sugar" tooltip={fieldTooltips.fbs} />
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
                    <FieldLabel label="Resting ECG" tooltip={fieldTooltips.restecg} />
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
                    <FieldLabel label="Max Heart Rate" tooltip={fieldTooltips.thalch} />
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
                    <FieldLabel label="ST Depression (Oldpeak)" tooltip={fieldTooltips.oldpeak} />
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
                    <FieldLabel label="ST Slope" tooltip={fieldTooltips.slope} />
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
                    <FieldLabel label="Major Vessels" tooltip={fieldTooltips.ca} />
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
                    <FieldLabel label="Thalassemia" tooltip={fieldTooltips.thal} />
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
