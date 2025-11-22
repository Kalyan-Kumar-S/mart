import { GoogleGenAI } from "@google/genai";
import { Product, StockItem, Store } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getInventoryInsights = async (
  store: Store, 
  stock: StockItem[], 
  products: Product[]
): Promise<string> => {
  try {
    const stockDataSummary = stock.map(s => {
      const p = products.find(prod => prod.id === s.productId);
      return `${p?.name}: ${s.quantity} units`;
    }).join('\n');

    const prompt = `
      You are an expert inventory manager for a supermarket named "${store.name}".
      Analyze the following current stock levels and provide a brief executive summary.
      Identify critical shortages, suggest 2 promotional ideas for overstocked items if any appear likely (assume >40 is high), and give general advice.
      Keep it professional, concise, and formatted in Markdown.
      
      Stock Data:
      ${stockDataSummary}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Unable to generate insights at this time.";
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return "AI insights currently unavailable. Please check your API key.";
  }
};

export const getRecipeSuggestions = async (
  selectedProducts: Product[]
): Promise<string> => {
  try {
    const ingredients = selectedProducts.map(p => p.name).join(', ');
    const prompt = `
      I have the following ingredients: ${ingredients}.
      Suggest 2 creative recipes I can make using these (and common pantry staples).
      Format the output as Markdown with bold titles. Keep it short.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "No recipes found.";
  } catch (error) {
    console.error("Gemini Recipe Error:", error);
    return "AI recipe suggestions unavailable.";
  }
};