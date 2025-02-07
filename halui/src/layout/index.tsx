import { CheckIsMobile } from '@/utils/common';

const isMobile = CheckIsMobile();

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className={isMobile ? '' : 'pc-bg'}>
      <div className='h5-page' style={{ width: isMobile ? '100%' : '375px' }}>{children}</div>
    </div>
  );
};

export default layout;
