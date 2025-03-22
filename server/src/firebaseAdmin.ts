// firebaseAdmin.ts

import * as admin from "firebase-admin";
import { ServiceAccount } from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

const firebasePrivateKey = process.env.FIREBASE_PRIVATE_KEY!.replace(
  /\\n/g,
  "\n"
);

const serviceAccount: ServiceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: firebasePrivateKey,
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const auth = admin.auth();

export { auth };
