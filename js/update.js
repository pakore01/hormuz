/* ═══════════════════════════════════════════════
   update.js — Sistema de actualización de datos
   Simulación + AI update + apply UI
═══════════════════════════════════════════════ */
'use strict';

var _key  = '';
var _nkey = '';
var _kv   = false;
var _nkv  = false;

/* Load saved API keys */
(function(){
  try{
    var rk=localStorage.getItem('hip9_k');
    if(rk){ var v=dec(rk); if(v.indexOf('sk-')===0){ _key=v; document.getElementById('apiKey').value=v; setSt('ok','Activa'); } }
    var nk=localStorage.getItem('hip9_nk');
    if(nk){ var v2=dec(nk); if(v2.length>8){ _nkey=v2; document.getElementById('newsKey').value=v2; var nel=document.getElementById('nkst'); if(nel){nel.textContent='Activa';nel.className='ak-st ok';} } }
  }catch(e){}
})();

function saveKey(){
  var v=(document.getElementById('apiKey').value||'').trim();
  var btn=document.getElementById('ak-save1');
  if(!v){ _key=''; try{localStorage.removeItem('hip9_k');}catch(e){} setSt('','Sin clave'); btn.textContent='GUARDAR'; btn.classList.remove('saved'); return; }
  if(v.indexOf('sk-')!==0||v.length<15){ setSt('err','Formato invalido'); return; }
  _key=v; try{localStorage.setItem('hip9_k',enc(v));}catch(e){}
  setSt('ok','Activa'); btn.textContent='OK'; btn.classList.add('saved');
  setTimeout(function(){ btn.textContent='GUARDAR'; btn.classList.remove('saved'); },2000);
}
function saveNewsKey(){
  var v=(document.getElementById('newsKey').value||'').trim();
  if(v.length<8) return;
  _nkey=v; try{localStorage.setItem('hip9_nk',enc(v));}catch(e){}
  var el=document.getElementById('nkst'); if(el){el.textContent='Activa';el.className='ak-st ok';}
  loadNews();
}
function toggleKey(){ _kv=!_kv; document.getElementById('apiKey').type=_kv?'text':'password'; }
function toggleNewsKey(){ _nkv=!_nkv; document.getElementById('newsKey').type=_nkv?'text':'password'; }
function setSt(t,m){ var e=document.getElementById('apist'); if(e){e.textContent=m;e.className='ak-st'+(t?' '+t:'');} }
document.getElementById('apiKey').addEventListener('keydown',function(e){if(e.key==='Enter')saveKey();});

