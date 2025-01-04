import { handleStripeWebhook } from '../../../services/stripe';

export const config = {
  api: {
    bodyParser: false, // Disable body parsing, we'll do it ourselves
  },
};

// This is your Stripe webhook endpoint
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
    return;
  }

  // Get the raw body for webhook signature verification
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const rawBody = Buffer.concat(chunks).toString('utf8');
  req.body = rawBody;

  try {
    await handleStripeWebhook(req, res);
  } catch (err) {
    console.error('Error processing webhook:', err);
    res.status(400).json({ error: 'Webhook handler failed' });
  }
}
