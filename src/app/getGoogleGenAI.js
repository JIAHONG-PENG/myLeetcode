import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: process.env.NEXT_PUBLIC_AI_API_KEY,
});

export default ai;
