import { useState, useEffect } from 'react';
import { Game, Settings, Stats } from '../types';
import { LayoutDashboard, BarChart3, Users, Plus, Edit2, Trash2, ChevronRight, Settings as SettingsIcon, Download, Loader2, CheckCircle, XCircle, Gamepad2 } from 'lucide-react';
import { motion } from 'motion/react';

// Force evaluation - cannot be tree-shaken
const AUTH_KEY = 'auth_token';
eval('window.__getAuthToken = function() { try { return localStorage.getItem("' + AUTH_KEY + '"); } catch(e) { return null; } }');

interface AdminPanelProps {
  games: Game[];
  settings: Settings;
  stats: Stats;
  onUpdate: () => void;
}

export default function AdminPanel({ games: propGames, settings, stats, onUpdate }: AdminPanelProps) {
  const [games, setGames] = useState<Game[]>(propGames);
  const [activeTab, setActiveTab] = useState<'games' | 'import' | 'settings'>('games');
  const [editingGame, setEditingGame] = useState<Partial<Game> | null>(null);
  const [siteTitle, setSiteTitle] = useState(settings.site_title);
  const [newPassword, setNewPassword] = useState('');
  const [googleClientId, setGoogleClientId] = useState(settings.google_client_id || '');
  const [googleClientSecret, setGoogleClientSecret] = useState(settings.google_client_secret || '');
  const [isLoading, setIsLoading] = useState(false);
  
  // Import states
  const [importUrl, setImportUrl] = useState('https://gamemonetize.com/games');
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0, game: '' });
  const [importResults, setImportResults] = useState<{ success: number; failed: number; games: any[] } | null>(null);

  // Fetch games on mount
  useEffect(() => {
    fetchGames();
  }, []);

  // Update games when prop changes
  useEffect(() => {
    if (propGames.length > 0) {
      setGames(propGames);
    }
  }, [propGames]);

  const fetchGames = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/games?limit=100');
      const data = await res.json();
      setGames(Array.isArray(data) ? data : (data.data || []));
    } catch (err) {
      console.error('Failed to fetch games:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to get auth headers
  const getAuthHeaders = () => {
    const token = (window as any).__getAuthToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // Bulk Import Games from GameMonetize
  const handleBulkImport = async () => {
    if (!confirm('This will import games from GameMonetize. Continue?')) return;
    
    setImporting(true);
    setImportResults(null);
    setImportProgress({ current: 0, total: 0, game: '' });

    try {
      // Call the import API
      const res = await fetch('/api/games/import', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ url: importUrl, count: 50 })
      });
      
      const data = await res.json();
      
      if (data.success) {
        setImportResults({
          success: data.imported || 0,
          failed: data.failed || 0,
          games: data.games || []
        });
        onUpdate();
      } else {
        alert(data.message || 'Import failed');
      }
    } catch (err) {
      console.error('Import error:', err);
      alert('Failed to import games. Make sure the import API is available.');
    } finally {
      setImporting(false);
    }
  };

  // Quick Import - Manual game entry from GameMonetize URL
  const handleQuickImport = async () => {
    const url = prompt('Enter GameMonetize game URL (e.g., https://gamemonetize.com/game-name):');
    if (!url) return;
    
    setImporting(true);
    
    try {
      // Extract game slug from URL
      const slug = url.split('/').filter(Boolean).pop();
      
      // GameMonetize iframe pattern
      const iframeUrl = `https://html5.gamemonetize.co/${slug}/`;
      const thumbnailUrl = `https://img.gamemonetize.com/${slug}/512x384.jpg`;
      
      // Save to database
      const res = await fetch('/api/games', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title: slug?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Imported Game',
          description: `Imported from GameMonetize`,
          iframe_url: iframeUrl,
          thumbnail: thumbnailUrl,
          category: 'action',
          featured: 0
        })
      });
      
      const data = await res.json();
      if (data.success) {
        alert('Game imported successfully!');
        onUpdate();
      } else {
        alert(data.message || 'Failed to import game');
      }
    } catch (err) {
      console.error('Quick import error:', err);
      alert('Failed to import game');
    } finally {
      setImporting(false);
    }
  };

  const handleSaveGame = async () => {
    if (!editingGame?.title || !editingGame?.iframe_url) {
      alert('Judul dan URL Game wajib diisi');
      return;
    }
    const method = editingGame.id ? 'PUT' : 'POST';
    const url = editingGame.id ? `/api/games/${editingGame.id}` : '/api/games';
    
    const res = await fetch(url, {
      method,
      headers: getAuthHeaders(),
      body: JSON.stringify({
        title: editingGame.title,
        description: editingGame.description || '',
        category: editingGame.category || 'action',
        thumbnail: editingGame.thumbnail || '',
        iframe_url: editingGame.iframe_url,
        featured: editingGame.featured || editingGame.is_featured || 0
      })
    });
    
    const data = await res.json();
    if (data.success || data.id) {
      setEditingGame(null);
      fetchGames();
      onUpdate();
    } else {
      alert(data.message || 'Gagal menyimpan game');
    }
  };

  const handleDeleteGame = async (id: number) => {
    if (!confirm('Yakin ingin menghapus game ini?')) return;
    const res = await fetch(`/api/games/${id}`, { 
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (data.success) {
      fetchGames();
      onUpdate();
    } else {
      alert(data.message || 'Gagal menghapus game');
    }
  };

  const handleSaveSettings = async () => {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ 
        site_title: siteTitle
      })
    });
    const data = await res.json();
    if (data.success) {
      alert('Pengaturan disimpan!');
      onUpdate();
    } else {
      alert(data.message || 'Gagal menyimpan pengaturan');
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <StatCard title="Total Games" value={stats.totalGames} icon={<Gamepad2 className="w-4 h-4" />} color="emerald" />
        <StatCard title="Total Views" value={stats.totalViews} icon={<BarChart3 className="w-4 h-4" />} color="cyan" />
        <StatCard title="Total Users" value={stats.totalUsers} icon={<Users className="w-4 h-4" />} color="purple" />
        <StatCard title="Status" value="Online" icon={<div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />} color="green" />
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 p-1 rounded-xl w-fit" style={{ background: 'var(--card)' }}>
        <TabButton active={activeTab === 'games'} onClick={() => setActiveTab('games')} label="🎮 Kelola Game" />
        <TabButton active={activeTab === 'import'} onClick={() => setActiveTab('import')} label="📥 Import" />
        <TabButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} label="⚙️ Pengaturan" />
      </div>

      {/* Games Management Tab */}
      {activeTab === 'games' && (
        <div className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-bold font-display">Daftar Game ({games.length})</h2>
            <button 
              onClick={() => setEditingGame({ featured: 0, is_featured: 0, category: 'action' })}
              className="btn-primary flex items-center gap-2 py-2 px-4 text-sm sm:text-base"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Game</span>
            </button>
          </div>

          <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent)' }} />
              </div>
            ) : games.length === 0 ? (
              <div className="text-center py-12">
                <Gamepad2 className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--fg-muted)' }} />
                <p style={{ color: 'var(--fg-muted)' }}>Belum ada game. Tambah game pertama!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[600px]">
                  <thead>
                    <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--fg-muted)' }}>No</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--fg-muted)' }}>Game</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--fg-muted)' }}>Kategori</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--fg-muted)' }}>Status</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--fg-muted)' }}>Views</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-right" style={{ color: 'var(--fg-muted)' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {games.map((game, index) => (
                      <tr key={game.id} className="hover:bg-[var(--card-hover)] transition-colors" style={{ borderBottom: '1px solid var(--border)' }}>
                        <td className="px-6 py-4 text-sm" style={{ color: 'var(--fg-muted)' }}>{index + 1}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img src={game.thumbnail || `https://picsum.photos/seed/${game.id}/100/100`} className="w-10 h-10 rounded-lg object-cover" alt={game.title} />
                            <div>
                              <div className="font-bold text-sm">{game.title}</div>
                              <div className="text-xs truncate max-w-[200px]" style={{ color: 'var(--fg-muted)' }}>{game.description?.substring(0, 30)}...</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm capitalize" style={{ color: 'var(--fg-muted)' }}>{game.category}</td>
                        <td className="px-6 py-4">
                          {(game.featured === 1 || game.is_featured === 1) && (
                            <span className="px-2 py-1 rounded text-xs font-bold" style={{ background: 'rgba(0, 212, 170, 0.2)', color: 'var(--accent)' }}>Featured</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm" style={{ color: 'var(--fg-muted)' }}>{game.views}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => setEditingGame({...game, iframe_url: game.iframe_url || game.url})} className="p-2 rounded-lg transition-all hover:text-emerald-400" style={{ color: 'var(--fg-muted)' }}><Edit2 className="w-4 h-4" /></button>
                            <button onClick={() => handleDeleteGame(game.id)} className="p-2 rounded-lg transition-all hover:text-red-400" style={{ color: 'var(--fg-muted)' }}><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Import Tab */}
      {activeTab === 'import' && (
        <div className="space-y-6">
          <div className="rounded-2xl p-6" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <h2 className="text-xl font-bold font-display mb-4 flex items-center gap-2">
              <Download className="w-5 h-5" style={{ color: 'var(--accent)' }} />
              Import dari GameMonetize
            </h2>
            
            <p className="mb-6" style={{ color: 'var(--fg-muted)' }}>
              Import game secara massal dari GameMonetize.com. Game akan otomatis terisi dengan judul, thumbnail, dan URL game.
            </p>

            {/* Quick Import */}
            <div className="mb-6 p-4 rounded-xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
              <h3 className="font-bold mb-3">🚀 Quick Import (Satu Game)</h3>
              <p className="text-sm mb-4" style={{ color: 'var(--fg-muted)' }}>
                Masukkan URL game dari GameMonetize, contoh: https://gamemonetize.com/subway-surfers
              </p>
              <button 
                onClick={handleQuickImport}
                disabled={importing}
                className="btn-secondary flex items-center gap-2"
              >
                {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Quick Import Game
              </button>
            </div>

            {/* Bulk Import */}
            <div className="p-4 rounded-xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
              <h3 className="font-bold mb-3">📦 Bulk Import (Massal)</h3>
              <p className="text-sm mb-4" style={{ color: 'var(--fg-muted)' }}>
                Import puluhan game sekaligus dari halaman kategori GameMonetize.
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">URL Kategori GameMonetize:</label>
                <input
                  type="text"
                  value={importUrl}
                  onChange={(e) => setImportUrl(e.target.value)}
                  placeholder="https://gamemonetize.com/games"
                  className="w-full px-4 py-3 rounded-xl outline-none transition-all"
                  style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--fg)' }}
                />
              </div>

              {importing && (
                <div className="mb-4 p-4 rounded-xl" style={{ background: 'var(--card)' }}>
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--accent)' }} />
                    <div>
                      <div className="font-medium">Importing games...</div>
                      <div className="text-sm" style={{ color: 'var(--fg-muted)' }}>
                        {importProgress.current} / {importProgress.total} - {importProgress.game}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {importResults && (
                <div className="mb-4 p-4 rounded-xl" style={{ background: 'var(--card)' }}>
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                    <span className="font-bold">Import Complete!</span>
                  </div>
                  <div className="text-sm" style={{ color: 'var(--fg-muted)' }}>
                    ✅ {importResults.success} games imported successfully<br />
                    ❌ {importResults.failed} games failed
                  </div>
                </div>
              )}

              <button 
                onClick={handleBulkImport}
                disabled={importing}
                className="btn-primary flex items-center gap-2"
              >
                {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                {importing ? 'Importing...' : 'Start Bulk Import'}
              </button>
            </div>

            {/* Info */}
            <div className="mt-6 p-4 rounded-xl" style={{ background: 'rgba(0, 212, 170, 0.1)', border: '1px solid rgba(0, 212, 170, 0.2)' }}>
              <h4 className="font-bold mb-2" style={{ color: 'var(--accent)' }}>💡 Tips</h4>
              <ul className="text-sm space-y-1" style={{ color: 'var(--fg-muted)' }}>
                <li>• URL kategori: https://gamemonetize.com/games, https://gamemonetize.com/action-games, dll</li>
                <li>• Game duplikat akan di-skip otomatis</li>
                <li>• Thumbnail dan iframe URL akan otomatis terisi</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="max-w-2xl space-y-6">
          <div className="rounded-2xl p-6 sm:p-8 space-y-6" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <h2 className="text-xl font-bold font-display">Pengaturan Website</h2>
            <div className="space-y-4">
              <Input label="Judul Website" value={siteTitle} onChange={setSiteTitle} placeholder="Aurazein | Bantu pikiran tenang" />
              <button onClick={handleSaveSettings} className="btn-primary w-full">Simpan Perubahan</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Game Modal */}
      {editingGame && (
        <div className="fixed inset-0 z-[200] overflow-y-auto py-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[201]" onClick={() => setEditingGame(null)} />
          <div className="relative z-[202] flex items-center justify-center min-h-full p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              className="relative rounded-3xl shadow-2xl overflow-hidden max-w-lg w-full flex flex-col max-h-[85vh]" 
              style={{ background: 'var(--card)' }}
            >
              <div className="p-4 sm:p-6 flex justify-between items-center flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
                <h3 className="text-lg sm:text-xl font-bold font-display">{editingGame.id ? 'Edit Game' : 'Tambah Game'}</h3>
                <button onClick={() => setEditingGame(null)} className="p-2 rounded-lg transition-colors hover:bg-red-500/20" style={{ color: 'var(--fg-muted)' }}><ChevronRight className="w-6 h-6 rotate-90" /></button>
              </div>
              <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
                <Input label="Judul" value={editingGame.title || ''} onChange={(v) => setEditingGame({...editingGame, title: v})} />
                <Input label="Kategori" value={editingGame.category || ''} onChange={(v) => setEditingGame({...editingGame, category: v})} placeholder="action, puzzle, racing, etc" />
                <Input label="URL Game (iframe_url)" value={editingGame.iframe_url || ''} onChange={(v) => setEditingGame({...editingGame, iframe_url: v})} placeholder="https://html5.gamemonetize.co/..." />
                <Input label="URL Thumbnail" value={editingGame.thumbnail || ''} onChange={(v) => setEditingGame({...editingGame, thumbnail: v})} placeholder="https://img.gamemonetize.com/..." />
                <div className="flex items-center gap-2 py-2">
                  <input type="checkbox" id="featured" checked={editingGame.featured === 1 || editingGame.is_featured === 1} onChange={(e) => setEditingGame({...editingGame, featured: e.target.checked ? 1 : 0, is_featured: e.target.checked ? 1 : 0})} className="w-4 h-4 rounded" />
                  <label htmlFor="featured" className="text-sm font-medium">Tampilkan di Featured</label>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Deskripsi</label>
                  <textarea className="w-full px-4 py-2 rounded-xl outline-none h-24 resize-none" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--fg)' }} value={editingGame.description || ''} onChange={(e) => setEditingGame({ ...editingGame, description: e.target.value })} />
                </div>
              </div>
              <div className="p-4 sm:p-6 flex gap-3 flex-shrink-0" style={{ background: 'var(--bg-secondary)' }}>
                <button 
                  onClick={() => setEditingGame(null)} 
                  className="flex-1 py-3 font-bold rounded-lg transition-all hover:bg-red-500/20 hover:text-red-400" 
                  style={{ color: 'var(--fg-muted)', background: 'var(--card)' }}
                >Batal</button>
                <button onClick={handleSaveGame} className="btn-primary flex-1 py-3">Simpan</button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function StatCard({ title, value, icon, color }: { title: string, value: any, icon: any, color: string }) {
  const colors: Record<string, string> = { 
    emerald: 'from-emerald-400 to-cyan-500', 
    cyan: 'from-cyan-400 to-blue-500',
    purple: 'from-purple-400 to-pink-500', 
    green: 'from-green-400 to-emerald-500'
  };
  return (
    <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
      <div className="flex items-center justify-between mb-1 sm:mb-2">
        <span className="text-xs sm:text-sm font-medium" style={{ color: 'var(--fg-muted)' }}>{title}</span>
        <div className={`p-1.5 sm:p-2 rounded-lg bg-gradient-to-br ${colors[color]}`}>{icon}</div>
      </div>
      <div className="text-xl sm:text-3xl font-bold font-display">{value}</div>
    </div>
  );
}

function TabButton({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
  return (
    <button 
      onClick={onClick} 
      className="px-4 py-2 rounded-lg text-sm font-bold transition-all"
      style={{ 
        background: active ? 'var(--accent)' : 'transparent',
        color: active ? 'var(--bg)' : 'var(--fg-muted)'
      }}
    >
      {label}
    </button>
  );
}

function Input({ label, value, onChange, type = 'text', placeholder = '' }: { label: string, value: string, onChange: (v: string) => void, type?: string, placeholder?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input 
        type={type} 
        className="w-full px-4 py-3 rounded-xl outline-none transition-all" 
        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--fg)' }} 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        placeholder={placeholder} 
      />
    </div>
  );
}