function loadState(){
  try{
    var r=lsGet('hip9_upd');
    if(r){ if(r.state)Object.assign(STATE,r.state); if(r.log)LOG.push.apply(LOG,r.log.slice(-50)); return r.nextAt?new Date(r.nextAt):null; }
  }catch(e){}
  return null;
}
function saveState(){ lsSet('hip9_upd',{state:STATE,log:LOG.slice(-50),nextAt:nextAt?nextAt.toISOString():null}); }
function addLog(type,msg,src){ LOG.unshift({time:new Date().toISOString(),type:type,msg:msg,src:src}); if(LOG.length>100)LOG.pop(); renderLog(); saveState(); }
function renderLog(){
  var body=document.getElementById('ulog-body');
  var cnt=document.getElementById('ulog-cnt');
  if(cnt) cnt.textContent=LOG.length+' entrada'+(LOG.length!==1?'s':'');
  if(!body) return;
  if(!LOG.length){ body.innerHTML='<div style="padding:2rem;text-align:center;font-family:JetBrains Mono,monospace;font-size:.62rem;color:#2d4060">Sin actualizaciones aun.</div>'; return; }
  var html='';
  for(var i=0;i<LOG.length;i++){
    var e=LOG[i]; var t=new Date(e.time);
    var tc='utag-'+(e.type==='ai'?'ai':e.type==='alert'?'alert':e.type==='manual'?'manual':'auto');
    var tl=e.type==='ai'?'IA':e.type==='alert'?'ALERTA':e.type==='manual'?'MANUAL':'AUTO';
    html+='<div class="ue"><div class="ue-time">'+fmtTs(t)+'</div><div class="ue-msg"><span class="utag '+tc+'">'+tl+'</span>'+san(e.msg)+'</div><div class="ue-src">'+san(e.src||'')+'</div></div>';
  }
  body.innerHTML=html;
}
function startCD(){
  if(cdTimer) clearInterval(cdTimer);
  cdTimer=setInterval(function(){ if(!nextAt)return; if(nextAt-Date.now()<=0){clearInterval(cdTimer);triggerUpdate(false);} },1000);
}
function simUpdate(){
  var v=function(){return(Math.random()-.46)*2.8;};
  var nb=Math.max(75,Math.min(145,STATE.brent+v()));
  var nt=Math.max(0,Math.min(10,STATE.transits+Math.round((Math.random()-.4)*2)));
  var na=STATE.attacks+(Math.random()<.18?1:0);
  var ns=Math.max(320,Math.min(460,STATE.ships+Math.round((Math.random()-.5)*18)));
  var changes=[];
  if(Math.abs(nb-STATE.brent)>.4) changes.push('Brent '+(nb>STATE.brent?'+':'')+nb.toFixed(1));
  if(na>STATE.attacks) changes.push('Nuevo ataque total '+na);
  if(nt!==STATE.transits) changes.push('Transitos '+nt+'/dia');
  Object.assign(PREV,STATE);
  STATE.brent=nb; STATE.wti=Math.max(72,nb*.968); STATE.transits=nt; STATE.attacks=na; STATE.ships=ns; STATE.updatedAt=new Date();
  applyUI(changes,false,false);
  return changes;
}
function aiUpdate(){
  if(!_key) return Promise.resolve(simUpdate());
  var prompt='Crisis Hormuz '+new Date().toLocaleDateString('es-ES')+'. Solo JSON sin markdown: {"brent":103.5,"wti":100.2,"transits":3,"attacks":22,"ships":398,"summary":"texto breve","alert":false}';
  return fetch('https://api.anthropic.com/v1/messages',{
    method:'POST',
    headers:{'Content-Type':'application/json','x-api-key':_key,'anthropic-version':'2023-06-01'},
    body:JSON.stringify({model:'claude-haiku-4-5-20251001',max_tokens:350,messages:[{role:'user',content:prompt}]})
  }).then(function(res){
    if(!res.ok) throw new Error('API '+res.status);
    return res.json();
  }).then(function(data){
    var text=(data.content||[]).map(function(c){return c.text||'';}).join('').trim().replace(/```json|```/g,'').trim();
    var p=JSON.parse(text); var changes=[];
    Object.assign(PREV,STATE);
    if(typeof p.brent==='number'){ if(Math.abs(p.brent-STATE.brent)>.3)changes.push('Brent $'+p.brent.toFixed(1)); STATE.brent=p.brent; }
    if(typeof p.wti==='number') STATE.wti=p.wti;
    if(typeof p.transits==='number'){ if(p.transits!==STATE.transits)changes.push('Transitos '+p.transits+'/dia'); STATE.transits=p.transits; }
    if(typeof p.attacks==='number'){ if(p.attacks>STATE.attacks)changes.push('Ataques '+p.attacks); STATE.attacks=p.attacks; }
    if(typeof p.ships==='number') STATE.ships=p.ships;
    if(p.summary) changes.push(p.summary);
    STATE.updatedAt=new Date();
    applyUI(changes,true,p.alert||false);
    return changes;
  }).catch(function(){ return simUpdate(); });
}
function applyUI(changes,isAI,isAlert){
  function flash(id){ var sb=document.getElementById(id); if(!sb)return; var box=sb.closest?sb.closest('.sbox'):null; if(!box)return; box.classList.remove('flash'); requestAnimationFrame(function(){box.classList.add('flash');}); }
  var bc=STATE.brent-PREV.brent;
  var sb=document.getElementById('s-brent'); if(sb) sb.innerHTML='$'+STATE.brent.toFixed(1)+'<span class="ci '+(bc>0?'cup':'cdn')+'">'+(bc>0?'+':'')+bc.toFixed(1)+'</span>';
  flash('s-brent');
  var ss=document.getElementById('s-ships'); if(ss) ss.textContent='~'+STATE.ships; flash('s-ships');
  var sa=document.getElementById('s-attacks'); if(sa) sa.textContent=STATE.attacks; flash('s-attacks');
  var st=document.getElementById('s-transit'); if(st) st.textContent=STATE.transits; flash('s-transit');
  var cb=document.getElementById('c-brent'); if(cb) cb.textContent='$'+STATE.brent.toFixed(1);
  var cw=document.getElementById('c-wti');   if(cw) cw.textContent='$'+STATE.wti.toFixed(1);
  var ct=document.getElementById('c-transit'); if(ct) ct.textContent=STATE.transits;
  var nb=document.getElementById('ns-brent'); if(nb) nb.textContent='$'+STATE.brent.toFixed(1);
  var nt=document.getElementById('ns-trans'); if(nt) nt.textContent=STATE.transits+'/dia';
  var na=document.getElementById('ns-atk');   if(na) na.textContent=STATE.attacks;
  var ppships=document.getElementById('pp-ships'); if(ppships) ppships.textContent='~'+STATE.ships;
  var ppbrent=document.getElementById('pp-brent'); if(ppbrent) ppbrent.textContent='$'+STATE.brent.toFixed(1);
  var ppatk=document.getElementById('pp-attacks'); if(ppatk) ppatk.textContent=STATE.attacks;
  updateTensionUI(); calcAllFuel();
  addLog(isAlert?'alert':isAI?'ai':'auto', changes.length?changes.join(' / '):'Sin cambios', isAI?'Claude AI':'Simulacion');
}
function triggerUpdate(manual){
  if(manual) addLog('manual','Actualizacion manual solicitada','Usuario');
  return aiUpdate().then(function(){ saveState(); nextAt=new Date(Date.now()+UPD_MS); saveState(); startCD(); });
}
