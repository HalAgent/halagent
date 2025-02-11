import './index.less';
import ImgPickAdd from '@/assets/icons/pickAdd.svg';
import ImgPickDone from '@/assets/icons/pickDone.svg';
import { useGetXList } from '../Search/useGetXList';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import PixLoading from '@/components/common/PixLoading';
const Pick = () => {
  const navigate = useNavigate();
  const { xList, TwitterProfileKols, onFollow, loading } = useGetXList();
  const goHome = () => {
    const list = xList.filter(item => item.isWatched);
    if (list.length < 5) {
      toast('Please pick at least 5.');
      return;
    }
    navigate('/');
  };
  useEffect(() => {
    TwitterProfileKols();
  }, []);
  if (loading) {
    return <PixLoading></PixLoading>;
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
              <div
                className="pick-content-item-avatar"
                onClick={() => {
                  onFollow(item);
                }}
              >
                <img src={item.avatar} className="pick-content-item-avatar-img" />
                <img src={item.isWatched ? ImgPickDone : ImgPickAdd} className="pick-content-item-avatar-icon" />
              </div>
              <div className="pick-content-item-title hide-txt">{item.name}</div>
              <div className="pick-content-item-des hide-txt">@{item.username}</div>
            </div>
          );
        })}
      </div>
      <div className="pick-btn" onClick={goHome}>
        OK
      </div>
    </div>
  );
};
export default Pick;
