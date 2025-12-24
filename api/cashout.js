import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { number, amount } = req.body;
  if (!number || !amount) return res.status(400).json({ error: 'Number and amount required' });

  try {
    const response = await fetch('https://payments.paypack.rw/api/transactions/cashout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${process.env.PAYPACK_APP_SECRET}`,
      },
      body: JSON.stringify({ number, amount })
    });

    const data = await response.json();
    res.status(200).json(data);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
