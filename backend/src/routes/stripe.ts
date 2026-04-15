import express from 'express';
import { stripe, PLANS } from '../services/stripeService';
import Subscription from '../models/Subscription';
import User from '../models/User';
import { protect, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Checkout session banao
router.post('/create-checkout', protect, async (req: AuthRequest, res) => {
  try {
    const { plan } = req.body;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const planData = PLANS[plan as keyof typeof PLANS];
    if (!planData) return res.status(400).json({ message: 'Invalid plan' });

    // Stripe customer banao
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: { userId: user._id.toString() },
    });

    // Checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [{
        price: planData.priceId,
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/dashboard?success=true&plan=${plan}`,
      cancel_url: `${process.env.FRONTEND_URL}/pricing?cancelled=true`,
      metadata: {
        userId: user._id.toString(),
        plan,
      },
    });

    res.json({ url: session.url });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Current subscription
router.get('/subscription', protect, async (req: AuthRequest, res) => {
  try {
    const sub = await Subscription.findOne({ userId: req.userId });
    res.json(sub);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Billing portal
router.post('/billing-portal', protect, async (req: AuthRequest, res) => {
  try {
    const sub = await Subscription.findOne({ userId: req.userId });
    if (!sub) return res.status(404).json({ message: 'No subscription found' });

    const session = await stripe.billingPortal.sessions.create({
      customer: sub.stripeCustomerId,
      return_url: `${process.env.FRONTEND_URL}/dashboard`,
    });

    res.json({ url: session.url });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Webhook — Stripe events handle karo
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature']!;

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return res.status(400).json({ message: `Webhook error: ${err.message}` });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as any;
      await Subscription.create({
        userId: session.metadata.userId,
        stripeCustomerId: session.customer,
        stripeSubscriptionId: session.subscription,
        plan: session.metadata.plan,
        status: 'active',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
      break;
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object as any;
      await Subscription.findOneAndUpdate(
        { stripeSubscriptionId: sub.id },
        { status: 'cancelled' }
      );
      break;
    }
    case 'invoice.payment_failed': {
      const invoice = event.data.object as any;
      await Subscription.findOneAndUpdate(
        { stripeCustomerId: invoice.customer },
        { status: 'past_due' }
      );
      break;
    }
  }

  res.json({ received: true });
});

export default router;