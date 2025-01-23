<template>
  <div class="analytics">
    <div class="header">
      <h1>仓库分析</h1>
      <div class="actions">
        <el-select v-model="selectedRepo" placeholder="选择仓库" clearable>
          <el-option
            v-for="repo in syncList"
            :key="repo.id"
            :label="repo.name"
            :value="repo"
          >
            <span>{{ repo.name }}</span>
            <span class="repo-platform">
              {{ repo.platform === 'github' ? 'GitHub' : 'Gitee' }}
            </span>
          </el-option>
        </el-select>
        <el-button type="primary" @click="refreshStats" :loading="loading">
          刷新
        </el-button>
      </div>
    </div>

    <div v-if="selectedRepo" class="stats-container">
      <el-card class="stats-card">
        <template #header>
          <div class="card-header">
            <span>基本统计</span>
          </div>
        </template>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="提交数">
            {{ repoStats?.totalCommits || 0 }}
          </el-descriptions-item>
          <el-descriptions-item label="分支数">
            {{ repoStats?.totalBranches || 0 }}
          </el-descriptions-item>
          <el-descriptions-item label="标签数">
            {{ repoStats?.totalTags || 0 }}
          </el-descriptions-item>
          <el-descriptions-item label="仓库大小">
            {{ formatSize(repoStats?.size || 0) }}
          </el-descriptions-item>
          <el-descriptions-item label="最后提交">
            {{ formatDate(repoStats?.lastCommitDate) }}
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <el-card class="stats-card">
        <template #header>
          <div class="card-header">
            <span>语言统计</span>
          </div>
        </template>
        <div class="chart-container">
          <div ref="languageChartRef" class="chart"></div>
        </div>
      </el-card>

      <el-card class="stats-card">
        <template #header>
          <div class="card-header">
            <span>贡献统计</span>
          </div>
        </template>
        <div class="chart-container">
          <div ref="contributionChartRef" class="chart"></div>
        </div>
      </el-card>

      <el-card class="stats-card">
        <template #header>
          <div class="card-header">
            <span>依赖统计</span>
          </div>
        </template>
        <el-table :data="dependencyList" style="width: 100%">
          <el-table-column prop="name" label="依赖名称" />
          <el-table-column prop="version" label="版本" width="180" />
        </el-table>
      </el-card>
    </div>

    <div v-else class="empty-state">
      <el-empty description="请选择要分析的仓库" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { ElMessage } from 'element-plus';
import * as echarts from 'echarts';
import { useRepositoryStore } from '../stores/repository';
import { useAnalyticsStore } from '../stores/analytics';

interface Repository {
  id: string;
  name: string;
  platform: 'github' | 'gitee';
}

interface ChartInstance {
  dispose: () => void;
  resize: () => void;
  setOption: (option: any) => void;
}

const repoStore = useRepositoryStore();
const analyticsStore = useAnalyticsStore();

const selectedRepo = ref<Repository | null>(null);
const loading = ref(false);
const languageChartRef = ref<HTMLElement | null>(null);
const contributionChartRef = ref<HTMLElement | null>(null);
let languageChart: ChartInstance | null = null;
let contributionChart: ChartInstance | null = null;

const syncList = computed(() => repoStore.syncList);
const repoStats = computed(() => 
  selectedRepo.value
    ? analyticsStore.getRepositoryStats(selectedRepo.value.id)
    : null
);
const languageStats = computed(() =>
  selectedRepo.value
    ? analyticsStore.getLanguageStats(selectedRepo.value.id)
    : null
);
const contributionStats = computed(() =>
  selectedRepo.value
    ? analyticsStore.getContributionStats(selectedRepo.value.id)
    : null
);
const dependencyStats = computed(() =>
  selectedRepo.value
    ? analyticsStore.getDependencyStats(selectedRepo.value.id)
    : null
);

const dependencyList = computed(() => {
  if (!dependencyStats.value) return [];
  return Object.entries(dependencyStats.value).map(([name, version]) => ({
    name,
    version,
  }));
});

