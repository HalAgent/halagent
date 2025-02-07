import './index.less';
import Role from '@/assets/images/login/role.svg';
import LoginGoogle from '@/assets/images/login/login-google.svg';
import LoginGuest from '@/assets/images/login/login-guest.svg';
import Twitter from '@/assets/icons/Twitter.png';
import Website from '@/assets/icons/Website.png';
import DexScreener from '@/assets/icons/DexScreener.png';
const login = () => {
  return (
    <div className="login">
      <div className="login-header">
        <img className="login-header-role" src={Role}></img>
      </div>
      <div className="login-title">CREATE YOUR OWN SOCIAL AGENT</div>
      <img className="login-google" src={LoginGoogle}></img>
      <div className="login-or">or</div>
      <img className="login-guest" src={LoginGuest}></img>
      <div className="hosting-content-popup-main-footer login-footer">
        <div
          className="hosting-content-popup-main-footer-item"
          onClick={() => {
            window.location.href = 'https://halagent.org/';
          }}
        >
          <img className="hosting-content-popup-main-footer-item-icon" src={Website}></img>
          <div className="hosting-content-popup-main-footer-item-text">Website</div>
        </div>
        <div
          className="hosting-content-popup-main-footer-item"
          onClick={() => {
            window.location.href = 'https://x.com/HALAI_SOL';
          }}
        >
          <img className="hosting-content-popup-main-footer-item-icon" src={Twitter}></img>
          <div className="hosting-content-popup-main-footer-item-text">Twitter</div>
        </div>
        <div
          className="hosting-content-popup-main-footer-item"
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

export default login;
