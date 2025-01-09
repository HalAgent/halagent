import React from 'react';
import aniya2 from '@/assets/images/aniya/2.gif';

interface SuperLoadingProps {
  className?: string;
  loadingImage?: string;
  loadingImageClassName?: string;
  desc?: string;
  descClassName?: string;
}

const SuperLoading: React.FC<SuperLoadingProps> = ({
  desc,
  className = 'fixed top-0 left-0 w-full h-full z-100 bg-white',
  loadingImageClassName = 'w-[140px] h-[90px]',
  descClassName = 'mt-10 text-xl text-black',
  loadingImage = aniya2,
}) => {
  return (
    <div className={`fcc-center ${className}`}>
      <div className="fcc-center">
        <img src={loadingImage} alt="Loading" className={loadingImageClassName} />
        {desc && <div className={descClassName}>{desc}</div>}
      </div>
    </div>
  );
};

export default SuperLoading;
