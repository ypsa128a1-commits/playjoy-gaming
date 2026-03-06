import { useState, useEffect, lazy, Suspense } from 'react';
import { Game, Settings, Stats, User, Category } from './types';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from './components/Navbar';
import HeroFeatured from './components/HeroFeatured';
import GameRow from './components/GameRow';
import CategoryModal from './components/CategoryModal';
import { Search, Loader2 } from 'lucide-react';

// Lazy load heavy components for better performance
const AdminPanel = lazy(() => import('./components/AdminPanel'));
const AuthModal = lazy(() => import('./components/AuthModal'));
const GamePlayer = lazy(() => import('./components/GamePlayer'));
const GameCard = lazy(() => import('./components/GameCard'));

// Force evaluation - cannot be tree-shaken
const AUTH_KEY = 'auth_token';
eval('window.__saveToken = function(t) { try { localStorage.setItem("' + AUTH_KEY + '", t); } catch(e) {} }');
eval('window.__getToken = function() { try { return localStorage.getItem("' + AUTH_KEY + '"); } catch(e) { return null; } }');
eval('window.__removeToken = function() { try { localStorage.removeItem("' + AUTH_KEY + '"); } catch(e) {} }');

// Loading skeleton component
const LoadingSkeleton = () => (
  <div className="flex items-center justify-center py-12">
    <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
  </div>
);

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

// Accent colors for different rows
const accentColors = [
  'from-red-500 to-orange-500',
  'from-purple-500 to-pink-500',
  'from-blue-500 to-cyan-500',
  'from-green-500 to-emerald-500',
  'from-yellow-500 to-amber-500',
  'from-indigo-500 to-violet-500',
  'from-teal-500 to-cyan-500',
  'from-rose-500 to-pink-500',
];

