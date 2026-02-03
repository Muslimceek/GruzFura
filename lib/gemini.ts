import { GoogleGenAI } from "@google/genai";

// Singleton instance holder
let aiClient: GoogleGenAI | null = null;

// Helper to safely get the AI client
const getAIClient = () => {
    if (aiClient) return aiClient;

    const apiKey = process.env.API_KEY;
    if (!apiKey || apiKey === 'undefined') {
        console.warn("⚠️ Gemini API Key is missing. AI features will be disabled.");
        return null;
    }

    try {
        aiClient = new GoogleGenAI({ apiKey });
        return aiClient;
    } catch (e) {
        console.error("Failed to initialize Gemini client:", e);
        return null;
    }
};

export const analyzeRouteWithAI = async (from: string, to: string, type: 'truck' | 'cargo', details: string) => {
  try {
    const client = getAIClient();
    
    if (!client) {
        return "AI сервис временно недоступен (отсутствует API ключ).";
    }

    const prompt = `
      Ты — логистический эксперт по странам СНГ и РФ.
      Задача: Проанализируй маршрут для грузоперевозок.
      
      Данные:
      Откуда: ${from}
      Куда: ${to}
      Тип: ${type === 'truck' ? 'Грузовой автомобиль' : 'Груз'}
      Детали: ${details}

      Используй Google Search, чтобы найти актуальные расстояния и примерные рыночные ставки на 2024-2025 год.
      
      Дай ответ в формате, который легко читать (коротко).
      Обязательно включи:
      1. Расстояние (км).
      2. Примерное время в пути (с учетом границ, если есть).
      3. Рекомендованная рыночная цена (диапазон) в USD или RUB.
      4. Краткий совет по маршруту (сложности, перевалы, границы).

      Не используй markdown форматирование, просто текст.
    `;

    const response = await client.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        thinkingConfig: { thinkingBudget: 0 } // Speed over deep thought for this interactions
      }
    });

    return response.text;
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return null;
  }
};