import { useState, useEffect } from 'react';
import { Game } from '../types';
import { X, ChevronLeft, ChevronRight, Loader2, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import LazyImage from './LazyImage';

interface CategoryModalProps {
  category: string;
  onClose: () => void;
  onPlay: (id: number) => void;
}

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

export default function CategoryModal({ category, onClose, onPlay }: CategoryModalProps) {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isGameStarting, setIsGameStarting] = useState(false);
  const limit = 24;

  useEffect(() => {
    fetchGames(1);
  }, [category]);

  const fetchGames = async (pageNum: number) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/games?category=${encodeURIComponent(category)}&page=${pageNum}&limit=${limit}`);
      const data = await res.json();
      
      if (Array.isArray(data)) {
        setGames(data);
        setTotalPages(1);
        setTotalCount(data.length);
      } else {
        setGames(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalCount(data.pagination?.total || 0);
      }
      setPage(pageNum);
    } catch (err) {
      console.error('Failed to fetch games:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) fetchGames(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) fetchGames(page + 1);
  };

  const handlePlay = (game: Game, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    // Just play the game - DON'T close the modal
    // User can close modal manually if needed
    onPlay(game.id);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] overflow-hidden"
      >
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="absolute inset-0 sm:inset-4 md:inset-8 lg:inset-12 bg-[var(--bg)] rounded-none sm:rounded-2xl overflow-hidden flex flex-col"
          style={{ border: '1px solid var(--border)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b" style={{ borderColor: 'var(--border)' }}>
            <div>
              <h2 className="font-display font-bold text-xl sm:text-2xl flex items-center gap-2">
                <span>{categoryIcons[category?.toLowerCase()] || '🎮'}</span>
                <span>{category} Games</span>
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                {totalCount} games found
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
              </div>
            ) : games.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-400">No games found in this category.</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3 sm:gap-4">
                {games.map((game, index) => (
                  <motion.div
                    key={game.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.02, 0.5) }}
                    className="cursor-pointer group"
                    onClick={(e) => handlePlay(game, e)}
                  >
                    <div className="relative rounded-lg overflow-hidden transition-transform group-hover:scale-105">
                      <LazyImage
                        src={game.thumbnail || `https://picsum.photos/seed/${game.id}/400/600`}
                        alt={game.title}
                        className="aspect-[2/3] rounded-lg"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-2">
                        <h3 className="font-bold text-xs text-white line-clamp-2 group-hover:text-emerald-400">
                          {game.title}
                        </h3>
                        <div className="flex items-center gap-1 text-[10px] text-emerald-400 mt-0.5">
                          <TrendingUp className="w-2.5 h-2.5" />
                          {game.views?.toLocaleString?.() || 0}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination Footer */}
          {!isLoading && games.length > 0 && totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 p-4 border-t" style={{ borderColor: 'var(--border)' }}>
              <button
                onClick={handlePrevPage}
                disabled={page === 1}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                Prev
              </button>
              
              <div className="flex items-center gap-2 text-sm">
                <span className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold">
                  {page}
                </span>
                <span className="text-gray-500">of</span>
                <span>{totalPages}</span>
              </div>

              <button
                onClick={handleNextPage}
                disabled={page === totalPages}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
