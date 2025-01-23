import { contextBridge, ipcRenderer } from 'electron';
import type { Repository } from '../types/electron';

// 认证API
const auth = {
  setGithubToken: (token: string) => ipcRenderer.invoke('auth:setGithubToken', token),
  setGiteeToken: (token: string) => ipcRenderer.invoke('auth:setGiteeToken', token),
  checkStatus: () => ipcRenderer.invoke('auth:checkStatus'),
  clear: () => ipcRenderer.invoke('auth:clear'),
};

// 仓库API
const repository = {
  fetchGithubRepos: () => ipcRenderer.invoke('repository:fetchGithubRepos'),
  fetchGiteeRepos: () => ipcRenderer.invoke('repository:fetchGiteeRepos'),
  addToSync: (repo: Repository) => ipcRenderer.invoke('repository:addToSync', repo),
  removeFromSync: (repoId: string) => ipcRenderer.invoke('repository:removeFromSync', repoId),
  addRepository: (repository: any) => ipcRenderer.invoke('repo:addRepository', repository),
  removeRepository: (id: string) => ipcRenderer.invoke('repo:removeRepository', id),
  updateRepository: (id: string, updates: any) => ipcRenderer.invoke('repo:updateRepository', id, updates),
  getSyncList: () => ipcRenderer.invoke('repo:getSyncList'),
};

// 同步API
const sync = {
  start: (repoId: string) => ipcRenderer.invoke('sync:start', repoId),
  stop: (repoId: string) => ipcRenderer.invoke('sync:stop', repoId),
  status: (repoId: string) => ipcRenderer.invoke('sync:status', repoId),
  setInterval: (minutes: number) => ipcRenderer.invoke('sync:setInterval', minutes),
  getInterval: () => ipcRenderer.invoke('sync:getInterval'),
};

// 分析API
const analytics = {
  getRepositoryStats: (repositoryId: string) => ipcRenderer.invoke('analytics:getRepositoryStats', repositoryId),
  getLanguageStats: (repositoryId: string) => ipcRenderer.invoke('analytics:getLanguageStats', repositoryId),
  getContributionStats: (repositoryId: string) => ipcRenderer.invoke('analytics:getContributionStats', repositoryId),
  getDependencyStats: (repositoryId: string) => ipcRenderer.invoke('analytics:getDependencyStats', repositoryId),
};

// 暴露API到渲染进程
const api = {
  auth,
  repository,
  sync,
  analytics,
};

contextBridge.exposeInMainWorld('api', api); 