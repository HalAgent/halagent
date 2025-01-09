import { MAIN_NAVS, EXTEND_NAVS, OTHER_NAVS } from '@/constant/navs';
import ChatIcon from '@/assets/icons/chat.svg';
import AgentIcon from '@/assets/icons/agent.svg';
import WatchListIcon from '@/assets/icons/watch-list.svg';
import DiscoverIcon from '@/assets/icons/discover.svg';
import MemoIcon from '@/assets/icons/memo.svg';
import MoreIcon from '@/assets/icons/more.svg';
import GiftIcon from '@/assets/icons/gift.svg';
import DeviceIcon from '@/assets/icons/device.svg';
import HelpIcon from '@/assets/icons/help.svg';
import SettingIcon from '@/assets/icons/setting.svg';
import { ReactSVG } from 'react-svg';

const mainNavs = [
  {
    title: MAIN_NAVS.CHAT,
    icon: <ReactSVG src={ChatIcon} className="color-inherit" />,
    path: '/plugin/chat',
  },
  {
    title: MAIN_NAVS.AGENT,
    icon: <ReactSVG src={AgentIcon} className="color-inherit" />,
    path: '/plugin/agent',
  },
  {
    title: MAIN_NAVS.WATCH_LIST,
    icon: <ReactSVG src={WatchListIcon} className="color-inherit" />,
    path: '/plugin/watch-list',
  },
  {
    title: MAIN_NAVS.DISCOVER,
    icon: <ReactSVG src={DiscoverIcon} className="color-inherit" />,
    path: '/plugin/discover',
  },
];

const extendNavs = [
  {
    title: EXTEND_NAVS.MEMO,
    icon: <ReactSVG src={MemoIcon} className="color-inherit" />,
    path: '/plugin/memo',
  },
  {
    title: EXTEND_NAVS.MORE,
    icon: <ReactSVG src={MoreIcon} className="color-inherit" />,
    path: '/plugin/more',
  },
];

const otherNavs = [
  {
    title: OTHER_NAVS.GIFT,
    icon: <ReactSVG src={GiftIcon} className="color-inherit" />,
    path: '/plugin/gift',
  },
  {
    title: OTHER_NAVS.DEVICE,
    icon: <ReactSVG src={DeviceIcon} className="color-inherit" />,
    path: '/plugin/device',
  },
  {
    title: OTHER_NAVS.HELP,
    icon: <ReactSVG src={HelpIcon} className="color-inherit" />,
    path: '/plugin/help',
  },
  {
    title: OTHER_NAVS.SETTING,
    icon: <ReactSVG src={SettingIcon} className="color-inherit" />,
    path: '/plugin/setting',
  },
];

export { mainNavs, extendNavs, otherNavs };
