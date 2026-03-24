/* ═══════════════════════════════════════════════
   centros/mercados.js
   Centro de Mercados: Brent/WTI + EUR/USD + Gas TTF
                       + Bolsas + Reservas IEA
═══════════════════════════════════════════════ */
'use strict';

/* Datos mercados externos (se rellenan cuando llegan los Workers) */
var MERCADOS = {
  eurusd:     null, eurusd_chg: null,
  gasttf:     null, gasttf_chg: null,
  diasReserva:null, reservasTs: null
};

function updateMercadosDivisa(d){
  MERCADOS.eurusd     = d.eurusd;
  MERCADOS.eurusd_chg = d.chg;
  var el = document.getElementById('m-eurusd');
  if(el){ el.textContent = d.eurusd ? d.eurusd.toFixed(4) : '--'; }
  var ec = document.getElementById('m-eurusd-chg');
  if(ec && d.chg){
    ec.textContent = (d.chg>0?'+':'')+d.chg.toFixed(4);
    ec.style.color  = d.chg>0?'var(--grn)':'var(--red)';
  }
  /* Stats bar update */
  var sb = document.getElementById('s-eurusd');
  if(sb) sb.textContent = d.eurusd ? d.eurusd.toFixed(3) : '--';
}

function updateMercadosGas(d){
  MERCADOS.gasttf     = d.gas_ttf;
  MERCADOS.gasttf_chg = d.chg;
  var el = document.getElementById('m-gasttf');
  if(el){ el.textContent = d.gas_ttf ? d.gas_ttf.toFixed(1)+' EUR/MWh' : '--'; }
}

function updateMercadosReservas(d){
  MERCADOS.diasReserva = d.dias_reserva;
  MERCADOS.reservasTs  = d.actualizado;
  var el = document.getElementById('m-reservas');
  if(el){ el.textContent = d.dias_reserva ? d.dias_reserva+' dias' : '--'; }
  var eb = document.getElementById('m-reservas-bar');
  if(eb){ eb.style.width = Math.min(100, d.dias_reserva/90*100)+'%'; }
}

function initMercados(){
  initCharts();
  generatePDF_available = true;
}
/* ═══════════════════════════════════════════════
   charts.js — Gráficos Chart.js y PDF export
═══════════════════════════════════════════════ */


var chartsOK = false;

