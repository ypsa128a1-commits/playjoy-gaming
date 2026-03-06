# PROJECT MEMORY - PLAYJOY GAMING PORTAL

> **Last Updated:** 6 Maret 2026
> **Status:** Converting from Express+Vite to Next.js

---

## 📁 PROJECT INFO

| Item | Value |
|------|-------|
| **Project Name** | PlayJoy Gaming Portal |
| **Domain** | playjoy.id |
| **Framework** | Express.js + Vite → **CONVERTING TO Next.js 16** |
| **Database** | MySQL (MariaDB) |
| **Games Count** | 25,995 games |

---

## 📂 PROJECT DIRECTORY (THIS VPS)

```
PROJECT ROOT: /var/www/playjoy.id

/var/www/playjoy.id/
├── app.js                    # Express server (CURRENTLY RUNNING)
├── app.cjs                   # CommonJS version
├── backend/
│   ├── app.js               # MVC architecture version
│   ├── config/
│   │   └── database.js      # MySQL connection config
│   ├── controllers/         # Route handlers
│   │   ├── authController.js
│   │   ├── gameController.js
│   │   ├── labController.js
│   │   └── settingController.js
│   ├── middlewares/         # Auth middleware
│   │   └── auth.middleware.js
│   ├── models/              # Data models
│   │   ├── Game.js
│   │   ├── User.js
│   │   └── Setting.js
│   └── routes/              # API routes
│       ├── auth.routes.js
│       ├── game.routes.js
│       └── ...
├── assets/                   # Built frontend (Vite output)
├── public/                   # Static files
├── database_export.sql      # 47MB database dump
├── .env                      # Environment variables
├── package.json
└── agent-ctx/
    └── PROJECT_MEMORY.md    # This file
```

---

## 🌐 GITHUB REPOSITORY

| Item | Value |
|------|-------|
| **URL** | https://github.com/ypsa128a1-commits/playjoy-gaming |
| **Branch** | main |
| **Token** | `GITHUB_TOKEN_REDACTED` |

### Git Setup Commands
```bash
cd /var/www/playjoy.id
git init
git remote add origin https://ypsa128a1-commits:GITHUB_TOKEN_REDACTED@github.com/ypsa128a1-commits/playjoy-gaming.git
```

---

## 🗄️ DATABASE (MySQL/MariaDB)

### Connection Info
| Item | Value |
|------|-------|
| **Host** | localhost |
| **Database** | aurazenm_db |
| **User** | aurazenm_root |
| **Password** | aurazen2026root |

### Connection Commands
```bash
# Connect to database
mysql -u aurazenm_root -p'aurazen2026root' aurazenm_db

# Show tables
mysql -u aurazenm_root -p'aurazen2026root' aurazenm_db -e "SHOW TABLES;"

# Count games
mysql -u aurazenm_root -p'aurazen2026root' aurazenm_db -e "SELECT COUNT(*) as total_games FROM games;"

# Check admin user
mysql -u aurazenm_root -p'aurazen2026root' aurazenm_db -e "SELECT id, username, email, role FROM users WHERE role='admin';"
```

### Tables (11 tables)
| Table | Records |
|-------|---------|
| games | 25,995 |
| users | 1 |
| settings | - |
| game_traffic | - |
| gm_links | - |
| gm_media | - |
| gm_setting | - |
| gm_sidebar | - |
| gm_sliders | - |
| gm_tags | - |
| sessions | - |

---

## 🔐 AUTHENTICATION & ACCESS

### Admin Login
| Item | Value |
|------|-------|
| **Username** | admin@playjoy.id |
| **Password** | aksan128 |
| **Role** | admin |

### Lab Access (Dev Environment)
| Item | Value |
|------|-------|
| **URL** | /lab |
| **Password** | aurazein1997 |

### JWT Settings
| Item | Value |
|------|-------|
| **Secret** | aurazen_super_secret_2026 |
| **Expiry** | 7 days |

---

## 🚀 PM2 CONFIG

| Item | Value |
|------|-------|
| **Process Name** | playjoy |
| **Port** | 3001 |
| **Script** | app.js |
| **Working Directory** | `/var/www/playjoy.id` |

