import { Message } from '../types/chat';
import api from './axios';

export const watchApi = {
  getWatch: async (): Promise<Message> => {
    try {
      const result = await api.get(`/watch`);
      const json = JSON.parse(result.data.data.report);
      return {
        text: json.text,
        title: json.title,
        updatedAt: json.updateAt,
        user: 'agent',
        action: 'NONE',
      };
    } catch (error) {
      console.error('Error on watch:', error);
    }
    return {
      text: 'Error in watch list generation',
      user: 'agent',
      action: 'NONE',
    };
  },
};
