/* ═══════════════════════════════════════════════
   intel.js — Módulo de Inteligencia Global
   Fuentes: RSS/feeds abiertos de agencias y medios
   especializados en geopolítica e inteligencia.
   Auto-refresh cada 15min · Clasificación por gravedad
   · Traducción al español vía API Claude
═══════════════════════════════════════════════ */
'use strict';

/* ── AGENCIAS DE INTELIGENCIA — configuración ── */
var INTEL_AGENCIES = [
  {
    id:    'cia',
    name:  'CIA',
    full:  'Central Intelligence Agency',
    flag:  '🇺🇸',
    color: '#3b82f6',
    /* CIA publica informes en su sitio oficial y via RSS */
    feed:  'https://www.cia.gov/rss-feeds/press-releases-statements.xml',
    alt:   'https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fwww.cia.gov%2Frss-feeds%2Fpress-releases-statements.xml'
  },
  {
    id:    'mossad',
    name:  'MOSSAD',
    full:  'Instituto de Inteligencia y Operaciones Especiales',
    flag:  '🇮🇱',
    color: '#3b82f6',
    /* Mossad no tiene feed público — usamos fuente de inteligencia israelí */
    feed:  null,
    alt:   'https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fwww.haaretz.com%2Frss%2Fsection%2Fintelligence'
  },
  {
    id:    'mi6',
    name:  'MI6 / SIS',
    full:  'Secret Intelligence Service (Reino Unido)',
    flag:  '🇬🇧',
    color: '#8b5cf6',
    feed:  null,
    alt:   'https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fwww.gov.uk%2Fgovernment%2Forganisations%2Fsecret-intelligence-service.atom'
  },
  {
    id:    'fsb',
    name:  'FSB',
    full:  'Servicio Federal de Seguridad (Rusia)',
    flag:  '🇷🇺',
    color: '#ef4444',
    feed:  null,
    alt:   'https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fwww.bellingcat.com%2Ffeed%2F'
  },
  {
    id:    'mss',
    name:  'MSS',
    full:  'Ministerio de Seguridad del Estado (China)',
    flag:  '🇨🇳',
    color: '#ef4444',
    feed:  null,
    alt:   'https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fwww.scmp.com%2Frss%2F318203%2Ffeed'
  },
  {
    id:    'dgse',
    name:  'DGSE',
    full:  'Dirección General de Seguridad Exterior (Francia)',
    flag:  '🇫🇷',
    color: '#3b82f6',
    feed:  null,
    alt:   'https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fwww.defense.gouv.fr%2Frss%2Factualites.xml'
  },
  {
    id:    'nsa',
    name:  'NSA',
    full:  'Agencia de Seguridad Nacional (EE.UU.)',
    flag:  '🇺🇸',
    color: '#06b6d4',
    feed:  null,
    alt:   'https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fwww.nsa.gov%2FRss%2F&'
  },
  {
    id:    'bnd',
    name:  'BND',
    full:  'Bundesnachrichtendienst (Alemania)',
    flag:  '🇩🇪',
    color: '#f59e0b',
    feed:  null,
    alt:   'https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fwww.bmi.bund.de%2FBMI%2FDE%2FService%2FRSS%2FRSSFeed%2FRSSFeed_node.xml'
  },
  {
    id:    'cni',
    name:  'CNI',
    full:  'Centro Nacional de Inteligencia (España)',
    flag:  '🇪🇸',
    color: '#f97316',
    feed:  null,
    alt:   'https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fwww.cni.es%2Frss%2Fnoticias.xml'
  }
];

/* ── FUENTES GEOPOLÍTICAS ABIERTAS (respaldo) ── */
var INTEL_OPEN_SOURCES = [
  {id:'rss-bbc',       label:'BBC World',      url:'https://api.rss2json.com/v1/api.json?rss_url=http%3A%2F%2Ffeeds.bbci.co.uk%2Fnews%2Fworld%2Frss.xml'},
  {id:'rss-reuters',   label:'Reuters',        url:'https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Ffeeds.reuters.com%2Frss%2FworldNews'},
  {id:'rss-apnews',    label:'AP News',        url:'https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Frsshub.app%2Fapnews%2Ftopics%2Fworld-news'},
  {id:'rss-aljazeera', label:'Al Jazeera',     url:'https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fwww.aljazeera.com%2Fxml%2Frss%2Fall.xml'},
  {id:'rss-bellingcat', label:'Bellingcat',    url:'https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fwww.bellingcat.com%2Ffeed%2F'},
  {id:'rss-fp',        label:'Foreign Policy', url:'https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fforeignpolicy.com%2Ffeed%2F'}
];

