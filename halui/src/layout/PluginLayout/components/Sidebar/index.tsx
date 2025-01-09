import IconWrap from '@/components/common/IconWrap';
import { Link } from 'react-router-dom';
import { mainNavs, extendNavs, otherNavs } from './config';
import { useState } from 'react';
import { MAIN_NAVS, EXTEND_NAVS, OTHER_NAVS } from '@/constant/navs';

const Sidebar = () => {
  const [selectedNav, setSelectedNav] = useState<MAIN_NAVS | EXTEND_NAVS | OTHER_NAVS>(MAIN_NAVS.CHAT);

  return (
    <div className="w-[60px] h-screen py-[16px] box-border flex flex-col justify-between items-center bg-[#F7F6F5]">
      <div className="fcc-center">
        <ul className="fcc-center gap-[16px]">
          {mainNavs.map(nav => (
            <li key={nav.title}>
              <Link to={nav.path}>
                <IconWrap
                  title={nav.title}
                  isShowTitle={false}
                  isSelected={selectedNav === nav.title}
                  onClick={() => {
                    setSelectedNav(nav.title);
                  }}
                >
                  {nav.icon}
                </IconWrap>
              </Link>
            </li>
          ))}
        </ul>
        <div className="w-[32px] h-[2px] bg-[#E3E3E3] mt-[16px] mb-[16px]"></div>
        <ul className="fcc-center gap-[16px]">
          {extendNavs.map(nav => (
            <li key={nav.title}>
              <Link to={nav.path}>
                <IconWrap
                  title={nav.title}
                  isShowTitle={false}
                  isSelected={selectedNav === nav.title}
                  onClick={() => {
                    setSelectedNav(nav.title);
                  }}
                >
                  {nav.icon}
                </IconWrap>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="fcc-center">
        <ul className="fcc-center gap-[16px]">
          {otherNavs.map(nav => (
            <li key={nav.title}>
              <Link to={nav.path}>
                <IconWrap
                  title={nav.title}
                  isShowTitle={false}
                  isSelected={selectedNav === nav.title}
                  onClick={() => {
                    setSelectedNav(nav.title);
                  }}
                >
                  {nav.icon}
                </IconWrap>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
