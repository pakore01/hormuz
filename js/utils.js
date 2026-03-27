/* ═══════════════════════════════════════════════
   utils.js — Funciones de utilidad compartidas
═══════════════════════════════════════════════ */
'use strict';

function san(s){ var d=document.createElement('div'); d.textContent=String(s||''); return d.innerHTML; }
var enc = function(s){ return btoa(unescape(encodeURIComponent(s))); };
var dec = function(s){ try{ return decodeURIComponent(escape(atob(s))); }catch(e){ return ''; } };
function fmtTs(d){ return d.toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit',second:'2-digit'})+' '+d.toLocaleDateString('es-ES',{day:'2-digit',month:'2-digit'}); }

function lsGet(k){ try{ var v=localStorage.getItem(k); return v?JSON.parse(dec(v)):null; }catch(e){ return null; } }
function lsSet(k,v){ try{ localStorage.setItem(k,enc(JSON.stringify(v))); }catch(e){} }
function lsDel(k){ try{ localStorage.removeItem(k); }catch(e){} }

function getUsers(){ return lsGet('hip8_users')||DEFAULT_USERS; }
function saveUsers(u){ lsSet('hip8_users',u); }
function getModules(){
  var stored=lsGet('hip8_mods');
  if(stored){
    var hasCalc  = stored.some(function(m){return m.id==='calc';});
    var hasElec  = stored.some(function(m){return m.id==='electricidad';});
    var hasIntel = stored.some(function(m){return m.id==='intel';});
    if(!hasCalc || !hasElec || !hasIntel) stored=null;
  }
  return stored||DEFAULT_MODULES;
}
function saveModules(m){ lsSet('hip8_mods',m); }
function getThresholds(){ return lsGet('hip8_thr')||DEFAULT_THRESHOLDS; }
function saveThresholds(t){ lsSet('hip8_thr',t); }
function getKPIs(){ return lsGet('hip8_kpis')||DEFAULT_KPIS; }
function saveKPIs(k){ lsSet('hip8_kpis',k); }

var DEFAULT_KPIS = [
  {id:'ships',  label:'Buques',    enabled:true, color:'cre'},
  {id:'brent',  label:'Brent',     enabled:true, color:'cor'},
  {id:'gas',    label:'SP95 ES',   enabled:true, color:'cyl'},
  {id:'attacks',label:'Ataques',   enabled:true, color:'cre'},
  {id:'tension',label:'Tension',   enabled:true, color:'cyl'},
  {id:'transit',label:'Transitos', enabled:true, color:'cre'},
  {id:'ree',    label:'Luz REE',   enabled:true, color:'cyl'}
];
