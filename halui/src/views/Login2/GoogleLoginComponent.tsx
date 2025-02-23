import React from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';

const clientId = '444485690241-a6c52l67mphtmt09kq502m0uk3pr97o0.apps.googleusercontent.com';

const GoogleLoginComponent: React.FC = () => {
  const navigate = useNavigate();

  const handleLoginSuccess = (response: any) => {
    console.log('Login Success:', response);
    // navigate('/profile');
  };

  const handleLoginFailure = (error: any) => {
    console.error('Login Failed:', error);
  };

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h1>Google Login</h1>
        <GoogleLogin
          onSuccess={handleLoginSuccess}
          onError={handleLoginFailure}
        />
      </div>
    </GoogleOAuthProvider>
  );
};

export default GoogleLoginComponent;