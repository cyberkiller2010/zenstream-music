export default async function handler(req, res) {
  const allowedOrigin = 'https://cyberkiller2010.github.io';
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { phoneNumber, userId } = req.body;
  if (!phoneNumber || !userId) {
    return res.status(400).json({ error: 'Phone number and user ID required' });
  }

  // Format phone number to 260XXXXXXXXX
  let formattedPhone = phoneNumber.replace(/\D/g, '');
  if (formattedPhone.startsWith('0')) formattedPhone = '260' + formattedPhone.substring(1);
  if (!formattedPhone.startsWith('260')) formattedPhone = '260' + formattedPhone;

  const AUTH_KEY = '01KTJAC0JCVK34N8789M5NWYJQ';
  const reference = `ZS_${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

  try {
    const response = await fetch('https://api.moneyunify.one/payments/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        auth_id: AUTH_KEY,
        from_payer: formattedPhone,
        amount: '30',
        reference: reference
      })
    });

    const data = await response.json();

    // Check for specific error messages from MoneyUnify
    if (!data.isError && data.data?.status === 'initiated') {
      return res.status(200).json({
        success: true,
        transaction_id: data.data.transaction_id,
        reference: reference
      });
    } else {
      // Extract a user-friendly error
      let errorMsg = data.message || data.error || 'Payment initiation failed';
      // Map common MoneyUnify errors to friendly text
      if (errorMsg.toLowerCase().includes('insufficient') || errorMsg.includes('NOT_ENOUGH_FUNDS')) {
        errorMsg = 'Insufficient funds in your mobile money wallet. Please add funds and try again.';
      } else if (errorMsg.toLowerCase().includes('not registered') || errorMsg.includes('INVALID_PAYER')) {
        errorMsg = 'This phone number is not registered for mobile money. Please check and try again.';
      } else if (errorMsg.toLowerCase().includes('invalid amount')) {
        errorMsg = 'Invalid amount. Please contact support.';
      }
      return res.status(400).json({ success: false, error: errorMsg });
    }
  } catch (err) {
    console.error('Payment error:', err);
    return res.status(500).json({ error: 'Network error. Please try again.' });
  }
}
