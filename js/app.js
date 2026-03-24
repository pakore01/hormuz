/* ═══════════════════════════════════════════════
   app.js — Router, sidebar adaptativa, init
   Hormuz Intelligence Platform v9
═══════════════════════════════════════════════ */
'use strict';

var currentTab   = 'map';
var sidebarOpen  = false;
var appReady     = false;

/* TAB ICONS & LABELS */
var TAB_META = {
  map:          {icon:'🗺️',  label:'Mapa Operacional'},
  tension:      {icon:'🌡️',  label:'Índice de Tensión'},
  news:         {icon:'📰',  label:'Noticias'},
  fuel:         {icon:'⛽',  label:'Combustibles'},
  flows:        {icon:'🌊',  label:'Flujos Petróleo'},
  tankers:      {icon:'🚢',  label:'Barcos'},
  charts:       {icon:'📈',  label:'Mercados'},
  chat:         {icon:'💬',  label:'Chat IA'},
  calc:         {icon:'🧮',  label:'Calculadora'},
  prediccion:   {icon:'🤖',  label:'Predicción IA'},
  updates:      {icon:'🔄',  label:'Log Sistema'},
  electricidad: {icon:'⚡',  label:'Red Eléctrica'},
  sie:          {icon:'🔍',  label:'SIE — Intel'},
  admin:        {icon:'⚙️',  label:'Admin'}
};

/* ── THEME SELECTOR ON FIRST LOAD ── */
var themeChosen = localStorage.getItem('hip9_theme');
if(!themeChosen){
  showThemeSelector();
} else {
  applyTheme(themeChosen);
}

function showThemeSelector(){
  var sel = document.getElementById('theme-selector');
  if(sel) sel.style.display = 'flex';
  var app = document.getElementById('app');
  if(app) app.style.display = 'none';
}

function chooseTheme(theme){
  applyTheme(theme);
  var sel = document.getElementById('theme-selector');
  if(sel) sel.style.display = 'none';
  /* Continue with bootstrap */
  bootstrap();
}

/* ── HEADER DATE ── */
function updHdr(){
  var el = document.getElementById('hdr-date');
  if(el) el.textContent = new Date().toLocaleDateString('es-ES',{day:'2-digit',month:'short',year:'numeric'})+' '+new Date().toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'});
}
updHdr(); setInterval(updHdr, 30000);

/* ── CRISIS COUNTER ── */
function updateCrisisCounter(){
  var diff = new Date() - CRISIS_START;
  var days = Math.floor(diff/(864e5));
  var h    = Math.floor((diff%864e5)/36e5);
  var m    = Math.floor((diff%36e5)/6e4);
  var s    = Math.floor((diff%6e4)/1e3);
  var ed   = document.getElementById('cc-days'); if(ed) ed.textContent = days;
  var et   = document.getElementById('cc-time'); if(et) et.textContent = pad(h)+':'+pad(m)+':'+pad(s);
}
function pad(n){ return String(n).padStart(2,'0'); }
setInterval(updateCrisisCounter, 1000);

