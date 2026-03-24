/* ═══════════════════════════════════════════════
   app.js — Router, sidebar oculta por defecto
   Hormuz Intelligence Platform v9
═══════════════════════════════════════════════ */
'use strict';

var currentTab  = 'map';
var sidebarOpen = false;
var newsLoaded  = false;

var TAB_ICONS = {
  map:'🗺️', tension:'🌡️', news:'📰', fuel:'⛽',
  flows:'🌊', tankers:'🚢', charts:'📈', chat:'💬',
  calc:'🧮', prediccion:'🤖', updates:'🔄',
  electricidad:'⚡', sie:'🔍', admin:'⚙️'
};

/* ── HEADER DATE ── */
function updHdr(){
  var el=document.getElementById('hdate');
  if(el) el.textContent=new Date().toLocaleString('es-ES',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});
}
updHdr(); setInterval(updHdr,30000);

/* ── CRISIS COUNTER ── */
function updateCrisisCounter(){
  var d=new Date()-CRISIS_START;
  var days=Math.floor(d/864e5),h=Math.floor((d%864e5)/36e5),m=Math.floor((d%36e5)/6e4),s=Math.floor((d%6e4)/1e3);
  var time=String(h).padStart(2,'0')+':'+String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');
  ['cc-days','cc-days2'].forEach(function(id){var el=document.getElementById(id);if(el)el.textContent=days;});
  ['cc-time','cc-time2'].forEach(function(id){var el=document.getElementById(id);if(el)el.textContent=time;});
  var cd=document.getElementById('calc-dias-total');if(cd)cd.textContent='Dia '+days;
  var pd=document.getElementById('pred-dias');if(pd)pd.textContent=days+' dias';
}
setInterval(updateCrisisCounter,1000);

/* ── SIDEBAR TOGGLE ── */
function toggleSidebar(){
  sidebarOpen=!sidebarOpen;
  var sb=document.getElementById('sidebar');
  var ov=document.getElementById('mob-overlay');
  if(sb) sb.classList.toggle('open',sidebarOpen);
  if(ov) ov.classList.toggle('show',sidebarOpen);
  var btn=document.getElementById('sidebar-toggle-btn');
  if(btn) btn.classList.toggle('active',sidebarOpen);
}
function closeSidebar(){
  sidebarOpen=false;
  var sb=document.getElementById('sidebar');
  var ov=document.getElementById('mob-overlay');
  if(sb) sb.classList.remove('open');
  if(ov) ov.classList.remove('show');
  var btn=document.getElementById('sidebar-toggle-btn');
  if(btn) btn.classList.remove('active');
}

/* ── BUILD TABS (horizontal) ── */
function buildTabs(){
  var container=document.getElementById('main-tabs'); if(!container) return;
  var mods=getModules();
  var html='';
  for(var i=0;i<mods.length;i++){
    var m=mods[i]; if(!m.enabled) continue;
    if(m.id==='admin'){if(!currentUser||currentUser.role!=='admin') continue;}
    else if(m.id==='sie'){/* always show SIE but it has its own login */}
    else if(!canAccess(m.id)) continue;
    var icon=TAB_ICONS[m.id]||'📋';
    var isAdmin=(m.id==='admin');
    var isSIE=(m.id==='sie');
    html+='<button class="tab'+(isAdmin?' tab-admin':'')+(isSIE?' tab-sie':'')+(currentTab===m.id?' active':'')+'" '+
      'onclick="showTab(\''+m.id+'\',this)" id="tb-'+m.id+'" data-tab="'+m.id+'">'+
      '<span class="tab-icon">'+icon+'</span>'+
      '<span class="tab-label">'+m.label+'</span>'+
    '</button>';
  }
  container.innerHTML=html;

  /* Build sidebar nav too */
  buildSidebarNav();
}

function buildSidebarNav(){
  var nav=document.getElementById('sidebar-nav'); if(!nav) return;
  var mods=getModules();
  var html='';
  for(var i=0;i<mods.length;i++){
    var m=mods[i]; if(!m.enabled) continue;
    if(m.id==='admin'){if(!currentUser||currentUser.role!=='admin') continue;}
    else if(m.id==='sie'){/* always */}
    else if(!canAccess(m.id)) continue;
    var icon=TAB_ICONS[m.id]||'📋';
    var isAdmin=(m.id==='admin'); var isSIE=(m.id==='sie');
    html+='<button class="snav-item'+(isAdmin?' snav-admin':'')+(isSIE?' snav-sie':'')+(currentTab===m.id?' active':'')+'" '+
      'onclick="showTab(\''+m.id+'\',this);closeSidebar();" data-tab="'+m.id+'">'+
      '<span style="font-size:1rem;width:20px;text-align:center;flex-shrink:0">'+icon+'</span>'+
      '<span style="font-family:\'Syne\',sans-serif;font-size:var(--fs-md);font-weight:600">'+m.label+'</span>'+
      (isSIE?'<span style="font-family:\'JetBrains Mono\',monospace;font-size:.4rem;background:rgba(139,92,246,.15);border:1px solid rgba(139,92,246,.3);color:var(--pur);padding:1px 4px;border-radius:2px;margin-left:auto">CLAS.</span>':'')+
    '</button>';
  }
  nav.innerHTML=html;

  /* User info in sidebar */
  var ubox=document.getElementById('sb-user'); if(ubox) ubox.style.display=currentUser?'flex':'none';
  var lbtn=document.getElementById('sb-loginbtn'); if(lbtn) lbtn.style.display=currentUser?'none':'block';
  var lout=document.getElementById('sb-logout'); if(lout) lout.style.display=currentUser?'flex':'none';
  if(currentUser){
    var av=document.getElementById('sb-av'); if(av) av.textContent=currentUser.name.charAt(0).toUpperCase();
    var un=document.getElementById('sb-uname'); if(un) un.textContent=currentUser.name;
    var ur=document.getElementById('sb-urole'); if(ur){ur.textContent=currentUser.role.toUpperCase();ur.className='sb-role role-'+currentUser.role;}
  }
}

