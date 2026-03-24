/* ═══════════════════════════════════════════════
   centros/energia.js
   Centro de Energía: Combustibles + Red Eléctrica
                      + Flujos Petróleo + Calculadora
═══════════════════════════════════════════════ */
'use strict';

/* ═══════════════════════════════════════════════
   fuel.js — Precios combustibles España (MITECO)
═══════════════════════════════════════════════ */


function calcPrice(pre,tax,brentRatio,pt){
  var crude=pre-tax;
  var newCrude=crude*(1+(brentRatio-1)*pt);
  return Math.max(tax+0.05,newCrude+tax);
}

function calcAllFuel(){
  var brentRatio = STATE.brent / 74.5;
  var fb1 = document.getElementById('fu-brent');
  if(fb1) fb1.textContent = STATE.brent.toFixed(1);
  var fb2 = document.getElementById('fu-brent2');
  if(fb2) fb2.textContent = '$' + STATE.brent.toFixed(1);

  var grid = document.getElementById('spain-main-grid');
  if(!grid) return;

  var html2 = '';
  var minP = 999, maxP = 0, minLabel = '', maxLabel = '';

  for(var i=0; i<SPAIN_FUELS.length; i++){
    var f = SPAIN_FUELS[i];
    var precio = f.current || calcPrice(f.base, f.tax, brentRatio, f.pt);
    var diff = precio - f.base;
    var pct = ((diff / f.base) * 100).toFixed(1);
    var col = diff > 0.005 ? '#ef4444' : '#10b981';
    var isUp = diff > 0.005;
    if(precio < minP){ minP = precio; minLabel = f.label; }
    if(precio > maxP){ maxP = precio; maxLabel = f.label; }
    html2 += '<div style="background:var(--card2);border:1px solid var(--bor2);border-radius:10px;padding:1.1rem;position:relative;overflow:hidden;transition:transform .2s" onmouseenter="this.style.transform=\'translateY(-3px)\'" onmouseleave="this.style.transform=\'\'">'+
      '<div style="position:absolute;bottom:0;left:0;right:0;height:3px;background:linear-gradient(90deg,'+col+',transparent)"></div>'+
      '<div style="font-family:\'JetBrains Mono\',monospace;font-size:.52rem;color:#4d6a90;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:.5rem">'+san(f.label)+'</div>'+
      '<div style="font-family:\'Bebas Neue\',sans-serif;font-size:2.2rem;color:var(--txt);line-height:1;margin-bottom:.3rem">'+precio.toFixed(3)+'</div>'+
      '<div style="font-family:\'JetBrains Mono\',monospace;font-size:.52rem;color:#4d6a90;margin-bottom:.6rem">EUR / litro</div>'+
      '<div style="display:flex;justify-content:space-between;align-items:center">'+
        '<div style="font-family:\'JetBrains Mono\',monospace;font-size:.58rem;color:'+col+'">'+(isUp?'+':'')+diff.toFixed(3)+' EUR</div>'+
        '<div style="font-family:\'JetBrains Mono\',monospace;font-size:.58rem;font-weight:700;color:'+col+'">'+(isUp?'+':'')+pct+'%</div>'+
      '</div>'+
      '<div style="margin-top:.5rem;height:3px;background:var(--bor);border-radius:2px;overflow:hidden">'+
        '<div style="height:100%;width:'+Math.min(100,Math.abs(parseFloat(pct))*3)+'%;background:'+col+';border-radius:2px"></div>'+
      '</div>'+
      '<div style="font-family:\'JetBrains Mono\',monospace;font-size:.48rem;color:#2d4060;margin-top:.4rem">Pre-crisis: '+f.base.toFixed(3)+' EUR</div>'+
    '</div>';
  }
  grid.innerHTML = html2;

  var avgDiff = 0;
  for(var j=0; j<SPAIN_FUELS.length; j++){
    var p = SPAIN_FUELS[j].current || calcPrice(SPAIN_FUELS[j].base,SPAIN_FUELS[j].tax,brentRatio,SPAIN_FUELS[j].pt);
    avgDiff += (p - SPAIN_FUELS[j].base) / SPAIN_FUELS[j].base;
  }
  var sub = document.getElementById('fu-subida');
  if(sub) sub.textContent = '+' + (avgDiff/SPAIN_FUELS.length*100).toFixed(1) + '%';
  var fmin = document.getElementById('fu-min'); if(fmin) fmin.textContent = minLabel;
  var fminp = document.getElementById('fu-min-p'); if(fminp) fminp.textContent = minP.toFixed(3)+' EUR/L';
  var fmax = document.getElementById('fu-max'); if(fmax) fmax.textContent = maxLabel;
  var fmaxp = document.getElementById('fu-max-p'); if(fmaxp) fmaxp.textContent = maxP.toFixed(3)+' EUR/L';
  var esReal = SPAIN_FUELS[0].current || calcPrice(SPAIN_FUELS[0].base,SPAIN_FUELS[0].tax,brentRatio,SPAIN_FUELS[0].pt);
  var sg = document.getElementById('s-gas'); if(sg) sg.textContent = esReal.toFixed(3)+'EUR/L';
  var ut = document.getElementById('fu-update-time'); if(ut) ut.textContent = 'Actualizado: '+new Date().toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'});
}