export default function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'admin'>('home');
  const [games, setGames] = useState<Game[]>([]);
  const [featuredGames, setFeaturedGames] = useState<Game[]>([]);
  const [popularGames, setPopularGames] = useState<Game[]>([]);
  const [recentGames, setRecentGames] = useState<Game[]>([]);
  const [categoryGames, setCategoryGames] = useState<{category: string; count: number; games: Game[]}[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<Settings>({ site_title: 'Aurazein' });
  const [stats, setStats] = useState<Stats>({ totalGames: 0, totalViews: 0, totalUsers: 0 });
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMoreCategory, setViewMoreCategory] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [activeGame, setActiveGame] = useState<Game | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('darkMode');
      if (saved !== null) return saved === 'true';
      return true;
    }
    return true;
  });

  // Auth helpers
  const getAuthToken = (): string | null => {
    return (window as any).__getToken();
  };

  const removeAuthToken = () => {
    (window as any).__removeToken();
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  // Initial data load
  useEffect(() => {
    checkAuth();
    fetchSettings();
    fetchStats();
    fetchHomepageData();
  }, []);

  // Search/filter games
  useEffect(() => {
    if (search || selectedCategory) {
      fetchGames();
    }
  }, [search, sort, selectedCategory]);

  useEffect(() => {
    if (settings.site_title) {
      document.title = settings.site_title;
    }
  }, [settings.site_title]);

  const checkAuth = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        setUser(null);
        return;
      }
      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
        removeAuthToken();
      }
    } catch (e) {
      setUser(null);
      removeAuthToken();
    }
  };

  const fetchSettings = async () => {
    const res = await fetch('/api/settings');
    const data = await res.json();
    setSettings(data);
  };

  // Fetch homepage data - LIMITED to 10 games per row
  const fetchHomepageData = async () => {
    try {
      const res = await fetch('/api/games/homepage?featuredLimit=5&categoryLimit=10');
      const data = await res.json();
      
      if (data.success && data.data) {
        setFeaturedGames(data.data.featured || []);
        setPopularGames((data.data.popular || []).slice(0, 10));
        setRecentGames((data.data.recent || []).slice(0, 10));
        setCategoryGames(data.data.categories || []);
        
        // Extract categories from data
        const cats = (data.data.categories || []).map((c: any) => ({
          category: c.category,
          count: c.count
        }));
        setCategories(cats);
      }
    } catch (e) {
      console.error('Failed to fetch homepage data:', e);
    } finally {
      setIsInitialLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/games/categories');
      const data = await res.json();
      if (data.success && data.data) {
        setCategories(data.data);
      }
    } catch (e) {
      console.error('Failed to fetch categories:', e);
    }
  };

  const fetchGames = async () => {
    setIsLoading(true);
    try {
      let url = `/api/games?search=${search}&sort=${sort}&limit=50`;
      if (selectedCategory) {
        url += `&category=${encodeURIComponent(selectedCategory)}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      setGames(data.data || data);
    } catch (e) {
      console.error('Failed to fetch games:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    const res = await fetch('/api/stats');
    const data = await res.json();
    setStats(data);
  };

  const handleLogout = async () => {
    removeAuthToken();
    setUser(null);
    setCurrentPage('home');
  };

  const handlePlayGame = async (id: number) => {
    console.log('[DEBUG] handlePlayGame called with id:', id);
    // First try to find in existing state
    const allGames = [...featuredGames, ...popularGames, ...recentGames, ...games];
    const categoryGamesFlat = categoryGames.flatMap(c => c.games);
    let game = allGames.find(g => g.id === id) || categoryGamesFlat.find(g => g.id === id);
    console.log('[DEBUG] Game found in state:', game);
    
    // If not found (e.g., from CategoryModal), fetch from API
    if (!game || (!game.url && !game.iframe_url)) {
      console.log('[DEBUG] Fetching game from API...');
      try {
        const res = await fetch(`/api/games/${id}`);
        const data = await res.json();
        if (data && data.id) {
          game = data;
        }
      } catch (e) {
        console.error('Failed to fetch game:', e);
      }
    }
    
    if (game) {
      console.log('[DEBUG] Setting activeGame:', game.title);
      setActiveGame(game);
      try {
        await fetch(`/api/games/${id}/view`, { method: 'POST' });
      } catch (e) {}
      fetchStats();
    }
  };

  const handleAuthSuccess = (userData: any, token?: string) => {
    if (token) {
      (window as any).__saveToken(token);
    }
    setUser(userData);
    fetchStats();
  };

  return (
    <div className="min-h-screen font-sans transition-colors duration-500" style={{ background: 'var(--bg)', color: 'var(--fg)' }}>
      {/* Background Effects */}
      <div className="bg-pattern"></div>
      <div className="grid-overlay"></div>

      <Navbar 
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        user={user}
        settings={settings}
        search={search}
        setSearch={setSearch}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onLogout={handleLogout}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      <main className="relative z-10">
        <AnimatePresence mode="wait">
          {currentPage === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Initial Loading */}
              {isInitialLoading ? (
                <div className="min-h-screen flex items-center justify-center">
                  <Loader2 className="w-12 h-12 animate-spin text-emerald-500" />
                </div>
              ) : (
                <>
                  {/* Netflix Style Hero Featured Section */}
                  {featuredGames.length > 0 && !search && !selectedCategory && (
                    <HeroFeatured 
                      games={featuredGames} 
                      onPlay={handlePlayGame} 
                    />
                  )}

                  {/* Category Pills */}
                  {!search && categories.length > 0 && (
                    <section className="py-3 sm:py-4 relative z-20">
                      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:-mx-0 sm:px-0 scrollbar-hide">
                          <button
                            onClick={() => setSelectedCategory(null)}
                            className={`category-pill ${selectedCategory === null ? 'active' : ''}`}
                          >
                            🎮 All
                          </button>
                          {categories.map(cat => (
                            <button
                              key={cat.category}
                              onClick={() => setViewMoreCategory(cat.category)}
                              className="category-pill"
                            >
                              {categoryIcons[cat.category?.toLowerCase()] || categoryIcons['default']} {cat.category}
                            </button>
                          ))}
                        </div>
                      </div>
                    </section>
                  )}

                  {/* Search/Filter Results */}
                  {(search || selectedCategory) && (
                    <section className="pt-24 pb-4 relative">
                      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="mb-6">
                          <h1 className="text-2xl font-bold tracking-tight mb-2">
                            {search ? `Search Results for "${search}"` : `${selectedCategory} Games`}
                          </h1>
                          <p className="text-gray-400">
                            {games.length} games found
                          </p>
                        </div>
                        
                        {isLoading ? (
                          <LoadingSkeleton />
                        ) : games.length > 0 ? (
                          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4">
                            {games.map(game => (
                              <Suspense key={game.id} fallback={<div className="aspect-[2/3] bg-gray-800 rounded-lg animate-pulse" />}>
                                <GameCard game={game} onView={handlePlayGame} />
                              </Suspense>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-12">
                            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-gray-800">
                              <Search className="w-8 h-8 text-gray-500" />
                            </div>
                            <h3 className="text-xl font-bold">No games found</h3>
                            <p className="text-gray-500">Try a different search term or category.</p>
                          </div>
                        )}
                      </div>
                    </section>
                  )}

                  {/* Netflix Style Rows - Only show when not searching */}
                  {!search && !selectedCategory && (
                    <>
                      {/* Popular Games Row */}
                      {popularGames.length > 0 && (
                        <GameRow
                          title="Trending Now"
                          icon="🔥"
                          games={popularGames}
                          onPlay={handlePlayGame}
                          accentColor="from-red-500 to-orange-500"
                          showViewMore={false}
                        />
                      )}

                      {/* Recent Games Row */}
                      {recentGames.length > 0 && (
                        <GameRow
                          title="New Releases"
                          icon="✨"
                          games={recentGames}
                          onPlay={handlePlayGame}
                          accentColor="from-purple-500 to-pink-500"
                          showViewMore={false}
                        />
                      )}

                      {/* Category Rows with "Lihat Lainnya" button */}
                      {categoryGames.map((category, index) => (
                        <GameRow
                          key={category.category}
                          title={category.category}
                          icon={categoryIcons[category.category?.toLowerCase()] || '🎮'}
                          games={category.games}
                          onPlay={handlePlayGame}
                          onViewMore={() => setViewMoreCategory(category.category)}
                          accentColor={accentColors[index % accentColors.length]}
                          showViewMore={category.count > 10}
                        />
                      ))}
                    </>
                  )}

                  {/* Stats Section */}
                  {!search && !selectedCategory && (
                    <section className="py-8 sm:py-12 relative mt-4 sm:mt-8">
                      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
                          <div className="p-3 sm:p-6 rounded-xl sm:rounded-2xl text-center bg-gray-900/50 border border-gray-800">
                            <div className="font-display font-bold text-xl sm:text-4xl mb-1 sm:mb-2 text-emerald-400">{stats.totalGames.toLocaleString()}+</div>
                            <div className="text-[10px] sm:text-sm text-gray-400">Games Available</div>
                          </div>
                          <div className="p-3 sm:p-6 rounded-xl sm:rounded-2xl text-center bg-gray-900/50 border border-gray-800">
                            <div className="font-display font-bold text-xl sm:text-4xl mb-1 sm:mb-2 text-emerald-400">{stats.totalViews.toLocaleString()}+</div>
                            <div className="text-[10px] sm:text-sm text-gray-400">Total Plays</div>
                          </div>
                          <div className="p-3 sm:p-6 rounded-xl sm:rounded-2xl text-center bg-gray-900/50 border border-gray-800">
                            <div className="font-display font-bold text-xl sm:text-4xl mb-1 sm:mb-2 text-emerald-400">{stats.totalUsers}+</div>
                            <div className="text-[10px] sm:text-sm text-gray-400">Active Users</div>
                          </div>
                          <div className="p-3 sm:p-6 rounded-xl sm:rounded-2xl text-center bg-gray-900/50 border border-gray-800">
                            <div className="font-display font-bold text-xl sm:text-4xl mb-1 sm:mb-2 text-emerald-400">99.9%</div>
                            <div className="text-[10px] sm:text-sm text-gray-400">Uptime</div>
                          </div>
                        </div>
                      </div>
                    </section>
                  )}
                </>
              )}
            </motion.div>
          )}

          {currentPage === 'admin' && user?.role === 'admin' && (
            <div className="pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
              <Suspense fallback={<LoadingSkeleton />}>
                <AdminPanel 
                  games={games} 
                  settings={settings} 
                  stats={stats} 
                onUpdate={async () => {
                  await fetchGames();
                  await fetchSettings();
                  await fetchStats();
                  await fetchHomepageData();
                  await fetchCategories();
                }} 
              />
            </Suspense>
            </div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="py-8 sm:py-12 border-t relative z-10 border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="font-display font-bold text-lg">{settings.site_title?.split('|')[0].trim()}</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-500">
              © 2024 {settings.site_title?.split('|')[0].trim()}. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Modals - Lazy Loaded */}
      <AnimatePresence>
        {isAuthModalOpen && (
          <Suspense fallback={null}>
            <AuthModal 
              onClose={() => setIsAuthModalOpen(false)} 
              onSuccess={handleAuthSuccess} 
            />
          </Suspense>
        )}
        {activeGame && (
          <Suspense fallback={null}>
            <GamePlayer 
              game={activeGame} 
              onClose={() => setActiveGame(null)} 
            />
          </Suspense>
        )}
        {viewMoreCategory && (
          <CategoryModal
            category={viewMoreCategory}
            onClose={() => setViewMoreCategory(null)}
            onPlay={handlePlayGame}
          />
        )}
      </AnimatePresence>
    </div>
  );
}