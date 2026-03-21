/* ═══════════════════════════════════════════════
   flows.js — Canvas animado flujos de petróleo
═══════════════════════════════════════════════ */
'use strict';

var flowsAnim=null, flowsRunning=true, flowFilter='all', flowTick=0;

var FLOWS=[
  {fx:62,fy:44,tx:15,ty:22,mb:8,type:'blocked'},
  {fx:62,fy:44,tx:82,ty:55,mb:2,type:'active'},
  {fx:62,fy:44,tx:95,ty:38,mb:1,type:'active'},
  {fx:62,fy:44,tx:70,ty:85,mb:4,type:'alt'},
  {fx:50,fy:15,tx:18,ty:18,mb:5,type:'active'},
  {fx:12,fy:8, tx:18,ty:18,mb:3,type:'active'},
  {fx:12,fy:62,tx:8, ty:35,mb:3,type:'active'},
  {fx:2, fy:30,tx:15,ty:50,mb:4,type:'active'},
  {fx:28,fy:60,tx:20,ty:38,mb:5,type:'blocked'}
];

function startFlows(){
  var canvas=document.getElementById('flows-canvas');if(!canvas)return;
  var W=canvas.offsetWidth||900;canvas.width=W;canvas.height=480;
  var ctx=canvas.getContext('2d');if(flowsAnim)cancelAnimationFrame(flowsAnim);
  var cols={blocked:'#ef4444',active:'#10b981',alt:'#3b82f6'};
  function draw(){
    ctx.clearRect(0,0,W,480);ctx.fillStyle='#020a14';ctx.fillRect(0,0,W,480);
    ctx.strokeStyle='rgba(15,26,46,.7)';ctx.lineWidth=.5;
    for(var x=0;x<W;x+=W/12){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,480);ctx.stroke();}
    for(var y=0;y<480;y+=60){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
    for(var j=0;j<FLOWS.length;j++){
      var fl=FLOWS[j];if(flowFilter!=='all'&&fl.type!==flowFilter)continue;
      var x1=fl.fx/100*W,y1=fl.fy/100*480,x2=fl.tx/100*W,y2=fl.ty/100*480;
      var col=cols[fl.type]||'#64748b';var lw=Math.max(1,Math.min(6,fl.mb*.7));
      ctx.save();ctx.strokeStyle=col;ctx.lineWidth=lw;ctx.globalAlpha=fl.type==='blocked'?.55:.7;
      ctx.setLineDash([12,6]);ctx.lineDashOffset=-(flowTick*2*(fl.type==='blocked'?-1:1));
      var cxp=(x1+x2)/2+(y2-y1)*.15,cyp=(y1+y2)/2-(x2-x1)*.15;
      ctx.beginPath();ctx.moveTo(x1,y1);ctx.quadraticCurveTo(cxp,cyp,x2,y2);ctx.stroke();ctx.restore();
      var ang=Math.atan2(y2-cyp,x2-cxp);
      ctx.save();ctx.translate(x2,y2);ctx.rotate(ang);ctx.fillStyle=col;ctx.globalAlpha=.85;
      ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(-10,-4);ctx.lineTo(-10,4);ctx.closePath();ctx.fill();ctx.restore();
      ctx.fillStyle='rgba(184,197,216,.75)';ctx.font='9px monospace';ctx.globalAlpha=.85;
      ctx.fillText(fl.mb+' Mb/d',(x1+x2)/2,(y1+y2)/2);ctx.globalAlpha=1;
    }
    flowTick++;if(flowsRunning)flowsAnim=requestAnimationFrame(draw);
  }
  draw();
}
function setFlowFilter(f,btn){
  flowFilter=f;
  document.querySelectorAll('[id^="fl-"]').forEach(function(b){b.classList.remove('active');});
  btn.classList.add('active');
}
function toggleAnim(btn){
  flowsRunning=!flowsRunning;btn.textContent=flowsRunning?'PAUSAR':'REANUDAR';
  btn.classList.toggle('active',flowsRunning);if(flowsRunning)startFlows();
}