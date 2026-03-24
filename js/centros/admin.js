/* ═══════════════════════════════════════════════
   admin.js — Panel de administración completo
   Módulos, usuarios, umbrales, KPIs, audit log, wizard
═══════════════════════════════════════════════ */
'use strict';

var adminSection = 'modules';
var wizStep = 1;
var wizData = {};

function renderAdminModules(){
  var mods=getModules();var el=document.getElementById('adm-modules-list');if(!el)return;
  var ROLES=['viewer','analyst','admin'];
  var html='';
  for(var i=0;i<mods.length;i++){
    var m=mods[i];
    html+='<div class="adm-row">'+
      '<div class="adm-row-info"><div class="adm-row-name">'+san(m.label)+'</div><div class="adm-row-sub">ID: '+san(m.id)+' | Rol minimo: <select class="adm-sel" onchange="setModuleRole('+i+',this.value)">';
    for(var r=0;r<ROLES.length;r++){html+='<option value="'+ROLES[r]+'"'+(m.minRole===ROLES[r]?' selected':'')+'>'+ROLES[r]+'</option>';}
    html+='</select></div></div>'+
      '<div class="adm-row-actions">'+
        '<label class="adm-toggle">'+
          '<input type="checkbox" '+(m.enabled?'checked':'')+' onchange="toggleModule('+i+',this.checked)">'+
          '<span class="adm-toggle-slider"></span>'+
        '</label>'+
      '</div>'+
    '</div>';
  }
  el.innerHTML=html;
}

function toggleModule(idx,enabled){
  var mods=getModules();mods[idx].enabled=enabled;saveModules(mods);
  auditLog('MODULE_TOGGLE',(enabled?'Activado':'Desactivado')+': '+mods[idx].label,'admin');
  buildTabs();renderAdminModules();
}

function setModuleRole(idx,role){
  var mods=getModules();mods[idx].minRole=role;saveModules(mods);
  auditLog('MODULE_ROLE','Rol de '+mods[idx].label+' cambiado a '+role,'admin');
  buildTabs();
}

function renderAdminUsers(){
  var users=getUsers();var el=document.getElementById('adm-users-list');if(!el)return;
  var html='';
  var keys=Object.keys(users);
  for(var i=0;i<keys.length;i++){
    var u=users[keys[i]];var uname=keys[i];
    var isCurrentUser=currentUser&&currentUser.username===uname;
    html+='<div class="adm-row">'+
      '<div class="adm-row-info">'+
        '<div class="adm-row-name">'+san(uname)+(isCurrentUser?' <span class="adm-badge-you">TU</span>':'')+'</div>'+
        '<div class="adm-row-sub">'+san(u.name)+' | Rol: <span class="ub-role role-'+san(u.role)+'">'+san(u.role)+'</span> | Creado: '+san(u.created||'—')+'</div>'+
      '</div>'+
      '<div class="adm-row-actions">'+
        '<button class="adm-btn adm-btn-edit" onclick="editUser(\''+san(uname)+'\')">EDITAR</button>'+
        (!isCurrentUser?'<button class="adm-btn adm-btn-del" onclick="deleteUser(\''+san(uname)+'\')">BORRAR</button>':'')+
      '</div>'+
    '</div>';
  }
  el.innerHTML=html;
}

function editUser(uname){
  var users=getUsers();var u=users[uname];if(!u)return;
  var name=prompt('Nombre completo:',u.name);if(name===null)return;
  var role=prompt('Rol (admin/analyst/viewer):',u.role);if(!role||['admin','analyst','viewer'].indexOf(role)===-1){alert('Rol invalido');return;}
  var pass=prompt('Nueva contrasena (dejar vacio para no cambiar):','');
  users[uname].name=name;users[uname].role=role;
  if(pass&&pass.length>=4)users[uname].pass=pass;
  saveUsers(users);
  auditLog('USER_EDIT','Usuario editado: '+uname+' rol='+role,'admin');
  renderAdminUsers();
}

function deleteUser(uname){
  if(!confirm('Borrar usuario "'+uname+'"?'))return;
  var users=getUsers();delete users[uname];saveUsers(users);
  auditLog('USER_DEL','Usuario eliminado: '+uname,'admin');
  renderAdminUsers();
}

