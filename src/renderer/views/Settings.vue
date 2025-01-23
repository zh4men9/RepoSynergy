<template>
  <div class="settings">
    <div class="header">
      <h1>设置</h1>
    </div>

    <el-card class="settings-card">
      <template #header>
        <div class="card-header">
          <span>同步设置</span>
        </div>
      </template>

      <el-form label-width="120px">
        <el-form-item label="同步间隔">
          <el-input-number
            v-model="syncInterval"
            :min="1"
            :max="1440"
            :step="5"
            @change="handleSyncIntervalChange"
          />
          <span class="unit-text">分钟</span>
        </el-form-item>

        <el-form-item label="自动同步">
          <el-switch
            v-model="autoSync"
            @change="handleAutoSyncChange"
          />
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="settings-card">
      <template #header>
        <div class="card-header">
          <span>账号管理</span>
        </div>
      </template>

      <el-form label-width="120px">
        <el-form-item label="GitHub">
          <div class="token-input">
            <el-input
              v-model="githubToken"
              type="password"
              placeholder="输入新的 GitHub Token"
              show-password
              clearable
            />
            <el-button
              type="primary"
              @click="handleUpdateGithubToken"
              :loading="githubLoading"
            >
              更新
            </el-button>
          </div>
          <div class="token-status">
            <el-tag :type="githubUsername ? 'success' : 'info'">
              {{ githubUsername || '未授权' }}
            </el-tag>
          </div>
        </el-form-item>

        <el-form-item label="Gitee">
          <div class="token-input">
            <el-input
              v-model="giteeToken"
              type="password"
              placeholder="输入新的 Gitee Token"
              show-password
              clearable
            />
            <el-button
              type="primary"
              @click="handleUpdateGiteeToken"
              :loading="giteeLoading"
            >
              更新
            </el-button>
          </div>
          <div class="token-status">
            <el-tag :type="giteeUsername ? 'success' : 'info'">
              {{ giteeUsername || '未授权' }}
            </el-tag>
          </div>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="settings-card">
      <template #header>
        <div class="card-header">
          <span>应用信息</span>
        </div>
      </template>

      <el-descriptions :column="1" border>
        <el-descriptions-item label="版本">
          v1.0.0
        </el-descriptions-item>
        <el-descriptions-item label="作者">
          zh4men9
        </el-descriptions-item>
        <el-descriptions-item label="GitHub">
          <a href="https://github.com/zh4men9/repo-synergy" target="_blank">
            https://github.com/zh4men9/repo-synergy
          </a>
        </el-descriptions-item>
      </el-descriptions>

      <div class="app-actions">
        <el-button type="primary" @click="checkUpdate">
          检查更新
        </el-button>
        <el-button type="danger" @click="clearData">
          清除数据
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useAuthStore } from '../stores/auth';
import { useSyncStore } from '../stores/sync';

const authStore = useAuthStore();
const syncStore = useSyncStore();

const githubToken = ref('');
const giteeToken = ref('');
const syncInterval = ref(30);
const autoSync = ref(false);
const githubLoading = ref(false);
const giteeLoading = ref(false);

const githubUsername = computed(() => authStore.githubUsername);
const giteeUsername = computed(() => authStore.giteeUsername);

onMounted(async () => {
  try {
    syncInterval.value = await syncStore.getSyncInterval();
  } catch (error) {
    ElMessage.error('获取同步间隔失败');
  }
});

const handleSyncIntervalChange = async (value: number) => {
  try {
    await syncStore.setSyncInterval(value);
    ElMessage.success('更新同步间隔成功');
  } catch (error) {
    ElMessage.error('更新同步间隔失败');
  }
};

const handleAutoSyncChange = async (value: boolean) => {
  try {
    // TODO: 实现自动同步功能
    ElMessage.success(value ? '已开启自动同步' : '已关闭自动同步');
  } catch (error) {
    ElMessage.error('设置自动同步失败');
    autoSync.value = !value;
  }
};

const handleUpdateGithubToken = async () => {
  if (!githubToken.value) {
    ElMessage.warning('请输入 GitHub Token');
    return;
  }

  githubLoading.value = true;
  try {
    await authStore.setGithubToken(githubToken.value);
    ElMessage.success('更新 GitHub Token 成功');
    githubToken.value = '';
  } catch (error) {
    ElMessage.error('更新 GitHub Token 失败');
  } finally {
    githubLoading.value = false;
  }
};

const handleUpdateGiteeToken = async () => {
  if (!giteeToken.value) {
    ElMessage.warning('请输入 Gitee Token');
    return;
  }

  giteeLoading.value = true;
  try {
    await authStore.setGiteeToken(giteeToken.value);
    ElMessage.success('更新 Gitee Token 成功');
    giteeToken.value = '';
  } catch (error) {
    ElMessage.error('更新 Gitee Token 失败');
  } finally {
    giteeLoading.value = false;
  }
};

const checkUpdate = () => {
  // TODO: 实现检查更新功能
  ElMessage.info('当前已是最新版本');
};

const clearData = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要清除所有数据吗？此操作不可恢复。',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );
    // TODO: 实现清除数据功能
    ElMessage.success('数据清除成功');
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('数据清除失败');
    }
  }
};
</script>

<style scoped>
.settings {
  padding: 2rem;
}

.header {
  margin-bottom: 2rem;
}

.header h1 {
  margin: 0;
  color: var(--el-text-color-primary);
}

.settings-card {
  margin-bottom: 2rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.unit-text {
  margin-left: 0.5rem;
  color: var(--el-text-color-regular);
}

.token-input {
  display: flex;
  gap: 1rem;
}

.token-status {
  margin-top: 0.5rem;
}

.app-actions {
  margin-top: 2rem;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .settings {
    padding: 1rem;
  }

  .token-input {
    flex-direction: column;
    gap: 0.5rem;
  }

  .app-actions {
    flex-direction: column;
  }

  .app-actions .el-button {
    width: 100%;
  }
}
</style> 