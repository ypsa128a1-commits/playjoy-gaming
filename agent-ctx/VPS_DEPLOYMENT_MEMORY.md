# VPS Project Memory - playjoy.id

## Project Status (Updated: 2026-03-06)

### Source
- **Original Location**: Shared Hosting `/home/aurazenm/game`
- **VPS Location**: `/var/www/playjoy.id`

### Project Type
- **Framework**: Express.js + Vite (React frontend)
- **Language**: JavaScript (ES Module)
- **Styling**: Tailwind CSS v4
- **Database**: MySQL (aurazenm_db)
- **Auth**: JWT + bcryptjs

### Deployment Status
- ✅ Files copied from shared hosting to VPS
- ✅ npm dependencies installed (partial - key packages)
- ✅ Database imported (11 tables: games, users, settings, etc.)
- ✅ Running on port 3001 with PM2

### Database
- **Type**: MySQL/MariaDB
- **Name**: aurazenm_db
- **User**: aurazenm_root
- **Tables**: games, users, game_traffic, gm_links, gm_media, gm_setting, gm_sidebar, gm_sliders, gm_tags, sessions, settings

### Environment Variables
Located at `/var/www/playjoy.id/.env`:
```
DB_HOST=localhost
DB_USER=aurazenm_root
DB_PASSWORD=aurazen2026root
DB_NAME=aurazenm_db
JWT_SECRET=aurazen_super_secret_2026
NODE_ENV=production
```

### Important Notes for Agents
1. This is a gaming hub website with multiple games
2. Uses Express.js backend with React/Vite frontend
3. Entry point: `app.cjs` (CommonJS version for Node.js)
4. Port 3001 (port 3000 used by talithataufiq project)
5. PM2 process name: "playjoy"

### Commands
- Start: `pm2 start app.cjs --name "playjoy"`
- Stop: `pm2 stop playjoy`
- Logs: `pm2 logs playjoy`
- Build frontend: `npm run build` (Vite)

### SSH Access
- Shared Hosting: `ssh aurazenm@36.50.77.52 -p 64000`
- VPS: `ssh root@202.155.18.26`

