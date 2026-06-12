export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { transaction_id } = req.body;
  if (!transaction_id) return res.status(400).json({ error: 'Transaction ID required' });

  const AUTH_KEY = '01KTJAC0JCVK34N8789M5NWYJQ';

  try {
    const response = await fetch('https://moneyunify.one/api/v1/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ auth_id: AUTH_KEY, transaction_id })
    });
    const data = await response.json();

    if (data.status === 'success' && data.data.status === 'successful') {
      // Optionally, you could store a payment success flag in Firestore here
      return res.status(200).json({ success: true, paid: true, amount: data.data.amount });
    } else {
      return res.status(200).json({ success: false, paid: false, message: data.message });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
