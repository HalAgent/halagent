import { ReactSVG } from 'react-svg';
import ImgSearch from '@/assets/icons/search2.svg';
import ImgAdd from '@/assets/icons/add.svg';
import ImgAi from '@/assets/icons/ai.svg';
import ImgDelete from '@/assets/icons/Delete.svg';
import ImgTime from '@/assets/icons/Time.svg';
import ImgShare from '@/assets/icons/share.svg';

import { Checkbox } from '@headlessui/react';
import { CheckIcon } from '@heroicons/react/16/solid';
import './index.less';
import { useState } from 'react';

const Memo = () => {
  const [enabled, setEnabled] = useState(false);
  return (
    <div className="memo">
      <div className="memo-title">
        <div className="memo-title-text">Memo</div>
        <ReactSVG className="memo-title-icon" src={ImgSearch}></ReactSVG>
        <ReactSVG className="memo-title-icon" src={ImgAdd}></ReactSVG>
      </div>
      <div className="memo-operation">
        <Checkbox
          checked={enabled}
          onChange={setEnabled}
          className="group mr-[11px] w-[22px] h-[22px] border border-solid  border-[#2a2a2a] rounded-[4px] text-black flex items-center justify-center
"
        >
          <CheckIcon className="hidden size-4 fill-black group-data-[checked]:block" />
        </Checkbox>
        <div className="memo-operation-des flex-1">Selected 0 items</div>
        <ReactSVG className=" w-[28px] h-[28px] ml-[58px]" src={ImgAi}></ReactSVG>
        <div className="memo-operation-des mr-[16px]">AI summary</div>
        <ReactSVG className="memo-operation-icon" src={ImgDelete}></ReactSVG>
      </div>
      <div className="memo-list">
        {[1, 1, 1, 1, 1, 1, 1, 1, 1].map(item => {
          return (
            <div className="memo-list-item">
              <div className="memo-list-item-title">
                <div className="memo-list-item-title-text hide-txt">Introducing Memo</div>
                <Checkbox
                  checked={enabled}
                  onChange={setEnabled}
                  className="group mr-[11px] w-[22px] h-[22px] border border-solid  border-[#2a2a2a] rounded-[4px] text-black flex items-center justify-center
      "
                >
                  <CheckIcon className="hidden size-4 fill-black group-data-[checked]:block" />
                </Checkbox>
              </div>
              <div className="memo-list-item-des">
                Memo is your exclusive Alknowledge base. You cancollect any webpage, Al chatrecords, images, and PDF...
              </div>
              <div className="memo-list-item-footer">
                <ReactSVG className="memo-list-item-footer-icon" src={ImgTime}></ReactSVG>
                <div className="memo-list-item-footer-des">Note · Nov 23, 2024</div>
                <ReactSVG className="memo-list-item-footer-icon" style={{ color: '#b9b9b9' }} src={ImgShare}></ReactSVG>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Memo;
