import './index.css';

const ShortButton = ({ children, onClick, className }: { children: React.ReactNode; onClick: () => void; className?: string }) => {
  return (
    <button className={`w-[104px] h-[28px] btn-short-black hover:scale-105 ${className}`} onClick={onClick}>
      {children}
    </button>
  );
};

export default ShortButton;
