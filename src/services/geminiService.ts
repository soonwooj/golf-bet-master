import { Player } from "../types";

const getGeminiAI = async () => {
  try {
    const module = await import('@google/genai');
    const GoogleGenAI = (module as any).GoogleGenAI;
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';

    if (!apiKey) {
      throw new Error('VITE_GEMINI_API_KEY를 설정해주세요.');
    }

    return new GoogleGenAI({ apiKey });
  } catch (error) {
    console.warn('Gemini AI 초기화 실패:', error);
    throw new Error('Gemini 서비스가 현재 환경에서 지원되지 않습니다.');
  }
};

export const parseScorecardImage = async (base64Image: string, holesRange?: { start: number; end: number }): Promise<Player[]> => {
  if (typeof window === 'undefined') {
    throw new Error('서버 환경에서만 이미지 분석이 지원됩니다.');
  }

  const model = 'gemini-2.5-flash-preview-05-20';
  const ai = await getGeminiAI();
  
  const rangeText = holesRange 
    ? `This image contains holes ${holesRange.start}-${holesRange.end}. Extract scores for these holes only.`
    : 'Extract all 18 holes if available, or as many as visible.';

  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        parts: [
          {
            text: `You are an expert at reading Korean golf scorecards.
            
Carefully examine this golf scorecard image and extract ALL player scores.

Rules:
- Look for player names (한국어 이름 포함) in rows or columns
- Each hole has a par value (3, 4, or 5) and each player has a stroke count
- Stroke counts are typically between 1-10 per hole
- PAR values are fixed per hole (look for "파" or "PAR" row)
- Double-check each number carefully — misreading a digit is the most common error
- If a name is unclear, use "플레이어 1", "플레이어 2", etc.
${rangeText}

Return ONLY a valid JSON array with NO extra text, NO markdown, NO code blocks.
Format:
[
  {
    "name": "홍길동",
    "scores": [
      {"holeNumber": 1, "par": 4, "score": 5},
      {"holeNumber": 2, "par": 3, "score": 3}
    ]
  }
]`
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
      thinkingConfig: { thinkingBudget: 8000 }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from Gemini");
  
  const clean = text.replace(/```json|```/g, '').trim();
  const rawPlayers = JSON.parse(clean);
  
  return rawPlayers.map((p: any, idx: number) => ({
    id: `player-${idx}`,
    name: p.name || `플레이어 ${idx + 1}`,
    scores: p.scores.map((s: any) => ({
      holeNumber: s.holeNumber,
      par: s.par || 4,
      score: s.score
    }))
  }));
};

export const parseTwoScorecardImages = async (base64Front: string, base64Back: string): Promise<Player[]> => {
  const frontPlayers = await parseScorecardImage(base64Front, { start: 1, end: 9 });
  const backPlayers = await parseScorecardImage(base64Back, { start: 10, end: 18 });
  
  const mergedPlayers: Player[] = [];
  
  frontPlayers.forEach(frontPlayer => {
    const backPlayer = backPlayers.find(bp => bp.name === frontPlayer.name);
    
    if (backPlayer) {
      mergedPlayers.push({
        ...frontPlayer,
        scores: [...frontPlayer.scores, ...backPlayer.scores].sort((a, b) => a.holeNumber - b.holeNumber)
      });
    } else {
      const defaultPars = [4, 4, 3, 5, 4, 4, 3, 4, 5];
      mergedPlayers.push({
        ...frontPlayer,
        scores: [
          ...frontPlayer.scores,
          ...defaultPars.map((par, idx) => ({
            holeNumber: 10 + idx,
            par,
            score: par
          }))
        ]
      });
    }
  });
  
  backPlayers.forEach(backPlayer => {
    if (!mergedPlayers.find(mp => mp.name === backPlayer.name)) {
      const defaultPars = [4, 4, 3, 5, 4, 4, 3, 4, 5];
      mergedPlayers.push({
        ...backPlayer,
        scores: [
          ...defaultPars.map((par, idx) => ({
            holeNumber: 1 + idx,
            par,
            score: par
          })),
          ...backPlayer.scores
        ]
      });
    }
  });
  
  return mergedPlayers;
};
