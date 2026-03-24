/* ═══════════════════════════════════════════════
   config.js — Constantes globales, STATE, datos
   Hormuz Intelligence Platform v8
═══════════════════════════════════════════════ */
'use strict';

/* ── WORKERS ── */
var WORKERS = {
  miteco:   'https://miteco-precios.pa-kore.workers.dev/',
  ree:      'https://ree-electricidad.pa-kore.workers.dev/',
  reeRiesgo:'https://ree-riesgo.pa-kore.workers.dev/',
  brent:    'https://brent-precio.pa-kore.workers.dev/',
  eurusd:   '', /* pendiente — worker eurusd.pa-kore.workers.dev */
  gasttf:   '', /* pendiente — worker gas-ttf.pa-kore.workers.dev */
  iea:      ''  /* pendiente — worker reservas-iea.pa-kore.workers.dev */
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
  {n:'ADVANTAGE VICTORY',  t:'VLCC 300k DWT',    fn:'EE.UU.',       s:'loaded',  p:'Golfo Persico',  c:'Crudo Arabe',      T:280000,V:290,o:'Advantage Tankers',lat:26.2,lng:56.3},
  {n:'SHENLONG',           t:'Suezmax 160k DWT', fn:'Liberia',      s:'transit', p:'Mumbai India',   c:'Crudo Ras Tanura', T:150000,V:155,o:'Dynacom GR',       lat:19.1,lng:72.9},
  {n:'JAG LAADKI',         t:'Aframax 105k DWT', fn:'India',        s:'transit', p:'Mundra Port',    c:'Crudo Abu Dhabi',  T:80886, V:84, o:'SCI India',        lat:22.8,lng:70.1},
  {n:'SHIVALIK',           t:'LPG 85k m3',       fn:'India',        s:'transit', p:'Mundra Gujarat', c:'GLP',              T:46000, V:28, o:'SCI India',        lat:22.7,lng:69.9},
  {n:'NANDA DEVI',         t:'LPG 85k m3',       fn:'India',        s:'transit', p:'Kandla Port',    c:'GLP',              T:46000, V:28, o:'SCI India',        lat:23.0,lng:70.2},
  {n:'SAFESEA VISHNU',     t:'Suezmax 145k DWT', fn:'Marshall Is.', s:'attacked',p:'Golfo Persico',  c:'Crudo Transito',   T:130000,V:135,o:'Desconocido',      lat:26.5,lng:55.9},
  {n:'MAYUREE NAREE',      t:'Bulk 82k DWT',     fn:'Tailandia',    s:'attacked',p:'Hormuz Sur',     c:'Carga seca',       T:70000, V:60, o:'Tailandes',        lat:25.8,lng:56.7},
  {n:'STENA IMPERATIVE',   t:'Quimico 65k DWT',  fn:'EE.UU.',       s:'attacked',p:'Bahrein',        c:'Petroquimicos',    T:50000, V:55, o:'Stena Group',      lat:26.2,lng:50.6},
  {n:'FLOTA VLCC x60',     t:'VLCC 250-320k',    fn:'Multi',        s:'loaded',  p:'Golfo Persico',  c:'Crudo variado',    T:280000,V:290,o:'BAHRI Multi',      lat:26.8,lng:52.5},
  {n:'SUEZMAX x23',        t:'Suezmax 120-180k', fn:'Grecia',       s:'waiting', p:'Golfo Persico',  c:'Crudo Fuel',       T:150000,V:155,o:'Dynacom',          lat:27.2,lng:51.8},
  {n:'FLOTILLA OMAN x300', t:'Mixto VLCCs',      fn:'Multi',        s:'waiting', p:'Golfo de Oman',  c:'Crudo GLP GNL',    T:120000,V:125,o:'Multi',            lat:23.5,lng:59.8},
  {n:'IRANI A CHINA',      t:'VLCC 300k DWT',    fn:'Iran',         s:'transit', p:'Hormuz a China', c:'Crudo irani',      T:270000,V:279,o:'NIOC shadow',      lat:25.3,lng:57.8},
  {n:'PAKISTAN AFRAMAX',   t:'Aframax 100k DWT', fn:'Pakistan',     s:'transit', p:'Hormuz AIS',     c:'Crudo',            T:90000, V:93, o:'PNSC',             lat:25.9,lng:57.1},
  {n:'COSCO x18',          t:'Mixto VLCCs',      fn:'China',        s:'waiting', p:'G. Persico Sur',  c:'Crudo China',      T:200000,V:207,o:'COSCO Shipping',   lat:25.5,lng:53.2},
  {n:'SINOKOR x6',         t:'VLCC 300k DWT',    fn:'Corea del Sur',s:'waiting', p:'Ras al-Khaimah',  c:'Crudo Kuwait',     T:280000,V:289,o:'Sinokor',          lat:25.8,lng:55.7},
  {n:'MITSUI OSK x18',     t:'Mixto',            fn:'Japon',        s:'waiting', p:'Golfo Oman',     c:'Crudo GNL',        T:160000,V:166,o:'Mitsui OSK',       lat:24.1,lng:58.4},
  {n:'BAHRI NAJAF',        t:'VLCC 318k DWT',    fn:'Arabia Saudi', s:'loaded',  p:'Ras Tanura',     c:'Crudo arabe',      T:300000,V:310,o:'BAHRI',            lat:26.6,lng:50.1},
  {n:'BAB EL-MANDEB FLEET',t:'Mixto reducido',   fn:'Multi',        s:'waiting', p:'Bab el-Mandeb',  c:'Mixto',            T:90000, V:93, o:'Multi Houthis',    lat:12.6,lng:43.4},
  {n:'HOUTHI ZONE',        t:'Buques danados',   fn:'Yemen',        s:'attacked',p:'Mar Rojo Norte',  c:'Varios',           T:80000, V:82, o:'Victimas',         lat:14.5,lng:42.8}
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
/* v9 — 6 Centros de Inteligencia */
var DEFAULT_MODULES = [
  {id:'operaciones',   label:'Operaciones',    icon:'OPS',  minRole:'viewer', enabled:true},
  {id:'crisis',        label:'Crisis',         icon:'CRI',  minRole:'viewer', enabled:true},
  {id:'energia',       label:'Energia',        icon:'ENE',  minRole:'viewer', enabled:true},
  {id:'mercados',      label:'Mercados',       icon:'MER',  minRole:'viewer', enabled:true},
  {id:'inteligencia',  label:'Inteligencia IA',icon:'IA',   minRole:'analyst',enabled:true},
  {id:'admin',         label:'Admin',          icon:'ADM',  minRole:'admin',  enabled:true}
];

var PERMS = {
  viewer:  ['operaciones','crisis','energia','mercados'],
  analyst: ['operaciones','crisis','energia','mercados','inteligencia'],
  admin:   ['operaciones','crisis','energia','mercados','inteligencia','admin']
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
