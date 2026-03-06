import { X, Maximize2, Minimize2, Loader2, AlertCircle, ExternalLink, RefreshCw } from 'lucide-react';
import { Game } from '../types';
import { motion } from 'motion/react';
import { useState, useEffect, useCallback } from 'react';

interface GamePlayerProps {
  game: Game;
  onClose: () => void;
}

export default function GamePlayer({ game, onClose }: GamePlayerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Use iframe_url or url directly
  const gameUrl = game.iframe_url || game.url || '';
  
  console.log('[GAME] Loading game directly:', gameUrl);

  // 🔒 LOCK BODY SCROLL when popup is open
  useEffect(() => {
    // Save original overflow
    const originalOverflow = document.body.style.overflow;
    const originalHeight = document.body.style.height;
    
    // Lock scroll
    document.body.style.overflow = 'hidden';
    document.body.style.height = '100vh';
    document.documentElement.style.overflow = 'hidden';
    
    // Cleanup - restore scroll on unmount
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.height = originalHeight;
      document.documentElement.style.overflow = '';
    };
  }, []);

  const toggleFullscreen = useCallback(() => {
    const iframe = document.getElementById('game-iframe') as HTMLIFrameElement;
    if (!iframe) return;

    if (!isFullscreen) {
      if (iframe.requestFullscreen) {
        iframe.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleIframeLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
  }, []);

  const handleIframeError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
    console.error('[GAME] Iframe failed to load:', gameUrl);
  }, [gameUrl]);

  const handleRetry = useCallback(() => {
    setRetryCount(prev => prev + 1);
    setIsLoading(true);
    setHasError(false);
  }, []);

  const openInNewTab = useCallback(() => {
    if (gameUrl) {
      window.open(gameUrl, '_blank', 'noopener,noreferrer');
    }
  }, [gameUrl]);

  // If no URL available
  if (!gameUrl) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-black flex flex-col"
      >
        <div className="h-14 bg-zinc-900 border-b border-white/5 flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-white font-bold truncate max-w-[200px] sm:max-w-md">{game.title}</h2>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center px-4">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <p className="text-white text-lg mb-2">Game URL tidak tersedia</p>
            <p className="text-gray-400 text-sm">Game ini tidak memiliki URL yang valid</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-black flex flex-col overflow-hidden"
      style={{ touchAction: 'none' }}
    >
      {/* Header */}
      <div className="h-14 bg-zinc-900 border-b border-white/5 flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors flex-shrink-0"
          >
            <X className="w-6 h-6" />
          </button>
          <h2 className="text-white font-bold truncate max-w-[150px] sm:max-w-md">{game.title}</h2>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Open in new tab button */}
          <button 
            onClick={openInNewTab}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            title="Open in new tab"
          >
            <ExternalLink className="w-5 h-5" />
          </button>
          {/* Fullscreen button */}
          <button 
            onClick={toggleFullscreen}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Game Area */}
      <div className="flex-1 relative bg-zinc-950 overflow-hidden">
        {/* Loading State */}
        {isLoading && !hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-950 z-10">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: '#00a8ff' }} />
              <p className="text-gray-400">Loading game...</p>
              <p className="text-gray-500 text-xs mt-2">Please wait while the game loads</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-950 z-10">
            <div className="text-center px-4 max-w-md">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <p className="text-white text-lg mb-2">Failed to load game</p>
              <p className="text-gray-400 text-sm mb-4">
                The game couldn't be loaded. This might be due to browser security restrictions.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button 
                  onClick={handleRetry}
                  className="flex items-center justify-center gap-2 px-4 py-2 text-white rounded-lg transition-colors"
                  style={{ background: '#00a8ff' }}
                >
                  <RefreshCw className="w-4 h-4" />
                  Retry
                </button>
                <button 
                  onClick={openInNewTab}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open in New Tab
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Game Iframe */}
        <iframe 
          key={retryCount}
          id="game-iframe"
          src={gameUrl}
          className="w-full h-full border-none"
          allow="autoplay; fullscreen; accelerometer; encrypted-media; gyroscope; picture-in-picture; gamepad; clipboard-write"
          allowFullScreen
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-pointer-lock allow-presentation"
          title={game.title}
          style={{ border: 'none', background: '#09090b' }}
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          loading="eager"
        />
      </div>

      {/* Mobile Hint */}
      <div className="sm:hidden h-10 bg-zinc-900 flex items-center justify-center text-[10px] text-gray-500 uppercase tracking-widest flex-shrink-0">
        Gunakan mode landscape untuk pengalaman terbaik
      </div>
    </motion.div>
  );
}
