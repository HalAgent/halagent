import './index.css';

type PixModalProps = {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
};

const PixModal: React.FC<PixModalProps> = ({ children, isOpen }) => {
  return (
    <dialog
      className={`fixed z-9998 inset-0 box-border w-screen h-screen items-center justify-center p-4 bg-black/50 ${
        isOpen ? 'flex' : 'hidden'
      }`}
    >
      <div className="pixModal-bg flex box-border items-center justify-center p-4 relative">
        <div>
          {/* <XMarkIcon className="w-4 h-4 text-red absolute top-4 right-4 link-cursor" onClick={onClose} /> */}
          {children}
        </div>
      </div>
    </dialog>
  );
};

export default PixModal;
