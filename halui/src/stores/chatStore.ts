import { create } from 'zustand';
import { Message } from '../types/chat';

interface ChatStore {
  messages: Message[];
  currentMessageOfUser: Message;
  currentMessageOfCuckoo: Message;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message[]) => void;
  setCurrentMessageOfUser: (message: Message) => void;
  setCurrentMessageOfCuckoo: (message: Message) => void;
}

export const useChatStore = create<ChatStore>(set => ({
  currentMessageOfUser: {
    user: 'user',
    text: '',
    action: 'NONE',
  },
  currentMessageOfCuckoo: {
    user: 'agent',
    text: '',
    action: 'NONE',
  },
  messages: [],
  setMessages: messages => set({ messages }),
  addMessage: messages =>
    set(state => ({
      messages: state.messages.concat(messages),
    })),
  setCurrentMessageOfUser: message => set({ currentMessageOfUser: message }),
  setCurrentMessageOfCuckoo: message => set({ currentMessageOfCuckoo: message }),
}));
