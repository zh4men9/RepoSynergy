import { defineStore } from 'pinia';

interface RepositoryStats {
  totalCommits: number;
  totalBranches: number;
  totalTags: number;
  lastCommitDate: string;
  size: number;
}

interface LanguageStats {
  [language: string]: number;
}

interface ContributionStats {
  [author: string]: {
    commits: number;
    additions: number;
    deletions: number;
  };
}

interface DependencyStats {
  [dependency: string]: string;
}

interface AnalyticsState {
  repositoryStats: Record<string, RepositoryStats>;
  languageStats: Record<string, LanguageStats>;
  contributionStats: Record<string, ContributionStats>;
  dependencyStats: Record<string, DependencyStats>;
  loading: boolean;
  error: string | null;
}

export const useAnalyticsStore = defineStore('analytics', {
  state: (): AnalyticsState => ({
    repositoryStats: {},
    languageStats: {},
    contributionStats: {},
    dependencyStats: {},
    loading: false,
    error: null,
  }),

  getters: {
    getRepositoryStats: (state) => (repositoryId: string) => state.repositoryStats[repositoryId],
    getLanguageStats: (state) => (repositoryId: string) => state.languageStats[repositoryId],
    getContributionStats: (state) => (repositoryId: string) => state.contributionStats[repositoryId],
    getDependencyStats: (state) => (repositoryId: string) => state.dependencyStats[repositoryId],
  },

  actions: {
    async fetchRepositoryStats(repositoryId: string) {
      try {
        this.loading = true;
        this.error = null;
        const stats = await window.api.analytics.getRepositoryStats(repositoryId);
        this.repositoryStats[repositoryId] = stats;
        return stats;
      } catch (error) {
        console.error('获取仓库统计信息失败:', error);
        this.error = '获取仓库统计信息失败';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchLanguageStats(repositoryId: string) {
      try {
        this.loading = true;
        this.error = null;
        const stats = await window.api.analytics.getLanguageStats(repositoryId);
        this.languageStats[repositoryId] = stats;
        return stats;
      } catch (error) {
        console.error('获取语言统计信息失败:', error);
        this.error = '获取语言统计信息失败';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchContributionStats(repositoryId: string) {
      try {
        this.loading = true;
        this.error = null;
        const stats = await window.api.analytics.getContributionStats(repositoryId);
        this.contributionStats[repositoryId] = stats;
        return stats;
      } catch (error) {
        console.error('获取贡献统计信息失败:', error);
        this.error = '获取贡献统计信息失败';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchDependencyStats(repositoryId: string) {
      try {
        this.loading = true;
        this.error = null;
        const stats = await window.api.analytics.getDependencyStats(repositoryId);
        this.dependencyStats[repositoryId] = stats;
        return stats;
      } catch (error) {
        console.error('获取依赖统计信息失败:', error);
        this.error = '获取依赖统计信息失败';
        throw error;
      } finally {
        this.loading = false;
      }
    },
  },
}); 