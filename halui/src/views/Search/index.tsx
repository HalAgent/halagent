import ImgSearch from '@/assets/icons/search.svg';
import PixLoading from '@/components/common/PixLoading';

import './index.less';
import { ReactSVG } from 'react-svg';
import { useState } from 'react';

import { CheckIsMobile } from '@/utils/common';
import { useGetXList } from './useGetXList';
import { WatchItem } from '@/types/auth';
import { useUserStore } from '@/stores/useUserStore';
const isMobile = CheckIsMobile();

const Search = () => {
  const [value, setValue] = useState('');
  const [focus, setFocus] = useState(false);
  const { xList, loading, searchUser, onFollow } = useGetXList();
  const { userProfile } = useUserStore();
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      if (value) {
        searchUser(value);
      }
    }
  };
  const handleClick = async (
    e: React.MouseEvent<HTMLDivElement>,
    account: WatchItem & {
      isWatched: boolean;
    }
  ) => {
    e.stopPropagation();
    onFollow(account);
  };

  return (
    <div className="search-page">
      <div className="search-page-title">Search</div>
      <div className="search-page-input">
        <input
          className="search-page-input-main"
          placeholder="Enter X’s Username"
          value={value}
          onChange={e => setValue(e.target.value)}
          onFocus={() => setFocus(true)}
          onKeyDown={handleKeyDown}
        />
        <ReactSVG className="search-page-input-icon" src={ImgSearch} onClick={() => searchUser('bnb', 15)}></ReactSVG>
      </div>
      {/* watch list */}
      <div
        className="search-page-list"
        onClick={() => {
          setFocus(false);
        }}
      >
        {userProfile?.twitterWatchList?.map(item => {
          return (
            <div className="search-page-list-item" key={item.username}>
              <img src={item.avatar} className="search-page-list-item-avatar" />
              <div className="search-page-list-item-detail">
                <div className="search-page-list-item-detail-header">
                  <div className="search-page-list-item-detail-header-title">{item.name} </div>
                </div>
                <div className="search-page-list-item-detail-footer">@{item.username}</div>
              </div>
              <div
                className={`search-page-list-item-btn btn-scale`}
                onClick={e => {
                  handleClick(e, {
                    ...item,
                    isWatched: true,
                  });
                }}
              >
                UnFollow
              </div>
            </div>
          );
        })}
        <div style={{ height: '80px' }}></div>
      </div>
      {/* search list */}
      {((focus && xList.length) || loading) && (
        <div className="search-list" style={{ width: isMobile ? 'calc(100vw - 32px)' : '343px' }}>
          {loading ? (
            <div className="relative w-full frc-center">
              <PixLoading />
            </div>
          ) : (
            xList.map(item => (
              <div className="search-page-list-item" key={item.username}>
                <img src={item.avatar} className="search-page-list-item-avatar" />
                <div className="search-page-list-item-detail">
                  <div className="search-page-list-item-detail-header">
                    <div className="search-page-list-item-detail-header-title">{item.name} </div>
                  </div>
                  <div className="search-page-list-item-detail-footer">@{item.username}</div>
                </div>
                <div
                  className={`search-page-list-item-btn ${!item.isWatched && 'search-page-list-item-btn-active'} btn-scale`}
                  onClick={e => {
                    handleClick(e, item);
                  }}
                >
                  {item.isWatched ? 'UnFollow' : 'Follow'}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Search;
