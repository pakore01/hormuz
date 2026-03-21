/* ═══════════════════════════════════════════════
   fuel.js — Precios combustibles España (MITECO)
═══════════════════════════════════════════════ */
'use strict';

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
