import { useState, useEffect, useCallback } from 'react';
import { Game } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Play, ChevronLeft, ChevronRight, TrendingUp, Info } from 'lucide-react';

interface HeroFeaturedProps {
  games: Game[];
  onPlay: (id: number) => void;
}

// Category icons mapping
const categoryIcons: Record<string, string> = {
  'action': '⚔️',
  'puzzle': '🧩',
  'racing': '🏎️',
  'shooting': '🎯',
  'strategy': '🧠',
  'arcade': '🕹️',
  'sports': '⚽',
  'adventure': '🗺️',
  'girls': '💕',
  'multiplayer': '👥',
  'horror': '👻',
  'simulation': '🎮',
  'hypercasual': '🎲',
  'casual': '🎰',
  'board': '♟️',
  'other': '🎮',
  'default': '🎮'
};

export default function HeroFeatured({ games, onPlay }: HeroFeaturedProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const currentGame = games[currentIndex];

  useEffect(() => {
    if (games.length > 1) {
      const nextIndex = (currentIndex + 1) % games.length;
      const nextGame = games[nextIndex];
      if (nextGame?.thumbnail) {
        const img = new Image();
        img.src = nextGame.thumbnail;
      }
    }
  }, [currentIndex, games]);

  useEffect(() => {
    if (games.length <= 1 || isHovered) return;
    const interval = setInterval(() => {
      setImageLoaded(false);
      setCurrentIndex((prev) => (prev + 1) % games.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [games.length, isHovered]);

  const goToNext = useCallback(() => {
    setImageLoaded(false);
    setCurrentIndex((prev) => (prev + 1) % games.length);
  }, [games.length]);

  const goToPrev = useCallback(() => {
    setImageLoaded(false);
    setCurrentIndex((prev) => (prev - 1 + games.length) % games.length);
  }, [games.length]);

  if (!currentGame) return null;

  const thumbnailUrl = currentGame.thumbnail || `https://picsum.photos/seed/${currentGame.id}/1920/1080`;

  return (
    <section 
      className="relative w-full h-[55vh] sm:h-[70vh] lg:h-[80vh] min-h-[350px] sm:min-h-[450px] max-h-[800px] overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentGame.id}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: imageLoaded ? 1 : 0, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="absolute inset-0"
        >
          <img
            src={thumbnailUrl}
            alt={currentGame.title}
            className="w-full h-full object-cover object-center"
            loading="eager"
            decoding="async"
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
            onLoad={() => setImageLoaded(true)}
            style={{ opacity: imageLoaded ? 1 : 0, transition: 'opacity 0.5s ease' }}
          />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg)] via-[var(--bg)]/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-transparent to-[var(--bg)]/30" />
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[var(--bg)] to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />

      {/* Navigation Arrows - Fixed position outside content */}
      {games.length > 1 && (
        <>
          <button
            onClick={goToPrev}
            className="hidden sm:flex absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/50 hover:bg-black/80 transition-all items-center justify-center backdrop-blur-sm border border-white/10 ml-2 lg:ml-4"
            style={{ opacity: isHovered ? 1 : 0, transition: 'opacity 0.3s' }}
            aria-label="Previous game"
          >
            <ChevronLeft className="w-8 h-8 text-white" />
          </button>
          <button
            onClick={goToNext}
            className="hidden sm:flex absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/50 hover:bg-black/80 transition-all items-center justify-center backdrop-blur-sm border border-white/10 mr-2 lg:mr-4"
            style={{ opacity: isHovered ? 1 : 0, transition: 'opacity 0.3s' }}
            aria-label="Next game"
          >
            <ChevronRight className="w-8 h-8 text-white" />
          </button>
        </>
      )}

      {/* Content */}
      <div className="absolute inset-0 flex items-end sm:items-center z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-16 sm:pb-0 pt-20 sm:pt-0">
          <motion.div
            key={currentGame.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="max-w-xl lg:max-w-2xl"
          >
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-gradient-to-r from-red-600 to-red-500 text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded shadow-lg flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                Top Game
              </span>
              <span className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm font-semibold" style={{ color: '#00a8ff' }}>
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                {currentGame.views?.toLocaleString() || 0} plays
              </span>
            </div>

            <h1 className="font-display font-bold text-2xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight mb-2 sm:mb-4 drop-shadow-2xl text-white">
              {currentGame.title}
            </h1>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3 sm:mb-5">
              {currentGame.category && (
                <span className="px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold bg-white/10 backdrop-blur-sm border border-white/20 text-white">
                  {categoryIcons[currentGame.category?.toLowerCase()] || '🎮'} {currentGame.category}
                </span>
              )}
              <span className="px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold bg-white/10 backdrop-blur-sm border border-white/20 text-white">
                HTML5 Game
              </span>
              <span className="px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Free
              </span>
            </div>

            {/* Description - 2 lines max with scroll */}
            <div className="hidden sm:block mb-4 sm:mb-6 max-w-lg">
              <div 
                className="text-sm sm:text-base lg:text-lg text-gray-200 leading-relaxed overflow-y-auto pr-2 line-clamp-2"
                style={{ maxHeight: '3em', scrollbarWidth: 'thin' }}
              >
                {currentGame.description || 'Experience the ultimate gaming adventure. Play now and challenge yourself!'}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onPlay(currentGame.id)}
                className="flex items-center gap-2 sm:gap-3 px-5 sm:px-8 py-2.5 sm:py-4 bg-white text-black font-bold text-sm sm:text-lg rounded-lg hover:bg-white/90 transition-all shadow-xl shadow-white/20"
              >
                <Play className="w-4 h-4 sm:w-6 sm:h-6" fill="currentColor" />
                Play Now
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2.5 sm:py-4 bg-gray-500/70 text-white font-semibold text-sm sm:text-lg rounded-lg hover:bg-gray-500/50 transition-all backdrop-blur-sm"
              >
                <Info className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">More Info</span>
                <span className="sm:hidden">Info</span>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>

      {games.length > 1 && (
        <div className="absolute bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-1.5 sm:gap-2 z-20">
          {games.map((game, index) => (
            <button
              key={game.id}
              onClick={() => {
                setImageLoaded(false);
                setCurrentIndex(index);
              }}
              className={`h-1 rounded-full transition-all duration-300 ${
                index === currentIndex ? 'bg-white w-8 sm:w-12' : 'bg-white/30 hover:bg-white/50 w-4 sm:w-5'
              }`}
            />
          ))}
        </div>
      )}

      {!imageLoaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg)] via-[var(--bg)]/80 to-transparent z-5" />
      )}
    </section>
  );
}
