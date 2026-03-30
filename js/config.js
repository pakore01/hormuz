/* ═══════════════════════════════════════════════
   config.js — Constantes globales, STATE, datos
   Hormuz Intelligence Platform v8
═══════════════════════════════════════════════ */
'use strict';

/* ── WORKERS ── */
var WORKERS = {
  miteco: 'https://miteco-precios.pa-kore.workers.dev/',
  ree:    'https://ree-electricidad.pa-kore.workers.dev/',
  brent:  'https://brent-precio.pa-kore.workers.dev/'
};

/* ── CRISIS START DATE ── */
var CRISIS_START = new Date('2026-02-28T00:00:00');

/* ── STATE ── */
var STATE = {
  brent: 103.1, wti: 100.3,
  ships: 400, attacks: 21,
  transits: 21, tensionIndex: 78,
  updatedAt: null
};
var PREV = Object.assign({}, STATE);
var LOG  = [];
var UPD_MS = 24 * 60 * 60 * 1000;
var nextAt  = null;
var cdTimer = null;

/* ── FUEL DATA ── */
var SPAIN_FUELS = [
  {id:'sp95',   label:'SP95',          base:1.520, tax:0.472, pt:0.15, current:1.692},
  {id:'sp98',   label:'SP98',          base:1.648, tax:0.472, pt:0.15, current:1.805},
  {id:'diesel', label:'Gasoil A',      base:1.476, tax:0.379, pt:0.18, current:1.785},
  {id:'dieselp',label:'Gasoil Premium',base:1.556, tax:0.379, pt:0.18, current:1.814},
  {id:'dieselm',label:'Gasoil Marino', base:1.210, tax:0.067, pt:0.18, current:1.495},
  {id:'autogas',label:'Autogas GLP',   base:0.892, tax:0.057, pt:0.10, current:0.951},
  {id:'adblue', label:'AdBlue',        base:0.380, tax:0.000, pt:0.05, current:0.418}
];

