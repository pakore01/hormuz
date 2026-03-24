/* ═══════════════════════════════════════════════
   app.js — Router principal, init, sidebar, crisis counter
   Hormuz Intelligence Platform v9
═══════════════════════════════════════════════ */
'use strict';

var currentCentro = 'operaciones';
var sidebarOpen   = false;

var CENTRO_CONFIG = [
  { id:'operaciones',  label:'Operaciones',     icon:'🗺️',  desc:'Mapa y barcos en tiempo real' },
  { id:'crisis',       label:'Crisis',          icon:'🌡️',  desc:'Tensión, noticias, timeline' },
  { id:'energia',      label:'Energía',         icon:'⚡',  desc:'Combustibles, luz, flujos' },
  { id:'mercados',     label:'Mercados',        icon:'📈',  desc:'Brent, divisas, gas, reservas' },
  { id:'inteligencia', label:'Inteligencia IA', icon:'🤖',  desc:'Chat, predicción, informes' },
  { id:'admin',        label:'Admin',           icon:'⚙️',  desc:'Configuración del sistema' }
];

/* ── HEADER DATE ── */
function updHdr(){
  var el = document.getElementById('topbar-date');
  if(el) el.textContent = new Date().toLocaleDateString('es-ES',{day:'2-digit',month:'short',year:'numeric'})+' '+new Date().toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'});
}
updHdr(); setInterval(updHdr,30000);

/* ── CRISIS COUNTER ── */
function updateCrisisCounter(){
  var diff = new Date() - CRISIS_START;
  var days = Math.floor(diff/(1000*60*60*24));
  var h    = Math.floor((diff%(1000*60*60*24))/(1000*60*60));
  var m    = Math.floor((diff%(1000*60*60))/(1000*60));
  var s    = Math.floor((diff%(1000*60))/1000);
  var ed = document.getElementById('sc-days'); if(ed) ed.textContent = days;
  var et = document.getElementById('sc-time'); if(et) et.textContent = String(h).padStart(2,'0')+':'+String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');
  var ppd = document.getElementById('pp-days'); if(ppd) ppd.textContent = days;
}
setInterval(updateCrisisCounter,1000);

/* ── BUILD SIDEBAR ── */
function buildSidebar(){
  var nav = document.getElementById('sidebar-nav');
  if(!nav) return;
  var html = '';
  for(var i=0;i<CENTRO_CONFIG.length;i++){
    var c = CENTRO_CONFIG[i];
    if(c.id==='admin' && (!currentUser || currentUser.role!=='admin')) continue;
    if(!canAccess(c.id)) continue;
    var isAdmin = c.id==='admin';
    html += '<button class="nav-item'+(isAdmin?' nav-item-admin':'')+(currentCentro===c.id?' active':'')+'" onclick="navTo(\''+c.id+'\')" data-centro="'+c.id+'">'+
      '<span class="nav-icon">'+c.icon+'</span>'+
      '<span class="nav-label">'+c.label+'</span>'+
    '</button>';
  }
  nav.innerHTML = html;

  /* User info */
  var uname = document.getElementById('sb-uname');
  var urole  = document.getElementById('sb-urole');
  var uav    = document.getElementById('sb-av');
  if(currentUser){
    if(uname) uname.textContent = currentUser.name;
    if(urole) urole.textContent = currentUser.role;
    if(uav)   uav.textContent   = currentUser.role==='admin'?'A':'N';
    var loginBtn = document.getElementById('admin-login-btn');
    if(loginBtn) loginBtn.style.display='none';
    var userBox = document.getElementById('sidebar-user');
    if(userBox) userBox.style.display='flex';
    var logoutBtn = document.getElementById('sb-logout');
    if(logoutBtn) logoutBtn.style.display='flex';
  } else {
    var loginBtn2 = document.getElementById('admin-login-btn');
    if(loginBtn2) loginBtn2.style.display='block';
    var userBox2 = document.getElementById('sidebar-user');
    if(userBox2) userBox2.style.display='none';
    var logoutBtn2 = document.getElementById('sb-logout');
    if(logoutBtn2) logoutBtn2.style.display='none';
  }

  /* Bottom nav */
  buildBottomNav();
}

