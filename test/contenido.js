// Contenido: tests de alternativas y ejercicios de práctica.
// Todas las respuestas y salidas se verificaron en SQLite con los mismos datos.

const TESTS = [
  {
    id: 't1',
    titulo: 'Test 1 · DDL, restricciones y DML',
    detalle: 'CREATE TABLE, claves, ON DELETE, INSERT, UPDATE, TRUNCATE',
    preguntas: [
      {
        q: '¿Qué garantiza una PRIMARY KEY?',
        opts: ['Que el valor existe en otra tabla', 'Que cada fila se identifica con un valor único y nunca NULL', 'Que el valor es un número entero', 'Que la columna se autoincrementa'],
        ok: 1,
        why: 'PRIMARY KEY = único y no NULL. Que el valor exista en otra tabla es FOREIGN KEY; el autoincremento lo da SERIAL.'
      },
      {
        q: 'La tabla pedidos tiene <code>estado_id INTEGER</code> (sin DEFAULT) y una FK con <code>ON DELETE SET DEFAULT</code>. Borras un estado que tiene pedidos. ¿Qué pasa?',
        opts: ['Los pedidos se borran', 'estado_id queda en NULL', 'La acción falla: la columna necesita un DEFAULT definido', 'Se ignora el borrado del estado'],
        ok: 2,
        why: 'SET DEFAULT pone el valor DEFAULT de la columna. Si la columna no lo tiene, la acción falla. NULL es SET NULL; borrar los pedidos es CASCADE.'
      },
      {
        q: 'En esports, <code>equipo.capitan</code> tiene FK a jugador con <code>ON DELETE RESTRICT</code>. Ejecutas:<pre class="codigo">DELETE FROM esports.jugador WHERE id_jugador = 3001;</pre>El jugador 3001 es capitán del equipo 5001. ¿Qué ocurre?',
        opts: ['Se borra el jugador y el equipo 5001', 'Se borra el jugador y capitan queda NULL', 'Se borra solo el jugador, el equipo queda con capitán inexistente', 'La operación falla: hay un equipo que lo referencia'],
        ok: 3,
        why: 'RESTRICT impide borrar al padre (jugador) mientras exista una fila hija (equipo) que lo referencia. Se comprobó: SQLite responde "FOREIGN KEY constraint failed".'
      },
      {
        q: 'Ejecutas <code>DELETE FROM esports.equipo WHERE id_equipo = 5001;</code>. Las FK de <code>participa</code> y <code>compite</code> hacia equipo son <code>ON DELETE CASCADE</code>. El equipo tenía 3 jugadores en participa y 3 torneos en compite. ¿Qué queda?',
        opts: ['Se borra el equipo y sus 3 + 3 filas en participa y compite', 'Falla, porque hay filas hijas', 'Se borra el equipo y las filas hijas quedan con id_equipo NULL', 'Se borra solo el equipo y las filas hijas quedan huérfanas'],
        ok: 0,
        why: 'CASCADE propaga el borrado a las hijas: participa pasa de 14 a 11 filas y compite de 11 a 8. Que fallara sería RESTRICT; NULL sería SET NULL.'
      },
      {
        q: '¿Qué CREATE TABLE es correcto?',
        opts: [
          '<pre class="codigo">CREATE TABLE lab.ciudad (\n  rut VARCHAR(12) PRIMARY KEY,\n  ciudad VARCHAR(30),\n  FOREIGN KEY (rut) REFERENCES lab.persona(rut)\n);</pre>',
          '<pre class="codigo">CREATE TABLE lab.ciudad (\n  rut VARCHAR(12) PRIMARY KEY,\n  ciudad VARCHAR(30),\n  FOREIGN KEY (rut) lab.persona(rut)\n);</pre>',
          '<pre class="codigo">CREATE TABLE lab.ciudad (\n  rut VARCHAR(12) PRIMARY KEY,\n  ciudad VARCHAR(30),\n);</pre>',
          '<pre class="codigo">CREATE TABLE lab.ciudad (\n  rut VARCHAR PRIMARY KEY,\n  ciudad VARCHAR(30)\n  precio NUMERIC CHECK precio &gt; 0\n);</pre>'
        ],
        ok: 0,
        why: 'La B no tiene REFERENCES. La C deja una coma antes del paréntesis final. La D usa VARCHAR sin n, olvida una coma y escribe CHECK sin paréntesis.'
      },
      {
        q: 'Quieres dejar la tabla <code>venta</code> sin ninguna fila, pero conservar su estructura para volver a insertar. ¿Qué usas?',
        opts: ['DROP TABLE venta;', 'TRUNCATE TABLE venta;', 'ALTER TABLE venta DROP COLUMN id_venta;', 'UPDATE venta SET fecha = NULL;'],
        ok: 1,
        why: 'TRUNCATE borra todas las filas y deja la tabla. DROP TABLE destruye la tabla entera. DELETE FROM venta sin WHERE también serviría para vaciarla.'
      },
      {
        q: 'Para cambiar el dueño del vehículo de patente HTTP25 a Diego (RUT 8738936-0), ¿cuál instrucción es correcta?',
        opts: [
          "UPDATE autos.vehiculo SET rut = '8738936-0';",
          "UPDATE INTO autos.vehiculo SET rut = '8738936-0' WHERE patente = 'HTTP25';",
          "UPDATE autos.vehiculo SET rut = '8738936-0' WHERE patente = 'HTTP25';",
          "INSERT INTO autos.vehiculo SET rut = '8738936-0' WHERE patente = 'HTTP25';"
        ],
        ok: 2,
        why: 'La sintaxis es UPDATE tabla SET col = valor WHERE condición. Sin WHERE (opción A) cambiarías el dueño de todos los vehículos. "UPDATE INTO" no existe (error de la diapositiva del LAB3).'
      }
    ]
  },
  {
    id: 't2',
    titulo: 'Test 2 · SELECT básico y agregaciones',
    detalle: 'WHERE, DISTINCT, ORDER BY, LIMIT, COUNT, AVG, GROUP BY (minimarket y esports)',
    preguntas: [
      {
        q: 'En minimarket, ¿qué devuelve esta consulta?<pre class="codigo">SELECT COUNT(*) FROM minimarket.producto\nWHERE precio &gt; 2000;</pre>',
        opts: ['3', '6', '12', '2500'],
        ok: 1,
        why: 'Productos con precio mayor a 2000: queso 2500, jamón 2800, mantequilla 2100, papel higiénico 3500, cola 2200 y detergente 6500. Son 6. (12 es el total de productos.)'
      },
      {
        q: '¿Qué devuelve esta consulta?<pre class="codigo">SELECT AVG(precio) FROM minimarket.producto\nWHERE id_categoria = 20;</pre>La categoría 20 (Abarrotes) tiene pan 1800, arroz 1200 y fideos 850.',
        opts: ['3850', '1283,33', '1200', '1800'],
        ok: 1,
        why: 'AVG = suma / cantidad = (1800 + 1200 + 850) / 3 = 1283,33. 3850 es la suma; 1200 sería la mediana, no el promedio.'
      },
      {
        q: 'La tabla cliente tiene 6 filas y la ciudad Concepción aparece 2 veces. ¿Cuántas filas devuelve esto?<pre class="codigo">SELECT DISTINCT ciudad FROM minimarket.cliente;</pre>',
        opts: ['6', '5', '2', '1'],
        ok: 1,
        why: 'DISTINCT elimina repetidos: Concepción, Osorno, Puerto Varas, Santiago y Valparaíso. 5 ciudades distintas.'
      },
      {
        q: '¿Cuál consulta entrega los 3 productos MÁS CAROS?',
        opts: [
          'SELECT nombre, precio FROM minimarket.producto ORDER BY precio ASC LIMIT 3;',
          'SELECT nombre, precio FROM minimarket.producto ORDER BY precio DESC LIMIT 3;',
          'SELECT nombre, MAX(precio) FROM minimarket.producto;',
          'SELECT nombre, precio FROM minimarket.producto LIMIT 3 ORDER BY precio DESC;'
        ],
        ok: 1,
        why: 'DESC pone el más grande primero y LIMIT 3 se queda con 3. ASC entrega los más baratos. En la D, LIMIT va después de ORDER BY. En la C, MAX da un solo valor.'
      },
      {
        q: 'La tabla equipo de esports tiene 7 filas y 2 de ellas tienen sponsor NULL. ¿Qué devuelve?<pre class="codigo">SELECT COUNT(*), COUNT(sponsor) FROM esports.equipo;</pre>',
        opts: ['7 y 7', '5 y 5', '7 y 5', '5 y 7'],
        ok: 2,
        why: 'COUNT(*) cuenta todas las filas (7). COUNT(sponsor) se salta los NULL (7 − 2 = 5).'
      },
      {
        q: 'Quieres saber cuántos jugadores tiene cada equipo. ¿Qué parte falta?<pre class="codigo">SELECT e.nombre_equipo, COUNT(*)\nFROM esports.equipo AS e\nJOIN esports.participa AS p ON e.id_equipo = p.id_equipo\n________ ;</pre>',
        opts: ['WHERE e.nombre_equipo', 'ORDER BY COUNT(*)', 'GROUP BY e.nombre_equipo', 'LIMIT 1'],
        ok: 2,
        why: 'Para calcular "por cada equipo" se agrupa: GROUP BY e.nombre_equipo. La columna que no es agregación debe ir en el GROUP BY. Resulta una fila por equipo (7 filas).'
      },
      {
        q: 'Esports: promedio del premio de los torneos con modalidad Presencial. Hay 4 torneos Presenciales con premios 800000, 1500000, 300000 y 250000. ¿Cuál es el resultado de <code>SELECT AVG(premio) FROM esports.torneo WHERE modalidad = \'Presencial\'</code>?',
        opts: ['2850000', '712500', '1500000', '4'],
        ok: 1,
        why: 'Suma = 2.850.000; entre 4 torneos = 712.500. El primer valor es la suma, 1.500.000 el máximo y 4 la cuenta.'
      }
    ]
  },
  {
    id: 't3',
    titulo: 'Test 3 · JOIN, subconsultas y vistas',
    detalle: 'Unir varias tablas, GROUP BY con JOIN, IN / NOT IN, vistas',
    preguntas: [
      {
        q: 'Quieres los gamertags de los jugadores del equipo "UdeC Dragons". ¿Cuál consulta es correcta?',
        opts: [
          "SELECT j.gamertag FROM esports.jugador AS j JOIN esports.participa AS p ON j.id_jugador = p.id_jugador JOIN esports.equipo AS e ON p.id_equipo = e.id_equipo WHERE e.nombre_equipo = 'UdeC Dragons';",
          "SELECT j.gamertag FROM esports.jugador AS j JOIN esports.equipo AS e ON j.id_jugador = e.id_equipo WHERE e.nombre_equipo = 'UdeC Dragons';",
          "SELECT j.gamertag FROM esports.jugador AS j JOIN esports.participa AS p ON j.id_jugador = p.id_jugador WHERE e.nombre_equipo = 'UdeC Dragons';",
          "SELECT gamertag FROM esports.jugador WHERE equipo = 'UdeC Dragons';"
        ],
        ok: 0,
        why: 'Hay que pasar por la tabla del medio (participa): 3 tablas, 2 JOIN. La B une columnas que no se relacionan. La C usa el alias e sin declarar la tabla equipo. La D usa una columna que no existe. Devuelve ProGamerX, IceQueen y CyberNinja.'
      },
      {
        q: 'Para listar los nombres de los equipos que compiten en torneos Online usas las tablas equipo, compite y torneo. ¿Cuántos JOIN necesitas?',
        opts: ['1', '2', '3', 'Ninguno, basta con WHERE'],
        ok: 1,
        why: 'Con n tablas se necesitan n − 1 uniones: 3 tablas → 2 JOIN (equipo–compite y compite–torneo). Resultado: Southern Tigers, Cyber Panthers y Biobío Legends.'
      },
      {
        q: 'Esports tiene 7 equipos y cada uno tiene al menos un jugador. ¿Cuántas filas devuelve esta consulta?<pre class="codigo">SELECT e.nombre_equipo, COUNT(*)\nFROM esports.equipo AS e\nJOIN esports.participa AS p ON e.id_equipo = p.id_equipo\nGROUP BY e.nombre_equipo;</pre>',
        opts: ['1', '7', '14', '3'],
        ok: 1,
        why: 'GROUP BY entrega una fila por grupo, y hay 7 equipos. Las 14 son las filas de participa antes de agrupar.'
      },
      {
        q: '¿Qué devuelve esta consulta?<pre class="codigo">SELECT nombre_equipo FROM esports.equipo\nWHERE id_equipo NOT IN\n  (SELECT id_equipo FROM esports.compite);</pre>',
        opts: ['Todos los equipos', 'Los equipos que compiten en algún torneo', 'Los equipos que no compiten en ningún torneo', 'Ninguna fila, por error de sintaxis'],
        ok: 2,
        why: 'La subconsulta lista los equipos que sí están en compite; NOT IN deja los demás. Aquí devuelve solo "Silent Falcons".'
      },
      {
        q: 'Se unen cliente, venta, detalle_venta y producto para calcular cuánto gastó cada cliente (precio × cantidad), ordenado de mayor a menor. ¿Qué cliente aparece primero?',
        opts: ['Diego, con 11.100', 'Juan, con 14.100', 'María, con 15.000', 'Andrea, con 6.000'],
        ok: 2,
        why: 'María hizo 2 compras: venta 1 (2.500 + 2.800 + 1.800 = 7.100) y venta 4 (2 × 2.200 + 3.500 = 7.900), total 15.000. Le sigue Juan con 14.100.'
      },
      {
        q: '¿Cuál afirmación sobre una vista es correcta?',
        opts: [
          'Guarda una copia física de los datos al crearla',
          'Es una consulta guardada con nombre: no almacena datos y se evalúa cada vez que se lee',
          'Solo sirve para insertar filas en varias tablas',
          'Se crea con CREATE TABLE ... AS VIEW'
        ],
        ok: 1,
        why: 'La vista no almacena datos, entrega los actuales cada vez. Se crea con CREATE OR REPLACE VIEW nombre AS SELECT ...'
      },
      {
        q: 'El profe dice que el curso espera la forma por defecto de unir tablas. ¿Cuál es?',
        opts: [
          'FROM a, b WHERE a.x = b.x',
          'FROM a JOIN b ON a.x = b.x',
          'FROM a UNION b',
          'FROM a b WHERE a.x = b.x'
        ],
        ok: 1,
        why: 'La diapositiva del LAB4 dice que se espera JOIN (INNER JOIN) por defecto, dejando el WHERE solo para condiciones. La forma con coma es el "join implícito".'
      }
    ]
  }
];

