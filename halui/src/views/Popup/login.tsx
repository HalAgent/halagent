import { getAccessToken, useLogin, usePrivy } from '@privy-io/react-auth';
import { useEffect } from 'react';

const LoginPopup = () => {
  const { ready, authenticated } = usePrivy();
  const { login } = useLogin({
    onComplete: async params => {
      console.warn(params);
      if (params?.user?.id) {
        const token = await getAccessToken();
        const localStorageData: Record<string, string> = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key) {
            localStorageData[key] = localStorage.getItem(key) || '';
          }
        }
        window.opener.postMessage({ type: 'GOOGLE_AUTH_SUCCESS', data: { token, localStorageData, cookie: document.cookie } }, '*'); // 第二个参数是目标窗口的origin，' * ' 允许任何来源
        window.close();
      }
    },
    onError: error => {
      console.error(error);
    },
  });
  useEffect(() => {
    if (ready && !authenticated) {
      login();
    }
  }, [ready, authenticated]);

  return <div style={{ position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: '#fff' }}></div>;
};

export default LoginPopup;
