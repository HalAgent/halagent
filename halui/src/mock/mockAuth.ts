import { baseURL } from './config';

const mockAuth = [
  {
    url: `${baseURL}/login`,
    method: 'post',
    response: {
      success: true,
      message: 'Login Success',
      data: {
        profile: {
          id: '@guid',
          username: '@name',
          email: '@email',
          avatar: '@image',
          bio: '@sentence',
          location: '@city',
          website: '@url',
          style: {
            all: ['@word', '@word', '@word'],
            chat: ['@word', '@word', '@word'],
            post: ['@word', '@word', '@word'],
          },
          adjectives: ['@word', '@word', '@word'],
          lore: ['@sentence', '@sentence', '@sentence'],
          knowledge: ['@sentence', '@sentence', '@sentence'],
          topics: ['@sentence', '@sentence', '@sentence'],
        },
        twitterProfile: {
          id: '@guid',
          username: '@name',
          displayName: '@name',
          avatar: '@image',
          bio: '@sentence',
          location: '@city',
          website: '@url',
          followers: '@integer(0, 10000)',
          following: '@integer(0, 10000)',
          tweets: '@integer(0, 10000)',
          successfulTweets: '@integer(0, 10000)',
          failedTweets: '@integer(0, 10000)',
        },
      },
    },
  },
  {
    url: `${baseURL}/profile`,
    method: 'get',
    response: {
      success: true,
      data: {
        id: '@guid',
        username: '@name',
        email: '@email',
        avatar: '@image',
        bio: '@sentence',
        location: '@city',
        website: '@url',
      },
    },
  },
  {
    url: `${baseURL}/config`,
    method: 'get',
    response: {
      success: true,
      data: {
        styles: ['@word', '@word', '@word'],
        kols: ['@word', '@word', '@word'],
        quote: '@sentence',
      },
    },
  },
  {
    url: `${baseURL}/watch`,
    method: 'get',
    response: {
      success: true,
      data: {
        report: '@sentence',
      },
    },
  },
  {
    url: `${baseURL}/chat`,
    method: 'post',
    response: {
      success: true,
      data: {
        response: '@sentence',
      },
    },
  },
  {
    url: `${baseURL}/create_agent`,
    method: 'post',
    response: {
      success: true,
      data: {
        agentId: '@guid',
      },
    },
  },
];
export default mockAuth;
