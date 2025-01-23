<template>
  <div class="home">
    <div class="welcome-section">
      <h1>欢迎使用 RepoSynergy</h1>
      <p>高效管理您的 GitHub 和 Gitee 仓库</p>
    </div>

    <div class="status-section" v-if="isAuthenticated">
      <div class="status-card">
        <h2>GitHub 状态</h2>
        <p>用户名: {{ githubUsername }}</p>
        <p>仓库数量: {{ githubRepos.length }}</p>
        <p>同步中: {{ syncingGithubCount }}</p>
      </div>

      <div class="status-card">
        <h2>Gitee 状态</h2>
        <p>用户名: {{ giteeUsername }}</p>
        <p>仓库数量: {{ giteeRepos.length }}</p>
        <p>同步中: {{ syncingGiteeCount }}</p>
      </div>
    </div>

    <div class="auth-section" v-else>
      <div class="auth-card">
        <h2>GitHub 授权</h2>
        <el-input
          v-model="githubToken"
          type="password"
          placeholder="请输入 GitHub Token"
          show-password
        />
        <el-button type="primary" @click="handleGithubAuth" :loading="githubAuthLoading">
          授权
        </el-button>
      </div>

      <div class="auth-card">
        <h2>Gitee 授权</h2>
        <el-input
          v-model="giteeToken"
          type="password"
          placeholder="请输入 Gitee Token"
          show-password
        />
        <el-button type="primary" @click="handleGiteeAuth" :loading="giteeAuthLoading">
          授权
        </el-button>
      </div>
    </div>

    <div class="quick-actions" v-if="isAuthenticated">
      <el-button type="primary" @click="$router.push('/repositories')">
        管理仓库
      </el-button>
      <el-button type="success" @click="$router.push('/analytics')">
        查看分析
      </el-button>
      <el-button @click="$router.push('/settings')">
        设置
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useAuthStore } from '../stores/auth';
import { useRepositoryStore } from '../stores/repository';
import { useSyncStore } from '../stores/sync';

const router = useRouter();
const authStore = useAuthStore();
const repoStore = useRepositoryStore();
const syncStore = useSyncStore();

const githubToken = ref('');
const giteeToken = ref('');
const githubAuthLoading = ref(false);
const giteeAuthLoading = ref(false);

const isAuthenticated = computed(() => authStore.isAuthenticated);
const githubUsername = computed(() => authStore.githubUsername);
const giteeUsername = computed(() => authStore.giteeUsername);
const githubRepos = computed(() => repoStore.githubRepos);
const giteeRepos = computed(() => repoStore.giteeRepos);

const syncingGithubCount = computed(() => 
  repoStore.syncEnabled.filter(repo => repo.platform === 'github').length
);
const syncingGiteeCount = computed(() => 
  repoStore.syncEnabled.filter(repo => repo.platform === 'gitee').length
);

onMounted(async () => {
  if (isAuthenticated.value) {
    try {
      await repoStore.fetchGithubRepos();
      await repoStore.fetchGiteeRepos();
      await repoStore.fetchSyncList();
    } catch (error) {
      ElMessage.error('获取仓库信息失败');
    }
  }
});

const handleGithubAuth = async () => {
  if (!githubToken.value) {
    ElMessage.warning('请输入 GitHub Token');
    return;
  }

  githubAuthLoading.value = true;
  try {
    await authStore.setGithubToken(githubToken.value);
    await repoStore.fetchGithubRepos();
    ElMessage.success('GitHub 授权成功');
    githubToken.value = '';
  } catch (error) {
    ElMessage.error('GitHub 授权失败');
  } finally {
    githubAuthLoading.value = false;
  }
};

const handleGiteeAuth = async () => {
  if (!giteeToken.value) {
    ElMessage.warning('请输入 Gitee Token');
    return;
  }

  giteeAuthLoading.value = true;
  try {
    await authStore.setGiteeToken(giteeToken.value);
    await repoStore.fetchGiteeRepos();
    ElMessage.success('Gitee 授权成功');
    giteeToken.value = '';
  } catch (error) {
    ElMessage.error('Gitee 授权失败');
  } finally {
    giteeAuthLoading.value = false;
  }
};
</script>

<style scoped>
.home {
  padding: 2rem;
}

.welcome-section {
  text-align: center;
  margin-bottom: 3rem;
}

.welcome-section h1 {
  font-size: 2.5rem;
  color: var(--el-text-color-primary);
  margin-bottom: 1rem;
}

.welcome-section p {
  font-size: 1.2rem;
  color: var(--el-text-color-regular);
}

.status-section,
.auth-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.status-card,
.auth-card {
  padding: 2rem;
  background-color: var(--el-bg-color);
  border-radius: 8px;
  box-shadow: var(--el-box-shadow-light);
}

.status-card h2,
.auth-card h2 {
  margin-bottom: 1.5rem;
  color: var(--el-text-color-primary);
}

.status-card p {
  margin: 0.5rem 0;
  color: var(--el-text-color-regular);
}

.auth-card .el-input {
  margin-bottom: 1rem;
}

.quick-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

@media (max-width: 768px) {
  .home {
    padding: 1rem;
  }

  .welcome-section h1 {
    font-size: 2rem;
  }

  .quick-actions {
    flex-direction: column;
  }

  .quick-actions .el-button {
    width: 100%;
  }
}
</style> 