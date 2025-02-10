import { ReactSVG } from 'react-svg';
import Share from '@/assets/icons/share.svg';
import BookMark from '@/assets/icons/bookmark.svg';
import Translate from '@/assets/icons/translate.svg';
import Copy from '@/assets/icons/copy.svg';
import './index.less';
import React, { useState } from 'react';
import useShare from '@/hooks/useShare';
import useTranslate from '@/hooks/useTranslate';
import { toast } from 'react-toastify';

interface FooterOperationProps {
  menuList?: Array<'share' | 'bookmark' | 'translate' | 'copy'>;
  text?: string;
  onShare?: () => void;
  onBookmark?: () => void;
  onTranslate?: (text: string) => void;
  onCopy?: () => void;
}

const FooterOperation = React.memo<FooterOperationProps>(
  ({ menuList = ['share', 'bookmark', 'translate', 'copy'], text = '', onShare, onBookmark, onTranslate, onCopy }) => {
    const [isTranslating, setIsTranslating] = useState(false);
    const { handleShareClick: shareHook } = useShare();
    const { handleTranslateClick: translateHook } = useTranslate();

    const handleShareClick = () => {
      if (onShare) {
        onShare();
      } else {
        shareHook(text);
      }
    };

    const handleBookmarkClick = () => {
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
        {menuList.includes('bookmark') && <ReactSVG className="footer-operation-item" src={BookMark} onClick={handleBookmarkClick} />}
        {menuList.includes('translate') && <ReactSVG className="footer-operation-item" src={Translate} onClick={handleTranslateClick} />}
        {menuList.includes('copy') && <ReactSVG className="footer-operation-item" src={Copy} onClick={handleCopyClick} />}
      </div>
    );
  }
);

export default FooterOperation;
