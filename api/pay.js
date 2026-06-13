export default async function handler(req, res) {
  // Allow requests from your GitHub Pages site
  const allowedOrigin = 'https://cyberkiller2010.github.io';
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight (OPTIONS) request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get phone number and user ID from request body
  const { phoneNumber, userId } = req.body;
  if (!phoneNumber || !userId) {
    return res.status(400).json({ error: 'Phone number and user ID required' });
  }

  // Format phone number to MoneyUnify format (260XXXXXXXXX)
  let formattedPhone = phoneNumber.replace(/\D/g, '');
  if (formattedPhone.startsWith('0')) {
    formattedPhone = '260' + formattedPhone.substring(1);
  }
  if (!formattedPhone.startsWith('260')) {
    formattedPhone = '260' + formattedPhone;
  }

  // Your MoneyUnify Auth Key
  const AUTH_KEY = '01KTJAC0JCVK34N8789M5NWYJQ';
  
  // Generate unique reference
  const reference = `ZS_${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

  // Prepare form data (x-www-form-urlencoded, not JSON)
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

    // Check if payment was initiated successfully
    if (data.isError === false && data.data?.status === 'initiated') {
      return res.status(200).json({
        success: true,
        transaction_id: data.data.transaction_id,
        reference: reference
      });
    } else {
      // Handle different error types
      let errorMsg = data.message || data.error || 'Payment initiation failed';
      if (errorMsg.toLowerCase().includes('insufficient')) {
        errorMsg = 'Insufficient funds in your mobile money wallet. Please add funds and try again.';
      } else if (errorMsg.toLowerCase().includes('register') || errorMsg.toLowerCase().includes('invalid payer')) {
        errorMsg = 'This phone number is not registered for mobile money. Please check and try again.';
      }
      return res.status(400).json({ success: false, error: errorMsg });
    }
  } catch (error) {
    console.error('Payment error:', error);
    return res.status(500).json({ error: 'Network error. Please try again.' });
  }
}
