import { useRef, useState, useEffect } from 'react';
import { Game } from '../types';
import { ChevronLeft, ChevronRight, TrendingUp, Play, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import LazyImage from './LazyImage';

interface GameRowProps {
  title: string;
  icon?: string;
  games: Game[];
  onPlay: (id: number) => void;
  onViewMore?: () => void;
  accentColor?: string;
  showViewMore?: boolean;
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

export default function GameRow({ 
  title, 
  icon, 
  games, 
  onPlay, 
  onViewMore,
  accentColor = 'from-emerald-500 to-cyan-500',
  showViewMore = true
}: GameRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isHoveringRow, setIsHoveringRow] = useState(false);

  const checkScrollButtons = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScrollButtons();
    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', checkScrollButtons);
      return () => scrollContainer.removeEventListener('scroll', checkScrollButtons);
    }
  }, [games]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = 350;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  if (!games || games.length === 0) return null;

  return (
    <section 
      className="relative py-2 sm:py-4 group/row"
      onMouseEnter={() => setIsHoveringRow(true)}
      onMouseLeave={() => setIsHoveringRow(false)}
    >
      {/* Section Title */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-2 sm:mb-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-lg sm:text-xl flex items-center gap-2 sm:gap-3">
            <span className={`w-1 sm:w-1.5 h-5 sm:h-6 rounded-full bg-gradient-to-b ${accentColor}`}></span>
            <span className="text-white">{icon} {title}</span>
            <span className="text-xs sm:text-sm font-normal text-gray-500">
              {games.length} games
            </span>
          </h2>
          
          {/* View More Button */}
          {showViewMore && onViewMore && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onViewMore}
              className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/50 transition-all text-gray-300 hover:text-emerald-400"
            >
              <span className="hidden sm:inline">Lihat Lainnya</span>
              <span className="sm:hidden">Lainnya</span>
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </motion.button>
          )}
        </div>
      </div>

      {/* Scroll Container */}
      <div className="relative">
        {/* Left Scroll Button - Netflix Style */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: isHoveringRow && canScrollLeft ? 1 : 0 }}
          onClick={() => scroll('left')}
          className="hidden sm:flex absolute left-0 top-0 bottom-0 z-20 w-14 lg:w-20 bg-gradient-to-r from-[var(--bg)] via-[var(--bg)]/90 to-transparent items-center justify-start pl-2 lg:pl-4"
        >
          <div className="p-2 rounded-full bg-black/60 hover:bg-black/80 transition-colors backdrop-blur-sm">
            <ChevronLeft className="w-6 h-6 text-white" />
          </div>
        </motion.button>

        {/* Right Scroll Button - Netflix Style */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: isHoveringRow && canScrollRight ? 1 : 0 }}
          onClick={() => scroll('right')}
          className="hidden sm:flex absolute right-0 top-0 bottom-0 z-20 w-14 lg:w-20 bg-gradient-to-l from-[var(--bg)] via-[var(--bg)]/90 to-transparent items-center justify-end pr-2 lg:pr-4"
        >
          <div className="p-2 rounded-full bg-black/60 hover:bg-black/80 transition-colors backdrop-blur-sm">
            <ChevronRight className="w-6 h-6 text-white" />
          </div>
        </motion.button>

        {/* Games Horizontal Scroll */}
        <div
          ref={scrollRef}
          className="flex gap-2 sm:gap-3 lg:gap-4 overflow-x-auto scroll-smooth px-4 sm:px-6 lg:px-8 pb-2 sm:pb-4 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {games.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(index * 0.025, 0.4) }}
              className="relative flex-shrink-0 w-28 sm:w-36 md:w-40 lg:w-44 xl:w-48 group/card cursor-pointer"
              onClick={() => onPlay(game.id)}
            >
              {/* Card Container - Netflix Style Hover */}
              <div className="relative rounded-md sm:rounded-lg overflow-hidden transition-all duration-300 ease-out group-hover/card:scale-110 group-hover/card:z-20 group-hover/card:shadow-2xl group-hover/card:shadow-emerald-500/20">
                {/* Thumbnail */}
                <LazyImage
                  src={game.thumbnail || `https://picsum.photos/seed/${game.id}/400/600`}
                  alt={game.title}
                  className="aspect-[2/3] rounded-md sm:rounded-lg"
                />

                {/* Featured Badge */}
                {(game.is_featured || game.featured) && (
                  <span className="absolute top-1 sm:top-2 left-1 sm:left-2 px-1.5 sm:px-2 py-0.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-[8px] sm:text-[10px] font-bold rounded shadow-lg">
                    TOP
                  </span>
                )}

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />

                {/* Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3">
                  <h3 className="font-display font-bold text-xs sm:text-sm text-white mb-0.5 sm:mb-1 line-clamp-2 group-hover/card:text-emerald-400 transition-colors">
                    {game.title}
                  </h3>
                  <div className="flex items-center justify-between text-[10px] sm:text-xs">
                    <span className="text-gray-300 truncate max-w-[55%]">
                      {categoryIcons[game.category?.toLowerCase() || 'default']} {game.category || 'Game'}
                    </span>
                    <span className="flex items-center gap-0.5 sm:gap-1 text-emerald-400 font-medium">
                      <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      {game.views?.toLocaleString?.() || 0}
                    </span>
                  </div>
                </div>

                {/* Hover Play Button - Netflix Style */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity duration-200">
                  <motion.div 
                    initial={{ scale: 0.5 }}
                    whileHover={{ scale: 1.1 }}
                    className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-white flex items-center justify-center shadow-xl"
                  >
                    <Play className="w-5 h-5 sm:w-7 sm:h-7 text-black ml-0.5" fill="currentColor" />
                  </motion.div>
                </div>

                {/* Hover Border Glow */}
                <div className="absolute inset-0 rounded-md sm:rounded-lg opacity-0 group-hover/card:opacity-100 transition-opacity pointer-events-none ring-2 ring-emerald-500/60" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
