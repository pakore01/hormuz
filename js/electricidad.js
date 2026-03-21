/* ═══════════════════════════════════════════════
   electricidad.js — Módulo Red Eléctrica España
   Índice de riesgo apagón + mix generación + precios
═══════════════════════════════════════════════ */
'use strict';

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
