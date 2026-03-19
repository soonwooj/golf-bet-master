
import React, { useState, useEffect, useMemo } from 'react';
import { Player, BetSettings, PayoutSummary, PlayerTotal } from './types';
import { parseScorecardImage } from './services/geminiService';
import { calculateGolfBets } from './utils/calculator';
import BetSettingsForm from './components/BetSettingsForm';
import ScoreEditor from './components/ScoreEditor';
import PayoutDisplay from './components/PayoutDisplay';
import LiveHoleEntry from './components/LiveHoleEntry';

type AppMode = 'PHOTO' | 'LIVE';

const App: React.FC = () => {
  console.log('App render start');
  const [mode, setMode] = useState<AppMode>('PHOTO');
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentHoleIdx, setCurrentHoleIdx] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  
  const [settings, setSettings] = useState<BetSettings>({
    perStrokeAmount: 1000,
    birdieAmount: 5000,
    doubleOnTripleBogey: true,
    doubleOnTieCount: 3,
    doubleNextOnAllTie: true
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const initLiveRound = () => {
    const defaultPars = [4, 4, 3, 5, 4, 4, 3, 4, 5, 4, 4, 3, 5, 4, 4, 3, 4, 5];
    const initialPlayers: Player[] = ['동반자 1', '동반자 2', '동반자 3', '동반자 4'].map((name, i) => ({
      id: `live-${i}`,
      name,
      handicap: 0,
      scores: defaultPars.map((par, hIdx) => ({
        holeNumber: hIdx + 1,
        par,
        score: par // 초기값을 파로 설정
      }))
    }));
    setPlayers(initialPlayers);
    setCurrentHoleIdx(0);
    setMode('LIVE');
  };

  const results = useMemo(() => {
    if (players.length < 2) return { payouts: [], totals: [] };
    // 필터링 없이 원본을 넘기되, calculator에서 안전하게 처리하도록 함
    return calculateGolfBets(players, settings);
  }, [players, settings]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessing(true);
    setError(null);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        try {
          const parsedPlayers = await parseScorecardImage(base64);
          setPlayers(parsedPlayers.map(p => ({ ...p, handicap: 0 })));
          setMode('PHOTO');
        } catch (err: any) {
          setError("분석 실패. 선명한 사진을 업로드해 주세요.");
        } finally {
          setIsProcessing(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError("파일 오류 발생");
      setIsProcessing(false);
    }
  };

  const updatePlayerScore = (playerId: string, holeIdx: number, newScore: number) => {
    setPlayers(prev => prev.map(p => {
      if (p.id === playerId) {
        const newScores = [...p.scores];
        newScores[holeIdx] = { ...newScores[holeIdx], score: newScore };
        return { ...p, scores: newScores };
      }
      return p;
    }));
  };

  const updateHolePar = (holeIdx: number, newPar: number) => {
    setPlayers(prev => prev.map(p => {
      const newScores = [...p.scores];
      newScores[holeIdx] = { ...newScores[holeIdx], par: newPar };
      return { ...p, scores: newScores };
    }));
  };

  const updatePlayerName = (playerId: string, newName: string) => {
    setPlayers(prev => prev.map(p => p.id === playerId ? { ...p, name: newName } : p));
  };

  const updatePlayerHandicap = (playerId: string, handicap: number) => {
    setPlayers(prev => prev.map(p => p.id === playerId ? { ...p, handicap } : p));
  };

  return (
    <div className="min-h-screen pb-24 px-4 md:px-8 max-w-7xl mx-auto transition-colors duration-300 dark:bg-slate-950">
      {/* 상단 배너 광고 */}
      <div className="bg-emerald-500 dark:bg-emerald-600 rounded-2xl text-center py-6 mb-4 shadow-lg">
        <a href="https://www.dealpang.com/?linkD=96LAY5B7a" target="_blank" rel="noreferrer" className="font-black text-white hover:text-emerald-100 text-2xl md:text-3xl">
          ⛳ 오늘 라운드 끝! 다음 라운드를 위한 용품 구경하러 가기 →
        </a>
      </div>

      <header className="py-10 text-center relative">
        <button 
          onClick={() => setIsDark(!isDark)}
          className="absolute right-0 top-10 p-3 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 text-slate-500 dark:text-amber-400 hover:scale-110 transition-all"
        >
          {isDark ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>

        <div className="inline-block p-4 bg-emerald-600 rounded-3xl shadow-xl shadow-emerald-200 dark:shadow-emerald-900/20 mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight mb-2">골프 타당 계산기</h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Golf Bet Pro</p>
      </header>

      <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 mb-8 max-w-sm mx-auto">
        <button 
          onClick={() => setMode('PHOTO')}
          className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${mode === 'PHOTO' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
        >
          사진 분석 모드
        </button>
        <button 
          onClick={initLiveRound}
          className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${mode === 'LIVE' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
        >
          실시간 기록 모드
        </button>
      </div>

      <main className="space-y-6">
        {mode === 'PHOTO' && players.length === 0 && (
          <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 group cursor-pointer relative overflow-hidden">
              <div className="absolute inset-0 bg-emerald-500 opacity-0 group-hover:opacity-10 transition-opacity"></div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-400 group-hover:text-emerald-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <input type="file" accept="image/*" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
            <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-2">스코어카드 사진 분석</h3>
            <p className="text-slate-400 dark:text-slate-500 text-sm max-w-xs mx-auto italic">라운딩이 끝난 후 스코어보드를 촬영하면 AI가 자동으로 정산합니다.</p>
            {isProcessing && <div className="mt-6 flex items-center gap-2 text-emerald-600 font-bold animate-pulse">AI가 데이터를 추출하고 있습니다...</div>}
            {error && <div className="mt-4 text-rose-500 text-sm font-bold">{error}</div>}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <aside className="hidden lg:flex lg:col-span-1 items-start justify-center">
            <a href="https://example.com/left-sidebar" target="_blank" rel="noreferrer" className="w-20 h-96 bg-stone-100 dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 p-3 text-xs font-bold text-center text-stone-600 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-700">
              사이드 광고
              <br />Left
            </a>
          </aside>

          <div className="lg:col-span-10 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-4 space-y-6">
                <BetSettingsForm settings={settings} setSettings={setSettings} />
                {results.totals.length > 0 && (
                  <div className="bg-slate-900 dark:bg-slate-900 text-white p-6 rounded-3xl shadow-xl border-t-4 border-emerald-500">
                    <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-4 flex items-center justify-between">
                      현재 홀까지의 정산 합계
                      <span className="animate-pulse w-2 h-2 bg-emerald-500 rounded-full"></span>
                    </h3>
                    <div className="space-y-4">
                      {results.totals.sort((a,b) => b.netAmount - a.netAmount).map((t, i) => (
                        <div key={i} className="flex justify-between items-center group">
                          <span className="font-bold text-sm text-slate-300 group-hover:text-white transition-colors">{t.name}</span>
                          <span className={`font-black tracking-tight ${t.netAmount >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {t.netAmount > 0 ? '+' : ''}{t.netAmount.toLocaleString()}원
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="lg:col-span-8">
                {mode === 'LIVE' ? (
                  <LiveHoleEntry 
                    players={players}
                    currentHoleIdx={currentHoleIdx}
                    settings={settings}
                    onUpdateScore={updatePlayerScore}
                    onUpdatePar={updateHolePar}
                    onUpdateName={updatePlayerName}
                    onUpdateHandicap={updatePlayerHandicap}
                    onNextHole={() => setCurrentHoleIdx(h => Math.min(17, h + 1))}
                    onPrevHole={() => setCurrentHoleIdx(h => Math.max(0, h - 1))}
                  />
                ) : (
                  players.length > 0 && (
                    <>
                      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 mb-6">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">스코어카드 분석 완료</h3>
                          <label className="cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            사진 업로드
                            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                          </label>
                        </div>
                      </div>
                      <ScoreEditor 
                        players={players} 
                        onUpdateScore={updatePlayerScore} 
                        onUpdateName={updatePlayerName}
                        onUpdateHandicap={updatePlayerHandicap}
                      />
                    </>
                  )
                )}

                {players.length > 0 && <PayoutDisplay payouts={results.payouts} totals={results.totals} />}
              </div>
            </div>

            {/* 인피드 광고 */}
            <div className="bg-gradient-to-r from-slate-900/80 to-slate-800/80 p-4 rounded-2xl text-white text-center font-black shadow-xl">
              <a href="https://naver.me/FjmE7dNF" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 w-full py-6 rounded-lg bg-emerald-500 hover:bg-emerald-400 transition-colors duration-200 font-extrabold text-2xl md:text-3xl">
                🏌️ 스코어만큼 장비도 업그레이드! 골프 거리측정기 보기 →
              </a>
              <p className="mt-2 text-xs text-slate-200 dark:text-slate-400">이 링크는 네이버 쇼핑커넥트 활동의 일환으로 수수료를 지급받을 수 있습니다</p>
            </div>
          </div>

          <aside className="hidden lg:flex lg:col-span-1 items-start justify-center">
            <a href="https://example.com/right-sidebar" target="_blank" rel="noreferrer" className="w-20 h-96 bg-stone-100 dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 p-3 text-xs font-bold text-center text-stone-600 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-700">
              사이드 광고
              <br />Right
            </a>
          </aside>
        </div>
      </main>

      {/* 하단 스티키 광고 배너 */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 border-t border-emerald-600 p-3 md:p-4 backdrop-blur-sm shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3">
          <span className="text-sm md:text-base font-black text-white">⛳ 골프용품 최저가 쇼핑</span>
          <a href="https://www.dealpang.com/?linkD=96LAY5B7a" target="_blank" rel="noreferrer" className="text-xs md:text-sm font-black bg-emerald-500 text-white px-3 py-2 rounded-lg hover:bg-emerald-400 transition-colors duration-200">
            지금 바로 확인하기
          </a>
        </div>
      </div>
    </div>
  );
};

export default App;
