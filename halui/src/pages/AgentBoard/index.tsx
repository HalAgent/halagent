import AgentHeader from '@/components/agent/AgentHeader';
import xIcon from '@/assets/icons/x.svg';
import telegramIcon from '@/assets/icons/telegram.svg';
import { Menu, MenuButton, MenuItem, MenuItems, Switch } from '@headlessui/react';
import ArrowdownIcon from '@/assets/icons/arrowdown.svg';
import { useEffect, useState } from 'react';
import { useUserStore } from '@/stores/useUserStore';

const SocialItem = ({ icon, account }: { icon: React.ReactNode; account?: string }) => {
  return (
    <div className="flex-1 h-[120px] bg-[#F3F3F3] rounded-[16px] fcc-center gap-[16px]">
      {icon}
      {account ? (
        <span className="green-bg w-[100px] h-[22px] p-1 text-[12px] text-white text-center inknut-antiqua">{account}</span>
      ) : (
        <span className="gray-bg w-[100px] h-[22px] p-1 text-[12px] text-[#737373] text-center inknut-antiqua">Go to bind</span>
      )}
    </div>
  );
};

const INTERVAL_OPTIONS = ['1h', '2h', '3h', '12h', '24h'];
const IMIATE_OPTIONS = ['Eliza', 'Ansem', 'Trump', 'aeyakovenko'];

const AgentBoard: React.FC = () => {
  const [twid, setTwid] = useState('@HalAgent');
  const [enabled, setEnabled] = useState(false);
  const [interval, setInterval] = useState('1h');
  const [imitate, setImitate] = useState('Eliza');
  const [tokenUsed, setTokenUsed] = useState(0);

  const handleSelectionChange = (event: React.MouseEvent<HTMLDivElement>, type: 'interval' | 'imitate') => {
    const target = event.target as HTMLElement;
    const value = target.innerText;
    if (type === 'interval') {
      setInterval(value);
    } else {
      setImitate(value);
    }
  };

  useEffect(() => {
    setTokenUsed(100 + Math.floor(Math.random() * 200));
    const userId = useUserStore.getState().getUserId();
    if (userId) {
      setTwid('@' + userId);
    }
  }, []);

  return (
    <div className="page press-start-2p max-w-[490px]">
      <AgentHeader />

      <div className="w-[calc(100%-40px)] mx-[20px]">
        <div className="w-full mt-[20px] frc-center gap-[16px]">
          <SocialItem icon={<img src={xIcon} />} account={twid} />
          <SocialItem icon={<img src={telegramIcon} />} />
        </div>

        <div className="w-full mt-[20px]">
          <div className="flex items-center justify-between">
            <span className="text-[14px]">X Takeover by Agent </span>
            <Switch
              checked={enabled}
              onChange={setEnabled}
              className="group inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition data-[checked]:bg-[#39CE78]"
            >
              <span className="size-4 rounded-full bg-white transition group-data-[checked]:translate-x-4" />
            </Switch>
          </div>
        </div>
        <form className="mt-[20px] bg-[#F3F3F3] rounded-[24px] p-[24px]">
          <div className="mb-[20px] w-full flex flex-col items-start justify-start gap-[16px]">
            <span className="text-[14px]">Post interval</span>
            <div className="pix-input w-auto min-w-[290px] h-[48px] px-[28px] frc-start">
              <Menu>
                <MenuButton className="flex justify-between flex-1 items-center h-[38px] px-0 bg-[#FFFFFF]">
                  <span className="text-black flex-1 flex items-center justify-start gap-2 p-1.5 rounded-lg data-[focus]:bg-[#E3E3E3] hover:bg-[#E3E3E3]">
                    {interval}
                  </span>
                  <img src={ArrowdownIcon} alt="arrowdown" className="w-[10px] h-[10px]" />
                </MenuButton>
                <MenuItems
                  transition
                  anchor="bottom end"
                  className="select-none rounded-xl bg-white w-[336px] translate-x-[25px] p-[2px] transition duration-100 ease-out border-3 border-solid border-[#E3E3E3]"
                  onMouseUp={event => handleSelectionChange(event, 'interval')}
                >
                  {INTERVAL_OPTIONS.map(option => (
                    <MenuItem key={option} as="div">
                      <div className="flex items-center gap-2 text-[12px] text-black press-start-2p rounded-lg py-1.5 px-3 pl-[30px] data-[focus]:bg-[#E3E3E3] hover:bg-[#E3E3E3]">
                        {option}
                      </div>
                    </MenuItem>
                  ))}
                </MenuItems>
              </Menu>
            </div>
          </div>
          <div className="w-full flex flex-col items-start justify-start gap-[16px]">
            <span className="text-[14px]">Imitate @</span>
            <div className="pix-input w-auto min-w-[290px] h-[48px] px-[28px] frc-start">
              <Menu>
                <MenuButton className="flex justify-between flex-1 items-center h-[38px] px-0 bg-[#FFFFFF]">
                  <span className="text-black flex-1 flex items-center justify-start gap-2 p-1.5 rounded-lg data-[focus]:bg-[#E3E3E3] hover:bg-[#E3E3E3]">
                    {imitate}
                  </span>
                  <img src={ArrowdownIcon} alt="arrowdown" className="w-[10px] h-[10px]" />
                </MenuButton>
                <MenuItems
                  transition
                  anchor="bottom end"
                  className="select-none rounded-xl bg-white w-[336px] translate-x-[25px] p-[2px] transition duration-100 ease-out border-3 border-solid border-[#E3E3E3]"
                  onMouseUp={event => handleSelectionChange(event, 'imitate')}
                >
                  {IMIATE_OPTIONS.map(option => (
                    <MenuItem key={option} as="div">
                      <div className="flex items-center gap-2 text-[12px] text-black press-start-2p rounded-lg py-1.5 px-3 pl-[30px] data-[focus]:bg-[#E3E3E3] hover:bg-[#E3E3E3]">
                        {option}
                      </div>
                    </MenuItem>
                  ))}
                </MenuItems>
              </Menu>
            </div>
          </div>
        </form>

        <div className="w-full mt-[20px] box-border border-3 border-solid border-[#E3E3E3] rounded-[24px] p-[16px]">
          <div className="text-[14px] mb-[16px]">APL configuration</div>
          <div className="w-full flex flex-col items-start justify-start">
            <span className="relative w-full flex items-center gap-1">
              <span className="absolute top-0 left-0 bg-[#F3F3F3] h-[16px] w-full rounded-full my-2px">
                <span className="bg-[#39CE78] h-[16px] absolute top-0 left-0 rounded-full" style={{ width: tokenUsed }}></span>
              </span>
            </span>
            <span className="text-[12px] mt-8">{tokenUsed} / 100000</span>
          </div>
          <div className="w-full flex items-center justify-end mt-4">
            <button className="w-[140px] h-[48px] black-bg text-[14px] text-white inknut-antiqua">Buy Tokens</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentBoard;
