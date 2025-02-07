import React from 'react';
import styles from './style.module.css';

const PixLoading: React.FC = () => {
  return (
    <div className={styles.loading}>
      {Array.from({ length: 16 }).map((_, index) => (
        <div key={index}></div>
      ))}
    </div>
  );
};

export default PixLoading;
