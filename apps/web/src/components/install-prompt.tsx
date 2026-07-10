import React, { useEffect, useState } from 'react';
import { Download, Share, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'bridgeup_pwa_install_dismissed';

function isStandalone() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
}

function isIos() {
  if (typeof navigator === 'undefined') return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosHint, setShowIosHint] = useState(false);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    if (isStandalone()) return;
    if (localStorage.getItem(DISMISS_KEY) === '1') return;
    setDismissed(false);

    if (isIos()) {
      setShowIosHint(true);
      return;
    }

    const handler = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1');
    setDismissed(true);
  };

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted' || choice.outcome === 'dismissed') {
      setDeferredPrompt(null);
      dismiss();
    }
  };

  if (dismissed) return null;
  if (!deferredPrompt && !showIosHint) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] flex justify-center px-4 pb-4 sm:px-6">
      <div className="flex w-full max-w-md items-center gap-3 rounded-2xl border border-border bg-card/95 p-4 shadow-2xl shadow-black/30 backdrop-blur">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <Download className="h-5 w-5 text-primary" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-text-primary">Install BridgeUp</p>
          {showIosHint ? (
            <p className="mt-0.5 text-xs leading-5 text-text-secondary">
              Tap <Share className="mb-0.5 inline h-3.5 w-3.5" /> Share, then &quot;Add to Home Screen&quot;.
            </p>
          ) : (
            <p className="mt-0.5 text-xs text-text-secondary">Add BridgeUp to your home screen for the full app experience.</p>
          )}
        </div>

        {!showIosHint && (
          <button
            onClick={handleInstall}
            className="shrink-0 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-white transition hover:bg-primary-hover"
          >
            Install
          </button>
        )}

        <button onClick={dismiss} className="shrink-0 rounded-lg p-1.5 text-text-muted transition hover:text-text-primary" title="Dismiss">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
