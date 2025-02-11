import { ReactSVG } from 'react-svg';
// import ImgSearch from '@/assets/icons/search2.svg';
// import ImgAdd from '@/assets/icons/add.svg';
import ImgAi from '@/assets/icons/ai.svg';
import ImgDelete from '@/assets/icons/Delete.svg';
import ImgTime from '@/assets/icons/Time.svg';
import ImgShare from '@/assets/icons/share.svg';
import { memoApi } from '@/services/memo';
import { Memo } from '@/types/memo';

import './index.less';
import { useEffect, useState } from 'react';
import useShare from '@/hooks/useShare';
import PixModal from '@/components/common/PixModal/index';
import { useUserStore } from '@/stores/useUserStore';
import LoginTips from '@/components/LoginTips';

const MemoPage = () => {
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [memos, setMemos] = useState<Memo[]>([]);
  const [current, setCurrent] = useState<Memo>();
  const { handleShareClick: shareHook } = useShare();
  const { userProfile } = useUserStore();
  const [isLogin, setIsLogin] = useState(true);

  const handlerSDhare = (item: Memo) => {
    shareHook(item.content);
  };
  const handlerDelete = (item: Memo) => {
    setIsOpen(true);
    setCurrent(item);
  };

  const handlerConfirmDelete = () => {
    memoApi.deleteMomo([current!.id]).then(() => {
      setMemos(prev => prev.filter(memo => memo.id !== current!.id));
      setIsOpen(false);
    });
  };

  useEffect(() => {
    if (userProfile?.gmail) {
      setLoading(true);
      try {
        memoApi.reset();
        memoApi.getMemoList().then(data => {
          setMemos(data.reverse());
        });
      } finally {
        setLoading(false);
      }
    } else {
      setIsLogin(false);
    }
  }, []);
  return (
    <div className="memo">
      <PixModal
        isOpen={isOpen}
        title="Delete Confirmation"
        cancelText="Cancel"
        onCancel={() => setIsOpen(false)}
        confirmText="Confirm"
        onConfirm={handlerConfirmDelete}
      ></PixModal>
      <div className="memo-title">
        <div className="memo-title-text">Memo</div>
        {/* <ReactSVG className="memo-title-icon" src={ImgSearch}></ReactSVG>
        <ReactSVG className="memo-title-icon" src={ImgAdd}></ReactSVG> */}
        <ReactSVG className=" w-[28px] h-[28px] ml-[58px]" src={ImgAi}></ReactSVG>
        <div className="memo-operation-des mr-[16px]">AI summary</div>
      </div>
      {!isLogin && <LoginTips></LoginTips>}
      <div className="memo-list">
        {memos.map(item => {
          return (
            <div className="memo-list-item">
              {/* <div className="memo-list-item-title">
                <div className="memo-list-item-title-text hide-txt">{item.title}</div>
              </div> */}
              <div className="memo-list-item-des">{item.content}</div>
              <div className="memo-list-item-footer">
                <ReactSVG className="memo-list-item-footer-icon" src={ImgTime}></ReactSVG>
                <div className="memo-list-item-footer-des">Note · Nov 23, 2024</div>
                <ReactSVG
                  className="memo-list-item-footer-icon"
                  style={{ color: '#b9b9b9', marginBottom: '-2px', marginRight: '2px' }}
                  src={ImgShare}
                  onClick={() => {
                    handlerSDhare(item);
                  }}
                ></ReactSVG>
                <ReactSVG
                  className="memo-list-item-footer-icon"
                  style={{ color: '#b9b9b9' }}
                  src={ImgDelete}
                  onClick={() => {
                    handlerDelete(item);
                  }}
                ></ReactSVG>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MemoPage;
