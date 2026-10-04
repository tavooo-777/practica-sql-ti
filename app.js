'use strict';

const SQLJS_VER = '1.12.0';
const LS_KEY = 'tiSqlPractica.v1';
const DURACION_CERTAMEN = 25 * 60; // segundos

let SQL = null;
const state = {
  actual: null,
  progreso: {},   // id → 'ok' | 'mal'
  borradores: {}, // id → texto
  pistasVistas: {},
  certamen: null, // { ids, fin, respuestas, terminado, timer }
};
const esquemas = {}; // base → [{ nombre, cols:[{name, pk}], fks:[{from, table}] }]

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const sinTildes = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/* ───────── Persistencia (solo comodidad local) ───────── */
function cargarLocal() {
  try {
    const d = JSON.parse(localStorage.getItem(LS_KEY) || '{}');
    state.progreso = d.progreso || {};
    state.borradores = d.borradores || {};
  } catch (e) { /* sin localStorage: se trabaja igual */ }
}
function guardarLocal() {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({ progreso: state.progreso, borradores: state.borradores }));
  } catch (e) { /* ignorar */ }
}

/* ───────── Base de datos ───────── */
const lit = (v) => (v === null ? 'NULL' : typeof v === 'number' ? String(v) : "'" + String(v).replace(/'/g, "''") + "'");

function crearBD(baseId, excluir = null) {
  const db = new SQL.Database();
  db.run(excluir ? 'PRAGMA foreign_keys = OFF;' : 'PRAGMA foreign_keys = ON;');
  for (const t of BASES[baseId].tablas) {
    if (excluir && t.nombre === excluir) continue;
    db.run(t.create);
    for (const f of t.filas) db.run(`INSERT INTO ${t.nombre} VALUES (${f.map(lit).join(', ')})`);
  }
  if (excluir) db.run('PRAGMA foreign_keys = ON;');
  return db;
}

function ejecutar(db, sql) {
  const salida = { resultados: [], error: null, sentencias: 0 };
  try {
    for (const stmt of db.iterateStatements(sql)) {
      salida.sentencias++;
      const cols = stmt.getColumnNames();
      const filas = [];
      while (stmt.step()) filas.push(stmt.get());
      if (cols.length) salida.resultados.push({ cols, filas });
    }
  } catch (e) {
    salida.error = e.message || String(e);
  }
  return salida;
}

function calcularEsquemas() {
  for (const baseId of Object.keys(BASES)) {
    const db = crearBD(baseId);
    esquemas[baseId] = BASES[baseId].tablas.map((t) => {
      const ci = db.exec(`SELECT name, pk FROM pragma_table_info('${t.nombre}') ORDER BY cid`);
      const fk = db.exec(`SELECT "from", "table" FROM pragma_foreign_key_list('${t.nombre}')`);
      return {
        nombre: t.nombre,
        cols: ci.length ? ci[0].values.map(([name, pk]) => ({ name, pk })) : [],
        fks: fk.length ? fk[0].values.map(([from, table]) => ({ from, table })) : [],
      };
    });
    db.close();
  }
}

/* ───────── Comparación de resultados ───────── */
function norm(v) {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'number') return String(Math.round(v * 1e6) / 1e6);
  if (v instanceof Uint8Array) return '[blob]';
  return String(v).trim();
}
const SEP = '␟';
const claveFila = (fila, perm) => (perm ? perm.map((i) => fila[i]) : fila).map(norm).join(SEP);
const mostrarClave = (k) => k.split(SEP).join(' | ');

function permutaciones(n) {
  const out = [];
  const rec = (pref, resto) => {
    if (!resto.length) { out.push(pref); return; }
    resto.forEach((x, i) => rec([...pref, x], [...resto.slice(0, i), ...resto.slice(i + 1)]));
  };
  rec([], [...Array(n).keys()]);
  return out;
}
function igualMulti(a, b) {
  if (a.length !== b.length) return false;
  const m = new Map();
  a.forEach((k) => m.set(k, (m.get(k) || 0) + 1));
  for (const k of b) {
    const c = m.get(k);
    if (!c) return false;
    m.set(k, c - 1);
  }
  return true;
}
function igualSet(a, b) {
  const sa = new Set(a), sb = new Set(b);
  if (sa.size !== sb.size) return false;
  for (const k of sa) if (!sb.has(k)) return false;
  return true;
}
function diferencia(a, b) { // elementos de a que no están en b (como multiconjunto)
  const m = new Map();
  b.forEach((k) => m.set(k, (m.get(k) || 0) + 1));
  const out = [];
  for (const k of a) {
    const c = m.get(k);
    if (c) m.set(k, c - 1); else out.push(k);
  }
  return out;
}

function compararSelect(est, esp) {
  if (!est) return { ok: false, titulo: 'Tu código no devolvió ninguna tabla', detalle: 'Para este ejercicio se espera un SELECT.' };
  const k = esp.cols.length;
  if (est.cols.length !== k) {
    return {
      ok: false,
      titulo: `Tu consulta devuelve ${est.cols.length} columna${est.cols.length === 1 ? '' : 's'} y se ${k === 1 ? 'pide 1' : `piden ${k}`}`,
      detalle: `Se espera: ${esp.cols.join(', ')}. Revisa lo que pusiste después del SELECT.`,
    };
  }
  const keysEsp = esp.filas.map((f) => claveFila(f));
  const perms = k <= 4 ? permutaciones(k) : [[...Array(k).keys()]];
  for (const p of perms) {
    const keysEst = est.filas.map((f) => claveFila(f, p));
    if (igualMulti(keysEst, keysEsp)) return { ok: true };
    if (igualSet(keysEst, keysEsp)) {
      return { ok: true, aviso: keysEst.length > keysEsp.length ? 'Tu resultado tiene filas repetidas. Escribe SELECT DISTINCT para que cada una salga una vez.' : null };
    }
  }
  const keysEst = est.filas.map((f) => claveFila(f));
  return {
    ok: false,
    titulo: 'El resultado no coincide con el de la pauta',
    detalle: `Tu consulta devolvió ${est.filas.length} fila${est.filas.length === 1 ? '' : 's'}; la pauta devuelve ${esp.filas.length}.`,
    faltan: diferencia(keysEsp, keysEst),
    sobran: diferencia(keysEst, keysEsp),
  };
}

function contenido(db, tabla) {
  const r = db.exec(`SELECT * FROM ${tabla}`);
  return r.length ? r[0] : { columns: [], values: [] };
}

/* ───────── Avisos tipo pauta ───────── */
const ID = '[\\p{L}_][\\p{L}\\p{N}_]*';
function limpiar(sql) {
  return sql.replace(/--[^\n]*/g, ' ').replace(/'(?:[^']|'')*'/g, "'_'");
}
function tablasDelFrom(s) {
  const m = s.match(/\bFROM\b([\s\S]*?)(?=\bWHERE\b|\bGROUP\s+BY\b|\bORDER\s+BY\b|;|$)/i);
  if (!m) return [];
  return m[1].split(',').map((p) => p.trim()).filter(Boolean).map((p) => {
    const partes = p.split(/\s+/).filter((x) => x.toUpperCase() !== 'AS');
    return { nombre: partes[0], alias: partes[1] || null };
  });
}