/* ── SIDEBAR BUILD ── */
function buildSidebar(){
  var nav = document.getElementById('sidebar-nav');
  if(!nav) return;

  var mods = getModules();
  var html = '';

  for(var i=0;i<mods.length;i++){
    var m = mods[i];
    if(!m.enabled) continue;

    /* SIE always shows but requires separate login */
    if(m.id==='sie'){
      var meta = TAB_META[m.id]||{icon:'📋',label:m.label};
      html += '<button class="nav-item nav-item-sie'+(currentTab===m.id?' active':'')+ '" onclick="showTab(\''+m.id+'\',this)" data-tab="'+m.id+'">' +
        '<span class="nav-icon">'+meta.icon+'</span>' +
        '<span class="nav-label">'+meta.label+'</span>' +
        '<span class="nav-classified">CLASIFICADO</span>' +
      '</button>';
      continue;
    }

    /* Admin — only for admin role */
    if(m.id==='admin'){
      if(!currentUser || currentUser.role!=='admin') continue;
    } else {
      if(!canAccess(m.id)) continue;
    }

    var meta2 = TAB_META[m.id]||{icon:'📋',label:m.label};
    var isAdmin = m.id==='admin';
    html += '<button class="nav-item'+(isAdmin?' nav-item-admin':'')+(currentTab===m.id?' active':'')+ '" onclick="showTab(\''+m.id+'\',this)" data-tab="'+m.id+'">' +
      '<span class="nav-icon">'+meta2.icon+'</span>' +
      '<span class="nav-label">'+meta2.label+'</span>' +
    '</button>';
  }

  nav.innerHTML = html;

  /* User section */
  var ubox = document.getElementById('sb-userbox');
  var loginbtn = document.getElementById('sb-loginbtn');
  if(currentUser){
    if(ubox){
      ubox.style.display = 'flex';
      var uav = document.getElementById('sb-av'); if(uav) uav.textContent = currentUser.name.charAt(0).toUpperCase();
      var un  = document.getElementById('sb-uname'); if(un) un.textContent = currentUser.name;
      var ur  = document.getElementById('sb-urole'); if(ur){ ur.textContent = currentUser.role.toUpperCase(); ur.className='sb-role role-'+currentUser.role; }
    }
    if(loginbtn) loginbtn.style.display = 'none';
    var lb2 = document.getElementById('sb-logout'); if(lb2) lb2.style.display = 'flex';
  } else {
    if(ubox) ubox.style.display = 'none';
    if(loginbtn) loginbtn.style.display = 'block';
    var lb3 = document.getElementById('sb-logout'); if(lb3) lb3.style.display = 'none';
  }
}

/* ── SHOW TAB ── */
var newsLoaded = false;

function showTab(tab, btn){
  /* SIE doesn't require main auth check */
  if(tab !== 'sie' && tab !== 'admin'){
    if(!canAccess(tab)) return;
  }
  if(tab === 'admin' && (!currentUser || currentUser.role !== 'admin')) return;

  currentTab = tab;

  /* Hide all panels */
  document.querySelectorAll('.panel').forEach(function(p){ p.classList.remove('active'); });
  var panel = document.getElementById('tab-'+tab);
  if(panel) panel.classList.add('active');

  /* Update sidebar */
  document.querySelectorAll('.nav-item').forEach(function(b){ b.classList.remove('active'); });
  var nb = document.querySelector('.nav-item[data-tab="'+tab+'"]');
  if(nb) nb.classList.add('active');

  /* Update header title */
  var meta = TAB_META[tab]||{icon:'',label:tab};
  var ht = document.getElementById('hdr-tab-title');
  if(ht) ht.textContent = meta.icon+' '+meta.label;

  /* Close sidebar on mobile */
  closeSidebar();

  /* Tab-specific init */
  if(tab==='map')          { setTimeout(function(){ renderMap(); renderTable(); buildShipSidebar(); },50); }
  if(tab==='charts')       { setTimeout(initCharts,80); }
  if(tab==='tension')      { setTimeout(function(){ if(typeof Chart!=='undefined') renderTensionPanel(); else initCharts(); },80); }
  if(tab==='news'&&!newsLoaded){ loadNews(); newsLoaded=true; }
  if(tab==='fuel')         { calcAllFuel(); }
  if(tab==='flows')        { setTimeout(startFlows,100); }
  if(tab==='electricidad') { startRiesgoTimer(); }
  if(tab==='updates')      { renderLog(); }
  if(tab==='calc')         { calcImpact(); }
  if(tab==='prediccion')   { initPredPanel(); }
  if(tab==='sie')          { initSIE(); }
  if(tab==='chat')         { var ci=document.getElementById('chat-input'); if(ci) ci.focus(); }
  if(tab==='admin')        { renderAdminModules(); var fb=document.querySelector('[data-adm-sec="modules"]'); if(fb) showAdminSection('modules',fb); }

  if(currentUser) auditLog('TAB',tab,'nav');
}

function initPredPanel(){
  var pb=document.getElementById('pred-brent'); if(pb) pb.textContent='$'+STATE.brent.toFixed(1);
  var ps=document.getElementById('pred-ships'); if(ps) ps.textContent='~'+STATE.ships;
  var pt=document.getElementById('pred-tens');  if(pt) pt.textContent=STATE.tensionIndex+'/100';
  var pa=document.getElementById('pred-atk');   if(pa) pa.textContent=STATE.attacks;
  var pd=document.getElementById('pred-dias');  if(pd) pd.textContent=Math.floor((new Date()-CRISIS_START)/864e5)+' días';
}

