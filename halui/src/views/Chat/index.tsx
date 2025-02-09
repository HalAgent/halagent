import './index.less'
import { ReactSVG } from 'react-svg';
import { useNavigate } from 'react-router-dom';
import backLeft from '@/assets/icons/back-left.svg';
import person from '@/assets/icons/person.png';
import Share from '@/assets/icons/share.svg';
import BookMark from '@/assets/icons/bookmark.svg';
import Translate from '@/assets/icons/translate.svg';
import Copy from '@/assets/icons/copy.svg';
// import topic from '@/assets/icons/topic.svg';
import Send from '@/assets/icons/Send.svg';
import SendActive from '@/assets/icons/Send-active.svg';
import { useState } from 'react';

const Chat = () => {
    const navigate = useNavigate()
    const [text, setText] = useState('')
    const onBack = () => {
        navigate(-1)
    }
    // const topicList = [
    //     '🎮 FPX Iceland Inside ring User',
    //     '🎮 FPX Iceland Insider',
    //     '📱TikTok ban triggers social migration wave'
    // ]
    const keyList = [
        'New Airdrop1',
        'New Airdrop2',
        'New Airdrop3',
        'New Airdrop4',
        'New Airdrop5',
        'New Airdrop6',
    ]
    const onInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const target = e.target
        target.style.height = '18px';
        target.style.height = target.scrollHeight + 'px';
        setText(target.value)
    }
    const onSend = () => {
        console.log(text)
    }
    const onkeyup = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            onSend()
        }
    }
    return <div className='chat-page'>
        {/* header */}
        <header className='chat-page-header'>
            <img src={backLeft} alt="" onClick={onBack}/>
            <img src={person} alt="" />
            <span>Ask Daisy 9000</span>
        </header>
        {/* content */}
        <ul className='chat-page-cont'>
            <li className='chat-page-cont-item'>
            Finding potential 100x crypto gems involves a mix of research, strategy, and a bit of luck. Here are some tips to help you identify promising cryptocurrencies:

            Research Projects: Read their whitepapers, understand their goals, and evaluate their use cases.
            Team and Advisors: Experienced and reputable team members can significantly increase the project's chances of success.
            <div className='chat-page-cont-item-opt'>
                <ReactSVG className="watch-list-item-footer-item" src={Share}></ReactSVG>
                <ReactSVG className="watch-list-item-footer-item" src={BookMark}></ReactSVG>
                <ReactSVG className="watch-list-item-footer-item" src={Translate}></ReactSVG>
                <ReactSVG className="watch-list-item-footer-item" src={Copy}></ReactSVG>
            </div>
            </li>
            <li className={`chat-page-cont-item self`}>Hello!</li>
        </ul>
        {/* <div className='chat-page-topic'>
            <div className='chat-page-topic-title'>
                <img src={topic} alt="" />
                <strong>hot topic</strong>
                <i className='line'></i>
            </div>
            <ul className='chat-page-topic-list'>
                {
                    topicList.map(item => <li className='chat-page-items' key={item}>{item}</li>)
                }
            </ul>
        </div> */}
        <div className='chat-page-bottom'>
            <ul className='chat-page-keys'>
                {
                    keyList.map(item => <li className='chat-page-items' key={item}>{item}</li>)
                }
            </ul>
            <div className='chat-page-input'>
                <textarea placeholder='Chat with me...' onKeyUp={onkeyup} onInput={onInput}/>
                <img src={`${text ? SendActive : Send}`} alt="" onClick={onSend}/>
            </div>
        </div>

    </div>
}

export default Chat
