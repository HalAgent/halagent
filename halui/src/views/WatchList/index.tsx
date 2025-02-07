import Share from '@/assets/icons/share.svg';
import BookMark from '@/assets/icons/bookmark.svg';
import Translate from '@/assets/icons/translate.svg';
import Copy from '@/assets/icons/copy.svg';
import './index.less';
import { ReactSVG } from 'react-svg';

const WatchList = () => {
  return (
    <div className="watch-list">
      <div className="watch-list-title">Watchlist</div>
      {[1, 1, 1, 11, 1, 1, 1, 1, 1, 1, 1, 1, 1, 11, 1].map(item => {
        return (
          <div className="watch-list-item">
            <div className="watch-list-item-date">2024-12-20</div>
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
