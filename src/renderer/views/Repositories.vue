<template>
  <div class="repositories">
    <div class="page-header">
      <h1>仓库管理</h1>
      <div class="header-actions">
        <button 
          @click="refreshRepos" 
          :disabled="repositoryStore.loading"
          class="refresh-btn"
        >
          刷新列表
        </button>
      </div>
    </div>

    <div class="platform-sections">
      <!-- GitHub 仓库 -->
      <div class="platform-section" v-if="authStore.github.authenticated">
        <h2>
          GitHub 仓库
          <span class="repo-count">{{ repositoryStore.githubRepos.length }}</span>
        </h2>
        <div class="repo-grid">
          <div 
            v-for="repo in repositoryStore.githubRepos" 
            :key="repo.id"
            class="repo-card"
          >
            <div class="repo-header">
              <h3>{{ repo.name }}</h3>
              <div class="repo-actions">
                <button
                  @click="toggleSync(repo)"
                  :class="{ 'enabled': repo.syncEnabled }"
                  :disabled="repositoryStore.loading"
                >
                  {{ repo.syncEnabled ? '取消同步' : '添加同步' }}
                </button>
              </div>
            </div>
            <p class="last-sync" v-if="repo.lastSyncTime">
              上次同步: {{ formatDate(repo.lastSyncTime) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Gitee 仓库 -->
      <div class="platform-section" v-if="authStore.gitee.authenticated">
        <h2>
          Gitee 仓库
          <span class="repo-count">{{ repositoryStore.giteeRepos.length }}</span>
        </h2>
        <div class="repo-grid">
          <div 
            v-for="repo in repositoryStore.giteeRepos" 
            :key="repo.id"
            class="repo-card"
          >
            <div class="repo-header">
              <h3>{{ repo.name }}</h3>
              <div class="repo-actions">
                <button
                  @click="toggleSync(repo)"
                  :class="{ 'enabled': repo.syncEnabled }"
                  :disabled="repositoryStore.loading"
                >
                  {{ repo.syncEnabled ? '取消同步' : '添加同步' }}
                </button>
              </div>
            </div>
            <p class="last-sync" v-if="repo.lastSyncTime">
              上次同步: {{ formatDate(repo.lastSyncTime) }}
            </p>
          </div>
        </div>
      </div>

      <!-- 未授权提示 -->
      <div class="auth-tip" v-if="!authStore.isAuthenticated">
        <p>请先在设置页面配置 GitHub 或 Gitee 的访问令牌</p>
        <router-link to="/settings" class="auth-link">
          前往设置
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRepositoryStore } from '../stores/repository';
import type { Repository } from '../../types/electron';

const authStore = useAuthStore();
const repositoryStore = useRepositoryStore();

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const toggleSync = async (repo: Repository) => {
  if (repo.syncEnabled) {
    await repositoryStore.removeRepository(repo.id);
  } else {
    await repositoryStore.addRepository(repo);
  }
};

const refreshRepos = async () => {
  if (authStore.github.authenticated) {
    await repositoryStore.fetchGithubRepos();
  }
  if (authStore.gitee.authenticated) {
    await repositoryStore.fetchGiteeRepos();
  }
};

onMounted(async () => {
  await refreshRepos();
});
</script>

<style scoped>
.repositories {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.refresh-btn {
  padding: 0.5rem 1rem;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.refresh-btn:hover {
  background: var(--color-primary-dark);
}

.refresh-btn:disabled {
  background: var(--color-bg-tertiary);
  cursor: not-allowed;
}

.platform-sections {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.platform-section h2 {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.repo-count {
  font-size: 1rem;
  background: var(--color-bg-tertiary);
  color: var(--color-text-secondary);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.repo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.repo-card {
  background: var(--color-bg-secondary);
  border-radius: 8px;
  padding: 1.5rem;
}

.repo-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.repo-header h3 {
  margin: 0;
  font-size: 1.1rem;
}

.repo-actions button {
  padding: 0.5rem 1rem;
  border: 1px solid var(--color-primary);
  background: transparent;
  color: var(--color-primary);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.repo-actions button:hover {
  background: var(--color-primary);
  color: white;
}

.repo-actions button.enabled {
  background: var(--color-primary);
  color: white;
}

.repo-actions button.enabled:hover {
  background: var(--color-error);
  border-color: var(--color-error);
}

.repo-actions button:disabled {
  border-color: var(--color-bg-tertiary);
  color: var(--color-text-secondary);
  cursor: not-allowed;
}

.last-sync {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin: 0;
}

.auth-tip {
  text-align: center;
  padding: 2rem;
  background: var(--color-bg-secondary);
  border-radius: 8px;
}

.auth-link {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: var(--color-primary);
  color: white;
  text-decoration: none;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.auth-link:hover {
  background: var(--color-primary-dark);
}
</style> 