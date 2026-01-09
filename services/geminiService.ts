
import { GoogleGenAI } from "@google/genai";
import { DriverStats, Task, DriverSchedule } from '../types';

// 解决浏览器环境下 TypeScript 对 process.env 的报错
declare var process: {
  env: {
    API_KEY: string;
  };
};

export const getFleetAnalysis = async (
  stats: DriverStats[],
  tasks: Task[],
  schedules: DriverSchedule[]
): Promise<string> => {
  try {
    // Initialize GoogleGenAI with the API key from environment variables
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // 汇总实际任务数据
    const statsSummary = stats.map(s => `${s.name}: 已完工 ${s.completedOrders} 单, 总计 ${s.totalHours} 小时, 评分 ${s.efficiencyScore}`).join('\n');
    const taskDetails = tasks.slice(0, 5).map(t => `- ${t.title} (${t.status})`).join('\n');
    
    let totalSlots = 0;
    let busySlots = 0;
    schedules.forEach(s => {
        s.slots.forEach(slot => {
            if (slot.hour >= 8 && slot.hour <= 18) {
                totalSlots++;
                if (slot.status === 'BUSY') busySlots++;
            }
        });
    });
    const utilization = totalSlots > 0 ? Math.round((busySlots / totalSlots) * 100) : 0;

    const prompt = `
      作为车队运营专家及奖金结算顾问，分析以下实时数据：

      **今日业务详情：**
      - 总调度单量: ${tasks.length}
      - 核心运营时段利用率: ${utilization}%
      - 最新任务概览:
      ${taskDetails}

      **司机长期绩效档案：**
      ${statsSummary}

      请生成一份具有“奖金激励导向”的专业报告（中文）：
      1. **异常监控**：分析是否有司机疲劳驾驶或工时不足。
      2. **结算建议**：基于今日和月度表现，哪位司机最有潜力获得“今日服务之星”或额外奖金？
      3. **运营优化**：针对当前利用率，提供 2 条提高派单效率的策略。
      
      报告应专业且具有洞察力，直接针对未来的奖金发放提供逻辑参考。使用 Markdown 格式。
    `;

    // Updated model to gemini-3-pro-preview for complex reasoning tasks as per guidelines and UI consistency
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
    });

    // Access the text property directly on the GenerateContentResponse object
    return response.text || "数据量不足，无法生成奖金结算建议。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "AI 分析引擎暂时离线，但您的本地数据已安全保存。";
  }
};
