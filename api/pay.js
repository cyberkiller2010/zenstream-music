export default async function handler(req, res) {
  // Enable CORS for GitHub Pages
  res.setHeader('Access-Control-Allow-Origin', 'https://cyberkiller2010.github.io');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { phoneNumber, userId } = req.body;
  if (!phoneNumber || !userId) {
    return res.status(400).json({ error: 'Phone number and user ID required' });
  }

  const AUTH_KEY = '01KTJAC0JCVK34N8789M5NWYJQ';
  const reference = `ZS_${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

  const payload = {
    auth_id: AUTH_KEY,
    phone: phoneNumber,
    amount: 30,
    currency: 'ZMW',
    reference: reference,
    description: 'ZenStream - 1 Song Upload',
    callback_url: `https://zenstream-music.vercel.app/api/check-payment`
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
