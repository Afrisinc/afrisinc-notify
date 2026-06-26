import { loadStripe } from "@stripe/stripe-js";

/**
 * Stripe.js singleton — must be initialised once at module level.
 * Import this wherever <Elements> is needed instead of calling loadStripe() locally.
 */
export const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string,
);
