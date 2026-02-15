import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event;
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      // TODO: Provision the subscription in your database
      // - Link the Stripe customer to the church/organization
      // - Set the plan level based on session.metadata.plan
      console.log("Checkout completed:", session.id, session.metadata);
      break;
    }
    case "customer.subscription.updated": {
      const subscription = event.data.object;
      // TODO: Update the subscription level in your database
      console.log("Subscription updated:", subscription.id, subscription.status);
      break;
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object;
      // TODO: Downgrade to free tier in your database
      console.log("Subscription canceled:", subscription.id);
      break;
    }
    case "invoice.payment_failed": {
      const invoice = event.data.object;
      // TODO: Notify the church admin of payment failure
      console.log("Payment failed for invoice:", invoice.id);
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
