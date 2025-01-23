import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from '../auth';

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    // 模拟 window.api
    vi.stubGlobal('window', {
      api: {
        auth: {
          setGithubToken: vi.fn(),
          setGiteeToken: vi.fn(),
          checkStatus: vi.fn(),
          clear: vi.fn(),
        },
      },
    });
  });

  it('初始状态应该是未认证', () => {
    const store = useAuthStore();
    expect(store.isAuthenticated).toBe(false);
    expect(store.github.authenticated).toBe(false);
    expect(store.gitee.authenticated).toBe(false);
  });

  it('设置 GitHub token 成功后应该更新状态', async () => {
    const store = useAuthStore();
    window.api.auth.setGithubToken.mockResolvedValue({
      success: true,
      username: 'testuser',
    });

    const result = await store.setGithubToken('test-token');

    expect(result).toBe(true);
    expect(store.github.authenticated).toBe(true);
    expect(store.github.username).toBe('testuser');
    expect(window.api.auth.setGithubToken).toHaveBeenCalledWith('test-token');
  });

  it('设置 GitHub token 失败时不应该更新状态', async () => {
    const store = useAuthStore();
    window.api.auth.setGithubToken.mockResolvedValue({
      success: false,
    });

    const result = await store.setGithubToken('test-token');

    expect(result).toBe(false);
    expect(store.github.authenticated).toBe(false);
    expect(store.github.username).toBeUndefined();
  });

  it('设置 Gitee token 成功后应该更新状态', async () => {
    const store = useAuthStore();
    window.api.auth.setGiteeToken.mockResolvedValue({
      success: true,
      username: 'testuser',
    });

    const result = await store.setGiteeToken('test-token');

    expect(result).toBe(true);
    expect(store.gitee.authenticated).toBe(true);
    expect(store.gitee.username).toBe('testuser');
    expect(window.api.auth.setGiteeToken).toHaveBeenCalledWith('test-token');
  });

  it('设置 Gitee token 失败时不应该更新状态', async () => {
    const store = useAuthStore();
    window.api.auth.setGiteeToken.mockResolvedValue({
      success: false,
    });

    const result = await store.setGiteeToken('test-token');

    expect(result).toBe(false);
    expect(store.gitee.authenticated).toBe(false);
    expect(store.gitee.username).toBeUndefined();
  });

  it('清除认证应该重置所有状态', async () => {
    const store = useAuthStore();
    // 先设置一些初始状态
    store.github.authenticated = true;
    store.github.username = 'testuser';
    store.gitee.authenticated = true;
    store.gitee.username = 'testuser';

    window.api.auth.clear.mockResolvedValue({ success: true });

    const result = await store.clearAuth();

    expect(result).toBe(true);
    expect(store.github.authenticated).toBe(false);
    expect(store.github.username).toBeUndefined();
    expect(store.gitee.authenticated).toBe(false);
    expect(store.gitee.username).toBeUndefined();
  });

  it('检查认证状态应该更新store状态', async () => {
    const store = useAuthStore();
    const mockStatus = {
      github: {
        authenticated: true,
        username: 'githubuser',
      },
      gitee: {
        authenticated: true,
        username: 'giteeuser',
      },
    };

    window.api.auth.checkStatus.mockResolvedValue(mockStatus);

    await store.checkAuthStatus();

    expect(store.github).toEqual(mockStatus.github);
    expect(store.gitee).toEqual(mockStatus.gitee);
  });
}); 