function initCharts(){
  if(chartsOK)return;
  if(typeof Chart==='undefined'){
    var s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
    s.onload=function(){chartsOK=true;buildCharts();renderTensionPanel();};
    s.onerror=function(){document.querySelectorAll('.cwrap').forEach(function(w){w.innerHTML='<div style="height:100%;display:flex;align-items:center;justify-content:center;font-family:JetBrains Mono,monospace;font-size:.6rem;color:#2d4060;text-align:center">Sin internet para Chart.js</div>';});};
    document.head.appendChild(s);
  }else{chartsOK=true;buildCharts();renderTensionPanel();}
}
function buildCharts(){
  var TT={backgroundColor:'rgba(4,8,15,.97)',borderColor:'#f97316',borderWidth:1,titleColor:'#f97316',bodyColor:'#dde4f0',padding:10};
  var SC2={x:{grid:{color:'#0f1a2e'},ticks:{color:'#3d5578',font:{size:9},maxRotation:45}},y:{grid:{color:'#0f1a2e'},ticks:{color:'#3d5578',font:{size:9}}}};
  var B={responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:TT},scales:SC2};
  var D16=['20 Feb','22 Feb','24 Feb','26 Feb','28 Feb','1 Mar','2 Mar','3 Mar','5 Mar','7 Mar','9 Mar','11 Mar','13 Mar','15 Mar','17 Mar','Hoy'];
  var cb=document.getElementById('cBrent');if(cb)new Chart(cb,{type:'line',data:{labels:D16,datasets:[{data:[73.2,73.8,74.1,73.9,74.5,82.1,87.4,91.2,89.8,93.1,95.7,98.3,100.8,101.4,102.7,STATE.brent],borderColor:'#f97316',backgroundColor:'rgba(249,115,22,.06)',borderWidth:2,fill:true,tension:.4,pointBackgroundColor:D16.map(function(x,i){return i>=4?'#ef4444':'#f97316';}),pointRadius:D16.map(function(x,i){return i===4||i===15?5:3;})}]},options:Object.assign({},B,{scales:Object.assign({},SC2,{y:Object.assign({},SC2.y,{ticks:Object.assign({},SC2.y.ticks,{callback:function(v){return '$'+v;}})})})})});
  var tD=[103,108,105,112,28,4,1,3,8,5,6,9,7,11,8,STATE.transits];
  var ct=document.getElementById('cTraff');if(ct)new Chart(ct,{type:'bar',data:{labels:D16,datasets:[{data:tD,backgroundColor:tD.map(function(x,i){return i<4?'rgba(16,185,129,.5)':'rgba(239,68,68,.5)';}),borderColor:tD.map(function(x,i){return i<4?'#10b981':'#ef4444';}),borderWidth:1,borderRadius:3}]},options:B});
  var MD=['28 Feb','1 Mar','3 Mar','5 Mar','7 Mar','10 Mar','12 Mar','14 Mar','17 Mar','Hoy'];
  var cm=document.getElementById('cMkt');if(cm)new Chart(cm,{type:'line',data:{labels:MD,datasets:[{label:'S&P 500',data:[0,-4.2,-6.1,-5.8,-7.3,-6.9,-7.8,-8.1,-7.9,-8.0],borderColor:'#3b82f6',backgroundColor:'transparent',borderWidth:2,pointRadius:2,tension:.3},{label:'Nikkei',data:[0,-5.1,-7.4,-8.0,-9.1,-8.7,-9.2,-9.4,-9.1,-9.4],borderColor:'#f97316',backgroundColor:'transparent',borderWidth:2,pointRadius:2,tension:.3},{label:'DAX',data:[0,-3.8,-5.5,-5.9,-6.8,-6.3,-6.9,-7.1,-7.0,-7.0],borderColor:'#f59e0b',backgroundColor:'transparent',borderWidth:2,pointRadius:2,tension:.3},{label:'Energy ETF',data:[0,5.2,9.8,11.3,14.1,15.8,16.9,17.5,17.8,18.0],borderColor:'#10b981',backgroundColor:'transparent',borderWidth:2,pointRadius:2,tension:.3,borderDash:[5,3]}]},options:Object.assign({},B,{plugins:{legend:{display:true,labels:{color:'#4d6a90',font:{size:9},boxWidth:14,padding:8}},tooltip:TT},scales:Object.assign({},SC2,{y:Object.assign({},SC2.y,{ticks:Object.assign({},SC2.y.ticks,{callback:function(v){return(v>0?'+':'')+v+'%';}})})})})} );
  var ca=document.getElementById('cAtk');if(ca)new Chart(ca,{type:'line',data:{labels:['28 Feb','1 Mar','2 Mar','4 Mar','6 Mar','8 Mar','10 Mar','12 Mar','14 Mar','16 Mar','Hoy'],datasets:[{data:[1,3,5,7,9,11,13,16,18,20,STATE.attacks],borderColor:'#ef4444',backgroundColor:'rgba(239,68,68,.08)',borderWidth:2,pointBackgroundColor:'#ef4444',pointRadius:3,fill:true,tension:.3}]},options:B});
  var co=document.getElementById('cOil');if(co)new Chart(co,{type:'doughnut',data:{labels:['Crudo VLCC','GLP','GNL','Petroquimicos','Mixto'],datasets:[{data:[67,14,9,6,4],backgroundColor:['#f97316','#f59e0b','#3b82f6','#8b5cf6','#64748b'],borderColor:'#04080f',borderWidth:3}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'right',labels:{color:'#4d6a90',font:{size:9},boxWidth:11,padding:7}},tooltip:TT}}});
}
function generatePDF(){
  var btn=document.getElementById('pdf-btn');if(!btn)return;
  btn.disabled=true;btn.textContent='Generando...';
  var esP=calcPrice(SPAIN_FUELS[0].base,SPAIN_FUELS[0].tax,STATE.brent/74.5,0.15);
  var esD=calcPrice(SPAIN_FUELS[2].base,SPAIN_FUELS[2].tax,STATE.brent/74.5,0.18);
  var usr=currentUser?currentUser.name:'Admin';
  var pc='<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:Georgia,serif;max-width:820px;margin:0 auto;padding:40px;color:#1a1a1a;line-height:1.65}h1{font-size:1.7rem;color:#c2410c;border-bottom:3px solid #c2410c;padding-bottom:8px}h2{font-size:1.1rem;color:#9a3412;margin-top:22px}.meta{font-size:.82rem;color:#666;margin-bottom:20px;padding:8px;background:#fff7ed;border-radius:4px}.kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:18px 0}.kpi{text-align:center;background:#fff7ed;padding:12px;border-radius:6px}.kv{font-size:1.5rem;font-weight:900;color:#c2410c}.kl{font-size:.68rem;color:#9a3412;text-transform:uppercase}p{margin-bottom:.8rem}.footer{margin-top:28px;padding-top:12px;border-top:1px solid #e5e7eb;font-size:.72rem;color:#9ca3af}@media print{body{padding:20px}}</style></head><body>'+
    '<h1>HORMUZ INTELLIGENCE PLATFORM - INFORME EJECUTIVO</h1>'+
    '<div class="meta">Generado: '+new Date().toLocaleDateString('es-ES',{weekday:'long',year:'numeric',month:'long',day:'numeric'})+' '+new Date().toLocaleTimeString('es-ES')+' | Analista: '+san(usr)+'</div>'+
    '<div class="kpis"><div class="kpi"><div class="kv">~'+STATE.ships+'</div><div class="kl">Buques Varados</div></div><div class="kpi"><div class="kv">$'+STATE.brent.toFixed(1)+'</div><div class="kl">Brent USD/bbl</div></div><div class="kpi"><div class="kv">'+STATE.attacks+'</div><div class="kl">Ataques</div></div><div class="kpi"><div class="kv" style="color:#d97706">'+STATE.tensionIndex+'/100</div><div class="kl">Tension</div></div></div>'+
    '<h2>SITUACION ACTUAL</h2><p>Desde el 28 de febrero de 2026, el Estrecho de Hormuz permanece efectivamente bloqueado para buques de bandera occidental. Aproximadamente '+STATE.ships+' buques permanecen varados en el Golfo Persico y de Oman. Brent a $'+STATE.brent.toFixed(1)+'/barril (+40% desde el inicio).</p>'+
    '<h2>COMBUSTIBLES ESPANA</h2><p>SP95: '+esP.toFixed(3)+' EUR/L | Gasoil A: '+esD.toFixed(3)+' EUR/L | Impacto: +12-18% vs pre-crisis.</p>'+
    '<h2>PERSPECTIVAS</h2><p>Goldman Sachs proyecta Brent $120-140 si el bloqueo supera 60 dias. La AIE ha activado liberacion de reservas estrategicas. Riesgo de recesion global estimado 25%.</p>'+
    '<div class="footer">HORMUZ INTELLIGENCE PLATFORM v6 | Uso interno | Informativo</div></body></html>';
  var w=window.open('','_blank');if(w){w.document.write(pc);w.document.close();setTimeout(function(){w.print();},500);}
  btn.disabled=false;btn.textContent='GENERAR INFORME PDF';
  addLog('manual','Informe PDF generado','PDF Export');
  auditLog('PDF','Informe ejecutivo generado','charts');
}