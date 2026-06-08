export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { transaction_id, reference, status } = req.body;
  if (status === 'success') {
    const userId = reference.split('_')[1];
    console.log(`✅ Payment confirmed for user ${userId}, transaction ${transaction_id}`);
  }
  res.status(200).json({ received: true });
}
