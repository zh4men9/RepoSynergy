<template>
  <div class="settings">
    <h1>设置</h1>

    <div class="settings-section">
      <h2>认证设置</h2>
      
      <!-- GitHub 认证 -->
      <div class="auth-card">
        <div class="auth-header">
          <h3>GitHub</h3>
          <span 
            class="auth-status" 
            :class="{ active: authStore.github.authenticated }"
          >
            {{ authStore.github.authenticated ? '已认证' : '未认证' }}
          </span>
        </div>
        
        <div v-if="authStore.github.authenticated">
          <p class="username">
            当前用户: {{ authStore.github.username }}
          </p>
          <button 
            @click="clearGithubAuth"
            class="danger-btn"
          >
            清除认证
          </button>
        </div>
        
        <div v-else class="auth-form">
          <div class="input-group">
            <label for="github-token">访问令牌</label>
            <input
              id="github-token"
              v-model="githubToken"
              type="password"
              placeholder="请输入 GitHub 访问令牌"
            />
          </div>
          <button 
            @click="handleGithubAuth"
            :disabled="!githubToken || loading"
            class="primary-btn"
          >
            认证
          </button>
        </div>
      </div>

      <!-- Gitee 认证 -->
      <div class="auth-card">
        <div class="auth-header">
          <h3>Gitee</h3>
          <span 
            class="auth-status" 
            :class="{ active: authStore.gitee.authenticated }"
          >
            {{ authStore.gitee.authenticated ? '已认证' : '未认证' }}
          </span>
        </div>
        
        <div v-if="authStore.gitee.authenticated">
          <p class="username">
            当前用户: {{ authStore.gitee.username }}
          </p>
          <button 
            @click="clearGiteeAuth"
            class="danger-btn"
          >
            清除认证
          </button>
        </div>
        
        <div v-else class="auth-form">
          <div class="input-group">
            <label for="gitee-token">访问令牌</label>
            <input
              id="gitee-token"
              v-model="giteeToken"
              type="password"
              placeholder="请输入 Gitee 访问令牌"
            />
          </div>
          <button 
            @click="handleGiteeAuth"
            :disabled="!giteeToken || loading"
            class="primary-btn"
          >
            认证
          </button>
        </div>
      </div>
    </div>

    <div class="settings-section">
      <h2>同步设置</h2>
      <div class="sync-card">
        <div class="input-group">
          <label for="sync-interval">同步间隔 (分钟)</label>
          <input
            id="sync-interval"
            v-model.number="syncInterval"
            type="number"
            min="1"
            :disabled="loading"
          />
        </div>
        <button 
          @click="updateSyncInterval"
          :disabled="!syncInterval || loading"
          class="primary-btn"
        >
          保存
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useSyncStore } from '../stores/sync';

const authStore = useAuthStore();
const syncStore = useSyncStore();

const githubToken = ref('');
const giteeToken = ref('');
const syncInterval = ref(30);
const loading = ref(false);

const handleGithubAuth = async () => {
  if (!githubToken.value) return;
  
  loading.value = true;
  try {
    const success = await authStore.setGithubToken(githubToken.value);
    if (success) {
      githubToken.value = '';
    }
  } finally {
    loading.value = false;
  }
};

const handleGiteeAuth = async () => {
  if (!giteeToken.value) return;
  
  loading.value = true;
  try {
    const success = await authStore.setGiteeToken(giteeToken.value);
    if (success) {
      giteeToken.value = '';
    }
  } finally {
    loading.value = false;
  }
};

const clearGithubAuth = async () => {
  loading.value = true;
  try {
    await authStore.clearAuth();
  } finally {
    loading.value = false;
  }
};

const clearGiteeAuth = async () => {
  loading.value = true;
  try {
    await authStore.clearAuth();
  } finally {
    loading.value = false;
  }
};

const updateSyncInterval = async () => {
  if (!syncInterval.value) return;
  
  loading.value = true;
  try {
    await syncStore.setSyncInterval(syncInterval.value);
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  loading.value = true;
  try {
    await authStore.checkAuthStatus();
    const interval = await syncStore.getSyncInterval();
    syncInterval.value = interval;
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.settings {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.settings-section {
  margin-top: 2rem;
}

.settings-section h2 {
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--color-border);
}

.auth-card {
  background: var(--color-bg-secondary);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
}

.auth-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.auth-header h3 {
  margin: 0;
}

.auth-status {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
  background: var(--color-bg-tertiary);
  color: var(--color-text-secondary);
}

.auth-status.active {
  background: var(--color-success);
  color: white;
}

.username {
  color: var(--color-text-secondary);
  margin-bottom: 1rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-group label {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.input-group input {
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
}

.input-group input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.input-group input:disabled {
  background: var(--color-bg-tertiary);
  cursor: not-allowed;
}

.sync-card {
  background: var(--color-bg-secondary);
  border-radius: 8px;
  padding: 1.5rem;
  display: flex;
  gap: 1rem;
  align-items: flex-end;
}

.primary-btn,
.danger-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.primary-btn {
  background: var(--color-primary);
  color: white;
}

.primary-btn:hover {
  background: var(--color-primary-dark);
}

.primary-btn:disabled {
  background: var(--color-bg-tertiary);
  cursor: not-allowed;
}

.danger-btn {
  background: var(--color-error);
  color: white;
}

.danger-btn:hover {
  background: var(--color-error-dark);
}

@media (max-width: 640px) {
  .settings {
    padding: 1rem;
  }

  .sync-card {
    flex-direction: column;
    align-items: stretch;
  }
}
</style> 