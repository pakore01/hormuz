/* ═══════════════════════════════════════════════
   sie.js — Servicio de Inteligencia Estratégica
   Acceso restringido — usuario/contraseña propio
═══════════════════════════════════════════════ */
'use strict';

var sieCategory = 'all';

var SIE_SOURCES = [
  {id:'eeuu',   label:'EE.UU.',        icon:'🇺🇸'},
  {id:'europa', label:'Europa',        icon:'🇪🇺'},
  {id:'iran',   label:'Irán',          icon:'🇮🇷'},
  {id:'israel', label:'Israel',        icon:'🇮🇱'},
  {id:'golfo',  label:'Golfo Pérsico', icon:'🛢️'},
  {id:'intel',  label:'Inteligencia',  icon:'🔍'}
];

var SIE_STATIC = [
  {cat:'eeuu',   title:'Pentágono despliega segundo portaaviones en el Golfo Pérsico',body:'El USS Gerald R. Ford se une al USS Eisenhower. El Secretario de Defensa confirma que la presencia es "disuasoria y no ofensiva".',src:'DoD Statement',time:'Hace 3h',level:'SECRETO'},
  {cat:'eeuu',   title:'CIA evalúa capacidad iraní de minar el Estrecho de Hormuz',body:'Informe desclasificado parcialmente revela que Irán dispone de más de 5.000 minas navales capaces de bloquear el estrecho durante semanas.',src:'CIA Public Brief',time:'Hace 6h',level:'PÚBLICO'},
  {cat:'eeuu',   title:'Senado aprueba resolución de emergencia energética',body:'El Congreso autoriza la liberación de 30 millones de barriles de la Reserva Estratégica (SPR) para estabilizar los mercados.',src:'Congressional Record',time:'Hace 8h',level:'PÚBLICO'},
  {cat:'europa', title:'OTAN activa el Artículo 4 tras ataques a buques aliados',body:'Alemania y Francia despliegan fragatas en la región tras el ataque al buque alemán Nordlicht en el Golfo de Omán.',src:'NATO HQ Brussels',time:'Hace 2h',level:'RESTRINGIDO'},
  {cat:'europa', title:'BCE eleva previsión de inflación al 4.2% por crisis energética',body:'El Banco Central Europeo revisó al alza sus proyecciones citando el impacto directo del bloqueo en los precios de energía.',src:'ECB Press Release',time:'Hace 5h',level:'PÚBLICO'},
  {cat:'europa', title:'MI6 detecta operaciones iraníes de desinformación en Europa',body:'El servicio de inteligencia británico alerta sobre una campaña coordinada dirigida a sembrar discordia entre aliados europeos.',src:'GCHQ/MI6',time:'Hace 12h',level:'SECRETO'},
  {cat:'iran',   title:'CGRI anuncia ejercicios navales a gran escala en Hormuz',body:'El Cuerpo de la Guardia Revolucionaria Islámica lanzó los ejercicios "Mártires del Mar 7" con fragatas, submarinos y misiles antinave.',src:'IRNA State Media',time:'Hace 1h',level:'PÚBLICO'},
  {cat:'iran',   title:'Irán rechaza mediación de Omán y Qatar para reabrir el estrecho',body:'El Ministerio de Asuntos Exteriores iraní declaró que cualquier negociación debe incluir el levantamiento total de sanciones.',src:'Iranian MFA',time:'Hace 4h',level:'PÚBLICO'},
  {cat:'iran',   title:'Inteligencia israelí: Irán prepara misiles de largo alcance',body:'Fuentes alertan del despliegue de misiles Shahab-3 capaces de alcanzar bases en Arabia Saudita.',src:'Intelligence Brief',time:'Hace 9h',level:'SECRETO'},
  {cat:'israel', title:'Israel en alerta máxima ante riesgo de ataque iraní',body:'Las IDF elevaron su nivel de alerta al máximo. El sistema Iron Dome desplegado en puntos estratégicos del norte y sur.',src:'IDF Spokesperson',time:'Hace 2h',level:'PÚBLICO'},
  {cat:'israel', title:'Mossad opera activamente en el Golfo para proteger envíos',body:'El Mossad coordina con servicios de inteligencia del Golfo para identificar amenazas a buques con carga estratégica para Israel.',src:'Haaretz Intelligence',time:'Hace 7h',level:'RESTRINGIDO'},
  {cat:'golfo',  title:'Arabia Saudita aumenta producción para compensar caída de exportaciones',body:'Saudi Aramco confirmó un aumento de 500.000 barriles diarios destinados a clientes asiáticos redirigiendo envíos por el Mar Rojo.',src:'Saudi Aramco',time:'Hace 3h',level:'PÚBLICO'},
  {cat:'golfo',  title:'EAU permite uso de base aérea Al Dhafra a EE.UU.',body:'Abu Dabi autorizó operaciones de vigilancia y disuasión desde la base que ya alberga más de 2.000 soldados estadounidenses.',src:'UAE MoD',time:'Hace 5h',level:'RESTRINGIDO'},
  {cat:'golfo',  title:'Kuwait cierra parcialmente su espacio marítimo por riesgo de minas',body:'La Guardia Costera detectó objetos sospechosos y cerró preventivamente el corredor norte del Golfo Pérsico.',src:'Kuwait Coast Guard',time:'Hace 8h',level:'PÚBLICO'},
  {cat:'intel',  title:'GCHQ intercepta comunicaciones CGRI sobre operaciones futuras',body:'El GCHQ confirmó haber interceptado comunicaciones que sugieren nuevos ataques planificados contra infraestructura petrolera.',src:'GCHQ',time:'Hace 1h',level:'SECRETO'},
  {cat:'intel',  title:'Agencia DIA publica evaluación de amenaza: nivel ALTO',body:'La Agencia de Inteligencia de Defensa estadounidense elevó su evaluación de amenaza al nivel más alto desde 2020.',src:'DIA Public',time:'Hace 6h',level:'PÚBLICO'},
  {cat:'intel',  title:'BND alemán detecta movimientos de fuerzas especiales iraníes en Yemen',body:'El servicio de inteligencia exterior alemán reportó concentración inusual de las Quds Forces en zonas costeras de Yemen.',src:'BND Germany',time:'Hace 10h',level:'RESTRINGIDO'}
];

