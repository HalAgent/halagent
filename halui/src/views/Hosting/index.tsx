import './index.less';
import bg from '@/assets/images/hosting/bg.png';
import avatar from '@/assets/images/hosting/avatar.png';
import sj from '@/assets/images/hosting/sj.png';
import host from '@/assets/images/hosting/host.gif';
import popup from '@/assets/images/hosting/popup.png';
import TitleText from '@/assets/images/hosting/title-text.png';
import xsj from '@/assets/icons/xsj.png';

import Twitter from '@/assets/icons/Twitter.png';
import Website from '@/assets/icons/Website.png';
import DexScreener from '@/assets/icons/DexScreener.png';

import IconX from '@/assets/images/hosting/x.png';
import { Menu, MenuButton, MenuItem, MenuItems, Switch } from '@headlessui/react';
import { useEffect, useState } from 'react';
import { authService } from '@/services/auth';
import { useUserStore } from '@/stores/useUserStore';
import PixModal from '@/components/common/PixModal';
import ShortButton from '@/components/common/ShortButton';
import { useNavigate } from 'react-router-dom';
import { CheckIsMobile } from '@/utils/common';
const INTERVAL_OPTIONS = ['30 minutes', '1 hours', '2 hours', '4 hours', '8 hours', '12 hours'];
const CHARACTER_OPTIONS = [
  'Crypto Investment',
  'Artificial Intelligence',
  'Trending Topics',
  'Celebrity News',
  'Study Tips',
  'Books & Literature',
  'Humor and Entertainment',
];
const MessageList = [
  `Hi, I'm Daisy 9000. Click "X" to authorize and unlock the automatic tweeting!`,
  `My goal is to build an AI agent network and lead data sovereignty.`,
  `What type of KOL do you aspire to be? Join me on X for an engaging discussion!`,
  `Did you know? HAL.AI draws inspiration from "2001: A Space Odyssey".`,
  `Do you know? Radiant red hair & camera-like eyes that convey understanding. `,
  `Meet Daisy 9000, the first AI Agent from HAL Agent Network!`,
  `Not just a tool—I’m your trusted partner. HAL Agent Network is on the way.`,
];

