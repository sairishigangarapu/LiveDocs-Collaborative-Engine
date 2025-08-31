import {
    initializeApp,
    getApps,
    getApp,
    App,
    cert,
} from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import serviceAccount from './service_key.json';

let app: App;

if (getApps().length === 0) {
    try {
        app = initializeApp({
            credential: cert(serviceAccount as any),
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