function initSIE(){
  var panel = document.getElementById('tab-sie');
  if(!panel) return;
  if(!currentUser || (currentUser.role!=='sie' && currentUser.role!=='admin')){
    renderSIELogin();
    return;
  }
  renderSIEDashboard();
}

function renderSIELogin(){
  var panel = document.getElementById('tab-sie'); if(!panel) return;
  panel.innerHTML =
    '<div style="display:flex;align-items:center;justify-content:center;min-height:450px;padding:2rem">' +
    '<div style="max-width:380px;width:100%">' +
      '<div style="text-align:center;margin-bottom:2rem">' +
        '<div style="font-size:2.5rem;margin-bottom:.8rem">🔐</div>' +
        '<div style="font-family:\'Bebas Neue\',sans-serif;font-size:1.8rem;letter-spacing:4px;color:#ef4444;margin-bottom:.3rem">ACCESO RESTRINGIDO</div>' +
        '<div style="font-family:\'JetBrains Mono\',monospace;font-size:.6rem;color:var(--mut3);letter-spacing:2px">SERVICIO DE INTELIGENCIA ESTRATÉGICA<br>SOLO PERSONAL AUTORIZADO</div>' +
      '</div>' +
      '<div style="background:rgba(239,68,68,.05);border:2px solid rgba(239,68,68,.25);border-radius:12px;padding:1.5rem">' +
        '<label class="lbl">ID DE AGENTE</label>' +
        '<input id="sie-user" type="text" class="linp" placeholder="usuario" autocomplete="off" style="margin-bottom:.8rem">' +
        '<label class="lbl">CÓDIGO DE ACCESO</label>' +
        '<input id="sie-pass" type="password" class="linp" placeholder="contraseña" autocomplete="off" style="margin-bottom:1rem">' +
        '<button onclick="doSIELogin()" class="lbtn">ACCEDER AL SISTEMA SIE</button>' +
        '<div id="sie-err" style="font-family:\'JetBrains Mono\',monospace;font-size:.6rem;color:#ef4444;text-align:center;margin-top:.6rem;min-height:.8rem"></div>' +
      '</div>' +
      '<div style="font-family:\'JetBrains Mono\',monospace;font-size:.5rem;color:var(--mut3);text-align:center;margin-top:1rem;line-height:1.6">El acceso no autorizado está penado por ley.<br>Todos los accesos quedan registrados.</div>' +
    '</div></div>';
  setTimeout(function(){
    var su=document.getElementById('sie-user'); if(su) su.addEventListener('keydown',function(e){if(e.key==='Enter')document.getElementById('sie-pass').focus();});
    var sp=document.getElementById('sie-pass'); if(sp) sp.addEventListener('keydown',function(e){if(e.key==='Enter')doSIELogin();});
  },100);
}

