/* ═══════════════════════════════════════════════
   auth.js — Roles, acceso por módulo
   (modo público siempre activo)
═══════════════════════════════════════════════ */
'use strict';

var currentUser = null;
var isPublicMode = true;
var AUDIT_LOG = [];

function canAccess(tab){
  var role = currentUser ? currentUser.role : 'viewer';
  return (PERMS[role]||[]).indexOf(tab) !== -1;
}

function auditLog(action,detail,module){
  var entry={ts:new Date().toISOString(),user:'anon',role:'—',action:action,detail:detail,module:module||'—'};
  AUDIT_LOG.unshift(entry);
  if(AUDIT_LOG.length>200) AUDIT_LOG.pop();
}

function initPublicMode(){
  var ls=document.getElementById('login-screen');
  if(ls) ls.style.display='none';
  document.getElementById('app').style.display='block';
  document.body.className='role-viewer public-mode';
  currentUser=null; isPublicMode=true;
  initApp();
}
