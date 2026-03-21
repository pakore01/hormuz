/* ═══════════════════════════════════════════════
   news.js — Feed de noticias, ticker
═══════════════════════════════════════════════ */
'use strict';

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