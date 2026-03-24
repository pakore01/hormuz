/* ═══════════════════════════════════════════════
   sie.js — Servicio de Inteligencia Estratégica
   Acceso restringido — solo rol SIE / Admin
   Noticias geopolíticas clasificadas
═══════════════════════════════════════════════ */
'use strict';

var sieLoaded   = false;
var sieCategory = 'all';
var sieNewsKey  = '';

var SIE_SOURCES = [
  {id:'eeuu',   label:'EE.UU.',        icon:'🇺🇸', query:'US foreign policy Iran Middle East Gulf 2026'},
  {id:'europa', label:'Europa',        icon:'🇪🇺', query:'Europe geopolitics Iran oil crisis 2026'},
  {id:'iran',   label:'Irán',          icon:'🇮🇷', query:'Iran nuclear Hormuz blockade 2026'},
  {id:'israel', label:'Israel',        icon:'🇮🇱', query:'Israel Iran conflict Middle East 2026'},
  {id:'golfo',  label:'Golfo Pérsico', icon:'🛢️', query:'Persian Gulf oil tanker crisis 2026'},
  {id:'intel',  label:'Inteligencia',  icon:'🔍', query:'CIA intelligence Iran Hormuz secret 2026'}
];

var SIE_STATIC = [
  {cat:'eeuu',   title:'Pentágono despliega segundo portaaviones en el Golfo Pérsico',           body:'El USS Gerald R. Ford se une al USS Dwight D. Eisenhower en el Golfo de Omán. El Secretario de Defensa confirma que la presencia es "disuasoria y no ofensiva".',                  src:'DoD Statement',     time:'Hace 3h',   level:'SECRETO'},
  {cat:'eeuu',   title:'CIA evalúa capacidad iraní de minar el Estrecho de Hormuz',              body:'Informe desclasificado parcialmente revela que Irán dispone de más de 5.000 minas navales capaces de bloquear el estrecho durante semanas.',                                        src:'CIA Public Brief',  time:'Hace 6h',   level:'PÚBLICO'},
  {cat:'eeuu',   title:'Senado aprueba resolución de emergencia energética',                      body:'El Congreso autoriza la liberación de 30 millones de barriles de la Reserva Estratégica de Petróleo (SPR) para estabilizar los mercados.',                                          src:'Congressional Record',time:'Hace 8h', level:'PÚBLICO'},
  {cat:'europa', title:'OTAN activa el Artículo 4 tras ataques a buques aliados',                body:'La Alianza convoca consultas urgentes tras el ataque al buque alemán Nordlicht en el Golfo de Omán. Alemania y Francia despliegan fragatas en la región.',                          src:'NATO HQ Brussels',  time:'Hace 2h',   level:'RESTRINGIDO'},
  {cat:'europa', title:'BCE eleva previsión de inflación al 4.2% por crisis energética',         body:'El Banco Central Europeo revisó al alza sus proyecciones de inflación citando el impacto directo del bloqueo en los precios de energía y transporte.',                              src:'ECB Press Release', time:'Hace 5h',   level:'PÚBLICO'},
  {cat:'europa', title:'MI6 detecta operaciones iraníes de desinformación en Europa',             body:'El servicio de inteligencia británico alerta sobre una campaña coordinada de desinformación iraní dirigida a sembrar discordia entre aliados europeos.',                             src:'GCHQ/MI6',          time:'Hace 12h',  level:'SECRETO'},
  {cat:'iran',   title:'CGRI anuncia ejercicios navales a gran escala en Hormuz',                 body:'El Cuerpo de la Guardia Revolucionaria Islámica lanzó los ejercicios "Mártires del Mar 7" con participación de fragatas, submarinos y misiles antinave.',                           src:'IRNA State Media',  time:'Hace 1h',   level:'PÚBLICO'},
  {cat:'iran',   title:'Irán rechaza mediación de Omán y Qatar para reabrir el estrecho',        body:'El Ministerio de Asuntos Exteriores iraní declaró que cualquier negociación debe incluir el levantamiento total de las sanciones como condición previa.',                          src:'Iranian MFA',       time:'Hace 4h',   level:'PÚBLICO'},
  {cat:'iran',   title:'Inteligencia israelí: Irán prepara misiles de largo alcance',             body:'Fuentes de inteligencia israelí citadas por medios especializados advierten del despliegue de misiles Shahab-3 capaces de alcanzar bases en Arabia Saudita.',                       src:'Intelligence Brief', time:'Hace 9h',  level:'SECRETO'},
  {cat:'israel', title:'Israel en alerta máxima ante riesgo de ataque iraní',                    body:'Las Fuerzas de Defensa israelíes (IDF) elevaron su nivel de alerta al máximo. El sistema Iron Dome desplegado en puntos estratégicos del norte y sur.',                            src:'IDF Spokesperson',  time:'Hace 2h',   level:'PÚBLICO'},
  {cat:'israel', title:'Mossad opera activamente en el Golfo para proteger envíos',              body:'Según fuentes diplomáticas, el Mossad coordina con servicios de inteligencia del Golfo para identificar amenazas a buques con carga estratégica para Israel.',                      src:'Haaretz Intelligence',time:'Hace 7h', level:'RESTRINGIDO'},
  {cat:'golfo',  title:'Arabia Saudita aumenta producción para compensar caída de exportaciones', body:'Saudi Aramco confirmó un aumento de producción de 500.000 barriles diarios destinados a clientes asiáticos redirigiendo envíos por el Mar Rojo hasta su reapertura.',              src:'Saudi Aramco',      time:'Hace 3h',   level:'PÚBLICO'},
  {cat:'golfo',  title:'EAU permite uso de base aérea de Al Dhafra a EE.UU. para operaciones',  body:'Abu Dabi autorizó el uso de la base aérea Al Dhafra para operaciones de vigilancia y disuasión. La base alberga ya más de 2.000 soldados estadounidenses.',                       src:'UAE MoD',           time:'Hace 5h',   level:'RESTRINGIDO'},
  {cat:'golfo',  title:'Kuwait cierra parcialmente su espacio marítimo por riesgo de minas',      body:'La Guardia Costera de Kuwait detectó objetos sospechosos en aguas territoriales y cerró preventivamente el corredor norte del Golfo Pérsico.',                                    src:'Kuwait Coast Guard', time:'Hace 8h',  level:'PÚBLICO'},
  {cat:'intel',  title:'GCHQ intercepta comunicaciones CGRI sobre operaciones futuras',          body:'El cuartel general de comunicaciones del gobierno británico confirmó haber interceptado comunicaciones que sugieren nuevos ataques planificados contra infraestructura petrolera.',  src:'GCHQ',              time:'Hace 1h',   level:'SECRETO'},
  {cat:'intel',  title:'Agencia DIA publica evaluación de amenaza: nivel ALTO',                  body:'La Agencia de Inteligencia de Defensa estadounidense elevó su evaluación de amenaza en el Estrecho de Hormuz al nivel más alto desde 2020.',                                       src:'DIA Public',        time:'Hace 6h',   level:'PÚBLICO'},
  {cat:'intel',  title:'BND alemán detecta movimientos de fuerzas especiales iraníes en Yemen',  body:'El servicio de inteligencia exterior alemán reportó concentración inusual de efectivos de las Quds Forces en zonas costeras de Yemen, cerca de Bab el-Mandeb.',                  src:'BND Germany',       time:'Hace 10h',  level:'RESTRINGIDO'}
];