function buildBottomNav(){
  var bn = document.getElementById('bottom-nav');
  if(!bn) return;
  var visible = CENTRO_CONFIG.filter(function(c){
    if(c.id==='admin' && (!currentUser||currentUser.role!=='admin')) return false;
    return canAccess(c.id);
  });
  var main = visible.slice(0,4);
  var html = '';
  for(var i=0;i<main.length;i++){
    var c = main[i];
    html += '<button class="bnav-btn'+(currentCentro===c.id?' active':'')+'" data-centro="'+c.id+'" onclick="navTo(\''+c.id+'\')">'+
      '<span class="bnav-icon">'+c.icon+'</span>'+
      '<span class="bnav-lbl">'+c.label+'</span>'+
    '</button>';
  }
  html += '<button class="bnav-more" onclick="toggleSidebar()"><span class="bnav-icon">☰</span><span class="bnav-lbl">Más</span></button>';
  bn.innerHTML = html;
}

/* ── NAVIGATION ── */
function navTo(centroId){
  if(!canAccess(centroId) && centroId!=='admin') return;
  currentCentro = centroId;

  /* Update panels */
  document.querySelectorAll('.centro').forEach(function(p){ p.classList.remove('active'); });
  var panel = document.getElementById('centro-'+centroId);
  if(panel) panel.classList.add('active');

  /* Update sidebar */
  document.querySelectorAll('.nav-item').forEach(function(b){ b.classList.remove('active'); });
  var navBtn = document.querySelector('.nav-item[data-centro="'+centroId+'"]');
  if(navBtn) navBtn.classList.add('active');

  /* Update bottom nav */
  document.querySelectorAll('.bnav-btn').forEach(function(b){ b.classList.remove('active'); });
  var bnBtn = document.querySelector('.bnav-btn[data-centro="'+centroId+'"]');
  if(bnBtn) bnBtn.classList.add('active');

  /* Update topbar title */
  var cfg = CENTRO_CONFIG.find(function(c){ return c.id===centroId; });
  if(cfg){
    var tt = document.getElementById('topbar-title');
    if(tt) tt.textContent = cfg.icon+' '+cfg.label;
  }

  /* Init centro */
  closeSidebar();
  setTimeout(function(){ initCentro(centroId); }, 50);
  if(currentUser) auditLog('CENTRO',centroId,'nav');
}

function initCentro(id){
  if(id==='operaciones')  { initOperaciones(); }
  if(id==='crisis')       { initCrisis(); initCharts(); }
  if(id==='energia')      { initEnergia(); initCharts(); }
  if(id==='mercados')     { initMercados(); }
  if(id==='inteligencia') { initInteligencia(); }
  if(id==='admin')        {
    renderAdminModules();
    var fb = document.querySelector('[data-adm-sec="modules"]');
    if(fb) showAdminSection('modules',fb);
  }
}

/* ── SIDEBAR TOGGLE ── */
function toggleSidebar(){
  sidebarOpen = !sidebarOpen;
  var sb  = document.getElementById('sidebar');
  var ov  = document.getElementById('mob-overlay');
  if(sb)  sb.classList.toggle('open', sidebarOpen);
  if(ov)  ov.classList.toggle('show', sidebarOpen);
}
function closeSidebar(){
  sidebarOpen = false;
  var sb = document.getElementById('sidebar');
  var ov = document.getElementById('mob-overlay');
  if(sb) sb.classList.remove('open');
  if(ov) ov.classList.remove('show');
}

