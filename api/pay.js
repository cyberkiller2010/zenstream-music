export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { phoneNumber, userId } = req.body;
  if (!phoneNumber || !userId) {
    return res.status(400).json({ error: 'Phone number and user ID required' });
  }

  // Your MoneyUnify Auth Key
  const AUTH_KEY = '01KTJAC0JCVK34N8789M5NWYJQ';

  // Generate a unique reference that includes the user ID
  const reference = `ZS_${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

  const payload = {
    auth_id: AUTH_KEY,
    phone: phoneNumber,
    amount: 30,
    currency: 'ZMW',
    reference: reference,
    description: 'ZenStream - 1 Song Upload',
    callback_url: 'https://your-vercel-url.vercel.app/api/verify' // CHANGE THIS AFTER DEPLOYMENT
  };

  try {
    const response = await fetch('https://moneyunify.one/api/v1/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await response.json();

    if (data.status === 'success') {
      return res.status(200).json({
        success: true,
        transaction_id: data.transaction_id,
        reference: reference,
        message: 'Payment request sent. Check your phone.'
      });
    } else {
      return res.status(400).json({ success: false, error: data.message });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
