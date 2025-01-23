import Store from 'electron-store';
import { encrypt, decrypt } from './utils/crypto';

interface StoreSchema {
  auth: {
    githubToken?: string;
    giteeToken?: string;
  };
  settings: {
    syncInterval: number;
    theme: 'light' | 'dark' | 'system';
    language: 'zh-CN' | 'en-US';
  };
  repositories: Array<{
    id: string;
    name: string;
    platform: 'github' | 'gitee';
    syncEnabled: boolean;
    lastSyncTime?: string;
  }>;
}

const schema = {
  auth: {
    type: 'object',
    properties: {
      githubToken: { type: 'string', optional: true },
      giteeToken: { type: 'string', optional: true }
    }
  },
  settings: {
    type: 'object',
    properties: {
      syncInterval: { type: 'number', default: 3600000 }, // 默认1小时
      theme: { type: 'string', enum: ['light', 'dark', 'system'], default: 'system' },
      language: { type: 'string', enum: ['zh-CN', 'en-US'], default: 'zh-CN' }
    }
  },
  repositories: {
    type: 'array',
    default: []
  }
} as const;

const store = new Store<StoreSchema>({
  schema,
  encryptionKey: 'your-encryption-key', // 在生产环境中应该使用环境变量
  beforeEach: (key, value) => {
    // 加密敏感数据
    if (key.startsWith('auth.')) {
      return encrypt(value);
    }
    return value;
  },
  afterEach: (key, value) => {
    // 解密敏感数据
    if (key.startsWith('auth.')) {
      return decrypt(value);
    }
    return value;
  }
});

/**
 * 初始化存储
 */
export async function initialize(): Promise<void> {
  // 确保设置了默认值
  if (!store.has('settings')) {
    store.set('settings', {
      syncInterval: 3600000,
      theme: 'system',
      language: 'zh-CN'
    });
  }
}

/**
 * 获取存储实例
 */
export function getStore(): Store<StoreSchema> {
  return store;
}

export default store; 