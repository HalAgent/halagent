import { useUserStore } from '@/stores/useUserStore';
import { useEffect, useState } from 'react';

// Define message type
interface CacheInitMessage {
  type: string;
  data: {
    localStorage: Record<string, string>;
    cookie: string;
  };
}

export default function useExtension() {
  const [show, setShow] = useState(window.location.href.indexOf('extension') === -1);
  const { setUserProfile } = useUserStore();

  useEffect(() => {
    if (show) return; // No need to process if already shown

    // Handle received message
    const handleMessage = (event: MessageEvent<CacheInitMessage>) => {
      const message = event.data;
      if (message.type === 'cacheInit') {
        // Send confirmation message
        window.parent.postMessage({ type: 'cacheInitOk' }, '*');

        // Update localStorage
        for (const key in message.data.localStorage) {
          localStorage.setItem(key, message.data.localStorage[key]);
          if (key === 'user-store') {
            const userStore = JSON.parse(message.data.localStorage[key]);
            setUserProfile(userStore?.state?.userProfile);
          }
        }

        // Update cookies
        document.cookie = message.data.cookie;

        // Delay visibility update
        setShow(true);

        // Periodically sync state
        const intervalId = setInterval(() => {
          const localStorageData: Record<string, string> = {};
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key) {
              localStorageData[key] = localStorage.getItem(key) || '';
            }
          }

          // Send sync message
          window.parent.postMessage(
            {
              type: 'cacheSave',
              data: {
                localStorage: localStorageData,
                cookie: document.cookie,
              },
            },
            '*'
          );
        }, 1000);

        // Cleanup interval
        return () => clearInterval(intervalId);
      }
    };

    // Add message event listener
    window.addEventListener('message', handleMessage);

    // Cleanup event listener
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  return [show];
}
