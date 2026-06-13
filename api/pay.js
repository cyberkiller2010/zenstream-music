export default async function handler(req, res) {
  // Allow requests from your GitHub Pages site
  res.setHeader('Access-Control-Allow-Origin', 'https://cyberkiller2010.github.io');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { phoneNumber, userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'User ID required' });
  }

  // TEST MODE: Always return success (no real payment)
  // Remove this when going live
  const testTransactionId = `TEST_${userId}_${Date.now()}`;
  
  return res.status(200).json({
    success: true,
    transaction_id: testTransactionId,
    reference: testTransactionId,
    testMode: true
  });
}
