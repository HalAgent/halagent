import './index.css';

const Loading = ({ size = 28, className }: { size?: number; className?: string }) => {
  return <span className={`pod-loader ${className}`} style={{ width: size, height: size }}></span>;
};

export default Loading;