/* ═══════════════════════════════════════════════
   flows.js — Canvas animado flujos de petróleo
═══════════════════════════════════════════════ */


var flowsAnim=null, flowsRunning=true, flowFilter='all', flowTick=0;

var FLOWS=[
  {fx:62,fy:44,tx:15,ty:22,mb:8,type:'blocked'},
  {fx:62,fy:44,tx:82,ty:55,mb:2,type:'active'},
  {fx:62,fy:44,tx:95,ty:38,mb:1,type:'active'},
  {fx:62,fy:44,tx:70,ty:85,mb:4,type:'alt'},
  {fx:50,fy:15,tx:18,ty:18,mb:5,type:'active'},
  {fx:12,fy:8, tx:18,ty:18,mb:3,type:'active'},
  {fx:12,fy:62,tx:8, ty:35,mb:3,type:'active'},
  {fx:2, fy:30,tx:15,ty:50,mb:4,type:'active'},
  {fx:28,fy:60,tx:20,ty:38,mb:5,type:'blocked'}
];

function startFlows(){
  var canvas=document.getElementById('flows-canvas');if(!canvas)return;
  var W=canvas.offsetWidth||900;canvas.width=W;canvas.height=480;
  var ctx=canvas.getContext('2d');if(flowsAnim)cancelAnimationFrame(flowsAnim);
  var cols={blocked:'#ef4444',active:'#10b981',alt:'#3b82f6'};
  function draw(){
    ctx.clearRect(0,0,W,480);ctx.fillStyle='#020a14';ctx.fillRect(0,0,W,480);
    ctx.strokeStyle='rgba(15,26,46,.7)';ctx.lineWidth=.5;
    for(var x=0;x<W;x+=W/12){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,480);ctx.stroke();}
    for(var y=0;y<480;y+=60){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
    for(var j=0;j<FLOWS.length;j++){
      var fl=FLOWS[j];if(flowFilter!=='all'&&fl.type!==flowFilter)continue;
      var x1=fl.fx/100*W,y1=fl.fy/100*480,x2=fl.tx/100*W,y2=fl.ty/100*480;
      var col=cols[fl.type]||'#64748b';var lw=Math.max(1,Math.min(6,fl.mb*.7));
      ctx.save();ctx.strokeStyle=col;ctx.lineWidth=lw;ctx.globalAlpha=fl.type==='blocked'?.55:.7;
      ctx.setLineDash([12,6]);ctx.lineDashOffset=-(flowTick*2*(fl.type==='blocked'?-1:1));
      var cxp=(x1+x2)/2+(y2-y1)*.15,cyp=(y1+y2)/2-(x2-x1)*.15;
      ctx.beginPath();ctx.moveTo(x1,y1);ctx.quadraticCurveTo(cxp,cyp,x2,y2);ctx.stroke();ctx.restore();
      var ang=Math.atan2(y2-cyp,x2-cxp);
      ctx.save();ctx.translate(x2,y2);ctx.rotate(ang);ctx.fillStyle=col;ctx.globalAlpha=.85;
      ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(-10,-4);ctx.lineTo(-10,4);ctx.closePath();ctx.fill();ctx.restore();
      ctx.fillStyle='rgba(184,197,216,.75)';ctx.font='9px monospace';ctx.globalAlpha=.85;
      ctx.fillText(fl.mb+' Mb/d',(x1+x2)/2,(y1+y2)/2);ctx.globalAlpha=1;
    }
    flowTick++;if(flowsRunning)flowsAnim=requestAnimationFrame(draw);
  }
  draw();
}
function setFlowFilter(f,btn){
  flowFilter=f;
  document.querySelectorAll('[id^="fl-"]').forEach(function(b){b.classList.remove('active');});
  btn.classList.add('active');
}
function toggleAnim(btn){
  flowsRunning=!flowsRunning;btn.textContent=flowsRunning?'PAUSAR':'REANUDAR';
  btn.classList.toggle('active',flowsRunning);if(flowsRunning)startFlows();
}

