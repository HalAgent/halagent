import React, { useState, useRef } from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/solid';
import sendIcon from '@/assets/icons/send.svg';
import voiceIcon from '@/assets/icons/voice.svg';
import { ReactSVG } from 'react-svg';
interface ChatInputProps {
  onSend: (message: string) => Promise<void>;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled = false, placeholder = 'Cuckoo, I want to...' }) => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading || disabled) return;

    setIsLoading(true);
    try {
      await onSend(message.trim());
      setMessage('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex-1 border-t border-gray-200 bg-white">
      <div className="flex flex-col items-end space-x-2">
        <div className="flex-1 w-full h-full">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || isLoading}
            rows={2}
            className="box-border w-full h-20 px-2 py-1 resize-none rounded-lg bg-white text-black border border-gray-300 placeholder-gray-400 focus:outline-none"
          />
        </div>
        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={!message.trim() || isLoading || disabled}
            className={`frc-center font-medium text-[#B6B6B6] ${
              !message.trim() || isLoading || disabled ? 'cursor-not-allowed' : 'hover:text-blue-600'
            }`}
          >
            {isLoading ? <ArrowPathIcon className="animate-spin h-5 w-5" /> : <ReactSVG src={voiceIcon} className="h-5 w-5 frc-center" />}
          </button>
          <button
            type="submit"
            disabled={!message.trim() || isLoading || disabled}
            className={`frc-center font-medium text-[#B6B6B6] ${
              !message.trim() || isLoading || disabled ? 'cursor-not-allowed' : 'hover:text-blue-600'
            }`}
          >
            {isLoading ? <ArrowPathIcon className="animate-spin h-5 w-5" /> : <ReactSVG src={sendIcon} className="h-5 w-5 frc-center" />}
          </button>
        </div>
      </div>
    </form>
  );
};
