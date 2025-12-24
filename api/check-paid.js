import admin from 'firebase-admin';

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
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: 'Email required' });

    const doc = await db.collection('users').doc(email).get();
    res.json({ paid: doc.exists && doc.data().paid === true });
}