function initSIE(){
  if(!currentUser || (currentUser.role!=='sie' && currentUser.role!=='admin')){
    /* show SIE login */
    renderSIELogin();
    return;
  }
  renderSIEDashboard();
}

function renderSIELogin(){
  var panel = document.getElementById('tab-sie');
  if(!panel) return;
  panel.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;min-height:400px;padding:2rem">' +
    '<div style="max-width:380px;width:100%">' +
      '<div style="text-align:center;margin-bottom:2rem">' +
        '<div style="font-size:2rem;margin-bottom:.5rem">🔐</div>' +
        '<div style="font-family:\'Bebas Neue\',sans-serif;font-size:1.8rem;letter-spacing:4px;color:#ef4444;margin-bottom:.3rem">SIE — ACCESO RESTRINGIDO</div>' +
        '<div style="font-family:\'JetBrains Mono\',monospace;font-size:.6rem;color:var(--mut3);letter-spacing:2px">SERVICIO DE INTELIGENCIA ESTRATÉGICA<br>INFORMACIÓN CLASIFICADA — SOLO PERSONAL AUTORIZADO</div>' +
      '</div>' +
      '<div style="background:rgba(239,68,68,.05);border:2px solid rgba(239,68,68,.3);border-radius:12px;padding:1.5rem">' +
        '<label style="font-family:\'JetBrains Mono\',monospace;font-size:.55rem;letter-spacing:2px;text-transform:uppercase;color:var(--mut3);display:block;margin-bottom:.35rem">ID DE AGENTE</label>' +
        '<input id="sie-user" type="text" placeholder="usuario" class="linp" style="margin-bottom:.8rem" autocomplete="off">' +
        '<label style="font-family:\'JetBrains Mono\',monospace;font-size:.55rem;letter-spacing:2px;text-transform:uppercase;color:var(--mut3);display:block;margin-bottom:.35rem">CÓDIGO DE ACCESO</label>' +
        '<input id="sie-pass" type="password" placeholder="contraseña" class="linp" style="margin-bottom:1rem" autocomplete="off">' +
        '<button onclick="doSIELogin()" class="lbtn">ACCEDER AL SISTEMA SIE</button>' +
        '<div id="sie-err" style="font-family:\'JetBrains Mono\',monospace;font-size:.58rem;color:#ef4444;text-align:center;margin-top:.6rem;min-height:.8rem"></div>' +
      '</div>' +
      '<div style="font-family:\'JetBrains Mono\',monospace;font-size:.5rem;color:var(--mut2);text-align:center;margin-top:1rem;line-height:1.6">El acceso no autorizado a este sistema está penado por ley.<br>Todos los accesos quedan registrados.</div>' +
    '</div>' +
  '</div>';
  setTimeout(function(){
    var si = document.getElementById('sie-user');
    if(si) si.addEventListener('keydown',function(e){if(e.key==='Enter')document.getElementById('sie-pass').focus();});
    var sp = document.getElementById('sie-pass');
    if(sp) sp.addEventListener('keydown',function(e){if(e.key==='Enter')doSIELogin();});
  },100);
}

