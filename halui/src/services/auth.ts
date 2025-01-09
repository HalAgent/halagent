import {
  LoginForm,
  LoginResponse,
  ApiResponse,
  ProfileUpdateResponse,
  UserProfile,
  ProfileQueryResponse,
  AgentConfig,
} from '../types/auth';
import { useUserStore } from '@/stores/useUserStore';
import api from '@/services/axios';

export const authService = {
  /**
   * Login
   * @param credentials
   * @returns response data
   * @throws login exception
   */
  async login(credentials: LoginForm): Promise<ApiResponse<LoginResponse['data']>> {
    try {
      const response = await api.post<LoginResponse>('/login', credentials);

      if (!response?.data.success) {
        throw new Error(response.data.message || '登录失败');
      }

      if (response.data.data) {
        useUserStore.getState().login(response.data.data.profile, response.data.data.twitterProfile);
      }

      return response.data;
    } catch (err) {
      throw err instanceof Error ? err : new Error('登录失败');
    }
  },

  /**
   * Update user profile
   * @param userId ID
   * @param profile fields
   * @returns Updated profile
   * @throws update exception
   */
  async updateProfile(userId: string, profile: UserProfile): Promise<ProfileUpdateResponse> {
    try {
      const response = await api.post<ProfileUpdateResponse>(`/profile_upd`, {
        username: userId,
        profile,
      });
      return response.data;
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  },

  /**
   * Get User Profile
   * @param userId ID
   * @returns profile
   * @throws get error
   */
  async getProfile(userId: string): Promise<ProfileQueryResponse> {
    try {
      const response = await api.post<ProfileQueryResponse>(`/profile`, {
        username: userId,
      });
      return response.data;
    } catch (error) {
      console.error('Profile query error:', error);
      throw error;
    }
  },

  /**
   * All config
   * @returns styles, kols, quote etc.
   */
  async getConfig(): Promise<ApiResponse<AgentConfig>> {
    try {
      const response = await api.get<ApiResponse<AgentConfig>>('/config');
      return response.data;
    } catch (error) {
      console.error('Get config error:', error);
      throw error;
    }
  },

  /**
   * watch text
   * @returns watch text report
   */
  async getWatchText(): Promise<ApiResponse<{ report: string }>> {
    try {
      const response = await api.get<ApiResponse<{ report: string }>>(`/watch`);
      return response.data;
    } catch (error) {
      console.error('Get watch text error:', error);
      throw error;
    }
  },

  /**
   * chat
   * @param text input
   * @returns agent response
   */
  async handleChat(text: string): Promise<ApiResponse<{ response: string }>> {
    try {
      const response = await api.post<ApiResponse<{ response: string }>>(`/chat`, {
        text,
      });
      return response.data;
    } catch (error) {
      console.error('Chat request error:', error);
      throw error;
    }
  },

  /**
   * Trans SOL
   * @param transferData
   * @returns result
   */
  async transferSol(transferData: {
    fromTokenAccountPubkey: string;
    toTokenAccountPubkey: string;
    ownerPubkey: string;
    tokenAmount: number;
  }): Promise<ApiResponse<{ signature: string }>> {
    try {
      const response = await api.post<ApiResponse<{ signature: string }>>('/transfer_sol', transferData);
      return response.data;
    } catch (error) {
      console.error('Transfer SOL error:', error);
      throw error;
    }
  },

  /**
   * Create Agent
   * @param userId ID
   * @returns Create Result
   */
  async createAgent(userId: string): Promise<ApiResponse<{ agentId: string }>> {
    try {
      const response = await api.post<ApiResponse<{ agentId: string }>>('/create_agent', {
        username: userId,
      });
      return response.data;
    } catch (error) {
      console.error('Create agent error:', error);
      throw error;
    }
  },

  /**
   * Logout
   * Clear data
   */
  logout() {
    useUserStore.getState().logout();
  },

  twitterOAuth: {
    async getAuthUrl() {
      const response = await api.get('/twitter_oauth_init');
      let result = await response.data;
      return result.data;
    },

    async handleCallback(code: string) {
      const tokenResponse = await api.get('/twitter_oauth_callback?code=' + code);
      let result = await tokenResponse.data;

      if (!result.ok) {
        throw new Error('Failed to exchange code for token');
      }

      return result;
    },

    createAuthWindow(url: string) {
      return window.open(
        url,
        'twitter-auth',
        'width=600,height=600,status=yes,scrollbars=yes'
      );
    },

    listenForAuthMessage() {
      return new Promise((resolve, reject) => {
        const handler = async (event: MessageEvent) => {
          // Message origin
          //if (event.origin !== window.location.origin) return;
          const allowedOrigins = [
            'https://web3ai.cloud',
            'http://localhost:3000'
          ];
        
          if (!allowedOrigins.includes(event.origin)) {
            console.warn('Received message from unauthorized origin:', event.origin);
            return;
          }

          if (event.data.type === 'TWITTER_AUTH_SUCCESS') {
            const { code, state: returnedState } = event.data;
            
            // check state
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
          } else if (event.data.type === 'TWITTER_AUTH_ERROR') {
            reject(new Error(event.data.error));
          }

          // clear
          window.removeEventListener('message', handler);
        };

        window.addEventListener('message', handler);
      });
    }
  }
};
