import { baseURL } from './config';

const mockWatch = [
  {
    url: `${baseURL}/watch`,
    method: 'get',
    response: {
      success: true,
      message: 'Watch Success',
      data: {
        code: 0,
        data: {
          text: '@sentence',
          title: '@sentence',
          updatedAt: '@datetime',
          user: 'agent',
          action: 'NONE',
        },
      },
    },
  },
];

export default mockWatch;
