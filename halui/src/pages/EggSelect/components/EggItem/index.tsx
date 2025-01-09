// Colors
import './index.css';
import { EGG_COLOR } from '@/constant/egg';
import eggRed from '@/assets/images/eggs/egg-red.svg';
import eggBlue from '@/assets/images/eggs/egg-blue.svg';
import eggGreen from '@/assets/images/eggs/egg-green.svg';
import eggYellow from '@/assets/images/eggs/egg-yellow.svg';
import eggPurple from '@/assets/images/eggs/egg-purple.svg';
import eggPink from '@/assets/images/eggs/egg-pink.svg';
import eggBrown from '@/assets/images/eggs/egg-brown.svg';
import eggDarkblue from '@/assets/images/eggs/egg-darkblue.svg';

type Props = {
  color: EGG_COLOR;
};

const EggItem: React.FC<Props> = ({ color }) => {
  const eggImg = {
    red: eggRed,
    blue: eggBlue,
    green: eggGreen,
    yellow: eggYellow,
    purple: eggPurple,
    pink: eggPink,
    brown: eggBrown,
    darkblue: eggDarkblue,
  };

  return (
    <div className={`egg-item`}>
      <img src={`${eggImg[color]}`} alt={color} />
    </div>
  );
};

export default EggItem;
