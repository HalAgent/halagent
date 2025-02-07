import './index.less';
const Pick = () => {
  return (
    <div className="pick">
      <div className="pick-title">
        PICK 5 TO
        <br /> MY WATCHLIST
      </div>
      <div className="pick-content">
        {[1, 2, 3, 4, 5,1,1,1,1,1,1,1,1,1,1].map(item => {
          return (
            <div className="pick-content-item">
              <div className="pick-content-item-avatar">
                <img src="" className="pick-content-item-avatar-img" />
                <img src="" className="pick-content-item-avatar-icon" />
              </div>
              <div className="pick-content-item-title hide-txt">ai16zai16z</div>
              <div className="pick-content-item-des hide-txt">@ai16zdao6zdao</div>
            </div>
          );
        })}
      </div>
      <div className="pick-btn">ok</div>
    </div>
  );
};
export default Pick;
