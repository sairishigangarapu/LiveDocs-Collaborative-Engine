import {
    initializeApp,
    getApps,
    getApp,
    App,
    cert,
} from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Create service account from environment variables
const serviceAccount = {
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    privateKeyId: process.env.FIREBASE_ADMIN_PRIVATE_KEY_ID,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    clientId: process.env.FIREBASE_ADMIN_CLIENT_ID,
    authUri: process.env.FIREBASE_ADMIN_AUTH_URI,
    tokenUri: process.env.FIREBASE_ADMIN_TOKEN_URI,
    authProviderX509CertUrl: process.env.FIREBASE_ADMIN_AUTH_PROVIDER_X509_CERT_URL,
    clientX509CertUrl: process.env.FIREBASE_ADMIN_CLIENT_X509_CERT_URL
};

let app: App;

if (getApps().length === 0) {
    try {
        app = initializeApp({
            credential: cert(serviceAccount),
        });
        console.log('Firebase Admin initialized successfully');
    } catch (error) {
        console.error('Failed to initialize Firebase Admin:', error);
        throw new Error(
            `Failed to initialize Firebase Admin: ${error instanceof Error ? error.message : 'Unknown error'}. ` +
            'Please verify your Firebase service account credentials are correct.'
        );
    }
} else {
    app = getApp();
}

const adminDB = getFirestore(app);

export { app as adminApp, adminDB };