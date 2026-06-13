export default async function handler(req, res) {
  // Allow requests from your GitHub Pages site
  res.setHeader('Access-Control-Allow-Origin', 'https://cyberkiller2010.github.io');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

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

  // Format phone number: remove all non-digits
  let formattedPhone = phoneNumber.replace(/\D/g, '');
  
  // Ensure it starts with 260 (Zambia country code)
  if (formattedPhone.startsWith('0')) {
    formattedPhone = '260' + formattedPhone.substring(1);
  }
  if (!formattedPhone.startsWith('260')) {
    formattedPhone = '260' + formattedPhone;
  }

  const AUTH_KEY = '01KTJAC0JCVK34N8789M5NWYJQ';
  
  // Keep reference short and simple (no special characters except underscore)
  const reference = `ZS_${userId.slice(-8)}_${Date.now()}`;

  // Use JSON format (some MoneyUnify endpoints prefer JSON)
  const payload = {
    auth_id: AUTH_KEY,
    from_payer: formattedPhone,
    amount: "30.00",
    reference: reference
  };

  console.log('Sending payload:', payload);

  try {
    const response = await fetch('https://api.moneyunify.one/payments/request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
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
      return res.status(400).json({ success: false, error: errorMsg });
    }
  } catch (error) {
    console.error('Payment error:', error);
    return res.status(500).json({ error: 'Network error. Please try again.' });
  }
}
