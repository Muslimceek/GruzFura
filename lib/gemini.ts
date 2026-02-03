import { GoogleGenAI } from "@google/genai";

const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === "" || apiKey === "undefined") return null;
  return new GoogleGenAI({ apiKey });
};

/**
 * Quick analysis using Flash with Google Search grounding
 */
export const analyzeRouteWithAI = async (from: string, to: string, type: 'truck' | 'cargo', details: string) => {
  const ai = getAI();
  if (!ai) return "AI сервис недоступен (ключ не найден).";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Проанализируй маршрут ${from} -> ${to} для ${type === 'truck' ? 'фуры' : 'груза'}. Детали: ${details}. 
      Используй поиск для уточнения текущих цен на топливо и ставок 2025 года. Дай краткий ответ: расстояние, цена, время, совет.`,
      config: {
        tools: [{ googleSearch: {} }]
      },
    });

    // Extract citations if available (Grounding Metadata)
    const citations = response.candidates?.[0]?.groundingMetadata?.searchEntryPoint?.htmlContent;
    const text = response.text || "Ошибка получения текста.";
    
    return { text, citations };
  } catch (error) {
    console.error("Flash AI Error:", error);
    return { text: "Ошибка при быстром анализе.", citations: null };
  }
};

/**
 * Complex reasoning using Pro with Thinking Budget
 */
export const getDeepLogisticsAnalysis = async (query: string) => {
  const ai = getAI();
  if (!ai) return "AI сервис недоступен.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Ты эксперт-логист 2026 года. Реши сложную задачу: ${query}. 
      Продумай риски, оптимальные хабы и юридические нюансы СНГ/РФ.`,
      config: {
        thinkingConfig: { thinkingBudget: 32768 }
      },
    });

    return response.text;
  } catch (error) {
    console.error("Pro AI Error:", error);
    return "Не удалось выполнить глубокий анализ.";
  }
};
