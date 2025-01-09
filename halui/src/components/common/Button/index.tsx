//
import './index.css';
import { BTNCOLOR } from '@/constant/button';

type ButtonProps = {
  color: BTNCOLOR;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
};

const Button: React.FC<ButtonProps> = ({ color = BTNCOLOR.BLACK, className, type = 'button', children, onClick, disabled = false }) => {
  return (
    <button className={`btn ${color} ${className}`} type={type} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
};

export default Button;
