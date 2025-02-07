import ImgSearch from '@/assets/icons/search.svg';
import PixLoading from '@/components/common/PixLoading';

import './index.less';
import { ReactSVG } from 'react-svg';
import { useState } from 'react';

import { CheckIsMobile } from '@/utils/common';
const isMobile = CheckIsMobile();

const Search = () => {
  const [focus, setFocus] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <div className="search-page">
      <div className="search-page-title">Search</div>
      <div className="search-page-input">
        <input className="search-page-input-main" placeholder="Enter X’s Username" onFocus={() => setFocus(true)} />
        <ReactSVG className="search-page-input-icon" src={ImgSearch}></ReactSVG>
      </div>
      {/* watch list */}
      <div
        className="search-page-list"
        onClick={() => {
          setFocus(false);
        }}
      >
        {[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 11].map(item => {
          return (
            <div className="search-page-list-item">
              <img className="search-page-list-item-avatar" />
              <div className="search-page-list-item-detail">
                <div className="search-page-list-item-detail-header">
                  <div className="search-page-list-item-detail-header-title">ai16z </div>
                </div>
                <div className="search-page-list-item-detail-footer">@ai16zdao</div>
              </div>
              <div className={`search-page-list-item-btn btn-scale`}>UnFollow</div>
            </div>
          );
        })}
        <div style={{ height: '80px' }}></div>
      </div>
      {/* search list */}
      {(focus || loading) && (
        <div className="search-list" style={{ width: isMobile ? 'calc(100vw - 32px)' : '343px' }}>
          {loading ? (
            <div className="relative w-full frc-center">
              <PixLoading />
            </div>
          ) : (
            [1, 1, 1, 11, 1, 1, 11, 1, 11, 11, 1].map(item => (
              <div className="search-page-list-item">
                <img className="search-page-list-item-avatar" />
                <div className="search-page-list-item-detail">
                  <div className="search-page-list-item-detail-header">
                    <div className="search-page-list-item-detail-header-title">ai16z </div>
                  </div>
                  <div className="search-page-list-item-detail-footer">@ai16zdao</div>
                </div>
                <div className={`search-page-list-item-btn btn-scale`}>UnFollow</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Search;
