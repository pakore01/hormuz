/* ═══════════════════════════════════════════════
   centros/crisis.js
   Centro de Crisis: Tensión + Noticias + Timeline
═══════════════════════════════════════════════ */
'use strict';

/* ═══════════════════════════════════════════════
   tension.js — Índice de tensión geopolítica
═══════════════════════════════════════════════ */


function calcTension(){
  var scores={
    traffic:Math.max(0,100-(STATE.transits/100*100)),
    attacks:Math.min(100,STATE.attacks/30*100),
    oilRisk:Math.min(100,(STATE.brent-74.5)/80*100),
    ships:Math.min(100,STATE.ships/500*100),
    diplo:72,markets:68
  };
  var total=0;
  for(var i=0;i<TCOMPS.length;i++)total+=(scores[TCOMPS[i].key]||0)*TCOMPS[i].weight;
  return Math.round(Math.min(100,Math.max(0,total)));
}

function tensionLevel(v){
  if(v>=80)return{lbl:'CRITICO',col:'#ef4444'};
  if(v>=60)return{lbl:'ALTO',   col:'#f59e0b'};
  if(v>=40)return{lbl:'MEDIO',  col:'#f97316'};
  if(v>=20)return{lbl:'BAJO',   col:'#10b981'};
  return{lbl:'ESTABLE',col:'#06b6d4'};
}

function updateTensionUI(){
  var val=calcTension();STATE.tensionIndex=val;
  var lvl=tensionLevel(val);
  var f=document.getElementById('tg-fill');
  if(f){f.style.width=val+'%;';f.style.background=val>=60?'linear-gradient(90deg,#f59e0b,#ef4444)':'linear-gradient(90deg,#10b981,#f59e0b)';}
  var n=document.getElementById('tg-num');if(n){n.textContent=val;n.style.color=lvl.col;}
  var st=document.getElementById('s-tension');if(st){st.textContent=val+'/100';st.style.color=lvl.col;}
  var pp=document.getElementById('pp-tens');if(pp)pp.textContent=val;
  var pb=document.getElementById('pp-bar');if(pb)pb.style.width=val+'%';
  var ns=document.getElementById('ns-tens');if(ns){ns.textContent=val+'/100';ns.style.color=lvl.col;}
  checkThresholds();
}

function renderTensionPanel(){
  var val=calcTension();
  var lvl=tensionLevel(val);
  var gv=document.getElementById('g-val');if(gv){gv.textContent=val;gv.style.color=lvl.col;}
  var gl=document.getElementById('g-lbl');if(gl){gl.textContent=lvl.lbl;gl.style.color=lvl.col;}
  var needle=document.getElementById('g-needle');
  if(needle)needle.setAttribute('transform','rotate('+((-90+(val/100)*180))+',90,90)');
  var arc=document.getElementById('g-arc');
  if(arc)arc.style.strokeDashoffset=String(251-(251*(val/100)));
  var scores={traffic:Math.max(0,100-(STATE.transits/100*100)),attacks:Math.min(100,STATE.attacks/30*100),oilRisk:Math.min(100,(STATE.brent-74.5)/80*100),ships:Math.min(100,STATE.ships/500*100),diplo:72,markets:68};
  var html='';
  for(var i=0;i<TCOMPS.length;i++){
    var c=TCOMPS[i];var sc=Math.round(scores[c.key]||0);
    var col=sc>=70?'#ef4444':sc>=45?'#f59e0b':'#10b981';
    html+='<div class="tc-row"><div class="tc-name">'+san(c.name)+'<div class="tc-sub">'+san(c.sub)+'</div></div>'+
      '<div class="tc-bw"><div class="tc-bf" style="width:'+sc+'%;background:'+col+'"></div></div>'+
      '<div class="tc-num" style="color:'+col+'">'+sc+'</div></div>';
  }
  var tc=document.getElementById('tc-items');if(tc)tc.innerHTML=html;
  if(typeof Chart!=='undefined'){
    var ctx=document.getElementById('tension-chart');
    if(ctx&&!ctx._tc){
      var dates=['20 Feb','22 Feb','24 Feb','26 Feb','28 Feb','1 Mar','3 Mar','5 Mar','7 Mar','10 Mar','12 Mar','14 Mar','17 Mar','Hoy'];
      var vals=[22,24,26,28,82,87,85,80,83,79,82,80,78,val];
      ctx._tc=new Chart(ctx,{type:'line',data:{labels:dates,datasets:[{data:vals,borderColor:'#f59e0b',backgroundColor:'rgba(245,158,11,.07)',borderWidth:2,fill:true,tension:.4,pointBackgroundColor:vals.map(function(v){return v>=80?'#ef4444':v>=60?'#f59e0b':'#10b981';}),pointRadius:vals.map(function(v,i){return i===4||i===13?6:3;})}]},
        options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{backgroundColor:'rgba(4,8,15,.97)',borderColor:'#f59e0b',borderWidth:1,titleColor:'#f59e0b',bodyColor:'#dde4f0',padding:10,callbacks:{label:function(c){return ' Tension: '+c.raw+'/100';}}}},
          scales:{x:{grid:{color:'#0f1a2e'},ticks:{color:'#3d5578',font:{size:9},maxRotation:45}},y:{grid:{color:'#0f1a2e'},min:0,max:100,ticks:{color:'#3d5578',font:{size:9}}}}}});
    }
  }
}

