import { defineStore } from 'pinia';

interface SyncStatus {
  repositoryId: string;
  status: 'idle' | 'syncing' | 'error';
  progress: number;
  message: string;
}

interface SyncState {
  syncStatuses: Record<string, SyncStatus>;
  syncInterval: number;
  loading: boolean;
  error: string | null;
}

export const useSyncStore = defineStore('sync', {
  state: (): SyncState => ({
    syncStatuses: {},
    syncInterval: 0,
    loading: false,
    error: null,
  }),

  getters: {
    isSyncing: (state) => Object.values(state.syncStatuses).some(status => status.status === 'syncing'),
    syncProgress: (state) => {
      const statuses = Object.values(state.syncStatuses);
      if (statuses.length === 0) return 0;
      return statuses.reduce((sum, status) => sum + status.progress, 0) / statuses.length;
    },
  },

  actions: {
    async startSync(repositoryId: string) {
      try {
        this.loading = true;
        this.error = null;
        this.syncStatuses[repositoryId] = {
          repositoryId,
          status: 'syncing',
          progress: 0,
          message: '开始同步...',
        };
        await window.api.sync.start(repositoryId);
      } catch (error) {
        console.error('启动同步失败:', error);
        this.error = '启动同步失败';
        this.syncStatuses[repositoryId] = {
          repositoryId,
          status: 'error',
          progress: 0,
          message: '同步失败',
        };
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async stopSync(repositoryId: string) {
      try {
        this.loading = true;
        this.error = null;
        await window.api.sync.stop(repositoryId);
        this.syncStatuses[repositoryId] = {
          repositoryId,
          status: 'idle',
          progress: 0,
          message: '同步已停止',
        };
      } catch (error) {
        console.error('停止同步失败:', error);
        this.error = '停止同步失败';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async setSyncInterval(minutes: number) {
      try {
        this.loading = true;
        this.error = null;
        await window.api.sync.setSyncInterval(minutes);
        this.syncInterval = minutes;
      } catch (error) {
        console.error('设置同步间隔失败:', error);
        this.error = '设置同步间隔失败';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async getSyncInterval() {
      try {
        this.loading = true;
        this.error = null;
        this.syncInterval = await window.api.sync.getSyncInterval();
        return this.syncInterval;
      } catch (error) {
        console.error('获取同步间隔失败:', error);
        this.error = '获取同步间隔失败';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    updateSyncStatus(repositoryId: string, status: Partial<SyncStatus>) {
      if (this.syncStatuses[repositoryId]) {
        this.syncStatuses[repositoryId] = {
          ...this.syncStatuses[repositoryId],
          ...status,
        };
      }
    },
  },
}); 