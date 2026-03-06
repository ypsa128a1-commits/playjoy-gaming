import { User, Settings } from '../types';
import { Search, LogIn, LogOut, LayoutDashboard, Moon, Sun, User as UserIcon, X } from 'lucide-react';
import { useState } from 'react';

interface NavbarProps {
  currentPage: string;
  setCurrentPage: (page: any) => void;
  user: User | null;
  settings: Settings;
  search: string;
  setSearch: (s: string) => void;
  darkMode: boolean;
  setDarkMode: (d: boolean) => void;
  onLogout: () => void;
  onOpenAuth: () => void;
}

export default function Navbar({
  currentPage,
  setCurrentPage,
  user,
  settings,
  search,
  setSearch,
  darkMode,
  setDarkMode,
  onLogout,
  onOpenAuth
}: NavbarProps) {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  return (
    <nav className="nav-blur fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Click goes to aurazein.my.id */}
          <a 
            href="/"
            className="flex items-center gap-3 cursor-pointer group flex-shrink-0"
          >
            <img 
              src={typeof window !== 'undefined' && (window as any).IS_LAB ? "/lab/logo.svg" : "/logo.svg"} 
              alt="Logo" 
              className="w-10 h-10 rounded-lg shadow-lg group-hover:scale-105 transition-transform"
            />
            <span className="font-display font-bold text-xl tracking-wide" style={{ color: 'var(--fg)' }}>
              {settings.site_title.split('|')[0].trim().toUpperCase()}
            </span>
          </a>

          {/* Right Section */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Mobile Search Toggle */}
            {currentPage === 'home' && (
              <button 
                className="p-2 rounded-lg md:hidden transition-colors flex-shrink-0" 
                style={{ color: 'var(--fg-muted)' }}
                onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              >
                {mobileSearchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
              </button>
            )}
            
            {/* Search - Desktop */}
            {currentPage === 'home' && (
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--fg-muted)' }} />
                <input
                  type="text"
                  placeholder="Search games..."
                  className="pl-10 pr-4 py-2 rounded-lg text-sm w-48 lg:w-64 transition-all focus:ring-2 focus:ring-emerald-500 outline-none"
                  style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--fg)' }}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            )}
            
            {/* Theme Toggle */}
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg transition-colors flex-shrink-0"
              style={{ color: 'var(--fg-muted)' }}
              title="Toggle theme"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {user ? (
              <div className="flex items-center gap-2">
                {user.role === 'admin' && (
                  <button 
                    onClick={() => setCurrentPage('admin')}
                    className={`p-2 rounded-lg transition-colors flex-shrink-0`}
                    style={{ 
                      background: currentPage === 'admin' ? 'var(--accent)' : 'transparent',
                      color: currentPage === 'admin' ? 'var(--bg)' : 'var(--fg-muted)'
                    }}
                    title="Admin Panel"
                  >
                    <LayoutDashboard className="w-5 h-5" />
                  </button>
                )}
                <div className="flex items-center gap-2 pl-2 border-l" style={{ borderColor: 'var(--border)' }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'var(--card)' }}>
                    <UserIcon className="w-4 h-4" style={{ color: 'var(--fg-muted)' }} />
                  </div>
                  <span className="text-sm font-medium hidden lg:block" style={{ color: 'var(--fg)' }}>{user.name || user.username}</span>
                  <button 
                    onClick={onLogout}
                    className="p-2 rounded-lg transition-colors hover:text-red-400 flex-shrink-0"
                    style={{ color: 'var(--fg-muted)' }}
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={onOpenAuth}
                className="btn-primary flex items-center gap-2 py-2 px-4 text-sm flex-shrink-0"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}
          </div>
        </div>
        
        {/* Mobile Search Input */}
        {currentPage === 'home' && mobileSearchOpen && (
          <div className="md:hidden pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--fg-muted)' }} />
              <input
                type="text"
                placeholder="Search games..."
                className="w-full pl-10 pr-4 py-2 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--fg)' }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
