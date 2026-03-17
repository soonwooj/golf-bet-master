import { Player, BetSettings, PayoutSummary, PlayerTotal } from "../types";

export const calculateGolfBets = (
  players: Player[],
  settings: BetSettings
): { payouts: PayoutSummary[]; totals: PlayerTotal[] } => {
  if (players.length < 2) return { payouts: [], totals: [] };

  const maxPossibleHoles = players[0].scores.length;
  const netBalances: Record<string, number> = {};
  players.forEach(p => (netBalances[p.name] = 0));

  let carryOverNextHoleDouble = false;

  for (let h = 0; h < maxPossibleHoles; h++) {
    const playersWithScore = players.filter(p => p.scores[h] && p.scores[h].score > 0);
    if (playersWithScore.length !== players.length) continue;

    const holeData = players.map(p => {
      const hole = p.scores[h];
      const handicapDeduction = Math.floor(p.handicap / 18) + (h < (p.handicap % 18) ? 1 : 0);
      
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

    let multiplier = carryOverNextHoleDouble ? 2 : 1;
    carryOverNextHoleDouble = false;

    let currentHoleTriggersDouble = false;

    if (settings.doubleOnTripleBogey) {
      const hasBogeyTrigger = holeData.some(d => {
        if (d.par === 3) return d.rawScore >= 5;
        return d.rawScore >= d.par + 3;
      });
      if (hasBogeyTrigger) currentHoleTriggersDouble = true;
    }

    if (settings.doubleOnTieCount > 0 && !currentHoleTriggersDouble) {
      const scoreCounts: Record<number, number> = {};
      holeData.forEach(d => {
        scoreCounts[d.appliedScore] = (scoreCounts[d.appliedScore] || 0) + 1;
      });
      if (Object.values(scoreCounts).some(count => count >= settings.doubleOnTieCount)) {
        currentHoleTriggersDouble = true;
      }
    }

    if (currentHoleTriggersDouble) {
      multiplier = 2;
    }

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
            netBalances[p1.name] -= amount;
            netBalances[p2.name] += amount;
          } else {
            // p2가 더 많이 쳤으므로 p2가 p1에게 지불
            netBalances[p1.name] += amount;
            netBalances[p2.name] -= amount;
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
              netBalances[other.name] -= bonus;
              netBalances[d.name] += bonus;
            }
          });
        }
      }
    });

    // 전원 동타 시 다음 홀 배판
    if (settings.doubleNextOnAllTie) {
      const firstScore = holeData[0].appliedScore;
      const allTied = holeData.every(d => d.appliedScore === firstScore);
      if (allTied) {
        carryOverNextHoleDouble = true;
      }
    }
  }

  const totals: PlayerTotal[] = Object.entries(netBalances).map(([name, netAmount]) => ({
    name,
    netAmount
  }));

  const payouts: PayoutSummary[] = [];
  const debtors = totals.filter(t => t.netAmount < 0).sort((a, b) => a.netAmount - b.netAmount);
  const creditors = totals.filter(t => t.netAmount > 0).sort((a, b) => b.netAmount - a.netAmount);

  let dIdx = 0;
  let cIdx = 0;
  const dTemp = debtors.map(d => ({ ...d, netAmount: Math.abs(d.netAmount) }));
  const cTemp = creditors.map(c => ({ ...c }));

  while (dIdx < dTemp.length && cIdx < cTemp.length) {
    const debt = dTemp[dIdx];
    const credit = cTemp[cIdx];
    const amount = Math.min(debt.netAmount, credit.netAmount);
    if (amount > 0) {
      payouts.push({ from: debt.name, to: credit.name, amount: Math.round(amount) });
    }
    debt.netAmount -= amount;
    credit.netAmount -= amount;
    if (debt.netAmount <= 0) dIdx++;
    if (credit.netAmount <= 0) cIdx++;
  }

  return { payouts, totals };
};
