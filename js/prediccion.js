/* ═══════════════════════════════════════════════
   prediccion.js — Predicción IA con Claude Haiku
   Genera escenarios geopolíticos y forecast del Brent
═══════════════════════════════════════════════ */
'use strict';

var predBusy = false;

function runPrediccion(){
  if(predBusy) return;
  if(!_key){
    alert('Necesitas una API key de Anthropic en la barra superior para usar la prediccion IA.');
    return;
  }

  predBusy = true;
  var btn = document.getElementById('pred-btn');
  if(btn) btn.disabled = true;
  document.getElementById('pred-loading').style.display = 'block';
  document.getElementById('pred-result').style.display = 'none';

  var now = new Date();
  var diff = now - CRISIS_START;
  var dias = Math.floor(diff / (1000*60*60*24));

  var prompt = 'Eres un analista geopolitico experto en energia y mercados del petroleo.\n\n' +
    'DATOS ACTUALES DE LA CRISIS DEL ESTRECHO DE HORMUZ ('+now.toLocaleDateString('es-ES')+'):\n' +
    '- Dias de bloqueo: '+dias+'\n' +
    '- Brent: $'+STATE.brent.toFixed(1)+'/barril\n' +
    '- Buques varados: ~'+STATE.ships+'\n' +
    '- Ataques confirmados: '+STATE.attacks+'\n' +
    '- Indice de tension: '+STATE.tensionIndex+'/100\n' +
    '- Transitos diarios: '+STATE.transits+' (vs 100+ pre-crisis)\n\n' +
    'Genera un analisis predictivo en JSON con este formato exacto (sin markdown):\n' +
    '{"escenario_optimista":{"probabilidad":25,"descripcion":"texto","brent_30d":95,"brent_60d":85},' +
    '"escenario_base":{"probabilidad":50,"descripcion":"texto","brent_30d":110,"brent_60d":105},' +
    '"escenario_pesimista":{"probabilidad":25,"descripcion":"texto","brent_30d":130,"brent_60d":140},' +
    '"fin_bloqueo_estimado":"texto fecha estimada",' +
    '"analisis":"parrafo de analisis completo en espanol de 4-5 lineas",' +
    '"brent_30d":105,"brent_60d":100}';

  fetch('https://api.anthropic.com/v1/messages',{
    method:'POST',
    headers:{'Content-Type':'application/json','x-api-key':_key,'anthropic-version':'2023-06-01'},
    body:JSON.stringify({model:'claude-haiku-4-5-20251001',max_tokens:1000,messages:[{role:'user',content:prompt}]})
  }).then(function(r){
    if(!r.ok) throw new Error('API '+r.status);
    return r.json();
  }).then(function(data){
    var text = (data.content||[]).map(function(c){return c.text||'';}).join('').trim().replace(/```json|```/g,'').trim();
    var p = JSON.parse(text);

    // Render scenarios
    var scHtml = '';
    var scenarios = [
      {key:'escenario_optimista', label:'OPTIMISTA', col:'#10b981', icon:'↓'},
      {key:'escenario_base',      label:'BASE',      col:'#f59e0b', icon:'→'},
      {key:'escenario_pesimista', label:'PESIMISTA', col:'#ef4444', icon:'↑'}
    ];
    for(var i=0;i<scenarios.length;i++){
      var s = scenarios[i];
      var sc = p[s.key] || {};
      scHtml += '<div style="background:var(--card2);border:1px solid var(--bor2);border-radius:8px;padding:1rem;text-align:center">' +
        '<div style="font-family:\'JetBrains Mono\',monospace;font-size:.52rem;color:'+s.col+';letter-spacing:1.5px;margin-bottom:.4rem">'+s.label+'</div>' +
        '<div style="font-family:\'Bebas Neue\',sans-serif;font-size:2rem;color:'+s.col+'">'+((sc.probabilidad||'--'))+'%</div>' +
        '<div style="font-family:\'JetBrains Mono\',monospace;font-size:.52rem;color:#4d6a90;margin:.4rem 0">Probabilidad</div>' +
        '<div style="font-size:.65rem;color:var(--txt2);line-height:1.5;margin-bottom:.6rem">'+san(sc.descripcion||'')+'</div>' +
        '<div style="font-family:\'JetBrains Mono\',monospace;font-size:.58rem;color:'+s.col+'">Brent 30d: $'+(sc.brent_30d||'--')+'</div>' +
        '</div>';
    }
    var scEl = document.getElementById('pred-scenarios');
    if(scEl) scEl.innerHTML = scHtml;

    // Render analysis
    var ptEl = document.getElementById('pred-text');
    if(ptEl) ptEl.textContent = p.analisis || '';

    // Render brent predictions
    var b30 = document.getElementById('pred-b30');
    if(b30){ b30.textContent = '$'+(p.brent_30d||'--'); b30.style.color = (p.brent_30d||0)>STATE.brent?'#ef4444':'#10b981'; }
    var b60 = document.getElementById('pred-b60');
    if(b60){ b60.textContent = '$'+(p.brent_60d||'--'); b60.style.color = (p.brent_60d||0)>STATE.brent?'#ef4444':'#10b981'; }
    var fin = document.getElementById('pred-fin');
    if(fin) fin.textContent = p.fin_bloqueo_estimado || '--';

    document.getElementById('pred-loading').style.display = 'none';
    document.getElementById('pred-result').style.display = 'block';
    var pl = document.getElementById('pred-last');
    if(pl) pl.textContent = 'Generado: '+new Date().toLocaleTimeString('es-ES');
    auditLog('PREDICCION','Prediccion IA generada','prediccion');

  }).catch(function(e){
    document.getElementById('pred-loading').style.display = 'none';
    alert('Error generando prediccion: '+e.message);
  }).then(function(){
    predBusy = false;
    var btn2 = document.getElementById('pred-btn');
    if(btn2) btn2.disabled = false;
  });
}

