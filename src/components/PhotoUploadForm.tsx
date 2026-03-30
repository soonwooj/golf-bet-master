import React, { useState } from 'react';

type PhotoMode = 'single' | 'double' | null;

interface Props {
  isProcessing: boolean;
  error: string | null;
  onUploadSingle: (file: File) => void;
  onUploadDouble: (frontFile: File, backFile: File) => void;
}

const PhotoUploadForm: React.FC<Props> = ({ isProcessing, error, onUploadSingle, onUploadDouble }) => {
  const [photoMode, setPhotoMode] = useState<PhotoMode>(null);
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);

  const handleSinglePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadSingle(file);
    }
  };

  const handleFrontPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFrontFile(file);
    }
  };

  const handleBackPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBackFile(file);
    }
  };

  const handleUploadBoth = () => {
    if (frontFile && backFile) {
      onUploadDouble(frontFile, backFile);
    }
  };

  if (photoMode === null) {
    return (
      <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-2">스코어카드 분석 방식을 선택하세요</h3>
          <p className="text-slate-400 dark:text-slate-500 text-sm">라운딩 후 스코어보드 사진을 촬영하면 AI가 자동으로 정산합니다.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 1사진 옵션 */}
          <button
            onClick={() => setPhotoMode('single')}
            className="p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-slate-800/50 transition-all group cursor-pointer"
          >
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📷</div>
            <h4 className="text-lg font-black text-slate-700 dark:text-slate-200 mb-2">1장 사진</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 text-left">
              ✓ 18홀 전체가 보이는 사진 1장<br/>
              ✓ 한 번에 분석 완료<br/>
              ✓ 가장 빠른 정산
            </p>
          </button>

          {/* 2사진 옵션 */}
          <button
            onClick={() => setPhotoMode('double')}
            className="p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-slate-800/50 transition-all group cursor-pointer"
          >
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📸📸</div>
            <h4 className="text-lg font-black text-slate-700 dark:text-slate-200 mb-2">2장 사진</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 text-left">
              ✓ 전반 9홀 + 후반 9홀<br/>
              ✓ 각각 분석 후 병합<br/>
              ✓ 더 정확한 인식
            </p>
          </button>
        </div>

        {error && <div className="mt-4 text-rose-500 text-sm font-bold text-center">{error}</div>}
      </div>
    );
  }

  if (photoMode === 'single') {
    return (
      <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center">
        <button
          onClick={() => setPhotoMode(null)}
          className="self-start mb-4 px-3 py-1 rounded-lg text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1"
        >
          ← 돌아가기
        </button>

        <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 group cursor-pointer relative overflow-hidden">
          <div className="absolute inset-0 bg-emerald-500 opacity-0 group-hover:opacity-10 transition-opacity"></div>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-400 group-hover:text-emerald-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <input type="file" accept="image/*" onChange={handleSinglePhotoChange} className="absolute inset-0 opacity-0 cursor-pointer" disabled={isProcessing} />
        </div>

        <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-2">18홀 전체 사진을 업로드하세요</h3>
        <p className="text-slate-400 dark:text-slate-500 text-sm max-w-xs mx-auto italic">스코어보드 전체가 보이는 선명한 사진이 필요합니다.</p>
        
        {isProcessing && <div className="mt-6 flex items-center gap-2 text-emerald-600 font-bold animate-pulse">AI가 데이터를 추출하고 있습니다...</div>}
        {error && <div className="mt-4 text-rose-500 text-sm font-bold">{error}</div>}
      </div>
    );
  }

  if (photoMode === 'double') {
    return (
      <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
        <button
          onClick={() => {
            setPhotoMode(null);
            setFrontFile(null);
            setBackFile(null);
          }}
          className="mb-6 px-3 py-1 rounded-lg text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1"
        >
          ← 돌아가기
        </button>

        <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-6 text-center">전반 9홀과 후반 9홀 사진을 업로드하세요</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* 전반 9홀 */}
          <div className="flex flex-col items-center text-center p-6 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-emerald-500 transition-colors group cursor-pointer relative">
            <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-400 group-hover:text-emerald-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <p className="font-bold text-slate-700 dark:text-slate-200 mb-1">전반 9홀</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">1번 ~ 9번 홀</p>
              {frontFile && <p className="mt-2 text-emerald-600 font-bold text-sm">✓ {frontFile.name}</p>}
              <input type="file" accept="image/*" onChange={handleFrontPhotoChange} className="hidden" disabled={isProcessing} />
            </label>
          </div>

          {/* 후반 9홀 */}
          <div className="flex flex-col items-center text-center p-6 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-emerald-500 transition-colors group cursor-pointer relative">
            <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-400 group-hover:text-emerald-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <p className="font-bold text-slate-700 dark:text-slate-200 mb-1">후반 9홀</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">10번 ~ 18번 홀</p>
              {backFile && <p className="mt-2 text-emerald-600 font-bold text-sm">✓ {backFile.name}</p>}
              <input type="file" accept="image/*" onChange={handleBackPhotoChange} className="hidden" disabled={isProcessing} />
            </label>
          </div>
        </div>

        <button
          onClick={handleUploadBoth}
          disabled={!frontFile || !backFile || isProcessing}
          className={`w-full py-3 rounded-2xl font-bold transition-all ${
            frontFile && backFile && !isProcessing
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg'
              : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
          }`}
        >
          {isProcessing ? 'AI가 분석 중입니다...' : '분석 시작'}
        </button>

        {isProcessing && <div className="mt-4 text-center text-emerald-600 font-bold animate-pulse">AI가 데이터를 추출하고 있습니다...</div>}
        {error && <div className="mt-4 text-center text-rose-500 text-sm font-bold">{error}</div>}
      </div>
    );
  }

  return null;
};

export default PhotoUploadForm;
