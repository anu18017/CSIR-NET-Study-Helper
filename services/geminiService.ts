import { GoogleGenAI, Type } from "@google/genai";
import type { QuizQuestion } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const solveDoubt = async (doubt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Please provide a detailed and accurate explanation suitable for a CSIR NET aspirant for the following doubt. The subject can be from any science stream like Life Sciences, Chemical Sciences, Physical Sciences, etc.
      
      Instructions:
      1. Structure the answer with clear headings, subheadings, and bullet points for maximum readability.
      2. If a visual diagram, flowchart, or graph would significantly aid understanding, generate the diagram's structure using Mermaid.js syntax.
      3. Wrap the Mermaid.js syntax in a markdown code block like this: \`\`\`mermaid\n[...mermaid syntax...]\n\`\`\`
      4. The textual explanation should be comprehensive and clear, standing on its own, with the Mermaid diagram serving as a visual aid.
      
      Doubt: "${doubt}"`,
      config: {
        temperature: 0.5,
        topP: 0.95,
        topK: 64,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Error solving doubt:", error);
    throw new Error("Failed to get an answer from the AI. Please try again.");
  }
};

export const summarizeText = async (text: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Summarize the following text into clear, concise bullet points suitable for student notes:\n\n---\n${text}\n---`,
       config: {
        temperature: 0.3,
        topP: 0.95,
        topK: 64,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Error summarizing text:", error);
    throw new Error("Failed to summarize the text. Please try again.");
  }
};

export const generateQuiz = async (text: string, numQuestions: number): Promise<QuizQuestion[]> => {
  try {
    const schema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: {
            type: Type.STRING,
            description: "The multiple-choice question."
          },
          options: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "An array of 4 possible answers."
          },
          correctAnswer: {
            type: Type.STRING,
            description: "The correct answer from the options array."
          }
        },
        required: ['question', 'options', 'correctAnswer']
      }
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Based on the following text, generate a multiple-choice quiz with exactly ${numQuestions} questions. Each question must have exactly 4 options. Ensure the correct answer is one of the options.\n\n---\n${text}\n---`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: schema,
      }
    });
    
    const jsonText = response.text.trim();
    const quizData = JSON.parse(jsonText) as QuizQuestion[];

    if (!Array.isArray(quizData)) {
      throw new Error("AI returned an invalid format.");
    }

    return quizData;
  } catch (error) {
    console.error("Error generating quiz:", error);
    if (error instanceof SyntaxError) {
      throw new Error("Failed to generate the quiz due to an invalid format from the AI. Please try again with a different text.");
    }
    throw new Error("Failed to generate the quiz. Please check the provided text and try again.");
  }
};