/* ── SHIPS DATA ── */
var SHIPS = [
  {n:'ADVANTAGE VICTORY',  t:'VLCC 300k DWT',    fn:'EE.UU.',       flag:'🇺🇸', s:'loaded',  p:'Golfo Persico',  dest:'Houston TX',       route:'Hormuz-Cabo-Atlantico', c:'Crudo Arabe',      T:280000,V:290,o:'Advantage Tankers',lat:26.2,lng:56.3, spd:0,  yr:2019,imo:'IMO9785412',risk:'critical',notes:'Bloqueado desde 28 Feb. Primer barco interceptado por IRGC.'},
  {n:'SHENLONG',           t:'Suezmax 160k DWT', fn:'Liberia',       flag:'🇱🇷', s:'transit', p:'Mumbai India',   dest:'Qingdao China',    route:'Hormuz-Ind-Pacifico',   c:'Crudo Ras Tanura', T:150000,V:155,o:'Dynacom GR',       lat:19.1,lng:72.9, spd:14, yr:2017,imo:'IMO9654231',risk:'low',   notes:'Transito autorizado por acuerdo China-Iran. Ruta alternativa via Sri Lanka.'},
  {n:'JAG LAADKI',         t:'Aframax 105k DWT', fn:'India',         flag:'🇮🇳', s:'transit', p:'Mundra Port',    dest:'Chennai India',    route:'Golfo-India Oeste',     c:'Crudo Abu Dhabi',  T:80886, V:84, o:'SCI India',        lat:22.8,lng:70.1, spd:11, yr:2015,imo:'IMO9601847',risk:'low',   notes:'Paso seguro negociado por India. Parte de acuerdo provisional con Iran.'},
  {n:'SHIVALIK',           t:'LPG 85k m3',       fn:'India',         flag:'🇮🇳', s:'transit', p:'Mundra Gujarat', dest:'Hazira India',     route:'Golfo-India Oeste',     c:'GLP',              T:46000, V:28, o:'SCI India',        lat:22.7,lng:69.9, spd:12, yr:2018,imo:'IMO9712034',risk:'low',   notes:'Cargamento GLP para consumo domestico indio. Paso autorizado.'},
  {n:'NANDA DEVI',         t:'LPG 85k m3',       fn:'India',         flag:'🇮🇳', s:'transit', p:'Kandla Port',    dest:'Dahej India',      route:'Golfo-India Oeste',     c:'GLP',              T:46000, V:28, o:'SCI India',        lat:23.0,lng:70.2, spd:10, yr:2016,imo:'IMO9634501',risk:'low',   notes:'Segundo buque SCI en paso autorizado. Cargamento energia domestica.'},
  {n:'SAFESEA VISHNU',     t:'Suezmax 145k DWT', fn:'Marshall Is.',  flag:'🇲🇭', s:'attacked',p:'Golfo Persico',  dest:'Rotterdam NL',     route:'BLOQUEADO',             c:'Crudo Transito',   T:130000,V:135,o:'Desconocido',      lat:26.5,lng:55.9, spd:0,  yr:2014,imo:'IMO9587623',risk:'critical',notes:'Impactado por dron kamikaze IRGC el 3 Mar. Tripulacion evacuada. Carga a bordo.'},
  {n:'MAYUREE NAREE',      t:'Bulk 82k DWT',     fn:'Tailandia',     flag:'🇹🇭', s:'attacked',p:'Hormuz Sur',     dest:'Singapur',         route:'BLOQUEADO',             c:'Carga seca',       T:70000, V:60, o:'Tailandes',        lat:25.8,lng:56.7, spd:0,  yr:2012,imo:'IMO9456789',risk:'critical',notes:'Averia en sala de maquinas tras ataque. No es petrolero — victima colateral.'},
  {n:'STENA IMPERATIVE',   t:'Quimico 65k DWT',  fn:'EE.UU.',        flag:'🇺🇸', s:'attacked',p:'Bahrein',        dest:'Jubail Arabia S',  route:'BLOQUEADO',             c:'Petroquimicos',    T:50000, V:55, o:'Stena Group',      lat:26.2,lng:50.6, spd:0,  yr:2016,imo:'IMO9658234',risk:'critical',notes:'Interceptado en aguas de Bahrein. Bandera EE.UU. factor determinante.'},
  {n:'FLOTA VLCC x60',     t:'VLCC 250-320k',    fn:'Multi',         flag:'🌍', s:'loaded',  p:'Golfo Persico',  dest:'Asia / Europa',    route:'Anclados Hormuz',       c:'Crudo variado',    T:280000,V:290,o:'BAHRI Multi',      lat:26.8,lng:52.5, spd:0,  yr:2015,imo:'MULTI',       risk:'high',  notes:'60 VLCCs anclados esperando apertura. Valor total bloqueado: ~$17.400M.'},
  {n:'SUEZMAX x23',        t:'Suezmax 120-180k', fn:'Grecia',        flag:'🇬🇷', s:'waiting', p:'Golfo Persico',  dest:'Europa',           route:'Anclados Hormuz',       c:'Crudo Fuel',       T:150000,V:155,o:'Dynacom',          lat:27.2,lng:51.8, spd:0,  yr:2016,imo:'MULTI',       risk:'high',  notes:'Flota griega Dynacom completamente paralizada. Seguros Lloyd\'s activados.'},
  {n:'FLOTILLA OMAN x300', t:'Mixto VLCCs',      fn:'Multi',         flag:'🌍', s:'waiting', p:'Golfo de Oman',  dest:'Global',           route:'Anclados Oman',         c:'Crudo GLP GNL',    T:120000,V:125,o:'Multi',            lat:23.5,lng:59.8, spd:0,  yr:2014,imo:'MULTI',       risk:'high',  notes:'Mayor concentracion de buques varados en la historia moderna. ~300 unidades.'},
  {n:'IRANI A CHINA',      t:'VLCC 300k DWT',    fn:'Iran',          flag:'🇮🇷', s:'transit', p:'Hormuz a China', dest:'Zhoushan China',   route:'Hormuz-Pacifico',       c:'Crudo irani',      T:270000,V:279,o:'NIOC shadow',      lat:25.3,lng:57.8, spd:16, yr:2013,imo:'SHADOW',       risk:'medium',notes:'Flota fantasma Iran. AIS desactivado. Ruta trazada por satelite. Exento del bloqueo.'},
  {n:'PAKISTAN AFRAMAX',   t:'Aframax 100k DWT', fn:'Pakistan',      flag:'🇵🇰', s:'transit', p:'Hormuz AIS',     dest:'Karachi Pakistan', route:'Golfo-Pakistan',        c:'Crudo',            T:90000, V:93, o:'PNSC',             lat:25.9,lng:57.1, spd:13, yr:2018,imo:'IMO9745623',risk:'medium',notes:'PNSC negocia paso individual. Pakistan mantiene neutralidad en conflicto.'},
  {n:'COSCO x18',          t:'Mixto VLCCs',      fn:'China',         flag:'🇨🇳', s:'waiting', p:'G. Persico Sur',  dest:'China',            route:'Anclados espera',       c:'Crudo China',      T:200000,V:207,o:'COSCO Shipping',   lat:25.5,lng:53.2, spd:0,  yr:2017,imo:'MULTI',       risk:'medium',notes:'COSCO solicita corredor diplomatico. China presiona para apertura urgente.'},
  {n:'SINOKOR x6',         t:'VLCC 300k DWT',    fn:'Corea del Sur', flag:'🇰🇷', s:'waiting', p:'Ras al-Khaimah',  dest:'Ulsan Corea Sur',  route:'Anclados EAU',          c:'Crudo Kuwait',     T:280000,V:289,o:'Sinokor',          lat:25.8,lng:55.7, spd:0,  yr:2019,imo:'MULTI',       risk:'medium',notes:'Corea del Sur en alerta energetica nacional. Reservas estrategicas al 60%.'},
  {n:'MITSUI OSK x18',     t:'Mixto',            fn:'Japon',         flag:'🇯🇵', s:'waiting', p:'Golfo Oman',     dest:'Japón',            route:'Anclados Oman',         c:'Crudo GNL',        T:160000,V:166,o:'Mitsui OSK',       lat:24.1,lng:58.4, spd:0,  yr:2016,imo:'MULTI',       risk:'medium',notes:'Japon activa reservas estrategicas IEA. Negocia con Arabia Saudi ruta alternativa.'},
  {n:'BAHRI NAJAF',        t:'VLCC 318k DWT',    fn:'Arabia Saudi',  flag:'🇸🇦', s:'loaded',  p:'Ras Tanura',     dest:'Port Arthur TX',   route:'Hormuz-Cabo-Atlantico', c:'Crudo arabe',      T:300000,V:310,o:'BAHRI',            lat:26.6,lng:50.1, spd:0,  yr:2020,imo:'IMO9812345',risk:'high',  notes:'Buque insignia BAHRI. Completamente cargado. Incapaz de salir por el bloqueo.'},
  {n:'BAB EL-MANDEB FLEET',t:'Mixto reducido',   fn:'Multi',         flag:'🌍', s:'waiting', p:'Bab el-Mandeb',  dest:'Bloqueado',        route:'Mar Rojo BLOQUEADO',    c:'Mixto',            T:90000, V:93, o:'Multi Houthis',    lat:12.6,lng:43.4, spd:0,  yr:2015,imo:'MULTI',       risk:'critical',notes:'Segundo frente abierto por Houthis. 12 barcos retenidos en estrecho sur.'},
  {n:'HOUTHI ZONE',        t:'Buques danados',   fn:'Yemen',         flag:'🇾🇪', s:'attacked',p:'Mar Rojo Norte',  dest:'N/A',              route:'ZONA DE GUERRA',        c:'Varios',           T:80000, V:82, o:'Victimas',         lat:14.5,lng:42.8, spd:0,  yr:2010,imo:'MULTI',       risk:'critical',notes:'Zona activa ataques Houthi. Misiles balísticos y drones kamikaze. Acceso prohibido.'}
];

