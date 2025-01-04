const functions = require('firebase-functions');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const admin = require('firebase-admin');

// Create Checkout Session
exports.createCheckoutSession = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');
  }

  const { priceId } = data;
  const userId = context.auth.uid;

  try {
    // Get or create customer
    let customerData = await admin.firestore()
      .collection('users')
      .doc(userId)
      .get();

    let customerId = customerData.data()?.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: context.auth.token.email,
        metadata: {
          firebaseUID: userId,
        },
      });
      customerId = customer.id;

      // Save customer ID
      await admin.firestore()
        .collection('users')
        .doc(userId)
        .update({ stripeCustomerId: customerId });
    }

    // Create checkout session with trial
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      mode: 'subscription',
      subscription_data: {
        trial_period_days: 14,
        metadata: {
          firebaseUID: userId
        }
      },
      allow_promotion_codes: true,
      success_url: `${process.env.WEBAPP_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.WEBAPP_URL}/pricing`,
    });

    return { sessionId: session.id };
  } catch (error) {
    console.error('Error:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Create Portal Session
exports.createPortalSession = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
  }

  const { customerId, returnUrl } = data;

  try {
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
      configuration: {
        features: {
          subscription_update: {
            enabled: true,
            proration_behavior: 'create_prorations',
            default_allowed_updates: ['price']
          },
          subscription_cancel: {
            enabled: true,
            mode: 'at_period_end',
            cancellation_reason: {
              enabled: true,
              options: ['too_expensive', 'missing_features', 'unused', 'other']
            }
          },
          customer_update: {
            enabled: true,
            allowed_updates: ['email', 'address', 'shipping']
          },
          payment_method_update: {
            enabled: true
          },
          invoice_history: {
            enabled: true
          }
        },
        business_info: {
          headline: 'Manage your Smart App Launcher Pro subscription'
        }
      }
    });

    return { url: portalSession.url };
  } catch (error) {
    console.error('Error creating portal session:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Verify Subscription
exports.verifySubscription = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
  }

  const { sessionId } = data;
  const userId = context.auth.uid;

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const subscription = await stripe.subscriptions.retrieve(session.subscription);

    // Update user's subscription status in Firestore
    await admin.firestore()
      .collection('users')
      .doc(userId)
      .update({
        subscription: {
          id: subscription.id,
          status: subscription.status,
          priceId: subscription.items.data[0].price.id,
          currentPeriodEnd: subscription.current_period_end,
          cancelAtPeriodEnd: subscription.cancel_at_period_end
        }
      });

    return { subscription };
  } catch (error) {
    console.error('Error verifying subscription:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Handle webhook events
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook Error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      
      // Track promotion code usage if present
      if (session.promotion_code) {
        const promoCode = await stripe.promotionCodes.retrieve(session.promotion_code);
        await admin.firestore()
          .collection('promotion_usage')
          .add({
            code: promoCode.code,
            userId: session.metadata.firebaseUID,
            usedAt: admin.firestore.Timestamp.now(),
            subscriptionId: session.subscription,
            customerId: session.customer
          });

        // Send email notification for promotion usage
        const user = await admin.auth().getUser(session.metadata.firebaseUID);
        await sendPromotionUsageEmail(user.email, promoCode.code);
      }
      break;

    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      const subscription = event.data.object;
      const customerId = subscription.customer;
      
      // Get user by customer ID
      const userSnapshot = await admin.firestore()
        .collection('users')
        .where('stripeCustomerId', '==', customerId)
        .get();

      if (!userSnapshot.empty) {
        const userId = userSnapshot.docs[0].id;
        await admin.firestore()
          .collection('users')
          .doc(userId)
          .update({
            subscription: {
              id: subscription.id,
              status: subscription.status,
              priceId: subscription.items.data[0].price.id,
              currentPeriodEnd: subscription.current_period_end,
            },
          });
      }
      break;

    case 'customer.subscription.deleted':
      const deletedSubscription = event.data.object;
      const deletedCustomerId = deletedSubscription.customer;

      const deletedUserSnapshot = await admin.firestore()
        .collection('users')
        .where('stripeCustomerId', '==', deletedCustomerId)
        .get();

      if (!deletedUserSnapshot.empty) {
        const userId = deletedUserSnapshot.docs[0].id;
        await admin.firestore()
          .collection('users')
          .doc(userId)
          .update({
            subscription: null,
          });
      }
      break;
  }

  res.json({ received: true });
});

async function sendPromotionUsageEmail(userEmail, promoCode) {
  // Implement email sending logic here
  // You can use services like SendGrid, Mailgun, etc.
  console.log(`Promotion ${promoCode} used by ${userEmail}`);
}
