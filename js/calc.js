/* ═══════════════════════════════════════════════
   calc.js — Calculadora de impacto personal
═══════════════════════════════════════════════ */
'use strict';

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

