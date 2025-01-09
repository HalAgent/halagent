import React from 'react';
//import { useState } from 'react';
import WatchPanel from './components/WatchPanel';
import { ReactSVG } from 'react-svg';
import AddIcon from '@/assets/icons/add-more.svg';
import BackIcon from '@/assets/icons/back.svg';
import { useNavigate } from 'react-router-dom';

const WatchList: React.FC = () => {
  const navigate = useNavigate();

  const handleAddWatch = async () => {
    navigate('/plugin/discover');
  };

  return (
    <div className="page press-start-2p max-w-[490px]">
      <div className="press-start-2p flex flex-row flex-start gap-1 w-full">
        <ReactSVG src={BackIcon} className="color-inherit" style={{ marginLeft: '20px', marginRight: '20px' }}/>
        Watch List
        <ReactSVG src={AddIcon} className="color-inherit" style={{ marginLeft: '20px', marginRight: '20px' }} onClick={handleAddWatch}/>
      </div>
      <WatchPanel />
    </div>
  );
};

export default WatchList;