function doSIELogin(){
  var u = (document.getElementById('sie-user').value||'').trim().toLowerCase();
  var p = document.getElementById('sie-pass').value||'';
  var err = document.getElementById('sie-err');
  var users = getUsers();
  if(!users[u]||users[u].pass!==p||(users[u].role!=='sie'&&users[u].role!=='admin')){
    if(err) err.textContent = 'Credenciales incorrectas o acceso no autorizado';
    setTimeout(function(){ if(err) err.textContent=''; },3000);
    auditLog('SIE_FAIL','Intento fallido SIE: '+u,'SIE');
    return;
  }
  if(!currentUser){ currentUser={username:u,role:users[u].role,name:users[u].name}; }
  auditLog('SIE_ACCESS','Acceso SIE autorizado','SIE');
  renderSIEDashboard();
}

function renderSIEDashboard(){
  var panel = document.getElementById('tab-sie');
  if(!panel) return;
  var now = new Date().toLocaleString('es-ES');

  panel.innerHTML =
    '<div style="padding:1.2rem">' +

    /* Header */
    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.2rem;flex-wrap:wrap;gap:.8rem">' +
      '<div style="display:flex;align-items:center;gap:1rem">' +
        '<div style="background:linear-gradient(135deg,#ef4444,#7c3aed);width:44px;height:44px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:1.3rem;flex-shrink:0">🔍</div>' +
        '<div>' +
          '<div style="font-family:\'Bebas Neue\',sans-serif;font-size:1.8rem;letter-spacing:4px;color:#ef4444">SERVICIO DE INTELIGENCIA ESTRATÉGICA</div>' +
          '<div style="font-family:\'JetBrains Mono\',monospace;font-size:.55rem;color:var(--mut3);letter-spacing:1.5px">INFORMACIÓN CLASIFICADA &middot; ACCESO: '+san(currentUser?currentUser.name:'SIE')+' &middot; '+now+'</div>' +
        '</div>' +
      '</div>' +
      '<div style="display:flex;gap:.5rem;align-items:center">' +
        '<button onclick="loadSIENews()" style="background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);border-radius:6px;padding:.4rem .9rem;color:#ef4444;font-family:\'JetBrains Mono\',monospace;font-size:.6rem;letter-spacing:1px;cursor:pointer">ACTUALIZAR</button>' +
      '</div>' +
    '</div>' +

    /* Alert banner */
    '<div style="background:linear-gradient(90deg,rgba(239,68,68,.15),rgba(124,58,237,.08));border:1px solid rgba(239,68,68,.35);border-radius:8px;padding:.8rem 1rem;margin-bottom:1.2rem;display:flex;align-items:center;gap:.8rem">' +
      '<span style="font-size:1.1rem;animation:pulse 2s infinite">⚠️</span>' +
      '<div style="font-family:\'JetBrains Mono\',monospace;font-size:.62rem;color:#ef4444;line-height:1.6">NIVEL DE AMENAZA GLOBAL: <strong>CRÍTICO</strong> &nbsp;|&nbsp; Bloqueo Hormuz Día '+calcDaysSinceCrisis()+' &nbsp;|&nbsp; CGRI en posición de ataque &nbsp;|&nbsp; Despliegue naval OTAN activo</div>' +
    '</div>' +

    /* Category filter */
    '<div style="display:flex;gap:.4rem;flex-wrap:wrap;margin-bottom:1rem">' +
      '<button class="sie-cat-btn active" onclick="setSIECat(\'all\',this)" style="background:rgba(239,68,68,.15);border:1px solid rgba(239,68,68,.3);border-radius:20px;padding:.3rem .8rem;color:#ef4444;font-family:\'JetBrains Mono\',monospace;font-size:.55rem;letter-spacing:1px;cursor:pointer">TODOS</button>' +
      SIE_SOURCES.map(function(s){
        return '<button class="sie-cat-btn" onclick="setSIECat(\''+s.id+'\',this)" style="background:var(--card);border:1px solid var(--bor3);border-radius:20px;padding:.3rem .8rem;color:var(--mut3);font-family:\'JetBrains Mono\',monospace;font-size:.55rem;letter-spacing:1px;cursor:pointer">'+s.icon+' '+s.label+'</button>';
      }).join('') +
    '</div>' +

    /* News grid */
    '<div id="sie-news-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:.8rem">' +
      renderSIECards('all') +
    '</div>' +

    '</div>';
}

