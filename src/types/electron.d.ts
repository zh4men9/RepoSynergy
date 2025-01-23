export interface Repository {
  id: string;
  name: string;
  platform: 'github' | 'gitee';
  syncEnabled: boolean;
  lastSyncTime?: string;
}

export interface SyncStatus {
  status: 'idle' | 'syncing' | 'error';
  message?: string;
  lastSyncTime?: string;
}

export interface SyncResult {
  success: boolean;
  message: string;
  details?: {
    added: number;
    modified: number;
    deleted: number;
  };
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
        setGithubToken: (token: string) => Promise<{ success: boolean; username?: string; error?: string }>;
        setGiteeToken: (token: string) => Promise<{ success: boolean; username?: string; error?: string }>;
        checkStatus: () => Promise<AuthStatus>;
        clear: () => Promise<{ success: boolean; error?: string }>;
      };
      repository: {
        fetchGithubRepos: () => Promise<Repository[]>;
        fetchGiteeRepos: () => Promise<Repository[]>;
        addToSync: (repo: Repository) => Promise<{ success: boolean; error?: string }>;
        removeFromSync: (repoId: string) => Promise<{ success: boolean; error?: string }>;
      };
      sync: {
        start: (repoId: string) => Promise<SyncResult>;
        stop: (repoId: string) => Promise<SyncResult>;
        status: (repoId: string) => Promise<SyncStatus>;
        setInterval: (minutes: number) => Promise<void>;
        getInterval: () => Promise<number>;
      };
    };
  }
} 