/* ═══════════════════════════════════════════════
   electricidad.js — Módulo Red Eléctrica España
   Índice de riesgo apagón + mix generación + precios
═══════════════════════════════════════════════ */


var REE_RIESGO_URL = 'https://ree-riesgo.pa-kore.workers.dev/';
var reeRiesgoData  = null;
var reeRiesgoTimer = null;

/* ── FETCH Y ACTUALIZACIÓN CADA 5 MIN ── */
function fetchRiesgoElectrico() {
  fetch(REE_RIESGO_URL)
  .then(function(r){ return r.json(); })
  .then(function(d){
    reeRiesgoData = d;
    renderRiesgoElectrico(d);

    /* Alerta en pantalla si riesgo >= 70 */
    if(d.alerta_activa && d.mensaje_alerta){
      showAlert('⚡ ' + d.mensaje_alerta);
      sendNotif('⚡ Alerta Red Eléctrica', d.mensaje_alerta);
      addLog('alert', d.mensaje_alerta, 'REE Riesgo');
    }

    /* Actualizar stats bar */
    var sr  = document.getElementById('s-ree');
    var sr2 = document.getElementById('s-ree2');
    if(sr){
      sr.textContent  = d.precio_mwh + ' EUR/MWh';
      sr.style.color  = d.color_alerta;
    }
    if(sr2) sr2.textContent = d.precio_kwh.toFixed(3) + ' EUR/kWh';
  })
  .catch(function(){});
}

function startRiesgoTimer(){
  fetchRiesgoElectrico();
  if(reeRiesgoTimer) clearInterval(reeRiesgoTimer);
  reeRiesgoTimer = setInterval(fetchRiesgoElectrico, 5 * 60 * 1000);
}

