import PixModal from '@/components/common/PixModal';
import TreatureBox from '@/assets/images/agent/treature-box.png';
import ShortButton from '../ShortButton';
import { useState } from 'react';
import Loading from '@/components/common/Loading';

type GiftModalProps = {
  isOpen: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

const GiftModal: React.FC<GiftModalProps> = ({ isOpen, onConfirm, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  // todo:
  const handleOpenBox = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onConfirm();
    }, 3000);
  };

  if (!isOpen) return null;
  return (
    <PixModal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col items-center justify-center gap-8">
        <h1 className="text-[12px] font-bold fcc-center">
          <span>You Got Level 12!</span>
          <span>Take Your Reward, Hero!</span>
        </h1>
        <div className="relative w-[104px] h-[72px]">
          <img src={TreatureBox} alt="gift-box" className="w-[104px] h-[72px]" />
          {isLoading && <Loading size={124} className="absolute top-[-26px] left-[-10px] z-1" />}
        </div>
        <ShortButton onClick={handleOpenBox} className="text-black text-center">
          OPEN!
        </ShortButton>
      </div>
    </PixModal>
  );
};

export default GiftModal;
