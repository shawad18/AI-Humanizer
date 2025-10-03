import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
} from 'firebase/auth';

export type SocialProvider = 'google' | 'github' | 'linkedin';
export interface SocialProfile {
  email: string;
  name: string;
  avatar?: string;
}

const REQUIRED_KEYS = [
  'REACT_APP_FIREBASE_API_KEY',
  'REACT_APP_FIREBASE_AUTH_DOMAIN',
  'REACT_APP_FIREBASE_PROJECT_ID',
] as const;

function missingFirebaseKeys() {
  const env = process.env as Record<string, string | undefined>;
  return REQUIRED_KEYS.filter((k) => !env[k]);
}

function hasFirebaseEnv() {
  return missingFirebaseKeys().length === 0;
}

function ensureFirebaseInit() {
  if (!hasFirebaseEnv()) {
    return null;
  }
  if (!getApps().length) {
    const {
      REACT_APP_FIREBASE_API_KEY,
      REACT_APP_FIREBASE_AUTH_DOMAIN,
      REACT_APP_FIREBASE_PROJECT_ID,
      REACT_APP_FIREBASE_APP_ID,
    } = process.env as Record<string, string | undefined>;

    initializeApp({
      apiKey: REACT_APP_FIREBASE_API_KEY!,
      authDomain: REACT_APP_FIREBASE_AUTH_DOMAIN!,
      projectId: REACT_APP_FIREBASE_PROJECT_ID!,
      appId: REACT_APP_FIREBASE_APP_ID,
    });
  }
  return getAuth();
}

export const isEnabled = () => hasFirebaseEnv();

export async function loginWithPopup(provider: SocialProvider): Promise<SocialProfile> {
  const auth = ensureFirebaseInit();
  if (!auth) {
    const keys = missingFirebaseKeys();
    throw new Error(
      `Firebase Auth not initialized. Missing environment keys: ${keys.join(', ')}. ` +
      `Please set ${REQUIRED_KEYS.join(', ')} in your .env file.`
    );
  }

  let providerInstance: GoogleAuthProvider | GithubAuthProvider;
  switch (provider) {
    case 'google':
      providerInstance = new GoogleAuthProvider();
      break;
    case 'github':
      providerInstance = new GithubAuthProvider();
      break;
    case 'linkedin':
      // LinkedIn is not supported natively by Firebase Auth
      throw new Error('LinkedIn login is not supported via Firebase');
    default:
      throw new Error('Unsupported provider');
  }

  try {
    const result = await signInWithPopup(auth, providerInstance);
    const u = result.user;
    return {
      email: u.email || '',
      name: u.displayName || (u.email ? u.email.split('@')[0] : 'user'),
      avatar: u.photoURL || undefined,
    };
  } catch (err) {
    const msg = (err as Error)?.message || 'Popup login failed';
    throw new Error(`Social login error (${provider}): ${msg}`);
  }
}

export async function logout() {
  const auth = ensureFirebaseInit();
  if (auth) {
    await auth.signOut();
  }
}
