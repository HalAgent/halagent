import './index.less';
import ImgPickAdd from '@/assets/icons/pickAdd.svg';
import ImgPickDone from '@/assets/icons/pickDone.svg';
import { useGetXList } from '../Search/useGetXList';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
const Pick = () => {
  const navigate = useNavigate();
  const { xList, loading, searchUser, onFollow } = useGetXList();
  const goHome = () => {
    navigate('/');
  };
  useEffect(() => {
    searchUser('bnb', 15);
  }, []);
  if (loading) {
    return <></>;
  }
  return (
    <div className="pick">
      <div className="pick-title">
        PICK 5 TO
        <br /> MY WATCHLIST
      </div>
      <div className="pick-content">
        {xList.map(item => {
          return (
            <div className="pick-content-item">
              <div className="pick-content-item-avatar">
                <img src={item.avatar} className="pick-content-item-avatar-img" />
                <img
                  src={item.isWatched ? ImgPickDone : ImgPickAdd}
                  className="pick-content-item-avatar-icon"
                  onClick={() => {
                    onFollow(item);
                  }}
                />
              </div>
              <div className="pick-content-item-title hide-txt">{item.name}</div>
              <div className="pick-content-item-des hide-txt">@{item.username}</div>
            </div>
          );
        })}
      </div>
      <div className="pick-btn" onClick={goHome}>
        ok
      </div>
    </div>
  );
};
export default Pick;