/* ── PALABRAS CLAVE para filtrar geopolítica ── */
var INTEL_KEYWORDS = [
  'espionaje','inteligencia','intelligence','spy','surveillance','cybersecurity','cyber',
  'nuclear','misil','missile','sanction','sancion','terror','military','militar',
  'iran','hormuz','rusia','russia','china','israel','nato','otan','ukraine','ucrania',
  'middle east','oriente medio','gulf','golfo','oil','petróleo','geopolit',
  'cia','fbi','mossad','mi6','fsb','mss','bnd','dgse','nsa','gchq',
  'covert','classified','operacion','operation','counterintelligence',
  'black ops','signals','sigint','humint','drone','ataque','atack','war','guerra'
];

/* ── CLASIFICACIÓN DE GRAVEDAD ── */
var INTEL_SEV_RULES = [
  {sev:'critical', keywords:['nuclear','ataque','missile','misil','war','guerra','terror','killed','muertos','explosion','attack','atentado']},
  {sev:'high',     keywords:['sanction','sancion','military operation','operacion militar','cyber attack','espionaje','spy arrested','agent','classified leak']},
  {sev:'medium',   keywords:['intelligence','inteligencia','surveillance','monitor','diplomatic','diplomac','military exercise','ejercicio']},
  {sev:'low',      keywords:[]}
];

/* ── ESTADO DEL MÓDULO ── */
var intelData        = [];
var intelFilterAgency = 'all';
var intelFilterSev    = 'all';
var intelAutoTimer    = null;
var intelTranslating  = false;
var intelTranslated   = false;
var intelLoading      = false;
var intelLastFetch    = null;

/* ── CLASIFICAR GRAVEDAD ── */
function classifyIntelSev(title, body){
  var text = (title + ' ' + body).toLowerCase();
  for(var i=0;i<INTEL_SEV_RULES.length-1;i++){
    var rule = INTEL_SEV_RULES[i];
    for(var j=0;j<rule.keywords.length;j++){
      if(text.indexOf(rule.keywords[j])!==-1) return rule.sev;
    }
  }
  return 'low';
}

/* ── RELEVANCIA GEOPOLÍTICA ── */
function isGeoRelevant(title, body){
  var text = (title + ' ' + body).toLowerCase();
  for(var i=0;i<INTEL_KEYWORDS.length;i++){
    if(text.indexOf(INTEL_KEYWORDS[i])!==-1) return true;
  }
  return false;
}

/* ── FETCH RSS VIA rss2json PROXY ── */
function fetchIntelFeed(url, agencyId, agencyLabel, agencyFlag, agencyColor, cb){
  fetch(url, {signal: AbortSignal.timeout ? AbortSignal.timeout(8000) : undefined})
  .then(function(r){ return r.json(); })
  .then(function(d){
    var items = [];
    if(d && d.items && d.items.length){
      var raw = d.items.slice(0,20);
      for(var i=0;i<raw.length;i++){
        var it = raw[i];
        var title = (it.title||'Sin título').replace(/<[^>]+>/g,'').trim();
        var body  = (it.description||it.content||'').replace(/<[^>]+>/g,'').trim().slice(0,220);
        if(!isGeoRelevant(title, body)) continue;
        items.push({
          id:       agencyId+'-'+i+'-'+Date.now(),
          agency:   agencyId,
          agLabel:  agencyLabel,
          agFlag:   agencyFlag,
          agColor:  agencyColor,
          title:    title,
          body:     body,
          sev:      classifyIntelSev(title, body),
          url:      it.link||it.url||'',
          pubDate:  it.pubDate ? new Date(it.pubDate) : new Date(),
          translated: false,
          titleEs:  '',
          bodyEs:   ''
        });
      }
    }
    cb(null, items);
  })
  .catch(function(e){ cb(e, []); });
}