function addNewUser(){
  var uname=(document.getElementById('nu-username').value||'').trim().toLowerCase();
  var name=(document.getElementById('nu-name').value||'').trim();
  var pass=(document.getElementById('nu-pass').value||'').trim();
  var role=document.getElementById('nu-role').value;
  if(!uname||!name||!pass||pass.length<4){alert('Rellena todos los campos. Contrasena minimo 4 caracteres.');return;}
  var users=getUsers();
  if(users[uname]){alert('El usuario ya existe');return;}
  users[uname]={pass:pass,role:role,name:name,created:new Date().toISOString().slice(0,10)};
  saveUsers(users);
  document.getElementById('nu-username').value='';document.getElementById('nu-name').value='';document.getElementById('nu-pass').value='';
  auditLog('USER_ADD','Nuevo usuario: '+uname+' rol='+role,'admin');
  renderAdminUsers();
}

function renderAdminThresholds(){
  var thr=getThresholds();var el=document.getElementById('adm-thr-list');if(!el)return;
  var keys=Object.keys(thr);var html='';
  for(var i=0;i<keys.length;i++){
    var k=keys[i];var t=thr[k];
    html+='<div class="adm-row">'+
      '<div class="adm-row-info">'+
        '<div class="adm-row-name">'+san(t.label)+'</div>'+
        '<div class="adm-row-sub">Umbral actual: <strong style="color:#f97316">'+t.val+'</strong></div>'+
      '</div>'+
      '<div class="adm-row-actions" style="gap:.5rem">'+
        '<input type="number" class="adm-inp-num" value="'+t.val+'" min="1" step="1" onchange="setThreshold(\''+k+'\',this.value)" style="width:80px">'+
        '<label class="adm-toggle"><input type="checkbox" '+(t.enabled?'checked':'')+' onchange="toggleThreshold(\''+k+'\',this.checked)"><span class="adm-toggle-slider"></span></label>'+
      '</div>'+
    '</div>';
  }
  el.innerHTML=html;
}

function setThreshold(key,val){
  var thr=getThresholds();thr[key].val=parseFloat(val);saveThresholds(thr);
  auditLog('THR_SET','Umbral '+key+' = '+val,'admin');
}

function toggleThreshold(key,enabled){
  var thr=getThresholds();thr[key].enabled=enabled;saveThresholds(thr);
  auditLog('THR_TOGGLE',(enabled?'Activado':'Desactivado')+' umbral '+key,'admin');
}

function renderAdminKPIs(){
  var kpis=getKPIs();var el=document.getElementById('adm-kpis-list');if(!el)return;
  var html='';
  for(var i=0;i<kpis.length;i++){
    var k=kpis[i];
    html+='<div class="adm-row">'+
      '<div class="adm-row-info">'+
        '<div class="adm-row-name">'+san(k.label)+'</div>'+
        '<div class="adm-row-sub">ID: '+san(k.id)+' | Color: <select class="adm-sel" onchange="setKPIColor('+i+',this.value)"><option value="cor"'+(k.color==='cor'?' selected':'')+'>Naranja</option><option value="cre"'+(k.color==='cre'?' selected':'')+'>Rojo</option><option value="cyl"'+(k.color==='cyl'?' selected':'')+'>Amarillo</option><option value="cgr"'+(k.color==='cgr'?' selected':'')+'>Verde</option></select></div>'+
      '</div>'+
      '<div class="adm-row-actions">'+
        '<label class="adm-toggle"><input type="checkbox" '+(k.enabled?'checked':'')+' onchange="toggleKPI('+i+',this.checked)"><span class="adm-toggle-slider"></span></label>'+
      '</div>'+
    '</div>';
  }
  el.innerHTML=html;
}

function toggleKPI(idx,enabled){
  var kpis=getKPIs();kpis[idx].enabled=enabled;saveKPIs(kpis);
  auditLog('KPI_TOGGLE',(enabled?'Activado':'Desactivado')+' KPI: '+kpis[idx].label,'admin');
  rebuildStatsBar();
}

function setKPIColor(idx,color){
  var kpis=getKPIs();kpis[idx].color=color;saveKPIs(kpis);rebuildStatsBar();
}

function rebuildStatsBar(){
  var kpis=getKPIs();
  var KPI_IDS={ships:'s-ships',brent:'s-brent',gas:'s-gas',attacks:'s-attacks',tension:'s-tension',transit:'s-transit'};
  var sbar=document.getElementById('stats-bar');if(!sbar)return;
  var boxes=sbar.querySelectorAll('.sbox');
  for(var i=0;i<boxes.length;i++){
    var kpi=kpis[i];if(!kpi)continue;
    boxes[i].style.display=kpi.enabled?'':'none';
    var sv=boxes[i].querySelector('.sv');
    if(sv){sv.className='sv '+kpi.color;}
  }
}

