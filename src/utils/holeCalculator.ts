import { Player, BetSettings, PayoutSummary } from "../types";

// 단일 홀의 정산 계산
export const calculateSingleHole = (
  players: Player[],
  holeIdx: number,
  settings: BetSettings,
  isDoubleStake: boolean = false
): PayoutSummary[] => {
  const payouts: PayoutSummary[] = [];
  
  // 모든 플레이어가 점수를 입력했는지 확인
  const playersWithScore = players.filter(p => p.scores[holeIdx] && p.scores[holeIdx].score > 0);
  if (playersWithScore.length !== players.length) return [];

  const holeData = players.map(p => {
    const hole = p.scores[holeIdx];
    const handicapDeduction = Math.floor(p.handicap / 18) + (holeIdx < (p.handicap % 18) ? 1 : 0);
    
    return {
      id: p.id,
      name: p.name,
      rawScore: hole.score,
      appliedScore: hole.score - handicapDeduction,
      par: hole.par,
      isBirdie: hole.score < hole.par,
      isEagle: hole.score <= hole.par - 2
    };
  });

  const multiplier = isDoubleStake ? 2 : 1;
  const holeStake = settings.perStrokeAmount * multiplier;
  
  // 각 플레이어 쌍별로 타수 차이만큼 정산
  for (let i = 0; i < holeData.length; i++) {
    for (let j = i + 1; j < holeData.length; j++) {
      const p1 = holeData[i];
      const p2 = holeData[j];
      const diff = p1.appliedScore - p2.appliedScore;
      
      if (diff !== 0) {
        const amount = Math.abs(diff) * holeStake;
        
        if (diff > 0) {
          // p1이 더 많이 쳤으므로 p1이 p2에게 지불
          payouts.push({
            from: p1.name,
            to: p2.name,
            amount,
            reason: `${Math.abs(diff)}타 차이${multiplier > 1 ? ' (배판)' : ''}`
          });
        } else {
          // p2가 더 많이 쳤으므로 p2가 p1에게 지불
          payouts.push({
            from: p2.name,
            to: p1.name,
            amount,
            reason: `${Math.abs(diff)}타 차이${multiplier > 1 ? ' (배판)' : ''}`
          });
        }
      }
    }
  }

  // 버디/이글 보너스
  holeData.forEach(d => {
    if (d.isBirdie) {
      const bonus = d.isEagle ? settings.birdieAmount * 2 : settings.birdieAmount;
      if (bonus > 0) {
        holeData.forEach(other => {
          if (other.id !== d.id) {
            payouts.push({
              from: other.name,
              to: d.name,
              amount: bonus,
              reason: d.isEagle ? '이글 보너스' : '버디 보너스'
            });
          }
        });
      }
    }
  });

  return payouts;
};