/* ── CARGAR TODAS LAS FUENTES ── */
function loadIntelFeeds(){
  if(intelLoading) return;
  intelLoading = true;
  intelTranslated = false;
  renderIntelStatus('cargando');

  var allResults = [];
  var pending    = 0;
  var sources    = [];

  /* Agencias con feed alternativo */
  for(var i=0;i<INTEL_AGENCIES.length;i++){
    var ag = INTEL_AGENCIES[i];
    if(ag.alt) sources.push({url:ag.alt, id:ag.id, label:ag.name, flag:ag.flag, color:ag.color});
  }
  /* Fuentes abiertas adicionales */
  for(var j=0;j<INTEL_OPEN_SOURCES.length;j++){
    var os = INTEL_OPEN_SOURCES[j];
    sources.push({url:os.url, id:os.id, label:os.label, flag:'🌐', color:'#10b981'});
  }

  if(sources.length===0){ intelLoading=false; return; }
  pending = sources.length;

  function done(err, items){
    if(items && items.length) allResults = allResults.concat(items);
    pending--;
    if(pending<=0){
      intelLoading  = false;
      intelLastFetch = new Date();
      /* Ordenar: critical > high > medium > low > fecha */
      var sevOrder = {critical:0, high:1, medium:2, low:3};
      allResults.sort(function(a,b){
        var sd = sevOrder[a.sev] - sevOrder[b.sev];
        if(sd!==0) return sd;
        return b.pubDate - a.pubDate;
      });
      /* Deduplicar por título similar */
      var seen = {};
      intelData = allResults.filter(function(it){
        var key = it.title.slice(0,40).toLowerCase();
        if(seen[key]) return false;
        seen[key] = true;
        return true;
      });
      renderIntelStatus('ok');
      renderIntelList();
    }
  }

  for(var k=0;k<sources.length;k++){
    (function(src){
      fetchIntelFeed(src.url, src.id, src.label, src.flag, src.color, done);
    })(sources[k]);
  }
}

/* ── RENDERIZAR ESTADO ── */
function renderIntelStatus(state){
  var el = document.getElementById('intel-status');
  if(!el) return;
  if(state==='cargando'){
    el.innerHTML = '<span style="color:var(--acc)">⟳ Cargando feeds de inteligencia...</span>';
  } else if(state==='ok'){
    var t = intelLastFetch ? intelLastFetch.toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'}) : '--';
    el.innerHTML = '<span style="color:var(--grn)">✓ '+intelData.length+' alertas · Actualizado '+t+'</span>';
  } else if(state==='error'){
    el.innerHTML = '<span style="color:var(--red)">✗ Error al cargar feeds</span>';
  }
}

