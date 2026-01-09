import { Request, Response } from 'express';
import Stripe from 'stripe';
import { notifyOwner } from './_core/notification';
import { getProductById } from './products';
import { createLead } from './db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function handleStripeWebhook(req: Request, res: Response) {
  const sig = req.headers['stripe-signature'] as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error(`[Webhook] Signature verification failed:`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle test events for webhook verification
  if (event.id.startsWith('evt_test_')) {
    console.log("[Webhook] Test event detected, returning verification response");
    return res.json({ 
      verified: true,
    });
  }

  console.log(`[Webhook] Received event: ${event.type} (${event.id})`);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCreated(subscription);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(invoice);
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSucceeded(paymentIntent);
        break;
      }

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (err: any) {
    console.error(`[Webhook] Error handling event ${event.type}:`, err);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const metadata = session.metadata || {};
  const isBookingDeposit = metadata.type === 'booking_deposit';
  
  const productId = metadata.product_id;
  const customerEmail = session.customer_email || metadata.customer_email;
  const customerName = metadata.customer_name;
  const customerPhone = metadata.customer_phone || '';
  const customerState = (metadata.customer_state as 'PA' | 'UT' | 'Other') || 'PA';
  const requestedDate = metadata.requested_date || '';
  const requestedTime = metadata.requested_time || '';
  const selectedProgram = metadata.selected_program || '';
  
  const product = productId ? getProductById(productId) : null;
  const productName = product?.name || selectedProgram || 'Unknown Product';

  console.log(`[Checkout] Completed for ${customerEmail}: ${productName} (Booking Deposit: ${isBookingDeposit})`);

  // Determine interest category based on product
  let interest: 'WEIGHT_LOSS' | 'WEIGHT_LOSS_CORE' | 'WEIGHT_LOSS_PLUS' | 'WEIGHT_LOSS_INTENSIVE' | 'MENOPAUSE_HRT' | 'MENS_HEALTH_ED' | 'MENS_HEALTH_HAIR' | 'MENS_HEALTH_BUNDLE' | 'PEPTIDE_THERAPY' | 'GENERAL' | 'OTHER' = 'GENERAL';
  
  if (productId?.includes('weight_loss_core')) interest = 'WEIGHT_LOSS_CORE';
  else if (productId?.includes('weight_loss_plus')) interest = 'WEIGHT_LOSS_PLUS';
  else if (productId?.includes('weight_loss_intensive')) interest = 'WEIGHT_LOSS_INTENSIVE';
  else if (productId?.includes('weight')) interest = 'WEIGHT_LOSS';
  else if (productId?.includes('hormone') || productId?.includes('menopause')) interest = 'MENOPAUSE_HRT';
  else if (productId?.includes('mens_ed')) interest = 'MENS_HEALTH_ED';
  else if (productId?.includes('mens_hair')) interest = 'MENS_HEALTH_HAIR';
  else if (productId?.includes('mens_bundle')) interest = 'MENS_HEALTH_BUNDLE';
  else if (productId?.includes('peptide')) interest = 'PEPTIDE_THERAPY';

  // Create lead in CRM for new signup
  if (customerEmail) {
    try {
      const leadMessage = isBookingDeposit
        ? `BOOKING DEPOSIT PAID - $50\n\nSelected Program: ${selectedProgram}\nRequested Date: ${requestedDate}\nRequested Time: ${requestedTime}\n\nPlease contact patient to confirm appointment.`
        : `New ${session.mode === 'subscription' ? 'subscription' : 'payment'} for ${productName}. Amount: $${((session.amount_total || 0) / 100).toFixed(2)}`;

      await createLead({
        fullName: customerName || 'Stripe Customer',
        email: customerEmail,
        phone: customerPhone,
        state: customerState,
        interest,
        preferredContactMethod: 'EMAIL',
        message: leadMessage,
        requestedDate: requestedDate || undefined,
        requestedTime: requestedTime || undefined,
        selectedProgram: selectedProgram || undefined,
        depositStatus: isBookingDeposit ? 'PAID' : undefined,
        stripePaymentIntentId: session.payment_intent as string || undefined,
      });
      console.log(`[CRM] Created lead for ${customerEmail}`);
    } catch (err) {
      console.error('[CRM] Failed to create lead:', err);
    }
  }

  // Notify owner of new booking/purchase
  if (isBookingDeposit) {
    await notifyOwner({
      title: `🗓️ New Booking Deposit: ${selectedProgram}`,
      content: `Customer: ${customerName || 'Unknown'}\nEmail: ${customerEmail || 'Unknown'}\nPhone: ${customerPhone || 'Not provided'}\nState: ${customerState}\n\nProgram: ${selectedProgram}\nRequested Date: ${requestedDate}\nRequested Time: ${requestedTime}\n\nDeposit: $50 PAID\n\nPlease contact patient to confirm appointment.`,
    });
  } else {
    await notifyOwner({
      title: `New ${session.mode === 'subscription' ? 'Subscription' : 'Payment'}: ${productName}`,
      content: `Customer: ${customerName || 'Unknown'}\nEmail: ${customerEmail || 'Unknown'}\nProduct: ${productName}\nAmount: $${((session.amount_total || 0) / 100).toFixed(2)}`,
    });
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log(`[Subscription] Created: ${subscription.id}`);
  
  // Get customer details
  const customer = await stripe.customers.retrieve(subscription.customer as string);
  const customerEmail = (customer as Stripe.Customer).email;
  
  await notifyOwner({
    title: 'New Subscription Started',
    content: `Subscription ID: ${subscription.id}\nCustomer: ${customerEmail}\nStatus: ${subscription.status}`,
  });
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log(`[Subscription] Updated: ${subscription.id} - Status: ${subscription.status}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log(`[Subscription] Deleted: ${subscription.id}`);
  
  // Get customer details
  const customer = await stripe.customers.retrieve(subscription.customer as string);
  const customerEmail = (customer as Stripe.Customer).email;
  
  await notifyOwner({
    title: 'Subscription Cancelled',
    content: `Subscription ID: ${subscription.id}\nCustomer: ${customerEmail}`,
  });
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  console.log(`[Invoice] Paid: ${invoice.id} - Amount: $${((invoice.amount_paid || 0) / 100).toFixed(2)}`);
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log(`[Invoice] Payment Failed: ${invoice.id}`);
  
  const customerEmail = invoice.customer_email;
  
  await notifyOwner({
    title: 'Payment Failed',
    content: `Invoice ID: ${invoice.id}\nCustomer: ${customerEmail}\nAmount: $${((invoice.amount_due || 0) / 100).toFixed(2)}`,
  });
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log(`[Payment] Succeeded: ${paymentIntent.id} - Amount: $${((paymentIntent.amount || 0) / 100).toFixed(2)}`);
}
