export default async function handler(req, res) {
  // CORS headers
  const allowedOrigin = 'https://cyberkiller2010.github.io';
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
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

  // CORRECT API URL and format according to MoneyUnify documentation[citation:2]
  const response = await fetch('https://api.moneyunify.one/payments/request', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json'
    },
    body: new URLSearchParams({
      from_payer: phoneNumber,
      amount: '30',
      auth_id: AUTH_KEY,
      reference: reference
    })
  });

  const data = await response.json();

  if (!data.isError && data.data?.status === 'initiated') {
    return res.status(200).json({
      success: true,
      transaction_id: data.data.transaction_id,
      reference: reference
    });
  } else {
    return res.status(400).json({ 
      success: false, 
      error: data.message || 'Payment initiation failed'
    });
  }
}
