/**
 * Auth Middleware
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const JWT_SECRET = process.env.JWT_SECRET || 'aurazen_super_secret_2026';

async function authMiddleware(req, res, next) {
  try {
    const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ success: false, message: 'No token provided' });
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ success: false, message: 'User not found' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
}

function adminMiddleware(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin access required' });
  next();
}

function labAccessMiddleware(req, res, next) {
  if (req.path.startsWith('/lab') || req.path === '/lab') {
    if (req.cookies?.lab_access !== 'granted') {
      if (req.method === 'GET') return res.send(getLabLoginHTML());
      return res.status(401).json({ success: false, message: 'Lab access required' });
    }
  }
  next();
}

function getLabLoginHTML() {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>Lab Access</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,sans-serif;background:#0f0f23;min-height:100vh;display:flex;align-items:center;justify-content:center;color:#fff}
.box{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:20px;padding:40px;width:90%;max-width:400px;text-align:center}
h1{font-size:24px;margin-bottom:8px;background:linear-gradient(135deg,#ff6b6b,#ffa502);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.sub{color:#888;margin-bottom:30px;font-size:14px}
input{width:100%;padding:14px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);border-radius:12px;color:#fff;font-size:16px;margin-bottom:20px}
input:focus{outline:none;border-color:#ff6b6b}
button{width:100%;padding:14px;background:linear-gradient(135deg,#ff6b6b,#ee5a24);border:none;border-radius:12px;color:#fff;font-size:16px;font-weight:600;cursor:pointer}
button:disabled{opacity:0.6;cursor:wait}
.err{color:#ff5252;font-size:14px;margin-bottom:15px;display:none}
a{color:#888;text-decoration:none;font-size:13px;margin-top:20px;display:block}
</style>
</head>
<body>
<div class="box">
<div style="width:60px;height:60px;background:linear-gradient(135deg,#ff6b6b,#ee5a24);border-radius:15px;display:flex;align-items:center;justify-content:center;margin:0 auto 20px;font-size:28px">🔬</div>
<h1>Lab Access</h1>
<p class="sub">Development Environment</p>
<div class="err" id="e"></div>
<input type="password" id="p" placeholder="Enter password" autocomplete="off" autofocus>
<button id="b">Access Lab</button>
<a href="/">← Back to Main Site</a>
</div>
<script>
(function(){
  var p=document.getElementById('p'),b=document.getElementById('b'),e=document.getElementById('e');
  
  function go(){
    // Langsung baca nilai dari input
    var v=p.value;
    if(!v){e.textContent='Enter password';e.style.display='block';p.focus();return}
    b.disabled=true;b.textContent='Verifying...';e.style.display='none';
    var x=new XMLHttpRequest();
    x.open('POST','/api/lab/verify',true);
    x.setRequestHeader('Content-Type','application/json');
    x.onload=function(){
      var d=JSON.parse(x.responseText);
      if(d.success){b.textContent='OK!';location.reload()}
      else{e.textContent=d.message||'Wrong';e.style.display='block';b.disabled=false;b.textContent='Access Lab';p.value='';p.focus()}
    };
    x.onerror=function(){e.textContent='Error';e.style.display='block';b.disabled=false;b.textContent='Access Lab'};
    x.send(JSON.stringify({password:v}));
  }
  
  b.onclick=go;
  
  // Enter key langsung submit
  p.onkeydown=function(k){
    if(k.key==='Enter'){
      k.preventDefault();
      // Beri sedikit delay untuk memastikan input selesai
      setTimeout(go,10);
    }
  };
  
  p.focus();
})();
</script>
</body>
</html>`;
}

module.exports = { authMiddleware, adminMiddleware, labAccessMiddleware, getLabLoginHTML };
