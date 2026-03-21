/* ═══════════════════════════════════════════════
   app.js — Init principal, router de tabs,
            crisis counter, mobile menu
   PUNTO DE ENTRADA de la aplicación
═══════════════════════════════════════════════ */
'use strict';

/* ── HEADER DATE ── */
function updHdr(){
  var el = document.getElementById('hdate');
  if(el) el.textContent = new Date().toLocaleDateString('es-ES',{day:'2-digit',month:'short',year:'numeric'})+' '+new Date().toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'});
}
updHdr(); setInterval(updHdr, 30000);

/* ── CRISIS COUNTER ── */
function updateCrisisCounter(){
  var now = new Date();
  var diff = now - CRISIS_START;
  var days = Math.floor(diff/(1000*60*60*24));
  var hours= Math.floor((diff%(1000*60*60*24))/(1000*60*60));
  var mins = Math.floor((diff%(1000*60*60))/(1000*60));
  var secs = Math.floor((diff%(1000*60))/1000);
  var el = document.getElementById('cc-days');
  if(el) el.textContent = days;
  var et = document.getElementById('cc-time');
  if(et) et.textContent = String(hours).padStart(2,'0')+':'+String(mins).padStart(2,'0')+':'+String(secs).padStart(2,'0');
  var cd = document.getElementById('calc-dias-total'); if(cd) cd.textContent='Dia '+days;
  var pd = document.getElementById('pred-dias'); if(pd) pd.textContent=days+' dias';
}
setInterval(updateCrisisCounter, 1000);

/* ── PRESENTATION ── */
function enterPres(){
  var o = document.getElementById('pres-overlay');
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
  document.getElementById('pres-overlay').classList.remove('active');
  if(document.exitFullscreen) document.exitFullscreen().catch(function(){});
}
document.addEventListener('keydown',function(e){ if(e.key==='Escape') exitPres(); });

/* ── TABS BUILDER ── */
var TAB_ICONS = {
  map:'🗺️', tension:'🌡️', news:'📰', fuel:'⛽', flows:'🌊',
  tankers:'🚢', charts:'📊', chat:'💬', calc:'🧮',
  prediccion:'🤖', updates:'🔄', admin:'⚙️'
};

function buildTabs(){
  var mods = getModules();
  var tabsEl = document.getElementById('main-tabs');
  if(!tabsEl) return;
  var html = '';
  for(var i=0;i<mods.length;i++){
    var m = mods[i];
    if(!m.enabled) continue;
    if(!canAccess(m.id)) continue;
    html += '<button class="tab" id="tb-'+m.id+'" onclick="showTab(\''+m.id+'\',this)">'+
      (TAB_ICONS[m.id]||'')+'&nbsp;'+san(m.label)+'</button>';
  }
  if(currentUser && currentUser.role==='admin'){
    html += '<button class="tab tab-admin" id="tb-admin" onclick="showTab(\'admin\',this)">⚙️&nbsp;Admin</button>';
  }
  tabsEl.innerHTML = html;
  buildMobileDrawer();
  /* Activate first visible tab */
  var first = tabsEl.querySelector('.tab');
  if(first) first.click();
}

/* ── MOBILE MENU ── */
var mobileMenuOpen = false;

function toggleMobileMenu(){
  mobileMenuOpen = !mobileMenuOpen;
  var menu = document.getElementById('mobile-drawer');
  var overlay = document.getElementById('mobile-overlay');
  if(menu) menu.classList.toggle('open', mobileMenuOpen);
  if(overlay) overlay.classList.toggle('show', mobileMenuOpen);
  var btn = document.getElementById('hamburger-btn');
  if(btn) btn.classList.toggle('active', mobileMenuOpen);
}

function closeMobileMenu(){
  mobileMenuOpen = false;
  var menu = document.getElementById('mobile-drawer');
  var overlay = document.getElementById('mobile-overlay');
  if(menu) menu.classList.remove('open');
  if(overlay) overlay.classList.remove('show');
  var btn = document.getElementById('hamburger-btn');
  if(btn) btn.classList.remove('active');
}

function buildMobileDrawer(){
  var drawer = document.getElementById('mobile-drawer');
  if(!drawer) return;
  var mods = getModules();
  var html = '<div class="drawer-header"><span>MENÚ</span><button onclick="closeMobileMenu()" class="drawer-close">✕</button></div>';
  html += '<div class="drawer-items">';
  for(var i=0;i<mods.length;i++){
    var m = mods[i];
    if(!m.enabled) continue;
    if(!canAccess(m.id)) continue;
    html += '<button class="drawer-item" onclick="showTab(\''+m.id+'\',this)" data-tab="'+m.id+'">'+
      '<span class="drawer-icon">'+(TAB_ICONS[m.id]||'📋')+'</span>'+
      '<span class="drawer-label">'+san(m.label)+'</span></button>';
  }
  if(currentUser && currentUser.role==='admin'){
    html += '<button class="drawer-item drawer-admin" onclick="showTab(\'admin\',this)">'+
      '<span class="drawer-icon">⚙️</span><span class="drawer-label">Admin</span></button>';
  }
  html += '</div>';
  if(!currentUser){
    html += '<div class="drawer-footer"><button onclick="closeMobileMenu();showAdminLogin()" class="drawer-login-btn">🔐 Acceso Admin</button></div>';
  }
  drawer.innerHTML = html;
}

