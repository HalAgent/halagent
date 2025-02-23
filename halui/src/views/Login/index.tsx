import './index.less';
import Role from '@/assets/images/login/role.gif';
import LoginGuest from '@/assets/images/login/login-guest.svg';
import Twitter from '@/assets/icons/Twitter.png';
import Website from '@/assets/icons/Website.png';
import DexScreener from '@/assets/icons/DexScreener.png';
import { authService } from '@/services/auth';
import { useNavigate } from 'react-router-dom';
import { storage } from '@/utils/storage';
import { useEffect } from 'react';
import { useUserStore } from '@/stores/useUserStore';
import GoogleLoginComponent from './GoogleLoginComponent';

const Login = () => {
  const navigate = useNavigate();
  const { setUserProfile } = useUserStore();


  function generateGuestName() {
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 10000);
    return 'Guest-' + timestamp + randomNum;
  }
  const guestLogin = async () => {
    // Guest
    const username = generateGuestName();
    const password = username;
    const email = '';
    const credentials = { username, password, email };
    const response = await authService.guestLogin(credentials);
    console.log('guest auth, res: ' + response);
    navigate('/pick');
  };

  // popup login handler
  useEffect(() => {
    // Handle received message
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      if (message.type === 'GOOGLE_AUTH_SUCCESS') {
        const { token, localStorageData, cookie } = message.data;
        // Update localStorage
        for (const key in localStorageData) {
          localStorage.setItem(key, localStorageData[key]);
          if (key === 'user-store') {
            const userStore = JSON.parse(localStorageData[key]);
            setUserProfile(userStore?.state?.userProfile);
          }
        }

        // Update cookies
        document.cookie = cookie;
        storage.setToken(token);

        navigate('/pick');
      }
    };

    // Add message event listener
    window.addEventListener('message', handleMessage);

    // Cleanup event listener
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  return (
    <div className="login">
      <div className="login-header">
        <img className="login-header-role" src={Role}></img>
      </div>
      <div className="login-title">
        YOUR DATA,<br></br> YOUR AGENTS, <br></br>YOUR POWER.
      </div>
      <GoogleLoginComponent />

      <div className="login-or">or</div>
      <img className="login-guest btn-scale" src={LoginGuest} onClick={guestLogin}></img>
      <div className="hosting-content-popup-main-footer login-footer">
        <div
          className="hosting-content-popup-main-footer-item btn-scale"
          onClick={() => {
            window.location.href = 'https://halagent.org/';
          }}
        >
          <img className="hosting-content-popup-main-footer-item-icon" src={Website}></img>
          <div className="hosting-content-popup-main-footer-item-text">Website</div>
        </div>
        <div
          className="hosting-content-popup-main-footer-item btn-scale"
          onClick={() => {
            window.location.href = 'https://x.com/HALAI_SOL';
          }}
        >
          <img className="hosting-content-popup-main-footer-item-icon" src={Twitter}></img>
          <div className="hosting-content-popup-main-footer-item-text">Twitter</div>
        </div>
        <div
          className="hosting-content-popup-main-footer-item btn-scale"
          onClick={() => {
            window.location.href = 'https://dexscreener.com/solana/6pcybkvfmopvbtsfy8fqatzolqq5s325b6st2sf7yzbw';
          }}
        >
          <img className="hosting-content-popup-main-footer-item-icon" src={DexScreener}></img>
          <div className="hosting-content-popup-main-footer-item-text">DexScreener</div>
        </div>
      </div>
    </div>
  );
};

export default Login;
