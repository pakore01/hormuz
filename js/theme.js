/* ═══════════════════════════════════════════════
   theme.js — Toggle tema claro/oscuro
═══════════════════════════════════════════════ */
'use strict';

var currentTheme = localStorage.getItem('hip9_theme') || 'dark';

function applyTheme(theme){
  currentTheme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('hip9_theme', theme);
  var btn=document.getElementById('theme-toggle');
  if(btn) btn.innerHTML = theme==='dark' ? '&#9728;' : '&#9790;';
  var meta=document.getElementById('theme-color-meta');
  if(meta) meta.setAttribute('content', theme==='dark'?'#04080f':'#f5f7fa');
}

function toggleTheme(){
  applyTheme(currentTheme==='dark'?'light':'dark');
}

applyTheme(currentTheme);
