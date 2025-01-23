import Store from 'electron-store';
import type { Repository } from '../../types/electron';

interface StoreSchema {
  'github.token'?: string;
  'gitee.token'?: string;
  'repositories': Repository[];
  'settings.sync_interval'?: number;
}

const store = new Store<StoreSchema>({
  name: 'reposynergy',
  encryptionKey: 'your-encryption-key',
  defaults: {
    repositories: [],
    'settings.sync_interval': 30,
  },
});

export const initializeStore = async () => {
  // 确保存储已初始化
  if (!store.has('repositories')) {
    store.set('repositories', []);
  }
  if (!store.has('settings.sync_interval')) {
    store.set('settings.sync_interval', 30);
  }
};

export const getStore = () => store;

export const setGithubToken = (token: string) => {
  store.set('github.token', token);
};

export const setGiteeToken = (token: string) => {
  store.set('gitee.token', token);
};

export const getGithubToken = () => {
  return store.get('github.token');
};

export const getGiteeToken = () => {
  return store.get('gitee.token');
};

export const clearTokens = () => {
  store.delete('github.token');
  store.delete('gitee.token');
}; 