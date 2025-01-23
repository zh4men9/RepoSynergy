<template>
  <div class="home">
    <div class="welcome-section">
      <h1>欢迎使用 RepoSynergy</h1>
      <p v-if="!authStore.isAuthenticated" class="auth-tip">
        请先在设置页面配置 GitHub 或 Gitee 的访问令牌
      </p>
    </div>

    <div class="stats-section">
      <div class="stat-card">
        <h3>同步仓库</h3>
        <div class="stat-value">{{ repositoryStore.syncEnabledRepos.length }}</div>
      </div>
      <div class="stat-card">
        <h3>同步间隔</h3>
        <div class="stat-value">{{ syncStore.syncInterval }}分钟</div>
      </div>
    </div>

    <div class="repo-list" v-if="repositoryStore.syncEnabledRepos.length > 0">
      <h2>同步中的仓库</h2>
      <div class="repo-grid">
        <div 
          v-for="repo in repositoryStore.syncEnabledRepos" 
          :key="repo.id" 
          class="repo-card"
        >
          <div class="repo-header">
            <h3>{{ repo.name }}</h3>
            <span class="platform-badge" :class="repo.platform">
              {{ repo.platform }}
            </span>
          </div>
          <p class="repo-desc">{{ repo.description || '暂无描述' }}</p>
          <div class="repo-status">
            <span class="status-badge" :class="getSyncStatus(repo.id).status">
              {{ getStatusText(getSyncStatus(repo.id).status) }}
            </span>
          </div>
          <div class="repo-actions">
            <button 
              @click="handleSync(repo.id)"
              :disabled="loading"
              :class="{ 'syncing': getSyncStatus(repo.id).status === 'syncing' }"
            >
              {{ getSyncStatus(repo.id).status === 'syncing' ? '停止同步' : '开始同步' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="empty-state" v-else>
      <p>还没有添加需要同步的仓库</p>
      <router-link to="/repositories" class="add-repo-btn">
        添加仓库
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRepositoryStore } from '../stores/repository';
import { useSyncStore } from '../stores/sync';

const authStore = useAuthStore();
const repositoryStore = useRepositoryStore();
const syncStore = useSyncStore();

const { getSyncStatus, startSync, stopSync, loading } = syncStore;

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    idle: '空闲',
    syncing: '同步中',
    error: '错误'
  };
  return statusMap[status] || status;
};

const handleSync = async (repoId: string) => {
  const status = getSyncStatus(repoId);
  if (status.status === 'syncing') {
    await stopSync(repoId);
  } else {
    await startSync(repoId);
  }
};

onMounted(async () => {
  if (authStore.isAuthenticated) {
    await Promise.all([
      repositoryStore.fetchGithubRepos(),
      repositoryStore.fetchGiteeRepos()
    ]);
  }
});
</script>

<style scoped>
.home {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.welcome-section {
  text-align: center;
  margin-bottom: 2rem;
}

.auth-tip {
  color: var(--color-warning);
  margin-top: 1rem;
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  padding: 1rem;
  text-align: center;
  box-shadow: var(--shadow-sm);
}

.stat-card h3 {
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  color: var(--color-text-secondary);
  margin: 0;
}

.stat-value {
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: var(--color-primary);
  margin-top: 0.25rem;
}

.repo-list {
  margin-top: 2rem;
}

.repo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.repo-card {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  box-shadow: var(--shadow-sm);
}

.repo-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}

.repo-header h3 {
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  margin: 0;
  color: var(--color-text-primary);
}

.platform-badge {
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  text-transform: capitalize;
}

.platform-badge.github {
  background: #24292e;
  color: white;
}

.platform-badge.gitee {
  background: #c71d23;
  color: white;
}

.repo-desc {
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
  line-height: 1.4;
  margin: 0;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
}

.status-badge.idle {
  background: var(--color-bg-tertiary);
  color: var(--color-text-secondary);
}

.status-badge.syncing {
  background: var(--color-primary);
  color: white;
}

.status-badge.error {
  background: var(--color-error);
  color: white;
}

.repo-actions {
  margin-top: auto;
}

.repo-actions button {
  width: auto;
  min-width: 100px;
  padding: 0.35rem 0.75rem;
  border-radius: var(--radius-sm);
  background: var(--color-primary);
  color: white;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: var(--text-sm);
}

.repo-actions button:hover {
  background: var(--color-primary-dark);
}

.repo-actions button:disabled {
  background: var(--color-bg-tertiary);
  cursor: not-allowed;
}

.repo-actions button.syncing {
  background: var(--color-error);
}

.repo-actions button.syncing:hover {
  background: var(--color-error-dark);
}

.empty-state {
  text-align: center;
  margin-top: 4rem;
  color: var(--color-text-secondary);
}

.add-repo-btn {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: var(--color-primary);
  color: white;
  text-decoration: none;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.add-repo-btn:hover {
  background: var(--color-primary-dark);
}
</style> 