import { GoogleGenAI } from "@google/genai";

export const analyzeRouteWithAI = async (from: string, to: string, type: 'truck' | 'cargo', details: string) => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey === "" || apiKey === "undefined") {
    console.warn("Gemini API Key is not configured. AI Analysis is disabled.");
    return "AI сервис временно недоступен (отсутствует ключ API).";
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
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

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }]
      },
    });

    return response.text || "Не удалось получить анализ маршрута.";
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return "Ошибка при анализе маршрута через AI.";
  }
};