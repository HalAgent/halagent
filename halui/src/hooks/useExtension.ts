import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const UseExtension = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const handlerMessage = (event: MessageEvent) => {
      const message = event.data;
      if (message.action === 'to_chat_form_sidepanel') {
        if (window.location.pathname !== '/chat') {
          navigate('/chat');
        }
      }
    };

    window.addEventListener('message', handlerMessage);
    return () => window.removeEventListener('message', handlerMessage);
  }, []);
};

export default UseExtension;
