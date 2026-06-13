export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://cyberkiller2010.github.io');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { transaction_id } = req.body;
  if (!transaction_id) {
    return res.status(400).json({ error: 'Transaction ID required' });
  }

  const AUTH_KEY = '01KTJAC0JCVK34N8789M5NWYJQ';

  const payload = {
    auth_id: AUTH_KEY,
    transaction_id: transaction_id
  };

  try {
    const response = await fetch('https://api.moneyunify.one/payments/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (data.isError === false && data.data?.status === 'success') {
      return res.status(200).json({ success: true, paid: true });
    } else {
      return res.status(200).json({ success: false, paid: false, message: data.message });
    }
  } catch (error) {
    console.error('Verification error:', error);
    return res.status(500).json({ error: error.message });
  }
}
