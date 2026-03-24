import React, { useMemo } from 'react';
import { Player, BetSettings } from '../types';
import { calculateSingleHole } from '../utils/holeCalculator';

interface Props {
  players: Player[];
  currentHoleIdx: number;
  settings: BetSettings;
  onUpdateScore: (playerId: string, holeIdx: number, newScore: number) => void;
  onUpdatePar: (holeIdx: number, newPar: number) => void;
  onUpdateName: (playerId: string, newName: string) => void;
  onUpdateHandicap: (playerId: string, handicap: number) => void;
  onNextHole: () => void;
  onPrevHole: () => void;
}

const LiveHoleEntry: React.FC<Props> = ({ 
  players = [], 
  currentHoleIdx = 0,
  settings,
  onUpdateScore, 
  onUpdatePar, 
  onUpdateName, 
  onUpdateHandicap,
  onNextHole, 
  onPrevHole 
}) => {
  if (!players || players.length === 0 || !players[0]?.scores) {
    return <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 text-slate-400 font-bold">플레이어 데이터를 불러오는 중...</div>;
  }

  const currentHoleData = players[0].scores[currentHoleIdx];
  if (!currentHoleData) {
    return <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 text-slate-400 font-bold">홀 정보를 찾을 수 없습니다.</div>;
  }

  const currentPar = currentHoleData.par || 4;
  const scores = players.map(p => p.scores?.[currentHoleIdx]?.score || 0);
  const isPar3 = currentPar === 3;
  
  // 배판(Double) 로직 계산
  const hasTripleTrigger = players.some(p => {
    const s = p.scores?.[currentHoleIdx]?.score || 0;
    if (s === 0) return false;
    return isPar3 ? s >= 5 : s >= currentPar + 3;
  });
  
  const scoreCounts: Record<number, number> = {};
  scores.filter(s => s > 0).forEach(s => scoreCounts[s] = (scoreCounts[s] || 0) + 1);
  const hasTieTrigger = Object.values(scoreCounts).some(c => c >= 3);
  const isDouble = hasTripleTrigger || hasTieTrigger;

  // 현재 홀 정산 계산
  const currentHolePayouts = useMemo(() => {
    return calculateSingleHole(players, currentHoleIdx, settings, isDouble);
  }, [players, currentHoleIdx, settings, isDouble]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden mb-6 transition-all duration-300">
      <div className="bg-emerald-600 p-6 text-white shadow-inner">
        <div className="flex items-center justify-between mb-6">
          <button type="button" onClick={onPrevHole} disabled={currentHoleIdx === 0} className="p-3 bg-emerald-700/50 hover:bg-emerald-700 rounded-2xl disabled:opacity-30 transition-all active:scale-90">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="text-center">
            <h2 className="text-2xl font-black tracking-tight">HOLE {currentHoleIdx + 1}</h2>
            <div className="text-[10px] font-black opacity-60 uppercase tracking-[0.2em] mt-0.5">Live Dashboard</div>
          </div>
          <button type="button" onClick={onNextHole} disabled={currentHoleIdx === 17} className="p-3 bg-emerald-700/50 hover:bg-emerald-700 rounded-2xl disabled:opacity-30 transition-all active:scale-90">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="flex justify-center gap-2">
          {[3, 4, 5].map(p => (
            <button
              key={p}
              type="button"
              onClick={() => onUpdatePar(currentHoleIdx, p)}
              className={`px-6 py-2.5 rounded-2xl text-xs font-black transition-all shadow-sm ${currentPar === p ? 'bg-white text-emerald-700 scale-105' : 'bg-emerald-700/50 text-emerald-100 hover:bg-emerald-700'}`}
            >
              PAR {p}
            </button>
          ))}
        </div>
      </div>

      <div className={`py-2.5 text-center text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${isDouble ? 'bg-amber-400 text-white shadow-[0_-4px_10px_rgba(251,191,36,0.3)]' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'}`}>
        {isDouble ? '⚠️ DOUBLE STAKE ACTIVE' : 'SINGLE STAKE HOLE'}
      </div>

      <div className="p-4 space-y-3">
        {players.map((player) => {
          const holeScore = player.scores?.[currentHoleIdx]?.score || 0;
          // 파 대비 차이 계산 - 0이면 파로 간주
          const scoreDiff = holeScore > 0 ? holeScore - currentPar : 0;
          
          // 색상 결정
          let scoreColor = 'text-yellow-500'; // 기본 0 (파)
          if (scoreDiff < 0) scoreColor = 'text-red-500'; // 언더파 (빨강)
          else if (scoreDiff > 0) scoreColor = 'text-blue-500'; // 오버파 (파랑)

          return (
            <div key={player.id} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/40 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 group hover:border-emerald-200 transition-all duration-300">
              <div className="flex flex-col">
                <input
                  type="text"
                  value={player.name}
                  onChange={(e) => onUpdateName(player.id, e.target.value)}
                  onFocus={(e) => e.target.select()}
                  className="bg-transparent font-black text-slate-800 dark:text-slate-100 text-sm outline-none w-24 border-none focus:ring-0"
                />
                <div className="flex items-center gap-1.5 px-0.5">
                  <span className="text-[9px] text-slate-400 font-black uppercase">HDCP</span>
                  <input
                    type="number"
                    value={player.handicap}
                    onChange={(e) => onUpdateHandicap(player.id, parseInt(e.target.value) || 0)}
                    className="w-10 text-[10px] bg-white dark:bg-slate-700 rounded-lg text-center font-black outline-none border-none shadow-sm"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  type="button"
                  onClick={() => {
                    const currentScore = holeScore || currentPar; // 비어있으면 파로 시작
                    const newScore = Math.max(currentPar - 3, currentScore - 1);
                    onUpdateScore(player.id, currentHoleIdx, newScore);
                  }}
                  disabled={holeScore > 0 && holeScore <= currentPar - 3}
                  className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:border-emerald-200 transition-all shadow-sm active:scale-75 disabled:opacity-30"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
                
                <div className="w-16 text-center">
                  <div className={`text-3xl font-black tracking-tighter transition-all ${scoreColor}`}>
                    {scoreDiff === null ? '0' : (scoreDiff > 0 ? `+${scoreDiff}` : scoreDiff === 0 ? '0' : scoreDiff)}
                  </div>
                </div>

                <button 
                  type="button"
                  onClick={() => {
                    const currentScore = holeScore || currentPar; // 비어있으면 파로 시작
                    const newScore = Math.min(currentPar + 6, currentScore + 1);
                    onUpdateScore(player.id, currentHoleIdx, newScore);
                  }}
                  disabled={holeScore >= currentPar + 6}
                  className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:border-emerald-200 transition-all shadow-sm active:scale-75 disabled:opacity-30"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 현재 홀 정산 */}
      {currentHolePayouts.length > 0 && (
        <div className="mx-4 mb-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-800 dark:to-slate-800 p-5 rounded-3xl border-2 border-emerald-200 dark:border-emerald-900/30">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <h3 className="text-sm font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              이번 홀 정산
            </h3>
          </div>
          <div className="space-y-2">
            {currentHolePayouts.map((payout, idx) => (
              <div key={idx} className="flex items-center justify-between bg-white/80 dark:bg-slate-900/50 px-4 py-2.5 rounded-2xl border border-emerald-100 dark:border-slate-700">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">{payout.from}</span>
                  <span className="text-slate-400">→</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{payout.to}</span>
                </div>
                <div className="flex items-center gap-2">
                  {payout.reason && (
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">{payout.reason}</span>
                  )}
                  <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                    {payout.amount.toLocaleString()}원
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="p-5 bg-slate-50 dark:bg-slate-800/80 flex justify-between items-center border-t border-slate-100 dark:border-slate-800">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress</span>
          <span className="text-xs font-black text-slate-600 dark:text-slate-300">{currentHoleIdx + 1} / 18 HOLES</span>
        </div>
        <button 
          type="button"
          onClick={onNextHole}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-2xl text-xs font-black shadow-lg shadow-emerald-200 dark:shadow-none transition-all active:scale-95"
        >
          {currentHoleIdx === 17 ? 'FINISH ROUND' : 'NEXT HOLE'}
        </button>
      </div>
    </div>
  );
};

export default LiveHoleEntry;
