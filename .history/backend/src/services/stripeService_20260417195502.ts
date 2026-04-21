import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia',,
});

export const PLANS = {
  starter: {
    name: 'Starter',
    priceId: 'price_starter_monthly', // Stripe dashboard se lo
    amount: 2900,
  },
  business: {
    name: 'Business',
    priceId: 'price_business_monthly',
    amount: 7900,
  },
  professional: {
    name: 'Professional',
    priceId: 'price_professional_monthly',
    amount: 14900,
  },
};