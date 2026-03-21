/* ═══════════════════════════════════════════════
   pwa.js — Service Worker, PWA install
═══════════════════════════════════════════════ */
'use strict';

function registerSW(){
  if('serviceWorker' in navigator){
    navigator.serviceWorker.register('./sw.js').catch(function(){});
  }
}
