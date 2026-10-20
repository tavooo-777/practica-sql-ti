# Práctica SQL · Certamen TI

Página para practicar SQL con ejercicios tipo certamen de Tecnologías de Información (UdeC).

**Úsala aquí:** https://tavooo-777.github.io/practica-sql-ti/

## Segunda página: SQL para el test (LAB3, LAB4, LAB5)

**Úsala aquí:** https://tavooo-777.github.io/practica-sql-ti/test/

- Resumen para entender comandos y estructuras: CREATE TABLE por dentro, restricciones, ON DELETE/ON UPDATE, ALTER/DROP/TRUNCATE, INSERT/UPDATE/DELETE, SELECT, agregaciones y GROUP BY, JOIN, subconsultas y vistas.
- 3 tests de alternativas (21 preguntas) con la explicación de cada respuesta.
- **Ejercicio integrador de 12 partes (Biblioteca):** creas las tablas desde cero con claves, CHECK, DEFAULT y FK; insertas datos; actualizas; agregas una columna; consultas con JOIN, GROUP BY y LIMIT; borras con CASCADE y RESTRICT; y terminas con una vista. "Probar" ensaya sin guardar y "Revisar" guarda la parte solo si queda bien.
- Práctica con los ejercicios de los laboratorios (7 de esports y 10 de minimarket) y un laboratorio libre sobre cada base.
- Acepta la forma PostgreSQL de los labs: traduce `SERIAL`, `TRUNCATE`, `CREATE OR REPLACE VIEW` y `REFERENCES esquema.tabla` a SQLite.

## Primera página: práctica tipo certamen

## Qué tiene

- 27 ejercicios sobre 4 bases de datos: Universidad (M2.3), Accidentes (certamen 2020), Mascotas (certamen 2021) y Proyectos (certamen 2018).
- SELECT de 1 a 4 tablas, INSERT, UPDATE, DELETE, CREATE TABLE y ejercicios de integridad referencial (RESTRICT).
- Revisión automática: tu SQL se ejecuta en SQLite dentro del navegador y el resultado se compara con el de la solución, sin importar el orden de filas o columnas.
- Avisos de los errores que descuentan en las pautas: uniones que faltan, `tabla.columna` al revés, `500.000` con punto, comas en vez de `AND`, tablas de más en el `FROM`, `=` con subconsultas.
- Pistas, solución de referencia y un modo certamen con 4 ejercicios al azar y 25 minutos.

Tu progreso se guarda solo en tu navegador. Atajos: `Ctrl/⌘ + Enter` ejecuta y `Ctrl/⌘ + Shift + Enter` revisa.

## Correrla en tu computador

```bash
python3 -m http.server 8765
```

y abre http://localhost:8765. Necesita internet al cargar, porque SQLite ([sql.js](https://sql.js.org)) se baja desde cdnjs.
