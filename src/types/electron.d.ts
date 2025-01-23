export interface Repository {
  id: string;
  name: string;
  description?: string;
  platform: 'github' | 'gitee';
  syncEnabled: boolean;
  lastSyncTime?: string;
}

export interface SyncStatus {
  status: 'idle' | 'syncing' | 'error';
  error?: string;
}

export interface SyncResult {
  success: boolean;
  error?: string;
}

export interface AuthStatus {
  github: {
    authenticated: boolean;
    username?: string;
  };
  gitee: {
    authenticated: boolean;
    username?: string;
  };
}

declare global {
  interface Window {
    api: {
      auth: {
        setGithubToken: (token: string) => Promise<{ success: boolean; username?: string }>;
        setGiteeToken: (token: string) => Promise<{ success: boolean; username?: string }>;
        checkStatus: () => Promise<AuthStatus>;
        clear: () => Promise<{ success: boolean }>;
      };
      repository: {
        fetchGithubRepos: () => Promise<Repository[]>;
        fetchGiteeRepos: () => Promise<Repository[]>;
        addToSync: (repo: Repository) => Promise<{ success: boolean }>;
        removeFromSync: (repoId: string) => Promise<{ success: boolean }>;
      };
      sync: {
        start: (repoId: string) => Promise<{ success: boolean; error?: string }>;
        stop: (repoId: string) => Promise<{ success: boolean; error?: string }>;
        status: (repoId: string) => Promise<SyncStatus>;
        setInterval: (minutes: number) => Promise<{ success: boolean }>;
        getInterval: () => Promise<number>;
      };
    };
  }
} 