function renderAdminAudit(){
  var stored=lsGet('hip6_audit')||[];var el=document.getElementById('adm-audit-body');if(!el)return;
  if(!stored.length){el.innerHTML='<div style="padding:2rem;text-align:center;font-family:JetBrains Mono,monospace;font-size:.62rem;color:#2d4060">Sin registros aun.</div>';return;}
  var html='';
  for(var i=0;i<Math.min(stored.length,100);i++){
    var e=stored[i];var t=new Date(e.ts);
    var col=e.action==='LOGIN_FAIL'?'#ef4444':e.action==='LOGIN'?'#10b981':'#4d6a90';
    html+='<div class="adm-audit-row">'+
      '<span class="adm-audit-ts">'+fmtTs(t)+'</span>'+
      '<span class="adm-audit-user" style="color:'+col+'">'+san(e.user)+'</span>'+
      '<span class="adm-audit-role ub-role role-'+san(e.role||'viewer')+'">'+san(e.role||'—')+'</span>'+
      '<span class="adm-audit-action">'+san(e.action)+'</span>'+
      '<span class="adm-audit-detail">'+san(e.detail||'')+'</span>'+
    '</div>';
  }
  el.innerHTML=html;
}

function clearAudit(){
  if(!confirm('Borrar todo el audit log?'))return;
  lsDel('hip6_audit');
  auditLog('AUDIT_CLEAR','Audit log borrado por admin','admin');
  renderAdminAudit();
}

function renderAdminWizard(){
  wizStep=1;wizData={};showWizStep(1);
}

function showWizStep(step){
  wizStep=step;
  for(var i=1;i<=4;i++){
    var el=document.getElementById('wiz-step-'+i);if(el)el.style.display=i===step?'block':'none';
  }
  document.querySelectorAll('.wiz-dot').forEach(function(d,i){
    d.classList.toggle('active',i+1<=step);
  });
}

function wizNext(){
  if(wizStep===1){
    var id=(document.getElementById('wiz-id').value||'').trim().toLowerCase().replace(/[^a-z0-9_]/g,'');
    var label=(document.getElementById('wiz-label').value||'').trim();
    var role=document.getElementById('wiz-role').value;
    if(!id||!label){alert('Rellena ID y nombre');return;}
    var mods=getModules();for(var i=0;i<mods.length;i++){if(mods[i].id===id){alert('Ya existe un modulo con ese ID');return;}}
    wizData={id:id,label:label,role:role};showWizStep(2);
  }else if(wizStep===2){
    var html=(document.getElementById('wiz-html').value||'').trim();
    wizData.html=html;
    var preview=document.getElementById('wiz-preview');
    if(preview)preview.innerHTML=html||'<div style="color:#2d4060;text-align:center;padding:2rem;font-family:JetBrains Mono,monospace;font-size:.7rem">Sin HTML todavia</div>';
    showWizStep(3);
  }else if(wizStep===3){
    showWizStep(4);
    var sum=document.getElementById('wiz-summary');
    if(sum)sum.innerHTML='<b>ID:</b> '+san(wizData.id)+'<br><b>Nombre:</b> '+san(wizData.label)+'<br><b>Rol minimo:</b> '+san(wizData.role)+'<br><b>HTML:</b> '+(wizData.html?wizData.html.length+' caracteres':'vacio');
  }
}

function wizBack(){if(wizStep>1)showWizStep(wizStep-1);}

function wizFinish(){
  var mods=getModules();
  mods.push({id:wizData.id,label:wizData.label,icon:'NEW',minRole:wizData.role||'analyst',enabled:true});
  saveModules(mods);
  /* inject panel HTML */
  var container=document.getElementById('panels-container');
  if(container&&wizData.html){
    var div=document.createElement('div');div.id='tab-'+wizData.id;div.className='panel';div.innerHTML=wizData.html;
    container.appendChild(div);
  }
  auditLog('MODULE_CREATE','Nuevo modulo creado: '+wizData.id,'admin');
  buildTabs();
  alert('Modulo "'+wizData.label+'" creado y activado correctamente.');
  showAdminSection('modules',document.querySelector('[data-adm-sec="modules"]'));
}

function showAdminSection(sec,btn){
  adminSection=sec;
  document.querySelectorAll('.adm-nav-btn').forEach(function(b){b.classList.remove('active');});
  btn.classList.add('active');
  document.querySelectorAll('.adm-sec').forEach(function(s){s.style.display='none';});
  var el=document.getElementById('adm-'+sec);if(el)el.style.display='block';
  if(sec==='modules')renderAdminModules();
  if(sec==='users')renderAdminUsers();
  if(sec==='thresholds')renderAdminThresholds();
  if(sec==='kpis')renderAdminKPIs();
  if(sec==='audit')renderAdminAudit();
  if(sec==='wizard')renderAdminWizard();
  auditLog('ADMIN','Seccion admin: '+sec,'admin');
}

