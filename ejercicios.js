// Bases de datos y ejercicios tipo certamen (TI, UdeC 2026-2).
// Cada base tiene sus tablas en orden padre → hijo, para poder insertar con las FK activas.

const BASES = {
  universidad: {
    nombre: 'Universidad',
    fuente: 'M2.3 (la del PDF de SQL)',
    tablas: [
      {
        nombre: 'Students',
        create: `CREATE TABLE Students (
  sID   INTEGER PRIMARY KEY,
  sName TEXT,
  age   INTEGER
)`,
        filas: [
          [53666, 'José', 18],
          [53688, 'Fran', 22],
          [53650, 'Andrea', 21],
          [54000, 'Pedro', 35],
          [55235, 'Javiera', 28],
        ],
      },
      {
        nombre: 'Courses',
        create: `CREATE TABLE Courses (
  cID   TEXT PRIMARY KEY,
  cName TEXT
)`,
        filas: [
          ['ing7', 'Siscom'],
          ['ec5', 'Economy'],
          ['eng4', 'English'],
          ['spa1', 'Spanish'],
        ],
      },
      {
        nombre: 'Enrolled',
        create: `CREATE TABLE Enrolled (
  sID   INTEGER,
  cID   TEXT,
  grade REAL NOT NULL,
  PRIMARY KEY (sID, cID),
  FOREIGN KEY (sID) REFERENCES Students(sID),
  FOREIGN KEY (cID) REFERENCES Courses(cID)
)`,
        filas: [
          [53666, 'ing7', 5.0],
          [53666, 'ec5', 6.0],
          [53650, 'ing7', 6.1],
          [53688, 'ing7', 5.8],
          [53666, 'eng4', 5.1],
          [54000, 'ec5', 4.5],
          [55235, 'spa1', 6.5],
        ],
      },
    ],
  },

  accidentes: {
    nombre: 'Accidentes',
    fuente: 'Certamen 2020, pregunta 3',
    nota: 'En participó, rut es quien manejaba. El dueño del auto está en es_dueño: no siempre es la misma persona.',
    tablas: [
      {
        nombre: 'persona',
        create: `CREATE TABLE persona (
  rut       TEXT PRIMARY KEY,
  nombre    TEXT,
  apellido  TEXT,
  dirección TEXT,
  comuna    TEXT
)`,
        filas: [
          ['11.111.111-1', 'Pedro', 'Pérez', 'Los Aromos 12', 'Concepción'],
          ['22.222.222-2', 'Ana', 'Soto', 'Colón 450', 'Talcahuano'],
          ['33.333.333-3', 'Luis', 'Rojas', 'Paicaví 1020', 'Concepción'],
          ['44.444.444-4', 'Pedro', 'Muñoz', 'Las Rosas 8', 'Chiguayante'],
        ],
      },
      {
        nombre: 'auto',
        create: `CREATE TABLE auto (
  patente TEXT PRIMARY KEY,
  color   TEXT,
  modelo  TEXT,
  marca   TEXT,
  año     INTEGER
)`,
        filas: [
          ['AB1234', 'rojo', 'Spark', 'Chevrolet', 2015],
          ['CD5678', 'azul', 'Yaris', 'Toyota', 2018],
          ['EF9012', 'gris', 'Sail', 'Chevrolet', 2019],
          ['GH3456', 'blanco', 'Rio', 'Kia', 2020],
        ],
      },
      {
        nombre: 'accidente',
        create: `CREATE TABLE accidente (
  número_parte TEXT PRIMARY KEY,
  fecha        TEXT,
  lugar        TEXT
)`,
        filas: [
          ['P-001', '2016-03-10', 'Concepción'],
          ['P-002', '2018-11-02', 'Talcahuano'],
          ['P-003', '2020-06-15', 'Concepción'],
          ['P-004', '2020-06-15', 'Coronel'],
          ['P-005', '2021-01-20', 'Concepción'],
          ['P-006', '2014-05-05', 'Lota'],
          ['P-007', '2019-09-18', 'Hualpén'],
        ],
      },
      {
        nombre: 'es_dueño',
        create: `CREATE TABLE es_dueño (
  rut     TEXT,
  patente TEXT,
  PRIMARY KEY (rut, patente),
  FOREIGN KEY (rut) REFERENCES persona(rut),
  FOREIGN KEY (patente) REFERENCES auto(patente)
)`,
        filas: [
          ['11.111.111-1', 'AB1234'],
          ['11.111.111-1', 'CD5678'],
          ['22.222.222-2', 'EF9012'],
          ['44.444.444-4', 'GH3456'],
        ],
      },
      {
        nombre: 'participó',
        create: `CREATE TABLE participó (
  rut          TEXT,
  patente      TEXT,
  número_parte TEXT,
  costo_daños  INTEGER,
  PRIMARY KEY (rut, patente, número_parte),
  FOREIGN KEY (rut) REFERENCES persona(rut),
  FOREIGN KEY (patente) REFERENCES auto(patente),
  FOREIGN KEY (número_parte) REFERENCES accidente(número_parte)
)`,
        filas: [
          ['11.111.111-1', 'AB1234', 'P-001', 300000],
          ['33.333.333-3', 'CD5678', 'P-002', 800000],
          ['22.222.222-2', 'EF9012', 'P-003', 650000],
          ['11.111.111-1', 'AB1234', 'P-003', 120000],
          ['44.444.444-4', 'GH3456', 'P-004', 900000],
          ['22.222.222-2', 'EF9012', 'P-005', 450000],
          ['33.333.333-3', 'EF9012', 'P-006', 200000],
          ['22.222.222-2', 'EF9012', 'P-007', 350000],
        ],
      },
    ],
  },

  mascotas: {
    nombre: 'Mascotas',
    fuente: 'Certamen 2021, preguntas 4 a 7 (datos de la pauta)',
    tablas: [
      {
        nombre: 'USUARIO',
        create: `CREATE TABLE USUARIO (
  RUT      TEXT PRIMARY KEY,
  Nombre   TEXT,
  Telefono TEXT,
  Comuna   TEXT,
  Region   TEXT
)`,
        filas: [
          ['18962085-3', 'Carlos Caro', '161390138', 'La Cisterna', 'RM'],
          ['15582063-2', 'Daniela Núñez', '967775401', 'Corral', 'XIV'],
          ['32440124-5', 'Mario Pérez', '901852470', 'Melipeuco', 'IX'],
          ['43145048-8', 'Carolina Carrera', '905194861', 'Lampa', 'RM'],
          ['7412988-9', 'Isidora Salazar', '229835978', 'Conchalí', 'RM'],
        ],
      },
      {
        nombre: 'RAZA',
        create: `CREATE TABLE RAZA (
  Raza    TEXT PRIMARY KEY,
  Especie TEXT
)`,
        filas: [
          ['Poodle', 'Canino'],
          ['Mestizo', 'Canino'],
          ['Dachshund', 'Canino'],
          ['Siames', 'Felino'],
          ['Persa', 'Felino'],
          ['Común', 'Felino'],
        ],
      },
      {
        nombre: 'DOMICILIO_ANIMAL',
        create: `CREATE TABLE DOMICILIO_ANIMAL (
  id_domicilio INTEGER PRIMARY KEY,
  Region       TEXT,
  Comuna       TEXT,
  Domicilio    TEXT
)`,
        filas: [
          [100, 'RM', 'La Cisterna', 'P.O. Box 926, 7826 Mi Rd.'],
          [101, 'XIV', 'Corral', 'Ap #655-9203 Semper Av.'],
          [102, 'IX', 'Melipeuco', "O'higgins 452"],
          [103, 'RM', 'La Cisterna', 'Los pensamientos 678'],
          [104, 'RM', 'Conchalí', 'Alerces 452, Depto 501'],
        ],
      },
      {
        nombre: 'ANIMAL',
        create: `CREATE TABLE ANIMAL (
  Microchip        INTEGER PRIMARY KEY,
  Nombre_Animal    TEXT,
  sexo             TEXT,
  color            TEXT,
  fecha_nacimiento TEXT,
  id_domicilio     INTEGER,
  Raza             TEXT,
  FOREIGN KEY (id_domicilio) REFERENCES DOMICILIO_ANIMAL(id_domicilio),
  FOREIGN KEY (Raza) REFERENCES RAZA(Raza)
)`,
        filas: [
          [236578, 'Boby', 'Macho', 'Negro-café', '2015-08-09', 100, 'Mestizo'],
          [100234, 'Chica', 'Hembra', 'Caramelo', '2017-06-30', 101, 'Persa'],
          [345890, 'Blanca', 'Hembra', 'Blanco', '2014-02-17', 102, 'Siames'],
          [145670, 'Pepe', 'Macho', 'Café', '2018-08-23', 103, 'Dachshund'],
          [876123, 'Thor', 'Macho', 'Negro', '2019-02-06', 104, 'Poodle'],
        ],
      },
      {
        nombre: 'SOLICITUD',
        create: `CREATE TABLE SOLICITUD (
  id_solicitud TEXT PRIMARY KEY,
  fecha        TEXT,
  estado       TEXT,
  RUT          TEXT,
  Microchip    INTEGER,
  FOREIGN KEY (RUT) REFERENCES USUARIO(RUT),
  FOREIGN KEY (Microchip) REFERENCES ANIMAL(Microchip)
)`,
        filas: [
          ['0101', '2020-02-01', 'aprobado', '18962085-3', 236578],
          ['0102', '2020-06-03', 'rechazado', '15582063-2', 100234],
          ['0103', '2020-07-10', 'aprobado', '32440124-5', 345890],
          ['0104', '2020-08-01', 'aprobado', '15582063-2', 145670],
          ['0105', '2020-10-30', 'enviada', '7412988-9', 876123],
        ],
      },
    ],
  },

  proyectos: {
    nombre: 'Proyectos',
    fuente: 'Certamen 2018, pregunta III',
    nota: 'Proyecto y Asignado tienen las dos una columna Fecha_Inicio: si las usas sin tabla adelante, SQL no sabe cuál es.',
    tablas: [
      {
        nombre: 'Plan',
        create: `CREATE TABLE Plan (
  Cod_plan             TEXT PRIMARY KEY,
  Nombre               TEXT,
  Entidad_Financiadora TEXT
)`,
        filas: [
          ['PEUR', 'Plan Europa', 'Unión Europea'],
          ['FON', 'Fondecyt', 'ANID'],
          ['COR', 'Corfo Innova', 'Corfo'],
        ],
      },
      {
        nombre: 'Proyecto',
        create: `CREATE TABLE Proyecto (
  Codigo_Proyecto INTEGER PRIMARY KEY,
  Cod_Plan        TEXT,
  Nombre          TEXT,
  Fecha_Inicio    TEXT,
  Fecha_Fin       TEXT,
  Presupuesto     INTEGER,
  FOREIGN KEY (Cod_Plan) REFERENCES Plan(Cod_plan)
)`,
        filas: [
          [1, 'PEUR', 'Neptuno', '2018-03-01', '2019-12-31', 150000],
          [2, 'PEUR', 'Marte', '2017-05-10', '2018-05-10', 90000],
          [3, 'FON', 'Júpiter', '2018-07-15', '2020-07-15', 300000],
          [4, 'COR', 'Saturno', '2016-01-01', '2017-01-01', 120000],
          [5, 'PEUR', 'Venus', '2018-09-01', '2019-09-01', 80000],
        ],
      },
      {
        nombre: 'Investigador',
        create: `CREATE TABLE Investigador (
  RUT_Investigador TEXT PRIMARY KEY,
  Nombre           TEXT,
  Ciudad           TEXT,
  Telefono         TEXT
)`,
        filas: [
          ['11-1', 'Ana Díaz', 'Santiago', '911111111'],
          ['22-2', 'Bruno Vera', 'Concepción', '922222222'],
          ['33-3', 'Carla Ruiz', 'Valdivia', '933333333'],
          ['44-4', 'Diego Paz', 'Santiago', '944444444'],
        ],
      },
      {
        nombre: 'Asignado',
        create: `CREATE TABLE Asignado (
  Codigo_Proyecto  INTEGER,
  RUT_Investigador TEXT,
  Fecha_Inicio     TEXT,
  Fecha_Fin        TEXT,
  PRIMARY KEY (Codigo_Proyecto, RUT_Investigador),
  FOREIGN KEY (Codigo_Proyecto) REFERENCES Proyecto(Codigo_Proyecto),
  FOREIGN KEY (RUT_Investigador) REFERENCES Investigador(RUT_Investigador)
)`,
        filas: [
          [1, '22-2', '2018-04-01', '2019-12-31'],
          [1, '11-1', '2018-06-01', '2019-06-01'],
          [2, '33-3', '2017-05-10', '2018-05-10'],
          [3, '44-4', '2018-08-01', '2020-07-15'],
          [4, '33-3', '2016-02-01', '2017-01-01'],
          [5, '22-2', '2018-09-15', '2019-09-01'],
        ],
      },
    ],
  },
};

