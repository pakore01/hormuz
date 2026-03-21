# Módulos de Hormuz Intelligence Platform v8

## Cómo añadir un nuevo módulo

### 1. Crear el archivo HTML del panel
Crea `modules/tu-modulo.html` con el contenido del panel:
```html
<div style="padding:1.2rem">
  <h2>Mi nuevo módulo</h2>
  <!-- tu contenido aquí -->
</div>
```

### 2. Crear el archivo JS (si necesitas lógica)
Crea `js/tu-modulo.js` con las funciones necesarias.

### 3. Registrar en config.js
Añade a `DEFAULT_MODULES` en `js/config.js`:
```javascript
{id:'tu-modulo', label:'Mi Modulo', icon:'📋', minRole:'analyst', enabled:true}
```

Añade a `PERMS`:
```javascript
analyst: [..., 'tu-modulo'],
admin:   [..., 'tu-modulo']
```

### 4. Añadir el panel en index.html
En la sección `#panels-container`, añade:
```html
<!-- TU MODULO -->
<div id="tab-tu-modulo" class="panel">
  <!-- contenido de modules/tu-modulo.html -->
</div>
```

### 5. Cargar el JS en index.html
Añade antes de `</body>`:
```html
<script src="js/tu-modulo.js"></script>
```

### 6. Inicializar en app.js (si necesario)
En la función `showTab`, añade:
```javascript
if(tab==='tu-modulo') initTuModulo();
```

---

## Módulos incluidos en v8
| ID | Módulo | Archivo JS | Rol mínimo |
|---|---|---|---|
| map | Mapa Real | js/map.js | viewer |
| tension | Índice Tensión | js/tension.js | analyst |
| news | Noticias | js/news.js | viewer |
| fuel | Combustibles | js/fuel.js | viewer |
| flows | Flujos Petróleo | js/flows.js | analyst |
| tankers | Lista Barcos | js/tankers.js | viewer |
| charts | Gráficos | js/charts.js | analyst |
| chat | Chat IA | js/chat.js | analyst |
| calc | Calculadora | js/calc.js | viewer |
| prediccion | Predicción IA | js/prediccion.js | analyst |
| updates | Log Sistema | js/update.js | analyst |
| admin | Panel Admin | js/admin.js | admin |
