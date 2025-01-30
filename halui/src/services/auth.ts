import {
  LoginForm,
  LoginResponse,
  ApiResponse,
  ProfileUpdateResponse,
  UserProfile,
  ProfileQueryResponse,
  AgentConfig,
  //AgentConfig,
} from '../types/auth';
import { useUserStore } from '@/stores/useUserStore';
import api from '@/services/axios';

export const authService = {
  /**
   * Login by LoginForm
   * @param credentials username/password/email
   * @returns Login response
   * @throws User exception
   */
  async loginV0(credentials: LoginForm): Promise<ApiResponse<LoginResponse['data']>> {
    try {
      const response = await api.post<LoginResponse>('/login', credentials);

      if (!response?.data.success) {
        throw new Error(response.data.message || 'Login Failed');
      }

      if (response.data.data) {
        useUserStore.getState().login(response.data.data.profile);
      }

      return response.data;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Login Failed');
    }
  },

  /**
   * Login by LoginForm
   * @param userId, userToken
   * @returns Login response
   * @throws User exception
   */
  async login(userId: string, gmail: string): Promise<ApiResponse<LoginResponse['data']>> {
    try {
      const response = await api.post<LoginResponse>('/login', { userId, gmail });

      if (!response?.data.success) {
        throw new Error(response.data.message || 'Login Failed');
      }

      if (response.data.data) {
        useUserStore.getState().login(response.data.data.profile);
      }

      return response.data;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Login Failed');
    }
  },

  async guestLogin(credentials: LoginForm): Promise<ApiResponse<LoginResponse['data']>> {
    console.log('guestLogin');
    try {
      const response = await api.post<LoginResponse>('/guest_login', credentials);

      if (!response?.data.success) {
        throw new Error(response.data.message || 'Login Failed');
      }

      if (response.data.data) {
        useUserStore.getState().login(response.data.data.profile);
      }

      return response.data;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Login Failed');
    }
  },

  /**
   * Update the user profile
   * @param userId
   * @param profile the user detail fields
   * @returns Updated profile
   * @throws Update Exception
   */
  async updateProfile(userId: string, profile: UserProfile): Promise<ProfileUpdateResponse> {
    try {
      const response = await api.post(`/profile_upd`, {
        userId,
        profile,
      });
      if (response.data) {
        useUserStore.getState().updateProfile(response.data.profile);
      }
      return response.data;
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  },

  /**
   * Read the user profile
   * @param userId UserID
   * @returns UserProfile
   * @throws Geting Exception
   */
  async getProfile(userId: string): Promise<ProfileQueryResponse> {
    try {
      const response = await api.post<ProfileQueryResponse>(`/profile`, {
        userId,
      });
      if (response?.data && response?.data?.profile) {
        useUserStore.getState().updateProfile(response?.data?.profile);
      }
      return response.data;
    } catch (error) {
      console.error('Profile query error:', error);
      throw error;
    }
  },

  /**
   * getAll config for a user
   * @returns including styles, kols, quote and others
   */
  async getConfig(): Promise<AgentConfig> {
    try {
      const userId: string = useUserStore.getState().getUserId() || '';
      const response = await api.get('/config', {
        params: {
          userId,
        },
      });
      return response.data.data;
    } catch (error) {
      console.error('Get config error:', error);
      throw error;
    }
  },
  /**
   * Transfer SOL or meme
   * @param transferData The detail data
   * @returns Transcation
   */
  async transferSol(transferData: {
    fromTokenAccountPubkey: string;
    toTokenAccountPubkey: string;
    ownerPubkey: string;
    typestr: string;
    userId: string;
    tokenAmount: number;
  }): Promise<ApiResponse<{ signature: string }>> {
    try {
      //const response = await api.post<ApiResponse<{ signature: string }>>('/transfer_sol', transferData);
      const response = await api.post<ApiResponse<{ signature: string }>>('/gain_rewards', transferData);

      return response.data;
    } catch (error) {
      console.error('Transfer SOL error:', error);
      throw error;
    }
  },

  /**
   * Create Agent
   * @param userId UserID
   * @returns The created agent
   */
  async createAgent(userId: string): Promise<ApiResponse<{ agentId: string }>> {
    try {
      const response = await api.post<ApiResponse<{ agentId: string }>>('/create_agent', {
        userId,
      });
      return response.data;
    } catch (error) {
      console.error('Create agent error:', error);
      throw error;
    }
  },

  /**
   * Logout
   * Logout for the userId and clear data
   */
  logout(userId: string) {
    useUserStore.getState().logout(userId);
  },

  twitterOAuth: {
    async getAuthUrl() {
      const userId = useUserStore.getState().getUserId();
      const response = await api.get('/twitter_oauth_init?userId=' + userId);
      const result = response.data;
      return result.data;
    },

    async handleRevoke() {
      const userId = useUserStore.getState().getUserId();
      const response = await api.get('/twitter_oauth_revoke?userId=' + userId);
      useUserStore.getState().setTwitterProfile(null);
      console.warn('Twitter revoke success', useUserStore.getState());
      const result = response.data;
      return result.data;
    },

    async handleCallback(code: string) {
      const tokenResponse = await api.get('/twitter_oauth_callback?code=' + code);
      const result = tokenResponse.data;

      if (!result.ok) {
        throw new Error('Failed to exchange code for token');
      }

      return result;
    },

    createAuthWindow(url: string) {
      return window.open(url, 'twitter-auth', 'width=600,height=600,status=yes,scrollbars=yes');
    },

    listenForAuthMessage() {
      return new Promise((resolve, reject) => {
        const handler = async (event: MessageEvent) => {
          // Message origin
          //if (event.origin !== window.location.origin) return;
          const allowedOrigins = ['https://web3agent.site', 'http://localhost:3000'];

          if (!allowedOrigins.includes(event.origin)) {
            console.warn('Received message from unauthorized origin:', event.origin);
            return;
          }

          if (event.data.type === 'TWITTER_AUTH_SUCCESS') {
            const { code, state: returnedState } = event.data;

            // Verify state to avoid CSRF
            const savedState = sessionStorage.getItem('twitter_oauth_state');
            if (savedState !== returnedState) {
              reject(new Error('Invalid state parameter'));
              return;
            }

            try {
              const result = await this.handleCallback(code);
              resolve(result);
            } catch (error) {
              reject(error);
            }
            // Clear
            window.removeEventListener('message', handler);
          } else if (event.data.type === 'TWITTER_AUTH_ERROR') {
            reject(new Error(event.data.error));
            // Clear
            window.removeEventListener('message', handler);
          }
        };

        window.addEventListener('message', handler);
      });
    },
  },
};
