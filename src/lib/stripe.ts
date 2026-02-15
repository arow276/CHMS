import Stripe from "stripe";

export { PLANS, type PlanKey } from "./plans";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-01-28.clover",
      typescript: true,
    });
  }
  return _stripe;
}

export const STRIPE_PRICE_IDS = {
  growth: {
    monthly: process.env.STRIPE_GROWTH_MONTHLY_PRICE_ID ?? null,
    yearly: process.env.STRIPE_GROWTH_YEARLY_PRICE_ID ?? null,
  },
  pro: {
    monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID ?? null,
    yearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID ?? null,
  },
} as const;
