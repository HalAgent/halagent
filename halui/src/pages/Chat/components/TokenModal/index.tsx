import PixModal from '@/components/common/PixModal';
import Coin from '@/assets/images/agent/coin.png';
import ShortButton from '../ShortButton';
import { authService } from '@/services/auth';

type TokenModalProps = {
  isOpen: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

const TokenModal: React.FC<TokenModalProps> = ({ isOpen, onConfirm, onClose }) => {
  if (!isOpen) return null;

  return (
    <PixModal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col items-center justify-center gap-8">
        <h1 className="text-[12px] font-bold fcc-center">
          <span>Congratulations!</span>
          <span> You Got 7 $Ai16z Tokens.</span>
        </h1>
        <img src={Coin} alt="gift-box" className="w-[72px] h-[72px]" />
        <ShortButton
          onClick={async () => {
            await onConfirm();

            if (isOpen) {
              // Define transfer data
              const transferData = {
                fromTokenAccountPubkey: 'Aqt3gNoArLCcomVLRbzSfb8epczukMi8tuVbtPKwHBTd',
                toTokenAccountPubkey: 'Bu3SVA3b1wcTZH3u3R1bDHzckoX2WRaxUpBd89MBF1YJ',
                ownerPubkey: 'Aqt3gNoArLCcomVLRbzSfb8epczukMi8tuVbtPKwHBTd',
                tokenAmount: 7, // Amount of Ai16z tokens to transfer
              };

              // Call transferSol function
              authService
                .transferSol(transferData)
                .then(response => {
                  console.log('Transfer successful:', response);
                })
                .catch(error => {
                  console.error('Transfer failed:', error);
                });
            }
          }}
          className="text-black"
        >
          OK!
        </ShortButton>
      </div>
    </PixModal>
  );
};

export default TokenModal;
