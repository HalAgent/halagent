import { ReactSVG } from 'react-svg';
import Share from '@/assets/icons/share.svg';
import BookMark from '@/assets/icons/bookmark.svg';
import Translate from '@/assets/icons/translate.svg';
import Refresh from '@/assets/icons/refresh.svg';
import ImgTrue from '@/assets/icons/true.svg';
import Copy from '@/assets/icons/copy.svg';
import './index.less';
import React, { useState } from 'react';
import useShare from '@/hooks/useShare';
import useTranslate from '@/hooks/useTranslate';
import { toast } from 'react-toastify';
import { memoApi } from '@/services/memo';
import { useUserStore } from '@/stores/useUserStore';

interface FooterOperationProps {
  menuList?: Array<'share' | 'bookmark' | 'translate' | 'copy' | 'refresh'>;
  text?: string;
  onShare?: () => void;
  onBookmark?: () => void;
  onTranslate?: (text: string) => void;
  onCopy?: () => void;
  onRefresh?: () => void;
}

const FooterOperation = React.memo<FooterOperationProps>(
  ({ menuList = ['share', 'bookmark', 'translate', 'copy'], text = '', onShare, onBookmark, onTranslate, onCopy, onRefresh }) => {
    const [isTranslating, setIsTranslating] = useState(false);
    const [isBookMark, setIsBookMark] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const { handleShareClick: shareHook } = useShare();
    const { handleTranslateClick: translateHook } = useTranslate();
    const { userProfile } = useUserStore();

    const handleShareClick = () => {
      if (onShare) {
        onShare();
      } else {
        shareHook(text);
      }
    };

    const handleBookmarkClick = () => {
      if (!userProfile?.gmail) {
        toast('Please login to Google before using this page.');
        return;
      }
      memoApi.addMemo(text);
      setIsBookMark(true);
      if (onBookmark) {
        onBookmark();
      }
    };

    const handleTranslateClick = async () => {
      if (isTranslating) {
        toast('Translation in progress, please wait...');
        return;
      }
      setIsTranslating(true);
      try {
        const translatedText = await translateHook(text);
        if (onTranslate) {
          onTranslate(translatedText);
        }
      } finally {
        setIsTranslating(false);
      }
    };

    const handleCopyClick = async () => {
      try {
        await navigator.clipboard.writeText(text);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 3000);
        toast('Copied to clipboard!');
      } catch {
        toast.error('Failed to copy!');
      }
      if (onCopy) {
        onCopy();
      }
    };

    return (
      <div className="footer-operation">
        {menuList.includes('share') && <ReactSVG className="footer-operation-item" src={Share} onClick={handleShareClick} />}
        {menuList.includes('bookmark') &&
          (isBookMark ? (
            <ReactSVG className="footer-operation-item" style={{ marginTop: '-2px', color: '#222' }} src={ImgTrue} />
          ) : (
            <ReactSVG className="footer-operation-item" src={BookMark} onClick={handleBookmarkClick} />
          ))}
        {menuList.includes('translate') && navigator.language.split('-')[0] !== 'en' && (
          <ReactSVG className="footer-operation-item" src={Translate} onClick={handleTranslateClick} />
        )}
        {menuList.includes('copy') &&
          (isCopied ? (
            <ReactSVG className="footer-operation-item" style={{ marginTop: '-2px', color: '#222' }} src={ImgTrue} />
          ) : (
            <ReactSVG className="footer-operation-item" src={Copy} onClick={handleCopyClick} />
          ))}
        {menuList.includes('refresh') && <ReactSVG className="footer-operation-item" src={Refresh} onClick={onRefresh} />}
      </div>
    );
  }
);

export default FooterOperation;
