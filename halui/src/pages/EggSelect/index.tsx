import { useState } from 'react';
import { EGG_COLOR } from '@/constant/egg';
import { BTNCOLOR } from '@/constant/button';
import Background from '@/components/common/Background';
import Button from '@/components/common/Button';
import EggItem from './components/EggItem';
import EggWrap from './components/EggWrap';
import { useNavigate } from 'react-router-dom';

const EggSelect: React.FC = () => {
  const [selectedEgg, setSelectedEgg] = useState<EGG_COLOR | null>(null);

  const navigate = useNavigate();

  const handleNext = () => {
    if (selectedEgg) {
      localStorage.setItem('egg', selectedEgg);
      navigate('/egg-config');
    }
  };

  const handleEggClick = (color: EGG_COLOR) => {
    setSelectedEgg(color);
  };

  return (
    <div className="page press-start-2p">
      <div className="absolute top-0 left-0 z-[-1] w-full h-full bg-white">
        <Background />
      </div>

      <div className="text-center w-auto min-w-[290px] mx-[20px] mt-[120px] mb-[50px]">
        <h1 className="press-start-2p text-xl">SELECT AN AGENT EGG</h1>
      </div>
      {/* grid */}
      <div className="grid grid-cols-4 gap-[10px]">
        {Object.values(EGG_COLOR).map(color => (
          <EggWrap key={color} isSelected={selectedEgg === color} onClick={() => handleEggClick(color)} className="w-[95px] h-[95px]">
            <EggItem color={color} />
          </EggWrap>
        ))}
      </div>
      <Button color={BTNCOLOR.BLACK} className="w-auto min-w-[346px] px-[28px] h-[48px] mt-[60px] text-white" type="submit" onClick={handleNext}>
        OK
      </Button>
    </div>
  );
};

export default EggSelect;
