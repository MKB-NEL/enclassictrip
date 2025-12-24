
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
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });

    try {
        const token = await getPaypackToken();
        const checkoutRes = await fetch('https://checkout.paypack.rw/api/checkouts/initiate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({
                app_id: APP_ID,
                email,
                items: [{ name: 'Signup Payment', price: 500, quantity: 1 }]
            })
        });
        const data = await checkoutRes.json();
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ error: 'Checkout creation failed', details: err.message });
    }
}
