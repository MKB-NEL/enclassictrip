import fetch from 'node-fetch';

const APP_ID = process.env.PAYPACK_APP_ID;
const APP_SECRET = process.env.PAYPACK_APP_SECRET;

async function getPaypackToken() {
    const res = await fetch('https://payments.paypack.rw/api/auth/agents/authorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: APP_ID, client_secret: APP_SECRET })
    });
    const data = await res.json();
    return data.access;
}

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method not allowed');
    const { phone, amount } = req.body;
    if (!phone || !amount) return res.status(400).json({ error: 'Phone and amount required' });

    try {
        const token = await getPaypackToken();
        const response = await fetch('https://payments.paypack.rw/api/transactions/cashout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Idempotency-Key': Math.random().toString(36).substring(2,34)
            },
            body: JSON.stringify({ amount: Number(amount), number: phone })
        });
        const data = await response.json();
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ error: 'Cashout failed', details: err.message });
    }
}

