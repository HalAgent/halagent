import './index.less';
const LoginTips = () => {
  return (
    <div className="login-tips">
      <div className="login-tips-title">Please login to Google before using this page</div>
      <div className="login-tips-btn" onClick={() => window.location.href = '/login'}>Go Login</div>
    </div>
  );
};
export default LoginTips;
