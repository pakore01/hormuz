/* ═══════════════════════════════════════════════
   map.js — Mapa interactivo, SVG overlay, zoom/pan,
            gestos táctiles
═══════════════════════════════════════════════ */
'use strict';

var curView = 'region';
var mapFilter = 'all';
var mSc=1, mTx=0, mTy=0, mDr=false, mSx, mSy, mSTx=0, mSTy=0;

var SC = {loaded:'#f97316',attacked:'#ef4444',transit:'#10b981',waiting:'#f59e0b'};
var SL = {loaded:'CARGADO',attacked:'ATACADO',transit:'TRANSITADO',waiting:'EN ESPERA'};

function toSVG(lat,lng){var b=MAP_BOUNDS[curView];return{x:(lng-b.lngMin)/(b.lngMax-b.lngMin)*100,y:(b.latMax-lat)/(b.latMax-b.latMin)*100};}
function inB(lat,lng){var b=MAP_BOUNDS[curView],m=2;return lng>=b.lngMin-m&&lng<=b.lngMax+m&&lat>=b.latMin-m&&lat<=b.latMax+m;}
function renderMap(){
  var mi=document.getElementById('map-img');if(mi)mi.src=MAP_IMGS[curView];
  var ns='http://www.w3.org/2000/svg';
  ['sr','sz','ss','sl2'].forEach(function(id){var e=document.getElementById(id);if(e)e.innerHTML='';});
  var tt=document.getElementById('mtt');
  var sr=document.getElementById('sr'),sz=document.getElementById('sz'),ss=document.getElementById('ss'),sl2=document.getElementById('sl2');
  if(!sr||!sz||!ss||!sl2)return;
  var ROUTES=[
    {pts:[[26,56.5],[25.5,57.5],[24,58.5],[22,60],[17,56],[14,48],[12.8,43.8],[12.6,43.3],[13.5,42],[16,40.5],[20,38.5],[25,36],[29.5,32.5]],col:'#ef4444',dash:'2.5,1.5',cls:'ra'},
    {pts:[[26,56.5],[22,62],[18,66],[12,67],[5,65],[0,62],[-8,55],[-20,52],[-34.5,18.5]],col:'#10b981',dash:'2,1.5',cls:''}
  ];
  for(var ri=0;ri<ROUTES.length;ri++){
    var rt=ROUTES[ri];var fpts=rt.pts.filter(function(p){return inB(p[0],p[1]);});
    if(fpts.length<2)continue;
    var d=fpts.map(function(p,i){var xy=toSVG(p[0],p[1]);return(i?'L':'M')+xy.x.toFixed(2)+','+xy.y.toFixed(2);}).join(' ');
    var path=document.createElementNS(ns,'path');
    path.setAttribute('d',d);path.setAttribute('fill','none');path.setAttribute('stroke',rt.col);
    path.setAttribute('stroke-width','0.6');path.setAttribute('stroke-dasharray',rt.dash);
    path.setAttribute('stroke-linecap','round');path.setAttribute('opacity','0.65');
    if(rt.cls)path.setAttribute('class',rt.cls);sr.appendChild(path);
  }
  var ZONES=[{lat:25.9,lng:56.5,w:2,h:1.2,col:'rgba(249,115,22,1)',lbl:'HORMUZ',sub:'BLOQUEADO'},{lat:12.6,lng:43.4,w:1.5,h:1.2,col:'rgba(245,158,11,1)',lbl:'BAB EL-MANDEB',sub:'HOUTHIS'}];
  for(var zi=0;zi<ZONES.length;zi++){
    var z=ZONES[zi];if(!inB(z.lat,z.lng))continue;
    var xy=toSVG(z.lat,z.lng);var bds=MAP_BOUNDS[curView];
    var pw=z.w/(bds.lngMax-bds.lngMin)*100,ph=z.h/(bds.latMax-bds.latMin)*100;
    var rect=document.createElementNS(ns,'rect');
    rect.setAttribute('x',(xy.x-pw/2).toFixed(2));rect.setAttribute('y',(xy.y-ph/2).toFixed(2));
    rect.setAttribute('width',pw.toFixed(2));rect.setAttribute('height',ph.toFixed(2));
    rect.setAttribute('rx','0.5');rect.setAttribute('fill',z.col.replace('1)','0.08)'));
    rect.setAttribute('stroke',z.col);rect.setAttribute('stroke-width','0.35');rect.setAttribute('stroke-dasharray','1.5,1');
    sz.appendChild(rect);
    var lblArr=[[z.lbl,xy.y-ph/2-0.8,'bold',1.8],[z.sub,xy.y+ph/2+1.5,'normal',1.5]];
    for(var li=0;li<lblArr.length;li++){
      var lb=lblArr[li];var te=document.createElementNS(ns,'text');
      te.setAttribute('x',xy.x.toFixed(2));te.setAttribute('y',lb[1].toFixed(2));
      te.setAttribute('text-anchor','middle');te.setAttribute('font-family','JetBrains Mono,monospace');
      te.setAttribute('font-size',lb[3]);te.setAttribute('fill',z.col);te.setAttribute('font-weight',lb[2]);
      te.textContent=lb[0];sl2.appendChild(te);
    }
  }
  var cnt={loaded:0,attacked:0,transit:0,waiting:0};
  for(var si=0;si<SHIPS.length;si++){
    var sh=SHIPS[si];
    if(mapFilter!=='all'&&sh.s!==mapFilter)continue;if(!inB(sh.lat,sh.lng))continue;
    if(cnt[sh.s]!==undefined)cnt[sh.s]++;
    var sxy=toSVG(sh.lat,sh.lng);var c=SC[sh.s]||'#94a3b8';var isAtk=sh.s==='attacked';
    var r=isAtk?1.4:(sh.n.indexOf('x')!==-1?1.3:1.1);
    var grp=document.createElementNS(ns,'g');grp.setAttribute('class','sg');
    if(isAtk){var ring=document.createElementNS(ns,'circle');ring.setAttribute('cx',sxy.x.toFixed(2));ring.setAttribute('cy',sxy.y.toFixed(2));ring.setAttribute('r','1.8');ring.setAttribute('fill','none');ring.setAttribute('stroke',c);ring.setAttribute('stroke-width','0.5');ring.setAttribute('class','ar');grp.appendChild(ring);}
    var circ=document.createElementNS(ns,'circle');circ.setAttribute('cx',sxy.x.toFixed(2));circ.setAttribute('cy',sxy.y.toFixed(2));circ.setAttribute('r',r);circ.setAttribute('fill',c);circ.setAttribute('class','sc2');if(isAtk)circ.setAttribute('filter','url(#ga)');grp.appendChild(circ);
    (function(ship,circle,radius){
      circle.addEventListener('mouseenter',function(){
        circle.setAttribute('r',(radius*1.9).toFixed(2));
        var tons=ship.T>=1000?(ship.T/1000).toFixed(0)+'k T':ship.T+' T';
        if(tt)tt.innerHTML='<div class="mtt-name">'+san(ship.fn)+' - '+san(ship.n)+'</div>'+
          '<div class="mtt-row">Tipo: <b>'+san(ship.t)+'</b></div>'+
          '<div class="mtt-row">Estado: <b>'+san(SL[ship.s]||ship.s)+'</b></div>'+
          '<div class="mtt-row">Posicion: <b>'+san(ship.p)+'</b></div>'+
          '<div class="mtt-row">Cargo: <b>'+san(ship.c)+'</b></div>'+
          '<div class="mtt-vals"><div><div class="mtt-vlbl">TONELADAS</div><div class="mtt-vnum">'+tons+'</div></div>'+
          '<div style="text-align:right"><div class="mtt-vlbl">VALOR</div><div style="font-family:JetBrains Mono,monospace;font-size:.8rem;color:#10b981;font-weight:700">~$'+ship.V+'M</div></div></div>';
        if(tt)tt.style.display='block';
      });
      circle.addEventListener('mousemove',function(e){
        var wr=document.getElementById('map-wrap');if(!wr||!tt)return;
        var rc=wr.getBoundingClientRect();var tx=e.clientX-rc.left+12,ty=e.clientY-rc.top-10;
        if(tx+255>rc.width)tx=e.clientX-rc.left-260;if(ty+170>rc.height)ty=e.clientY-rc.top-175;
        tt.style.left=tx+'px';tt.style.top=ty+'px';
      });
      circle.addEventListener('mouseleave',function(){
        circle.setAttribute('r',radius.toFixed(2));if(tt)tt.style.display='none';
      });
    })(sh,circ,r);
    ss.appendChild(grp);
  }
  ['mc-l','mc-a','mc-t','mc-w'].forEach(function(id,i){var e=document.getElementById(id);if(e)e.textContent=[cnt.loaded,cnt.attacked,cnt.transit,cnt.waiting][i];});
}
function setMapView(v,btn){curView=v;document.querySelectorAll('[id^="mv-"]').forEach(function(b){b.classList.remove('active');});btn.classList.add('active');renderMap();}
function setMF(f,btn){mapFilter=f;document.querySelectorAll('[id^="mf-"]').forEach(function(b){b.classList.remove('active');});btn.classList.add('active');renderMap();}
function apT(){
  var t='scale('+mSc+') translate('+mTx+'px,'+mTy+'px)';
  ['map-img','map-svg'].forEach(function(id){
    var e=document.getElementById(id);
    if(e){e.style.transform=t;e.style.transformOrigin='center center';}
  });
}
function mz(f){mSc=Math.max(.9,Math.min(5,mSc*f));apT();}
function mr(){mSc=1;mTx=0;mTy=0;apT();}

