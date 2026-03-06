'use client';

import { useEffect, useState } from 'react';

interface Game {
  id: number;
  title: string;
  thumbnail: string;
  iframe_url: string;
  category: string;
  views: number;
}

interface HomeData {
  featured: Game[];
  popular: Game[];
  recent: Game[];
  categories: { category: string; count: number }[];
  categoryGames: { category: string; games: Game[] }[];
}

export default function Home() {
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/games/homepage')
      .then(res => res.json())
      .then(response => {
        if (response.success && response.data) {
          // Ensure all arrays exist with defaults
          const safeData: HomeData = {
            featured: Array.isArray(response.data.featured) ? response.data.featured : [],
            popular: Array.isArray(response.data.popular) ? response.data.popular : [],
            recent: Array.isArray(response.data.recent) ? response.data.recent : [],
            categories: Array.isArray(response.data.categories) ? response.data.categories : [],
            categoryGames: Array.isArray(response.data.categoryGames) ? response.data.categoryGames : [],
          };
          setData(safeData);
        } else {
          setError(response.message || 'Failed to load data');
        }
      })
      .catch(err => setError(err.message || 'Network error'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-500 text-xl">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 p-4">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold text-yellow-400">PlayJoy Gaming</h1>
        </div>
      </header>

      <main className="container mx-auto p-4">
        {data?.featured && data.featured.length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Featured Games</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {data.featured.map((game) => (
                <a
                  key={game.id}
                  href={`/game/${game.id}`}
                  className="block bg-gray-800 rounded-lg overflow-hidden hover:transform hover:scale-105 transition-transform"
                >
                  <div className="aspect-video bg-gray-700">
                    {game.thumbnail ? (
                      <img
                        src={game.thumbnail}
                        alt={game.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        🎮
                      </div>
                    )}
                  </div>
                  <div className="p-2">
                    <h3 className="font-semibold text-sm truncate">{game.title}</h3>
                    <span className="text-xs text-gray-400">{game.category}</span>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {data?.popular && data.popular.length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Popular Games</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {data.popular.slice(0, 10).map((game) => (
                <a
                  key={game.id}
                  href={`/game/${game.id}`}
                  className="block bg-gray-800 rounded-lg overflow-hidden hover:transform hover:scale-105 transition-transform"
                >
                  <div className="aspect-video bg-gray-700">
                    {game.thumbnail ? (
                      <img
                        src={game.thumbnail}
                        alt={game.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        🎮
                      </div>
                    )}
                  </div>
                  <div className="p-2">
                    <h3 className="font-semibold text-sm truncate">{game.title}</h3>
                    <span className="text-xs text-gray-400">{game.views?.toLocaleString() || 0} plays</span>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {data?.categoryGames && Array.isArray(data.categoryGames) && data.categoryGames.map((cat) => (
          <section key={cat.category} className="mb-8">
            <h2 className="text-2xl font-bold mb-4 capitalize">{cat.category} Games</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array.isArray(cat.games) && cat.games.map((game) => (
                <a
                  key={game.id}
                  href={`/game/${game.id}`}
                  className="block bg-gray-800 rounded-lg overflow-hidden hover:transform hover:scale-105 transition-transform"
                >
                  <div className="aspect-video bg-gray-700">
                    {game.thumbnail ? (
                      <img
                        src={game.thumbnail}
                        alt={game.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        🎮
                      </div>
                    )}
                  </div>
                  <div className="p-2">
                    <h3 className="font-semibold text-sm truncate">{game.title}</h3>
                  </div>
                </a>
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