/* ── RENDER PANEL COMPLETO ── */
function renderRiesgoElectrico(d){
  /* Gauge de riesgo */
  var gauge = document.getElementById('elec-gauge-val');
  var gaugeNivel = document.getElementById('elec-gauge-nivel');
  var gaugeArc   = document.getElementById('elec-gauge-arc');
  if(gauge){ gauge.textContent = d.riesgo_apagon; gauge.style.color = d.color_alerta; }
  if(gaugeNivel){ gaugeNivel.textContent = d.nivel_alerta; gaugeNivel.style.color = d.color_alerta; }
  if(gaugeArc){
    var offset = 251 - (251 * d.riesgo_apagon / 100);
    gaugeArc.style.strokeDashoffset = offset;
    var arcColor = d.riesgo_apagon >= 75 ? '#ef4444' : d.riesgo_apagon >= 50 ? '#f59e0b' : d.riesgo_apagon >= 25 ? '#f97316' : '#10b981';
    gaugeArc.setAttribute('stroke', arcColor);
  }

  /* Alerta banner */
  var banner = document.getElementById('elec-alerta-banner');
  if(banner){
    if(d.alerta_activa){
      banner.style.display = 'flex';
      var msg = document.getElementById('elec-alerta-msg');
      if(msg) msg.textContent = d.mensaje_alerta;
    } else {
      banner.style.display = 'none';
    }
  }

  /* Comparacion 28A */
  var cmp28 = document.getElementById('elec-28a');
  if(cmp28){
    if(d.similar_28A){
      cmp28.style.display = 'flex';
    } else {
      cmp28.style.display = 'none';
    }
  }

  /* KPIs precios */
  var kpis = {
    'elec-precio-actual': d.precio_mwh + ' EUR/MWh',
    'elec-precio-kwh':    d.precio_kwh.toFixed(3) + ' EUR/kWh',
    'elec-precio-max':    d.precio_max + ' EUR/MWh',
    'elec-precio-min':    d.precio_min + ' EUR/MWh',
    'elec-precio-medio':  d.precio_medio + ' EUR/MWh'
  };
  Object.keys(kpis).forEach(function(id){
    var el = document.getElementById(id);
    if(el) el.textContent = kpis[id];
  });

  /* Hora critica indicator */
  var hc = document.getElementById('elec-hora-critica');
  if(hc){
    hc.textContent = d.hora_critica ? '⚠ HORA CRITICA SOLAR (10-15h)' : 'Fuera de hora critica';
    hc.style.color  = d.hora_critica ? '#f59e0b' : '#10b981';
  }

  /* Factores de riesgo bars */
  var factores = d.factores_riesgo || {};
  Object.keys(factores).forEach(function(key){
    var bar = document.getElementById('elec-f-' + key);
    var val = document.getElementById('elec-fv-' + key);
    var v   = factores[key] || 0;
    var col = v >= 70 ? '#ef4444' : v >= 40 ? '#f59e0b' : '#10b981';
    if(bar){ bar.style.width = v + '%'; bar.style.background = col; }
    if(val){ val.textContent = v; val.style.color = col; }
  });

  /* Gráfico de precios por hora */
  renderPreciosHora(d.precios_hora || []);

  /* Timestamp */
  var ts = document.getElementById('elec-updated');
  if(ts) ts.textContent = 'Actualizado: ' + new Date(d.actualizado).toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'});
}

/* ── GRAFICO PRECIOS HORA ── */
function renderPreciosHora(datos) {
  var canvas = document.getElementById('elec-chart');
  if(!canvas || !datos.length) return;

  if(typeof Chart === 'undefined'){
    initCharts(); /* carga Chart.js si no está */
    setTimeout(function(){ renderPreciosHora(datos); }, 1000);
    return;
  }

  if(canvas._elecChart) canvas._elecChart.destroy();

  var labels = datos.map(function(d){ return d.hora; });
  var values = datos.map(function(d){ return d.precio; });
  var colors = values.map(function(v){
    return v < 30 ? 'rgba(239,68,68,.7)' : v < 80 ? 'rgba(245,158,11,.7)' : 'rgba(59,130,246,.7)';
  });

  canvas._elecChart = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        data: values,
        backgroundColor: colors,
        borderColor: colors.map(function(c){ return c.replace('.7)','.9)'); }),
        borderWidth: 1,
        borderRadius: 3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(4,8,15,.97)',
          borderColor: '#f97316', borderWidth: 1,
          titleColor: '#f97316', bodyColor: '#dde4f0', padding: 10,
          callbacks: {
            label: function(c){
              var v = c.raw;
              var nivel = v < 30 ? ' ⚠ RIESGO ALTO' : v < 80 ? ' BAJO' : ' NORMAL';
              return ' ' + v + ' EUR/MWh' + nivel;
            }
          }
        }
      },
      scales: {
        x: { grid: { color: '#0f1a2e' }, ticks: { color: '#3d5578', font: { size: 9 }, maxRotation: 45 } },
        y: { grid: { color: '#0f1a2e' }, ticks: { color: '#3d5578', font: { size: 9 }, callback: function(v){ return v + '€'; } } }
      }
    }
  });
}