function buildShipSidebar(){
  var lista = document.getElementById('barcos-destacados');
  if(!lista) return;
  var top = SHIPS.filter(function(s){ return s.s==='attacked'; }).slice(0,4)
    .concat(SHIPS.filter(function(s){ return s.s==='loaded'; }).slice(0,3));
  lista.innerHTML = top.map(function(s){
    var col = s.s==='attacked'?'#ef4444':s.s==='loaded'?'#f97316':'#10b981';
    var lbl = {loaded:'CARGADO',attacked:'ATACADO',transit:'TRÁNSITO',waiting:'ESPERA'}[s.s]||s.s;
    return '<div style="background:var(--bg);border:1px solid var(--bor2);border-radius:6px;padding:.55rem .7rem;display:flex;justify-content:space-between;align-items:center;gap:.5rem">' +
      '<div style="min-width:0">' +
        '<div style="font-size:var(--fs-sm);font-weight:700;color:var(--txt);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+san(s.n)+'</div>' +
        '<div style="font-family:\'JetBrains Mono\',monospace;font-size:var(--fs-xs);color:var(--mut3)">'+san(s.t)+'</div>' +
      '</div>' +
      '<span style="background:rgba(0,0,0,.2);border:1px solid '+col+';color:'+col+';font-family:\'JetBrains Mono\',monospace;font-size:.42rem;padding:2px 5px;border-radius:3px;white-space:nowrap">'+lbl+'</span>' +
    '</div>';
  }).join('');
}

/* ── SIDEBAR TOGGLE ── */
function toggleSidebar(){
  sidebarOpen = !sidebarOpen;
  var sb = document.getElementById('sidebar');
  var ov = document.getElementById('mob-overlay');
  if(sb) sb.classList.toggle('open', sidebarOpen);
  if(ov) ov.classList.toggle('show', sidebarOpen);
}
function closeSidebar(){
  sidebarOpen = false;
  var sb = document.getElementById('sidebar');
  var ov = document.getElementById('mob-overlay');
  if(sb) sb.classList.remove('open');
  if(ov) ov.classList.remove('show');
}

/* ── AUTH OVERRIDES ── */
function showAdminLogin(){
  document.getElementById('app').style.display = 'none';
  document.getElementById('login-screen').style.display = 'flex';
  var lb = document.getElementById('login-back-btn'); if(lb) lb.style.display='block';
}
function backToPublic(){
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('app').style.display = 'block';
}

doLogin = function(){
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
  try{sessionStorage.setItem('hip9s',enc(JSON.stringify({u:u})));}catch(e){}
  auditLog('LOGIN','Acceso al sistema','—');
  buildSidebar();
  showTab(currentTab, null);
};

doLogout = function(){
  auditLog('LOGOUT','Sesion cerrada','—');
  currentUser=null; isPublicMode=true;
  try{sessionStorage.removeItem('hip9s');}catch(e){}
  document.body.className='role-viewer public-mode';
  buildSidebar();
};

