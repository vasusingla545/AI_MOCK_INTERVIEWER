import { GoogleGenAI } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY!;
const genAI = new GoogleGenAI({ apiKey });

export const generateContent = async (prompt: string) => {
  const model = 'gemini-2.5-pro';
  const contents = [
    {
      role: 'user',
      parts: [{ text: prompt }],
    },
  ];

  const response = await genAI.models.generateContentStream({
    model,
    contents,
  });

  let fullResponse = '';
  for await (const chunk of response) {
    fullResponse += chunk.text;
  }
  
  return fullResponse;
};
  