// ───── Ejercicios de práctica (de los laboratorios) ─────
// base: 'esports' | 'minimarket'. ordCol: índice de la columna que fija el orden pedido.
const EJERCICIOS = [
  // LAB4 · esports
  { id: 'E1', base: 'esports', fuente: 'LAB4 · esports', titulo: 'Año de Valorant', pts: 1,
    enunciado: "Consulta el año de lanzamiento del videojuego 'Valorant'. Muestra solo el año.",
    pistas: ['Una sola tabla: esports.videojuego.', "Filtra con WHERE nombre = 'Valorant'."],
    solucion: "SELECT anio_lanzamiento\nFROM esports.videojuego\nWHERE nombre = 'Valorant';" },
  { id: 'E2', base: 'esports', fuente: 'LAB4 · esports', titulo: 'Equipos por fecha de creación', pts: 1,
    enunciado: 'Lista todos los equipos ordenados por fecha de creación, los más recientes primero. Muestra nombre_equipo y fecha_creacion.',
    ordCol: 1, pistas: ['Los más recientes primero es orden descendente.', 'ORDER BY fecha_creacion DESC.'],
    solucion: 'SELECT nombre_equipo, fecha_creacion\nFROM esports.equipo\nORDER BY fecha_creacion DESC;' },
  { id: 'E3', base: 'esports', fuente: 'LAB4 · esports', titulo: 'Ingenieros que participan en un equipo', pts: 2,
    enunciado: "Muestra el gamertag de los jugadores de la facultad 'Ingeniería' que participan en algún equipo.",
    pistas: ['Jugador no tiene el equipo: pasa por la tabla participa.', 'jugador JOIN participa ON id_jugador, y filtra facultad en WHERE.'],
    solucion: "SELECT DISTINCT j.gamertag\nFROM esports.jugador AS j\nJOIN esports.participa AS p ON j.id_jugador = p.id_jugador\nWHERE j.facultad = 'Ingeniería';" },
  { id: 'E4', base: 'esports', fuente: 'LAB4 · esports', titulo: 'Jugadores por equipo', pts: 2,
    enunciado: 'Cuenta cuántos jugadores tiene cada equipo. Muestra nombre_equipo y la cantidad.',
    pistas: ['"Cada equipo" anuncia un GROUP BY.', 'equipo JOIN participa, COUNT(*) y GROUP BY el nombre del equipo.'],
    solucion: 'SELECT e.nombre_equipo, COUNT(*) AS jugadores\nFROM esports.equipo AS e\nJOIN esports.participa AS p ON e.id_equipo = p.id_equipo\nGROUP BY e.id_equipo, e.nombre_equipo;' },
  { id: 'E5', base: 'esports', fuente: 'LAB4 · esports', titulo: 'Equipos en torneos de más de $500.000', pts: 3,
    enunciado: 'Encuentra los equipos (nombre_equipo, sin repetir) que compiten en torneos con premio mayor a $500.000.',
    pistas: ['Camino: equipo → compite → torneo (2 JOIN).', 'Un equipo puede estar en varios torneos: usa DISTINCT. Número sin puntos: 500000.'],
    solucion: 'SELECT DISTINCT e.nombre_equipo\nFROM esports.equipo AS e\nJOIN esports.compite AS c ON e.id_equipo = c.id_equipo\nJOIN esports.torneo AS t ON c.id_torneo = t.id_torneo\nWHERE t.premio > 500000;' },
  { id: 'E6', base: 'esports', fuente: 'LAB4 · esports', titulo: 'Los 5 torneos con mayor premio', pts: 2,
    enunciado: 'Lista los 5 torneos con mayor premio. Muestra nombre_torneo y premio, del mayor al menor.',
    ordCol: 1, pistas: ['Ordena de mayor a menor.', 'ORDER BY premio DESC LIMIT 5.'],
    solucion: 'SELECT nombre_torneo, premio\nFROM esports.torneo\nORDER BY premio DESC\nLIMIT 5;' },
  { id: 'E7', base: 'esports', fuente: 'LAB4 · esports', titulo: 'Equipos que participan en algún torneo', pts: 2,
    enunciado: 'Calcula el total de equipos que participan en al menos un torneo (un solo número).',
    pistas: ['Un equipo aparece en compite una vez por torneo: no cuentes filas.', 'COUNT(DISTINCT id_equipo) sobre compite.'],
    solucion: 'SELECT COUNT(DISTINCT id_equipo) AS equipos\nFROM esports.compite;' },
  // LAB5 · minimarket
  { id: 'M1', base: 'minimarket', fuente: 'LAB5 · minimarket', titulo: 'Ventas de la más reciente a la más antigua', pts: 1,
    enunciado: 'Lista todas las ventas (id_venta y fecha), ordenadas desde la más reciente a la más antigua.',
    ordCol: 1, pistas: ['ORDER BY fecha con la dirección que pone lo reciente primero.'],
    solucion: 'SELECT id_venta, fecha\nFROM minimarket.venta\nORDER BY fecha DESC;' },
  { id: 'M2', base: 'minimarket', fuente: 'LAB5 · minimarket', titulo: 'Ciudades distintas', pts: 1,
    enunciado: 'Obtén la lista de las distintas ciudades donde residen los clientes, sin repetir ninguna.',
    pistas: ['Para no repetir se usa DISTINCT.'],
    solucion: 'SELECT DISTINCT ciudad\nFROM minimarket.cliente;' },
  { id: 'M3', base: 'minimarket', fuente: 'LAB5 · minimarket', titulo: 'Productos baratos', pts: 1,
    enunciado: 'Lista el nombre y precio de los productos que cuesten $2.000 o menos.',
    pistas: ['"O menos" incluye el 2000: usa <=.', 'Escribe 2000 sin punto.'],
    solucion: 'SELECT nombre, precio\nFROM minimarket.producto\nWHERE precio <= 2000;' },
  { id: 'M4', base: 'minimarket', fuente: 'LAB5 · minimarket', titulo: 'Cuántos productos hay', pts: 1,
    enunciado: '¿Cuántos productos diferentes hay registrados en el catálogo en total? (un solo número)',
    pistas: ['COUNT(*) cuenta filas.'],
    solucion: 'SELECT COUNT(*) AS total_productos\nFROM minimarket.producto;' },
  { id: 'M5', base: 'minimarket', fuente: 'LAB5 · minimarket', titulo: 'Precio promedio', pts: 1,
    enunciado: 'Calcula el precio promedio de todos los productos que se venden en la tienda.',
    pistas: ['AVG(precio).'],
    solucion: 'SELECT AVG(precio) AS precio_promedio\nFROM minimarket.producto;' },
  { id: 'M6', base: 'minimarket', fuente: 'LAB5 · minimarket', titulo: 'Productos por categoría', pts: 2,
    enunciado: 'Muestra el nombre de cada categoría y la cantidad de productos asociados a ella.',
    pistas: ['"Cada categoría" → GROUP BY.', 'producto JOIN categoria ON id_categoria; COUNT(*) y GROUP BY c.nombre.'],
    solucion: 'SELECT c.nombre, COUNT(*) AS cantidad_productos\nFROM minimarket.producto AS p\nJOIN minimarket.categoria AS c ON p.id_categoria = c.id_categoria\nGROUP BY c.nombre;' },
  { id: 'M7', base: 'minimarket', fuente: 'LAB5 · minimarket', titulo: 'Producto más caro', pts: 2,
    enunciado: 'Encuentra el nombre y precio del producto más caro que se vende en la tienda.',
    pistas: ['Hay dos caminos: ORDER BY precio DESC LIMIT 1, o una subconsulta con MAX.'],
    solucion: 'SELECT nombre, precio\nFROM minimarket.producto\nORDER BY precio DESC\nLIMIT 1;\n\n-- Otra forma, con subconsulta:\n-- SELECT nombre, precio FROM minimarket.producto\n-- WHERE precio = (SELECT MAX(precio) FROM minimarket.producto);' },
  { id: 'M8', base: 'minimarket', fuente: 'LAB5 · minimarket', titulo: 'Producto con su categoría', pts: 2,
    enunciado: 'Lista el nombre de cada producto junto con el nombre de la categoría a la que pertenece (dos columnas).',
    pistas: ['producto JOIN categoria ON id_categoria.', 'Los dos se llaman "nombre": usa el alias de tabla (p.nombre, c.nombre).'],
    solucion: 'SELECT p.nombre AS producto, c.nombre AS categoria\nFROM minimarket.producto AS p\nJOIN minimarket.categoria AS c ON p.id_categoria = c.id_categoria;' },
  { id: 'M9', base: 'minimarket', fuente: 'LAB5 · minimarket', titulo: 'Ventas de María Peña', pts: 2,
    enunciado: 'Devuelve el id_venta y la fecha de las ventas asociadas a la cliente "María Peña".',
    pistas: ['venta JOIN cliente ON rut_cliente = rut.', "Filtra nombre = 'María' y apellido = 'Peña' (ojo con la tilde y las comillas simples)."],
    solucion: "SELECT v.id_venta, v.fecha\nFROM minimarket.venta AS v\nJOIN minimarket.cliente AS c ON v.rut_cliente = c.rut\nWHERE c.nombre = 'María' AND c.apellido = 'Peña';" },
  { id: 'M10', base: 'minimarket', fuente: 'LAB5 · minimarket', titulo: 'Los 3 productos más vendidos', pts: 3,
    enunciado: 'Obtén el nombre y el total vendido de los 3 productos más vendidos, ordenados de mayor a menor cantidad.',
    ordCol: 1,
    nota: 'En los datos hay un empate: tres productos con 3 unidades. Se acepta cualquiera de los empatados en los puestos 2 y 3.',
    pistas: ['Camino: producto → detalle_venta. La cantidad vendida es SUM(cantidad).', 'GROUP BY p.nombre, ORDER BY el total DESC, LIMIT 3.'],
    solucion: 'SELECT p.nombre, SUM(d.cantidad) AS total_vendido\nFROM minimarket.producto AS p\nJOIN minimarket.detalle_venta AS d ON p.sku = d.sku\nGROUP BY p.nombre\nORDER BY total_vendido DESC\nLIMIT 3;',
    validar(est, esp, ok) {
      if (est.length !== 3) return 'Debes devolver exactamente 3 filas.';
      if (!ok.filas(est[0], esp[0])) return 'La primera fila debería ser el producto más vendido.';
      const empatados = ['Pan de Molde Blanco', 'Jugo Naranja 1.5L', 'Fideos Espagueti 400g'];
      const otros = est.slice(1);
      if (otros.every(r => empatados.includes(r[0]) && Number(r[1]) === 3) && otros[0][0] !== otros[1][0]) return null;
      return 'Las filas 2 y 3 deben ser dos de los productos con 3 unidades.';
    } }
];