/* ── TABS ROUTER ── */
var newsLoaded2 = false;

function showTab(tab, btn){
  if(!canAccess(tab) && tab!=='admin'){ return; }
  document.querySelectorAll('.tab').forEach(function(t){ t.classList.remove('active'); });
  document.querySelectorAll('.panel').forEach(function(p){ p.classList.remove('active'); });
  var panel = document.getElementById('tab-'+tab);
  if(panel) panel.classList.add('active');
  if(btn) btn.classList.add('active');
  /* Update bottom nav */
  document.querySelectorAll('.bnav-btn').forEach(function(b){ b.classList.remove('active'); });
  var bBtn = document.querySelector('.bnav-btn[data-tab="'+tab+'"]');
  if(bBtn) bBtn.classList.add('active');
  closeMobileMenu();
  /* Tab-specific init */
  if(tab==='map')         requestAnimationFrame(function(){ renderMap(); });
  if(tab==='charts')      setTimeout(initCharts, 60);
  if(tab==='tension')     setTimeout(function(){ if(typeof Chart!=='undefined')renderTensionPanel();else initCharts(); }, 60);
  if(tab==='news'&&!newsLoaded2){ loadNews(); newsLoaded2=true; }
  if(tab==='fuel')        calcAllFuel();
  if(tab==='flows')       setTimeout(startFlows, 100);
  if(tab==='updates')     renderLog();
  if(tab==='calc')        calcImpact();
  if(tab==='prediccion'){
    var pd=document.getElementById('pred-brent'); if(pd) pd.textContent='$'+STATE.brent.toFixed(1);
    var psh=document.getElementById('pred-ships'); if(psh) psh.textContent='~'+STATE.ships;
    var pt=document.getElementById('pred-tens'); if(pt) pt.textContent=STATE.tensionIndex+'/100';
    var pa=document.getElementById('pred-atk'); if(pa) pa.textContent=STATE.attacks;
  }
  if(tab==='admin'){
    renderAdminModules();
    var firstBtn=document.querySelector('[data-adm-sec="modules"]');
    if(firstBtn) showAdminSection('modules',firstBtn);
  }
  if(currentUser) auditLog('TAB',tab,'nav');
}

/* ── MAIN INIT ── */
function initApp(){
  var savedNext = loadState();
  renderTable(); renderLog();
  applyUI([],false,false);
  calcAllFuel(); updateTensionUI();
  buildTicker(); buildTabs();
  setTimeout(loadNews, 1500);
  setTimeout(startFuelTimer, 1000);
  setTimeout(startBrentTimer, 2000);
  setTimeout(startREETimer, 3000);
  requestNotifPermission();
  setTimeout(initMapTouch, 1000);
  var now2 = Date.now();
  if(!savedNext||now2>=savedNext.getTime()){
    nextAt=new Date(now2+UPD_MS);
    setTimeout(function(){ triggerUpdate(false); }, 2500);
  }else{
    nextAt=savedNext;
    addLog('auto','Estado cargado desde sesion anterior','localStorage');
  }
  startCD();
  renderMap();
}

/* ── BOOTSTRAP ── */
(function(){
  /* Restore admin session */
  var restored = false;
  try{
    var s = sessionStorage.getItem('hip8s');
    if(s){
      var o = JSON.parse(dec(s));
      var users = getUsers();
      var u = users[o.u];
      if(u){
        currentUser = {username:o.u, role:u.role, name:u.name};
        isPublicMode = false;
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('app').style.display = 'block';
        document.body.className = 'role-'+u.role;
        document.getElementById('ub-av').textContent = u.role==='admin'?'A':'N';
        document.getElementById('ub-name').textContent = u.name;
        var rn={admin:'Admin',analyst:'Analista',viewer:'Viewer'};
        document.getElementById('ub-role').textContent = rn[u.role]||u.role;
        document.getElementById('ub-role').className = 'ub-role role-'+u.role;
        var hint=document.getElementById('admin-hint'); if(hint) hint.style.display='none';
        var ub=document.getElementById('user-badge'); if(ub) ub.style.display='flex';
        var lb=document.getElementById('logout-btn'); if(lb) lb.style.display='block';
        restored = true;
        initApp();
      }
    }
  }catch(e){}

  if(!restored) initPublicMode();

  /* Register PWA service worker */
  registerSW();
})();