const isMobile = CheckIsMobile();
const Hosting = () => {
  const [enabled, setEnabled] = useState(false);
  const [character, setCharacter] = useState('');
  const [intervalValue, setIntervalValue] = useState('2h');
  const [message, setMessage] = useState(MessageList[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const UserProfile = useUserStore()

  const closeModal = (e?: React.MouseEvent) => {
    e?.preventDefault();
    setIsModalOpen(false);
  };

  const handleSelectionChange = (event: React.MouseEvent<HTMLDivElement>, type: 'interval' | 'character') => {
    const target = event.target as HTMLElement;
    const value = target.innerText;
    if (type === 'interval') {
      setIntervalValue(value);
    } else if (type === 'character') {
      setCharacter(value);
    }
  };
  const enabledChange = () => {
    if (enabled) {
      handleTwitterAuthRevoke();
    } else {
      handleTwitterAuth();
    }
  };


  const handleTwitterAuth = () => {
    if (enabled) return;
    setTimeout(async () => {
      try {
        // 1. Get URL
        const {guest_name, url, state } = await authService.twitterOAuth.getAuthUrl();
        // 2. Store state
        sessionStorage.setItem('twitter_oauth_state', state);
        // 3. Open auth window
        authService.twitterOAuth.createAuthWindow(url);
        // 4. Wait for auth result
        await authService.twitterOAuth.listenForAuthMessage();
        await authService.updateProfile({
            email: '111',
            password: '111',
            username: guest_name as string,
          }
        );
      } catch (err) {
        console.error('Twitter auth error:', err);
      }
    }, 500);
  };
  const handleTwitterAuthRevoke = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    try {
        UserProfile.updateProfile({
            ...UserProfile.userProfile,
            tweetProfile: undefined
          });
    } catch (err) {
      console.error('Twitter revoke error:', err);
    }
  };
  useEffect(() => {
    const timer = setInterval(() => {
      setMessage(MessageList[Math.floor(Math.random() * MessageList.length)]);
    }, 5000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    console.warn('UserProfile', UserProfile);
    if (UserProfile.userProfile?.tweetProfile?.accessToken) {
        setEnabled(true);
    }else{
        setEnabled(false);
    }
  },[UserProfile])

  return (
    <div className={isMobile ? '' : 'pc-bg'} >
      <div className="hosting" style={{ width: isMobile ? '100%' : '375px' }}>
        <PixModal isOpen={isModalOpen} onClose={closeModal}>
          <div className="flex flex-col gap-4 max-w-[400px] averia-serif-libre">
            <h2 className="text-center my-0">Login Tips</h2>
            <h3 className="text-center my-10">Please login firstly before connect.</h3>
            <div className="flex justify-center gap-4">
              <ShortButton
                onClick={() => {
                  navigate('/login?from=hosting');
                }}
                className="text-black text-center"
              >
                Login
              </ShortButton>
              <ShortButton onClick={closeModal} className="text-black text-center">
                Cancel
              </ShortButton>
            </div>
          </div>
        </PixModal>
        <div className="hosting-bg">
          <img src={bg} />
        </div>
        <div className="hosting-content">
          <div className="hosting-content-info">
            <img className="hosting-content-info-left" src={avatar} />
            <div className="hosting-content-info-right">
              <div className="hosting-content-info-right-name">Daisy 9000</div>
              <div className="hosting-content-info-right-lv">
                <div className="hosting-content-info-right-lv-text GeologicaRegular">LV7</div>
                <div className="hosting-content-info-right-lv-step">
                  <div className="hosting-content-info-right-lv-step-main" style={{ width: '30%' }}></div>
                </div>
              </div>
            </div>
          </div>
          <div className="hosting-content-host">
            <div className="hosting-content-host-text">{message}</div>
            <img className="hosting-content-host-text-sj" src={sj} />

            <img src={host} className="hosting-content-host-icon" />
          </div>
          <div className="hosting-content-popup">
            <div className="hosting-content-popup-line"></div>
            <img src={popup} className="hosting-content-popup-icon" />
            <div className="hosting-content-popup-main">
              <div className="hosting-content-popup-main-title">
                <div className="hosting-content-popup-main-title-icon" onClick={handleTwitterAuth}>
                  <img src={IconX} className="hosting-content-popup-main-title-icon-img" />
                </div>
                <img className="hosting-content-popup-main-title-text" src={TitleText} onClick={handleTwitterAuth} />
                <div className="flex-1"></div>
                <div className="hosting-content-popup-main-title-switch">
                  <Switch
                    checked={enabled}
                    onChange={enabledChange}
                    className="group p0 pl-[1px] inline-flex h-[26px] w-[40px] items-center rounded-full bg-gray-200 transition data-[checked]:bg-[#39CE78]"
                  >
                    <span className="h-[24px] w-[24px] rounded-full bg-white transition group-data-[checked]:translate-x-[14px]" />
                  </Switch>
                </div>
              </div>

              <div className="hosting-content-popup-main-form">
                <div className="hosting-content-popup-main-form-label">Post Interval</div>
                <div className="hosting-content-popup-main-form-select mt-[12px]">
                  <Menu>
                    <MenuButton className="flex justify-between flex-items-center h-[100%] w-[94%] bg-[#fff] text-left GeologicaRegular color-[#111] text-[14px]">
                      {intervalValue}
                    <img src={xsj}  className="w-[16px] h-[16px] ml-[10px]" />
                    </MenuButton>

                    <MenuItems
                      transition
                      anchor="bottom"
                      style={{
                        width: `calc(${isMobile ? '100vw' : '375px'} - 72px)`,
                        boxShadow: '0 2px 14px rgb(0 0 0 / 10%)',
                      }}
                      className="z-10 bg-[#fff] mt-[6px] origin-top-right rounded-xl p-1 text-sm/6  transition duration-100 ease-out [--anchor-gap:var(--spacing-1)] focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0"
                      onMouseUp={event => handleSelectionChange(event, 'interval')}
                    >
                      {INTERVAL_OPTIONS.map(option => (
                        <MenuItem key={option}>
                          <div className="Geologica box-border p-x-[4px] radius-[4px] h-[32px] line-height-[32px] color-[#656565] text-[13px] data-[focus]:bg-[#E3E3E3] hover:bg-[#E3E3E3]">
                            {option}
                          </div>
                        </MenuItem>
                      ))}
                    </MenuItems>
                  </Menu>
                </div>
                <div className="hosting-content-popup-main-form-label mt-[18px]">Character</div>
                <div className="hosting-content-popup-main-form-select mt-[12px]">
                  <Menu>
                    <MenuButton className="flex justify-between flex-items-center h-[100%] w-[94%] bg-[#fff] text-left GeologicaRegular  color-[#111] text-[14px]">
                      {character ? character : <span className="color-[#B9B9B9] Geologica">Choose your favorite niche</span>}
                    <img src={xsj}  className="w-[16px] h-[16px] ml-[10px]" />
                    </MenuButton>

                    <MenuItems
                      transition
                      anchor="bottom"
                      style={{
                        width: `calc(${isMobile ? '100vw' : '375px'} - 72px)`,
                        boxShadow: '0 2px 14px rgb(0 0 0 / 10%)',
                      }}
                      className="z-10 bg-[#fff] mt-[6px] box-border p-y-[4px] origin-top-right rounded-xl p-1 text-sm/6  transition duration-100 ease-out [--anchor-gap:var(--spacing-1)] focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0"
                      onMouseUp={event => handleSelectionChange(event, 'character')}
                    >
                      {CHARACTER_OPTIONS.map(option => (
                        <MenuItem key={option}>
                          <div className="Geologica box-border p-x-[4px] radius-[4px] h-[32px] line-height-[32px] color-[#656565] text-[13px] data-[focus]:bg-[#E3E3E3] hover:bg-[#E3E3E3]">
                            {option}
                          </div>
                        </MenuItem>
                      ))}
                    </MenuItems>
                  </Menu>
                </div>

                <div className="hosting-content-popup-main-footer">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hosting;
