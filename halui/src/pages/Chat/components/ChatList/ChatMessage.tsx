import React from 'react';
import { Message } from '@/types/chat';
import { ReactSVG } from 'react-svg';
import tempGroupIcon from '@/assets/icons/temp-group-1.svg';

export const ChatMessage: React.FC<Message> = ({ text, user, title, updatedAt }) => {
  const isUser = user === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 animate-fade-in`}>
      <div
        className={`flex flex-col max-w-[80%] items-center px-6 py-2 ${
          isUser
            ? 'bg-#2A2A2A text-white rounded-tl-[24px] rounded-tr-[24px] rounded-bl-[24px] rounded-br-none'
            : 'bg-#F3F3F3 text-black rounded-tl-[24px] rounded-tr-[24px] rounded-bl-none rounded-br-[24px]'
        }`}
      >
        {updatedAt && (
          <p className="w-full text-[12px] inknut-antiqua text-gray-400" style={{ textAlign: 'left' }}>{updatedAt}</p>
        )}
        {title && (
          <p className="w-full text-[14px] inknut-antiqua" style={{ textAlign: 'left', fontWeight: 'bold' }}>{title}</p>
        )}
        {title ? <p className="text-[12px] inknut-antiqua text-gray-600">{text}</p>
          : <p className="text-[12px] inknut-antiqua">{text}</p>}
        {!isUser && (
          <div className="w-full flex items-center justify-end">
            <ReactSVG src={tempGroupIcon} />
          </div>
        )}
      </div>
    </div>
  );
};