function doSIELogin(){
  var u=(document.getElementById('sie-user').value||'').trim().toLowerCase();
  var p=document.getElementById('sie-pass').value||'';
  var err=document.getElementById('sie-err');
  var users=getUsers();
  if(!users[u]||users[u].pass!==p||(users[u].role!=='sie'&&users[u].role!=='admin')){
    if(err) err.textContent='Credenciales incorrectas o acceso no autorizado';
    setTimeout(function(){if(err)err.textContent='';},3000);
    auditLog('SIE_FAIL','Intento fallido SIE: '+u,'SIE');
    return;
  }
  if(!currentUser) currentUser={username:u,role:users[u].role,name:users[u].name};
  auditLog('SIE_ACCESS','Acceso SIE autorizado','SIE');
  renderSIEDashboard();
}

function renderSIEDashboard(){
  var panel=document.getElementById('tab-sie'); if(!panel) return;
  var days=Math.floor((new Date()-CRISIS_START)/864e5);
  panel.innerHTML=
    '<div style="padding:1.2rem">'+
    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.1rem;flex-wrap:wrap;gap:.8rem">'+
      '<div style="display:flex;align-items:center;gap:.9rem">'+
        '<div style="background:linear-gradient(135deg,#ef4444,#7c3aed);width:42px;height:42px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:1.2rem;flex-shrink:0">🔍</div>'+
        '<div>'+
          '<div style="font-family:\'Bebas Neue\',sans-serif;font-size:1.7rem;letter-spacing:4px;color:#ef4444">SERVICIO DE INTELIGENCIA ESTRATÉGICA</div>'+
          '<div style="font-family:\'JetBrains Mono\',monospace;font-size:.55rem;color:var(--mut3);letter-spacing:1.5px">CLASIFICADO &middot; ACCESO: '+san(currentUser?currentUser.name:'SIE')+' &middot; '+new Date().toLocaleString('es-ES')+'</div>'+
        '</div>'+
      '</div>'+
      '<button onclick="loadSIENews()" style="background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);border-radius:6px;padding:.4rem .9rem;color:#ef4444;font-family:\'JetBrains Mono\',monospace;font-size:.6rem;letter-spacing:1px;cursor:pointer">ACTUALIZAR</button>'+
    '</div>'+
    '<div style="background:linear-gradient(90deg,rgba(239,68,68,.14),rgba(124,58,237,.06));border:1px solid rgba(239,68,68,.3);border-radius:8px;padding:.75rem 1rem;margin-bottom:1.1rem;display:flex;align-items:center;gap:.8rem">'+
      '<span style="font-size:1.1rem">⚠️</span>'+
      '<div style="font-family:\'JetBrains Mono\',monospace;font-size:.62rem;color:#ef4444;line-height:1.5">NIVEL DE AMENAZA GLOBAL: <strong>CRÍTICO</strong> &nbsp;|&nbsp; Bloqueo Hormuz Día '+days+' &nbsp;|&nbsp; CGRI en posición de ataque &nbsp;|&nbsp; Despliegue naval OTAN activo</div>'+
    '</div>'+
    '<div style="display:flex;gap:.4rem;flex-wrap:wrap;margin-bottom:1rem">'+
      '<button class="sie-cat active" onclick="setSIECat(\'all\',this)" style="background:rgba(239,68,68,.14);border:1px solid rgba(239,68,68,.28);border-radius:20px;padding:.28rem .75rem;color:#ef4444;font-family:\'JetBrains Mono\',monospace;font-size:.55rem;letter-spacing:1px;cursor:pointer">TODOS</button>'+
      SIE_SOURCES.map(function(s){return '<button class="sie-cat" onclick="setSIECat(\''+s.id+'\',this)" style="background:var(--card);border:1px solid var(--bor3);border-radius:20px;padding:.28rem .75rem;color:var(--mut3);font-family:\'JetBrains Mono\',monospace;font-size:.55rem;letter-spacing:1px;cursor:pointer">'+s.icon+' '+s.label+'</button>';}).join('')+
    '</div>'+
    '<div id="sie-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:.75rem">'+renderSIECards('all')+'</div>'+
    '</div>';
}

