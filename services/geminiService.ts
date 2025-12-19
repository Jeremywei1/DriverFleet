
import { GoogleGenAI } from "@google/genai";
import { DriverStats, Task, DriverSchedule } from '../types';

export const getFleetAnalysis = async (
  stats: DriverStats[],
  tasks: Task[],
  schedules: DriverSchedule[]
): Promise<string> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      return "未找到 API 密钥。请配置环境变量。";
    }

    const ai = new GoogleGenAI({ apiKey });

    // 数据摘要处理
    const statsSummary = stats.map(s => `${s.name}: ${s.completedOrders} 单, 效率分: ${s.efficiencyScore}`).join('\n');
    const taskSummary = `今日总任务数: ${tasks.length}, 高优先级: ${tasks.filter(t => t.priority === 'HIGH').length}`;
    
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
      作为一名车队管理 AI 助手，请分析以下司机数据：

      **每日概览：**
      - ${taskSummary}
      - 白天车队利用率 (8点-18点): ${utilization}%

      **司机绩效摘要：**
      ${statsSummary}

      请提供一份简明扼要的报告（中文），包含：
      1. **异常监控**：是否有过度疲劳风险。
      2. **调度建议**：2条具体的优化操作建议。
      
      请使用 Markdown 格式。
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "未生成分析结果。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "暂时无法生成 AI 洞察。请稍后重试。";
  }
};
