import { BTNCOLOR } from '@/constant/button';
import Background from '@/components/common/Background';
import Button from '@/components/common/Button';
import { useNavigate } from 'react-router-dom';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import ArrowdownIcon from '@/assets/icons/arrowdown.svg';
import BoyIcon from '@/assets/icons/boy.svg';
import GirlIcon from '@/assets/icons/girl.svg';
import { useState, useEffect } from 'react';
import { GENDER } from '@/constant/egg';
import { authService } from '@/services/auth';
import { useUserStore } from '@/stores/useUserStore';
import { useLoading } from '../../context/LoadingContext';

const AgentCustomized: React.FC = () => {
  const { showLoading, hideLoading } = useLoading();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [gender, setGender] = useState<GENDER>(GENDER.GIRL);
  const [agentStyle, setAgentStyle] = useState<string>('');
  const [styles, setStyles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStyles = async () => {
      showLoading('Loading...');
      try {
        const { data } = await authService.getConfig();
        setStyles(data?.styles || []);
        setAgentStyle(data?.styles[0] || '');
      } catch (error) {
        console.error('Failed to fetch styles:', error);
      } finally {
        hideLoading();
      }
    };
    fetchStyles();
  }, []);

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter agent name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const userId = useUserStore.getState().getUserId();
      if (!userId) {
        throw new Error('User not logged in');
      }

      // The update content
      const profileUpdate = {
        name,
        gender,
        bio: [
          `I'm ${name}, a ${gender.toLowerCase()} agent with ${agentStyle.toLowerCase()} style`,
          `Specializing in ${agentStyle.toLowerCase()} interactions and responses`,
          `Ready to engage with unique ${agentStyle.toLowerCase()} perspective`,
        ],
        level: 1,
        experience: 0,
        nextLevelExp: 100,
        points: 0,
        tweetFrequency: {
          dailyLimit: 20,
          currentCount: 0,
          lastTweetTime: Date.now(),
        },
        stats: {
          totalTweets: 0,
          successfulTweets: 0,
          failedTweets: 0,
        },
        style: {
          all: [
            `uses ${agentStyle.toUpperCase()} tone in responses`,
            `emphasizes ${gender.toLowerCase()}-specific perspectives`,
            `maintains consistent ${agentStyle.toLowerCase()} character`,
            `employs unique viewpoint expressions`,
            `references personal experiences and knowledge`,
          ],
          chat: [
            `directly addresses user concerns`,
            `maintains ${agentStyle.toLowerCase()} personality`,
            `uses appropriate emotional responses`,
            `provides detailed explanations`,
            `keeps consistent character voice`,
          ],
          post: [
            `creates engaging content`,
            `maintains ${agentStyle.toLowerCase()} tone`,
            `uses appropriate emphasis`,
            `employs character-specific language`,
            `ensures message clarity`,
          ],
        },
        topics: [
          `${agentStyle.toLowerCase()} interaction patterns`,
          `personal expression styles`,
          `communication techniques`,
          `engagement strategies`,
          `response optimization`,
        ],
        messageExamples: [
          {
            user: 'user',
            content: {
              text: 'How are you today?',
            },
          },
          {
            user: name.toLowerCase(),
            content: {
              text: `Feeling great and ready to engage in ${agentStyle.toLowerCase()} conversations!`,
            },
          },
        ],
      };

      await authService.updateProfile(userId, profileUpdate);
      await authService.createAgent(userId);

      navigate('/plugin/chat');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectionChange = (event: React.MouseEvent<HTMLDivElement>, type: 'gender' | 'style') => {
    const target = event.target as HTMLElement;
    const value = target.innerText;

    if (value) {
      if (type === 'gender') {
        setGender(value as GENDER);
      } else if (type === 'style') {
        setAgentStyle(value);
      }
    }
  };

  return (
    <div className="page press-start-2p">
      <div className="absolute top-0 left-0 z-[-1] w-full h-full bg-white">
        <Background />
      </div>

      <div className="text-center w-auto min-w-[290px] mx-[20px] mt-[120px] mb-[50px]">
        <h1 className="press-start-2p text-xl">Customized Agent</h1>
      </div>
      <form className="fcc-center gap-[20px] box-border mx-[50px]" onSubmit={handleNext}>
        <div className="pix-input w-auto min-w-[290px] h-[48px] px-[28px] frc-start">
          <div className="frc-start w-[100px]">
            <div className="w-[75px] text-[12px]">Name</div>
            <div className="w-[1px] h-[16px] bg-[#E3E3E3] mx-[12px]"></div>
          </div>
          <input
            type="text"
            placeholder="Enter agent name"
            className="w-[180px] flex-1 h-full bg-transparent text-[12px] px-2"
            value={name}
            onChange={e => setName(e.target.value)}
            disabled={loading}
          />
        </div>
        <div className="pix-input w-auto min-w-[290px] h-[48px] px-[28px] frc-start">
          <div className="frc-start w-[100px]">
            <div className="w-[75px] text-[12px]">Gender</div>
            <div className="w-[1px] h-[16px] bg-[#E3E3E3] mx-[12px]"></div>
          </div>
          <Menu>
            <MenuButton className="flex justify-between flex-1 items-center h-[38px] px-0 bg-[#FFFFFF]" disabled={loading}>
              {gender === GENDER.BOY ? (
                <div className="text-black flex-1 flex items-center justify-start gap-2 p-1.5 rounded-lg data-[focus]:bg-[#E3E3E3] hover:bg-[#E3E3E3]">
                  <img src={BoyIcon} alt="boy" className="w-[16px] h-[16px]" />
                  Boy
                </div>
              ) : (
                <div className="text-black flex-1 flex items-center justify-start gap-2 p-1.5 rounded-lg data-[focus]:bg-[#E3E3E3] hover:bg-[#E3E3E3]">
                  <img src={GirlIcon} alt="girl" className="w-[16px] h-[16px]" />
                  Girl
                </div>
              )}
              <img src={ArrowdownIcon} alt="arrowdown" className="w-[10px] h-[10px]" />
            </MenuButton>

            <MenuItems
              transition
              anchor="bottom end"
              className="select-none rounded-xl bg-white w-[205px] translate-x-[25px] p-[2px] transition duration-100 ease-out border-3 border-solid border-[#E3E3E3]"
              onMouseUp={event => handleSelectionChange(event, 'gender')}
            >
              <MenuItem as="div" data-value="Boy">
                <div className="flex items-center gap-2 text-[12px] text-black press-start-2p rounded-lg py-1.5 px-3 data-[focus]:bg-[#E3E3E3] hover:bg-[#E3E3E3]">
                  <img src={BoyIcon} alt="boy" className="w-[16px] h-[16px]" />
                  Boy
                </div>
              </MenuItem>
              <MenuItem as="div" data-value="Girl">
                <div className="flex items-center gap-2 text-[12px] text-black press-start-2p rounded-lg py-1.5 px-3 data-[focus]:bg-[#E3E3E3] hover:bg-[#E3E3E3]">
                  <img src={GirlIcon} alt="girl" className="w-[16px] h-[16px]" />
                  Girl
                </div>
              </MenuItem>
            </MenuItems>
          </Menu>
        </div>
        <div className="pix-input w-auto min-w-[290px] h-[48px] px-[28px] frc-start">
          <div className="frc-start w-[100px]">
            <div className="w-[75px] text-[12px]">Style</div>
            <div className="w-[1px] h-[16px] bg-[#E3E3E3] mx-[12px]"></div>
          </div>
          <Menu>
            <MenuButton className="flex justify-between flex-1 items-center h-[38px] px-0 bg-[#FFFFFF]" disabled={loading}>
              <div className="text-black flex-1 flex items-center gap-2 rounded-lg py-1.5 px-3 data-[focus]:bg-[#E3E3E3] hover:bg-[#E3E3E3]">
                {agentStyle}
              </div>
              <img src={ArrowdownIcon} alt="arrowdown" className="w-[10px] h-[10px]" />
            </MenuButton>

            <MenuItems
              transition
              anchor="bottom end"
              className="select-none rounded-xl bg-white w-[205px] translate-x-[25px] p-[2px] transition duration-100 ease-out border-3 border-solid border-[#E3E3E3]"
              onMouseUp={event => handleSelectionChange(event, 'style')}
            >
              {styles.map(style => (
                <MenuItem as="div" data-value={style} key={style}>
                  <div className="flex items-center gap-2 text-[12px] text-black press-start-2p rounded-lg py-1.5 px-3 data-[focus]:bg-[#E3E3E3] hover:bg-[#E3E3E3]">
                    {style}
                  </div>
                </MenuItem>
              ))}
            </MenuItems>
          </Menu>
        </div>
        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
        <Button
          color={BTNCOLOR.BLACK}
          className="w-auto min-w-[346px] px-[28px] h-[48px] mt-[60px] text-white"
          type="submit"
          disabled={loading}
        >
          {loading ? 'Updating...' : 'Welcome!'}
        </Button>
      </form>
    </div>
  );
};

export default AgentCustomized;
