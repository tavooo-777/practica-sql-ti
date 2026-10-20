'use strict';
// Página de estudio: resumen, tests y práctica con SQLite en el navegador (sql.js).

const SQLJS_VER = '1.12.0';
const LS_KEY = 'tiTestSql.v1';
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// ───────── Estado guardado ─────────
let estado = { ej: {}, test: {} };
try { estado = Object.assign(estado, JSON.parse(localStorage.getItem(LS_KEY) || '{}')); } catch (e) { /* sin almacenamiento */ }
function guardar() { try { localStorage.setItem(LS_KEY, JSON.stringify(estado)); } catch (e) { /* ignorar */ } }

// ───────── Pestañas ─────────
const VISTAS = ['resumen', 'tests', 'practica'];
function irA(v) {
  VISTAS.forEach((n) => { $('v-' + n).hidden = n !== v; });
  document.querySelectorAll('.tab').forEach((b) => b.classList.toggle('activo', b.dataset.vista === v));
  try { history.replaceState(null, '', '#' + v); } catch (e) { /* ignorar */ }
  window.scrollTo(0, 0);
  if (v === 'practica') iniciarSQL();
}
document.querySelectorAll('.tab').forEach((b) => b.addEventListener('click', () => irA(b.dataset.vista)));
document.querySelectorAll('[data-ir]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); irA(a.dataset.ir); }));

// ───────── Tests de alternativas ─────────
let testActual = null;
function pintarMenuTests() {
  $('menuTests').innerHTML = TESTS.map((t) => {
    const mejor = estado.test[t.id];
    const nota = mejor != null ? `Mejor resultado: ${mejor}/${t.preguntas.length}` : `${t.preguntas.length} preguntas`;
    return `<button class="test-card ${testActual === t.id ? 'activo' : ''}" data-t="${t.id}"><b>${esc(t.titulo)}</b><small>${esc(t.detalle)}</small><br><small>${nota}</small></button>`;
  }).join('');
  document.querySelectorAll('.test-card').forEach((b) => b.addEventListener('click', () => abrirTest(b.dataset.t)));
}
function abrirTest(id) {
  testActual = id;
  const t = TESTS.find((x) => x.id === id);
  const resp = new Array(t.preguntas.length).fill(null);
  const area = $('areaTest');
  const L = 'ABCD';
  const contar = () => resp.filter((r) => r !== null);
  const aciertos = () => resp.filter((r, i) => r === t.preguntas[i].ok).length;
  area.innerHTML = `<div class="marcador" id="marc" aria-live="polite">0/${t.preguntas.length} respondidas</div>` + t.preguntas.map((p, i) => `
    <div class="preg" id="p${i}">
      <h3><span class="num">${i + 1}.</span> ${p.q}</h3>
      ${p.opts.map((o, j) => `<button class="opt" data-i="${i}" data-j="${j}"><span class="letra">${L[j]}</span>${o}</button>`).join('')}
      <div class="porque" hidden></div>
    </div>`).join('') + '<div id="finTest"></div>';
  area.querySelectorAll('.opt').forEach((b) => b.addEventListener('click', () => {
    const i = +b.dataset.i, j = +b.dataset.j;
    if (resp[i] !== null) return;
    resp[i] = j;
    const p = t.preguntas[i];
    const caja = $('p' + i);
    caja.querySelectorAll('.opt').forEach((o) => {
      o.disabled = true;
      const oj = +o.dataset.j;
      if (oj === p.ok) o.classList.add('bien');
      else if (oj === j) o.classList.add('mal');
    });
    const por = caja.querySelector('.porque');
    por.hidden = false;
    por.innerHTML = `<b>${j === p.ok ? 'Correcto.' : 'Incorrecto: la respuesta es la ' + L[p.ok] + '.'}</b> ${p.why}`;
    $('marc').textContent = `${contar().length}/${t.preguntas.length} respondidas · ${aciertos()} correctas`;
    if (contar().length === t.preguntas.length) {
      const a = aciertos();
      if (estado.test[t.id] == null || a > estado.test[t.id]) { estado.test[t.id] = a; guardar(); }
      $('finTest').innerHTML = `<div class="fin-test"><h3>Resultado: ${a}/${t.preguntas.length}</h3><p>${a === t.preguntas.length ? 'Sin errores. Pasa al siguiente test o a la práctica.' : 'Repasa las explicaciones de las que fallaste y vuelve a intentarlo.'}</p><button class="btn btn-prim" id="reint">Reintentar</button></div>`;
      $('reint').addEventListener('click', () => abrirTest(id));
      pintarMenuTests();
    }
  }));
  pintarMenuTests();
}

// ───────── SQLite en el navegador ─────────
let SQL = null;
let iniciando = false;
async function iniciarSQL() {
  if (SQL || iniciando) return;
  iniciando = true;
  try {
    SQL = await initSqlJs({ locateFile: (f) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/${SQLJS_VER}/${f}` });
    $('cargando').hidden = true;
    $('ejercicio').hidden = false;
    pintarLista();
    abrirEjercicio(EJERCICIOS_UI[0].id);
  } catch (e) {
    $('cargando').textContent = 'No se pudo cargar SQLite (¿sin conexión?). Recarga la página.';
  }
}

function crearBD(base) {
  const db = new SQL.Database();
  db.exec(`ATTACH DATABASE ':memory:' AS ${base}; PRAGMA foreign_keys = ON;`);
  db.exec(SCRIPTS[base]);
  return db;
}
function ejecutar(db, sql) {
  const res = db.exec(sql);
  if (!res.length) return { columnas: [], filas: [], cambios: db.getRowsModified() };
  const r = res[res.length - 1];
  return { columnas: r.columns, filas: r.values, cambios: 0 };
}

// ───────── Lista de ejercicios ─────────
const EJERCICIOS_UI = [
  { id: 'L-esports', libre: true, base: 'esports', fuente: 'Laboratorio libre', titulo: 'Base esports', pts: 0, enunciado: 'Prueba lo que quieras sobre la base esports: SELECT, INSERT, UPDATE, DELETE. Los cambios se mantienen hasta que reinicies.' },
  { id: 'L-minimarket', libre: true, base: 'minimarket', fuente: 'Laboratorio libre', titulo: 'Base minimarket', pts: 0, enunciado: 'Prueba lo que quieras sobre la base minimarket. Los cambios se mantienen hasta que reinicies.' },
  ...EJERCICIOS
];
let actual = null;
let dbLibre = {};

function pintarLista() {
  const grupos = [];
  EJERCICIOS_UI.forEach((e) => { let g = grupos.find((x) => x.f === e.fuente); if (!g) grupos.push(g = { f: e.fuente, items: [] }); g.items.push(e); });
  const hechos = EJERCICIOS.filter((e) => estado.ej[e.id] === 'ok').length;
  $('listaPr').innerHTML = `<div class="progreso-pr">Resueltos: <b>${hechos}/${EJERCICIOS.length}</b></div>` + grupos.map((g) => `
    <h3>${esc(g.f)}</h3>` + g.items.map((e) => `
    <button class="item ${actual && actual.id === e.id ? 'activo' : ''}" data-id="${e.id}">
      <span class="punto ${estado.ej[e.id] === 'ok' ? 'ok' : estado.ej[e.id] === 'mal' ? 'mal' : ''}"></span>
      <span class="tit">${esc(e.titulo)}</span><span class="pts">${e.pts ? e.pts + ' pt' : ''}</span>
    </button>`).join('')).join('');
  document.querySelectorAll('#listaPr .item').forEach((b) => b.addEventListener('click', () => abrirEjercicio(b.dataset.id)));
}

function tablaHTML(columnas, filas, claseNulo = true) {
  return `<table class="grid"><thead><tr>${columnas.map((c) => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${filas.map((f) => `<tr>${f.map((v) => v === null ? '<td class="nulo">NULL</td>' : `<td>${esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
}

function pintarEsquema(db, base) {
  const tablas = db.exec(`SELECT name FROM ${base}.sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'`)[0].values.map((r) => r[0]);
  $('nombreBase').textContent = base;
  $('esquema').innerHTML = tablas.map((t) => {
    const cols = db.exec(`PRAGMA ${base}.table_info(${t})`)[0].values;
    const fks = db.exec(`PRAGMA ${base}.foreign_key_list(${t})`);
    const fkCols = fks.length ? Object.fromEntries(fks[0].values.map((r) => [r[3], r[2] + '.' + r[4]])) : {};
    const firma = cols.map((c) => {
      const nombre = esc(c[1]);
      if (c[5] > 0) return `<span class="pk">${nombre}</span>`;
      if (fkCols[c[1]]) return `<span class="fk" title="FK → ${esc(fkCols[c[1]])}">${nombre}</span>`;
      return nombre;
    }).join(', ');
    const data = db.exec(`SELECT * FROM ${base}.${t}`)[0];
    const fkTxt = Object.entries(fkCols).map(([c, r]) => `${c} → ${r}`).join(' · ');
    return `<div class="tabla-card"><h4>${base}.${esc(t)}</h4><div class="firma">${firma}${fkTxt ? `<br><small>FK: ${esc(fkTxt)}</small>` : ''}</div><div class="datos">${tablaHTML(data.columns, data.values)}</div></div>`;
  }).join('');
}

function abrirEjercicio(id) {
  actual = EJERCICIOS_UI.find((e) => e.id === id);
  const e = actual;
  $('chips').innerHTML = `<span class="chip">${esc(e.fuente)}</span>` + (e.pts ? `<span class="chip">${e.pts} pt${e.pts > 1 ? 's' : ''}</span>` : '');
  $('titulo').textContent = e.titulo;
  $('enunciado').innerHTML = esc(e.enunciado) + (e.nota ? `<br><small>${esc(e.nota)}</small>` : '');
  $('editor').value = '';
  ['pistas', 'feedback', 'resultado', 'solucion'].forEach((x) => { $(x).hidden = true; });
  $('btnRevisar').hidden = $('btnPista').hidden = $('btnSolucion').hidden = !!e.libre;
  $('btnEjecutar').textContent = 'Ejecutar';
  pistaN = 0;
  if (e.libre) {
    if (!dbLibre[e.base]) dbLibre[e.base] = crearBD(e.base);
    pintarEsquema(dbLibre[e.base], e.base);
    $('btnSig').textContent = 'Reiniciar base';
  } else {
    const db = crearBD(e.base);
    pintarEsquema(db, e.base);
    db.close();
    $('btnSig').textContent = 'Siguiente →';
  }
  pintarLista();
  $('editor').focus();
}

// ───────── Avisos y errores ─────────
const PALABRAS = ['SELECT', 'WHERE', 'UPDATE', 'DELETE', 'INSERT', 'VALUES', 'GROUP', 'ORDER', 'LIMIT', 'DISTINCT', 'HAVING', 'FROM', 'JOIN', 'INNER', 'COUNT', 'TRUNCATE', 'CREATE', 'TABLE'];
function dist(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...new Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}
function limpiar(sql) { return sql.replace(/'(?:[^']|'')*'/g, "''").replace(/--[^\n]*/g, ''); }
function erratas(sql) {
  const out = [];
  (limpiar(sql).match(/[A-Za-z_]{4,}/g) || []).forEach((w) => {
    const W = w.toUpperCase();
    if (PALABRAS.includes(W)) return;
    const c = PALABRAS.filter((p) => dist(W, p) <= 2 && Math.abs(p.length - W.length) <= 1)[0];
    if (c && !out.some((o) => o[0] === w)) out.push([w, c]);
  });
  return out;
}
function avisos(sql) {
  const s = limpiar(sql);
  const a = [];
  if (/\b(UPDATE|DELETE)\b/i.test(s) && !/\bWHERE\b/i.test(s)) a.push(['error', 'UPDATE o DELETE sin WHERE afecta todas las filas.']);
  if (/\b\d{1,3}\.\d{3}\b/.test(s)) a.push(['error', 'Los números van sin punto de miles: 500000, no 500.000.']);
  if (/"[^"]*"/.test(s)) a.push(['error', "El texto va entre comillas simples ('Valorant'), no dobles."]);
  if (/\bFROM\s+[\w.]+(\s+(AS\s+)?\w+)?\s*,\s*[\w.]+/i.test(s)) a.push(['info', 'Estás uniendo tablas con coma. El curso espera JOIN ... ON.']);
  const nJoin = (s.match(/\bJOIN\b/gi) || []).length, nOn = (s.match(/\bON\b/gi) || []).length;
  if (nJoin > nOn) a.push(['error', 'Hay un JOIN sin su ON: cada JOIN necesita una condición.']);
  return a;
}
function traducir(msg, sql) {
  let t = msg;
  if (/no such table/i.test(msg)) t = 'Esa tabla no existe. ¿Escribiste el esquema? Por ejemplo esports.equipo o minimarket.producto. (' + msg + ')';
  else if (/no such column/i.test(msg)) t = 'Esa columna no existe en las tablas que usas. Revisa el nombre o el alias. (' + msg + ')';
  else if (/ambiguous/i.test(msg)) t = 'Columna ambigua: está en más de una tabla. Escribe alias.columna. (' + msg + ')';
  else if (/syntax error/i.test(msg)) t = 'Error de sintaxis: revisa comas, paréntesis, comillas y la ortografía de las palabras clave. (' + msg + ')';
  else if (/FOREIGN KEY constraint failed/i.test(msg)) t = 'Se violó una clave foránea: o el valor no existe en la tabla padre, o la política RESTRICT impide borrar/cambiar un padre con hijas.';
  else if (/constraint failed/i.test(msg)) t = 'Se violó una restricción (CHECK, NOT NULL, UNIQUE o PRIMARY KEY). (' + msg + ')';
  const typo = erratas(sql);
  if (typo.length && /syntax|no such/i.test(msg)) t += ' ¿Quisiste decir ' + typo.map((x) => x[1]).join(', ') + ' en vez de ' + typo.map((x) => x[0]).join(', ') + '?';
  return t;
}

// ───────── Ejecutar y revisar ─────────
function mostrarResultado(r, sql) {
  const cajaR = $('resultado');
  cajaR.hidden = false;
  if (!r.columnas.length) { cajaR.innerHTML = `<h3>Listo</h3><p>La instrucción se ejecutó. Filas afectadas: ${r.cambios}.</p>`; return; }
  cajaR.innerHTML = `<h3>Resultado</h3><div class="meta">${r.filas.length} fila${r.filas.length === 1 ? '' : 's'}</div><div class="scroll">${tablaHTML(r.columnas, r.filas)}</div>`;
}
function correr(sqlUsuario) {
  const e = actual;
  const db = e.libre ? dbLibre[e.base] : crearBD(e.base);
  try { return { ok: true, r: ejecutar(db, sqlUsuario) }; }
  catch (err) { return { ok: false, error: err.message }; }
  finally { if (!e.libre) db.close(); }
}
function ejecutarUI() {
  const sql = $('editor').value.trim();
  if (!sql) return;
  const x = correr(sql);
  $('feedback').hidden = true;
  if (!x.ok) {
    $('resultado').hidden = true;
    const f = $('feedback');
    f.hidden = false; f.className = 'caja feedback mal';
    f.innerHTML = `<h3>Error</h3><p>${esc(traducir(x.error, sql))}</p>`;
    return;
  }
  mostrarResultado(x.r, sql);
  const av = avisos(sql);
  if (av.length) { const f = $('feedback'); f.hidden = false; f.className = 'caja feedback info'; f.innerHTML = `<h3>Ojo</h3>` + av.map((a) => `<div class="aviso ${a[0] === 'error' ? 'error' : ''}">${esc(a[1])}</div>`).join(''); }
}

const num = (v) => (typeof v === 'number' ? Math.round(v * 1e4) / 1e4 : v);
const filaJ = (f) => JSON.stringify(f.map(num));
const mismaFila = (a, b) => filaJ(a) === filaJ(b);
function comparar(est, esp, ej) {
  if (est.columnas.length !== esp.columnas.length) return `Tu consulta devuelve ${est.columnas.length} columna(s) y se piden ${esp.columnas.length}.`;
  if (ej.validar) return ej.validar(est.filas, esp.filas, { filas: mismaFila });
  if (est.filas.length !== esp.filas.length) return `Devuelve ${est.filas.length} fila(s) y se esperaban ${esp.filas.length}.${est.filas.length > esp.filas.length ? ' ¿Faltó DISTINCT o un filtro?' : ' ¿Faltó un JOIN o te pasaste con el filtro?'}`;
  const A = est.filas.map(filaJ).sort(), B = esp.filas.map(filaJ).sort();
  if (A.some((v, i) => v !== B[i])) return 'Las filas no coinciden con lo esperado. Revisa columnas, filtros y uniones.';
  if (ej.ordCol != null && est.filas.some((f, i) => num(f[ej.ordCol]) !== num(esp.filas[i][ej.ordCol]))) return 'Las filas son las correctas, pero el orden no es el pedido (¿ASC o DESC?).';
  return null;
}
function revisar() {
  const e = actual, sql = $('editor').value.trim();
  if (!sql) return;
  const x = correr(sql);
  const f = $('feedback');
  f.hidden = false;
  if (!x.ok) {
    $('resultado').hidden = true;
    f.className = 'caja feedback mal';
    f.innerHTML = `<h3>Error</h3><p>${esc(traducir(x.error, sql))}</p>`;
    return;
  }
  mostrarResultado(x.r, sql);
  const db = crearBD(e.base);
  let esp;
  try { esp = ejecutar(db, e.solucion.split('\n\n-- Otra')[0]); } finally { db.close(); }
  let problema = comparar(x.r, esp, e);
  if (!problema) {
    // El resultado puede coincidir por casualidad con los datos: exige las tablas del camino.
    const pedidas = [...new Set([...e.solucion.split('\n\n-- Otra')[0].matchAll(/\b(?:FROM|JOIN)\s+([\w.]+)/gi)].map((m) => m[1]))];
    const faltan = pedidas.filter((t) => !new RegExp('\\b' + t.replace('.', '\\.') + '\\b', 'i').test(sql));
    if (faltan.length) problema = 'El resultado coincide, pero no usaste ' + faltan.join(', ') + '. Esa tabla es parte del camino de la consulta (no dependas de la suerte con estos datos).';
  }
  const av = avisos(sql);
  const avHTML = av.length ? `<div class="avisos">${av.map((a) => `<div class="aviso ${a[0] === 'error' ? 'error' : ''}">${esc(a[1])}</div>`).join('')}</div>` : '';
  if (!problema) {
    f.className = 'caja feedback ok';
    f.innerHTML = `<h3>Correcto</h3><p>Tu resultado coincide con el esperado.</p>${avHTML}`;
    estado.ej[e.id] = 'ok';
  } else {
    f.className = 'caja feedback mal';
    f.innerHTML = `<h3>Todavía no</h3><p>${esc(problema)}</p>${avHTML}`;
    if (estado.ej[e.id] !== 'ok') estado.ej[e.id] = 'mal';
  }
  guardar();
  pintarLista();
}

let pistaN = 0;
function pista() {
  const ps = actual.pistas || [];
  if (!ps.length) return;
  pistaN = Math.min(pistaN + 1, ps.length);
  const c = $('pistas');
  c.hidden = false;
  c.innerHTML = '<h3>Pistas</h3><ol>' + ps.slice(0, pistaN).map((p) => `<li>${esc(p)}</li>`).join('') + '</ol>';
}
function solucion() {
  const c = $('solucion');
  c.hidden = false;
  c.innerHTML = `<h3>Solución</h3><pre class="codigo">${esc(actual.solucion)}</pre>`;
}
function siguiente() {
  if (actual.libre) {
    dbLibre[actual.base] = crearBD(actual.base);
    pintarEsquema(dbLibre[actual.base], actual.base);
    ['feedback', 'resultado'].forEach((x) => { $(x).hidden = true; });
    return;
  }
  const i = EJERCICIOS_UI.findIndex((e) => e.id === actual.id);
  abrirEjercicio(EJERCICIOS_UI[(i + 1) % EJERCICIOS_UI.length].id);
}

$('btnEjecutar').addEventListener('click', ejecutarUI);
$('btnRevisar').addEventListener('click', revisar);
$('btnPista').addEventListener('click', pista);
$('btnSolucion').addEventListener('click', solucion);
$('btnSig').addEventListener('click', siguiente);
$('editor').addEventListener('keydown', (ev) => {
  if ((ev.metaKey || ev.ctrlKey) && ev.key === 'Enter') { ev.preventDefault(); (ev.shiftKey && !actual.libre ? revisar : ejecutarUI)(); }
  if (ev.key === 'Tab') { ev.preventDefault(); const t = ev.target, p = t.selectionStart; t.value = t.value.slice(0, p) + '  ' + t.value.slice(t.selectionEnd); t.selectionStart = t.selectionEnd = p + 2; }
});

// ───────── Arranque ─────────
pintarMenuTests();
const inicial = (location.hash || '').slice(1);
if (VISTAS.includes(inicial)) irA(inicial);
