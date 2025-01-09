import avatarIcon from '@/assets/images/chat/avatar.png';
import walletIcon from '@/assets/icons/wallet.svg';
import lifeBarIcon from '@/assets/icons/life-bar.svg';
import './index.css';
import { useAgentInfo } from '@/hooks/useAgentInfo';

const AgentHeader = () => {
  const { level, experience, nextLevelExp } = useAgentInfo();

  return (
    <div className="w-[calc(100%-40px)] mx-[20px] mt-[20px] flex items-center justify-between">
      <div className="flex items-center justify-start">
        <div className="relative frc-center agent-stage-avatarwrap">
          <img src={avatarIcon} alt="avatar" className="w-[30px] h-[30px] object-cover" />
        </div>
        <div className="ml-[16px] flex flex-col items-start justify-center gap-1">
          <span className="flex items-center gap-2">
            <span className="text-[12px]">Blommy</span>
            <span className="text-[12px] text-[#39CE78]">Level {level}</span>
          </span>
          <span className="flex items-center gap-2">
            <span className="text-[12px]">Exp</span>
            <span className="relative flex items-center gap-1">
              <img src={lifeBarIcon} alt="life-bar" className="w-[120px] h-[16px] object-cover" />
              {/*  */}
              <span className="bg-white h-[10px] w-[110px] absolute top-0 left-0 rounded-full ml-4px mr-2px my-2px">
                <span
                  className="bg-[#39CE78] h-[10px] absolute top-0 left-0 rounded-full"
                  style={{ width: `${(experience * 110) / nextLevelExp}px`, transition: 'width 0.3s ease-in-out' }}
                ></span>
              </span>
            </span>
          </span>
        </div>
      </div>
      <img src={walletIcon} alt="wallet" className="w-[25px] h-[25px] object-contain link-cursor" />
    </div>
  );
};

export default AgentHeader;