/* Zoom/pan mouse events */
(function(){
  var msv=document.getElementById('map-svg');
  if(!msv) return;
  msv.addEventListener('wheel',function(e){
    e.preventDefault();
    mSc=Math.max(.9,Math.min(5,mSc*(e.deltaY>0?1.12:.89)));
    apT();
  },{passive:false});
  msv.addEventListener('mousedown',function(e){
    mDr=true; mSx=e.clientX; mSy=e.clientY; mSTx=mTx; mSTy=mTy;
  });
})();

window.addEventListener('mousemove',function(e){
  if(!mDr) return;
  mTx=mSTx+(e.clientX-mSx)/mSc;
  mTy=mSTy+(e.clientY-mSy)/mSc;
  apT();
});
window.addEventListener('mouseup',function(){ mDr=false; });

/* Touch gestures */
var touchState={lastDist:0,lastX:0,lastY:0,touching:false};

function initMapTouch(){
  var mapSvg=document.getElementById('map-svg');
  if(!mapSvg) return;

  mapSvg.addEventListener('touchstart',function(e){
    e.preventDefault();
    if(e.touches.length===1){
      touchState.touching=true;
      touchState.lastX=e.touches[0].clientX;
      touchState.lastY=e.touches[0].clientY;
      mSTx=mTx; mSTy=mTy;
    }else if(e.touches.length===2){
      var dx=e.touches[0].clientX-e.touches[1].clientX;
      var dy=e.touches[0].clientY-e.touches[1].clientY;
      touchState.lastDist=Math.sqrt(dx*dx+dy*dy);
    }
  },{passive:false});

  mapSvg.addEventListener('touchmove',function(e){
    e.preventDefault();
    if(e.touches.length===1&&touchState.touching){
      var dx=e.touches[0].clientX-touchState.lastX;
      var dy=e.touches[0].clientY-touchState.lastY;
      mTx=mSTx+dx/mSc; mTy=mSTy+dy/mSc; apT();
    }else if(e.touches.length===2){
      var dx2=e.touches[0].clientX-e.touches[1].clientX;
      var dy2=e.touches[0].clientY-e.touches[1].clientY;
      var dist=Math.sqrt(dx2*dx2+dy2*dy2);
      mSc=Math.max(.9,Math.min(5,mSc*(dist/touchState.lastDist)));
      touchState.lastDist=dist; apT();
    }
  },{passive:false});

  mapSvg.addEventListener('touchend',function(){ touchState.touching=false; });

  /* Double tap zoom */
  var lastTap=0;
  mapSvg.addEventListener('touchend',function(){
    var now=Date.now();
    if(now-lastTap<300) mz(.65);
    lastTap=now;
  });
}
