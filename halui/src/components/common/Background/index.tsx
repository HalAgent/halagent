/**
 * description:
 * author: victor
 * date: 2024-12-21
 */
import aniya from '@/assets/images/aniya/1.gif';
import './index.css';

const Background: React.FC = () => {
  return (
    <div className="w-full h-screen">
      <div className="w-full h-full relative flex flex-col items-center justify-end">
        <div className="bg-mountain"></div>
        <div className="absolute bottom-[76px] right-[100px]">
          <img src={aniya} alt="aniya" className="w-[65px] h-full object-cover" />
        </div>
        <div className="bg-ground"></div>
      </div>
    </div>
  );
};

export default Background;
