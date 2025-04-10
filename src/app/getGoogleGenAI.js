import { GoogleGenAI } from "@google/genai";

export default function getGoogleGenAI() {
    return new GoogleGenAI({
        apiKey: process.env.AI_API_KEY,
    });
}
