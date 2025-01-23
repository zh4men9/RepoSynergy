import { defineStore } from 'pinia';

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
    },
    gitee: {
      authenticated: false,
    },
  }),

  getters: {
    isAuthenticated: (state) => state.github.authenticated || state.gitee.authenticated,
  },

  actions: {
    async setGithubToken(token: string) {
      try {
        const result = await window.api.auth.setGithubToken(token);
        if (result.success) {
          this.github = {
            authenticated: true,
            username: result.username,
          };
        }
        return result;
      } catch (error) {
        console.error('设置GitHub令牌失败:', error);
        throw error;
      }
    },

    async setGiteeToken(token: string) {
      try {
        const result = await window.api.auth.setGiteeToken(token);
        if (result.success) {
          this.gitee = {
            authenticated: true,
            username: result.username,
          };
        }
        return result;
      } catch (error) {
        console.error('设置Gitee令牌失败:', error);
        throw error;
      }
    },

    async checkAuthStatus() {
      try {
        const status = await window.api.auth.checkStatus();
        this.github = status.github;
        this.gitee = status.gitee;
      } catch (error) {
        console.error('检查认证状态失败:', error);
        throw error;
      }
    },

    async clearAuth() {
      try {
        await window.api.auth.clear();
        this.github = {
          authenticated: false,
        };
        this.gitee = {
          authenticated: false,
        };
      } catch (error) {
        console.error('清除认证信息失败:', error);
        throw error;
      }
    },
  },
}); 