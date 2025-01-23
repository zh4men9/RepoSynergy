import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import type { App } from 'vue';

export function setupElementPlus(app: App) {
  app.use(ElementPlus, {
    size: 'small', // 设置组件默认尺寸为 small
    zIndex: 3000,
  });
} 