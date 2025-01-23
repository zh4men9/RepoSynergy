interface Repository {
  id: string;
  name: string;
  platform: 'github' | 'gitee';
  syncEnabled: boolean;
  lastSyncTime?: string;
}

interface RepositoryStats {
  commits: number;
  branches: number;
  tags: number;
  contributors: number;
  size: number;
  lastCommit: string;
}

interface LanguageStats {
  [language: string]: {
    files: number;
    lines: number;
    percentage: number;
  };
}

interface ContributionStats {
  [author: string]: {
    commits: number;
    additions: number;
    deletions: number;
    percentage: number;
  };
}

interface DependencyStats {
  direct: {
    [name: string]: string;
  };
  dev: {
    [name: string]: string;
  };
  outdated: {
    [name: string]: {
      current: string;
      latest: string;
      type: 'major' | 'minor' | 'patch';
    };
  };
}

interface AuthAPI {
  setGithubToken: (token: string) => Promise<{ success: boolean; username: string }>;
  setGiteeToken: (token: string) => Promise<{ success: boolean; username: string }>;
  checkStatus: () => Promise<{
    github: { authenticated: boolean; username?: string };
    gitee: { authenticated: boolean; username?: string };
  }>;
  clear: () => Promise<{ success: boolean }>;
}

interface RepositoryAPI {
  fetchGithubRepos: () => Promise<Repository[]>;
  fetchGiteeRepos: () => Promise<Repository[]>;
  addRepository: (repository: Repository) => Promise<Repository>;
  removeRepository: (id: string) => Promise<boolean>;
  updateRepository: (id: string, updates: Partial<Repository>) => Promise<Repository>;
  getSyncList: () => Promise<Repository[]>;
}

interface SyncAPI {
  start: (repositoryId: string) => Promise<{ success: boolean; message: string; error?: string }>;
  stop: (repositoryId: string) => Promise<{ success: boolean; message: string; error?: string }>;
  getStatus: (repositoryId: string) => Promise<{
    status: 'idle' | 'syncing' | 'error';
    lastSync?: string;
    error?: string;
  }>;
  setInterval: (minutes: number) => Promise<void>;
  getInterval: () => Promise<number>;
}

interface AnalyticsAPI {
  getRepositoryStats: (repositoryId: string) => Promise<RepositoryStats>;
  getLanguageStats: (repositoryId: string) => Promise<LanguageStats>;
  getContributionStats: (repositoryId: string) => Promise<ContributionStats>;
  getDependencyStats: (repositoryId: string) => Promise<DependencyStats>;
}

interface API {
  auth: AuthAPI;
  repository: RepositoryAPI;
  sync: SyncAPI;
  analytics: AnalyticsAPI;
}

declare global {
  interface Window {
    api: API;
  }
} 