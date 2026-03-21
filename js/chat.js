/* ═══════════════════════════════════════════════
   chat.js — Chat IA con Claude Haiku
═══════════════════════════════════════════════ */
'use strict';

var chatHist = [];
var chatBusy = false;

function autoResize(el){el.style.height='auto';el.style.height=Math.min(el.scrollHeight,92)+'px';}
function chatKD(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendChat();}}
function sendSug(el){var ci=document.getElementById('chat-input');if(ci){ci.value=el.textContent;sendChat();}}
function addMsg(role,text){
  var msgs=document.getElementById('chat-msgs');if(!msgs)return;
  var div=document.createElement('div');div.className='msg '+role;
  var now=new Date().toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'});
  div.innerHTML='<div class="msg-av">'+(role==='user'?'U':'AI')+'</div><div><div class="msg-bub">'+(role==='ai'?text:san(text))+'</div><div class="msg-time">'+now+'</div></div>';
  msgs.appendChild(div);msgs.scrollTop=msgs.scrollHeight;
}
function addTyping(){
  var msgs=document.getElementById('chat-msgs');if(!msgs)return;
  var div=document.createElement('div');div.className='msg ai';div.id='typing';
  div.innerHTML='<div class="msg-av">AI</div><div><div class="msg-bub"><div class="typi"><div class="td"></div><div class="td"></div><div class="td"></div></div></div></div>';
  msgs.appendChild(div);msgs.scrollTop=msgs.scrollHeight;
}
function sendChat(){
  if(chatBusy)return;
  var inp=document.getElementById('chat-input');if(!inp)return;
  var text=(inp.value||'').trim();if(!text)return;
  inp.value='';inp.style.height='auto';
  addMsg('user',text);chatHist.push({role:'user',content:text});
  if(!_key){addMsg('ai','Necesitas una API key de Anthropic para usar el chat IA.');return;}
  chatBusy=true;var cs=document.getElementById('chat-send');if(cs)cs.disabled=true;addTyping();
  var ctx='Eres el sistema de inteligencia Hormuz v6. Datos: barcos ~'+STATE.ships+', Brent $'+STATE.brent.toFixed(1)+', ataques '+STATE.attacks+', transitos '+STATE.transits+'/dia, tension '+STATE.tensionIndex+'/100. Bloqueo desde 28 Feb 2026. Responde en espanol experto y conciso.';
  fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json','x-api-key':_key,'anthropic-version':'2023-06-01'},body:JSON.stringify({model:'claude-haiku-4-5-20251001',max_tokens:700,system:ctx,messages:chatHist.slice(-10)})})
  .then(function(res){if(!res.ok)throw new Error('API '+res.status);return res.json();})
  .then(function(data){
    var reply=(data.content||[]).map(function(c){return c.text||'';}).join('');
    var typi=document.getElementById('typing');if(typi)typi.remove();
    chatHist.push({role:'assistant',content:reply});
    var fmt=san(reply).replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').split('\n').join('<br>');
    addMsg('ai',fmt);auditLog('CHAT','Consulta al chat IA','chat');
  }).catch(function(e){var typi=document.getElementById('typing');if(typi)typi.remove();addMsg('ai','Error: '+san(e.message));})
  .then(function(){chatBusy=false;var cs2=document.getElementById('chat-send');if(cs2)cs2.disabled=false;});
}