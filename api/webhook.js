
import admin from 'firebase-admin';

const WEBHOOK_KEY = process.env.WEBHOOK_KEY;

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        })
    });
}
const db = admin.firestore();

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method not allowed');
    const signature = req.headers['x-paypack-signature'];
    if (signature !== WEBHOOK_KEY) return res.status(403).send('Forbidden');

    const event = req.body;
    if (event.kind === 'transaction:processed' && event.data.status === 'successful') {
        const email = event.data.email;
        await db.collection('users').doc(email).set({ paid: true }, { merge: true });
    }
    res.status(200).send('ok');
}
