import './index.less'
import { useNavigate } from 'react-router-dom';
import backLeft from '@/assets/icons/back-left.svg';
import person from '@/assets/icons/person.png';

const Chat = () => {
    const text = []
    const navigate = useNavigate()
    const onBack = () => {
        navigate(-1)
    }
    return <div className='chat-page'>
        <header className='chat-page-header'>
            <img src={backLeft} alt="" onClick={onBack}/>
            <img src={person} alt="" />
            <span>Ask Daisy 9000</span>
        </header>
        <div className='chat-page-top'>

        </div>
    </div>
}

export default Chat
