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

  // TEST MODE: If phone number is "TEST123", bypass payment
  if (phoneNumber === 'TEST123') {
    return res.status(200).json({
      success: true,
      transaction_id: `TEST_${userId}_${Date.now()}`,
      reference: `TEST_${userId}_${Date.now()}`,
      testMode: true
    });
  }

  // Format phone number
  let formattedPhone = phoneNumber.replace(/\D/g, '');
  if (formattedPhone.startsWith('0')) formattedPhone = '260' + formattedPhone.substring(1);
  if (!formattedPhone.startsWith('260')) formattedPhone = '260' + formattedPhone;

  const AUTH_KEY = '01KTJAC0JCVK34N8789M5NWYJQ';
  const reference = `ZS_${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

  const params = new URLSearchParams();
  params.append('auth_id', AUTH_KEY);
  params.append('from_payer', formattedPhone);
  params.append('amount', '30');
  params.append('reference', reference);

  try {
    const response = await fetch('https://api.moneyunify.one/payments/request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: params
    });

    const data = await response.json();
    console.log('MoneyUnify response:', data);

    if (data.isError === false && data.data?.status === 'initiated') {
      return res.status(200).json({
        success: true,
        transaction_id: data.data.transaction_id,
        reference: reference
      });
    } else {
      let errorMsg = data.message || data.error || 'Payment initiation failed';
      const errorLower = errorMsg.toLowerCase();
      
      if (errorLower.includes('insufficient') || errorLower.includes('balance') || errorLower.includes('not enough')) {
        errorMsg = '❌ Insufficient funds in your mobile money wallet. Please add at least 30 ZMW and try again.';
      } else if (errorLower.includes('register') || errorLower.includes('invalid payer') || errorLower.includes('phone')) {
        errorMsg = '❌ This phone number is not registered for mobile money. Please check and try again.';
      } else {
        errorMsg = `❌ ${errorMsg}`;
      }
      
      return res.status(400).json({ success: false, error: errorMsg });
    }
  } catch (error) {
    console.error('Payment error:', error);
    return res.status(500).json({ error: 'Network error. Please try again.' });
  }
}