/* ── SHOW TAB ── */
function showTab(tab,btn){
  if(tab!=='sie'&&tab!=='admin'&&!canAccess(tab)) return;
  if(tab==='admin'&&(!currentUser||currentUser.role!=='admin')) return;

  currentTab=tab;

  /* panels */
  document.querySelectorAll('.panel').forEach(function(p){p.classList.remove('active');});
  var panel=document.getElementById('tab-'+tab);
  if(panel) panel.classList.add('active');

  /* tabs */
  document.querySelectorAll('.tab,[data-tab]').forEach(function(b){b.classList.remove('active');});
  document.querySelectorAll('[data-tab="'+tab+'"]').forEach(function(b){b.classList.add('active');});

  /* tab title in header */
  var tt=document.getElementById('hdr-tabtitle');
  if(tt) tt.textContent=(TAB_ICONS[tab]||'')+' '+(document.querySelector('#tb-'+tab+' .tab-label')||{textContent:tab}).textContent;

  closeSidebar();

  /* init */
  if(tab==='map')          {setTimeout(function(){renderMap();},50);}
  if(tab==='tension')      {setTimeout(function(){if(typeof Chart!=='undefined')renderTensionPanel();else initCharts();},80);}
  if(tab==='news'&&!newsLoaded){loadNews();newsLoaded=true;}
  if(tab==='fuel')         {calcAllFuel();}
  if(tab==='flows')        {setTimeout(startFlows,100);}
  if(tab==='charts')       {setTimeout(initCharts,80);}
  if(tab==='electricidad') {startRiesgoTimer();}
  if(tab==='updates')      {renderLog();}
  if(tab==='calc')         {calcImpact();}
  if(tab==='prediccion')   {var pb=document.getElementById('pred-brent');if(pb)pb.textContent='$'+STATE.brent.toFixed(1);var ps=document.getElementById('pred-ships');if(ps)ps.textContent='~'+STATE.ships;var pt=document.getElementById('pred-tens');if(pt)pt.textContent=STATE.tensionIndex+'/100';var pa=document.getElementById('pred-atk');if(pa)pa.textContent=STATE.attacks;}
  if(tab==='sie')          {initSIE();}
  if(tab==='admin')        {renderAdminModules();var fb=document.querySelector('[data-adm-sec="modules"]');if(fb)showAdminSection('modules',fb);}

  if(currentUser) auditLog('TAB',tab,'nav');
}

/* ── AUTH ── */
function showAdminLogin(){
  document.getElementById('app').style.display='none';
  document.getElementById('login-screen').style.display='flex';
  var lb=document.getElementById('login-back-btn'); if(lb) lb.style.display='block';
}
function backToPublic(){
  document.getElementById('login-screen').style.display='none';
  document.getElementById('app').style.display='block';
}

doLogin=function(){
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
  var ub2=document.getElementById('user-badge');if(ub2)ub2.style.display='flex';
  var lb2=document.getElementById('logout-btn');if(lb2)lb2.style.display='block';
  var ah=document.getElementById('admin-hint');if(ah)ah.style.display='none';
  document.getElementById('ub-av').textContent=currentUser.role==='admin'?'A':'N';
  document.getElementById('ub-name').textContent=currentUser.name;
  var ubr=document.getElementById('ub-role');if(ubr){ubr.textContent=currentUser.role;ubr.className='ub-role role-'+currentUser.role;}
  try{sessionStorage.setItem('hip9s',enc(JSON.stringify({u:u})));}catch(e){}
  auditLog('LOGIN','Acceso al sistema','—');
  buildTabs();
  showTab(currentTab,null);
};

doLogout=function(){
  auditLog('LOGOUT','Sesion cerrada','—');
  currentUser=null;isPublicMode=true;
  try{sessionStorage.removeItem('hip9s');}catch(e){}
  document.body.className='role-viewer public-mode';
  buildTabs();
};

