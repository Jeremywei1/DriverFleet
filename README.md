
# 🚛 DriverFleet Pro | 车队管家 (Enterprise Edition)

**DriverFleet Pro** 是一个现代化、高性能的车队运营管理系统。它不仅仅是一个后台仪表盘，更是集成了 AI 洞察、可视化调度与资产全生命周期管理的数字化驾驶舱。

专为复杂的物流与客运场景设计，采用 React 19 + Tailwind CSS 打造极致的 Glassmorphism (毛玻璃) 交互体验。

### 🌐 在线体验 (Live Demo)
👉 **[点击立即访问 / Launch App](https://driverfleet-f1t.pages.dev/)**

---

## ✨ 核心功能 (Core Features)

### 1. 🧠 AI 智能运营枢纽 (AI-Powered Dashboard)
- **集成 Google Gemini 3 Pro**: 实时分析运营数据，自动生成“奖金结算建议”、“异常监控报告”及“运力优化策略”。
- **自然语言洞察**: 不再只是冰冷的数字，AI 为你解读数据背后的业务逻辑。

### 2. 🗓️ 可视化调度指挥中心 (Visual Command Center)
- **全域负载轴 (Availability Grid)**: 类似 Gantt 图的直观视图，实时监控每一位司机、每一辆车的占用、空闲与停运状态。
- **智能撮合 (Smart Matching)**: 快速创建调度任务，支持“单日短途”与“跨天长途”模式，自动检测资源冲突。
- **快照式记录**: 任务创建瞬间锁定车辆车型与座位数快照，确保历史数据真实可溯，不受资产变更影响。

### 3. 📊 战略效能看板 (Strategic Analytics)
- **多维报表**: 支持“单日”与“自定义周期”的双模筛选。
- **人力视图**: 分析司机完单量、工时饱和度与服务效率评分 (SC)。
- **资产视图**: 基于任务快照的车型需求热度分析 (Heatmap)，辅助未来的车辆采购与租赁决策。

### 4. 🪪 资产与人力档案库 (Resource Management)
- **司机管理**: 完整的 CRUD 流程，支持状态切换 (在职/停运)、星级评分与详细资料卡片。
- **车辆全生命周期**: 管理车型、座位数、里程、保养记录及资产状态。
- **实时地图监控 (Live Map)**: 模拟车辆实时位置、状态脉冲与上帝视角监控。

### 5. ☁️ 云端数据同步 (Cloud Sync Simulation)
- **D1 数据库架构**: 内置完整的 SQL Schema 管理控制台。
- **离线优先**: 前端乐观更新 (Optimistic UI) + 后台异步同步机制。
- **数据热修复**: 提供一键式数据库结构迁移 (Migration) 与清洗工具。

---

## 🛠️ 技术栈 (Tech Stack)

- **核心框架**: React 19, TypeScript, Vite
- **UI 系统**: Tailwind CSS (Arbitrary values), Lucide React (Icons)
- **视觉风格**: Glassmorphism, Rounded-[48px] Design System, Smooth Transitions
- **数据可视化**: Recharts
- **AI 引擎**: Google GenAI SDK (`@google/genai`)
- **数据层**: Cloudflare D1 (Simulated via Functions)

## 🚀 快速开始

1. **安装依赖**
   ```bash
   npm install
   ```

2. **配置环境**
   确保环境中有可用的 API Key 用于 AI 服务。

3. **启动开发服务器**
   ```bash
   npm run dev
   ```

4. **构建生产版本**
   ```bash
   npm run build
   ```

---

> "Boring is a bug." —— 致力于打造不仅好用，而且**好看**的企业级应用。
