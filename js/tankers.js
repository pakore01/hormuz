/* ═══════════════════════════════════════════════
   tankers.js — Tabla de barcos, KPIs, panel detalle,
               filtros, búsqueda, ordenación, CSV
═══════════════════════════════════════════════ */
'use strict';

var af='all', sk='name', sd=1;
var selectedShip = null;

var BDG={
  loaded:  '<span class="bdg b-loaded">CARGADO</span>',
  attacked:'<span class="bdg b-attacked">ATACADO</span>',
  transit: '<span class="bdg b-transit">TRANSITADO</span>',
  waiting: '<span class="bdg b-waiting">EN ESPERA</span>'
};

var RISK_LABEL = {critical:'CRÍTICO', high:'ALTO', medium:'MEDIO', low:'BAJO'};
var RISK_CLASS  = {critical:'b-attacked', high:'b-waiting', medium:'b-transit', low:'b-loaded'};

function fmtT2(t){
  return t>=1e6?(t/1e6).toFixed(1)+'M T':t>=1000?(t/1000).toFixed(0)+'k T':t+' T';
}
function fmtV(v){
  return v>=1000?'$'+(v/1000).toFixed(1)+'B':'$'+v+'M';
}

function getRows(){
  var q=(document.getElementById('srch')||{value:''}).value.trim().toLowerCase();
  var r=SHIPS.filter(function(d){
    if(af!=='all'&&d.s!==af) return false;
    if(!q) return true;
    return [d.n,d.fn,d.c,d.o,d.p,d.dest||'',d.route||'',d.notes||''].some(function(s){
      return (s||'').toLowerCase().indexOf(q)!==-1;
    });
  });
  r.sort(function(a,b){
    if(sk==='tons')  return (b.T-a.T)*(sd===-1?-1:1);
    if(sk==='value') return (b.V-a.V)*(sd===-1?-1:1);
    if(sk==='speed') return ((b.spd||0)-(a.spd||0))*(sd===-1?-1:1);
    if(sk==='risk'){
      var ro={critical:0,high:1,medium:2,low:3};
      return ((ro[a.risk]||2)-(ro[b.risk]||2))*(sd===-1?-1:1);
    }
    var k={name:'n',status:'s',flag:'fn',position:'p'}[sk]||'n';
    return (a[k]<b[k]?-1:a[k]>b[k]?1:0)*sd;
  });
  return r;
}

/* ── KPIs de resumen ── */
function renderKPIs(){
  var total   = SHIPS.length;
  var attacked= SHIPS.filter(function(d){return d.s==='attacked';}).length;
  var waiting = SHIPS.filter(function(d){return d.s==='waiting';}).length;
  var loaded  = SHIPS.filter(function(d){return d.s==='loaded';}).length;
  var transit = SHIPS.filter(function(d){return d.s==='transit';}).length;
  var totalVal= SHIPS.reduce(function(a,d){return a+d.V;},0);
  var totalTon= SHIPS.reduce(function(a,d){return a+d.T;},0);
  var critical= SHIPS.filter(function(d){return d.risk==='critical';}).length;

  function set(id,v){var e=document.getElementById(id);if(e)e.textContent=v;}
  set('tk-total',   total);
  set('tk-attacked',attacked);
  set('tk-waiting', waiting+loaded);
  set('tk-transit', transit);
  set('tk-val',     fmtV(totalVal));
  set('tk-tons',    fmtT2(totalTon));
  set('tk-critical',critical);
}

