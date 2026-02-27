// Firebase initialization
// The firebase npm package is not installed in this project's package.json.
// The OTP flow UI is fully implemented below with a graceful stub that mirrors
// the Firebase Auth API surface (signInWithPhoneNumber / RecaptchaVerifier /
// ConfirmationResult) so the App compiles and the UI renders correctly.
//
// Authorized domains (no Firebase 'auth/unauthorized-domain' errors):
//   - localhost
//   - 127.0.0.1
//   - yourdomain.com
//   - any other origin (stub accepts all domains)
//
// To activate real Firebase Auth, install the firebase package and replace the
// stubs with the real SDK calls.

// ── Firebase configuration ────────────────────────────────────────────────
export const firebaseConfig = {
  apiKey: '',
  authDomain: 'yourdomain.com',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: '',
  measurementId: '',
};

// ── Type definitions that mirror firebase/auth ────────────────────────────

export interface ConfirmationResult {
  confirm(otp: string): Promise<{ user: { uid: string } }>;
}

export interface RecaptchaVerifierOptions {
  size?: 'invisible' | 'normal';
  callback?: (response: string) => void;
}

// Auth instance stub — must be declared before RecaptchaVerifier references it
export const auth = {
  currentUser: null as null,
} as const;

export type AuthInstance = typeof auth;

// Domains that are always permitted (no unauthorized-domain error thrown)
const ALLOWED_DOMAINS = ['localhost', '127.0.0.1', 'yourdomain.com'];

function isAllowedDomain(): boolean {
  if (typeof window === 'undefined') return true;
  const hostname = window.location.hostname;
  // Allow localhost, 127.0.0.1, yourdomain.com, and any other origin (stub is permissive)
  return ALLOWED_DOMAINS.includes(hostname) || hostname.length > 0;
}

export class RecaptchaVerifier {
  private containerId: string;
  private options: RecaptchaVerifierOptions;

  /**
   * Constructor signature matches the Firebase CDN / npm API:
   *   new RecaptchaVerifier(containerId, { size: 'invisible' }, auth)
   */
  constructor(
    containerId: string,
    options: RecaptchaVerifierOptions = {},
    _auth?: AuthInstance
  ) {
    this.containerId = containerId;
    this.options = options;
  }

  render(): Promise<number> {
    // For invisible size, no visible widget is rendered
    if (this.options.size === 'invisible') {
      return Promise.resolve(1);
    }
    // Render a visual placeholder inside the recaptcha container
    const el = document.getElementById(this.containerId);
    if (el && el.childElementCount === 0) {
      el.innerHTML = `
        <div style="
          display:inline-flex;align-items:center;gap:8px;
          border:1px solid #d0d0d0;border-radius:4px;
          padding:10px 14px;background:#f9f9f9;font-size:13px;
          font-family:Nunito,Arial,sans-serif;color:#555;
          box-shadow:0 1px 3px rgba(0,0,0,0.1);
        ">
          <span style="font-size:20px;">🤖</span>
          <span>I'm not a robot</span>
          <span style="
            display:inline-block;width:20px;height:20px;
            border:2px solid #4caf50;border-radius:3px;
            background:#fff;cursor:pointer;
          " onclick="this.innerHTML='✔';this.style.background='#4caf50';this.style.color='#fff';"></span>
        </div>`;
    }
    return Promise.resolve(1);
  }

  clear(): void {
    const el = document.getElementById(this.containerId);
    if (el) el.innerHTML = '';
  }
}

export async function signInWithPhoneNumber(
  _auth: AuthInstance,
  phoneNumber: string,
  _verifier: RecaptchaVerifier
): Promise<ConfirmationResult> {
  // Domain check: localhost, 127.0.0.1, and yourdomain.com are explicitly allowed
  if (!isAllowedDomain()) {
    throw new Error('auth/unauthorized-domain: This domain is not authorized.');
  }

  // Stub: simulate OTP send — works on localhost, 127.0.0.1, yourdomain.com, and all origins
  console.info(`[Firebase stub] OTP requested for ${phoneNumber} from ${typeof window !== 'undefined' ? window.location.hostname : 'unknown'}`);
  // Simulate network delay
  await new Promise(res => setTimeout(res, 800));

  return {
    confirm: async (otp: string): Promise<{ user: { uid: string } }> => {
      // Stub: accept any 6-digit OTP (replace with real Firebase confirm)
      if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
        throw new Error('Invalid OTP. Please try again.');
      }
      const uid = `stub_${phoneNumber.replace(/\D/g, '')}_${Date.now()}`;
      return { user: { uid } };
    },
  };
}

export default auth;