/* ── UI APPLY ── */
function applyUI(changes,isAI,isAlert){
  function flash(id){var b=document.getElementById(id);if(!b)return;var bx=b.closest?b.closest('.sbox'):null;if(!bx)return;bx.classList.remove('flash');requestAnimationFrame(function(){bx.classList.add('flash');});}
  var bc=STATE.brent-PREV.brent;
  var sb=document.getElementById('s-brent');if(sb)sb.innerHTML='$'+STATE.brent.toFixed(1)+'<span class="ci '+(bc>0?'cup':'cdn')+'">'+(bc>0?'+':'')+bc.toFixed(1)+'</span>';flash('s-brent');
  var ss=document.getElementById('s-ships');if(ss){ss.textContent='~'+STATE.ships;flash('s-ships');}
  var sa=document.getElementById('s-attacks');if(sa){sa.textContent=STATE.attacks;flash('s-attacks');}
  var st=document.getElementById('s-transit');if(st){st.textContent=STATE.transits;flash('s-transit');}
  var cb=document.getElementById('c-brent');if(cb)cb.textContent='$'+STATE.brent.toFixed(1);
  var cw=document.getElementById('c-wti');if(cw)cw.textContent='$'+STATE.wti.toFixed(1);
  var ct=document.getElementById('c-transit');if(ct)ct.textContent=STATE.transits;
  var nb=document.getElementById('ns-brent');if(nb)nb.textContent='$'+STATE.brent.toFixed(1);
  var nt=document.getElementById('ns-trans');if(nt)nt.textContent=STATE.transits+'/día';
  var na=document.getElementById('ns-atk');if(na)na.textContent=STATE.attacks;
  var pp=document.getElementById('pp-brent');if(pp)pp.textContent='$'+STATE.brent.toFixed(1);
  updateTensionUI();calcAllFuel();
  addLog(isAlert?'alert':isAI?'ai':'auto',changes.length?changes.join(' / '):'Sin cambios',isAI?'Claude AI':'Simulacion');
}

function showAlert(msg){
  var ab=document.getElementById('alert-bar');var am=document.getElementById('alert-msg');
  if(ab&&am){am.textContent=msg;ab.classList.add('show');setTimeout(function(){ab.classList.remove('show');},12000);}
}

function buildTicker(){
  var tw=document.getElementById('ticker-inner');if(!tw)return;
  var html='';
  for(var i=0;i<NEWS.length;i++) html+='<span class="ti"><span class="tidot"></span>'+san(NEWS[i].title)+'</span>';
  tw.innerHTML=html+html;
}

/* ── PRESENTATION ── */
function enterPres(){
  var o=document.getElementById('pres-overlay');if(!o)return;
  o.classList.add('active');
  var pts=document.getElementById('pts');if(pts)pts.textContent=new Date().toLocaleString('es-ES');
  var ppd=document.getElementById('pp-date');if(ppd)ppd.textContent=new Date().toLocaleDateString('es-ES',{day:'2-digit',month:'long',year:'numeric'});
  var ti=calcTension();
  var ppb=document.getElementById('pp-bar');if(ppb)ppb.style.width=ti+'%';
  var ppt=document.getElementById('pp-tens');if(ppt)ppt.textContent=ti;
  if(document.documentElement.requestFullscreen)document.documentElement.requestFullscreen().catch(function(){});
}
function exitPres(){var o=document.getElementById('pres-overlay');if(o)o.classList.remove('active');if(document.exitFullscreen)document.exitFullscreen().catch(function(){});}
document.addEventListener('keydown',function(e){if(e.key==='Escape')exitPres();});

/* ── MAIN INIT ── */
function initApp(){
  var savedNext=loadState();
  applyUI([],false,false);
  calcAllFuel();updateTensionUI();buildTicker();buildTabs();
  setTimeout(startFuelTimer,1000);
  setTimeout(startBrentTimer,2000);
  setTimeout(startREETimer,3000);
  setTimeout(startRiesgoTimer,4000);
  requestNotifPermission();
  setTimeout(initMapTouch,1200);
  var now2=Date.now();
  if(!savedNext||now2>=savedNext.getTime()){
    nextAt=new Date(now2+UPD_MS);
    setTimeout(function(){triggerUpdate(false);},2800);
  } else {
    nextAt=savedNext;
    addLog('auto','Estado restaurado','localStorage');
  }
  startCD();
  showTab('map',null);
}

/* ── BOOTSTRAP ── */
(function(){
  var restored=false;
  try{
    var s=sessionStorage.getItem('hip9s');
    if(s){
      var o=JSON.parse(dec(s));var users=getUsers();var u=users[o.u];
      if(u){
        currentUser={username:o.u,role:u.role,name:u.name};
        isPublicMode=false;
        document.getElementById('login-screen').style.display='none';
        document.getElementById('app').style.display='block';
        document.body.className='role-'+u.role;
        restored=true;initApp();
      }
    }
  }catch(e){}
  if(!restored){
    document.getElementById('login-screen').style.display='none';
    document.getElementById('app').style.display='block';
    document.body.className='role-viewer public-mode';
    currentUser=null;isPublicMode=true;
    initApp();
  }
  registerSW();
})();