### PM2 Commands
```bash
pm2 status                # Check status
pm2 logs playjoy          # View logs
pm2 restart playjoy       # Restart app
pm2 stop playjoy          # Stop app
```

---

## 🔄 CI/CD FLOW (After Next.js Conversion)

```
┌────────────────────────────────────────────────────────────────┐
│                     THIS VPS (202.155.18.26)                   │
│                                                                │
│  ┌─────────────┐    git push    ┌─────────────────────────┐   │
│  │ Edit Code   │───────────────▶│ GitHub Actions (7GB)    │   │
│  │ /var/www/   │                │ - npm install           │   │
│  │ playjoy.id  │                │ - npm run build         │   │
│  │             │                │ - create standalone     │   │
│  └─────────────┘                └───────────┬─────────────┘   │
│                                             │                  │
│                                             ▼                  │
│                                 ┌─────────────────────────┐   │
│                                 │ Deploy back to this VPS │   │
│                                 │ - SCP files             │   │
│                                 │ - PM2 restart           │   │
│                                 └─────────────────────────┘   │
└────────────────────────────────────────────────────────────────┘
```

---

## 🔌 API ENDPOINTS (to be converted to Next.js)

### Auth API
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login user |
| POST | /api/auth/logout | Logout user |
| GET | /api/auth/me | Get current user |
| PUT | /api/auth/password | Change password |

### Games API
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/games | List games (search/sort/paginate) |
| GET | /api/games/homepage | Homepage data (Netflix style) |
| GET | /api/games/featured | Featured games |
| GET | /api/games/popular | Popular games |
| GET | /api/games/recent | Recent games |
| GET | /api/games/categories | List categories |
| GET | /api/games/[id] | Single game |
| POST | /api/games/[id]/view | Increment views |
| POST | /api/games | Create (admin) |
| PUT | /api/games/[id] | Update (admin) |
| DELETE | /api/games/[id] | Delete (admin) |

### Other API
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/settings | Get settings |
| PUT | /api/settings | Update settings (admin) |
| GET | /api/stats | Statistics |
| GET | /api/health | Health check |
| POST | /api/lab/verify | Lab password verify |

---

## ⚠️ IMPORTANT RULES

1. **JANGAN BUILD DI VPS** - RAM hanya 1GB, build di GitHub Actions
2. **DATABASE READY** - 25,995 games sudah ter-import
3. **ADMIN PASSWORD RESET** - admin@playjoy.id / aksan128
4. **PORT 3001** - Playjoy di port 3001, Talithataufiq di 3000

---

## 📊 CONVERSION STATUS

| Task | Status |
|------|--------|
| Database Migration | ✅ Done |
| Admin Password Reset | ✅ Done |
| GitHub Repository | ✅ Created |
| Convert to Next.js | ⏳ TODO |
| API Routes | ⏳ TODO |
| Frontend Pages | ⏳ TODO |
| GitHub Actions | ⏳ TODO |
| Deploy | ⏳ TODO |

---

## 📝 PROMPT UNTUK MELANJUTKAN (Copy-Paste ke AI)

```
Lanjutkan development project PLAYJOY GAMING PORTAL.

## Project Directory
cd /var/www/playjoy.id

## Info Project
- Framework: Express+Vite → CONVERTING TO Next.js 16
- Database: MySQL aurazenm_db (25,995 games)
- Port: 3001
- PM2 Process: playjoy

## Database MySQL
- Host: localhost
- DB Name: aurazenm_db
- User: aurazenm_root
- Password: aurazen2026root
- Connect: mysql -u aurazenm_root -p'aurazen2026root' aurazenm_db

## Admin Login
- Username: admin@playjoy.id
- Password: aksan128

## Lab Access
- Password: aurazein1997
- URL: /lab

## GitHub
- Repo: https://github.com/ypsa128a1-commits/playjoy-gaming
- Branch: main
- Token: GITHUB_TOKEN_REDACTED

## Development Flow
1. Edit code di /var/www/playjoy.id
2. git add . && git commit -m "pesan" && git push
3. GitHub Actions auto build
4. Auto deploy ke VPS ini
5. PM2 restart playjoy

## Baca Memory File
cat /var/www/playjoy.id/agent-ctx/PROJECT_MEMORY.md

## Task:
[TULISKAN TASK ANDA DI SINI]
```

