import React from 'react';
import './index.less';

const PixLoading: React.FC<{
  style?: React.CSSProperties;
}> = ({ style }) => {
  return (
    <div className="pix-loading" style={style}>
      <div className="pix-loading-spinner" />
    </div>
  );
};

export default PixLoading;
