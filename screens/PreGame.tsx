
import React, { useState, useEffect } from 'react';
import { GameButton } from '../components/GameButton';
import { Topic, WordEntry } from '../types';
import { preCacheImages, getEffectiveOnline } from '../src/lib/offline-game-engine';
import { getCachedImageCount, getCacheSize } from '../src/lib/image-cache';

interface PreGameProps {
  topic: Topic;
  wordCount: number;
  wordDeck?: WordEntry[];
  onStart: () => void;
  onBack: () => void;
}

export const PreGame: React.FC<PreGameProps> = ({ topic, wordCount, wordDeck, onStart, onBack }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<{ current: number; total: number } | null>(null);
  const [downloadResult, setDownloadResult] = useState<{ success: number; failed: number } | null>(null);
  const [cachedCount, setCachedCount] = useState(0);
  const [cacheSize, setCacheSize] = useState('');
  const isOnline = getEffectiveOnline();

  // Refresh cache stats on mount
  useEffect(() => {
    refreshCacheStats();
  }, []);

  const refreshCacheStats = async () => {
    const count = await getCachedImageCount();
    setCachedCount(count);
    const size = await getCacheSize();
    setCacheSize(size);
  };

  const handleDownloadAll = async () => {
    if (!wordDeck || wordDeck.length === 0 || isDownloading) return;

    setIsDownloading(true);
    setDownloadProgress(null);
    setDownloadResult(null);

    const words = wordDeck.map(w => ({ word: w.word, definition: w.definition }));
    const result = await preCacheImages(words, (current, total, word) => {
      setDownloadProgress({ current, total });
    });

    setDownloadResult({ success: result.success, failed: result.failed });
    setIsDownloading(false);
    await refreshCacheStats();
  };

  const getTopicIcon = () => {
    switch(topic) {
        case 'Nature & Animals': return '🌿';
        case 'Science & Space': return '🚀';
        case 'History & Adventure': return '🏰';
        case 'Arts & Sports': return '🎨';
        case 'Daily Life': return '🏠';
        default: return '🌟';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center text-center p-6 max-w-2xl animate-in zoom-in duration-500">
      <div className="text-9xl mb-8 animate-bounce">{getTopicIcon()}</div>
      
      <h2 className="text-5xl font-black text-blue-900 mb-4">
        Ready for {topic}?
      </h2>
      
      <div className="bg-white rounded-3xl p-8 shadow-xl border-b-8 border-gray-100 mb-6 w-full">
        {wordCount > 0 ? (
          <p className="text-2xl text-blue-900/70 font-bold mb-4">
              We found <span className="text-blue-600 text-4xl">{wordCount}</span> amazing words for you to learn!
          </p>
        ) : (
          <p className="text-2xl text-blue-900/70 font-bold">
              No words found for this level yet. Try another adventure!
          </p>
        )}

        {/* Download images for offline */}
        {isOnline && wordDeck && wordDeck.length > 0 && (
          <div className="mt-6 pt-6 border-t-2 border-dashed border-gray-100">
            {downloadResult ? (
              <div className="bg-green-50 rounded-2xl p-4">
                <p className="font-black text-green-700 text-sm uppercase tracking-wider">
                  ✅ Downloaded: {downloadResult.success} image{downloadResult.success !== 1 ? 's' : ''}
                  {downloadResult.failed > 0 && ` (${downloadResult.failed} failed)`}
                </p>
                <p className="text-green-600/60 text-xs font-bold mt-1">
                  Cache: {cachedCount} images ({cacheSize})
                </p>
              </div>
            ) : isDownloading ? (
              <div className="bg-blue-50 rounded-2xl p-4">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full" />
                  <span className="font-black text-blue-700 text-sm uppercase tracking-wider">
                    Downloading images...
                  </span>
                </div>
                {downloadProgress && (
                  <div className="w-full bg-white rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-blue-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${(downloadProgress.current / downloadProgress.total) * 100}%` }}
                    />
                  </div>
                )}
                {downloadProgress && (
                  <p className="text-blue-600/60 text-xs font-bold mt-2">
                    {downloadProgress.current} / {downloadProgress.total}
                  </p>
                )}
              </div>
            ) : (
              <div>
                <p className="text-blue-900/40 font-bold text-xs uppercase tracking-wider mb-3">
                  Offline Ready — {cachedCount > 0 ? `${cachedCount} images cached (${cacheSize})` : 'No images cached'}
                </p>
                <button
                  onClick={handleDownloadAll}
                  disabled={isDownloading}
                  className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-sm uppercase tracking-widest px-6 py-3 rounded-[1.5rem] border-b-4 border-amber-700 active:border-b-0 active:translate-y-1 transition-all shadow-lg"
                >
                  📥 Download All Images for Offline
                </button>
              </div>
            )}
          </div>
        )}

        {/* Offline cache info */}
        {!isOnline && cachedCount > 0 && (
          <div className="mt-4 bg-green-50 rounded-2xl p-3">
            <p className="font-black text-green-700 text-xs uppercase tracking-wider">
              📦 Offline: {cachedCount} images available ({cacheSize})
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 w-full">
        <GameButton color="green" size="xl" onClick={onStart} className={wordCount === 0 ? 'opacity-50 pointer-events-none' : ''}>
          START GAME!
        </GameButton>
        <button 
          onClick={onBack}
          className="text-blue-900/40 font-bold hover:text-blue-900/60 transition-colors py-2"
        >
          Go Back
        </button>
      </div>
    </div>
  );
};
