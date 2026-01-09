import Stripe from 'stripe';
import { products, getProductById, type Product } from './products';

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

export { stripe };

// Cache for Stripe product/price IDs (created on first use)
const stripeProductCache = new Map<string, { productId: string; priceId: string }>();

/**
 * Get or create a Stripe product and price for a given product ID
 */
export async function getOrCreateStripeProduct(productId: string): Promise<{ productId: string; priceId: string }> {
  // Check cache first
  if (stripeProductCache.has(productId)) {
    return stripeProductCache.get(productId)!;
  }

  const product = getProductById(productId);
  if (!product) {
    throw new Error(`Product not found: ${productId}`);
  }

  // Search for existing product by metadata
  const existingProducts = await stripe.products.search({
    query: `metadata['local_product_id']:'${productId}'`,
  });

  let stripeProductId: string;
  let stripePriceId: string;

  if (existingProducts.data.length > 0) {
    // Use existing product
    stripeProductId = existingProducts.data[0].id;
    
    // Get the default price
    const prices = await stripe.prices.list({
      product: stripeProductId,
      active: true,
      limit: 1,
    });
    
    if (prices.data.length > 0) {
      stripePriceId = prices.data[0].id;
    } else {
      // Create a new price if none exists
      const price = await createStripePrice(stripeProductId, product);
      stripePriceId = price.id;
    }
  } else {
    // Create new product
    const stripeProduct = await stripe.products.create({
      name: product.name,
      description: product.description,
      metadata: {
        local_product_id: productId,
        category: product.category,
      },
    });
    stripeProductId = stripeProduct.id;

    // Create price for the product
    const price = await createStripePrice(stripeProductId, product);
    stripePriceId = price.id;
  }

  // Cache the result
  const result = { productId: stripeProductId, priceId: stripePriceId };
  stripeProductCache.set(productId, result);
  
  return result;
}

async function createStripePrice(stripeProductId: string, product: Product): Promise<Stripe.Price> {
  if (product.interval === 'one_time') {
    return await stripe.prices.create({
      product: stripeProductId,
      unit_amount: product.priceInCents,
      currency: 'usd',
    });
  } else {
    return await stripe.prices.create({
      product: stripeProductId,
      unit_amount: product.priceInCents,
      currency: 'usd',
      recurring: {
        interval: product.interval!,
      },
    });
  }
}

export interface CreateCheckoutOptions {
  productId: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
  successUrl: string;
  cancelUrl: string;
}

/**
 * Create a Stripe Checkout Session
 */
export async function createCheckoutSession(options: CreateCheckoutOptions): Promise<string> {
  const { productId, userId, userEmail, userName, successUrl, cancelUrl } = options;

  const product = getProductById(productId);
  if (!product) {
    throw new Error(`Product not found: ${productId}`);
  }

  const { priceId } = await getOrCreateStripeProduct(productId);

  const isSubscription = product.interval !== 'one_time';

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: isSubscription ? 'subscription' : 'payment',
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl,
    allow_promotion_codes: true,
    metadata: {
      product_id: productId,
      user_id: userId || '',
      customer_email: userEmail || '',
      customer_name: userName || '',
    },
  };

  // Add customer email if provided
  if (userEmail) {
    sessionParams.customer_email = userEmail;
  }

  // Add client reference ID if user is logged in
  if (userId) {
    sessionParams.client_reference_id = userId;
  }

  const session = await stripe.checkout.sessions.create(sessionParams);

  return session.url!;
}

/**
 * Get customer's subscriptions
 */
export async function getCustomerSubscriptions(customerId: string): Promise<Stripe.Subscription[]> {
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: 'all',
    limit: 100,
  });
  return subscriptions.data;
}

/**
 * Get customer's payment history
 */
export async function getCustomerPayments(customerId: string): Promise<Stripe.PaymentIntent[]> {
  const paymentIntents = await stripe.paymentIntents.list({
    customer: customerId,
    limit: 100,
  });
  return paymentIntents.data;
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.cancel(subscriptionId);
}

/**
 * Get or create a Stripe customer for a user
 */
export async function getOrCreateCustomer(email: string, name?: string): Promise<Stripe.Customer> {
  // Search for existing customer
  const existingCustomers = await stripe.customers.list({
    email: email,
    limit: 1,
  });

  if (existingCustomers.data.length > 0) {
    return existingCustomers.data[0];
  }

  // Create new customer
  return await stripe.customers.create({
    email: email,
    name: name,
  });
}

/**
 * Retrieve a checkout session
 */
export async function getCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session> {
  return await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['subscription', 'payment_intent', 'customer'],
  });
}

/**
 * Create a billing portal session for subscription management
 */
export async function createBillingPortalSession(customerId: string, returnUrl: string): Promise<string> {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
  return session.url;
}

export interface BookingCheckoutOptions {
  productId: string;
  customerInfo: {
    fullName: string;
    email: string;
    phone: string;
    state: 'PA' | 'UT' | 'Other';
    requestedDate: string;
    requestedTime: string;
    selectedProgram: string;
  };
  successUrl: string;
  cancelUrl: string;
}

/**
 * Create a Stripe Checkout Session for booking with deposit
 * This charges only the $50 deposit, not the subscription
 */
export async function createBookingCheckoutSession(options: BookingCheckoutOptions): Promise<string> {
  const { productId, customerInfo, successUrl, cancelUrl } = options;

  const product = getProductById(productId);
  if (!product) {
    throw new Error(`Product not found: ${productId}`);
  }

  // Create a checkout session for the $50 deposit only
  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: 5000, // $50 deposit
          product_data: {
            name: `Booking Deposit - ${product.name}`,
            description: `$50 booking deposit for ${product.name}. Applied to your first visit or first month.`,
          },
        },
        quantity: 1,
      },
    ],
    success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl,
    customer_email: customerInfo.email,
    metadata: {
      type: 'booking_deposit',
      product_id: productId,
      product_name: product.name,
      customer_name: customerInfo.fullName,
      customer_email: customerInfo.email,
      customer_phone: customerInfo.phone,
      customer_state: customerInfo.state,
      requested_date: customerInfo.requestedDate,
      requested_time: customerInfo.requestedTime,
      selected_program: customerInfo.selectedProgram,
    },
  };

  const session = await stripe.checkout.sessions.create(sessionParams);

  return session.url!;
}