/* ═══════════════════════════════════════════════
   calc.js — Calculadora de impacto personal
═══════════════════════════════════════════════ */


function calcImpact(){
  var tipo = document.getElementById('calc-tipo').value;
  var litros = parseFloat(document.getElementById('calc-litros').value) || 0;
  var kwh = parseFloat(document.getElementById('calc-kwh').value) || 0;
  var calef = parseFloat(document.getElementById('calc-calef').value) || 0;

  // Find fuel data
  var fuel = null;
  for(var i=0;i<SPAIN_FUELS.length;i++){
    if(SPAIN_FUELS[i].id===tipo){ fuel=SPAIN_FUELS[i]; break; }
  }
  if(!fuel) return;

  var precioActual = fuel.current || fuel.base;
  var precioAntes = fuel.base;

  // Gasolina
  var costoGasActual = litros * precioActual;
  var costoGasAntes  = litros * precioAntes;
  var extraGas = costoGasActual - costoGasAntes;

  // Electricidad — precio REE actual vs pre-crisis (~65 EUR/MWh antes)
  var precioLuzActual = reeData ? reeData.media_dia / 1000 * 1.21 : 0.22;
  var precioLuzAntes  = 0.11; // pre-crisis aprox
  var extraLuz = kwh * (precioLuzActual - precioLuzAntes);

  // Calefaccion gasoil C (estimado ~1.10 pre-crisis, ~1.45 ahora)
  var extraCalef = calef * (1.45 - 1.10);

  var totalExtra = extraGas + Math.max(0,extraLuz) + extraCalef;
  var totalAntes = costoGasAntes + (kwh * precioLuzAntes);
  var totalAhora = costoGasActual + (kwh * precioLuzActual);

  // Update UI
  var ex = document.getElementById('calc-extra');
  if(ex){ ex.textContent = totalExtra.toFixed(0); ex.style.color = totalExtra>50?'#ef4444':'#f97316'; }
  var ea = document.getElementById('calc-anual');
  if(ea) ea.textContent = (totalExtra*12).toFixed(0);
  var eb = document.getElementById('calc-antes');
  if(eb) eb.textContent = costoGasAntes.toFixed(0);
  var ec = document.getElementById('calc-ahora');
  if(ec) ec.textContent = costoGasActual.toFixed(0);

  // Message
  var msg = '';
  if(totalExtra < 10) msg = 'Impacto minimo en tu economia mensual.';
  else if(totalExtra < 30) msg = 'La crisis de Hormuz te esta costando '+totalExtra.toFixed(0)+' EUR/mes. En un año serian '+((totalExtra*12).toFixed(0))+' EUR.';
  else if(totalExtra < 80) msg = 'Impacto significativo: '+totalExtra.toFixed(0)+' EUR/mes de gasto extra. Equivale a '+Math.round(totalExtra/precioActual)+' litros de combustible desperdiciados.';
  else msg = 'Impacto alto: '+totalExtra.toFixed(0)+' EUR/mes adicionales. En 6 meses de bloqueo habras pagado '+(totalExtra*6).toFixed(0)+' EUR de mas por la crisis geopolitica.';

  var em = document.getElementById('calc-msg');
  if(em) em.textContent = msg;

  // Update pred params
  var ps = document.getElementById('pred-brent');
  if(ps) ps.textContent = '$'+STATE.brent.toFixed(1);
  var psh = document.getElementById('pred-ships');
  if(psh) psh.textContent = '~'+STATE.ships;
  var pt = document.getElementById('pred-tens');
  if(pt) pt.textContent = STATE.tensionIndex+'/100';
  var pa = document.getElementById('pred-atk');
  if(pa) pa.textContent = STATE.attacks;
}



function updateEnergiaRiesgo(d){
  renderRiesgoElectrico(d);
}

function initEnergia(){
  calcAllFuel();
  startRiesgoTimer();
  calcImpact();
}
