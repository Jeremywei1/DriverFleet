import { GoogleGenAI } from "@google/genai";
import { DriverStats, Task, DriverSchedule } from '../types';

export const getFleetAnalysis = async (
  stats: DriverStats[],
  tasks: Task[],
  schedules: DriverSchedule[]
): Promise<string> => {
  try {
    // API key is obtained directly from process.env.API_KEY as per guidelines
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

    // Summarize data to avoid token limits
    const statsSummary = stats.map(s => `${s.name}: ${s.completedOrders} 单, ${s.totalHours} 小时, 效率分: ${s.efficiencyScore}`).join('\n');
    const taskSummary = `今日总任务数: ${tasks.length}, 高优先级: ${tasks.filter(t => t.priority === 'HIGH').length}`;
    
    // Calculate busy rate roughly
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

      **司机绩效 (月度抽样)：**
      ${statsSummary}

      请提供一份简明扼要的战略报告（使用中文），包括：
      1. **异常检测**：是否有司机过度劳累或工作量不足？
      2. **运营效率**：今日车队整体表现如何？
      3. **改进建议**：2-3 条具体的排班或激励建议。
      
      语气要专业且具鼓励性。请使用 Markdown 格式。
    `;

    // Updated model to gemini-3-flash-preview as per coding guidelines for basic text tasks
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "未生成分析结果。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "暂时无法生成 AI 洞察。请检查网络或 API 密钥。";
  }
};