const formatSize = (size: number) => {
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = size;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }

  return `${value.toFixed(2)} ${units[unitIndex]}`;
};

const formatDate = (date?: string) => {
  if (!date) return '未知';
  return new Date(date).toLocaleString();
};

const initCharts = () => {
  if (languageChartRef.value) {
    languageChart?.dispose();
    languageChart = echarts.init(languageChartRef.value);
  }
  if (contributionChartRef.value) {
    contributionChart?.dispose();
    contributionChart = echarts.init(contributionChartRef.value);
  }
};

const updateLanguageChart = () => {
  if (!languageChart || !languageStats.value) return;

  const data = Object.entries(languageStats.value).map(([name, value]) => ({
    name,
    value,
  }));

  languageChart.setOption({
    title: {
      text: '语言分布',
      left: 'center',
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
    },
    series: [
      {
        type: 'pie',
        radius: '70%',
        data: data,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
  });
};

const updateContributionChart = () => {
  if (!contributionChart || !contributionStats.value) return;

  const authors = Object.keys(contributionStats.value);
  const commits = authors.map(
    (author) => contributionStats.value![author].commits
  );
  const additions = authors.map(
    (author) => contributionStats.value![author].additions
  );
  const deletions = authors.map(
    (author) => contributionStats.value![author].deletions
  );

  contributionChart.setOption({
    title: {
      text: '贡献统计',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    legend: {
      data: ['提交', '添加', '删除'],
      top: 30,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'value',
    },
    yAxis: {
      type: 'category',
      data: authors,
    },
    series: [
      {
        name: '提交',
        type: 'bar',
        stack: 'total',
        label: {
          show: true,
        },
        emphasis: {
          focus: 'series',
        },
        data: commits,
      },
      {
        name: '添加',
        type: 'bar',
        stack: 'total',
        label: {
          show: true,
        },
        emphasis: {
          focus: 'series',
        },
        data: additions,
      },
      {
        name: '删除',
        type: 'bar',
        stack: 'total',
        label: {
          show: true,
        },
        emphasis: {
          focus: 'series',
        },
        data: deletions,
      },
    ],
  });
};

const refreshStats = async () => {
  if (!selectedRepo.value) {
    ElMessage.warning('请先选择仓库');
    return;
  }

  loading.value = true;
  try {
    await Promise.all([
      analyticsStore.fetchRepositoryStats(selectedRepo.value.id),
      analyticsStore.fetchLanguageStats(selectedRepo.value.id),
      analyticsStore.fetchContributionStats(selectedRepo.value.id),
      analyticsStore.fetchDependencyStats(selectedRepo.value.id),
    ]);
    ElMessage.success('刷新成功');
  } catch (error) {
    ElMessage.error('刷新失败');
  } finally {
    loading.value = false;
  }
};

watch(
  [() => selectedRepo.value, languageStats, contributionStats],
  () => {
    initCharts();
    updateLanguageChart();
    updateContributionChart();
  }
);

onMounted(() => {
  window.addEventListener('resize', () => {
    languageChart?.resize();
    contributionChart?.resize();
  });
});

onUnmounted(() => {
  window.removeEventListener('resize', () => {
    languageChart?.resize();
    contributionChart?.resize();
  });
  languageChart?.dispose();
  contributionChart?.dispose();
});
</script>

<style scoped>
.analytics {
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

.actions {
  display: flex;
  gap: 1rem;
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 2rem;
}

.stats-card {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-container {
  height: 400px;
}

.chart {
  width: 100%;
  height: 100%;
}

.repo-platform {
  float: right;
  color: var(--el-text-color-secondary);
}

.empty-state {
  margin-top: 4rem;
}

@media (max-width: 768px) {
  .analytics {
    padding: 1rem;
  }

  .header {
    flex-direction: column;
    gap: 1rem;
  }

  .actions {
    width: 100%;
  }

  .actions .el-select {
    flex: 1;
  }

  .stats-container {
    grid-template-columns: 1fr;
  }

  .chart-container {
    height: 300px;
  }
}
</style> 