/* ── TENSION COMPONENTS ── */
var TCOMPS = [
  {name:'Trafico Hormuz',      sub:'vs capacidad normal', weight:0.25, key:'traffic'},
  {name:'Ataques confirmados', sub:'buques mercantes',    weight:0.20, key:'attacks'},
  {name:'Prima riesgo Brent',  sub:'USD/barril extra',    weight:0.20, key:'oilRisk'},
  {name:'Buques varados',      sub:'porcentaje bloqueado',weight:0.15, key:'ships'},
  {name:'Respuesta diplomatica',sub:'nivel escalada',     weight:0.12, key:'diplo'},
  {name:'Volatilidad mercados',sub:'indice stress',       weight:0.08, key:'markets'}
];

/* ── NEWS ── */
var NEWS = [
  {title:'Iran mantiene bloqueo selectivo a buques occidentales',       body:'Las fuerzas navales iranies confirmaron que el bloqueo se mantiene para buques de EE.UU., Israel y aliados OTAN.',            sev:'critical', src:'Reuters',       time:'Hace 2h'},
  {title:'OPEC+ convoca reunion de emergencia por volatilidad del Brent',body:'Arabia Saudita y Emiratos proponen liberar reservas adicionales para estabilizar el precio del petroleo.',                    sev:'high',     src:'Bloomberg',     time:'Hace 4h'},
  {title:'Maersk redirige toda su flota por el Cabo de Buena Esperanza', body:'El mayor armador del mundo confirmo el desvio permanente. El coste adicional por viaje se estima en $1.8M.',                  sev:'high',     src:'Maersk',        time:'Hace 6h'},
  {title:'India negocia paso seguro para 22 barcos SCI con Iran',        body:'Nueva Delhi logro un acuerdo provisional que permite el transito de buques de la Shipping Corporation of India.',             sev:'medium',   src:'Times of India',time:'Hace 8h'},
  {title:'Goldman Sachs eleva prevision de Brent a $120',                body:'El banco reviso al alza sus previsiones, advirtiendo que 3 meses de bloqueo podrian elevar el Brent hasta $120-140.',         sev:'high',     src:'Goldman Sachs', time:'Hace 10h'},
  {title:'Houthis lanzan nuevos misiles contra buques en el Mar Rojo',   body:'Tres buques mercantes han sido atacados en las ultimas 24h. La armada estadounidense derribo cuatro drones.',                  sev:'critical', src:'Al Jazeera',    time:'Hace 12h'},
  {title:'BCE analiza impacto del petroleo en inflacion eurozona',        body:'El Banco Central Europeo monitorea expectativas de inflacion disparadas al 3.8%.',                                            sev:'medium',   src:'ECB',           time:'Hace 1 dia'},
  {title:'China acelera acuerdos con Rusia ante escasez del Golfo',      body:'Beijing reforzo importaciones de crudo ruso como contingencia, firmando contratos por 500.000 barriles diarios.',             sev:'medium',   src:'CNPC',          time:'Hace 1 dia'}
];