function calcDaysSinceCrisis(){
  return Math.floor((new Date()-CRISIS_START)/(1000*60*60*24));
}

function setSIECat(cat, btn){
  sieCategory = cat;
  document.querySelectorAll('.sie-cat-btn').forEach(function(b){
    b.style.background='var(--card)';b.style.borderColor='var(--bor3)';b.style.color='var(--mut3)';
  });
  btn.style.background='rgba(239,68,68,.15)';
  btn.style.borderColor='rgba(239,68,68,.3)';
  btn.style.color='#ef4444';
  var grid = document.getElementById('sie-news-grid');
  if(grid) grid.innerHTML = renderSIECards(cat);
}

function renderSIECards(cat){
  var items = cat==='all' ? SIE_STATIC : SIE_STATIC.filter(function(n){ return n.cat===cat; });
  if(!items.length) return '<div style="padding:2rem;text-align:center;font-family:\'JetBrains Mono\',monospace;font-size:.65rem;color:var(--mut3)">Sin informes en esta categoría</div>';

  var LEVEL_COLOR = {
    'PÚBLICO':     {bg:'rgba(16,185,129,.1)',  border:'rgba(16,185,129,.25)', txt:'#10b981'},
    'RESTRINGIDO': {bg:'rgba(245,158,11,.1)',  border:'rgba(245,158,11,.25)', txt:'#f59e0b'},
    'SECRETO':     {bg:'rgba(239,68,68,.12)',  border:'rgba(239,68,68,.3)',   txt:'#ef4444'}
  };

  var src_info = {};
  SIE_SOURCES.forEach(function(s){ src_info[s.id]=s; });

  return items.map(function(n){
    var lc = LEVEL_COLOR[n.level]||LEVEL_COLOR['PÚBLICO'];
    var si = src_info[n.cat]||{icon:'📋',label:n.cat};
    var leftColor = n.level==='SECRETO'?'#ef4444':n.level==='RESTRINGIDO'?'#f59e0b':'#10b981';
    return '<div style="background:var(--card2);border:1px solid var(--bor2);border-radius:10px;padding:.9rem;position:relative;overflow:hidden;cursor:default">' +
      '<div style="position:absolute;left:0;top:0;bottom:0;width:3px;background:'+leftColor+'"></div>' +
      '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:.5rem;gap:.4rem">' +
        '<div style="font-size:var(--fs-md);font-weight:700;color:var(--txt);line-height:1.35;flex:1">'+san(n.title)+'</div>' +
        '<span style="background:'+lc.bg+';border:1px solid '+lc.border+';color:'+lc.txt+';font-family:\'JetBrains Mono\',monospace;font-size:.44rem;padding:2px 6px;border-radius:3px;letter-spacing:1px;text-transform:uppercase;white-space:nowrap;flex-shrink:0">'+n.level+'</span>' +
      '</div>' +
      '<div style="font-size:var(--fs-sm);color:var(--txt2);line-height:1.55;margin-bottom:.5rem">'+san(n.body)+'</div>' +
      '<div style="display:flex;justify-content:space-between;font-family:\'JetBrains Mono\',monospace;font-size:.5rem;color:var(--mut3)">' +
        '<span style="color:var(--acc)">'+si.icon+' '+san(n.src)+'</span>' +
        '<span>'+san(n.time)+'</span>' +
      '</div>' +
    '</div>';
  }).join('');
}