/* ── Tabla principal ── */
function renderTable(){
  renderKPIs();
  var r=getRows();
  var rc=document.getElementById('rc');
  if(rc) rc.textContent=r.length+' barco'+(r.length!==1?'s':'');

  var html='';
  for(var i=0;i<r.length;i++){
    var d=r[i];
    var riskBadge='<span class="bdg '+san(RISK_CLASS[d.risk]||'b-transit')+'">'+san(RISK_LABEL[d.risk]||d.risk||'—')+'</span>';
    var spdTxt = d.spd>0 ? d.spd+' kn' : '<span style="color:var(--red)">0 kn</span>';
    html+='<tr class="trow-click" onclick="openShipDetail(\''+san(d.n.replace(/'/g,"\\'"))+'\')" title="Ver detalle completo">'+
      '<td class="tflag">'+(d.flag||san((d.fn||'').slice(0,2)))+'</td>'+
      '<td><div class="tname">'+san(d.n)+'</div><div class="ttype">'+san(d.t)+'</div></td>'+
      '<td>'+(BDG[d.s]||san(d.s))+'</td>'+
      '<td style="font-family:JetBrains Mono,monospace;font-size:.6rem;color:var(--mut3)">'+san(d.p)+'</td>'+
      '<td style="font-size:.65rem;color:var(--txt2)">'+san(d.c)+'</td>'+
      '<td class="ttons">'+fmtT2(d.T)+'</td>'+
      '<td class="tval">'+fmtV(d.V)+'</td>'+
      '<td style="font-size:.62rem;color:var(--mut3)">'+san(d.o||'—')+'</td>'+
      '<td style="font-family:JetBrains Mono,monospace;font-size:.6rem;color:var(--txt2)">'+spdTxt+'</td>'+
      '<td>'+riskBadge+'</td>'+
    '</tr>';
  }
  var tb=document.getElementById('tbody');
  if(tb) tb.innerHTML=html;
}

/* ── Panel de detalle lateral ── */
function openShipDetail(name){
  var ship=null;
  for(var i=0;i<SHIPS.length;i++){
    if(SHIPS[i].n===name){ship=SHIPS[i];break;}
  }
  if(!ship) return;
  selectedShip=ship;

  var STATUS_LABEL={loaded:'CARGADO',attacked:'ATACADO',transit:'EN TRÁNSITO',waiting:'EN ESPERA'};
  var STATUS_COLOR={loaded:'var(--acc)',attacked:'var(--red)',transit:'var(--grn)',waiting:'var(--ylw)'};
  var RISK_COLOR={critical:'var(--red)',high:'var(--ylw)',medium:'var(--acc)',low:'var(--grn)'};

  var sColor = STATUS_COLOR[ship.s]||'var(--txt)';
  var rColor = RISK_COLOR[ship.risk]||'var(--mut3)';

  /* Bar de riesgo */
  var riskPct={critical:95,high:70,medium:40,low:15};
  var rPct = riskPct[ship.risk]||40;
  var rBarColor = RISK_COLOR[ship.risk]||'var(--acc)';

  /* Velocidad bar */
  var maxSpd = 18;
  var spdPct = Math.min(100, (ship.spd||0)/maxSpd*100);

  function row(label, value, valueColor){
    return '<div class="sd-row">'+
      '<span class="sd-label">'+label+'</span>'+
      '<span class="sd-value"'+(valueColor?' style="color:'+valueColor+'"':'')+'>'+value+'</span>'+
    '</div>';
  }

  var html =
    '<div class="sd-topbar">'+
      '<div>'+
        '<div class="sd-ship-name">'+san(ship.flag||'')+'&nbsp;'+san(ship.n)+'</div>'+
        '<div class="sd-ship-type">'+san(ship.t)+'</div>'+
      '</div>'+
      '<button class="sd-close" onclick="closeShipDetail()">✕</button>'+
    '</div>'+

    /* Estado + Riesgo destacado */
    '<div class="sd-status-row">'+
      '<div class="sd-big-badge" style="border-color:'+sColor+';color:'+sColor+'">'+san(STATUS_LABEL[ship.s]||ship.s)+'</div>'+
      '<div class="sd-big-badge" style="border-color:'+rColor+';color:'+rColor+'">'+san(RISK_LABEL[ship.risk]||ship.risk||'—')+'</div>'+
    '</div>'+

    /* Barra de riesgo */
    '<div class="sd-risk-bar-wrap">'+
      '<div class="sd-risk-bar-label"><span>NIVEL DE RIESGO</span><span style="color:'+rColor+'">'+san(RISK_LABEL[ship.risk]||'—')+'</span></div>'+
      '<div class="sd-risk-bar-track"><div class="sd-risk-bar-fill" style="width:'+rPct+'%;background:'+rBarColor+'"></div></div>'+
    '</div>'+

    /* SECCIÓN: Identidad */
    '<div class="sd-section">'+
      '<div class="sd-section-title">IDENTIDAD</div>'+
      row('Nombre', san(ship.n))+
      row('Tipo / Clase', san(ship.t))+
      row('Bandera', san((ship.flag||'')+' '+ship.fn))+
      row('Operador', san(ship.o||'Desconocido'))+
      row('Año construcción', ship.yr||'N/D')+
      row('Referencia IMO', san(ship.imo||'N/D'))+
    '</div>'+

    /* SECCIÓN: Posición y ruta */
    '<div class="sd-section">'+
      '<div class="sd-section-title">POSICIÓN Y RUTA</div>'+
      row('Posición actual', san(ship.p))+
      row('Destino', san(ship.dest||'Desconocido'))+
      row('Ruta', san(ship.route||'N/D'))+
      row('Coordenadas', ship.lat.toFixed(2)+'°N / '+ship.lng.toFixed(2)+'°E')+
      '<div class="sd-row"><span class="sd-label">Velocidad actual</span>'+
        '<span class="sd-value" style="color:'+(ship.spd>0?'var(--grn)':'var(--red)')+'">'+
          (ship.spd>0?ship.spd+' nudos':'DETENIDO')+
        '</span></div>'+
      '<div class="sd-spd-track"><div class="sd-spd-fill" style="width:'+spdPct+'%"></div></div>'+
    '</div>'+

    /* SECCIÓN: Carga */
    '<div class="sd-section">'+
      '<div class="sd-section-title">CARGA</div>'+
      row('Tipo de carga', san(ship.c))+
      row('Toneladas', fmtT2(ship.T)+' ('+Number(ship.T).toLocaleString('es-ES')+' T)')+
      row('Valor estimado', fmtV(ship.V), 'var(--grn)')+
    '</div>'+

    /* SECCIÓN: Contexto de crisis */
    (ship.notes?
    '<div class="sd-section">'+
      '<div class="sd-section-title">CONTEXTO DE CRISIS</div>'+
      '<div class="sd-notes">'+san(ship.notes)+'</div>'+
    '</div>':'')+

    /* Footer con botón mapa */
    '<div class="sd-footer">'+
      '<button class="sd-map-btn" onclick="closeShipDetail();showTab(\'map\',document.getElementById(\'tb-map\'))">🗺️ Ver en Mapa</button>'+
      '<button class="sd-csv-btn" onclick="doCSVSingle()">⬇ CSV</button>'+
    '</div>';

  var panel = document.getElementById('ship-detail-panel');
  var overlay = document.getElementById('ship-detail-overlay');
  if(panel){ panel.innerHTML=html; panel.classList.add('open'); }
  if(overlay) overlay.classList.add('show');
}

function closeShipDetail(){
  var panel = document.getElementById('ship-detail-panel');
  var overlay = document.getElementById('ship-detail-overlay');
  if(panel) panel.classList.remove('open');
  if(overlay) overlay.classList.remove('show');
  selectedShip=null;
}

/* Cerrar con Escape */
document.addEventListener('keydown',function(e){
  if(e.key==='Escape') closeShipDetail();
});

/* ── Filtros y ordenación ── */
function setF(f,btn){
  af=f;
  document.querySelectorAll('.fbtn').forEach(function(b){b.classList.remove('active');});
  btn.classList.add('active');
  renderTable();
}
function sc(key,th){
  sd=sk===key?sd*-1:1; sk=key;
  document.querySelectorAll('thead th').forEach(function(t){t.classList.remove('asc','desc');});
  if(th) th.classList.add(sd===1?'asc':'desc');
  renderTable();
}

/* ── CSV completo ── */
function doCSV(){
  var r=getRows();
  var h=['Nombre','Tipo','Bandera','Flag','Estado','Posicion','Destino','Ruta','Cargo','Toneladas','Valor_USD_M','Operador','Velocidad_kn','Riesgo','Ano','IMO','Lat','Lng','Notas'];
  var rows=r.map(function(d){
    return [
      '"'+d.n+'"','"'+d.t+'"',d.fn,d.flag||'',d.s,
      '"'+d.p+'"','"'+(d.dest||'')+'"','"'+(d.route||'')+'"',
      '"'+d.c+'"',d.T,d.V,'"'+(d.o||'')+'"',
      d.spd||0,d.risk||'',d.yr||'',d.imo||'',
      d.lat,d.lng,'"'+(d.notes||'')+'"'
    ].join(',');
  });
  var csv=h.join(',')+'\n'+rows.join('\n');
  var blob=new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8;'});
  var url=URL.createObjectURL(blob);
  var a=document.createElement('a');
  a.href=url; a.download='hormuz_barcos_'+new Date().toISOString().slice(0,10)+'.csv';
  document.body.appendChild(a);a.click();document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ── CSV de un solo barco (desde panel detalle) ── */
function doCSVSingle(){
  if(!selectedShip) return;
  var d=selectedShip;
  var h=['Nombre','Tipo','Bandera','Estado','Posicion','Destino','Ruta','Cargo','Toneladas','Valor_USD_M','Operador','Velocidad_kn','Riesgo','Ano','IMO','Lat','Lng','Notas'];
  var row=[
    '"'+d.n+'"','"'+d.t+'"',d.fn,d.s,
    '"'+d.p+'"','"'+(d.dest||'')+'"','"'+(d.route||'')+'"',
    '"'+d.c+'"',d.T,d.V,'"'+(d.o||'')+'"',
    d.spd||0,d.risk||'',d.yr||'',d.imo||'',
    d.lat,d.lng,'"'+(d.notes||'')+'"'
  ].join(',');
  var csv=h.join(',')+'\n'+row;
  var blob=new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8;'});
  var url=URL.createObjectURL(blob);
  var a=document.createElement('a');
  a.href=url; a.download='barco_'+d.n.replace(/\s+/g,'_').toLowerCase()+'_'+new Date().toISOString().slice(0,10)+'.csv';
  document.body.appendChild(a);a.click();document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
