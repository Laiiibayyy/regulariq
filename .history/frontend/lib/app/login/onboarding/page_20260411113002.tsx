'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { business } from '@/lib/api';

const steps = [
  { id: 'type', title: 'Business Type', questions: ['What type of business do you run?'] },
  { id: 'location', title: 'Location', questions: ['Where is your business located?'] },
  { id: 'metrics', title: 'Business Details', questions: ['Tell us about your business'] },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    businessType: '',
    businessName: '',
    location: {
      country: 'USA',
      state: '',
      city: '',
      zipCode: ''
    },
    metrics: {
      employeeCount: 0,
      servesAlcohol: false,
      offersDelivery: false,
      seatingCapacity: 0,
      hasMinorWorkers: false
    }
  });
  const [loading, setLoading] = useState(false);

  const handleNext = () => {
    if (step < 2) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await business.onboarding(formData);
      localStorage.setItem('businessId', response.data.business._id);
      router.push('/dashboard');
    } catch (error) {
      console.error('Onboarding failed:', error);
      alert('Failed to complete onboarding. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {steps.map((s, idx) => (
              <div key={s.id} className="text-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  idx <= step ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  {idx + 1}
                </div>
                <div className="text-xs mt-1">{s.title}</div>
              </div>
            ))}
          </div>
          <div className="h-2 bg-gray-200 rounded">
            <div 
              className="h-2 bg-blue-600 rounded transition-all"
              style={{ width: `${((step + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow p-8">
          {step === 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">What type of business do you run?</h2>
              <div className="space-y-3">
                {['restaurant', 'clinic', 'retail', 'construction'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setFormData({ ...formData, businessType: type })}
                    className={`w-full text-left p-4 border rounded-lg transition ${
                      formData.businessType === type 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="font-medium capitalize">{type}</div>
                    <div className="text-sm text-gray-500">
                      {type === 'restaurant' && 'Includes cafes, food trucks, fast food'}
                      {type === 'clinic' && 'Medical, dental, therapy practices'}
                      {type === 'retail' && 'Stores, shops, boutiques'}
                      {type === 'construction' && 'Contractors, builders, trades'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Where is your business located?</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Business Name</label>
                  <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Your Business Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">State</label>
                  <select
                    value={formData.location.state}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      location: { ...formData.location, state: e.target.value }
                    })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">Select State</option>
                    <option value="CA">California</option>
                    <option value="TX">Texas</option>
                    <option value="NY">New York</option>
                    <option value="FL">Florida</option>
                    <option value="IL">Illinois</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">City</label>
                  <input
                    type="text"
                    value={formData.location.city}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      location: { ...formData.location, city: e.target.value }
                    })}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="City"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Business Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Number of Employees</label>
                  <input
                    type="number"
                    value={formData.metrics.employeeCount}
                    onChange={(e) => setFormData({
                      ...formData,
                      metrics: { ...formData.metrics, employeeCount: parseInt(e.target.value) }
                    })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <label className="flex items-center justify-between p-3 border rounded-lg cursor-pointer">
                  <span>Serves alcohol?</span>
                  <input
                    type="checkbox"
                    checked={formData.metrics.servesAlcohol}
                    onChange={(e) => setFormData({
                      ...formData,
                      metrics: { ...formData.metrics, servesAlcohol: e.target.checked }
                    })}
                    className="w-5 h-5"
                  />
                </label>
                <label className="flex items-center justify-between p-3 border rounded-lg cursor-pointer">
                  <span>Offers delivery?</span>
                  <input
                    type="checkbox"
                    checked={formData.metrics.offersDelivery}
                    onChange={(e) => setFormData({
                      ...formData,
                      metrics: { ...formData.metrics, offersDelivery: e.target.checked }
                    })}
                    className="w-5 h-5"
                  />
                </label>
              </div>
            </div>
          )}

          <div className="mt-8 flex justify-between">
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Back
              </button>
            )}
            <button
              onClick={handle