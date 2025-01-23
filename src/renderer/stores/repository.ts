import { defineStore } from 'pinia';
import type { Repository } from '../../types/electron';

interface RepositoryState {
  githubRepos: Repository[];
  giteeRepos: Repository[];
  loading: boolean;
  error: string | null;
}

export const useRepositoryStore = defineStore('repository', {
  state: (): RepositoryState => ({
    githubRepos: [],
    giteeRepos: [],
    loading: false,
    error: null,
  }),

  getters: {
    syncEnabledRepos: (state) => [
      ...state.githubRepos.filter(repo => repo.syncEnabled),
      ...state.giteeRepos.filter(repo => repo.syncEnabled),
    ],
  },

  actions: {
    async fetchGithubRepos() {
      this.loading = true;
      this.error = null;
      try {
        const repos = await window.api.repository.fetchGithubRepos();
        this.githubRepos = repos;
      } catch (error) {
        console.error('获取 GitHub 仓库列表失败:', error);
        this.error = '获取 GitHub 仓库列表失败';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchGiteeRepos() {
      this.loading = true;
      this.error = null;
      try {
        const repos = await window.api.repository.fetchGiteeRepos();
        this.giteeRepos = repos;
      } catch (error) {
        console.error('获取 Gitee 仓库列表失败:', error);
        this.error = '获取 Gitee 仓库列表失败';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async addRepository(repo: Repository) {
      this.error = null;
      try {
        const result = await window.api.repository.addToSync(repo);
        if (result.success) {
          if (repo.platform === 'github') {
            const index = this.githubRepos.findIndex(r => r.id === repo.id);
            if (index !== -1) {
              this.githubRepos[index].syncEnabled = true;
            }
          } else {
            const index = this.giteeRepos.findIndex(r => r.id === repo.id);
            if (index !== -1) {
              this.giteeRepos[index].syncEnabled = true;
            }
          }
          return true;
        }
        return false;
      } catch (error) {
        console.error('添加仓库到同步列表失败:', error);
        this.error = '添加仓库到同步列表失败';
        return false;
      }
    },

    async removeRepository(repoId: string) {
      this.error = null;
      try {
        const result = await window.api.repository.removeFromSync(repoId);
        if (result.success) {
          const githubIndex = this.githubRepos.findIndex(r => r.id === repoId);
          if (githubIndex !== -1) {
            this.githubRepos[githubIndex].syncEnabled = false;
          }
          const giteeIndex = this.giteeRepos.findIndex(r => r.id === repoId);
          if (giteeIndex !== -1) {
            this.giteeRepos[giteeIndex].syncEnabled = false;
          }
          return true;
        }
        return false;
      } catch (error) {
        console.error('从同步列表移除仓库失败:', error);
        this.error = '从同步列表移除仓库失败';
        return false;
      }
    },
  },
}); 