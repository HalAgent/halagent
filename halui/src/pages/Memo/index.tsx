import React from 'react';
import MemoPng from '@/assets/images/temp/memo.png';

const Memo: React.FC = () => {
  return <div className="page press-start-2p max-w-[490px]">
    <img src={MemoPng} style={{ margin: '10px', width: '80%', height: '100%' }}/>
  </div>;
};

export default Memo;