/* ── MODULE SYSTEM ── */
var DEFAULT_MODULES = [
  {id:'map',       label:'Mapa Real',        icon:'MAP',  minRole:'viewer', enabled:true},
  {id:'tension',   label:'Tension',          icon:'TEN',  minRole:'analyst',enabled:true},
  {id:'news',      label:'Noticias',         icon:'NOT',  minRole:'viewer', enabled:true},
  {id:'fuel',      label:'Combustibles',     icon:'GAS',  minRole:'viewer', enabled:true},
  {id:'flows',     label:'Flujos Petroleo',  icon:'FLU',  minRole:'analyst',enabled:true},
  {id:'tankers',   label:'Barcos',           icon:'BAR',  minRole:'viewer', enabled:true},
  {id:'charts',    label:'Graficos',         icon:'GRA',  minRole:'analyst',enabled:true},
  {id:'chat',      label:'Chat IA',          icon:'AI',   minRole:'analyst',enabled:true},
  {id:'calc',      label:'Calculadora',      icon:'CALC', minRole:'viewer', enabled:true},
  {id:'prediccion',label:'Prediccion IA',    icon:'PRED', minRole:'analyst',enabled:true},
  {id:'updates',   label:'Log Sistema',      icon:'LOG',  minRole:'analyst',enabled:true},
  {id:'electricidad',label:'Red Electrica',   icon:'ELEC', minRole:'viewer', enabled:true}
];

var PERMS = {
  viewer:  ['map','news','fuel','tankers','calc','electricidad'],
  analyst: ['map','tension','news','fuel','flows','tankers','charts','chat','calc','prediccion','updates','electricidad'],
  admin:   ['map','tension','news','fuel','flows','tankers','charts','chat','calc','prediccion','updates','electricidad','admin']
};

var DEFAULT_THRESHOLDS = {
  brent:   {val:120, enabled:true, label:'Brent supera'},
  attacks: {val:25,  enabled:true, label:'Ataques superan'},
  ships:   {val:450, enabled:true, label:'Buques varados superan'},
  tension: {val:90,  enabled:true, label:'Tension supera'}
};

var DEFAULT_USERS = {
  'admin':   {pass:'admin123',   role:'admin',   name:'Administrador',  created:'2026-02-28'},
  'analista':{pass:'analista123',role:'analyst', name:'Analista Senior',created:'2026-02-28'},
  'viewer':  {pass:'viewer123',  role:'viewer',  name:'Visualizador',   created:'2026-02-28'}
};

var MAP_IMGS   = {region:'', hormuz:'', mandeb:''};
var MAP_BOUNDS = {
  region: {lngMin:27, lngMax:72, latMax:42, latMin:8},
  hormuz: {lngMin:48, lngMax:62, latMax:28, latMin:21.5},
  mandeb: {lngMin:37, lngMax:52, latMax:24, latMin:10.5}
};
