import { Memo } from '../types/memo';
import api from './axios';

class MemoApi {
  //private cursor: string = '';
  private hasMore: boolean = true;

  // reset
  reset() {
    //this.cursor = '';
    this.hasMore = true;
  }

  // Check more
  hasMoreData(): boolean {
    return this.hasMore;
  }

  // Get from server
  async getMemoList(): Promise<Memo[]> {
    if (!this.hasMore) {
      return [];
    }

    try {
      const response = await api.get(`/memo`);

      const data: Memo[] = response.data;

      // set for each item
      return data;
    } catch (error) {
      console.error('Error fetching watch list:', error);
      return [];
    }
  }

  /**
   * Add a memo item
   * @returns
   */
  async addMemo(content: string) {
    try {
      const response = await api.post(`/memo`, { content });
      return response.data;
    } catch (error) {
      console.error('Add Memo error:', error);
      throw error;
    }
  }

  async deleteMomo(ids: string[]): Promise<string> {
    try {
      const response = await api.delete(`/memo`, { data: ids });
      return response.data;
    } catch (error) {
      console.error('Delete Memo error:', error);
      throw error;
    }
  }
}

export const memoApi = new MemoApi();