/* ── RENDERIZAR LISTA ── */
function renderIntelList(){
  var container = document.getElementById('intel-list');
  if(!container) return;

  var SEV_LABELS = {critical:'CRÍTICO', high:'ALTO', medium:'MEDIO', low:'INFO'};

  var filtered = intelData.filter(function(it){
    if(intelFilterAgency !== 'all' && it.agency !== intelFilterAgency) return false;
    if(intelFilterSev    !== 'all' && it.sev    !== intelFilterSev)    return false;
    return true;
  });

  if(filtered.length===0){
    container.innerHTML = '<div style="padding:2rem;text-align:center;color:var(--mut3);font-family:\'JetBrains Mono\',monospace;font-size:var(--fs-sm)">No hay alertas para los filtros seleccionados</div>';
    return;
  }

  var html = '';
  for(var i=0;i<filtered.length;i++){
    var it = filtered[i];
    var title = intelTranslated && it.translated && it.titleEs ? san(it.titleEs) : san(it.title);
    var body  = intelTranslated && it.translated && it.bodyEs  ? san(it.bodyEs)  : san(it.body);
    var dateStr = it.pubDate.toLocaleString('es-ES',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'});
    var oc = it.url ? 'onclick="window.open(\''+it.url+'\',\'_blank\')" style="cursor:pointer"' : '';
    html += '<div class="intel-card intel-sev-'+san(it.sev)+'" '+oc+'>'+
      '<div class="intel-card-hdr">'+
        '<div class="intel-agency-badge" style="border-color:'+it.agColor+'66;color:'+it.agColor+'">'+
          san(it.agFlag)+' <span>'+san(it.agLabel)+'</span>'+
        '</div>'+
        '<span class="intel-sev-tag intel-sev-'+san(it.sev)+'">'+san(SEV_LABELS[it.sev]||it.sev)+'</span>'+
      '</div>'+
      '<div class="intel-card-title">'+title+'</div>'+
      (body ? '<div class="intel-card-body">'+body+'</div>' : '')+
      '<div class="intel-card-foot">'+
        '<span class="intel-src">'+san(it.agLabel)+'</span>'+
        '<span class="intel-date">'+dateStr+'</span>'+
      '</div>'+
    '</div>';
  }
  container.innerHTML = html;
}

/* ── FILTROS ── */
function setIntelFilterAgency(val, btn){
  intelFilterAgency = val;
  document.querySelectorAll('.intel-ag-btn').forEach(function(b){ b.classList.remove('active'); });
  if(btn) btn.classList.add('active');
  renderIntelList();
}

function setIntelFilterSev(val, btn){
  intelFilterSev = val;
  document.querySelectorAll('.intel-sev-btn').forEach(function(b){ b.classList.remove('active'); });
  if(btn) btn.classList.add('active');
  renderIntelList();
}

/* ── TRADUCCIÓN VIA CLAUDE API ── */
function translateIntelNews(){
  if(intelTranslating) return;
  var btn = document.getElementById('intel-translate-btn');

  /* Toggle: si ya está traducido, revertir */
  if(intelTranslated){
    intelTranslated = false;
    if(btn){ btn.textContent='🌐 Traducir al Español'; btn.classList.remove('saved'); }
    renderIntelList();
    return;
  }

  /* Verificar API key */
  var apiKey = (typeof _akey !== 'undefined') ? _akey : (lsGet('hip8_akey')||'');
  if(!apiKey){
    var st = document.getElementById('intel-tr-status');
    if(st){ st.textContent='⚠ Se necesita clave Anthropic para traducir'; st.style.color='var(--ylw)'; }
    return;
  }

  intelTranslating = true;
  if(btn){ btn.textContent='⟳ Traduciendo...'; btn.disabled=true; }
  var st = document.getElementById('intel-tr-status');
  if(st){ st.textContent='Traduciendo con Claude...'; st.style.color='var(--acc)'; }

  /* Solo traducir los que aún no tienen traducción y están visibles */
  var toTranslate = intelData.filter(function(it){ return !it.translated; }).slice(0,15);
  if(toTranslate.length===0){
    intelTranslated = true;
    intelTranslating = false;
    if(btn){ btn.textContent='↩ Ver original'; btn.classList.add('saved'); btn.disabled=false; }
    if(st){ st.textContent=''; }
    renderIntelList();
    return;
  }

  /* Construir batch de traducciones */
  var texts = toTranslate.map(function(it,idx){
    return 'ITEM_'+idx+'_TITLE: '+it.title+'\nITEM_'+idx+'_BODY: '+(it.body||'').slice(0,150);
  }).join('\n\n');

  var prompt = 'Traduce al español los siguientes titulares y resúmenes de inteligencia geopolítica. '+
    'Mantén el tono profesional y preciso. Responde SOLO con el texto traducido en el mismo formato:\n\n'+texts;

  fetch('https://api.anthropic.com/v1/messages',{
    method:'POST',
    headers:{'Content-Type':'application/json','x-api-key':apiKey,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},
    body:JSON.stringify({model:'claude-haiku-4-5-20251001',max_tokens:2000,messages:[{role:'user',content:prompt}]})
  })
  .then(function(r){ return r.json(); })
  .then(function(d){
    var text = (d.content&&d.content[0]&&d.content[0].text)||'';
    /* Parsear respuesta */
    for(var i=0;i<toTranslate.length;i++){
      var tReg  = new RegExp('ITEM_'+i+'_TITLE:\\s*([^\\n]+)');
      var bReg  = new RegExp('ITEM_'+i+'_BODY:\\s*([^\\n]+(?:\\n(?!ITEM_)[^\\n]+)*)');
      var tm    = text.match(tReg);
      var bm    = text.match(bReg);
      if(tm) toTranslate[i].titleEs = tm[1].trim();
      if(bm) toTranslate[i].bodyEs  = bm[1].trim();
      toTranslate[i].translated = true;
    }
    intelTranslated  = true;
    intelTranslating = false;
    if(btn){ btn.textContent='↩ Ver original'; btn.classList.add('saved'); btn.disabled=false; }
    if(st){ st.textContent=''; }
    renderIntelList();
  })
  .catch(function(e){
    intelTranslating = false;
    if(btn){ btn.textContent='🌐 Traducir al Español'; btn.disabled=false; }
    if(st){ st.textContent='Error de traducción: '+e.message; st.style.color='var(--red)'; }
  });
}

/* ── INIT DEL MÓDULO ── */
function initIntel(){
  /* Construir filtros de agencia */
  buildIntelFilters();
  /* Cargar feeds */
  loadIntelFeeds();
  /* Auto-refresh cada 15 min */
  if(intelAutoTimer) clearInterval(intelAutoTimer);
  intelAutoTimer = setInterval(function(){
    loadIntelFeeds();
  }, 15 * 60 * 1000);
}

function buildIntelFilters(){
  var agBar = document.getElementById('intel-ag-filters');
  if(!agBar) return;
  var html = '<button class="intel-ag-btn active" onclick="setIntelFilterAgency(\'all\',this)">TODAS</button>';
  for(var i=0;i<INTEL_AGENCIES.length;i++){
    var ag = INTEL_AGENCIES[i];
    html += '<button class="intel-ag-btn" onclick="setIntelFilterAgency(\''+san(ag.id)+'\',this)">'+
      san(ag.flag)+' '+san(ag.name)+'</button>';
  }
  agBar.innerHTML = html;
}

/* ── MANUAL REFRESH ── */
function refreshIntel(){
  intelData = [];
  intelTranslated = false;
  loadIntelFeeds();
}
