'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { businessAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    businessType: '',
    businessName: '',
    location: {
      state: '',
      city: '',
    },
    metrics: {
      employeeCount: 0,
      servesAlcohol: false,
    },
  });

  const steps = [
    { title: 'Business Type', emoji: '🏢' },
    { title: 'Location', emoji: '📍' },
    { title: 'Details', emoji: '📊' },
  ];

  const nextStep = () => {
    if (step === 0 && !formData.businessType) {
      toast.error('Please select a business type');
      return;
    }
    if (step === 1 && (!formData.location.state || !formData.location.city)) {
      toast.error('Please enter your location');
      return;
    }
    if (step < 2) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const prevStep = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await businessAPI.onboarding(formData);
      toast.success('Onboarding completed!');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Onboarding failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {steps.map((s, idx) => (
              <div
                key={idx}
                className={`text-center flex-1 ${
                  idx <= step ? 'text-blue-600' : 'text-gray-400'
                }`}
              >
                <div className="text-2xl mb-1">{s.emoji}</div>
                <div className="text-sm">{s.title}</div>
              </div>
            ))}
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${((step + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {step === 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">What type of business do you run?</h2>
              <div className="grid gap-4">
                {['restaurant', 'clinic', 'retail', 'construction'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setFormData({ ...formData, businessType: type })}
                    className={`p-4 border rounded-lg text-left transition ${
                      formData.businessType === type
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="font-semibold capitalize">{type}</div>
                    <div className="text-sm text-gray-500">
                      {type === 'restaurant' && 'Restaurants, cafes, food trucks'}
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
                    required
                    value={formData.businessName}
                    onChange={(e) =>
                      setFormData({ ...formData, businessName: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Your Business Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">State</label>
                  <select
                    value={formData.location.state}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        location: { ...formData.location, state: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    required
                    value={formData.location.city}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        location: { ...formData.location, city: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="City Name"
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
                  <label className="block text-sm font-medium mb-1">
                    Number of Employees
                  </label>
                  <input
                    type="number"
                    value={formData.metrics.employeeCount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        metrics: {
                          ...formData.metrics,
                          employeeCount: parseInt(e.target.value),
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
                <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer">
                  <span>Do you serve alcohol?</span>
                  <input
                    type="checkbox"
                    checked={formData.metrics.servesAlcohol}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        metrics: {
                          ...formData.metrics,
                          servesAlcohol: e.target.checked,
                        },
                      })
                    }
                    className="w-5 h-5 text-blue-600"
                  />
                </label>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8">
            {step > 0 && (
              <button
                onClick={prevStep}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Back
              </button>
            )}
            <button
              onClick={nextStep}
              disabled={loading}
              className="ml-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : step === 2 ? 'Complete' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}