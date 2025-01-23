import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useRepositoryStore } from '../repository';
import type { Repository } from '../../types/electron';

describe('Repository Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    // 模拟 window.api
    vi.stubGlobal('window', {
      api: {
        repository: {
          fetchGithubRepos: vi.fn(),
          fetchGiteeRepos: vi.fn(),
          addToSync: vi.fn(),
          removeFromSync: vi.fn(),
        },
      },
    });
  });

  it('初始状态应该是空的', () => {
    const store = useRepositoryStore();
    expect(store.githubRepos).toEqual([]);
    expect(store.giteeRepos).toEqual([]);
    expect(store.loading).toBe(false);
    expect(store.error).toBeNull();
  });

  it('应该能获取 GitHub 仓库列表', async () => {
    const store = useRepositoryStore();
    const mockRepos: Repository[] = [
      {
        id: '1',
        name: 'repo1',
        platform: 'github',
        syncEnabled: false,
      },
      {
        id: '2',
        name: 'repo2',
        platform: 'github',
        syncEnabled: true,
      },
    ];

    window.api.repository.fetchGithubRepos.mockResolvedValue(mockRepos);

    await store.fetchGithubRepos();

    expect(store.githubRepos).toEqual(mockRepos);
    expect(store.loading).toBe(false);
    expect(store.error).toBeNull();
  });

  it('获取 GitHub 仓库失败时应该设置错误状态', async () => {
    const store = useRepositoryStore();
    window.api.repository.fetchGithubRepos.mockRejectedValue(new Error('Network error'));

    await expect(store.fetchGithubRepos()).rejects.toThrow();
    expect(store.loading).toBe(false);
    expect(store.error).toBe('获取 GitHub 仓库列表失败');
  });

  it('应该能获取 Gitee 仓库列表', async () => {
    const store = useRepositoryStore();
    const mockRepos: Repository[] = [
      {
        id: '1',
        name: 'repo1',
        platform: 'gitee',
        syncEnabled: false,
      },
      {
        id: '2',
        name: 'repo2',
        platform: 'gitee',
        syncEnabled: true,
      },
    ];

    window.api.repository.fetchGiteeRepos.mockResolvedValue(mockRepos);

    await store.fetchGiteeRepos();

    expect(store.giteeRepos).toEqual(mockRepos);
    expect(store.loading).toBe(false);
    expect(store.error).toBeNull();
  });

  it('获取 Gitee 仓库失败时应该设置错误状态', async () => {
    const store = useRepositoryStore();
    window.api.repository.fetchGiteeRepos.mockRejectedValue(new Error('Network error'));

    await expect(store.fetchGiteeRepos()).rejects.toThrow();
    expect(store.loading).toBe(false);
    expect(store.error).toBe('获取 Gitee 仓库列表失败');
  });

  it('应该能添加仓库到同步列表', async () => {
    const store = useRepositoryStore();
    const mockRepo: Repository = {
      id: '1',
      name: 'repo1',
      platform: 'github',
      syncEnabled: false,
    };

    window.api.repository.addToSync.mockResolvedValue({ success: true });

    // 先添加一个仓库到列表中
    store.githubRepos = [mockRepo];

    const result = await store.addRepository(mockRepo);

    expect(result).toBe(true);
    expect(store.githubRepos[0].syncEnabled).toBe(true);
    expect(window.api.repository.addToSync).toHaveBeenCalledWith(mockRepo);
  });

  it('添加仓库失败时不应该更新状态', async () => {
    const store = useRepositoryStore();
    const mockRepo: Repository = {
      id: '1',
      name: 'repo1',
      platform: 'github',
      syncEnabled: false,
    };

    window.api.repository.addToSync.mockResolvedValue({ success: false });

    // 先添加一个仓库到列表中
    store.githubRepos = [mockRepo];

    const result = await store.addRepository(mockRepo);

    expect(result).toBe(false);
    expect(store.githubRepos[0].syncEnabled).toBe(false);
  });

  it('应该能从同步列表移除仓库', async () => {
    const store = useRepositoryStore();
    const mockRepo: Repository = {
      id: '1',
      name: 'repo1',
      platform: 'github',
      syncEnabled: true,
    };

    window.api.repository.removeFromSync.mockResolvedValue({ success: true });

    // 先添加一个已启用同步的仓库到列表中
    store.githubRepos = [mockRepo];

    const result = await store.removeRepository(mockRepo.id);

    expect(result).toBe(true);
    expect(store.githubRepos[0].syncEnabled).toBe(false);
    expect(window.api.repository.removeFromSync).toHaveBeenCalledWith(mockRepo.id);
  });

  it('移除仓库失败时不应该更新状态', async () => {
    const store = useRepositoryStore();
    const mockRepo: Repository = {
      id: '1',
      name: 'repo1',
      platform: 'github',
      syncEnabled: true,
    };

    window.api.repository.removeFromSync.mockResolvedValue({ success: false });

    // 先添加一个已启用同步的仓库到列表中
    store.githubRepos = [mockRepo];

    const result = await store.removeRepository(mockRepo.id);

    expect(result).toBe(false);
    expect(store.githubRepos[0].syncEnabled).toBe(true);
  });

  it('syncEnabledRepos getter 应该返回所有启用同步的仓库', () => {
    const store = useRepositoryStore();
    const mockRepos: Repository[] = [
      {
        id: '1',
        name: 'github1',
        platform: 'github',
        syncEnabled: true,
      },
      {
        id: '2',
        name: 'github2',
        platform: 'github',
        syncEnabled: false,
      },
      {
        id: '3',
        name: 'gitee1',
        platform: 'gitee',
        syncEnabled: true,
      },
      {
        id: '4',
        name: 'gitee2',
        platform: 'gitee',
        syncEnabled: false,
      },
    ];

    store.githubRepos = mockRepos.filter(repo => repo.platform === 'github');
    store.giteeRepos = mockRepos.filter(repo => repo.platform === 'gitee');

    const enabledRepos = store.syncEnabledRepos;
    expect(enabledRepos).toHaveLength(2);
    expect(enabledRepos.every(repo => repo.syncEnabled)).toBe(true);
  });
}); 