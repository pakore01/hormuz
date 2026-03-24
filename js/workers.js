/* ═══════════════════════════════════════════════
   workers.js — Cloudflare Workers: MITECO, REE, Brent
   Actualización automática de precios en tiempo real
═══════════════════════════════════════════════ */
'use strict';

var fuelTimer  = null;
var brentTimer = null;
var reeTimer   = null;
var reeData    = null;
var lastFuelFetch = null;

/* ── MITECO — gasolina cada 20min ── */
function fetchRealPrices(){
  fetch(WORKERS.miteco)
  .then(function(r){ return r.json(); })
  .then(function(d){
    if(d.sp95 && !d.error){
      var map={sp95:'sp95',sp98:'sp98',diesel:'diesel',dieselp:'dieselp',autogas:'glp'};
      for(var i=0;i<SPAIN_FUELS.length;i++){
        var f=SPAIN_FUELS[i];
        var key=map[f.id];
        if(key && d[key] && d[key]>0.1) f.current=d[key];
      }
      lastFuelFetch=new Date();
      calcAllFuel();
      var src=document.getElementById('fuel-src');
      if(src){ src.textContent='MITECO '+lastFuelFetch.toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'}); src.style.color='#10b981'; }
      addLog('auto','Precios MITECO actualizados ('+d.total_estaciones+' gasolineras)','MITECO');
    }
  }).catch(function(e){
    var src=document.getElementById('fuel-src');
    if(src){ src.textContent='Error MITECO'; src.style.color='#ef4444'; }
  });
}

function startFuelTimer(){
  fetchRealPrices();
  if(fuelTimer) clearInterval(fuelTimer);
  fuelTimer=setInterval(fetchRealPrices, 20*60*1000);
}

/* ── BRENT — cada 5min ── */
function fetchRealBrent(){
  fetch(WORKERS.brent)
  .then(function(r){ return r.json(); })
  .then(function(d){
    if(d.brent && !d.error){
      PREV.brent=STATE.brent;
      STATE.brent=d.brent;
      STATE.wti=d.wti||STATE.wti;
      var bc=d.brent-(d.brent_prev||d.brent);
      var sb=document.getElementById('s-brent');
      if(sb) sb.innerHTML='$'+d.brent.toFixed(1)+'<span class="ci '+(bc>=0?'cup':'cdn')+'">'+(bc>=0?'+':'')+bc.toFixed(1)+'</span>';
      var cb=document.getElementById('c-brent'); if(cb) cb.textContent='$'+d.brent.toFixed(1);
      var cw=document.getElementById('c-wti');   if(cw) cw.textContent='$'+d.wti.toFixed(1);
      var pp=document.getElementById('pp-brent'); if(pp) pp.textContent='$'+d.brent.toFixed(1);
      var nb=document.getElementById('ns-brent'); if(nb) nb.textContent='$'+d.brent.toFixed(1);
      var bs=document.getElementById('brent-src');
      if(bs){ bs.textContent='Yahoo '+new Date().toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'}); bs.style.color='#10b981'; }
      updateTensionUI(); calcAllFuel(); checkThresholds();
    }
  }).catch(function(){});
}

function startBrentTimer(){
  fetchRealBrent();
  if(brentTimer) clearInterval(brentTimer);
  brentTimer=setInterval(fetchRealBrent, 5*60*1000);
}

/* ── REE — electricidad cada hora ── */
function fetchREE(){
  fetch(WORKERS.ree)
  .then(function(r){ return r.json(); })
  .then(function(d){
    if(d.precio_mwh && !d.error){
      reeData=d;
      var col=d.precio_mwh>200?'#ef4444':d.precio_mwh>120?'#f59e0b':'#10b981';
      var sr=document.getElementById('s-ree');
      if(sr){ sr.textContent=d.precio_mwh+' EUR/MWh'; sr.style.color=col; }
      var sr2=document.getElementById('s-ree2');
      if(sr2) sr2.textContent=d.precio_kwh.toFixed(3)+' EUR/kWh';
      var ne=document.getElementById('ns-ree');
      if(ne){ ne.textContent=d.precio_mwh+' EUR/MWh'; ne.style.color=col; }
      addLog('auto','REE: '+d.precio_mwh+' EUR/MWh ('+d.hora+') max:'+d.max_dia+' min:'+d.min_dia,'REE API');
    }
  }).catch(function(){});
}

function startREETimer(){
  fetchREE();
  if(reeTimer) clearInterval(reeTimer);
  reeTimer=setInterval(fetchREE, 60*60*1000);
}
