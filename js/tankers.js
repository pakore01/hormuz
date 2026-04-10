/* ═══════════════════════════════════════════════
   tankers.js — Tabla de barcos, filtros, CSV export
═══════════════════════════════════════════════ */
'use strict';

var af='all', sk='name', sd=1;
var BDG={
  loaded:  '<span class="bdg b-loaded">CARGADO</span>',
  attacked:'<span class="bdg b-attacked">ATACADO</span>',
  transit: '<span class="bdg b-transit">TRANSITADO</span>',
  waiting: '<span class="bdg b-waiting">EN ESPERA</span>'
};

function fmtT2(t){return t>=1e6?(t/1e6).toFixed(1)+'M T':t>=1000?(t/1000).toFixed(0)+'k T':t+' T';}
function getRows(){
  var q=(document.getElementById('srch').value||'').trim().toLowerCase();
  var r=SHIPS.filter(function(d){if(af!=='all'&&d.s!==af)return false;if(!q)return true;return[d.n,d.fn,d.c,d.o,d.p].some(function(s){return s.toLowerCase().indexOf(q)!==-1;});});
  r.sort(function(a,b){if(sk==='tons')return(b.T-a.T)*(sd===-1?-1:1);if(sk==='value')return(b.V-a.V)*(sd===-1?-1:1);var k={name:'n',status:'s',flag:'fn',position:'p'}[sk]||'n';return(a[k]<b[k]?-1:a[k]>b[k]?1:0)*sd;});
  return r;
}
function renderTable(){
  var r=getRows();
  var rc=document.getElementById('rc');if(rc)rc.textContent=r.length+' barco'+(r.length!==1?'s':'');
  var html='';
  for(var i=0;i<r.length;i++){
    var d=r[i];
    html+='<tr><td class="tflag">'+san(d.fn.slice(0,2))+'</td><td><div class="tname">'+san(d.n)+'</div><div class="ttype">'+san(d.t)+'</div></td><td>'+(BDG[d.s]||san(d.s))+'</td><td style="font-family:JetBrains Mono,monospace;font-size:.6rem;color:#4d6a90">'+san(d.p)+'</td><td style="font-size:.68rem">'+san(d.c)+'</td><td class="ttons">'+fmtT2(d.T)+'</td><td class="tval">~$'+d.V+'M</td><td style="font-size:.62rem;color:#4d6a90">'+san(d.o||'')+'</td></tr>';
  }
  var tb=document.getElementById('tbody');if(tb)tb.innerHTML=html;
}
function setF(f,btn){af=f;document.querySelectorAll('.fbtn').forEach(function(b){b.classList.remove('active');});btn.classList.add('active');renderTable();}
function sc(key,th){sd=sk===key?sd*-1:1;sk=key;document.querySelectorAll('thead th').forEach(function(t){t.classList.remove('asc','desc');});if(th)th.classList.add(sd===1?'asc':'desc');renderTable();}
function doCSV(){
  var r=getRows();
  var h=['Nombre','Tipo','Bandera','Estado','Posicion','Cargo','Toneladas','Valor_USD_M','Operador','Lat','Lng'];
  var rows=r.map(function(d){return['"'+d.n+'"','"'+d.t+'"',d.fn,d.s,'"'+d.p+'"','"'+d.c+'"',d.T,d.V,'"'+(d.o||'')+'"',d.lat,d.lng].join(',');});
  var csv=h.join(',')+'\n'+rows.join('\n');
  var blob=new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8;'});
  var url=URL.createObjectURL(blob);
  var a=document.createElement('a');a.href=url;a.download='hormuz_'+new Date().toISOString().slice(0,10)+'.csv';
  document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url);
}