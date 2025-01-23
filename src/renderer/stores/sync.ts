import { defineStore } from 'pinia';
import type { SyncStatus } from '../../types/electron';

interface SyncState {
  syncStatuses: Record<string, SyncStatus>;
  syncInterval: number;
  loading: boolean;
  error: string | null;
}

export const useSyncStore = defineStore('sync', {
  state: (): SyncState => ({
    syncStatuses: {},
    syncInterval: 30,
    loading: false,
    error: null,
  }),

  getters: {
    getSyncStatus: (state) => (repoId: string) => state.syncStatuses[repoId] || { status: 'idle' },
  },

  actions: {
    async startSync(repoId: string) {
      this.loading = true;
      this.error = null;
      try {
        const result = await window.api.sync.start(repoId);
        if (result.success) {
          this.syncStatuses[repoId] = { status: 'syncing' };
          return true;
        }
        this.error = result.error || '启动同步失败';
        return false;
      } catch (error) {
        console.error('启动同步失败:', error);
        this.error = '启动同步失败';
        return false;
      } finally {
        this.loading = false;
      }
    },

    async stopSync(repoId: string) {
      this.loading = true;
      this.error = null;
      try {
        const result = await window.api.sync.stop(repoId);
        if (result.success) {
          this.syncStatuses[repoId] = { status: 'idle' };
          return true;
        }
        this.error = result.error || '停止同步失败';
        return false;
      } catch (error) {
        console.error('停止同步失败:', error);
        this.error = '停止同步失败';
        return false;
      } finally {
        this.loading = false;
      }
    },

    async updateSyncStatus(repoId: string) {
      try {
        const status = await window.api.sync.status(repoId);
        this.syncStatuses[repoId] = status;
      } catch (error) {
        console.error('获取同步状态失败:', error);
      }
    },

    async setSyncInterval(minutes: number) {
      this.error = null;
      try {
        await window.api.sync.setInterval(minutes);
        this.syncInterval = minutes;
        return true;
      } catch (error) {
        console.error('设置同步间隔失败:', error);
        this.error = '设置同步间隔失败';
        return false;
      }
    },

    async getSyncInterval() {
      this.error = null;
      try {
        const interval = await window.api.sync.getInterval();
        this.syncInterval = interval;
        return interval;
      } catch (error) {
        console.error('获取同步间隔失败:', error);
        this.error = '获取同步间隔失败';
        return this.syncInterval;
      }
    },
  },
}); 