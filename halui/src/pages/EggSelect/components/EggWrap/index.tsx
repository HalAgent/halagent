// background
import './index.css';

type EggWrapProps = {
  children: React.ReactNode;
  isSelected: boolean;
  onClick: () => void;
  className?: string;
};

const EggWrap: React.FC<EggWrapProps> = ({ children, isSelected, onClick, className }) => {
  return (
    <div className="fcc-center">
      <div
        className={`relative egg-wrap cursor-selected frc-center ${isSelected ? 'egg-wrap-selected' : ''} ${className}`}
        onClick={onClick}
      >
        {isSelected && <div className="absolute w-[20px] h-[20px] top-0 right-0 egg-selected"></div>}
        {children}
      </div>
    </div>
  );
};

export default EggWrap;