/* ── PRESENTATION ── */
function enterPres(){
  var o = document.getElementById('pres-overlay');
  if(!o) return;
  o.classList.add('active');
  document.getElementById('pts').textContent = new Date().toLocaleString('es-ES');
  document.getElementById('pp-date').textContent = new Date().toLocaleDateString('es-ES',{day:'2-digit',month:'long',year:'numeric'});
  document.getElementById('pp-ships').textContent = '~'+STATE.ships;
  document.getElementById('pp-brent').textContent = '$'+STATE.brent.toFixed(1);
  document.getElementById('pp-attacks').textContent = STATE.attacks;
  var ti = calcTension();
  document.getElementById('pp-tens').textContent = ti;
  document.getElementById('pp-bar').style.width = ti+'%';
  if(document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(function(){});
}
function exitPres(){
  var o = document.getElementById('pres-overlay'); if(o) o.classList.remove('active');
  if(document.exitFullscreen) document.exitFullscreen().catch(function(){});
}
document.addEventListener('keydown',function(e){ if(e.key==='Escape') exitPres(); });

/* ── APPLY UI UPDATES ── */
function applyUI(changes,isAI,isAlert){
  function flash(id){ var b=document.getElementById(id); if(!b)return; var bx=b.closest?b.closest('.stat-box'):null; if(!bx)return; bx.classList.remove('flash'); requestAnimationFrame(function(){bx.classList.add('flash');}); }
  var bc = STATE.brent-PREV.brent;
  var sb = document.getElementById('s-brent'); if(sb) sb.innerHTML='$'+STATE.brent.toFixed(1)+'<span class="stat-chg '+(bc>0?'up':'dn')+'">'+(bc>0?'+':'')+bc.toFixed(1)+'</span>'; flash('s-brent');
  var ss = document.getElementById('s-ships'); if(ss) ss.textContent='~'+STATE.ships; flash('s-ships');
  var sa = document.getElementById('s-attacks'); if(sa) sa.textContent=STATE.attacks; flash('s-attacks');
  var st = document.getElementById('s-transit'); if(st) st.textContent=STATE.transits; flash('s-transit');
  var sr = document.getElementById('s-ree'); if(sr) sr.textContent=STATE.tensionIndex+'/100';
  updateTensionUI(); calcAllFuel();
  addLog(isAlert?'alert':isAI?'ai':'auto',changes.length?changes.join(' / '):'Sin cambios',isAI?'Claude AI':'Simulacion');
}

/* ── SHOW ALERT ── */
function showAlert(msg){
  var ab = document.getElementById('alert-bar');
  var am = document.getElementById('alert-msg');
  if(ab&&am){ am.textContent=msg; ab.classList.add('show'); setTimeout(function(){ab.classList.remove('show');},12000); }
}

/* ── BUILD TICKER ── */
function buildTicker(){
  var tw = document.getElementById('ticker-inner'); if(!tw) return;
  var html='';
  for(var i=0;i<NEWS.length;i++){ html+='<span class="ti"><span class="tidot"></span>'+san(NEWS[i].title)+'</span>'; }
  tw.innerHTML = html+html;
}

/* ── ADMIN AUTH OVERRIDES ── */
doLogin = function(){
  var u=(document.getElementById('lu').value||'').trim().toLowerCase();
  var p=document.getElementById('lp').value||'';
  var err=document.getElementById('lerr');
  var users=getUsers();
  if(!users[u]||users[u].pass!==p){
    err.textContent='Credenciales incorrectas';
    document.getElementById('lp').value='';
    setTimeout(function(){err.textContent='';},3000);
    return;
  }
  currentUser={username:u,role:users[u].role,name:users[u].name};
  isPublicMode=false;
  document.getElementById('login-screen').style.display='none';
  document.getElementById('app').style.display='block';
  document.body.className='role-'+currentUser.role;
  try{sessionStorage.setItem('hip9s',enc(JSON.stringify({u:u})));}catch(e){}
  auditLog('LOGIN','Acceso al sistema','—');
  buildSidebar();
  navTo(currentCentro);
};

doLogout = function(){
  auditLog('LOGOUT','Sesion cerrada','—');
  currentUser=null; isPublicMode=true;
  try{sessionStorage.removeItem('hip9s');}catch(e){}
  document.body.className='role-viewer public-mode';
  buildSidebar();
};

function showAdminLogin(){
  document.getElementById('app').style.display='none';
  document.getElementById('login-screen').style.display='flex';
  var lb = document.getElementById('lback'); if(lb) lb.style.display='block';
}
function backToPublic(){
  document.getElementById('login-screen').style.display='none';
  document.getElementById('app').style.display='block';
}

/* ── MAIN INIT ── */
function initApp(){
  var savedNext = loadState();
  applyUI([],false,false);
  calcAllFuel(); updateTensionUI();
  buildTicker(); buildSidebar();
  startAllWorkers();
  requestNotifPermission();
  var now2=Date.now();
  if(!savedNext||now2>=savedNext.getTime()){
    nextAt=new Date(now2+UPD_MS);
    setTimeout(function(){ triggerUpdate(false); },2500);
  }else{
    nextAt=savedNext;
    addLog('auto','Estado cargado','localStorage');
  }
  startCD();
  /* Navigate to first available centro */
  navTo(currentCentro);
}

/* ── BOOTSTRAP ── */
(function(){
  applyTheme(localStorage.getItem('hip9_theme')||'dark');

  /* Restore admin session */
  var restored=false;
  try{
    var s=sessionStorage.getItem('hip9s');
    if(s){
      var o=JSON.parse(dec(s));
      var users=getUsers(); var u=users[o.u];
      if(u){
        currentUser={username:o.u,role:u.role,name:u.name};
        isPublicMode=false;
        document.getElementById('login-screen').style.display='none';
        document.getElementById('app').style.display='block';
        document.body.className='role-'+u.role;
        restored=true;
        initApp();
      }
    }
  }catch(e){}

  if(!restored){
    /* Public mode */
    document.getElementById('login-screen').style.display='none';
    document.getElementById('app').style.display='block';
    document.body.className='role-viewer public-mode';
    currentUser=null; isPublicMode=true;
    initApp();
  }

  registerSW();
})();
