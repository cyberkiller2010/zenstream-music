export default async function handler(req, res) {
  const allowedOrigin = 'https://cyberkiller2010.github.io';
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
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

  // According to MoneyUnify documentation, verify transaction with this endpoint[citation:2]
  const response = await fetch('https://api.moneyunify.one/payments/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json'
    },
    body: new URLSearchParams({
      transaction_id: transaction_id,
      auth_id: AUTH_KEY
    })
  });

  const data = await response.json();

  // Check if transaction is successful based on response structure[citation:2]
  if (!data.isError && data.data?.status === 'success') {
    return res.status(200).json({ success: true, paid: true });
  } else {
    return res.status(200).json({ success: false, paid: false });
  }
}