function loadSIENews(){
  /* If NewsAPI key available, fetch real news */
  if(!_nkey){
    renderSIEDashboard();
    return;
  }
  var grid = document.getElementById('sie-news-grid');
  if(grid) grid.innerHTML = '<div style="padding:2rem;text-align:center;font-family:\'JetBrains Mono\',monospace;font-size:.65rem;color:var(--acc)">Actualizando desde NewsAPI...</div>';

  var query = encodeURIComponent('Iran Hormuz Middle East geopolitics Israel Gulf 2026');
  var url   = 'https://newsapi.org/v2/everything?q='+query+'&language=en&sortBy=publishedAt&pageSize=20&apiKey='+_nkey;

  fetch(url)
  .then(function(r){ return r.json(); })
  .then(function(d){
    if(!d.articles||!d.articles.length){ renderSIEDashboard(); return; }
    var items = d.articles.slice(0,16).map(function(a){
      return {
        cat: 'intel',
        title: a.title||'Sin título',
        body:  (a.description||'').slice(0,200),
        src:   a.source&&a.source.name?a.source.name:'NewsAPI',
        time:  a.publishedAt?new Date(a.publishedAt).toLocaleString('es-ES'):'--',
        level: 'PÚBLICO'
      };
    });
    /* Merge with static */
    var merged = SIE_STATIC.concat(items);
    var grid2  = document.getElementById('sie-news-grid');
    if(grid2) grid2.innerHTML = merged.map(function(n){
      var lc={'PÚBLICO':{bg:'rgba(16,185,129,.1)',border:'rgba(16,185,129,.25)',txt:'#10b981'},'RESTRINGIDO':{bg:'rgba(245,158,11,.1)',border:'rgba(245,158,11,.25)',txt:'#f59e0b'},'SECRETO':{bg:'rgba(239,68,68,.12)',border:'rgba(239,68,68,.3)',txt:'#ef4444'}};
      var c=lc[n.level]||lc['PÚBLICO'];
      var leftColor=n.level==='SECRETO'?'#ef4444':n.level==='RESTRINGIDO'?'#f59e0b':'#10b981';
      return '<div style="background:var(--card2);border:1px solid var(--bor2);border-radius:10px;padding:.9rem;position:relative;overflow:hidden">' +
        '<div style="position:absolute;left:0;top:0;bottom:0;width:3px;background:'+leftColor+'"></div>' +
        '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:.5rem;gap:.4rem">' +
          '<div style="font-size:var(--fs-md);font-weight:700;color:var(--txt);line-height:1.35;flex:1">'+san(n.title)+'</div>' +
          '<span style="background:'+c.bg+';border:1px solid '+c.border+';color:'+c.txt+';font-family:\'JetBrains Mono\',monospace;font-size:.44rem;padding:2px 6px;border-radius:3px;letter-spacing:1px;text-transform:uppercase;white-space:nowrap;flex-shrink:0">'+n.level+'</span>' +
        '</div>' +
        '<div style="font-size:var(--fs-sm);color:var(--txt2);line-height:1.55;margin-bottom:.5rem">'+san(n.body)+'</div>' +
        '<div style="display:flex;justify-content:space-between;font-family:\'JetBrains Mono\',monospace;font-size:.5rem;color:var(--mut3)"><span style="color:var(--acc)">'+san(n.src)+'</span><span>'+san(n.time)+'</span></div>' +
      '</div>';
    }).join('');
  })
  .catch(function(){ renderSIEDashboard(); });
}
