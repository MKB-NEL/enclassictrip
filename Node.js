const express = require('express');
const fetch = require('node-fetch');
const app = express();
app.use(express.json());

const APP_ID = "754e0c04-e095-11f0-bc44-deadd43720af";
const APP_SECRET = "c1a2e6e99420fdd0a04f07df8580bb91da39a3ee5e6b4b0d3255bfef95601890afd80709";

// Authenticate with Paypack
async function getAccessToken() {
    const res = await fetch('https://payments.paypack.rw/api/auth/agents/authorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: APP_ID, client_secret: APP_SECRET })
    });
    const data = await res.json();
    return data.access;
}

// Endpoint to send money
app.post('/send-money', async (req, res) => {
    const { phone, amount } = req.body;

    if (!phone || !amount) return res.status(400).send({ error: "Phone and amount are required" });

    try {
        const token = await getAccessToken();
        const response = await fetch('https://payments.paypack.rw/api/transactions/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                phone_number: phone,
                amount: amount,
                app_id: APP_ID,
                currency: "RWF",
                reason: "Test Payment"
            })
        });
        const data = await response.json();
        res.send(data);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: "Something went wrong" });
    }
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
