<template>
  <div class="repositories">
    <div class="header">
      <h1>仓库管理</h1>
      <div class="actions">
        <el-button type="primary" @click="refreshRepositories" :loading="loading">
          刷新
        </el-button>
      </div>
    </div>

    <el-tabs v-model="activeTab" class="repository-tabs">
      <el-tab-pane label="GitHub 仓库" name="github">
        <el-table
          :data="githubRepos"
          style="width: 100%"
          v-loading="loading"
        >
          <el-table-column prop="name" label="仓库名称" />
          <el-table-column label="同步状态" width="120">
            <template #default="{ row }">
              <el-switch
                v-model="row.syncEnabled"
                @change="(val) => handleSyncChange(row, val)"
              />
            </template>
          </el-table-column>
          <el-table-column label="最后同步" width="180">
            <template #default="{ row }">
              {{ formatDate(row.lastSyncTime) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200">
            <template #default="{ row }">
              <el-button
                type="primary"
                size="small"
                @click="startSync(row)"
                :disabled="!row.syncEnabled"
              >
                同步
              </el-button>
              <el-button
                type="info"
                size="small"
                @click="viewDetails(row)"
              >
                详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="Gitee 仓库" name="gitee">
        <el-table
          :data="giteeRepos"
          style="width: 100%"
          v-loading="loading"
        >
          <el-table-column prop="name" label="仓库名称" />
          <el-table-column label="同步状态" width="120">
            <template #default="{ row }">
              <el-switch
                v-model="row.syncEnabled"
                @change="(val) => handleSyncChange(row, val)"
              />
            </template>
          </el-table-column>
          <el-table-column label="最后同步" width="180">
            <template #default="{ row }">
              {{ formatDate(row.lastSyncTime) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200">
            <template #default="{ row }">
              <el-button
                type="primary"
                size="small"
                @click="startSync(row)"
                :disabled="!row.syncEnabled"
              >
                同步
              </el-button>
              <el-button
                type="info"
                size="small"
                @click="viewDetails(row)"
              >
                详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="同步列表" name="sync">
        <el-table
          :data="syncList"
          style="width: 100%"
          v-loading="loading"
        >
          <el-table-column prop="name" label="仓库名称" />
          <el-table-column prop="platform" label="平台" width="120">
            <template #default="{ row }">
              {{ row.platform === 'github' ? 'GitHub' : 'Gitee' }}
            </template>
          </el-table-column>
          <el-table-column label="同步状态" width="120">
            <template #default="{ row }">
              <el-tag :type="getSyncStatusType(row)">
                {{ getSyncStatusText(row) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="最后同步" width="180">
            <template #default="{ row }">
              {{ formatDate(row.lastSyncTime) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200">
            <template #default="{ row }">
              <el-button
                type="primary"
                size="small"
                @click="startSync(row)"
                :disabled="!row.syncEnabled"
              >
                同步
              </el-button>
              <el-button
                type="danger"
                size="small"
                @click="removeFromSync(row)"
              >
                移除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <el-dialog
      v-model="detailsVisible"
      :title="selectedRepo ? selectedRepo.name + ' 详情' : '仓库详情'"
      width="80%"
    >
      <template v-if="selectedRepo">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="仓库名称">
            {{ selectedRepo.name }}
          </el-descriptions-item>
          <el-descriptions-item label="平台">
            {{ selectedRepo.platform === 'github' ? 'GitHub' : 'Gitee' }}
          </el-descriptions-item>
          <el-descriptions-item label="同步状态">
            <el-tag :type="getSyncStatusType(selectedRepo)">
              {{ getSyncStatusText(selectedRepo) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="最后同步时间">
            {{ formatDate(selectedRepo.lastSyncTime) }}
          </el-descriptions-item>
        </el-descriptions>

        <div class="details-actions">
          <el-button
            type="primary"
            @click="startSync(selectedRepo)"
            :disabled="!selectedRepo.syncEnabled"
          >
            同步
          </el-button>
          <el-button
            type="danger"
            @click="removeFromSync(selectedRepo)"
            v-if="selectedRepo.syncEnabled"
          >
            移除同步
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useRepositoryStore } from '../stores/repository';
import { useSyncStore } from '../stores/sync';

interface Repository {
  id: string;
  name: string;
  platform: 'github' | 'gitee';
  syncEnabled: boolean;
  lastSyncTime?: string;
}

const repoStore = useRepositoryStore();
const syncStore = useSyncStore();

const activeTab = ref('github');
const loading = ref(false);
const detailsVisible = ref(false);
const selectedRepo = ref<Repository | null>(null);

const githubRepos = computed(() => repoStore.githubRepos);
const giteeRepos = computed(() => repoStore.giteeRepos);
const syncList = computed(() => repoStore.syncList);

const refreshRepositories = async () => {
  loading.value = true;
  try {
    await repoStore.fetchGithubRepos();
    await repoStore.fetchGiteeRepos();
    await repoStore.fetchSyncList();
    ElMessage.success('刷新成功');
  } catch (error) {
    ElMessage.error('刷新失败');
  } finally {
    loading.value = false;
  }
};

const handleSyncChange = async (repo: Repository, enabled: boolean) => {
  try {
    if (enabled) {
      await repoStore.addRepository(repo);
      ElMessage.success('添加到同步列表成功');
    } else {
      await repoStore.removeRepository(repo.id);
      ElMessage.success('从同步列表移除成功');
    }
  } catch (error) {
    ElMessage.error(enabled ? '添加失败' : '移除失败');
    repo.syncEnabled = !enabled;
  }
};

const startSync = async (repo: Repository) => {
  try {
    await syncStore.startSync(repo.id);
    ElMessage.success('同步开始');
  } catch (error) {
    ElMessage.error('同步失败');
  }
};

const removeFromSync = async (repo: Repository) => {
  try {
    await ElMessageBox.confirm(
      '确定要从同步列表中移除该仓库吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );
    await repoStore.removeRepository(repo.id);
    ElMessage.success('移除成功');
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('移除失败');
    }
  }
};

const viewDetails = (repo: Repository) => {
  selectedRepo.value = repo;
  detailsVisible.value = true;
};

const formatDate = (date?: string) => {
  if (!date) return '未同步';
  return new Date(date).toLocaleString();
};

const getSyncStatusType = (repo: Repository) => {
  if (!repo.syncEnabled) return 'info';
  const status = syncStore.syncStatuses[repo.id]?.status;
  switch (status) {
    case 'syncing':
      return 'warning';
    case 'error':
      return 'danger';
    default:
      return 'success';
  }
};

const getSyncStatusText = (repo: Repository) => {
  if (!repo.syncEnabled) return '未启用';
  const status = syncStore.syncStatuses[repo.id]?.status;
  switch (status) {
    case 'syncing':
      return '同步中';
    case 'error':
      return '错误';
    default:
      return '已启用';
  }
};

onMounted(refreshRepositories);
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
  color: var(--el-text-color-primary);
}

.repository-tabs {
  margin-top: 1rem;
}

.details-actions {
  margin-top: 2rem;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .repositories {
    padding: 1rem;
  }

  .header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .actions {
    display: flex;
    justify-content: stretch;
  }

  .actions .el-button {
    flex: 1;
  }
}
</style> 