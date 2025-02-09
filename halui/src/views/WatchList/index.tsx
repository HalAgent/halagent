import Share from '@/assets/icons/share.svg';
import BookMark from '@/assets/icons/bookmark.svg';
import Translate from '@/assets/icons/translate.svg';
import Copy from '@/assets/icons/copy.svg';
import './index.less';
import { ReactSVG } from 'react-svg';
import { watchApi, WatchResponse } from '@/services/watch';
import { useEffect, useState } from 'react';

const WatchList = () => {
  const [data, setData] = useState<WatchResponse['items']>([]);
  const fetchData = async () => {
    const result = await watchApi.getMyWatchList();
    setData(result);
  };
  useEffect(() => {
    fetchData();
  }, []);
  return (
    <div className="watch-list">
      <div className="watch-list-title">Watchlist</div>
      {data.map(item => {
        return (
          <div className="watch-list-item" key={item.updatedAt}>
            <div className="watch-list-item-date">{new Date(Number(item.updatedAt)).toLocaleDateString()}</div>
            <div className="watch-list-item-title">Sol Co-founder toly @aeyakovenko followed @Perena__ 1.5 hours ago</div>
            <div className="watch-list-item-des">
              Perena is a decentralized stablecoin infrastructure. Invested by institution xxx. Other well-known followers include: Sol
              domain founder @aomdotsol, Monke DAO founder @TheOnlyNom.
            </div>
            <div className="watch-list-item-footer">
              <ReactSVG className="watch-list-item-footer-item" src={Share}></ReactSVG>
              <ReactSVG className="watch-list-item-footer-item" src={BookMark}></ReactSVG>
              <ReactSVG className="watch-list-item-footer-item" src={Translate}></ReactSVG>
              <ReactSVG className="watch-list-item-footer-item" src={Copy}></ReactSVG>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default WatchList;
