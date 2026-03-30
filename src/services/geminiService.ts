
import { Player } from "../types";

const getGeminiAI = async () => {
  try {
    const module = await import('@google/genai');
    const GoogleGenAI = (module as any).GoogleGenAI;
    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY || '';

    if (!apiKey) {
      throw new Error('VITE_GOOGLE_API_KEY를 설정해주세요.');
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

  const model = 'gemini-3-flash-preview';
  const ai = await getGeminiAI();
  
  const rangeText = holesRange 
    ? `This image contains holes ${holesRange.start}-${holesRange.end}. Extract scores for these holes only.`
    : 'Try to find all 18 holes if available, or as many as present.';

  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        parts: [
          {
            text: `Extract the golf scorecard data from this image. 
            Return a valid JSON array of players, each with their name and scores for each hole.
            Each score object must have holeNumber (1-18), par (3, 4, or 5), and score (actual strokes).
            If names are hard to read, use "Player 1", "Player 2", etc.
            ${rangeText}
            
            Return ONLY a valid JSON array, no other text.
            Example format:
            [
              {
                "name": "Player 1",
                "scores": [
                  {"holeNumber": 1, "par": 4, "score": 5},
                  {"holeNumber": 2, "par": 4, "score": 4}
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
      responseMimeType: "application/json"
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

export const parseTwoScorecardImages = async (base64Front: string, base64Back: string): Promise<Player[]> => {
  // 앞 9홀 분석
  const frontPlayers = await parseScorecardImage(base64Front, { start: 1, end: 9 });
  
  // 뒷 9홀 분석
  const backPlayers = await parseScorecardImage(base64Back, { start: 10, end: 18 });
  
  // 같은 이름의 선수는 병합
  const mergedPlayers: Player[] = [];
  
  frontPlayers.forEach(frontPlayer => {
    const backPlayer = backPlayers.find(bp => bp.name === frontPlayer.name);
    
    if (backPlayer) {
      mergedPlayers.push({
        ...frontPlayer,
        scores: [...frontPlayer.scores, ...backPlayer.scores].sort((a, b) => a.holeNumber - b.holeNumber)
      });
    } else {
      // 뒷 9홀이 없으면 앞 9홀만 사용하되, 뒷 9홀은 파로 채움
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
  
  // 뒤 9홀에만 있는 선수
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
