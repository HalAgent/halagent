import React from 'react';

interface PixBorderProps {
  top: string;
  bottom: string;
  left: string;
  right: string;
  className?: string;
  children: React.ReactNode;
}

const PixBorder: React.FC<PixBorderProps> = ({ top, bottom, left, right, className, children }) => {
  return (
    <div className={`relative m-[16px] p-[16px] ${className}`}>
      <img src={top} className="absolute top-0 left-[12px] right-0 w-[calc(100%-24px)] h-[3px]" />
      <img src={bottom} className="absolute bottom-0 left-[12px] right-0 w-[calc(100%-24px)] h-[7px]" />
      <img src={left} className="absolute top-0 bottom-0 left-0 h-full w-[12px]" />
      <img src={right} className="absolute top-0 bottom-0 right-0 h-full w-[12px]" />
      <div className="relative">{children}</div>
    </div>
  );
};

export default PixBorder;
