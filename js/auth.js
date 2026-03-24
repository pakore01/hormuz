/* ═══════════════════════════════════════════════
   auth.js — Login, roles, sesión, audit log
═══════════════════════════════════════════════ */
'use strict';

var currentUser = null;
var isPublicMode = true;
var AUDIT_LOG = [];

/* Login clock */
setInterval(function(){
  var el=document.getElementById('ls-clk');
  if(el) el.textContent=new Date().toLocaleTimeString('es-ES');
},1000);

function canAccess(tab){
  var role = currentUser ? currentUser.role : 'viewer';
  return (PERMS[role]||[]).indexOf(tab) !== -1;
}

function auditLog(action,detail,module){
  var entry={ts:new Date().toISOString(),user:currentUser?currentUser.username:'anon',role:currentUser?currentUser.role:'—',action:action,detail:detail,module:module||'—'};
  AUDIT_LOG.unshift(entry);
  if(AUDIT_LOG.length>200) AUDIT_LOG.pop();
  var stored=lsGet('hip9_audit')||[];
  stored.unshift(entry);
  lsSet('hip9_audit',stored.slice(0,200));
}

function initPublicMode(){
  document.getElementById('login-screen').style.display='none';
  document.getElementById('app').style.display='block';
  document.body.className='role-viewer public-mode';
  currentUser=null; isPublicMode=true;
  var hint=document.getElementById('admin-hint');
  if(hint) hint.style.display='flex';
  initApp();
}

function showAdminLogin(){
  document.getElementById('app').style.display='none';
  document.getElementById('login-screen').style.display='flex';
  var btn=document.getElementById('login-back-btn');
  if(btn) btn.style.display='block';
}

function backToPublic(){
  document.getElementById('login-screen').style.display='none';
  document.getElementById('app').style.display='block';
}

function doLogin(){
  var u=(document.getElementById('lu').value||'').trim().toLowerCase();
  var p=document.getElementById('lp').value||'';
  var err=document.getElementById('lerr');
  var users=getUsers();
  if(!users[u]||users[u].pass!==p){
    err.textContent='Credenciales incorrectas';
    document.getElementById('lp').value='';
    setTimeout(function(){err.textContent='';},3000);
    auditLog('LOGIN_FAIL','Intento fallido: '+u,'—');
    return;
  }
  currentUser={username:u,role:users[u].role,name:users[u].name};
  isPublicMode=false;
  document.getElementById('login-screen').style.display='none';
  document.getElementById('app').style.display='block';
  document.body.className='role-'+currentUser.role;
  document.getElementById('ub-name').textContent=currentUser.name;
  var roleEl=document.getElementById('ub-role');
  var rnames={admin:'Admin',analyst:'Analista',viewer:'Viewer'};
  roleEl.textContent=rnames[currentUser.role]||currentUser.role;
  roleEl.className='ub-role role-'+currentUser.role;
  document.getElementById('ub-av').textContent=currentUser.role==='admin'?'A':currentUser.role==='analyst'?'N':'V';
  var hint=document.getElementById('admin-hint');
  if(hint) hint.style.display='none';
  var ub=document.getElementById('user-badge');
  if(ub) ub.style.display='flex';
  var lb=document.getElementById('logout-btn');
  if(lb) lb.style.display='block';
  try{sessionStorage.setItem('hip9s',enc(JSON.stringify({u:u})));}catch(e){}
  auditLog('LOGIN','Acceso al sistema','—');
  buildTabs();
}

function doLogout(){
  auditLog('LOGOUT','Sesion cerrada','—');
  currentUser=null; isPublicMode=true;
  try{sessionStorage.removeItem('hip9s');}catch(e){}
  document.body.className='role-viewer public-mode';
  var hint=document.getElementById('admin-hint');
  if(hint) hint.style.display='flex';
  var ub=document.getElementById('user-badge');
  if(ub) ub.style.display='none';
  var lb=document.getElementById('logout-btn');
  if(lb) lb.style.display='none';
  buildTabs();
}

document.getElementById('lu').addEventListener('keydown',function(e){if(e.key==='Enter')document.getElementById('lp').focus();});
document.getElementById('lp').addEventListener('keydown',function(e){if(e.key==='Enter')doLogin();});
