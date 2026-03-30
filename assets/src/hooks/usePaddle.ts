import { useEffect, useRef, useCallback } from 'react';
import { useAuthentication } from '@/hooks/use-authentication';
import { getWorkspacePublicId } from '@/lib/auth';

export function usePaddle() {
  const initialized = useRef(false);
  const { user } = useAuthentication();

  useEffect(() => {
    if (initialized.current) return;
    const token = window.__DAILYBREW__?.paddleClientSideToken;
    if (!token || !window.Paddle) return;

    window.Paddle.Initialize({
      token,
      eventCallback: (event) => {
        if (event.name === 'checkout.completed') {
          // Reload after successful checkout — webhook will update subscription
          setTimeout(() => window.location.reload(), 2000);
        }
      },
    });
    initialized.current = true;
  }, []);

  const openCheckout = useCallback((billing: 'monthly' | 'annual') => {
    const priceId = billing === 'annual'
      ? window.__DAILYBREW__?.paddlePriceIdAnnual
      : window.__DAILYBREW__?.paddlePriceIdMonthly;

    if (!priceId || !window.Paddle) {
      console.error('Paddle not initialized or price ID missing');
      return;
    }

    const workspaceId = getWorkspacePublicId();

    window.Paddle.Checkout.open({
      items: [{ priceId, quantity: 1 }],
      customer: user?.email ? { email: user.email } : undefined,
      customData: workspaceId ? { workspace_public_id: workspaceId } : undefined,
      settings: {
        displayMode: 'overlay',
        theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
        successUrl: `${window.location.origin}/console/settings`,
      },
    });
  }, [user]);

  return { openCheckout };
}
