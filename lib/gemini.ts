import { GoogleGenAI } from "@google/genai";

export interface AIResult {
  text: string;
  citations?: { title: string; uri: string }[];
}

const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === "" || apiKey === "undefined") return null;
  return new GoogleGenAI({ apiKey });
};

/**
 * Quick analysis using Flash with Google Search grounding
 */
export const analyzeRouteWithAI = async (from: string, to: string, type: 'truck' | 'cargo', details: string): Promise<AIResult> => {
  const ai = getAI();
  if (!ai) return { text: "AI сервис недоступен (ключ не найден)." };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Проанализируй маршрут ${from} -> ${to} для ${type === 'truck' ? 'фуры' : 'груза'}. Детали: ${details}. 
      Используй поиск для уточнения текущих цен на топливо и ставок 2025 года. Дай краткий ответ: расстояние, цена, время, совет.`,
      config: {
        tools: [{ googleSearch: {} }]
      },
    });

    const text = response.text || "Ошибка получения текста.";
    
    // Extract search grounding metadata
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const citations = chunks?.map(chunk => {
      if (chunk.web) {
        return {
          title: chunk.web.title || "Источник",
          uri: chunk.web.uri || "#"
        };
      }
      return null;
    }).filter((c): c is { title: string; uri: string } => c !== null);

    return { text, citations };
  } catch (error) {
    console.error("Flash AI Error:", error);
    return { text: "Ошибка при быстром анализе." };
  }
};

/**
 * Complex reasoning using Pro with Thinking Budget
 */
export const getDeepLogisticsAnalysis = async (query: string): Promise<AIResult> => {
  const ai = getAI();
  if (!ai) return { text: "AI сервис недоступен." };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Ты эксперт-логист 2026 года. Реши сложную задачу: ${query}. 
      Продумай риски, оптимальные хабы и юридические нюансы СНГ/РФ.`,
      config: {
        thinkingConfig: { thinkingBudget: 32768 }
      },
    });

    return { text: response.text || "Ошибка генерации ответа." };
  } catch (error) {
    console.error("Pro AI Error:", error);
    return { text: "Не удалось выполнить глубокий анализ." };
  }
};
