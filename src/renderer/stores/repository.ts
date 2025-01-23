import { defineStore } from 'pinia';

interface Repository {
  id: string;
  name: string;
  platform: 'github' | 'gitee';
  syncEnabled: boolean;
  lastSyncTime?: string;
}

interface RepositoryState {
  githubRepos: Repository[];
  giteeRepos: Repository[];
  syncList: Repository[];
  loading: boolean;
  error: string | null;
}

export const useRepositoryStore = defineStore('repository', {
  state: (): RepositoryState => ({
    githubRepos: [],
    giteeRepos: [],
    syncList: [],
    loading: false,
    error: null,
  }),

  getters: {
    allRepositories: (state) => [...state.githubRepos, ...state.giteeRepos],
    syncEnabled: (state) => state.syncList.filter(repo => repo.syncEnabled),
  },

  actions: {
    async fetchGithubRepos() {
      try {
        this.loading = true;
        this.error = null;
        this.githubRepos = await window.api.repository.fetchGithubRepos();
      } catch (error) {
        console.error('获取GitHub仓库列表失败:', error);
        this.error = '获取GitHub仓库列表失败';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchGiteeRepos() {
      try {
        this.loading = true;
        this.error = null;
        this.giteeRepos = await window.api.repository.fetchGiteeRepos();
      } catch (error) {
        console.error('获取Gitee仓库列表失败:', error);
        this.error = '获取Gitee仓库列表失败';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async addRepository(repository: Repository) {
      try {
        this.loading = true;
        this.error = null;
        const result = await window.api.repository.addRepository(repository);
        this.syncList.push(result);
        return result;
      } catch (error) {
        console.error('添加仓库失败:', error);
        this.error = '添加仓库失败';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async removeRepository(id: string) {
      try {
        this.loading = true;
        this.error = null;
        await window.api.repository.removeRepository(id);
        this.syncList = this.syncList.filter(repo => repo.id !== id);
      } catch (error) {
        console.error('移除仓库失败:', error);
        this.error = '移除仓库失败';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateRepository(id: string, updates: Partial<Repository>) {
      try {
        this.loading = true;
        this.error = null;
        const result = await window.api.repository.updateRepository(id, updates);
        const index = this.syncList.findIndex(repo => repo.id === id);
        if (index !== -1) {
          this.syncList[index] = result;
        }
        return result;
      } catch (error) {
        console.error('更新仓库失败:', error);
        this.error = '更新仓库失败';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchSyncList() {
      try {
        this.loading = true;
        this.error = null;
        this.syncList = await window.api.repository.getSyncList();
      } catch (error) {
        console.error('获取同步列表失败:', error);
        this.error = '获取同步列表失败';
        throw error;
      } finally {
        this.loading = false;
      }
    },
  },
}); 