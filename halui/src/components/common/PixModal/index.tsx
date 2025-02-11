import './index.less';

type PixModalProps = {
  children?: React.ReactNode;
  isOpen: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
  cancelText?: string;
  confirmText?: string;
  title?: string;
};

const PixModal: React.FC<PixModalProps> = ({ children, isOpen, onConfirm, onCancel, cancelText, confirmText, title }) => {
  return (
    <dialog
      className={`fixed z-9998 inset-0 box-border w-screen h-screen items-center justify-center p-4 bg-black/50 ${
        isOpen ? 'flex' : 'hidden'
      }`}
    >
      <div className="pixModal-bg">
        <div className="pixModal-title">{title}</div>
        {children}
        {(cancelText || confirmText) && (
          <div className="btn-wrap">
            <div className="btn-wrap-item" onClick={onCancel}>
              {cancelText}
            </div>
            <div className="btn-wrap-item" onClick={onConfirm}>
              {confirmText}
            </div>
          </div>
        )}
      </div>
    </dialog>
  );
};

export default PixModal;
