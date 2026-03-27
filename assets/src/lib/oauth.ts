let googleLoaded = false;
let appleLoaded = false;

/**
 * Loads the Google Identity Services SDK and initializes it.
 */
export function loadGoogleSDK(clientId: string): Promise<void> {
  if (googleLoaded) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = () => {
      googleLoaded = true;
      window.google?.accounts.id.initialize({
        client_id: clientId,
        callback: () => {}, // overridden per-use
      });
      resolve();
    };
    script.onerror = () => reject(new Error('Failed to load Google SDK'));
    document.head.appendChild(script);
  });
}

/**
 * Triggers Google One Tap sign-in and returns the credential JWT.
 */
export function googleSignIn(clientId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!window.google) {
      reject(new Error('Google SDK not loaded'));
      return;
    }

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response: { credential: string }) => {
        resolve(response.credential);
      },
    });

    window.google.accounts.id.prompt((notification: { isNotDisplayed: () => boolean }) => {
      if (notification.isNotDisplayed()) {
        // Fallback: use the button flow
        reject(new Error('Google sign-in prompt was not displayed'));
      }
    });
  });
}

/**
 * Loads the Apple JS SDK.
 */
export function loadAppleSDK(): Promise<void> {
  if (appleLoaded) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';
    script.async = true;
    script.onload = () => {
      appleLoaded = true;
      resolve();
    };
    script.onerror = () => reject(new Error('Failed to load Apple SDK'));
    document.head.appendChild(script);
  });
}

/**
 * Triggers Apple Sign-In and returns the identity token + email.
 */
export async function appleSignIn(clientId: string, redirectURI: string): Promise<{ identityToken: string; email?: string }> {
  if (!window.AppleID) {
    throw new Error('Apple SDK not loaded');
  }

  window.AppleID.auth.init({
    clientId,
    scope: 'email name',
    redirectURI,
    usePopup: true,
  });

  const response = await window.AppleID.auth.signIn();

  return {
    identityToken: response.authorization.id_token,
    email: response.user?.email,
  };
}

// Type declarations for the global SDKs
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void;
          prompt: (callback?: (notification: { isNotDisplayed: () => boolean }) => void) => void;
          renderButton: (element: HTMLElement, config: Record<string, unknown>) => void;
        };
      };
    };
    AppleID?: {
      auth: {
        init: (config: Record<string, unknown>) => void;
        signIn: () => Promise<{
          authorization: { id_token: string };
          user?: { email?: string };
        }>;
      };
    };
  }
}
