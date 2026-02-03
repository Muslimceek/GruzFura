
import { GoogleGenAI } from "@google/genai";

export interface AIResult {
  text: string;
  citations?: { title: string; uri: string }[];
}

/**
 * Initialize AI instance dynamically to ensure the latest API key is used
 */
const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === "" || apiKey === "undefined") return null;
  return new GoogleGenAI({ apiKey });
};

/**
 * Fast AI response using Gemini Flash Lite
 * Best for simple UI tasks and immediate feedback
 */
export const getFastAiResponse = async (prompt: string): Promise<string> => {
  const ai = getAI();
  if (!ai) return "AI service unavailable.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: prompt,
    });
    return response.text || "";
  } catch (error) {
    console.error("Flash Lite AI Error:", error);
    return "Error generating fast response.";
  }
};

/**
 * Advanced analysis with Google Search grounding
 * Uses Gemini 3 Flash for up-to-date logistics information
 */
export const analyzeWithSearch = async (query: string): Promise<AIResult> => {
  const ai = getAI();
  if (!ai) return { text: "AI service unavailable." };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: query,
      config: {
        tools: [{ googleSearch: {} }]
      },
    });

    const text = response.text || "No response received.";
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    // Extracting URLs from grounding chunks as required
    const citations = chunks?.map(chunk => {
      if (chunk.web) {
        return {
          title: chunk.web.title || "Source",
          uri: chunk.web.uri || "#"
        };
      }
      return null;
    }).filter((c): c is { title: string; uri: string } => c !== null);

    return { text, citations };
  } catch (error) {
    console.error("Search Grounding Error:", error);
    return { text: "Search analysis failed." };
  }
};

/**
 * Deep thinking for complex logistics queries
 * Uses Gemini 3 Pro with maximum thinking budget of 32768
 * Does not set maxOutputTokens to prevent response blocking
 */
export const deepLogisticsAnalysis = async (query: string): Promise<string> => {
  const ai = getAI();
  if (!ai) return "AI service unavailable.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: query,
      config: {
        thinkingConfig: { thinkingBudget: 32768 }
      },
    });

    return response.text || "Thinking logic failed to produce result.";
  } catch (error) {
    console.error("Deep Thinking AI Error:", error);
    return "Complex analysis timed out or failed.";
  }
};

/**
 * Image analysis for cargo/truck photos
 * Uses Gemini 3 Pro for high-fidelity visual understanding
 */
export const analyzeLogisticImage = async (base64Data: string, mimeType: string): Promise<string> => {
  const ai = getAI();
  if (!ai) return "AI service unavailable.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: "Analyze this logistic image. Identify the type of cargo or transport, estimate volume/dimensions if possible, and suggest if it looks securely packed for long-distance transit. Provide a concise technical summary in the user's current language.",
          },
        ],
      },
    });

    return response.text || "Could not analyze the image.";
  } catch (error) {
    console.error("Image Analysis Error:", error);
    return "Image processing failed.";
  }
};

/**
 * Suggests cities based on input using Gemini Flash Lite
 */
export const suggestCities = async (input: string): Promise<string[]> => {
  const ai = getAI();
  if (!ai || input.length < 2) return [];

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: `List up to 5 real cities in CIS or Eurasia starting with or related to "${input}". Return ONLY a JSON array of strings. Example: ["Moscow, Russia", "Almaty, Kazakhstan"]`,
      config: {
        responseMimeType: "application/json"
      }
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("City Suggestion Error:", error);
    return [];
  }
};

/**
 * Generate a logistic-themed image using Gemini 3 Pro Image
 */
export const generateLogisticVisual = async (prompt: string, aspectRatio: "1:1" | "2:3" | "3:2" | "3:4" | "4:3" | "9:16" | "16:9" | "21:9" = "1:1"): Promise<string | null> => {
  const ai = getAI();
  if (!ai) return null;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: [{ text: `A high-quality 4k photorealistic image for a logistics platform: ${prompt}` }],
      config: {
        imageConfig: {
          aspectRatio,
          imageSize: "1K"
        }
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image Generation Error:", error);
    return null;
  }
};