/* ── APPLY UI ── */
function applyUI(changes,isAI,isAlert){
  function flash(id){
    var b=document.getElementById(id); if(!b)return;
    var bx=b.closest?b.closest('.sbox'):null; if(!bx)return;
    bx.classList.remove('flash');
    requestAnimationFrame(function(){bx.classList.add('flash');});
  }
  var bc=STATE.brent-PREV.brent;
  var sb=document.getElementById('s-brent');
  if(sb) sb.innerHTML='$'+STATE.brent.toFixed(1)+'<span class="ci '+(bc>0?'cup':'cdn')+'">'+(bc>0?'+':'')+bc.toFixed(1)+'</span>';
  flash('s-brent');
  var ss=document.getElementById('s-ships');     if(ss){ ss.textContent='~'+STATE.ships; flash('s-ships'); }
  var sa=document.getElementById('s-attacks');   if(sa){ sa.textContent=STATE.attacks; flash('s-attacks'); }
  var st=document.getElementById('s-transit');   if(st){ st.textContent=STATE.transits; flash('s-transit'); }
  var cb=document.getElementById('c-brent');     if(cb) cb.textContent='$'+STATE.brent.toFixed(1);
  var cw=document.getElementById('c-wti');       if(cw) cw.textContent='$'+STATE.wti.toFixed(1);
  var ct=document.getElementById('c-transit');   if(ct) ct.textContent=STATE.transits;
  var nb=document.getElementById('ns-brent');    if(nb) nb.textContent='$'+STATE.brent.toFixed(1);
  var nt=document.getElementById('ns-trans');    if(nt) nt.textContent=STATE.transits+'/día';
  var na=document.getElementById('ns-atk');      if(na) na.textContent=STATE.attacks;
  var pp=document.getElementById('pp-brent');    if(pp) pp.textContent='$'+STATE.brent.toFixed(1);
  var psh=document.getElementById('pp-ships');   if(psh) psh.textContent='~'+STATE.ships;
  var pat=document.getElementById('pp-attacks'); if(pat) pat.textContent=STATE.attacks;
  updateTensionUI(); calcAllFuel();
  addLog(isAlert?'alert':isAI?'ai':'auto',changes.length?changes.join(' / '):'Sin cambios',isAI?'Claude AI':'Simulacion');
}

function showAlert(msg){
  var ab=document.getElementById('alert-bar');
  var am=document.getElementById('alert-msg');
  if(ab&&am){ am.textContent=msg; ab.classList.add('show'); setTimeout(function(){ab.classList.remove('show');},12000); }
}

function buildTicker(){
  var tw=document.getElementById('ticker-inner'); if(!tw) return;
  var html='';
  for(var i=0;i<NEWS.length;i++) html+='<span class="ti"><span class="tidot"></span>'+san(NEWS[i].title)+'</span>';
  tw.innerHTML=html+html;
}

/* ── PRESENTATION MODE ── */
function enterPres(){
  var o=document.getElementById('pres-overlay'); if(!o) return;
  o.classList.add('active');
  var pts=document.getElementById('pts'); if(pts) pts.textContent=new Date().toLocaleString('es-ES');
  var ppd=document.getElementById('pp-date'); if(ppd) ppd.textContent=new Date().toLocaleDateString('es-ES',{day:'2-digit',month:'long',year:'numeric'});
  var ti=calcTension();
  var ppb=document.getElementById('pp-bar'); if(ppb) ppb.style.width=ti+'%';
  var ppt=document.getElementById('pp-tens'); if(ppt) ppt.textContent=ti;
  if(document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(function(){});
}
function exitPres(){
  var o=document.getElementById('pres-overlay'); if(o) o.classList.remove('active');
  if(document.exitFullscreen) document.exitFullscreen().catch(function(){});
}
document.addEventListener('keydown',function(e){ if(e.key==='Escape') exitPres(); });

/* ── MAIN INIT ── */
function initApp(){
  var savedNext = loadState();
  applyUI([],false,false);
  calcAllFuel(); updateTensionUI(); buildTicker(); buildSidebar();
  setTimeout(startFuelTimer,  1000);
  setTimeout(startBrentTimer, 2000);
  setTimeout(startREETimer,   3000);
  setTimeout(startRiesgoTimer,4000);
  requestNotifPermission();
  setTimeout(initMapTouch, 1200);
  var now2=Date.now();
  if(!savedNext||now2>=savedNext.getTime()){
    nextAt=new Date(now2+UPD_MS);
    setTimeout(function(){ triggerUpdate(false); },2800);
  } else {
    nextAt=savedNext;
    addLog('auto','Estado restaurado','localStorage');
  }
  startCD();
  /* Show first available tab */
  showTab('map', null);
  appReady = true;
}

/* ── BOOTSTRAP ── */
function bootstrap(){
  /* Restore admin session */
  var restored = false;
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
    document.getElementById('login-screen').style.display='none';
    document.getElementById('app').style.display='block';
    document.body.className='role-viewer public-mode';
    currentUser=null; isPublicMode=true;
    initApp();
  }
  registerSW();
}

/* Run bootstrap only if theme already chosen */
if(themeChosen){
  bootstrap();
}
