import { useState } from 'react';

type IconWrapProps = {
  children: React.ReactNode;
  isSelected: boolean;
  title?: string;
  isShowTitle?: boolean;
  onClick: () => void;
};

const IconWrap = ({ children, isSelected, title, isShowTitle = true, onClick }: IconWrapProps) => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <div className="w-[32px] relative" onClick={onClick} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <div
        className={`rounded-full w-[32px] h-[32px] flex justify-center items-center ${
          isSelected ? 'bg-black text-white' : 'bg-white text-[#666666]'
        }`}
      >
        {children}
      </div>
      {isShowTitle && title && <div className="mt-2 text-[8px] text-center text-black">{title}</div>}
      {isHovered && (
        <div
          style={{
            position: 'absolute',
            top: '5px',
            left: '0px',
            transform: 'translateX(-110%)',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '5px',
            borderRadius: '4px',
            whiteSpace: 'nowrap',
            fontSize: '8px',
            zIndex: 1000,
          }}
        >
          {title}
        </div>
      )}
    </div>
  );
};

export default IconWrap;
