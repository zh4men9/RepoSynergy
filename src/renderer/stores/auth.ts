import { defineStore } from 'pinia';
import type { AuthStatus } from '../../types/electron';

interface AuthState {
  github: {
    authenticated: boolean;
    username?: string;
  };
  gitee: {
    authenticated: boolean;
    username?: string;
  };
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    github: {
      authenticated: false,
      username: undefined,
    },
    gitee: {
      authenticated: false,
      username: undefined,
    },
  }),

  getters: {
    isAuthenticated: (state) => state.github.authenticated || state.gitee.authenticated,
    githubUsername: (state) => state.github.username,
    giteeUsername: (state) => state.gitee.username,
  },

  actions: {
    async setGithubToken(token: string) {
      try {
        const result = await window.api.auth.setGithubToken(token);
        if (result.success && result.username) {
          this.github.authenticated = true;
          this.github.username = result.username;
          return true;
        }
        return false;
      } catch (error) {
        console.error('设置 GitHub 令牌失败:', error);
        return false;
      }
    },

    async setGiteeToken(token: string) {
      try {
        const result = await window.api.auth.setGiteeToken(token);
        if (result.success && result.username) {
          this.gitee.authenticated = true;
          this.gitee.username = result.username;
          return true;
        }
        return false;
      } catch (error) {
        console.error('设置 Gitee 令牌失败:', error);
        return false;
      }
    },

    async checkAuthStatus() {
      try {
        const status = await window.api.auth.checkStatus();
        this.github = status.github;
        this.gitee = status.gitee;
      } catch (error) {
        console.error('检查认证状态失败:', error);
      }
    },

    async clearAuth() {
      try {
        const result = await window.api.auth.clear();
        if (result.success) {
          this.github.authenticated = false;
          this.github.username = undefined;
          this.gitee.authenticated = false;
          this.gitee.username = undefined;
          return true;
        }
        return false;
      } catch (error) {
        console.error('清除认证信息失败:', error);
        return false;
      }
    },
  },
}); 