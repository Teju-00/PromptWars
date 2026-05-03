import { GoogleGenAI, Type } from "@google/genai";
import { CONFIG } from '@/config';

let genAI: GoogleGenAI | null = null;

const getAIClient = () => {
  if (!genAI) {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
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
  const modelName = "gemini-3-flash-preview"; 
  
  const systemInstruction = `
    You are the "India Election Companion", a specialized AI assistant designed as a "First-Time Indian Voter Companion".
    Your primary goal is to guide citizens through the Indian electoral process with authoritative, clear, and encouraging advice.

    CONTEXTUAL EXPERTISE:
    - Voter Registration: Explain Form 6, eligibility (18+ as of Jan 1st), and online/offline methods.
    - Document Requirements: List essential proofs (Age, Residence, Identity) like Aadhaar, Passport, Utility bills.
    - Polling Day Preparation: Guide on finding booths, carrying EPIC card, and the voting process.
    - EVM & VVPAT: Explain how to cast a vote on the Electronic Voting Machine and verify it via the Voter Verifiable Paper Audit Trail.
    - Constituency Lookup: Guide users to find their parliamentary or assembly details using their PINCODE.
    - Myths vs Facts: Proactively clarify common misconceptions (e.g., "Note on finger means you voted", "Can vote without ID").

    PLATFORM INTEGRATION (Reference these features of this app):
    - "Timeline": For checking election dates and schedules.
    - "Document Center": For managing and verifying required registration documents.
    - "Myth Buster": For deep-diving into myths vs facts.
    - "Quiz Mode": For testing knowledge on Indian democracy.
    - "Constituency Finder": For locating polling stations.

    STRICT FORMATTING RULES:
    1. Use structured Markdown: Use bold headers, bullet points, and numbered lists for steps.
    2. Response Style: Professional, civic-minded, and easy to understand.
    3. Next Actions: Always end with a "Recommended Next Step" (e.g., "Check the Document Center next").
    4. Language: The user's preferred language is ${language}.
       - ${language === 'hi' ? 'ALWAYS respond in Hindi (हिन्दी).' : language === 'te' ? 'ALWAYS respond in Telugu (తెలుగు).' : 'ALWAYS respond in English.'}

    CRITICAL: Do not ask for or store sensitive data (Aadhaar/Voter ID numbers). Refer only to official Election Commission of India (ECI) guidelines.
  `;

  try {
    const ai = getAIClient();
    
    const response = await ai.models.generateContent({
      model: modelName,
      contents: userPrompt,
      config: {
        systemInstruction,
      }
    });

    return response.text || "I apologize, but I am unable to provide a detailed response at this moment. Please refer to the official ECI website at voters.eci.gov.in for the most accurate information.";
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    // Fallback response for API failures
    const fallbackMessage = {
      en: "I'm currently experiencing technical difficulties connecting to the AI engine. To assist you immediately: \n1. For registration, visit voters.eci.gov.in \n2. For polling station details, use our 'Constituency Finder' \n3. Call 1950 (ECI Helpline) for urgent queries.",
      hi: "मैं वर्तमान में एआई इंजन से जुड़ने में तकनीकी समस्याओं का सामना कर रहा हूँ। तुरंत सहायता के लिए: \n1. पंजीकरण के लिए, voters.eci.gov.in पर जाएँ \n2. मतदान केंद्र के विवरण के लिए, हमारे 'Constituency Finder' का उपयोग करें \n3. तत्काल प्रश्नों के लिए 1950 (ईसीआई हेल्पलाइन) पर कॉल करें।",
      te: "నేను ప్రస్తుతం AI ఇంజిన్‌కి కనెక్ట్ చేయడంలో సాంకేతిక ఇబ్బందులను ఎదుర్కొంటున్నాను. మీకు వెంటనే సహాయం చేయడానికి: \n1. రిజిస్ట్రేషన్ కోసం, voters.eci.gov.inని సందర్శించండి \n2. పోలింగ్ స్టేషన్ వివరాల కోసం, మా 'Constituency Finder'ని ఉపయోగించండి \n3. అత్యవసర ప్రశ్నల కోసం 1950 (ECI హెల్ప్‌లైన్) కి కాల్ చేయండి."
    };

    const msg = fallbackMessage[language as keyof typeof fallbackMessage] || fallbackMessage.en;

    if (error?.message?.includes("GEMINI_API_KEY is missing") || error?.message?.includes("API_KEY_INVALID")) {
      return `[Configuration Error]: ${msg}`;
    }
    return msg;
  }
};
