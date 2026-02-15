import { NextRequest, NextResponse } from "next/server";
import { getStripe, STRIPE_PRICE_IDS } from "@/lib/stripe";
import { PLANS, type PlanKey } from "@/lib/plans";

export async function POST(request: NextRequest) {
  try {
    const { plan, interval } = (await request.json()) as {
      plan: PlanKey;
      interval: "monthly" | "yearly";
    };

    if (!PLANS[plan]) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const priceIds = STRIPE_PRICE_IDS[plan as keyof typeof STRIPE_PRICE_IDS];
    const priceId = priceIds?.[interval];
    if (!priceId) {
      return NextResponse.json(
        { error: "Price not configured" },
        { status: 400 }
      );
    }

    const origin = request.headers.get("origin") ?? "http://localhost:3000";

    const session = await getStripe().checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/pricing?success=true`,
      cancel_url: `${origin}/pricing?canceled=true`,
      metadata: { plan, interval },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
