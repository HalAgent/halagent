import React from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { authService } from '@/services/auth';

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const GoogleLoginComponent: React.FC = () => {
  const navigate = useNavigate();

  const handleLoginSuccess = async (response: any) => {
    // console.log('Login Success:', response);
    const decoded = jwtDecode(response.credential) as any;
    // console.log('User ID:', decoded.sub);
    // console.log('Full Name:', decoded.name);
    // console.log('Given Name:', decoded.given_name);
    // console.log('Family Name:', decoded.family_name);
    // console.log('Image URL:', decoded.picture);
    // console.log('Email:', decoded.email);
    await authService.login(decoded.sub, decoded.email as string);
    navigate('/pick');
  };

  const handleLoginFailure = () => {
    console.error('Login Failed:');
  };

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* <h1>Google Login</h1> */}
        <GoogleLogin
          onSuccess={handleLoginSuccess}
          onError={handleLoginFailure}
        />
      </div>
    </GoogleOAuthProvider>
  );
};

export default GoogleLoginComponent;