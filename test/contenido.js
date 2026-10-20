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
