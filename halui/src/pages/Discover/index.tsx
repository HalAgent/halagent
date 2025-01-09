import React from 'react';
import { ReactSVG } from 'react-svg';
import BackIcon from '@/assets/icons/back.svg';
import { useNavigate } from 'react-router-dom';
import FollowPng from '@/assets/images/temp/followlist.png';

const Discover: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = async () => {
    navigate('/plugin/watch-list');
  };

  return <div className="page press-start-2p max-w-[490px]">
    <div className="press-start-2p flex flex-row flex-start gap-1 w-full" style={{ textAlign: 'left' }}>
      <ReactSVG src={BackIcon} className="color-inherit" style={{ marginLeft: '20px', marginRight: '20px' }} onClick={handleBack}/>
      My Watch List
    </div>
    <img src={FollowPng} style={{ margin: '20px', width: '80%', height: '100%' }}/>
  </div>;
};

export default Discover;
