import { baseURL } from './config';

const mockChat = [
  {
    url: `${baseURL}/chat`,
    method: 'post',
    response: {
      success: true,
      message: 'Response',
      data: {
        code: 0,
        data: [
          {
            text: '@sentence',
            user: 'agent',
            action: 'NONE',
          },
        ],
      },
    },
  },
];

export default mockChat;
