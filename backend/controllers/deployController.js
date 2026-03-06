/**
 * Deploy Controller
 * Handles deployment from lab to production
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

const ROOT_DIR = '/home/aurazenm/game';
const BACKUP_DIR = path.join(ROOT_DIR, 'backups');
const LAB_DIST = path.join(ROOT_DIR, 'lab-dist');
const PROD_DIST = path.join(ROOT_DIR, 'dist');
const CHANGELOG_FILE = path.join(ROOT_DIR, 'changelog.json');
const LAST_DEPLOY_FILE = path.join(ROOT_DIR, '.last_deploy');
const INDEX_DEV = path.join(ROOT_DIR, 'index.dev.html');
const INDEX_HTML = path.join(ROOT_DIR, 'index.html');

// Ensure backup directory exists
function ensureBackupDir() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
}

// Get changelog history
function getChangelogHistory() {
  try {
    if (fs.existsSync(CHANGELOG_FILE)) {
      const content = fs.readFileSync(CHANGELOG_FILE, 'utf-8');
      const data = JSON.parse(content);
      if (Array.isArray(data)) {
        return data;
      } else if (data && Array.isArray(data.entries)) {
        const convertedHistory = data.entries.map((entry, index) => ({
          id: entry.timestamp || Date.now().toString() + '-' + index,
          timestamp: entry.timestamp,
          changelog: Array.isArray(entry.changes) ? entry.changes.join('\n') : (entry.changelog || 'No changelog'),
          status: 'success',
          backupPath: entry.backupName ? path.join(BACKUP_DIR, entry.backupName) : null
        }));
        saveChangelog(convertedHistory);
        return convertedHistory;
      }
      return [];
    }
  } catch (err) {
    console.error('Error reading changelog:', err);
  }
  return [];
}

// Save changelog
function saveChangelog(history) {
  fs.writeFileSync(CHANGELOG_FILE, JSON.stringify(history, null, 2));
}

// Calculate directory hash for comparison
function getDirectoryHash(dirPath) {
  if (!fs.existsSync(dirPath)) return null;
  
  const files = [];
  
  function scanDir(dir) {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        scanDir(fullPath);
      } else {
        const content = fs.readFileSync(fullPath);
        const hash = crypto.createHash('md5').update(content).digest('hex');
        files.push({ path: fullPath.replace(dirPath, ''), hash, size: stat.size });
      }
    }
  }
  
  scanDir(dirPath);
  return files;
}

// Detect changes between lab and production
function detectChanges() {
  const changes = {
    added: [],
    modified: [],
    deleted: [],
    totalFiles: 0,
    totalSize: 0
  };
  
  try {
    const labFiles = getDirectoryHash(LAB_DIST);
    const prodFiles = getDirectoryHash(PROD_DIST);
    
    if (!labFiles || labFiles.length === 0) {
      return changes;
    }
    
    changes.totalFiles = labFiles.length;
    changes.totalSize = labFiles.reduce((sum, f) => sum + f.size, 0);
    
    const labMap = new Map(labFiles.map(f => [f.path, f]));
    const prodMap = new Map((prodFiles || []).map(f => [f.path, f]));
    
    for (const [path, labFile] of labMap) {
      const prodFile = prodMap.get(path);
      if (!prodFile) {
        changes.added.push(path);
      } else if (labFile.hash !== prodFile.hash) {
        changes.modified.push(path);
      }
    }
    
    for (const [path] of prodMap) {
      if (!labMap.has(path)) {
        changes.deleted.push(path);
      }
    }
    
  } catch (err) {
    console.error('Error detecting changes:', err);
  }
  
  return changes;
}

// Generate auto changelog
function generateAutoChangelog() {
  const changes = detectChanges();
  const lines = [];
  
  lines.push(`Deploy - ${new Date().toLocaleString('id-ID')}`);
  lines.push('');
  
  if (changes.added.length > 0) {
    lines.push(`File baru: ${changes.added.length} file`);
  }
  
  if (changes.modified.length > 0) {
    lines.push(`File diubah: ${changes.modified.length} file`);
  }
  
  if (changes.deleted.length > 0) {
    lines.push(`File dihapus: ${changes.deleted.length} file`);
  }
  
  lines.push('');
  lines.push(`Total: ${changes.totalFiles} file (${(changes.totalSize / 1024 / 1024).toFixed(2)} MB)`);
  
  return lines.join('\n');
}

// Check if there are changes between lab and production
async function checkForChanges(req, res) {
  try {
    const changes = detectChanges();
    const hasChanges = changes.added.length > 0 || changes.modified.length > 0 || changes.deleted.length > 0;
    
    const formatFiles = (files) => files.map(f => f.replace(/^\/assets\//, '')).slice(0, 10);
    
    res.json({ 
      success: true, 
      hasChanges,
      changes: {
        added: changes.added.length,
        modified: changes.modified.length,
        deleted: changes.deleted.length,
        totalFiles: changes.totalFiles,
        addedFiles: formatFiles(changes.added),
        modifiedFiles: formatFiles(changes.modified),
        deletedFiles: formatFiles(changes.deleted)
      },
      changelog: generateAutoChangelog()
    });
  } catch (err) {
    console.error('Check changes error:', err);
    res.json({ success: true, hasChanges: true });
  }
}

// Get auto-generated changelog
async function getAutoChangelog(req, res) {
  try {
    const changelog = generateAutoChangelog();
    res.json({
      success: true,
      changelog
    });
  } catch (err) {
    console.error('Get auto changelog error:', err);
    res.json({
      success: true,
      changelog: 'Deploy update - ' + new Date().toLocaleString('id-ID')
    });
  }
}

// Deploy to production - BUILD production version
async function deployToProduction(req, res) {
  try {
    const changelog = generateAutoChangelog();
    
    ensureBackupDir();
    
    // Create backup of current production
    const timestamp = Date.now();
    const backupName = `backup-${timestamp}`;
    const backupPath = path.join(BACKUP_DIR, backupName);
    
    if (fs.existsSync(PROD_DIST)) {
      fs.mkdirSync(backupPath, { recursive: true });
      
      const files = fs.readdirSync(PROD_DIST);
      for (const file of files) {
        const src = path.join(PROD_DIST, file);
        const dest = path.join(backupPath, file);
        
        if (fs.statSync(src).isDirectory()) {
          fs.mkdirSync(dest, { recursive: true });
          const subFiles = fs.readdirSync(src);
          for (const subFile of subFiles) {
            fs.copyFileSync(path.join(src, subFile), path.join(dest, subFile));
          }
        } else {
          fs.copyFileSync(src, dest);
        }
      }
    }
    
    // BUILD PRODUCTION
    // Copy index.dev.html to index.html temporarily for build
    if (fs.existsSync(INDEX_DEV)) {
      fs.copyFileSync(INDEX_DEV, INDEX_HTML);
    } else {
      throw new Error('index.dev.html tidak ditemukan');
    }
    
    console.log('Building production...');
    try {
      execSync('source /home/aurazenm/nodevenv/game/22/bin/activate && npm run build', {
        cwd: ROOT_DIR,
        stdio: 'inherit',
        env: { ...process.env, PATH: '/home/aurazenm/nodevenv/game/22/bin:' + process.env.PATH }
      });
      console.log('Production build complete');
    } catch (buildErr) {
      console.error('Build error:', buildErr);
      // Remove temporary index.html
      if (fs.existsSync(INDEX_HTML)) {
        fs.unlinkSync(INDEX_HTML);
      }
      // Restore from backup
      if (fs.existsSync(backupPath)) {
        const files = fs.readdirSync(PROD_DIST);
        for (const file of files) {
          const filePath = path.join(PROD_DIST, file);
          if (fs.statSync(filePath).isDirectory()) {
            fs.rmSync(filePath, { recursive: true });
          } else {
            fs.unlinkSync(filePath);
          }
        }
        const backupFiles = fs.readdirSync(backupPath);
        for (const file of backupFiles) {
          const src = path.join(backupPath, file);
          const dest = path.join(PROD_DIST, file);
          if (fs.statSync(src).isDirectory()) {
            fs.mkdirSync(dest, { recursive: true });
            const subFiles = fs.readdirSync(src);
            for (const subFile of subFiles) {
              fs.copyFileSync(path.join(src, subFile), path.join(dest, subFile));
            }
          } else {
            fs.copyFileSync(src, dest);
          }
        }
      }
      throw new Error('Build gagal: ' + buildErr.message);
    }
    
    // Remove temporary index.html after successful build
    if (fs.existsSync(INDEX_HTML)) {
      fs.unlinkSync(INDEX_HTML);
    }
    
    // Save changelog
    const history = getChangelogHistory();
    history.unshift({
      id: timestamp.toString(),
      timestamp: new Date().toISOString(),
      changelog,
      status: 'success',
      backupPath
    });
    
    if (history.length > 20) {
      history.pop();
    }
    
    saveChangelog(history);
    
    // Update last deploy time
    fs.writeFileSync(LAST_DEPLOY_FILE, timestamp.toString());
    
    // Restart server (touch restart file for Passenger)
    const restartFile = '/home/aurazenm/tmp/restart.txt';
    fs.writeFileSync(restartFile, timestamp.toString());
    
    res.json({
      success: true,
      message: 'Deploy berhasil! Production sudah diupdate.',
      backupPath,
      changelog
    });
    
  } catch (err) {
    console.error('Deploy error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Gagal melakukan deploy'
    });
  }
}

// Rollback to previous version
async function rollback(req, res) {
  try {
    const history = getChangelogHistory();
    
    const lastDeploy = history.find(h => h.status === 'success');
    
    if (!lastDeploy || !lastDeploy.backupPath || !fs.existsSync(lastDeploy.backupPath)) {
      return res.status(400).json({
        success: false,
        message: 'Tidak ada backup yang bisa di-rollback'
      });
    }
    
    // Copy backup to dist
    if (fs.existsSync(PROD_DIST)) {
      const files = fs.readdirSync(PROD_DIST);
      for (const file of files) {
        const filePath = path.join(PROD_DIST, file);
        if (fs.statSync(filePath).isDirectory()) {
          fs.rmSync(filePath, { recursive: true });
        } else {
          fs.unlinkSync(filePath);
        }
      }
    } else {
      fs.mkdirSync(PROD_DIST, { recursive: true });
    }
    
    const backupFiles = fs.readdirSync(lastDeploy.backupPath);
    for (const file of backupFiles) {
      const src = path.join(lastDeploy.backupPath, file);
      const dest = path.join(PROD_DIST, file);
      
      if (fs.statSync(src).isDirectory()) {
        fs.mkdirSync(dest, { recursive: true });
        const subFiles = fs.readdirSync(src);
        for (const subFile of subFiles) {
          fs.copyFileSync(path.join(src, subFile), path.join(dest, subFile));
        }
      } else {
        fs.copyFileSync(src, dest);
      }
    }
    
    const deployIndex = history.findIndex(h => h.id === lastDeploy.id);
    if (deployIndex !== -1) {
      history[deployIndex].status = 'rolled_back';
      history[deployIndex].rolledBackAt = new Date().toISOString();
      saveChangelog(history);
    }
    
    const restartFile = '/home/aurazenm/tmp/restart.txt';
    fs.writeFileSync(restartFile, Date.now().toString());
    
    res.json({
      success: true,
      message: 'Rollback berhasil! Production sudah dikembalikan ke versi sebelumnya.'
    });
    
  } catch (err) {
    console.error('Rollback error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Gagal melakukan rollback'
    });
  }
}

// Get deploy history
async function getHistory(req, res) {
  try {
    const history = getChangelogHistory();
    res.json({
      success: true,
      history
    });
  } catch (err) {
    console.error('Get history error:', err);
    res.json({
      success: true,
      history: []
    });
  }
}

module.exports = {
  checkForChanges,
  getAutoChangelog,
  deployToProduction,
  rollback,
  getHistory
};
