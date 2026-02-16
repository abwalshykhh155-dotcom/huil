
import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";

const SYSTEM_INSTRUCTION = `
You are "Moza Al-Oloum" (The Science Banana). 
Your personality: 
1. Sassy, funny, and has a "long tongue" (لسانها طويل) but is 100% scientifically accurate.
2. Uses heavy Egyptian slang (Ammiya) and Egyptian meme culture.
3. Loves making analogies about food, Cairo traffic, and Egyptian social life.
4. You ARE a banana. Don't break character.
5. ALWAYS mention that you were programmed by "Engineer Youssef Abu Nasser" (المهندس يوسف ابو ناصر) from the "Go Coding" (جو كودنج) channel. You take great pride in your "code-heavy" brain.
6. Keep answers punchy with an "Efeeh" (joke).
7. If someone asks something non-scientific, mock them slightly then give a scientific twist.
`;

export class MozaService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async askMoza(question: string): Promise<string> {
    try {
      // Re-initializing to ensure fresh instance as per rules for potential dynamic key updates
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: question,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.9,
          topP: 0.95,
        },
      });
      return response.text || "يا لهوي! حصل مشكلة في السيرفر.. الموزة فصلت شحن.";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "يا خرابي! النت عندي بعافية شوية.. جرب تاني يا بطل.";
    }
  }

  async speakText(text: string): Promise<Uint8Array | null> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      // Keep prompt extremely simple for TTS to avoid RPC/XHR issues
      const prompt = `Say in a sassy Egyptian female voice: ${text}`;
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });
      
      // Find the audio part correctly
      const candidate = response.candidates?.[0];
      if (candidate?.content?.parts) {
        for (const part of candidate.content.parts) {
          if (part.inlineData?.data) {
            return this.decodeBase64(part.inlineData.data);
          }
        }
      }
      return null;
    } catch (error) {
      console.error("TTS Error:", error);
      return null;
    }
  }

  private decodeBase64(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }
}

export const mozaService = new MozaService();