// ───── Ejercicio integrador: Biblioteca (se construye desde cero) ─────
const H = {
  q(db, sql) { const r = db.exec(sql); return r.length ? r[0].values : []; },
  cols(db, t) { return H.q(db, `PRAGMA table_info(${t})`); },
  existe(db, t) { return H.q(db, `SELECT 1 FROM sqlite_master WHERE name='${t}' AND type='table'`).length > 0; },
  falla(db, sql) { db.exec('SAVEPOINT chk'); let f = false; try { db.exec(sql); } catch (e) { f = true; } db.exec('ROLLBACK TO chk; RELEASE chk'); return f; },
  conj(rows) { return rows.map((r) => JSON.stringify(r)).sort(); },
  igualConj(a, b) { return JSON.stringify(H.conj(a)) === JSON.stringify(H.conj(b)); },
  tabla(db, t, req, pk, notNull) {
    if (!H.existe(db, t)) return `Falta crear la tabla ${t}.`;
    const info = H.cols(db, t), nombres = info.map((c) => c[1]);
    const falta = req.filter((c) => !nombres.includes(c));
    if (falta.length) return `A la tabla ${t} le faltan columnas: ${falta.join(', ')}.`;
    const pks = info.filter((c) => c[5] > 0).map((c) => c[1]);
    if (JSON.stringify(pks.slice().sort()) !== JSON.stringify(pk.slice().sort())) return `La clave primaria de ${t} debe ser ${pk.join(', ')}.`;
    const nn = notNull.filter((c) => { const f = info.find((x) => x[1] === c); return !(f && (f[3] === 1 || pks.includes(c))); });
    if (nn.length) return `En ${t} deben ser NOT NULL: ${nn.join(', ')}.`;
    return null;
  }
};
const DATOS_INT = {
  socio: [['11111111-1', 'Ana Soto', 'Ingeniería'], ['22222222-2', 'Luis Rojas', 'Medicina'], ['33333333-3', 'Marta Díaz', 'Ingeniería']],
  libro: [['978-1', 'Bases de Datos', 2019, 3], ['978-2', 'Cálculo I', 2015, 2], ['978-3', 'Rayuela', 1963, 1], ['978-4', 'Algoritmos', 2021, 0]],
  prestamo: [[1, '11111111-1', '978-1', '2026-10-01', '2026-10-08'], [2, '11111111-1', '978-2', '2026-10-05', null], [3, '22222222-2', '978-1', '2026-10-06', null], [4, '33333333-3', '978-3', '2026-10-07', '2026-10-12'], [5, '33333333-3', '978-1', '2026-10-10', null]]
};
const INTEGRADOR = {
  id: 'INT', integrador: true, fuente: 'Ejercicio integrador', titulo: 'Biblioteca: de cero a consultas', pts: 0,
  enunciado: 'Construyes la base de una biblioteca universitaria desde una base vacía: creas las tablas, cargas datos, los modificas, consultas, borras con claves foráneas y terminas con una vista. Cada parte se revisa contra la base que vas armando. Con "Ejecutar" pruebas sin guardar; con "Revisar" se guarda solo si la parte queda bien.',
  partes: [
    { cat: 'DDL', titulo: 'Crear socio',
      html: 'Crea la tabla <code>socio</code> con: <code>rut</code> (texto de hasta 12, clave primaria), <code>nombre</code> (texto de hasta 50, obligatorio) y <code>carrera</code> (texto de hasta 40).',
      pistas: ['CREATE TABLE socio ( ... );', 'La PK va junto a la columna: rut VARCHAR(12) PRIMARY KEY.', 'nombre lleva NOT NULL; carrera no.'],
      solucion: 'CREATE TABLE socio (\n  rut VARCHAR(12) PRIMARY KEY,\n  nombre VARCHAR(50) NOT NULL,\n  carrera VARCHAR(40)\n);',
      check: (db) => H.tabla(db, 'socio', ['rut', 'nombre', 'carrera'], ['rut'], ['nombre']) },
    { cat: 'DDL', titulo: 'Crear libro con CHECK y DEFAULT',
      html: 'Crea la tabla <code>libro</code>: <code>isbn</code> (texto de hasta 17, clave primaria), <code>titulo</code> (obligatorio), <code>anio</code> (entero; solo se aceptan años desde 1900) y <code>copias</code> (entero obligatorio, por defecto 1, nunca negativo).',
      pistas: ['anio INTEGER CHECK (anio >= 1900).', 'copias INTEGER NOT NULL DEFAULT 1 CHECK (copias >= 0).'],
      solucion: 'CREATE TABLE libro (\n  isbn VARCHAR(17) PRIMARY KEY,\n  titulo VARCHAR(100) NOT NULL,\n  anio INTEGER CHECK (anio >= 1900),\n  copias INTEGER NOT NULL DEFAULT 1 CHECK (copias >= 0)\n);',
      check: (db) => {
        const e = H.tabla(db, 'libro', ['isbn', 'titulo', 'anio', 'copias'], ['isbn'], ['titulo', 'copias']);
        if (e) return e;
        if (!H.falla(db, "INSERT INTO libro (isbn, titulo, anio, copias) VALUES ('x','x',1800,1)")) return 'Falta el CHECK: un libro del año 1800 debería rechazarse (anio >= 1900).';
        if (!H.falla(db, "INSERT INTO libro (isbn, titulo, anio, copias) VALUES ('x','x',2000,-1)")) return 'Falta el CHECK: copias negativas deberían rechazarse.';
        if (H.falla(db, "INSERT INTO libro (isbn, titulo, anio, copias) VALUES ('x','x',2000,1)")) return 'Tu CHECK rechaza datos válidos (año 2000 con 1 copia).';
        let v = [];
        db.exec('SAVEPOINT d');
        try { db.exec("INSERT INTO libro (isbn, titulo, anio) VALUES ('d','d',2000)"); v = H.q(db, "SELECT copias FROM libro WHERE isbn='d'"); } catch (e) { /* sin DEFAULT: falla el NOT NULL */ }
        db.exec('ROLLBACK TO d; RELEASE d');
        if (!v.length || v[0][0] !== 1) return 'Falta DEFAULT 1 en copias: al insertar un libro sin copias debería quedar en 1.';
        return null;
      } },
    { cat: 'DDL', titulo: 'Crear prestamo con claves foráneas',
      html: 'Crea <code>prestamo</code>: <code>id_prestamo</code> (entero, clave primaria), <code>rut_socio</code> (FK a socio; si se borra el socio, se borran sus préstamos), <code>isbn</code> (FK a libro; no se puede borrar un libro con préstamos), <code>fecha_prestamo</code> (DATE obligatoria) y <code>fecha_devolucion</code> (DATE, puede ser NULL).',
      pistas: ['Dos FOREIGN KEY ... REFERENCES ..., una por cada tabla padre.', 'Socio: ON DELETE CASCADE. Libro: ON DELETE RESTRICT.', 'Sin coma después de la última línea.'],
      solucion: 'CREATE TABLE prestamo (\n  id_prestamo INTEGER PRIMARY KEY,\n  rut_socio VARCHAR(12) NOT NULL,\n  isbn VARCHAR(17) NOT NULL,\n  fecha_prestamo DATE NOT NULL,\n  fecha_devolucion DATE,\n  FOREIGN KEY (rut_socio) REFERENCES socio(rut)\n    ON DELETE CASCADE,\n  FOREIGN KEY (isbn) REFERENCES libro(isbn)\n    ON DELETE RESTRICT\n);',
      check: (db) => {
        const e = H.tabla(db, 'prestamo', ['id_prestamo', 'rut_socio', 'isbn', 'fecha_prestamo', 'fecha_devolucion'], ['id_prestamo'], ['fecha_prestamo']);
        if (e) return e;
        const fd = H.cols(db, 'prestamo').find((c) => c[1] === 'fecha_devolucion');
        if (fd[3] === 1) return 'fecha_devolucion debe admitir NULL (un préstamo sin devolver).';
        const fk = H.q(db, 'PRAGMA foreign_key_list(prestamo)');
        const a = fk.find((r) => r[3] === 'rut_socio' && String(r[2]).toLowerCase() === 'socio');
        if (!a) return 'rut_socio debe ser FOREIGN KEY hacia socio.';
        if (a[6] !== 'CASCADE') return 'La FK de rut_socio debe ser ON DELETE CASCADE.';
        const b = fk.find((r) => r[3] === 'isbn' && String(r[2]).toLowerCase() === 'libro');
        if (!b) return 'isbn debe ser FOREIGN KEY hacia libro.';
        if (!['RESTRICT', 'NO ACTION'].includes(b[6])) return 'La FK de isbn debe ser ON DELETE RESTRICT.';
        return null;
      } },
    { cat: 'DML', titulo: 'Insertar los datos',
      html: 'Inserta estos datos. <b>Los padres primero</b>. A Rayuela no le des el valor de copias: debe quedar con el DEFAULT.' +
        '<table><tr><th>socio</th><th>rut</th><th>nombre</th><th>carrera</th></tr><tr><td></td><td>11111111-1</td><td>Ana Soto</td><td>Ingeniería</td></tr><tr><td></td><td>22222222-2</td><td>Luis Rojas</td><td>Medicina</td></tr><tr><td></td><td>33333333-3</td><td>Marta Díaz</td><td>Ingeniería</td></tr></table>' +
        '<table><tr><th>libro</th><th>isbn</th><th>titulo</th><th>anio</th><th>copias</th></tr><tr><td></td><td>978-1</td><td>Bases de Datos</td><td>2019</td><td>3</td></tr><tr><td></td><td>978-2</td><td>Cálculo I</td><td>2015</td><td>2</td></tr><tr><td></td><td>978-3</td><td>Rayuela</td><td>1963</td><td><i>(por defecto)</i></td></tr><tr><td></td><td>978-4</td><td>Algoritmos</td><td>2021</td><td>0</td></tr></table>' +
        '<table><tr><th>prestamo</th><th>id</th><th>rut_socio</th><th>isbn</th><th>fecha_prestamo</th><th>fecha_devolucion</th></tr><tr><td></td><td>1</td><td>11111111-1</td><td>978-1</td><td>2026-10-01</td><td>2026-10-08</td></tr><tr><td></td><td>2</td><td>11111111-1</td><td>978-2</td><td>2026-10-05</td><td>NULL</td></tr><tr><td></td><td>3</td><td>22222222-2</td><td>978-1</td><td>2026-10-06</td><td>NULL</td></tr><tr><td></td><td>4</td><td>33333333-3</td><td>978-3</td><td>2026-10-07</td><td>2026-10-12</td></tr><tr><td></td><td>5</td><td>33333333-3</td><td>978-1</td><td>2026-10-10</td><td>NULL</td></tr></table>',
      pistas: ['Orden: socio y libro primero, prestamo al final (tiene FK a los dos).', 'Puedes poner varias filas en un solo INSERT separándolas con coma.', "Para Rayuela usa INSERT INTO libro (isbn, titulo, anio) VALUES (...); sin la columna copias."],
      solucion: "INSERT INTO socio (rut, nombre, carrera) VALUES\n  ('11111111-1', 'Ana Soto', 'Ingeniería'),\n  ('22222222-2', 'Luis Rojas', 'Medicina'),\n  ('33333333-3', 'Marta Díaz', 'Ingeniería');\n\nINSERT INTO libro (isbn, titulo, anio, copias) VALUES\n  ('978-1', 'Bases de Datos', 2019, 3),\n  ('978-2', 'Cálculo I', 2015, 2),\n  ('978-4', 'Algoritmos', 2021, 0);\nINSERT INTO libro (isbn, titulo, anio)\n  VALUES ('978-3', 'Rayuela', 1963);\n\nINSERT INTO prestamo VALUES\n  (1, '11111111-1', '978-1', '2026-10-01', '2026-10-08'),\n  (2, '11111111-1', '978-2', '2026-10-05', NULL),\n  (3, '22222222-2', '978-1', '2026-10-06', NULL),\n  (4, '33333333-3', '978-3', '2026-10-07', '2026-10-12'),\n  (5, '33333333-3', '978-1', '2026-10-10', NULL);",
      check: (db) => {
        const s = H.q(db, 'SELECT rut, nombre, carrera FROM socio'), l = H.q(db, 'SELECT isbn, titulo, anio, copias FROM libro'), p = H.q(db, 'SELECT id_prestamo, rut_socio, isbn, fecha_prestamo, fecha_devolucion FROM prestamo');
        if (!H.igualConj(s, DATOS_INT.socio)) return `La tabla socio debe tener exactamente las 3 filas indicadas (tiene ${s.length}).`;
        if (!H.igualConj(l, DATOS_INT.libro)) return `La tabla libro no coincide con lo pedido (tiene ${l.length} filas). Revisa los datos, y que Rayuela quede con copias = 1 por el DEFAULT.`;
        if (!H.igualConj(p, DATOS_INT.prestamo)) return `La tabla prestamo debe tener exactamente las 5 filas indicadas (tiene ${p.length}).`;
        return null;
      } },
    { cat: 'DML', titulo: 'Actualizar una devolución',
      html: 'Ana devolvió "Cálculo I" el <b>2026-10-12</b>. Actualiza la <code>fecha_devolucion</code> del préstamo 2 y no toques ningún otro.',
      pistas: ['UPDATE tabla SET columna = valor WHERE condición;', 'Filtra por la clave: WHERE id_prestamo = 2. Sin WHERE cambiarías todos.'],
      solucion: "UPDATE prestamo\nSET fecha_devolucion = '2026-10-12'\nWHERE id_prestamo = 2;",
      check: (db) => {
        const esp = DATOS_INT.prestamo.map((r) => (r[0] === 2 ? [2, r[1], r[2], r[3], '2026-10-12'] : r));
        const p = H.q(db, 'SELECT id_prestamo, rut_socio, isbn, fecha_prestamo, fecha_devolucion FROM prestamo');
        return H.igualConj(p, esp) ? null : 'Solo el préstamo 2 debe cambiar a 2026-10-12. Revisa el WHERE.';
      } },
    { cat: 'DDL', titulo: 'Agregar una columna',
      html: 'Agrega a <code>socio</code> la columna <code>email</code> (texto de hasta 50). Los socios actuales quedarán con NULL en ella.',
      pistas: ['ALTER TABLE tabla ADD COLUMN nombre tipo;'],
      solucion: 'ALTER TABLE socio\nADD COLUMN email VARCHAR(50);',
      check: (db) => (H.cols(db, 'socio').some((c) => c[1] === 'email') ? null : 'La tabla socio todavía no tiene la columna email.') },
    { cat: 'Consulta', titulo: 'Préstamos sin devolver (JOIN)', ordCol: null, req: ['socio', 'prestamo', 'libro'],
      html: 'Muestra el <code>nombre</code> del socio y el <code>titulo</code> del libro de los préstamos que <b>aún no se devuelven</b> (<code>fecha_devolucion</code> es NULL).',
      pistas: ['Camino: socio → prestamo → libro (2 JOIN).', 'Para NULL se usa IS NULL, no = NULL.'],
      solucion: 'SELECT s.nombre, l.titulo\nFROM socio AS s\nJOIN prestamo AS p ON s.rut = p.rut_socio\nJOIN libro AS l ON p.isbn = l.isbn\nWHERE p.fecha_devolucion IS NULL;',
      esperado: [['Luis Rojas', 'Bases de Datos'], ['Marta Díaz', 'Bases de Datos']] },
    { cat: 'Consulta', titulo: 'Préstamos por socio (GROUP BY)', ordCol: 1, req: ['socio', 'prestamo'],
      html: 'Muestra el <code>nombre</code> de cada socio y la cantidad de préstamos que ha hecho, de mayor a menor cantidad.',
      pistas: ['"Cada socio" → GROUP BY.', 'COUNT(*) y ORDER BY ese conteo DESC.'],
      solucion: 'SELECT s.nombre, COUNT(*) AS prestamos\nFROM socio AS s\nJOIN prestamo AS p ON s.rut = p.rut_socio\nGROUP BY s.rut, s.nombre\nORDER BY prestamos DESC;',
      esperado: [['Ana Soto', 2], ['Marta Díaz', 2], ['Luis Rojas', 1]] },
    { cat: 'Consulta', titulo: 'El libro más prestado (LIMIT)', ordCol: null, req: ['libro', 'prestamo'],
      html: 'Muestra el <code>titulo</code> del libro más prestado y cuántas veces se prestó (una sola fila).',
      pistas: ['libro JOIN prestamo; cuenta por libro.', 'ORDER BY el conteo DESC LIMIT 1.'],
      solucion: 'SELECT l.titulo, COUNT(*) AS total\nFROM libro AS l\nJOIN prestamo AS p ON l.isbn = p.isbn\nGROUP BY l.isbn, l.titulo\nORDER BY total DESC\nLIMIT 1;',
      esperado: [['Bases de Datos', 3]] },
    { cat: 'DML', titulo: 'Borrar con CASCADE',
      html: 'Marta (RUT 33333333-3) se retira. Bórrala de <code>socio</code>: sus préstamos deben desaparecer solos por el CASCADE.',
      pistas: ['DELETE FROM socio WHERE rut = ...;', 'No borres los préstamos a mano: la FK lo hace.'],
      solucion: "DELETE FROM socio\nWHERE rut = '33333333-3';",
      check: (db) => {
        const s = H.q(db, 'SELECT rut FROM socio').map((r) => r[0]).sort();
        if (JSON.stringify(s) !== JSON.stringify(['11111111-1', '22222222-2'])) return 'Deben quedar solo Ana y Luis en socio.';
        const p = H.q(db, 'SELECT id_prestamo FROM prestamo').map((r) => r[0]).sort();
        return JSON.stringify(p) === JSON.stringify([1, 2, 3]) ? null : 'Los préstamos de Marta (4 y 5) deberían haberse borrado en cascada; quedan: ' + p.join(', ') + '.';
      } },
    { cat: 'DML', titulo: 'Borrar con RESTRICT',
      html: 'Primero <b>intenta borrar el libro 978-1</b> con "Ejecutar" y lee el error (hay préstamos que lo usan: RESTRICT). Después borra el libro 978-4, que nadie ha pedido, y "Revisa".',
      pistas: ['Un DELETE FROM libro WHERE isbn = ... por cada libro.', 'El de 978-1 debe fallar; en "Revisar" envía solo el de 978-4.'],
      solucion: "-- DELETE FROM libro WHERE isbn = '978-1';  -- falla por RESTRICT\nDELETE FROM libro\nWHERE isbn = '978-4';",
      check: (db) => {
        const l = H.q(db, 'SELECT isbn FROM libro').map((r) => r[0]).sort();
        return JSON.stringify(l) === JSON.stringify(['978-1', '978-2', '978-3']) ? null : 'Debe borrarse solo el libro 978-4. Quedan: ' + l.join(', ') + '.';
      } },
    { cat: 'Vista', titulo: 'Crear una vista', req: ['socio', 'prestamo', 'libro'],
      html: 'Crea la vista <code>prestamos_activos</code> con el <code>nombre</code> del socio y el <code>titulo</code> del libro de los préstamos sin devolver (la consulta de la parte 7).',
      pistas: ['CREATE OR REPLACE VIEW nombre AS SELECT ...;', 'Es la misma consulta de la parte 7.'],
      solucion: 'CREATE OR REPLACE VIEW prestamos_activos AS\nSELECT s.nombre, l.titulo\nFROM socio AS s\nJOIN prestamo AS p ON s.rut = p.rut_socio\nJOIN libro AS l ON p.isbn = l.isbn\nWHERE p.fecha_devolucion IS NULL;',
      check: (db) => {
        if (!H.q(db, "SELECT 1 FROM sqlite_master WHERE type='view' AND name='prestamos_activos'").length) return 'No existe la vista prestamos_activos.';
        let r; try { r = db.exec('SELECT * FROM prestamos_activos'); } catch (e) { return 'La vista da error al consultarla: ' + e.message; }
        const v = r.length ? r[0].values : [];
        if (r.length && r[0].columns.length !== 2) return 'La vista debe tener 2 columnas: nombre y titulo.';
        return H.igualConj(v, [['Luis Rojas', 'Bases de Datos']]) ? null : 'La vista debería mostrar solo el préstamo sin devolver que queda (Luis, Bases de Datos).';
      } }
  ]
};
