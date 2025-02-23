import { CheckIsMobile } from '@/utils/common';
import './index.less';
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ImgWatchList0 from '@/assets/images/tab/watchlist-0.svg';
import ImgWatchList1 from '@/assets/images/tab/watchlist-1.svg';
import ImgX0 from '@/assets/images/tab/x-0.svg';
import ImgX1 from '@/assets/images/tab/x-1.svg';
import ImgSearch0 from '@/assets/images/tab/search-0.svg';
import ImgSearch1 from '@/assets/images/tab/search-1.svg';
import ImgMemo0 from '@/assets/images/tab/memo-0.svg';
import ImgMemo1 from '@/assets/images/tab/memo-1.svg';
import ImgChat from '@/assets/images/tab/chat.svg';
import AppPriviyProvider from './privy';
import { ToastContainer } from 'react-toastify';
import { useUserStore } from '@/stores/useUserStore';
import UseExtension from '@/hooks/useExtension';

const isMobile = CheckIsMobile();
const TabPage = [
  { name: 'WatchList', path: '/watchlist', icon: ImgWatchList0, activeIcon: ImgWatchList1 },
  { name: 'Search', path: '/search', icon: ImgSearch0, activeIcon: ImgSearch1 },
  { name: 'Chat', path: '/chat', icon: ImgChat, activeIcon: ImgChat },
  { name: 'Hosting', path: '/hosting', icon: ImgX0, activeIcon: ImgX1 },
  { name: 'Memo', path: '/memo', icon: ImgMemo0, activeIcon: ImgMemo1 },
];

const Layout = ({ children }: { children: React.ReactNode }) => {
  UseExtension();
  const { userProfile } = useUserStore();
  const [showTab, setShowTab] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!userProfile && location.pathname !== '/popup-login' && location.pathname !== '/login2' && location.pathname !== '/oauth2callback') {
      navigate('/login');
    }
    let index = ['/watchlist', '/search', 'chat-no', '/hosting', '/memo'].findIndex(tab => tab === location.pathname);
    if (location.pathname === '/') {
      index = 0;
    }
    setActiveTab(index);
    setShowTab(index !== -1);
  }, [location.pathname]);

  const handleTabClick = (index: number) => {
    setActiveTab(index);
    navigate(TabPage[index].path);
  };

  return (
    <div className={isMobile ? '' : 'pc-bg'}>
      <div className="h5-page" style={{ width: isMobile ? '100%' : '375px' }}>
        <AppPriviyProvider>
          <ToastContainer
            className="layout-toast"
            position="top-center"
            autoClose={2000}
            hideProgressBar={false}
            newestOnTop={false}
            pauseOnHover={false}
            theme="colored"
          />
          {children}
          {showTab && (
            <div className="h5-tab">
              {TabPage.map((tab, index) => (
                <img
                  key={tab.path}
                  src={activeTab === index ? tab.activeIcon : tab.icon}
                  className={`h5-tab-item ${activeTab === index ? 'h5-tab-item-active' : ''}`}
                  onClick={() => handleTabClick(index)}
                ></img>
              ))}
            </div>
          )}
        </AppPriviyProvider>
      </div>
    </div>
  );
};

export default Layout;
