import React, { useState, useEffect } from 'react';
import { PayoutSummary, PlayerTotal } from '../types';

interface Props {
  payouts: PayoutSummary[];
  totals: PlayerTotal[];
}

const PayoutDisplay: React.FC<Props> = ({ payouts, totals }) => {
  const [showShareMenu, setShowShareMenu] = useState(false);
  
  // .env.local의 VITE_KAKAO_JS_KEY를 정확히 읽어옵니다.
  const KAKAO_KEY = import.meta.env.VITE_KAKAO_JS_KEY;
  console.log('Kakao Key from env:', KAKAO_KEY);

  useEffect(() => {
    console.log('useEffect triggered, Kakao Key:', KAKAO_KEY);
    
    const initKakao = () => {
      const kakao = (window as any).Kakao;
      console.log('Kakao object available:', !!kakao);
      console.log('Kakao object:', kakao);
      
      if (kakao && KAKAO_KEY) {
        console.log('Kakao isInitialized before init:', kakao.isInitialized ? kakao.isInitialized() : 'isInitialized method not found');
        
        if (!kakao.isInitialized()) {
          try {
            console.log('Attempting to init Kakao with key:', KAKAO_KEY);
            kakao.init(KAKAO_KEY);
            console.log('Kakao SDK 초기화 성공');
            console.log('Kakao isInitialized after init:', kakao.isInitialized());
          } catch (e) {
            console.error('Kakao SDK 초기화 실패:', e);
          }
        } else {
          console.log('Kakao already initialized');
        }
      } else {
        console.error('Kakao object or key missing:', { kakao: !!kakao, key: !!KAKAO_KEY });
      }
    };
    
    // SDK 로드 대기 시간을 늘리고 더 자주 체크
    const timer = setTimeout(initKakao, 1000);
    return () => clearTimeout(timer);
  }, [KAKAO_KEY]);

  if (totals.length === 0) return null;

  const groupedPayouts = payouts.reduce((acc, p) => {
    if (!acc[p.from]) {
      acc[p.from] = [];
    }
    acc[p.from].push(p);
    return acc;
  }, {} as Record<string, PayoutSummary[]>);

  const shareText = `⛳️ [Golf Bet Pro 정산 결과]\n\n` + 
    totals.sort((a,b) => b.netAmount - a.netAmount)
      .map(t => `${t.name}: ${t.netAmount > 0 ? '💰+' : ''}${t.netAmount.toLocaleString()}원`)
      .join('\n') + 
    `\n\n💸 상세 송금 내역:\n` +
    payouts.map(p => `${p.from} ➔ ${p.to}: ${p.amount.toLocaleString()}원`).join('\n') +
    `\n\n확인하기: ${window.location.href}`;

  const shareUrl = window.location.href;

  const handleKakaoShare = () => {
    console.log('handleKakaoShare called');
    const kakao = (window as any).Kakao;
    console.log('Kakao object:', kakao);
    
    if (kakao) {
      console.log('Kakao.isInitialized method:', typeof kakao.isInitialized);
      const isInitialized = kakao.isInitialized ? kakao.isInitialized() : false;
      console.log('Kakao isInitialized result:', isInitialized);
      
      if (isInitialized) {
        console.log('Attempting Kakao share with text:', shareText);
        try {
          kakao.Share.sendDefault({
            objectType: 'text',
            text: shareText,
            link: {
              mobileWebUrl: shareUrl,
              webUrl: shareUrl,
            },
          });
          console.log('Kakao share sent successfully');
        } catch (error) {
          console.error('Kakao share failed with error:', error);
          alert('카카오 공유 중 오류가 발생했습니다. 클립보드로 복사합니다.');
          handleCopyToClipboard();
        }
      } else {
        console.error('Kakao not initialized, falling back to clipboard');
        alert('카카오 SDK가 초기화되지 않았습니다. 클립보드로 복사합니다.');
        handleCopyToClipboard();
      }
    } else {
      console.error('Kakao object not found, falling back to clipboard');
      alert('카카오 SDK를 찾을 수 없습니다. 클립보드로 복사합니다.');
      handleCopyToClipboard();
    }
    setShowShareMenu(false);
  };

  const handleFacebookShare = () => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
    window.open(fbUrl, '_blank', 'width=600,height=400');
    setShowShareMenu(false);
  };

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
    setShowShareMenu(false);
  };

  const handleCopyToClipboard = () => {
    const textToCopy = shareText;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textToCopy)
        .then(() => alert('정산 결과가 클립보드에 복사되었습니다!'))
        .catch(() => fallbackCopy(textToCopy));
    } else {
      fallbackCopy(textToCopy);
    }
    setShowShareMenu(false);
  };

  const fallbackCopy = (text: string) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      alert('정산 결과가 클립보드에 복사되었습니다!');
    } catch (err) {
      console.error('복사 실패', err);
    }
    document.body.removeChild(textarea);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-3">
            <span className="p-2.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698c-.22-.07-.412-.164-.567-.267C8.27 8.441 8 8.267 8 8s.27-.441.433-.582zM11 12.849v-1.698c.22.07.412.164.567.267.163.141.433.315.433.582s-.27.441-.433.582c-.155.103-.346.196-.567.267z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941a4.547 4.547 0 001.676-.662c.31-.074-.525-.136-.715-.22a1 1 0 10-.866 1.802c.23.11.527.212.897.306V15a1 1 0 102 0v-.092c.935-.118 1.887-.455 2.57-1.03.683-.575 1.03-1.339 1.03-2.128 0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 8.842V6.901c.935.118 1.887.455 2.57 1.03a1 1 0 101.324-1.492c-.683-.575-1.635-.912-2.57-1.03V5z" clipRule="evenodd" />
              </svg>
            </span>
            최종 정산 보고서
          </h2>
          
          <div className="relative">
            <button 
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-2xl text-sm font-black transition-all shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20 active:scale-95"
            >
              공유하기
            </button>

            {showShareMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden z-20">
                <button onClick={handleKakaoShare} className="w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-3 text-sm font-bold">
                  <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center text-xs">카톡</div>
                  카카오톡
                </button>
                <button onClick={handleFacebookShare} className="w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-3 text-sm font-bold">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">f</div>
                  페이스북
                </button>
                <button onClick={handleTwitterShare} className="w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-3 text-sm font-bold">
                  <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center text-white">X</div>
                  트위터
                </button>
                <button onClick={handleCopyToClipboard} className="w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-3 text-sm font-bold border-t">
                  <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white">📋</div>
                  결과 복사
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {totals.sort((a, b) => b.netAmount - a.netAmount).map((t, idx) => (
            <div key={idx} className={`p-5 rounded-3xl border-2 ${t.netAmount >= 0 ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100' : 'bg-rose-50/50 dark:bg-rose-900/10 border-rose-100'}`}>
              <div className="text-sm font-bold text-slate-400 mb-1">{t.name}</div>
              <div className={`text-2xl font-black ${t.netAmount >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {t.netAmount > 0 ? '+' : ''}{t.netAmount.toLocaleString()}원
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          {(Object.entries(groupedPayouts) as [string, PayoutSummary[]][]).map(([sender, items], idx) => (
            <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100">
              <p className="font-black text-slate-700 dark:text-slate-200 mb-3">{sender}님이 보낼 금액</p>
              {items.map((item, iIdx) => (
                <div key={iIdx} className="flex justify-between text-sm py-1">
                  <span>{item.to}님에게</span>
                  <span className="font-bold text-emerald-600">{item.amount.toLocaleString()}원</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PayoutDisplay;