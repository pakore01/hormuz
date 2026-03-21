/* ═══════════════════════════════════════════════
   tension.js — Índice de tensión geopolítica
═══════════════════════════════════════════════ */
'use strict';

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