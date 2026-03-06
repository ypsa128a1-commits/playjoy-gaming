// ================= USER TYPES =================

export interface User {
  id: number;
  email: string;
  username?: string;
  name: string;
  role: 'admin' | 'user';
  avatar?: string;
  is_active: boolean;
  last_login?: string;
  created_at: string;
  updated_at?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

// ================= GAME TYPES =================

export interface Game {
  id: number;
  title: string;
  slug?: string;
  description?: string;
  url: string;
  iframe_url?: string;
  thumbnail?: string;
  category?: string;
  is_featured?: boolean;
  featured?: number;
  is_active?: boolean;
  views: number;
  play_count?: number;
  meta_title?: string;
  meta_description?: string;
  created_by?: number;
  created_by_name?: string;
  created_at: string;
  updated_at?: string;
}

export interface GameFormData {
  title: string;
  slug?: string;
  description?: string;
  url: string;
  thumbnail?: string;
  category?: string;
  is_featured?: boolean;
  meta_title?: string;
  meta_description?: string;
}

// ================= SETTINGS TYPES =================

export interface Settings {
  site_title: string;
  site_description?: string;
  admin_email?: string;
  google_client_id?: string;
  google_client_secret?: string;
  [key: string]: any;
}

// ================= STATS TYPES =================

export interface Stats {
  totalGames: number;
  totalViews: number;
  totalUsers: number;
  totalPlays?: number;
  activeGames?: number;
  featuredGames?: number;
}

export interface GameStats {
  total: number;
  active: number;
  featured: number;
  totalViews: number;
  totalPlays: number;
  categories?: Category[];
}

export interface TrafficOverview {
  totalPlays: number;
  todayPlays: number;
  uniqueUsers: number;
  avgDuration: number;
}

export interface DailyStat {
  date: string;
  total_plays: number;
  unique_users: number;
  games_played: number;
  avg_duration: number;
}

// ================= TRAFFIC TYPES =================

export interface TrafficRecord {
  id: number;
  game_id: number;
  user_id?: number;
  ip_address?: string;
  play_duration: number;
  created_at: string;
  game_title?: string;
  game_thumbnail?: string;
  user_name?: string;
}

export interface TopGame {
  id: number;
  title: string;
  slug: string;
  thumbnail?: string;
  category?: string;
  play_count: number;
  unique_players: number;
}

// ================= CATEGORY TYPE =================

export interface Category {
  category: string;
  count: number;
}

// ================= CATEGORY WITH GAMES (Netflix-style row) =================

export interface CategoryWithGames {
  category: string;
  count: number;
  games: Game[];
}

// ================= HOMEPAGE DATA =================

export interface HomepageData {
  featured: Game[];
  popular: Game[];
  recent: Game[];
  categories: CategoryWithGames[];
}

// ================= API RESPONSE TYPES =================

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
  pagination?: Pagination;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ================= FORM TYPES =================

export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  password: string;
  name: string;
  username?: string;
}

export interface ChangePasswordForm {
  newPassword: string;
  confirmPassword: string;
  oldPassword?: string;
}

export interface UpdateProfileForm {
  name?: string;
  username?: string;
  avatar?: string;
}