function avisos(sql, baseId) {
  const out = [];
  const s = limpiar(sql);
  const sinComent = sql.replace(/--[^\n]*/g, ' ');
  const nombresTablas = esquemas[baseId].map((t) => sinTildes(t.nombre));

  if (/\b\d{1,3}(?:\.\d{3})+\b/.test(s)) {
    out.push({ nivel: 'error', texto: 'Escribiste un número con punto de miles (como 500.000). En SQL eso se lee 500,0: escríbelo sin puntos, 500000.' });
  }
  if (/"[^"\n]*"/.test(sinComent.replace(/'(?:[^']|'')*'/g, "''"))) {
    out.push({ nivel: 'warn', texto: "Usaste comillas dobles. Para texto se usan comillas simples: 'Pérez'." });
  }

  const desde = tablasDelFrom(s);
  const calificadores = new Set(desde.flatMap((t) => [sinTildes(t.nombre), t.alias && sinTildes(t.alias)]).filter(Boolean));
  for (const m of s.matchAll(new RegExp(`(${ID})\\.(${ID})`, 'gu'))) {
    const izq = sinTildes(m[1]), der = sinTildes(m[2]);
    if (!calificadores.has(izq) && !nombresTablas.includes(izq) && nombresTablas.includes(der)) {
      out.push({ nivel: 'error', texto: `Escribiste ${m[1]}.${m[2]}: está al revés. Primero va la tabla y después la columna: ${m[2]}.${m[1]}.` });
      break;
    }
  }

  const esSelect = /^\s*SELECT\b/i.test(s);
  const tieneSub = /\(\s*SELECT\b/i.test(s);
  if (esSelect && !tieneSub && !/\bJOIN\b/i.test(s) && desde.length >= 2) {
    const where = (s.match(/\bWHERE\b([\s\S]*)/i) || ['', ''])[1];
    let uniones = 0;
    for (const m of where.matchAll(new RegExp(`(${ID})\\.${ID}\\s*=\\s*(${ID})\\.${ID}`, 'gu'))) {
      if (sinTildes(m[1]) !== sinTildes(m[2])) uniones++;
    }
    const n = desde.length;
    if (uniones < n - 1) {
      out.push({ nivel: 'error', texto: `Tienes ${n} tablas en el FROM y ${uniones} ${uniones === 1 ? 'unión' : 'uniones'} (Tabla.col = Tabla.col). Con ${n} tablas van ${n - 1}. Sin ellas, SQL combina cada fila con todas las demás. La pauta descuenta entre 4 y 6 pts por condición faltante.` });
    }
    const resto = s.replace(/\bFROM\b[\s\S]*?(?=\bWHERE\b|$)/i, ' ');
    const palabras = new Set([...resto.matchAll(new RegExp(ID, 'gu'))].map((m) => sinTildes(m[0])));
    for (const t of desde) {
      const def = esquemas[baseId].find((e) => sinTildes(e.nombre) === sinTildes(t.nombre));
      if (!def) continue;
      const q = sinTildes(t.alias || t.nombre);
      const usada = resto.split(/\s+/).some((w) => sinTildes(w).includes(q + '.')) || def.cols.some((c) => palabras.has(sinTildes(c.name)) && !otrasTienen(baseId, desde, t, c.name));
      if (!usada) {
        out.push({ nivel: 'warn', texto: `La tabla ${t.nombre} está en el FROM pero no la usas. En la pauta 2018, consultar tablas de más descontaba 1 pt.` });
      }
    }
  }
  if (/=\s*\(\s*SELECT\b/i.test(s)) {
    out.push({ nivel: 'warn', texto: 'Usaste "= (SELECT …)". Si la subconsulta puede devolver más de una fila, el = falla: usa IN.' });
  }
  if (/^\s*(UPDATE|DELETE)\b/i.test(s) && !/\bWHERE\b/i.test(s)) {
    out.push({ nivel: 'warn', texto: 'Tu UPDATE o DELETE no tiene WHERE: afecta a todas las filas de la tabla.' });
  }
  return out;
}
function otrasTienen(baseId, desde, actual, col) {
  return desde.some((t) => t !== actual && esquemas[baseId].some((e) => sinTildes(e.nombre) === sinTildes(t.nombre) && e.cols.some((c) => sinTildes(c.name) === sinTildes(col))));
}

function traducirError(msg) {
  let m;
  if ((m = msg.match(/no such column: (.+)/))) return `No existe la columna ${m[1]}. Revisa el nombre en el esquema y que esté escrita como tabla.columna, en ese orden.`;
  if ((m = msg.match(/no such table: (.+)/))) return `No existe la tabla ${m[1].replace('main.', '')}. Revisa el nombre en el esquema (las tildes cuentan).`;
  if ((m = msg.match(/ambiguous column name: (.+)/))) return `La columna ${m[1]} está en más de una tabla del FROM, así que SQL no sabe cuál usar. Escribe la tabla adelante: Tabla.${m[1]}.`;
  if (/near ",": syntax error/.test(msg)) return 'Error de sintaxis cerca de una coma. ¿Separaste las condiciones del WHERE con comas? Van con AND.';
  if ((m = msg.match(/near "(.+)": syntax error/))) return `Error de sintaxis cerca de "${m[1]}". Revisa comas, paréntesis y comillas.`;
  if (/incomplete input/.test(msg)) return 'La consulta quedó incompleta: falta cerrar un paréntesis o una comilla.';
  if (/FOREIGN KEY constraint failed/.test(msg)) return 'Se violó una clave foránea: estás insertando un valor que no existe en la tabla padre, o borrando o cambiando un padre que tiene hijos (con RESTRICT no se puede).';
  if ((m = msg.match(/UNIQUE constraint failed: (.+)/))) return `Ya existe una fila con esa clave (${m[1]}): una PK no se puede repetir.`;
  if ((m = msg.match(/NOT NULL constraint failed: (.+)/))) return `La columna ${m[1]} es obligatoria (NOT NULL) y quedó vacía.`;
  if ((m = msg.match(/table (.+) already exists/))) return `La tabla ${m[1]} ya existe.`;
  if (/values for \d+ columns/.test(msg)) return 'La cantidad de valores no calza con la cantidad de columnas del INSERT.';
  return msg;
}

/* ───────── Revisión por tipo ───────── */
function revisar(ej, sql) {
  const base = ej.base;
  if (!sql.trim()) return { ok: false, titulo: 'Escribe algo primero', avisos: [] };
  const lint = avisos(sql, base);

  if (ej.tipo === 'select') {
    const dbE = crearBD(base), dbS = crearBD(base);
    const est = ejecutar(dbE, sql), sol = ejecutar(dbS, ej.solucion);
    dbE.close(); dbS.close();
    if (est.error) return { ok: false, titulo: 'Tu consulta tiene un error', detalle: traducirError(est.error), avisos: lint, resultado: null };
    const ultimo = est.resultados[est.resultados.length - 1];
    const c = compararSelect(ultimo, sol.resultados[sol.resultados.length - 1]);
    const lista = c.aviso ? [{ nivel: 'warn', texto: c.aviso }, ...lint] : lint;
    if (c.ok && lint.some((a) => a.nivel === 'error')) {
      return { ok: false, titulo: 'Llegaste al resultado, pero con errores que la pauta descuenta', detalle: 'El resultado coincide por casualidad. Corrige lo que aparece abajo.', avisos: lista, resultado: ultimo };
    }
    return { ...c, avisos: lista, resultado: ultimo };
  }

  if (ej.tipo === 'dml') {
    const dbE = crearBD(base), dbS = crearBD(base);
    const est = ejecutar(dbE, sql);
    ejecutar(dbS, ej.solucion);
    if (est.error) {
      dbE.close(); dbS.close();
      return { ok: false, titulo: 'Tu código tiene un error', detalle: traducirError(est.error), avisos: lint };
    }
    const problemas = [];
    const tablasRes = [];
    for (const t of ej.revisar) {
      const a = contenido(dbE, t), b = contenido(dbS, t);
      const ka = a.values.map((f) => claveFila(f)), kb = b.values.map((f) => claveFila(f));
      tablasRes.push({ nombre: t, cols: a.columns, filas: a.values });
      if (!igualMulti(ka, kb)) problemas.push({ tabla: t, faltan: diferencia(kb, ka), sobran: diferencia(ka, kb) });
    }
    dbE.close(); dbS.close();
    if (!problemas.length) return { ok: true, titulo: '¡Correcto! Las tablas quedaron igual que con la pauta', avisos: lint, tablas: tablasRes };
    return { ok: false, titulo: 'Las tablas no quedaron como con la pauta', problemas, avisos: lint, tablas: tablasRes };
  }

  if (ej.tipo === 'create') {
    const db = crearBD(base, ej.tabla);
    const est = ejecutar(db, sql);
    if (est.error) { db.close(); return { ok: false, titulo: 'Tu CREATE TABLE tiene un error', detalle: traducirError(est.error), avisos: lint }; }
    const r = revisarCreate(db, ej);
    db.close();
    return { ...r, avisos: lint };
  }

  if (ej.tipo === 'error') {
    const db = crearBD(base);
    const est = ejecutar(db, sql);
    db.close();
    if (est.error && ej.esperado.test(est.error)) {
      return { ok: true, titulo: 'Exacto: SQL lo rechaza', detalle: traducirError(est.error), explicacion: ej.explicacion, avisos: [] };
    }
    if (est.error) return { ok: false, titulo: 'Dio un error, pero no el que se buscaba', detalle: traducirError(est.error), avisos: lint };
    return { ok: false, titulo: 'Tu código se ejecutó sin error', detalle: 'Se esperaba que la base lo rechazara. ¿Escribiste exactamente lo que pide el enunciado?', avisos: lint };
  }
}

function revisarCreate(db, ej) {
  const req = ej.requisitos;
  const tablas = db.exec("SELECT name FROM sqlite_master WHERE type = 'table'");
  const nombres = tablas.length ? tablas[0].values.map((v) => v[0]) : [];
  const real = nombres.find((n) => sinTildes(n) === sinTildes(ej.tabla));
  const items = [];
  if (!real) {
    return { ok: false, titulo: `No se creó la tabla ${ej.tabla}`, detalle: 'Revisa el nombre de la tabla en tu CREATE TABLE.', items: [], puntaje: 0 };
  }
  const ci = db.exec(`SELECT name, pk, "notnull" FROM pragma_table_info('${real}')`)[0].values;
  const fk = db.exec(`SELECT "from", "table" FROM pragma_foreign_key_list('${real}')`);
  const fks = fk.length ? fk[0].values : [];
  const cols = ci.map(([n]) => sinTildes(n));

  const faltan = req.columnas.filter((c) => !cols.includes(sinTildes(c)));
  items.push({ ok: !faltan.length, texto: faltan.length ? `Faltan columnas: ${faltan.join(', ')}` : 'Tiene todas las columnas' });

  const pk = ci.filter(([, p]) => p > 0).map(([n]) => sinTildes(n)).sort();
  const pkEsp = req.pk.map(sinTildes).sort();
  items.push({
    ok: pk.join() === pkEsp.join(),
    texto: pk.join() === pkEsp.join() ? `PK correcta: (${req.pk.join(', ')})` : `La PK debería ser (${req.pk.join(', ')}). Tú tienes: ${pk.length ? '(' + pk.join(', ') + ')' : 'ninguna'}`,
  });

  for (const f of req.fk) {
    const tiene = fks.some(([from, table]) => sinTildes(from) === sinTildes(f.col) && sinTildes(table) === sinTildes(f.tabla));
    items.push({ ok: tiene, texto: tiene ? `FK ${f.col} → ${f.tabla}` : `Falta la FK: FOREIGN KEY (${f.col}) REFERENCES ${f.tabla}` });
  }
  for (const c of req.notnull) {
    const fila = ci.find(([n]) => sinTildes(n) === sinTildes(c));
    const ok = fila && fila[2] === 1;
    items.push({ ok, texto: ok ? `${c} es NOT NULL` : `${c} debería ser NOT NULL (obligatorio)` });
  }
  const buenos = items.filter((i) => i.ok).length;
  const ok = buenos === items.length;
  return {
    ok,
    titulo: ok ? '¡Correcto! La tabla tiene todo lo que pide la pauta' : `Te faltan ${items.length - buenos} de ${items.length} cosas`,
    detalle: ok ? null : 'Ojo: en la pauta 2018 el CREATE TABLE era todo o nada.',
    items,
    puntaje: Math.round((ej.pts * buenos / items.length) * 2) / 2,
  };
}

/* ───────── Interfaz ───────── */
function ejercicioPorId(id) { return EJERCICIOS.find((e) => e.id === id); }
function idsVisibles() { return state.certamen && !state.certamen.terminado ? state.certamen.ids : EJERCICIOS.map((e) => e.id); }

function renderLista() {
  const cont = $('lista');
  cont.innerHTML = '';
  const visibles = idsVisibles();
  for (const [baseId, base] of Object.entries(BASES)) {
    const ejs = EJERCICIOS.filter((e) => e.base === baseId && visibles.includes(e.id));
    if (!ejs.length) continue;
    const g = document.createElement('div');
    g.className = 'grupo';
    g.innerHTML = `<h3>${esc(base.nombre)}<span class="fuente">${esc(base.fuente)}</span></h3>`;
    for (const e of ejs) {
      const b = document.createElement('button');
      b.className = 'item' + (state.actual === e.id ? ' activo' : '');
      let estado = state.progreso[e.id] || '';
      if (state.certamen && !state.certamen.terminado) estado = state.certamen.respuestas[e.id] ? 'guardado' : '';
      b.innerHTML = `<span class="punto ${estado}"></span><span class="tit">${esc(e.titulo)}<small>${esc(e.id)} · ${esc(e.nivel)}</small></span><span class="pts">${e.pts} pts</span>`;
      b.addEventListener('click', () => abrir(e.id));
      g.appendChild(b);
    }
    cont.appendChild(g);
  }
  if (state.certamen && !state.certamen.terminado) {
    const t = document.createElement('button');
    t.className = 'btn btn-prim btn-terminar';
    t.textContent = 'Terminar certamen';
    t.addEventListener('click', terminarCertamen);
    cont.appendChild(t);
  }
  renderProgreso();
}

function renderProgreso() {
  const total = EJERCICIOS.length;
  const hechos = EJERCICIOS.filter((e) => state.progreso[e.id] === 'ok');
  const pts = hechos.reduce((a, e) => a + e.pts, 0);
  const ptsTot = EJERCICIOS.reduce((a, e) => a + e.pts, 0);
  $('progreso').innerHTML = `<b>${hechos.length}</b> de ${total} resueltos · <b>${pts}</b> de ${ptsTot} pts`;
}

function renderEsquema(ej) {
  const cont = $('esquema');
  cont.innerHTML = '';
  $('nombreBase').textContent = BASES[ej.base].nombre;
  for (const t of esquemas[ej.base]) {
    const def = BASES[ej.base].tablas.find((x) => x.nombre === t.nombre);
    const esObjetivo = ej.tipo === 'create' && t.nombre === ej.tabla;
    const card = document.createElement('div');
    card.className = 'tabla-card';
    let firma;
    if (esObjetivo) {
      firma = `${esc(t.nombre)}(${ej.requisitos.columnas.map(esc).join(', ')})`;
    } else {
      const partes = t.cols.map((c) => {
        const fk = t.fks.find((f) => f.from === c.name);
        let html = esc(c.name);
        if (c.pk) html = `<span class="pk">${html}</span>`;
        if (fk) html += `<span class="fk"> → ${esc(fk.table)}</span>`;
        return html;
      });
      firma = `${esc(t.nombre)}(${partes.join(', ')})`;
    }
    let datos = '';
    if (!esObjetivo) {
      datos = `<div class="datos"><table class="grid"><thead><tr>${t.cols.map((c) => `<th>${esc(c.name)}</th>`).join('')}</tr></thead><tbody>${def.filas.map((f) => `<tr>${f.map((v) => celda(v)).join('')}</tr>`).join('')}</tbody></table></div>`;
    }
    card.innerHTML = `<h4>${esc(t.nombre)}${esObjetivo ? '<span class="creas">esta la creas tú</span>' : ''}</h4><div class="firma">${firma}</div>${datos}`;
    cont.appendChild(card);
  }
}
const celda = (v) => (v === null ? '<td class="nulo">NULL</td>' : `<td>${esc(v)}</td>`);

function tablaHTML(cols, filas, max = 60) {
  if (!cols.length) return '<p class="meta">Sin columnas.</p>';
  const cuerpo = filas.slice(0, max).map((f) => `<tr>${f.map((v) => celda(v)).join('')}</tr>`).join('');
  return `<div class="scroll"><table class="grid"><thead><tr>${cols.map((c) => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${cuerpo || `<tr><td colspan="${cols.length}" class="nulo">(sin filas)</td></tr>`}</tbody></table></div>`;
}

function abrir(id) {
  const ej = ejercicioPorId(id);
  state.actual = id;
  $('vistaResumen').hidden = true;
  $('vistaEjercicio').hidden = false;
  const chips = [`<span class="chip pts">${ej.pts} pts</span>`, `<span class="chip">${esc(ej.nivel)}</span>`];
  if (ej.certamen) chips.push(`<span class="chip cert">Certamen ${esc(ej.certamen)}</span>`);
  $('chips').innerHTML = chips.join('');
  $('titulo').textContent = `${ej.id}. ${ej.titulo}`;
  $('enunciado').textContent = ej.enunciado;
  const nota = BASES[ej.base].nota;
  $('notaBase').hidden = !nota;
  $('notaBase').textContent = nota || '';
  renderEsquema(ej);
  const ed = $('editor');
  ed.value = state.borradores[id] || '';
  ['feedback', 'resultado', 'solucion', 'pistas'].forEach((x) => { $(x).hidden = true; $(x).innerHTML = ''; });
  const enCert = state.certamen && !state.certamen.terminado;
  $('btnPista').disabled = enCert;
  $('btnSolucion').disabled = enCert;
  $('btnRevisar').innerHTML = enCert ? 'Guardar respuesta <kbd>⌘⇧↵</kbd>' : 'Revisar <kbd>⌘⇧↵</kbd>';
  state.pistasVistas[id] = 0;
  renderLista();
  ed.focus();
  window.scrollTo({ top: 0 });
}

function mostrarAvisos(lista) {
  if (!lista || !lista.length) return '';
  return `<div class="avisos">${lista.map((a) => `<div class="aviso ${a.nivel === 'error' ? 'error' : ''}"><b>${a.nivel === 'error' ? 'Ojo' : 'Aviso'}</b><span>${esc(a.texto)}</span></div>`).join('')}</div>`;
}

function accionEjecutar() {
  const ej = ejercicioPorId(state.actual);
  const sql = $('editor').value;
  const fb = $('feedback'), res = $('resultado');
  if (!sql.trim()) return;
  const db = crearBD(ej.base, ej.tipo === 'create' ? ej.tabla : null);
  const out = ejecutar(db, sql);
  const lint = avisos(sql, ej.base);
  res.hidden = false;
  if (out.error) {
    fb.hidden = false;
    fb.className = 'feedback mal';
    fb.innerHTML = `<h3>Error al ejecutar</h3><p>${esc(traducirError(out.error))}</p>${mostrarAvisos(lint)}`;
    res.hidden = true;
  } else {
    if (lint.length) {
      fb.hidden = false;
      fb.className = 'feedback info';
      fb.innerHTML = `<h3>Se ejecutó, pero revisa esto</h3>${mostrarAvisos(lint)}`;
    } else {
      fb.hidden = true;
    }
    if (ej.tipo === 'select' || out.resultados.length) {
      const r = out.resultados[out.resultados.length - 1];
      res.innerHTML = r ? `<h3>Resultado</h3><p class="meta">${r.filas.length} fila${r.filas.length === 1 ? '' : 's'}</p>${tablaHTML(r.cols, r.filas)}` : '<h3>Resultado</h3><p class="meta">Tu código no devolvió ninguna tabla.</p>';
    } else if (ej.tipo === 'dml') {
      res.innerHTML = '<h3>Así quedaron las tablas</h3>' + ej.revisar.map((t) => { const c = contenido(db, t); return `<p class="meta">${esc(t)} · ${c.values.length} filas</p>${tablaHTML(c.columns, c.values)}`; }).join('');
    } else if (ej.tipo === 'create') {
      const tablas = db.exec("SELECT name FROM sqlite_master WHERE type = 'table'");
      const real = tablas.length ? tablas[0].values.map((v) => v[0]).find((n) => sinTildes(n) === sinTildes(ej.tabla)) : null;
      if (real) {
        const ci = db.exec(`SELECT name AS columna, type AS tipo, pk, "notnull" AS obligatorio FROM pragma_table_info('${real}')`)[0];
        const fk = db.exec(`SELECT "from" AS columna, "table" AS referencia FROM pragma_foreign_key_list('${real}')`);
        res.innerHTML = `<h3>Estructura de ${esc(real)}</h3>${tablaHTML(ci.columns, ci.values)}<p class="meta" style="margin-top:12px">Claves foráneas</p>${fk.length ? tablaHTML(fk[0].columns, fk[0].values) : '<p class="meta">Ninguna.</p>'}`;
      } else {
        res.innerHTML = `<h3>Resultado</h3><p class="meta">Se ejecutó, pero no existe una tabla llamada ${esc(ej.tabla)}.</p>`;
      }
    } else {
      res.innerHTML = '<h3>Resultado</h3><p class="meta">Se ejecutó sin error.</p>';
    }
  }
  db.close();
}

function accionRevisar() {
  const ej = ejercicioPorId(state.actual);
  const sql = $('editor').value;
  const fb = $('feedback');
  if (state.certamen && !state.certamen.terminado) {
    state.certamen.respuestas[ej.id] = sql;
    fb.hidden = false;
    fb.className = 'feedback info';
    fb.innerHTML = '<h3>Respuesta guardada</h3><p>Se corrige al terminar el certamen. Puedes cambiarla hasta entonces.</p>';
    renderLista();
    return;
  }
  const r = revisar(ej, sql);
  state.progreso[ej.id] = r.ok ? 'ok' : 'mal';
  guardarLocal();
  fb.hidden = false;
  fb.className = 'feedback ' + (r.ok ? 'ok' : 'mal');
  fb.innerHTML = htmlRevision(ej, r);
  const res = $('resultado');
  if (r.resultado) {
    res.hidden = false;
    res.innerHTML = `<h3>Tu resultado</h3><p class="meta">${r.resultado.filas.length} fila${r.resultado.filas.length === 1 ? '' : 's'}</p>${tablaHTML(r.resultado.cols, r.resultado.filas)}`;
  } else if (r.tablas) {
    res.hidden = false;
    res.innerHTML = '<h3>Así quedaron tus tablas</h3>' + r.tablas.map((t) => `<p class="meta">${esc(t.nombre)} · ${t.filas.length} filas</p>${tablaHTML(t.cols, t.filas)}`).join('');
  } else {
    res.hidden = true;
  }
  renderLista();
}

function htmlRevision(ej, r) {
  let h = `<h3>${esc(r.titulo || (r.ok ? '¡Correcto!' : 'Incorrecto'))}</h3>`;
  if (r.ok && ej.tipo === 'select') h = '<h3>¡Correcto! Tu resultado coincide con el de la pauta</h3>';
  if (r.detalle) h += `<p>${esc(r.detalle)}</p>`;
  if (r.faltan && r.faltan.length) h += `<div class="diff"><span class="lbl">Te faltan estas filas:</span><br>${r.faltan.slice(0, 6).map((k) => esc(mostrarClave(k))).join('<br>')}</div>`;
  if (r.sobran && r.sobran.length) h += `<div class="diff"><span class="lbl">Te sobran estas filas:</span><br>${r.sobran.slice(0, 6).map((k) => esc(mostrarClave(k))).join('<br>')}${r.sobran.length > 6 ? `<br>… y ${r.sobran.length - 6} más` : ''}</div>`;
  if (r.problemas) {
    for (const p of r.problemas) {
      h += `<div class="diff"><span class="lbl">En ${esc(p.tabla)}:</span>`;
      if (p.faltan.length) h += `<br>debería haber: ${p.faltan.slice(0, 4).map((k) => esc(mostrarClave(k))).join('; ')}`;
      if (p.sobran.length) h += `<br>no debería haber: ${p.sobran.slice(0, 4).map((k) => esc(mostrarClave(k))).join('; ')}`;
      h += '</div>';
    }
  }
  if (r.items && r.items.length) {
    h += `<ul class="items">${r.items.map((i) => `<li class="${i.ok ? 'si' : 'no'}" data-m="${i.ok ? '✓' : '✗'}">${esc(i.texto)}</li>`).join('')}</ul>`;
    if (!r.ok) h += `<p>Puntaje parcial: ${r.puntaje} de ${ej.pts}.</p>`;
  }
  if (r.explicacion) h += `<p>${esc(r.explicacion)}</p>`;
  h += mostrarAvisos(r.avisos);
  return h;
}

function accionPista() {
  const ej = ejercicioPorId(state.actual);
  const n = Math.min((state.pistasVistas[ej.id] || 0) + 1, ej.pistas.length);
  state.pistasVistas[ej.id] = n;
  const p = $('pistas');
  p.hidden = false;
  p.innerHTML = `<h3>Pista${n > 1 ? 's' : ''}</h3><ol>${ej.pistas.slice(0, n).map((x) => `<li>${esc(x)}</li>`).join('')}</ol>`;
}

function accionSolucion() {
  const ej = ejercicioPorId(state.actual);
  const s = $('solucion');
  s.hidden = false;
  s.innerHTML = `<h3>Solución de referencia</h3><pre class="codigo">${esc(ej.solucion)}</pre>${ej.explicacion ? `<p>${esc(ej.explicacion)}</p>` : ''}<p class="meta">Hay otras formas correctas (por ejemplo, con subconsultas y IN): lo que se corrige es el resultado.</p>`;
}

function siguiente() {
  const ids = idsVisibles();
  const i = ids.indexOf(state.actual);
  const pendiente = ids.slice(i + 1).concat(ids.slice(0, i)).find((id) => state.progreso[id] !== 'ok') || ids[(i + 1) % ids.length];
  abrir(pendiente);
}

/* ───────── Modo certamen ───────── */
function mezclar(a) {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}
function iniciarCertamen() {
  if (state.certamen && !state.certamen.terminado) return;
  const bases = mezclar(Object.keys(BASES)).slice(0, 3);
  const selects = bases.map((b) => mezclar(EJERCICIOS.filter((e) => e.base === b && e.tipo === 'select' && e.pts >= 3))[0] || mezclar(EJERCICIOS.filter((e) => e.base === b && e.tipo === 'select'))[0]);
  const otro = mezclar(EJERCICIOS.filter((e) => e.tipo === 'dml' || e.tipo === 'create'))[0];
  const ids = [...selects, otro].filter(Boolean).map((e) => e.id);
  state.certamen = { ids, fin: Date.now() + DURACION_CERTAMEN * 1000, respuestas: {}, terminado: false, timer: null };
  $('reloj').hidden = false;
  $('btnCertamen').textContent = 'Salir del certamen';
  state.certamen.timer = setInterval(tick, 500);
  tick();
  abrir(ids[0]);
}
function tick() {
  const c = state.certamen;
  if (!c || c.terminado) return;
  const resta = Math.max(0, Math.round((c.fin - Date.now()) / 1000));
  const m = String(Math.floor(resta / 60)).padStart(2, '0'), s = String(resta % 60).padStart(2, '0');
  const r = $('reloj');
  r.textContent = `${m}:${s}`;
  r.classList.toggle('urgente', resta <= 120);
  if (resta === 0) terminarCertamen();
}
function terminarCertamen() {
  const c = state.certamen;
  if (!c || c.terminado) return;
  if (state.actual && c.ids.includes(state.actual) && !c.respuestas[state.actual] && $('editor').value.trim()) {
    c.respuestas[state.actual] = $('editor').value;
  }
  c.terminado = true;
  clearInterval(c.timer);
  $('reloj').hidden = true;
  $('btnCertamen').textContent = 'Modo certamen';
  let obt = 0, tot = 0;
  const filas = c.ids.map((id) => {
    const ej = ejercicioPorId(id);
    const sql = c.respuestas[id] || '';
    const r = sql ? revisar(ej, sql) : { ok: false, titulo: 'Sin respuesta' };
    const pts = r.ok ? ej.pts : (ej.tipo === 'create' && r.puntaje ? r.puntaje : 0);
    if (sql) {
      state.borradores[id] = sql;
      state.progreso[id] = r.ok ? 'ok' : 'mal';
    }
    obt += pts; tot += ej.pts;
    return { ej, r, pts };
  });
  guardarLocal();
  const p = obt / tot;
  const nota = p < 0.6 ? 1 + 3 * (p / 0.6) : 4 + 3 * ((p - 0.6) / 0.4);
  const v = $('vistaResumen');
  $('vistaEjercicio').hidden = true;
  v.hidden = false;
  v.className = 'resumen';
  v.innerHTML = `<h2>Resultado del certamen</h2><p class="meta">Escala de 1 a 7 con 60 % de exigencia (el 4,0 se saca con el 60 % del puntaje). Es solo una referencia.</p><div class="nota">${obt} / ${tot} pts · nota ${nota.toFixed(1).replace('.', ',')}</div>` +
    filas.map(({ ej, r, pts }) => `<div class="fila"><div><b>${esc(ej.id)}. ${esc(ej.titulo)}</b><br><span class="meta">${esc(r.ok ? 'Correcto' : r.titulo || 'Incorrecto')}</span></div><div class="estado ${r.ok ? 'ok' : 'mal'}">${pts} / ${ej.pts}</div></div>`).join('') +
    '<p>Haz clic en cada ejercicio de la lista para ver la corrección detallada, las pistas y la solución.</p>';
  state.actual = null;
  renderLista();
}
function salirCertamen() {
  const c = state.certamen;
  if (!c) return;
  if (!c.terminado && !confirm('¿Salir del certamen sin terminarlo? Se pierden las respuestas guardadas.')) return;
  clearInterval(c.timer);
  state.certamen = null;
  $('reloj').hidden = true;
  $('btnCertamen').textContent = 'Modo certamen';
  abrir(EJERCICIOS[0].id);
}

/* ───────── Inicio ───────── */
function conectar() {
  const ed = $('editor');
  let t = null;
  ed.addEventListener('input', () => {
    clearTimeout(t);
    t = setTimeout(() => { state.borradores[state.actual] = ed.value; guardarLocal(); }, 300);
  });
  ed.addEventListener('keydown', (e) => {
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      const { selectionStart: a, selectionEnd: b, value } = ed;
      ed.value = value.slice(0, a) + '  ' + value.slice(b);
      ed.selectionStart = ed.selectionEnd = a + 2;
    }
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (e.shiftKey) accionRevisar(); else accionEjecutar();
    }
  });
  $('btnEjecutar').addEventListener('click', accionEjecutar);
  $('btnRevisar').addEventListener('click', accionRevisar);
  $('btnPista').addEventListener('click', accionPista);
  $('btnSolucion').addEventListener('click', accionSolucion);
  $('btnSiguiente').addEventListener('click', siguiente);
  $('btnCertamen').addEventListener('click', () => {
    if (state.certamen && !state.certamen.terminado) salirCertamen();
    else { state.certamen = null; iniciarCertamen(); }
  });
}

cargarLocal();
initSqlJs({ locateFile: (f) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/${SQLJS_VER}/${f}` })
  .then((S) => {
    SQL = S;
    calcularEsquemas();
    $('cargando').hidden = true;
    conectar();
    const primero = EJERCICIOS.find((e) => state.progreso[e.id] !== 'ok') || EJERCICIOS[0];
    abrir(primero.id);
  })
  .catch((e) => {
    $('cargando').textContent = 'No se pudo cargar SQLite (sql.js). Revisa tu conexión a internet y recarga la página. Detalle: ' + e.message;
  });
