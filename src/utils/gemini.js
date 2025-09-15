import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY || API_KEY === 'YOUR_API_KEY') {
  console.warn("Gemini API key is not configured. Cosmic Assist will not be functional.");
}

const genAI = new GoogleGenerativeAI(API_KEY || "dummy_key");

// Helper for exponential backoff
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function runChat(prompt) {
  if (!API_KEY || API_KEY === 'YOUR_API_KEY' || API_KEY.length < 20) {
    return "The AI assistant is not configured. Please add your Gemini API key to the `.env` file to enable this feature.";
  }

  const maxRetries = 10;
  const baseDelay = 2000;
  const maxDelay = 60000;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      // Reverted to the correct model. The robust retry logic will handle any temporary overload issues.
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      return text; // Success, exit loop
    } catch (error) {
      console.error(`Error running chat with Gemini (Attempt ${attempt + 1}):`, error);

      // Check for retryable errors (503 for overloaded, or network fetch errors)
      const isRetryable = (error.status === 503) || (error.message && error.message.includes('Failed to fetch'));

      if (isRetryable && attempt < maxRetries - 1) {
        // Exponential backoff with jitter and a cap.
        const delay = Math.min(Math.pow(2, attempt) * baseDelay + Math.random() * 1000, maxDelay);
        console.log(`AI service is busy or unreachable. Retrying in ${(delay / 1000).toFixed(1)} seconds...`);
        await sleep(delay);
        attempt++;
      } else {
        // Handle other errors or final retry failure
        if (error.message && error.message.includes('API key not valid')) {
            return "The provided Gemini API key is not valid. Please check the key in your .env file.";
        }
        if (error.message && error.message.includes('quota')) {
            return "It appears the Gemini API key has exceeded its usage quota. Please check your plan and billing details on the Google AI platform.";
        }
        if (error.status === 404) {
            return "The AI model could not be found. The service may be temporarily unavailable or the model name is incorrect. Please ensure the model name in `src/utils/gemini.js` is valid for your API key.";
        }
        if (error.status === 503) {
            return "The AI service is currently experiencing high traffic and is temporarily unavailable after multiple retries. Please try again in a few moments.";
        }
        // Generic error for anything else, including fetch errors on last retry
        return "Sorry, I encountered an error while trying to connect to the AI service. It might be temporarily unavailable. Please check the console for details and try again later.";
      }
    }
  }
  
  return "Failed to get a response from the AI service after multiple retries.";
}
