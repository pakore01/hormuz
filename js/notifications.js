/* ═══════════════════════════════════════════════
   notifications.js — Push notifications
═══════════════════════════════════════════════ */
'use strict';

function requestNotifPermission(){
  if('Notification' in window && Notification.permission==='default'){
    setTimeout(function(){
      Notification.requestPermission().then(function(p){
        if(p==='granted') addLog('auto','Notificaciones push activadas','Sistema');
      });
    },5000);
  }
}

function sendNotif(title,body){
  if('Notification' in window && Notification.permission==='granted'){
    new Notification(title,{
      body:body,
      icon:'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🛢️</text></svg>'
    });
  }
}

function checkThresholds(){
  var thr=getThresholds();
  if(thr.brent.enabled && STATE.brent>=thr.brent.val){
    showAlert('Brent ha superado $'+thr.brent.val+' → $'+STATE.brent.toFixed(1));
    sendNotif('Alerta Brent','Brent ha superado $'+thr.brent.val+'/barril');
  }
  if(thr.attacks.enabled && STATE.attacks>=thr.attacks.val){
    showAlert('Ataques superan '+thr.attacks.val+' → total '+STATE.attacks);
    sendNotif('Nuevo ataque','Ataques confirmados: '+STATE.attacks);
  }
  if(thr.ships.enabled && STATE.ships>=thr.ships.val)
    showAlert('Buques varados superan '+thr.ships.val+' → '+STATE.ships);
  if(thr.tension.enabled && STATE.tensionIndex>=thr.tension.val){
    showAlert('Tension supera '+thr.tension.val+'/100 → '+STATE.tensionIndex);
    sendNotif('Tension critica','Indice de tension: '+STATE.tensionIndex+'/100');
  }
}

function showAlert(msg){
  var ab=document.getElementById('alert-bar');
  var am=document.getElementById('alert-msg');
  if(ab&&am){ am.textContent=msg; ab.classList.add('show'); setTimeout(function(){ab.classList.remove('show');},10000); }
}
