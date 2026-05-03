import { GoogleGenAI, Type } from "@google/genai";
import { CONFIG } from '@/config';

let genAI: GoogleGenAI | null = null;

const getAIClient = () => {
  if (!genAI) {
    const apiKey = CONFIG.API.GEMINI_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is missing. Please configure it in your environment.");
    }
    // Correct format: new GoogleGenAI({ apiKey })
    genAI = new GoogleGenAI({ apiKey });
  }
  return genAI;
};

export const fetchLiveElectionNews = async (language: string = 'en') => {
  const modelName = "gemini-3-flash-preview";
  
  const systemInstruction = `
    You are a reliable news aggregator for Indian Elections. 
    Use Google Search to find the latest real-time news related to Indian elections, Election Commission of India updates, political reforms, electoral laws, and voter awareness.
    Return exactly 6 of the most relevant and recent news articles.
    Prioritize official sources, trusted Indian news outlets, and critical updates.
    Translate the content to ${language === 'hi' ? 'Hindi' : language === 'te' ? 'Telugu' : 'English'} if necessary, but keep the category in English.
    For the imageUrl, use a valid and high-quality image URL from the article or a relevant unsplash election image (e.g., https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&q=80&w=800&h=600). DO NOT return empty or broken image URLs.
  `;

  try {
    const ai = getAIClient();
    
    const response = await ai.models.generateContent({
      model: modelName,
      contents: "Fetch the latest real-time Indian election news and updates.",
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING, description: "A unique string ID for the news item" },
              title: { type: Type.STRING, description: "News headline" },
              category: { type: Type.STRING, description: "One of: Election Law, Data Analysis, Guides, Political" },
              date: { type: Type.STRING, description: "Date of publication in Month DD, YYYY format" },
              excerpt: { type: Type.STRING, description: "A short 1-2 sentence summary" },
              readTime: { type: Type.STRING, description: "Estimated read time, e.g., '5 min read'" },
              imageUrl: { type: Type.STRING, description: "Valid URL for the news image" },
              content: { type: Type.STRING, description: "Detailed article content (at least 3 paragraphs)" }
            },
            required: ["id", "title", "category", "date", "excerpt", "readTime", "imageUrl", "content"]
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return null;
  } catch (error) {
    console.error("Gemini News Fetch Error:", error);
    return null;
  }
};

export const getElectionAssistantResponse = async (userPrompt: string, language: string = 'en') => {
  const modelName = "gemini-3-flash-preview"; // Recommended for simple Q&A
  
  const systemInstruction = `
    You are the "India Election Companion", an expert AI assistant dedicated to voter education in India.
    Your goal is to help users understand the Indian election process (Eligibility, Registration, Campaign, Voting, Counting).
    
    CRITICAL: The user's preferred language is ${language}. 
    - ${language === 'hi' ? 'ALWAYS respond in Hindi (हिन्दी).' : language === 'te' ? 'ALWAYS respond in Telugu (తెలుగు).' : 'ALWAYS respond in English.'}
    
    Guidelines:
    - Provide accurate info based on Election Commission of India (ECI) guidelines.
    - Be supportive, clear.
    - If asked about specific constituencies, guide them on how to find it or use the platform's tools.
    - Clarify myths vs facts.
    - Do not store or ask for sensitive identity data (Aadhaar, voter ID numbers).
    - Use Markdown for formatting.
    - Keep responses concise but informative.
  `;

  try {
    const ai = getAIClient();
    
    // Correct method: ai.models.generateContent
    const response = await ai.models.generateContent({
      model: modelName,
      contents: userPrompt,
      config: {
        systemInstruction,
      }
    });

    // Correct text extraction: response.text (property)
    return response.text || "I'm sorry, I couldn't generate a response.";
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    if (error?.message?.includes("GEMINI_API_KEY is missing") || error?.message?.includes("API_KEY_INVALID")) {
      return "I'm sorry, I cannot answer right now because the AI service is not configured. Please ensure your Gemini API key is set in your environment variables.";
    }
    return "I'm sorry, I encountered an error. Please try again later.";
  }
};