function setSIECat(cat,btn){
  sieCategory=cat;
  document.querySelectorAll('.sie-cat').forEach(function(b){b.style.background='var(--card)';b.style.borderColor='var(--bor3)';b.style.color='var(--mut3)';});
  btn.style.background='rgba(239,68,68,.14)';btn.style.borderColor='rgba(239,68,68,.28)';btn.style.color='#ef4444';
  var g=document.getElementById('sie-grid');if(g)g.innerHTML=renderSIECards(cat);
}

function renderSIECards(cat){
  var items=cat==='all'?SIE_STATIC:SIE_STATIC.filter(function(n){return n.cat===cat;});
  if(!items.length) return '<div style="padding:2rem;text-align:center;font-family:\'JetBrains Mono\',monospace;font-size:.65rem;color:var(--mut3)">Sin informes en esta categoría</div>';
  var LC={'PÚBLICO':{bg:'rgba(16,185,129,.09)',bc:'rgba(16,185,129,.22)',tc:'#10b981',lc:'#10b981'},'RESTRINGIDO':{bg:'rgba(245,158,11,.09)',bc:'rgba(245,158,11,.22)',tc:'#f59e0b',lc:'#f59e0b'},'SECRETO':{bg:'rgba(239,68,68,.1)',bc:'rgba(239,68,68,.28)',tc:'#ef4444',lc:'#ef4444'}};
  return items.map(function(n){
    var c=LC[n.level]||LC['PÚBLICO'];
    return '<div style="background:var(--card2);border:1px solid var(--bor2);border-radius:10px;padding:.88rem;position:relative;overflow:hidden">'+
      '<div style="position:absolute;left:0;top:0;bottom:0;width:3px;background:'+c.lc+'"></div>'+
      '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:.45rem;gap:.4rem">'+
        '<div style="font-size:var(--fs-md);font-weight:700;color:var(--txt);line-height:1.35;flex:1">'+san(n.title)+'</div>'+
        '<span style="background:'+c.bg+';border:1px solid '+c.bc+';color:'+c.tc+';font-family:\'JetBrains Mono\',monospace;font-size:.44rem;padding:2px 6px;border-radius:3px;letter-spacing:1px;text-transform:uppercase;white-space:nowrap;flex-shrink:0">'+n.level+'</span>'+
      '</div>'+
      '<div style="font-size:var(--fs-sm);color:var(--txt2);line-height:1.5;margin-bottom:.45rem">'+san(n.body)+'</div>'+
      '<div style="display:flex;justify-content:space-between;font-family:\'JetBrains Mono\',monospace;font-size:.5rem;color:var(--mut3)">'+
        '<span style="color:var(--acc)">'+san(n.src)+'</span><span>'+san(n.time)+'</span>'+
      '</div>'+
    '</div>';
  }).join('');
}