// tipo: 'select' (se compara el resultado), 'dml' (se compara cómo quedan las tablas),
// 'create' (se revisa la estructura de la tabla), 'error' (tiene que fallar por una FK).
const EJERCICIOS = [
  // ───────── Universidad (M2.3) ─────────
  {
    id: 'U1', base: 'universidad', tipo: 'select', pts: 2, nivel: '1 tabla',
    titulo: 'Estudiantes mayores de 20',
    enunciado: 'Liste los nombres de los estudiantes que tienen más de 20 años.',
    pistas: ['Todo está en una tabla: Students.', 'SELECT columna FROM tabla WHERE condición;'],
    solucion: `SELECT sName
FROM Students
WHERE age > 20;`,
  },
  {
    id: 'U2', base: 'universidad', tipo: 'select', pts: 2, nivel: '1 tabla',
    titulo: 'Notas del curso ec5',
    enunciado: "Liste el sID y la nota de las inscripciones del curso 'ec5' que tienen nota mayor o igual a 5.0.",
    pistas: ['Todo está en Enrolled.', 'Dos condiciones unidas con AND. El texto va entre comillas simples.'],
    solucion: `SELECT sID, grade
FROM Enrolled
WHERE cID = 'ec5' AND grade >= 5.0;`,
  },
  {
    id: 'U3', base: 'universidad', tipo: 'select', pts: 3, nivel: '2 tablas',
    titulo: 'Cursos con notas sobre 6.0',
    enunciado: 'Liste los nombres de los cursos que tienen al menos una nota mayor a 6.0.',
    pistas: ['El nombre del curso está en Courses y la nota en Enrolled.', 'Con 2 tablas va 1 unión: Courses.cID = Enrolled.cID.'],
    solucion: `SELECT DISTINCT Courses.cName
FROM Courses, Enrolled
WHERE Courses.cID = Enrolled.cID
  AND Enrolled.grade > 6.0;`,
  },
  {
    id: 'U4', base: 'universidad', tipo: 'select', pts: 4, nivel: '3 tablas',
    titulo: 'Inscritos en Siscom',
    enunciado: "Liste los nombres de los estudiantes inscritos en el curso 'Siscom'.",
    pistas: ['El nombre está en Students, "Siscom" está en Courses y lo que las conecta es Enrolled.', 'Con 3 tablas van 2 uniones, más el filtro.'],
    solucion: `SELECT Students.sName
FROM Students, Enrolled, Courses
WHERE Students.sID = Enrolled.sID
  AND Enrolled.cID = Courses.cID
  AND Courses.cName = 'Siscom';`,
  },
  {
    id: 'U5', base: 'universidad', tipo: 'select', pts: 4, nivel: '3 tablas',
    titulo: 'Cursos y notas de José',
    enunciado: 'Liste el nombre del curso y la nota de cada inscripción de José.',
    pistas: ['Piden dos columnas: Courses.cName y Enrolled.grade.', 'El filtro es Students.sName = \'José\'.'],
    solucion: `SELECT Courses.cName, Enrolled.grade
FROM Students, Enrolled, Courses
WHERE Students.sID = Enrolled.sID
  AND Enrolled.cID = Courses.cID
  AND Students.sName = 'José';`,
  },
  {
    id: 'U6', base: 'universidad', tipo: 'dml', pts: 3, nivel: 'INSERT',
    titulo: 'Inscribir a Pedro',
    enunciado: 'Inscriba a Pedro (sID 54000) en el curso Siscom (cID ing7) con nota 5.5.',
    revisar: ['Enrolled'],
    pistas: ['INSERT INTO tabla (columnas) VALUES (valores);', 'El cID es texto: va entre comillas simples.'],
    solucion: `INSERT INTO Enrolled (sID, cID, grade)
VALUES (54000, 'ing7', 5.5);`,
  },
  {
    id: 'U7', base: 'universidad', tipo: 'dml', pts: 3, nivel: 'UPDATE',
    titulo: 'Subir las notas de ing7',
    enunciado: 'Suba en 0.5 la nota de todas las inscripciones del curso ing7.',
    revisar: ['Enrolled'],
    pistas: ['UPDATE tabla SET columna = nuevo_valor WHERE condición;', 'El nuevo valor se puede calcular: grade + 0.5.'],
    solucion: `UPDATE Enrolled
SET grade = grade + 0.5
WHERE cID = 'ing7';`,
  },
  {
    id: 'U8', base: 'universidad', tipo: 'dml', pts: 3, nivel: 'DELETE',
    titulo: 'Borrar notas bajas',
    enunciado: 'Borre las inscripciones con nota menor a 5.5.',
    revisar: ['Enrolled'],
    pistas: ['DELETE FROM tabla WHERE condición;', 'Sin WHERE borrarías todas las filas.'],
    solucion: `DELETE FROM Enrolled
WHERE grade < 5.5;`,
  },
  {
    id: 'U9', base: 'universidad', tipo: 'create', pts: 4, nivel: 'CREATE TABLE',
    titulo: 'Crear la tabla Enrolled',
    enunciado: 'Cree la tabla Enrolled(sID, cID, grade). La PK es (sID, cID), sID es FK hacia Students, cID es FK hacia Courses y grade es obligatorio.',
    tabla: 'Enrolled',
    requisitos: {
      columnas: ['sID', 'cID', 'grade'],
      pk: ['sID', 'cID'],
      fk: [{ col: 'sID', tabla: 'Students' }, { col: 'cID', tabla: 'Courses' }],
      notnull: ['grade'],
    },
    pistas: ['PRIMARY KEY (a, b) para una PK compuesta.', 'FOREIGN KEY (col) REFERENCES Tabla(col), una por cada FK. NOT NULL va al lado del tipo.'],
    solucion: `CREATE TABLE Enrolled (
  sID   INTEGER,
  cID   TEXT,
  grade REAL NOT NULL,
  PRIMARY KEY (sID, cID),
  FOREIGN KEY (sID) REFERENCES Students(sID),
  FOREIGN KEY (cID) REFERENCES Courses(cID)
);`,
  },
  {
    id: 'U10', base: 'universidad', tipo: 'error', pts: 2, nivel: 'Integridad',
    titulo: 'Un estudiante que no existe',
    enunciado: 'Intente inscribir al estudiante 99999 (no está en Students) en el curso ing7 con nota 6.0. Ejecute el INSERT y observe qué pasa.',
    esperado: /FOREIGN KEY/i,
    pistas: ['Escribe el INSERT normal en Enrolled.', 'La gracia es ver el error: la FK sID tiene que existir en Students.'],
    solucion: `INSERT INTO Enrolled (sID, cID, grade)
VALUES (99999, 'ing7', 6.0);`,
    explicacion: 'Se rechaza, con cualquier política (RESTRICT, CASCADE o NULLIFY): una FK no puede apuntar a un valor que no existe en la tabla padre. Las políticas solo deciden qué pasa cuando cambias o borras al padre.',
  },

  // ───────── Accidentes (Certamen 2020, P3) ─────────
  {
    id: 'A1', base: 'accidentes', tipo: 'select', pts: 2, nivel: '2 tablas', certamen: '2020 P3 a',
    titulo: 'Autos con daños sobre 500.000',
    enunciado: 'Liste el modelo de los autos que generaron costos de daños por sobre los 500.000.',
    pistas: ['El modelo está en auto y el costo en participó.', 'Ojo: 500.000 se escribe 500000, sin punto.'],
    solucion: `SELECT DISTINCT auto.modelo
FROM auto, participó
WHERE auto.patente = participó.patente
  AND participó.costo_daños > 500000;`,
  },
  {
    id: 'A2', base: 'accidentes', tipo: 'select', pts: 2, nivel: '4 tablas', certamen: '2020 P3 b',
    titulo: 'Accidentes de los vehículos de Pedro Pérez',
    enunciado: 'Liste los lugares donde han tenido accidentes los vehículos de Pedro Pérez.',
    pistas: ['"Los vehículos de Pedro Pérez" son los que él tiene en es_dueño (no los que manejó).', 'Camino: persona → es_dueño → participó → accidente. Filtra por nombre Y apellido: hay dos Pedro.'],
    solucion: `SELECT DISTINCT accidente.lugar
FROM persona, es_dueño, participó, accidente
WHERE persona.rut = es_dueño.rut
  AND es_dueño.patente = participó.patente
  AND participó.número_parte = accidente.número_parte
  AND persona.nombre = 'Pedro'
  AND persona.apellido = 'Pérez';`,
  },
  {
    id: 'A3', base: 'accidentes', tipo: 'select', pts: 2, nivel: '2 tablas', certamen: '2020 P3 c',
    titulo: 'Daños del 15/06/2020 en Concepción',
    enunciado: 'Liste los costos de los daños de los accidentes del 15/06/2020 en Concepción.',
    pistas: ['Las fechas están guardadas como texto AAAA-MM-DD: \'2020-06-15\'.', 'Ese día hubo dos accidentes, pero solo uno en Concepción.'],
    solucion: `SELECT participó.costo_daños
FROM participó, accidente
WHERE participó.número_parte = accidente.número_parte
  AND accidente.fecha = '2020-06-15'
  AND accidente.lugar = 'Concepción';`,
  },
  {
    id: 'A4', base: 'accidentes', tipo: 'select', pts: 2, nivel: '3 tablas', certamen: '2020 P3 d',
    titulo: 'Accidentes 2015–2019 de autos Chevrolet',
    enunciado: 'Liste el número de parte de los accidentes ocurridos entre 2015 y 2019 por autos marca Chevrolet.',
    pistas: ['"Entre 2015 y 2019" es desde el 2015-01-01 hasta el 2019-12-31.', 'BETWEEN \'2015-01-01\' AND \'2019-12-31\' sirve. Camino: auto → participó → accidente.'],
    solucion: `SELECT DISTINCT accidente.número_parte
FROM accidente, participó, auto
WHERE accidente.número_parte = participó.número_parte
  AND participó.patente = auto.patente
  AND auto.marca = 'Chevrolet'
  AND accidente.fecha BETWEEN '2015-01-01' AND '2019-12-31';`,
  },
  {
    id: 'A5', base: 'accidentes', tipo: 'create', pts: 2, nivel: 'CREATE TABLE', certamen: '2020 P3 e',
    titulo: 'Crear la tabla participó',
    enunciado: 'Cree la tabla participó(rut, patente, número_parte, costo_daños). La PK son las tres primeras columnas, y cada una es FK hacia persona, auto y accidente.',
    tabla: 'participó',
    requisitos: {
      columnas: ['rut', 'patente', 'número_parte', 'costo_daños'],
      pk: ['rut', 'patente', 'número_parte'],
      fk: [{ col: 'rut', tabla: 'persona' }, { col: 'patente', tabla: 'auto' }, { col: 'número_parte', tabla: 'accidente' }],
      notnull: [],
    },
    pistas: ['PRIMARY KEY (rut, patente, número_parte).', 'Tres FOREIGN KEY ... REFERENCES, una por cada tabla padre.'],
    solucion: `CREATE TABLE participó (
  rut          TEXT,
  patente      TEXT,
  número_parte TEXT,
  costo_daños  INTEGER,
  PRIMARY KEY (rut, patente, número_parte),
  FOREIGN KEY (rut) REFERENCES persona(rut),
  FOREIGN KEY (patente) REFERENCES auto(patente),
  FOREIGN KEY (número_parte) REFERENCES accidente(número_parte)
);`,
  },
  {
    id: 'A6', base: 'accidentes', tipo: 'select', pts: 3, nivel: '4 tablas',
    titulo: 'Dueños con accidentes en Concepción',
    enunciado: 'Liste el nombre y apellido de los dueños de autos que tuvieron accidentes en Concepción.',
    pistas: ['"Dueños" otra vez significa es_dueño, no quien manejaba.', 'Camino: persona → es_dueño → participó → accidente. Usa DISTINCT: un dueño puede salir varias veces.'],
    solucion: `SELECT DISTINCT persona.nombre, persona.apellido
FROM persona, es_dueño, participó, accidente
WHERE persona.rut = es_dueño.rut
  AND es_dueño.patente = participó.patente
  AND participó.número_parte = accidente.número_parte
  AND accidente.lugar = 'Concepción';`,
  },

  // ───────── Mascotas (Certamen 2021) ─────────
  {
    id: 'M1', base: 'mascotas', tipo: 'select', pts: 3, nivel: '3 tablas', certamen: '2021 P5 (adaptada)',
    titulo: 'Mascotas de Daniela Núñez',
    enunciado: 'Liste el o los nombres de las mascotas de la usuaria Daniela Núñez. (La pauta pedía las de "Camila Contreras", que no está en los datos.)',
    pistas: ['Camino: USUARIO → SOLICITUD → ANIMAL.', 'Une por RUT y por Microchip.'],
    solucion: `SELECT ANIMAL.Nombre_Animal
FROM ANIMAL, SOLICITUD, USUARIO
WHERE USUARIO.Nombre = 'Daniela Núñez'
  AND USUARIO.RUT = SOLICITUD.RUT
  AND SOLICITUD.Microchip = ANIMAL.Microchip;`,
  },
  {
    id: 'M2', base: 'mascotas', tipo: 'dml', pts: 3, nivel: 'INSERT', certamen: '2021 P6',
    titulo: 'Nueva solicitud de Mario Pérez',
    enunciado: "Inserte la nueva solicitud '0106' de Mario Pérez (RUT 32440124-5), con fecha 2021-06-07 y estado 'enviada', para un perro Poodle. El microchip es 1525958, se llama Amalfi, es macho, de color Blanco, nació el 2021-03-03 y vive en O'higgins 452, Melipeuco (id_domicilio 102).",
    revisar: ['ANIMAL', 'SOLICITUD'],
    pistas: ['Son dos INSERT. ¿Cuál va primero? El padre: ANIMAL, porque SOLICITUD lo referencia.', "Escribe los textos entre comillas simples: 'Amalfi', 'Macho', 'Blanco'."],
    solucion: `INSERT INTO ANIMAL (Microchip, Nombre_Animal, sexo, color, fecha_nacimiento, id_domicilio, Raza)
VALUES (1525958, 'Amalfi', 'Macho', 'Blanco', '2021-03-03', 102, 'Poodle');

INSERT INTO SOLICITUD (id_solicitud, fecha, estado, RUT, Microchip)
VALUES ('0106', '2021-06-07', 'enviada', '32440124-5', 1525958);`,
  },
  {
    id: 'M3', base: 'mascotas', tipo: 'select', pts: 4, nivel: '4 tablas', certamen: '2021 P7 (adaptada)',
    titulo: 'Dueños de animales de la RM',
    enunciado: "Liste los nombres de los dueños de los animales que viven en la Región RM. (La pauta preguntaba por la VIII, donde no vive ningún animal.)",
    pistas: ['Camino: USUARIO → SOLICITUD → ANIMAL → DOMICILIO_ANIMAL.', 'La región que importa es la del domicilio del animal, no la del usuario.'],
    solucion: `SELECT DISTINCT USUARIO.Nombre
FROM USUARIO, SOLICITUD, ANIMAL, DOMICILIO_ANIMAL
WHERE USUARIO.RUT = SOLICITUD.RUT
  AND SOLICITUD.Microchip = ANIMAL.Microchip
  AND ANIMAL.id_domicilio = DOMICILIO_ANIMAL.id_domicilio
  AND DOMICILIO_ANIMAL.Region = 'RM';`,
  },
  {
    id: 'M4', base: 'mascotas', tipo: 'select', pts: 3, nivel: '2 tablas',
    titulo: 'Animales felinos',
    enunciado: 'Liste los nombres de los animales de especie Felino.',
    pistas: ['La especie está en RAZA, no en ANIMAL.', 'Une ANIMAL.Raza = RAZA.Raza.'],
    solucion: `SELECT ANIMAL.Nombre_Animal
FROM ANIMAL, RAZA
WHERE ANIMAL.Raza = RAZA.Raza
  AND RAZA.Especie = 'Felino';`,
  },
  {
    id: 'M5', base: 'mascotas', tipo: 'select', pts: 3, nivel: '2 tablas',
    titulo: 'Usuarios con solicitudes aprobadas',
    enunciado: "Liste los nombres de los usuarios que tienen al menos una solicitud en estado 'aprobado'.",
    pistas: ['USUARIO y SOLICITUD, unidas por RUT.', 'DISTINCT por si alguien tiene dos solicitudes aprobadas.'],
    solucion: `SELECT DISTINCT USUARIO.Nombre
FROM USUARIO, SOLICITUD
WHERE USUARIO.RUT = SOLICITUD.RUT
  AND SOLICITUD.estado = 'aprobado';`,
  },
  {
    id: 'M6', base: 'mascotas', tipo: 'dml', pts: 2, nivel: 'UPDATE',
    titulo: 'Aprobar la solicitud 0105',
    enunciado: "El municipio aprobó la solicitud 0105. Cambie su estado a 'aprobado'.",
    revisar: ['SOLICITUD'],
    pistas: ['UPDATE ... SET estado = ... WHERE ...', "id_solicitud es texto: '0105'."],
    solucion: `UPDATE SOLICITUD
SET estado = 'aprobado'
WHERE id_solicitud = '0105';`,
  },
  {
    id: 'M7', base: 'mascotas', tipo: 'error', pts: 2, nivel: 'RESTRICT',
    titulo: 'Borrar a Isidora Salazar',
    enunciado: 'Intente borrar a la usuaria Isidora Salazar (RUT 7412988-9). Las FK de esta base usan la política por defecto (NO ACTION, es decir, RESTRICT). Ejecute el DELETE y observe qué pasa.',
    esperado: /FOREIGN KEY/i,
    pistas: ['DELETE FROM USUARIO WHERE RUT = ...', '¿Alguna fila de SOLICITUD apunta a ese RUT?'],
    solucion: `DELETE FROM USUARIO
WHERE RUT = '7412988-9';`,
    explicacion: 'Se rechaza porque la solicitud 0105 referencia ese RUT. Con RESTRICT no se puede borrar un padre que tiene hijos. Con CASCADE se habría borrado también la solicitud 0105, y con NULLIFY la solicitud habría quedado con RUT NULL. Es justo la P4 del certamen 2021.',
  },

  // ───────── Proyectos (Certamen 2018, III) ─────────
  {
    id: 'P1', base: 'proyectos', tipo: 'create', pts: 2, nivel: 'CREATE TABLE', certamen: '2018 III a',
    titulo: 'Crear la tabla Proyecto',
    enunciado: 'Cree la tabla Proyecto(Codigo_Proyecto, Cod_Plan, Nombre, Fecha_Inicio, Fecha_Fin, Presupuesto). La PK es Codigo_Proyecto y Cod_Plan es FK hacia Plan.',
    tabla: 'Proyecto',
    requisitos: {
      columnas: ['Codigo_Proyecto', 'Cod_Plan', 'Nombre', 'Fecha_Inicio', 'Fecha_Fin', 'Presupuesto'],
      pk: ['Codigo_Proyecto'],
      fk: [{ col: 'Cod_Plan', tabla: 'Plan' }],
      notnull: [],
    },
    pistas: ['Plan ya existe: solo creas Proyecto.', 'FOREIGN KEY (Cod_Plan) REFERENCES Plan(Cod_plan).'],
    solucion: `CREATE TABLE Proyecto (
  Codigo_Proyecto INTEGER PRIMARY KEY,
  Cod_Plan        TEXT,
  Nombre          TEXT,
  Fecha_Inicio    DATE,
  Fecha_Fin       DATE,
  Presupuesto     INTEGER,
  FOREIGN KEY (Cod_Plan) REFERENCES Plan(Cod_plan)
);`,
  },
  {
    id: 'P2', base: 'proyectos', tipo: 'select', pts: 5, nivel: '1 tabla', certamen: '2018 III b',
    titulo: 'Proyectos 2018 del plan PEUR',
    enunciado: "Liste el nombre de los proyectos que comenzaron en 2018 y que pertenecen al plan cuyo código es 'PEUR'.",
    pistas: ['Todo está en Proyecto: no hace falta unir con Plan (sería una tabla de más).', "Comenzaron en 2018: Fecha_Inicio BETWEEN '2018-01-01' AND '2018-12-31'."],
    solucion: `SELECT Nombre
FROM Proyecto
WHERE Cod_Plan = 'PEUR'
  AND Fecha_Inicio BETWEEN '2018-01-01' AND '2018-12-31';`,
  },
  {
    id: 'P3', base: 'proyectos', tipo: 'select', pts: 5, nivel: '3 tablas', certamen: '2018 III c',
    titulo: 'Investigadores del proyecto Neptuno',
    enunciado: "Liste el nombre del investigador asignado y la fecha de inicio del proyecto llamado 'Neptuno'.",
    pistas: ['La fecha de inicio del PROYECTO está en Proyecto, no en Asignado.', 'Camino: Proyecto → Asignado → Investigador. Escribe Proyecto.Fecha_Inicio y Proyecto.Nombre (Investigador también tiene Nombre).'],
    solucion: `SELECT Investigador.Nombre, Proyecto.Fecha_Inicio
FROM Proyecto, Asignado, Investigador
WHERE Proyecto.Codigo_Proyecto = Asignado.Codigo_Proyecto
  AND Asignado.RUT_Investigador = Investigador.RUT_Investigador
  AND Proyecto.Nombre = 'Neptuno';`,
  },
  {
    id: 'P4', base: 'proyectos', tipo: 'select', pts: 8, nivel: '4 tablas', certamen: '2018 III d',
    titulo: 'Planes con proyectos grandes fuera de Santiago',
    enunciado: 'Liste el nombre de los planes a los que pertenecen los proyectos con un presupuesto superior a $100.000 y cuyo investigador no es de Santiago.',
    pistas: ['Camino: Plan → Proyecto → Asignado → Investigador. Son 3 uniones.', "Superior a 100.000 es > 100000 (la pauta oficial se equivocó y puso <=). Distinto se escribe <>: Ciudad <> 'Santiago'."],
    solucion: `SELECT DISTINCT Plan.Nombre
FROM Plan, Proyecto, Asignado, Investigador
WHERE Plan.Cod_plan = Proyecto.Cod_Plan
  AND Proyecto.Codigo_Proyecto = Asignado.Codigo_Proyecto
  AND Asignado.RUT_Investigador = Investigador.RUT_Investigador
  AND Proyecto.Presupuesto > 100000
  AND Investigador.Ciudad <> 'Santiago';`,
  },
];
