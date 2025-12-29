function getEnvOrThrow(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name} for Firebase configuration`);
  }
  return value;
}

export const firebaseConfig = {
  projectId: getEnvOrThrow("FIREBASE_PROJECT_ID"),
  apiKey: getEnvOrThrow("FIREBASE_API_KEY"),
  authDomain: getEnvOrThrow("FIREBASE_AUTH_DOMAIN"),
  storageBucket: getEnvOrThrow("FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: getEnvOrThrow("FIREBASE_MESSAGING_SENDER_ID"),
  appId: getEnvOrThrow("FIREBASE_APP_ID"),
};
