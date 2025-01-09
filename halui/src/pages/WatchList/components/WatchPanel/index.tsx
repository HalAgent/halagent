import React, { useState } from 'react';
import './index.css';
import { ChatInput } from '../../../Chat/components/ChatInput';
import { ChatHistory } from '../../../Chat/components/ChatList/ChatHistory';
import { Message } from '@/types/chat';
import { watchApi } from '@/services/watch';
import { useEffect } from 'react';
//import WatchPng from '@/assets/images/temp/watchlist.png';

const LOCALSTORAGE_ITEM_WATCHLIST = "_web3agent_watchlist_";

const WatchPanel: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>( () => {
    const initData = [
    {
      title: 'Sol Co-founder toly @aeyakovenko followed @Perena__',
      updatedAt: '2024-12-20',
      text: `Perena is a decentralized stablecoin infrastructure. Invested by institution xxx. Other well-known followers include: Sol domain founder @aomdotsol, Monke DAO founder @TheOnlyNom. 

According to the disclosed information, the project has not yet issued coins, but it launched an airdrop promotion plan with Binance on November 15, indicating that there is a certain background and it needs to be paid attention to.`,
      user: 'agent',
      action: 'NONE',
    },
    {
      title: 'Ai16z Founder shawn @shawmakesmagic reply @BasedBeffJezos some hours ago',
      updatedAt: '2024-12-20',
      text: `@BasedBeffJezos is a dynamic thought leader and founder of e/acc, focused on:

Thermodynamics: Exploring energy systems and sustainability.
Kardashev Climbing: Advancing civilization through technology.
Memetic Warfare: Utilizing memes for cultural influence.

He is also involved with @extropic_ai, pushing the boundaries of artificial intelligence, Innovating in...`,
      user: 'agent',
      action: 'NONE',
    }
    ];

    let savedMsgs = localStorage.getItem(LOCALSTORAGE_ITEM_WATCHLIST);
    return savedMsgs ? JSON.parse(savedMsgs) : initData;
  });

  const [inputValue, setInputValue] = useState('');
  //const GEN_TOKEN_REPORT_DELAY = 1000 * 60 * 10; // 10 mins

  const addMessage = (newMsg: Message) => {
    setMessages([...messages, newMsg]);
    const msgsToSave = messages.length > 20 ? messages.slice(-20) : messages;
    localStorage.setItem(LOCALSTORAGE_ITEM_WATCHLIST, JSON.stringify(msgsToSave));
  };

  const handleSendMessage = async (message: string) => {
    let resp = await watchApi.getWatch();
    addMessage({ text: resp.text, user: 'agent', title: resp.title, updatedAt: resp.updatedAt, action: 'NONE' });
    if (message.trim()) {
      setInputValue('');
    }
  };

  const getWatchTextLoop = async () => {
    console.log('genReportLoop loop');
    await handleSendMessage('');

    //setTimeout(() => {
    //getWatchTextLoop(); //next iteration
    //}, GEN_TOKEN_REPORT_DELAY);
  };

  useEffect(() => {
    getWatchTextLoop();
  }, []);

  return (
    <div className={`bg-white z-10 w-full h-full flex flex-col justify-between transition-all duration-300`}>
      <div className="flex-1 overflow-y-auto pt-[48px] pb-[16px] border border-gray-300 relative">
        <ChatHistory messages={messages} />
      </div>
      <div className="textarea-border border-box flex items-center justify-between m-2 p-2">
        <ChatInput placeholder={inputValue ? '' : 'Chat with me...'} onSend={handleSendMessage} />
      </div>
    </div>
  );
};

export default WatchPanel;
//<ChatHistory messages={messages} />
//<img src={WatchPng} style={{ margin: '3px', width: '80%', height: '100%' }}/>
