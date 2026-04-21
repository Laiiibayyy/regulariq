'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$29',
    desc: 'Perfect for single-location cafés',
    features: [
      '1 location',
      'Up to 20 compliance items',
      '500MB document vault',
      'Email alerts only',
      'Compliance score',
    ],
    popular: false,
    btnClass: 'bg-white/[0.08] hover:bg-white/[0.12] text-white',
  },
  {
    id: 'business',
    name: 'Business',
    price: '$79',
    desc: 'For growing restaurants',
    features: [
      'Up to 5 locations',
      'Unlimited compliance items',
      '5GB document vault',
      'Email + SMS alerts',
      'Audit export PDF',
      'Up to 10 employee certs',
    ],
    popular: true,
    btnClass: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white',
  },
  {
    id: 'professional',
    name: 'Professional',
    price: '$149',
    desc: 'For multi-location operators',
    features: [
      'Unlimited locations',
      'Unlimited everything',
      '20GB document vault',
      'Priority alerts',
      'API access',
      'Unlimited employee certs',
    ],
    popular: false,
    btnClass: 'bg-white/[0.08] hover:bg-white/[0.12] text-white',
  },
];

const FAQS = [
  { q: 'Do I need a credit card to start?', a: 'No! Your 14-day free trial starts immediately — no credit card required.' },
  { q: 'Can I cancel anytime?', a: 'Yes. Cancel anytime from your billing portal. No questions asked.' },
  { q: 'What happens after my trial?', a: 'You will be prompted to choose a plan. If you do not, your account is paused — not deleted.' },
  { q: 'Can I switch plans later?', a: 'Absolutely. Upgrade or downgrade anytime from your account settings.' },
];

export default function PricingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleCheckout = async (planId: string) => {
    const token = typeof window !== 'undefined'
      ? localStorage.getItem('regulariq_token')
      : null;

    if (!token) {
      router.push('/signup');
      return;
    }

    setLoading(planId);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/stripe/create-checkout`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ plan: planId }),
        }
      );
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a14] text-white px-6 py-16">
      <div className="max-w-5xl mx-auto">

        <div className="text-center mb-14">
          <button
            onClick={() => router.push('/')}
            className="text-xs text-white/30 hover:text-white/60 mb-6 flex items-center gap-1 mx-auto transition-all"
          >
            Back to home
          </button>
          <div className="inline-flex items-center gap-2 text-xs text-indigo-400 bg-indigo-400/10 rounded-full px-3 py-1 mb-4">
            Pricing
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-3">
            Simple, transparent pricing
          </h1>
          <p className="text-sm text-white/40">
            Start free for 14 days. No credit card required. Cancel anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl p-6 border transition-all ${
                plan.popular
                  ? 'border-indigo-500/40 bg-indigo-500/[0.07]'
                  : 'border-white/[0.07] bg-white/[0.03]'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap">
                  Most popular
                </div>
              )}

              <p className="text-xs text-white/40 mb-2">{plan.name}</p>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-black text-white tracking-tight">
                  {plan.price}
                </span>
                <span className="text-xs text-white/30">/month</span>
              </div>
              <p className="text-xs text-white/35 mb-6">{plan.desc}</p>

              <div className="space-y-3 mb-7">
                {plan.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-xs text-white/55">
                    <div className="w-4 h-4 rounded-full bg-green-400/15 flex items-center justify-center flex-shrink-0">
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                        <path
                          d="M1 4l2 2 4-4"
                          stroke="#4ade80"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                    {f}
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleCheckout(plan.id)}
                disabled={loading === plan.id}
                className={`w-full py-3 rounded-xl text-sm font-semibold transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2 ${plan.btnClass}`}
              >
                {loading === plan.id ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeOpacity="0.3" />
                      <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    Redirecting...
                  </>
                ) : (
                  'Start free trial'
                )}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-16 max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-white text-center mb-8">
            Frequently asked questions
          </h2>
          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <div
                key={i}
                className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-5 py-4"
              >
                <p className="text-sm text-white font-medium mb-2">{faq.q}</p>
                <p className="text-xs text-white/40 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}