<template>
  <div class="repositories">
    <div class="header">
      <h1>仓库管理</h1>
      <div class="actions">
        <el-button type="primary" @click="refreshRepositories" :loading="loading">
          刷新
        </el-button>
        <el-button type="success" @click="syncSelectedRepos" :loading="syncing">
          同步选中
        </el-button>
      </div>
    </div>

    <el-tabs v-model="activeTab" class="repo-tabs">
      <el-tab-pane label="GitHub 仓库" name="github">
        <el-table
          v-loading="loading"
          :data="githubRepos"
          style="width: 100%"
          @selection-change="handleGithubSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="name" label="仓库名称" min-width="200">
            <template #default="{ row }">
              <div class="repo-name">
                <el-icon><Document /></el-icon>
                <span>{{ row.name }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="syncEnabled" label="同步状态" width="120">
            <template #default="{ row }">
              <el-tag :type="row.syncEnabled ? 'success' : 'info'">
                {{ row.syncEnabled ? '已启用' : '未启用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="lastSyncTime" label="最后同步" width="180">
            <template #default="{ row }">
              {{ row.lastSyncTime ? formatDate(row.lastSyncTime) : '从未同步' }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button
                :type="row.syncEnabled ? 'danger' : 'success'"
                size="small"
                @click="toggleSync(row)"
              >
                {{ row.syncEnabled ? '停用同步' : '启用同步' }}
              </el-button>
              <el-button
                type="primary"
                size="small"
                @click="startSync(row)"
                :disabled="!row.syncEnabled"
              >
                立即同步
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="Gitee 仓库" name="gitee">
        <el-table
          v-loading="loading"
          :data="giteeRepos"
          style="width: 100%"
          @selection-change="handleGiteeSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="name" label="仓库名称" min-width="200">
            <template #default="{ row }">
              <div class="repo-name">
                <el-icon><Document /></el-icon>
                <span>{{ row.name }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="syncEnabled" label="同步状态" width="120">
            <template #default="{ row }">
              <el-tag :type="row.syncEnabled ? 'success' : 'info'">
                {{ row.syncEnabled ? '已启用' : '未启用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="lastSyncTime" label="最后同步" width="180">
            <template #default="{ row }">
              {{ row.lastSyncTime ? formatDate(row.lastSyncTime) : '从未同步' }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button
                :type="row.syncEnabled ? 'danger' : 'success'"
                size="small"
                @click="toggleSync(row)"
              >
                {{ row.syncEnabled ? '停用同步' : '启用同步' }}
              </el-button>
              <el-button
                type="primary"
                size="small"
                @click="startSync(row)"
                :disabled="!row.syncEnabled"
              >
                立即同步
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, defineComponent } from 'vue';
import type { PropType } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Document } from '@element-plus/icons-vue';
import { useRepositoryStore } from '../stores/repository';
import { useSyncStore } from '../stores/sync';
import type { Repository } from '../types/electron';

defineComponent({
  name: 'Repositories',
  components: {
    Document
  }
});

const repoStore = useRepositoryStore();
const syncStore = useSyncStore();

const activeTab = ref<string>('github');
const loading = ref<boolean>(false);
const syncing = ref<boolean>(false);
const selectedGithubRepos = ref<Repository[]>([]);
const selectedGiteeRepos = ref<Repository[]>([]);

const githubRepos = computed(() => repoStore.githubRepos);
const giteeRepos = computed(() => repoStore.giteeRepos);

onMounted(async () => {
  await refreshRepositories();
});

const refreshRepositories = async () => {
  loading.value = true;
  try {
    await Promise.all([
      repoStore.fetchGithubRepos(),
      repoStore.fetchGiteeRepos(),
      repoStore.fetchSyncList()
    ]);
  } catch (error) {
    ElMessage.error('获取仓库列表失败');
  } finally {
    loading.value = false;
  }
};

const handleGithubSelectionChange = (selection: Repository[]) => {
  selectedGithubRepos.value = selection;
};

const handleGiteeSelectionChange = (selection: Repository[]) => {
  selectedGiteeRepos.value = selection;
};

const toggleSync = async (repo: Repository) => {
  try {
    if (repo.syncEnabled) {
      await repoStore.removeRepository(repo.id);
      ElMessage.success('已停用同步');
    } else {
      await repoStore.addRepository(repo);
      ElMessage.success('已启用同步');
    }
  } catch (error) {
    ElMessage.error(repo.syncEnabled ? '停用同步失败' : '启用同步失败');
  }
};

const startSync = async (repo: Repository) => {
  try {
    await syncStore.startSync(repo.id);
    ElMessage.success('同步已开始');
  } catch (error) {
    ElMessage.error('启动同步失败');
  }
};

const syncSelectedRepos = async () => {
  const selectedRepos = activeTab.value === 'github' 
    ? selectedGithubRepos.value 
    : selectedGiteeRepos.value;

  if (selectedRepos.length === 0) {
    ElMessage.warning('请选择要同步的仓库');
    return;
  }

  try {
    await ElMessageBox.confirm(
      `确定要同步选中的 ${selectedRepos.length} 个仓库吗？`,
      '确认同步',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );

    syncing.value = true;
    for (const repo of selectedRepos) {
      if (!repo.syncEnabled) {
        await repoStore.addRepository(repo);
      }
      await syncStore.startSync(repo.id);
    }
    ElMessage.success('已开始同步选中的仓库');
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('同步失败');
    }
  } finally {
    syncing.value = false;
  }
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};
</script>

<style scoped>
.repositories {
  padding: 2rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header h1 {
  margin: 0;
  font-size: 1.8rem;
  color: var(--el-text-color-primary);
}

.actions {
  display: flex;
  gap: 1rem;
}

.repo-tabs {
  margin-top: 1rem;
}

.repo-name {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.repo-name .el-icon {
  color: var(--el-text-color-secondary);
}

@media (max-width: 768px) {
  .repositories {
    padding: 1rem;
  }

  .header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .actions {
    width: 100%;
  }

  .actions .el-button {
    flex: 1;
  }
}
</style> 