/* ═══════════════════════════════════════════════
   news.js — Feed de noticias, ticker
═══════════════════════════════════════════════ */


var newsLoaded = false;

function loadNews(){
  var el=document.getElementById('news-last-upd');if(el)el.textContent='Actualizando...';
  var articles=NEWS.slice();
  if(_nkey){
    fetch('https://newsapi.org/v2/everything?q=Hormuz+OR+Houthi+OR+oil+tanker&language=es&sortBy=publishedAt&pageSize=6&apiKey='+_nkey)
    .then(function(r){return r.json();})
    .then(function(d){
      if(d.articles){
        var live=d.articles.slice(0,5).map(function(a){return{title:a.title||'Sin titulo',body:a.description||'',sev:'medium',src:(a.source&&a.source.name)||'NewsAPI',time:new Date(a.publishedAt).toLocaleString('es-ES'),url:a.url};});
        articles=live.concat(articles.slice(0,4));
      }
      renderNews(articles);
    }).catch(function(){renderNews(articles);});
  }else{renderNews(articles);}
  newsLoaded=true;
  if(el)el.textContent='Actualizado: '+new Date().toLocaleTimeString('es-ES');
}

function renderNews(articles){
  var STAGS={critical:'CRITICO',high:'ALTO',medium:'MEDIO',low:'INFO'};
  var html='<div class="nlist">';
  for(var i=0;i<articles.length;i++){
    var a=articles[i];
    var oc=a.url?'onclick="window.open(\''+a.url+'\',\'_blank\')" style="cursor:pointer"':'';
    html+='<div class="ncard '+san(a.sev)+'" '+oc+'>'+
      '<div class="nc-hdr"><div class="nc-title">'+san(a.title)+'</div><span class="nc-tag '+san(a.sev)+'">'+san(STAGS[a.sev]||a.sev)+'</span></div>'+
      '<div class="nc-body">'+san(a.body)+'</div>'+
      '<div class="nc-foot"><span class="nc-src">'+san(a.src)+'</span><span>'+san(a.time)+'</span></div></div>';
  }
  html+='</div>';
  var nl=document.getElementById('news-list');if(nl)nl.innerHTML=html;
  var crit=articles.filter(function(a){return a.sev==='critical';}).length;
  var badge=document.getElementById('news-badge');if(badge&&crit>0){badge.textContent=crit;badge.style.display='inline-block';}
}

function buildTicker(){
  var tw=document.getElementById('ticker-inner');if(!tw)return;
  var html='';
  for(var i=0;i<NEWS.length;i++){html+='<span class="ti"><span class="tidot"></span>'+san(NEWS[i].title)+'</span>';}
  tw.innerHTML=html+html;
}

function initCrisis(){
  renderTensionPanel();
  if(!newsLoaded){ loadNews(); newsLoaded=true; }
}
