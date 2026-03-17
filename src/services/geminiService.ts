
import { GoogleGenAI, Type } from "@google/genai";
import { Player } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const parseScorecardImage = async (base64Image: string): Promise<Player[]> => {
  const model = "gemini-3-flash-preview";
  
  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        parts: [
          {
            text: `Extract the golf scorecard data from this image. 
            Return an array of players, each with their name and an array of their scores for each hole.
            Each hole should have holeNumber, par (if visible, otherwise estimate based on typical courses), and the actual score (strokes) the player took.
            If names are hard to read, use "Player 1", "Player 2", etc.
            Try to find all 18 holes if available, or as many as present.`
          },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image.split(',')[1] || base64Image
            }
          }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            scores: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  holeNumber: { type: Type.INTEGER },
                  par: { type: Type.INTEGER },
                  score: { type: Type.INTEGER }
                },
                required: ["holeNumber", "score"]
              }
            }
          },
          required: ["name", "scores"]
        }
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from Gemini");
  
  const rawPlayers = JSON.parse(text);
  
  return rawPlayers.map((p: any, idx: number) => ({
    id: `player-${idx}`,
    name: p.name || `Player ${idx + 1}`,
    scores: p.scores.map((s: any) => ({
      holeNumber: s.holeNumber,
      par: s.par || 4,
      score: s.score
    }))
  }));
};
