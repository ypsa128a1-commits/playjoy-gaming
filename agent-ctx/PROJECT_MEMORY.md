# PROJECT MEMORY - PLAYJOY GAMING PORTAL

> **Last Updated:** 6 Maret 2026
> **Status:** ✅ Next.js Conversion COMPLETE - Site Running

---

## 📁 PROJECT INFO

| Item | Value |
|------|-------|
| **Project Name** | PlayJoy Gaming Portal |
| **Domain** | playjoy.id |
| **Framework** | Next.js 14.2.21 (Converted from Express+Vite) |
| **Database** | MySQL (MariaDB) |
| **Games Count** | 25,995 games |
| **Port** | 3001 |
| **PM2 Process** | playjoy |

---

## ✅ CONVERSION STATUS - COMPLETE

| Task | Status |
|------|--------|
| Database Migration | ✅ Done |
| Admin Password Reset | ✅ Done |
| GitHub Repository | ✅ Created & Pushed |
| Convert to Next.js | ✅ Done |
| API Routes | ✅ Done |
| Frontend Pages | ✅ Basic page done |
| Build | ✅ Done |
| PM2 Running | ✅ Online |

---

## 📂 PROJECT DIRECTORY

```
PROJECT ROOT: /var/www/playjoy.id

/var/www/playjoy.id/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── login/route.ts
│   │   │   │   ├── register/route.ts
│   │   │   │   ├── me/route.ts
│   │   │   │   └── logout/route.ts
│   │   │   ├── games/
│   │   │   │   ├── route.ts
│   │   │   │   ├── homepage/route.ts
│   │   │   │   ├── featured/route.ts
│   │   │   │   ├── popular/route.ts
│   │   │   │   ├── recent/route.ts
│   │   │   │   ├── categories/route.ts
│   │   │   │   └── [id]/route.ts
│   │   │   └── route.ts
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/ (shadcn/ui components)
│   │   ├── AdminPanel.tsx
│   │   ├── AuthModal.tsx
│   │   ├── GameCard.tsx
│   │   ├── GamePlayer.tsx
│   │   ├── GameRow.tsx
│   │   ├── HeroFeatured.tsx
│   │   ├── Navbar.tsx
│   │   └── ...
│   ├── hooks/
│   ├── lib/
│   │   ├── db.ts
│   │   └── utils.ts
│   └── types.ts
├── prisma/
│   └── schema.prisma
├── public/
├── .next/ (build output)
├── package.json
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── .env
```

---

## 🌐 GITHUB REPOSITORY

| Item | Value |
|------|-------|
| **URL** | https://github.com/ypsa128a1-commits/playjoy-gaming |
| **Branch** | main |
| **Status** | ✅ Pushed |

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
mysql -u aurazenm_root -p'aurazen2026root' aurazenm_db
```

---

## 🔐 AUTHENTICATION & ACCESS

### Admin Login
| Item | Value |
|------|-------|
| **Username** | admin@playjoy.id |
| **Password** | aksan128 |
| **Role** | admin |

### JWT Settings
| Item | Value |
|------|-------|
| **Secret** | aurazen_super_secret_2026 |
| **Expiry** | 7 days |

---

## 🚀 PM2 COMMANDS

```bash
pm2 status                # Check status
pm2 logs playjoy          # View logs
pm2 restart playjoy       # Restart app
pm2 stop playjoy          # Stop app
pm2 save                  # Save process list
```

---

## 🌐 ACCESS URLs

| Type | URL |
|------|-----|
| **Local** | http://localhost:3001 |
| **IP Access** | http://202.155.18.26:3001 |
| **Domain** | http://playjoy.id (requires Coolify/Traefik config) |

---

## 🔄 CI/CD SETUP NEEDED

GitHub Actions workflow is ready but needs secrets configured:

### Required GitHub Secrets:
1. `DATABASE_URL` - mysql://aurazenm_root:aurazen2026root@localhost:3306/aurazenm_db
2. `DB_HOST` - localhost
3. `DB_USER` - aurazenm_root
4. `DB_PASSWORD` - aurazen2026root
5. `DB_NAME` - aurazenm_db
6. `JWT_SECRET` - aurazen_super_secret_2026
7. `VPS_HOST` - 202.155.18.26
8. `VPS_SSH_KEY` - SSH private key for VPS access

### Setup Instructions:
1. Go to GitHub repo → Settings → Secrets and variables → Actions
2. Add each secret listed above
3. Push changes to trigger workflow

---

## 📝 NEXT STEPS

1. **Configure Domain in Coolify** - Add playjoy.id to Coolify to route through Traefik
2. **Setup SSL** - Enable HTTPS via Let's Encrypt
3. **Enhance Frontend** - Build full Netflix-style UI with all components
4. **Add Game Detail Page** - Create /game/[id] page
5. **Implement Admin Panel** - Full admin CRUD functionality
6. **Setup GitHub Secrets** - For automated CI/CD

---

## ⚠️ IMPORTANT NOTES

1. **VPS has limited RAM (1GB)** - Build on GitHub Actions, not on VPS
2. **Coolify manages Traefik** - Domain routing needs Coolify configuration
3. **Site accessible via IP:3001** - http://202.155.18.26:3001
