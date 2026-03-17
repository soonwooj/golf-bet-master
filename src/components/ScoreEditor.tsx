
import React from 'react';
import { Player } from '../types';

interface Props {
  players: Player[];
  onUpdateScore: (playerId: string, holeIdx: number, newScore: number) => void;
  onUpdateName: (playerId: string, newName: string) => void;
  onUpdateHandicap: (playerId: string, handicap: number) => void;
}

const ScoreEditor: React.FC<Props> = ({ players, onUpdateScore, onUpdateName, onUpdateHandicap }) => {
  if (players.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 mb-6 overflow-hidden">
      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
        <span className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
        </span>
        플레이어 스코어 보드
      </h2>
      
      <div className="overflow-x-auto pb-4">
        <table className="w-full text-left border-collapse mb-6">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800">
              <th className="py-3 px-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider sticky left-0 bg-white dark:bg-slate-900 z-10 transition-colors">이름 / 핸디</th>
              {players[0].scores.map((s, idx) => (
                <th key={idx} className="py-3 px-2 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider min-w-[56px]">
                  <div className="text-slate-600 dark:text-slate-300 font-bold">H{s.holeNumber}</div>
                  <div className="text-[10px] text-slate-300 dark:text-slate-600">PAR {s.par}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {players.map((player) => (
              <tr key={player.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <td className="py-3 px-2 sticky left-0 bg-white dark:bg-slate-900 shadow-[2px_0_5px_rgba(0,0,0,0.02)] dark:shadow-[2px_0_5px_rgba(0,0,0,0.2)] z-10 transition-colors">
                  <div className="flex flex-col">
                    <input
                      type="text"
                      value={player.name}
                      onChange={(e) => onUpdateName(player.id, e.target.value)}
                      className="w-24 font-bold text-slate-700 dark:text-slate-300 bg-transparent border-none focus:ring-1 focus:ring-blue-400 rounded px-1 outline-none text-sm transition-colors"
                    />
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">핸디:</span>
                      <input
                        type="number"
                        value={player.handicap}
                        onChange={(e) => onUpdateHandicap(player.id, parseInt(e.target.value) || 0)}
                        className="w-8 text-[10px] text-center bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded focus:bg-white dark:focus:bg-slate-700 border-none outline-none font-bold transition-colors"
                      />
                    </div>
                  </div>
                </td>
                {player.scores.map((s, hIdx) => {
                  const isBirdie = s.score < s.par;
                  const isEagle = s.score <= s.par - 2;
                  
                  const isBaePanTrigger = (s.par === 3 ? s.score >= 5 : s.score >= s.par + 3);
                  
                  return (
                    <td key={hIdx} className="py-3 px-1 text-center">
                      <div className="relative inline-block">
                        <input
                          type="number"
                          value={s.score}
                          onChange={(e) => onUpdateScore(player.id, hIdx, parseInt(e.target.value) || 0)}
                          className={`w-10 h-10 text-center text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border-2 rounded-xl focus:bg-white dark:focus:bg-slate-700 focus:border-blue-400 outline-none transition-all font-black ${
                            isBirdie ? 'border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-400' : 
                            isBaePanTrigger ? 'border-amber-100 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-900/10 text-amber-700 dark:text-amber-500' : 
                            'border-transparent'
                          }`}
                        />
                        {isBirdie && (
                          <span className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center ${isEagle ? 'bg-amber-400' : 'bg-red-400'} border-2 border-white dark:border-slate-900 text-[8px] text-white font-bold`}>
                            {isEagle ? 'E' : 'B'}
                          </span>
                        )}
                        {isBaePanTrigger && (
                          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[8px] font-black text-amber-500 uppercase tracking-tighter">
                            X2
                          </span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/30">
        <div className="flex items-start gap-3">
          <div className="p-1.5 bg-white dark:bg-slate-800 text-blue-500 rounded-lg shadow-sm transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-bold text-blue-700 dark:text-blue-400">배판(X2) 및 보너스 자동 알림</h4>
            <p className="text-xs text-blue-500/80 dark:text-blue-300/60 mt-1 leading-relaxed">
              <span className="font-black">X2:</span> 파3 더블보기 / 파4,5 트리플보기 이상 시 자동 배판 <br/>
              <span className="font-black text-red-500 dark:text-red-400">B/E:</span> 버디/이글 달성 시 나머지 모든 플레이어로부터 보너스 수령
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoreEditor;
