import React from 'react';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/auth';
import LoginGoogle from '@/assets/images/login/login-google.svg';

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const GoogleLoginComponent: React.FC = () => {
  const navigate = useNavigate();
  const login = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        const userInfo = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: {
            Authorization: `Bearer ${response.access_token}`,
          },
        }).then(res => res.json());

        console.log('User Info:', userInfo);

        const { email, id: sub } = userInfo;

        await authService.login(sub, email);

        navigate('/pick');
      } catch (error) {
        console.error('Failed to fetch user info:', error);
      }
    },
    onError: () => {
      console.log('Login Failed');
    },
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <img className="login-google" src={LoginGoogle} onClick={() => login()} alt="Google Login" />
    </div>
  );
};

const GoogleLoginComp = () => (
  <GoogleOAuthProvider clientId={clientId}>
    <GoogleLoginComponent />
  </GoogleOAuthProvider>
);

export default GoogleLoginComp;
