import './index.less';
import { useNavigate } from 'react-router-dom';
import backLeft from '@/assets/icons/back-left.svg';
import person from '@/assets/icons/person.png';
import Send from '@/assets/icons/Send.svg';
import SendActive from '@/assets/icons/Send-active.svg';
import LoadingImg from '@/assets/icons/loading.svg';
import { useEffect, useState, useCallback, useRef } from 'react';
import FooterOperation from '@/components/FooterOperation';
import { chatApi } from '@/services/chat';

type Message = {
  text: string;
  user: string;
  action: string;
  displayText: string; // Added displayText field
};
const TokenName = [
  'btc',
  'eth',
  'sol',
  'bnb',
  'xrp',
  'sui',
  'doge',
  'pepe',
  'trump',
  'ton',
  'shib',
  'ondo',
  'wif',
  'ai16z',
  'aixbt',
  'pnut',
  'bera',
];
const Chat = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [messageList, setMessageList] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const isTranslatingRef = useRef(false);
  const chatContainerRef = useRef<HTMLUListElement | null>(null); // Added ref for message container

  const keyList = ['AI Prediction', 'Bitcoin.D', 'Altcoin Index'];

  // Load saved messages from local storage and initialize displayText
  useEffect(() => {
    const savedMessages = localStorage.getItem('ChatMessage');
    if (savedMessages) {
      const parsedMessages: Message[] = JSON.parse(savedMessages);
      const initializedMessages = parsedMessages.map(msg => ({
        ...msg,
        displayText: msg.text, // Initially show the full content
      }));
      setMessageList(initializedMessages);
    }
  }, []);

  // Save messages to local storage
  useEffect(() => {
    if (messageList.length > 0) {
      localStorage.setItem('ChatMessage', JSON.stringify(messageList));
    }
  }, [messageList]);

  // Scroll to the bottom when the message list changes
  useEffect(() => {
    if (chatContainerRef.current && !isTranslatingRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth', // Smooth scrolling
      });
    }
  }, [messageList]); // Triggered when messageList changes

  const AIMessage = ({ message, onDisplayUpdate }: { message: Message; onDisplayUpdate: (text: string) => void }) => {
    useEffect(() => {
      // Skip if the content is already complete
      if (message.displayText === message.text) return;

      let currentIndex = message.displayText.length;
      const timer = setInterval(() => {
        if (currentIndex < message.text.length) {
          onDisplayUpdate(message.text.substring(0, currentIndex + 1));
          currentIndex++;
        } else {
          clearInterval(timer);
        }
      }, 10); // Adjust typing speed

      return () => clearInterval(timer);
    }, [message.text, message.displayText, onDisplayUpdate]);

    return <>{message.displayText}</>;
  };

  // Handle input changes in the text area
  const onInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = '18px';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, []);

  // Send message
  const onSend = useCallback(() => {
    if (!text.trim() || loading) return;

    setLoading(true);
    chatApi
      .createChat(text)
      .then(res => {
        setText('');
        // Add user message (immediately displayed) and AI message (empty displayText for typing effect)
        setMessageList(prev => [
          ...prev,
          { text, user: 'user', action: 'NONE', displayText: text },
          { ...res, displayText: '' }, // AI message starts with empty displayText
        ]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [text, loading]);

  // Listen for keyboard input
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.altKey) {
        e.preventDefault();
        onSend();
      }
    },
    [onSend]
  );

  const handleTranslate = (text: string, index: number) => {
    console.warn(text);
    isTranslatingRef.current = true;
    setMessageList(prevData => {
      const newData = [...prevData];
      newData[index].text = text;
      newData[index].displayText = text;
      return newData;
    });
    setTimeout(() => {
      isTranslatingRef.current = false;
    }, 2000);
  };
  const handleRefresh = () => {
    setLoading(true);
    chatApi
      .createChat(messageList[messageList.length - 2].text)
      .then(res => {
        setMessageList(prevData => {
          const newData = [...prevData];
          newData[newData.length - 1].text = res.text;
          newData[newData.length - 1].displayText = '';
          return newData;
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };
  const handleKeyPress = async (key: string) => {
    if (key === 'AI Prediction') {
      if (loading) {
        return;
      }
      setLoading(true);
      // 20 choose 1
      const query = TokenName[Math.floor(Math.random() * TokenName.length)];
      try {
        const response = await chatApi.bnbQuery(query);
        const queryUpperCase = query.toUpperCase();
        // setMessages([
        //   ...messages,
        //   { title: 'AI Analysis', text: `${response.coin_analysis}`, user: 'agent', action: 'NONE', noRefresh: true },
        //   { title: 'AI Prediction', text: `${response.coin_prediction}`, user: 'agent', action: 'NONE', noRefresh: true },
        // ]);
        setMessageList([
          ...messageList,
          {
            text: `${queryUpperCase} Analysis\n${response.coin_analysis}\n\n${queryUpperCase} Prediction\n${response.coin_prediction}`,
            displayText: '',
            user: 'agent',
            action: 'bnbQuery',
          },
        ]);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="chat-page">
      {/* header */}
      <header className="chat-page-header">
        <img src={backLeft} alt="Back" onClick={() => navigate(-1)} />
        <img src={person} alt="User" />
        <span>Ask Daisy 9000</span>
      </header>

      {/* content */}
      <ul className="chat-page-cont" ref={chatContainerRef}>
        {messageList.map((item, index) => (
          <li key={index} className={`chat-page-cont-item ${item.user === 'user' ? 'self' : ''}`}>
            {item.user === 'user' ? (
              item.text
            ) : (
              <AIMessage
                message={item}
                onDisplayUpdate={newDisplayText => {
                  setMessageList(prev => {
                    const newList = [...prev];
                    newList[index] = { ...newList[index], displayText: newDisplayText };
                    return newList;
                  });
                }}
              />
            )}
            {item.user !== 'user' && item.displayText === item.text && (
              <FooterOperation
                text={item.text}
                onTranslate={text => {
                  handleTranslate(text, index);
                }}
                onRefresh={handleRefresh}
                menuList={
                  index === messageList.length - 1 && item.action !== 'bnbQuery'
                    ? ['share', 'bookmark', 'translate', 'copy', 'refresh']
                    : ['share', 'bookmark', 'translate', 'copy']
                }
              />
            )}
          </li>
        ))}
      </ul>

      {/* bottom input area */}
      <div className="chat-page-bottom">
        <ul className="chat-page-keys">
          {keyList.map(item => (
            <li className="chat-page-items" key={item} onClick={() => handleKeyPress(item)}>
              {item}
            </li>
          ))}
        </ul>
        <div className="chat-page-input">
          <textarea
            ref={textareaRef}
            placeholder="Chat with me..."
            value={text}
            onInput={onInput}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          {loading ? <img src={LoadingImg} className="chat-loading" /> : <img src={text ? SendActive : Send} alt="Send" onClick={onSend} />}
        </div>
      </div>
    </div>
  );
};

export default Chat;