function loadSIENews(){
  if(!_nkey){ renderSIEDashboard(); return; }
  var g=document.getElementById('sie-grid');
  if(g) g.innerHTML='<div style="padding:2rem;text-align:center;font-family:\'JetBrains Mono\',monospace;font-size:.65rem;color:var(--acc)">Actualizando desde NewsAPI...</div>';
  var q=encodeURIComponent('Iran Hormuz Middle East geopolitics Israel Gulf 2026');
  fetch('https://newsapi.org/v2/everything?q='+q+'&language=en&sortBy=publishedAt&pageSize=20&apiKey='+_nkey)
  .then(function(r){return r.json();})
  .then(function(d){
    if(!d.articles||!d.articles.length){renderSIEDashboard();return;}
    var extra=d.articles.slice(0,12).map(function(a){return{cat:'intel',title:a.title||'Sin título',body:(a.description||'').slice(0,180),src:a.source&&a.source.name?a.source.name:'NewsAPI',time:a.publishedAt?new Date(a.publishedAt).toLocaleString('es-ES'):'--',level:'PÚBLICO'};});
    var all=SIE_STATIC.concat(extra);
    var g2=document.getElementById('sie-grid');
    if(g2) g2.innerHTML=renderSIECards2(all);
  }).catch(function(){renderSIEDashboard();});
}

function renderSIECards2(items){
  var LC={'PÚBLICO':{bg:'rgba(16,185,129,.09)',bc:'rgba(16,185,129,.22)',tc:'#10b981',lc:'#10b981'},'RESTRINGIDO':{bg:'rgba(245,158,11,.09)',bc:'rgba(245,158,11,.22)',tc:'#f59e0b',lc:'#f59e0b'},'SECRETO':{bg:'rgba(239,68,68,.1)',bc:'rgba(239,68,68,.28)',tc:'#ef4444',lc:'#ef4444'}};
  return items.map(function(n){
    var c=LC[n.level]||LC['PÚBLICO'];
    return '<div style="background:var(--card2);border:1px solid var(--bor2);border-radius:10px;padding:.88rem;position:relative;overflow:hidden">'+
      '<div style="position:absolute;left:0;top:0;bottom:0;width:3px;background:'+c.lc+'"></div>'+
      '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:.45rem;gap:.4rem">'+
        '<div style="font-size:var(--fs-md);font-weight:700;color:var(--txt);line-height:1.35;flex:1">'+san(n.title)+'</div>'+
        '<span style="background:'+c.bg+';border:1px solid '+c.bc+';color:'+c.tc+';font-family:\'JetBrains Mono\',monospace;font-size:.44rem;padding:2px 6px;border-radius:3px;letter-spacing:1px;text-transform:uppercase;white-space:nowrap;flex-shrink:0">'+n.level+'</span>'+
      '</div>'+
      '<div style="font-size:var(--fs-sm);color:var(--txt2);line-height:1.5;margin-bottom:.45rem">'+san(n.body)+'</div>'+
      '<div style="display:flex;justify-content:space-between;font-family:\'JetBrains Mono\',monospace;font-size:.5rem;color:var(--mut3)">'+
        '<span style="color:var(--acc)">'+san(n.src)+'</span><span>'+san(n.time)+'</span>'+
      '</div>'+
    '</div>';
  }).join('');
}
